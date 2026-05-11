import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Sello } from "../target/types/sello";
import { expect } from "chai";
import {
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getMinimumBalanceForRentExemptMint,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";
import * as crypto from "crypto";

// allowed_uses bitmap constants (must match lib.rs)
const USE_SUMMARIZE = 1 << 0; // 1
const USE_QUOTE     = 1 << 1; // 2
const USE_VOICE     = 1 << 2; // 4
const USE_TRAIN     = 1 << 3; // 8

describe("sello", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Sello as Program<Sello>;

  const authority   = Keypair.generate();
  const author      = Keypair.generate();
  const voiceAuthor = Keypair.generate();
  const payer       = Keypair.generate();
  const treasury    = Keypair.generate();
  const usdcMintKeypair = Keypair.generate();

  let configPDA: PublicKey;
  let selloPDA: PublicKey;
  let voiceConsentPDA: PublicKey;

  let payerUsdcAta: PublicKey;
  let authorUsdcAta: PublicKey;
  let treasuryUsdcAta: PublicKey;

  const contentHash    = crypto.randomBytes(32);
  const termsCid       = crypto.randomBytes(46); // IPFS CIDv1 — 46 bytes
  const termsHash      = crypto.randomBytes(32);
  const voiceIdHash    = crypto.randomBytes(32);

  const USDC_DECIMALS = 6;
  const feeBps        = 500; // 5%
  // bitmap: SUMMARIZE | QUOTE | VOICE — training not permitted
  const allowedUses   = USE_SUMMARIZE | USE_QUOTE | USE_VOICE;
  const basePrice     = new BN(500_000); // 0.5 USDC
  const pricePerMinute = new BN(100_000); // 0.1 USDC

  async function createTestUsdcMint(): Promise<void> {
    const lamports = await getMinimumBalanceForRentExemptMint(provider.connection);

    const tx = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: authority.publicKey,
        newAccountPubkey: usdcMintKeypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(
        usdcMintKeypair.publicKey,
        USDC_DECIMALS,
        authority.publicKey,
        null,
        TOKEN_PROGRAM_ID
      )
    );

    await provider.sendAndConfirm(tx, [authority, usdcMintKeypair]);
  }

  async function createAtaAndMint(owner: Keypair, amount: number): Promise<PublicKey> {
    const ata = await getAssociatedTokenAddress(
      usdcMintKeypair.publicKey,
      owner.publicKey
    );

    const tx = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        authority.publicKey,
        ata,
        owner.publicKey,
        usdcMintKeypair.publicKey
      ),
      createMintToInstruction(
        usdcMintKeypair.publicKey,
        ata,
        authority.publicKey,
        amount,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    await provider.sendAndConfirm(tx, [authority]);
    return ata;
  }

  before(async () => {
    for (const kp of [authority, author, voiceAuthor, payer, treasury]) {
      await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(kp.publicKey, 100 * LAMPORTS_PER_SOL)
      );
    }

    await createTestUsdcMint();

    payerUsdcAta    = await createAtaAndMint(payer, 100_000_000); // 100 USDC
    authorUsdcAta   = await createAtaAndMint(author, 0);
    treasuryUsdcAta = await createAtaAndMint(treasury, 0);

    [configPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("config"), authority.publicKey.toBuffer()],
      program.programId
    );

    [selloPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("sello"), author.publicKey.toBuffer(), contentHash],
      program.programId
    );

    [voiceConsentPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("voice"), voiceAuthor.publicKey.toBuffer(), voiceIdHash],
      program.programId
    );
  });

  it("Initialize Config with USDC mint", async () => {
    await program.methods
      .initializeConfig(feeBps, treasury.publicKey, usdcMintKeypair.publicKey)
      .accounts({
        config: configPDA,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    const config = await program.account.config.fetch(configPDA);
    expect(config.isActive).to.be.true;
    expect(config.isPaused).to.be.false;
    expect(config.feeBps).to.equal(feeBps);
    expect(config.treasury.toBase58()).to.equal(treasury.publicKey.toBase58());
    expect(config.usdcMint.toBase58()).to.equal(usdcMintKeypair.publicKey.toBase58());
    expect(config.version).to.equal(1);
  });

  it("Register Sello with IPFS terms_cid", async () => {
    await program.methods
      .registerSello(
        Array.from(contentHash),
        Array.from(termsCid),
        Array.from(termsHash),
        allowedUses,
        basePrice
      )
      .accounts({
        sello: selloPDA,
        author: author.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([author])
      .rpc();

    const sello = await program.account.contentSello.fetch(selloPDA);
    expect(sello.author.toBase58()).to.equal(author.publicKey.toBase58());
    expect(Buffer.from(sello.contentHash)).to.deep.equal(contentHash);
    expect(Buffer.from(sello.termsCid)).to.deep.equal(termsCid);
    expect(Buffer.from(sello.termsHash)).to.deep.equal(termsHash);
    expect(sello.allowedUses).to.equal(allowedUses);
    expect(Number(sello.basePrice.toString())).to.equal(Number(basePrice.toString()));
    expect(Number(sello.usageCount.toString())).to.equal(0);
    expect(sello.revoked).to.be.false;
    expect(Number(sello.createdAt.toString())).to.be.greaterThan(0);
  });

  it("Register Sello with base_price=0 (sello-free)", async () => {
    const freeHash = crypto.randomBytes(32);
    const [freePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("sello"), author.publicKey.toBuffer(), freeHash],
      program.programId
    );

    await program.methods
      .registerSello(
        Array.from(freeHash),
        Array.from(termsCid),
        Array.from(termsHash),
        USE_SUMMARIZE | USE_QUOTE,
        new BN(0) // sello-free
      )
      .accounts({
        sello: freePDA,
        author: author.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([author])
      .rpc();

    const sello = await program.account.contentSello.fetch(freePDA);
    expect(Number(sello.basePrice.toString())).to.equal(0);
  });

  it("Register Voice Consent", async () => {
    await program.methods
      .registerVoiceConsent(Array.from(voiceIdHash), USE_VOICE, pricePerMinute)
      .accounts({
        voiceConsent: voiceConsentPDA,
        author: voiceAuthor.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([voiceAuthor])
      .rpc();

    const consent = await program.account.voiceConsent.fetch(voiceConsentPDA);
    expect(consent.author.toBase58()).to.equal(voiceAuthor.publicKey.toBase58());
    expect(Buffer.from(consent.voiceIdHash)).to.deep.equal(voiceIdHash);
    expect(consent.allowedUses).to.equal(USE_VOICE);
    expect(Number(consent.pricePerMinute.toString())).to.equal(Number(pricePerMinute.toString()));
    expect(consent.revoked).to.be.false;
  });

  it("Record Usage (usage_type=2 VOICE) — log-only, x402 handles payment off-chain", async () => {
    // nonce: random u64 to avoid PDA collision under concurrent calls
    const nonce = new BN(Date.now());

    const [receiptPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("receipt"),
        selloPDA.toBuffer(),
        payer.publicKey.toBuffer(),
        nonce.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    await program.methods
      .recordUsage(2, basePrice, nonce) // 2 = USE_VOICE
      .accounts({
        config: configPDA,
        sello: selloPDA,
        receipt: receiptPDA,
        payer: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([payer])
      .rpc();

    const receipt = await program.account.usageReceipt.fetch(receiptPDA);
    expect(receipt.sello.toBase58()).to.equal(selloPDA.toBase58());
    expect(receipt.payer.toBase58()).to.equal(payer.publicKey.toBase58());
    expect(receipt.usageType).to.equal(2);
    expect(Number(receipt.amountPaid.toString())).to.equal(Number(basePrice.toString()));

    const selloAfter = await program.account.contentSello.fetch(selloPDA);
    expect(Number(selloAfter.usageCount.toString())).to.equal(1);
  });

  it("Cannot record usage with disallowed type (usage_type=3 TRAIN not in bitmap)", async () => {
    const nonce = new BN(Date.now() + 1);
    const [receiptPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("receipt"),
        selloPDA.toBuffer(),
        payer.publicKey.toBuffer(),
        nonce.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    try {
      await program.methods
        .recordUsage(3, basePrice, nonce) // 3 = USE_TRAIN — not in allowedUses bitmap
        .accounts({
          config: configPDA,
          sello: selloPDA,
          receipt: receiptPDA,
          payer: payer.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([payer])
        .rpc();
      expect.fail("Should have failed");
    } catch (error) {
      expect(error.message).to.include("UsageTypeNotAllowed");
    }
  });

  it("Revoke Content Sello", async () => {
    const revokeVoiceHash = crypto.randomBytes(32);
    const [revokeVoicePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("voice"), author.publicKey.toBuffer(), revokeVoiceHash],
      program.programId
    );

    await program.methods
      .registerVoiceConsent(Array.from(revokeVoiceHash), USE_VOICE, pricePerMinute)
      .accounts({
        voiceConsent: revokeVoicePDA,
        author: author.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([author])
      .rpc();

    await program.methods
      .revokeConsent(1)
      .accounts({
        sello: selloPDA,
        voiceConsent: revokeVoicePDA,
        author: author.publicKey,
      })
      .signers([author])
      .rpc();

    const sello = await program.account.contentSello.fetch(selloPDA);
    expect(sello.revoked).to.be.true;
  });

  it("Revoke Voice Consent", async () => {
    const revokeSelloHash = crypto.randomBytes(32);
    const [revokeSelloPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("sello"), voiceAuthor.publicKey.toBuffer(), revokeSelloHash],
      program.programId
    );

    await program.methods
      .registerSello(
        Array.from(revokeSelloHash),
        Array.from(termsCid),
        Array.from(termsHash),
        USE_SUMMARIZE | USE_VOICE,
        basePrice
      )
      .accounts({
        sello: revokeSelloPDA,
        author: voiceAuthor.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([voiceAuthor])
      .rpc();

    await program.methods
      .revokeConsent(2)
      .accounts({
        sello: revokeSelloPDA,
        voiceConsent: voiceConsentPDA,
        author: voiceAuthor.publicKey,
      })
      .signers([voiceAuthor])
      .rpc();

    const consent = await program.account.voiceConsent.fetch(voiceConsentPDA);
    expect(consent.revoked).to.be.true;
  });

  it("Cannot record usage on revoked sello", async () => {
    const nonce = new BN(Date.now() + 2);
    const [receiptPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("receipt"),
        selloPDA.toBuffer(),
        payer.publicKey.toBuffer(),
        nonce.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    try {
      await program.methods
        .recordUsage(2, basePrice, nonce)
        .accounts({
          config: configPDA,
          sello: selloPDA,
          receipt: receiptPDA,
          payer: payer.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([payer])
        .rpc();
      expect.fail("Should have failed");
    } catch (error) {
      expect(error.message).to.include("ConsentRevoked");
    }
  });
});
