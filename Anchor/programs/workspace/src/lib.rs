use anchor_lang::prelude::*;

declare_id!("HhXvRpC6uDfCF6sHNWv3xD2yzyjpiEW17eeK13tFaycC");

// allowed_uses bitmap for ContentSello and VoiceConsent
pub const USE_SUMMARIZE: u8 = 1 << 0;
pub const USE_QUOTE: u8     = 1 << 1;
pub const USE_VOICE: u8     = 1 << 2;
pub const USE_TRAIN: u8     = 1 << 3;

#[program]
pub mod sello {
    use super::*;

    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        fee_bps: u16,
        treasury: Pubkey,
        usdc_mint: Pubkey,
    ) -> Result<()> {
        require!(fee_bps <= 10000, SelloError::InvalidParameter);
        let config = &mut ctx.accounts.config;
        config.bump = ctx.bumps.config;
        config.authority = ctx.accounts.authority.key();
        config.is_active = true;
        config.is_paused = false;
        config.fee_bps = fee_bps;
        config.treasury = treasury;
        config.usdc_mint = usdc_mint;
        config.version = 1;
        Ok(())
    }

    pub fn register_sello(
        ctx: Context<RegisterSello>,
        content_hash: [u8; 32],
        terms_cid: [u8; 46],
        terms_hash: [u8; 32],
        allowed_uses: u8,
        base_price: u64,
    ) -> Result<()> {
        require!(allowed_uses > 0, SelloError::InvalidParameter);

        let sello = &mut ctx.accounts.sello;
        sello.author = ctx.accounts.author.key();
        sello.content_hash = content_hash;
        sello.terms_cid = terms_cid;
        sello.terms_hash = terms_hash;
        sello.allowed_uses = allowed_uses;
        sello.base_price = base_price;
        sello.usage_count = 0;
        sello.created_at = Clock::get()?.unix_timestamp;
        sello.revoked = false;
        sello.bump = ctx.bumps.sello;
        Ok(())
    }

    pub fn register_voice_consent(
        ctx: Context<RegisterVoiceConsent>,
        voice_id_hash: [u8; 32],
        allowed_uses: u8,
        price_per_minute: u64,
    ) -> Result<()> {
        require!(price_per_minute > 0, SelloError::InvalidAmount);
        require!(allowed_uses > 0, SelloError::InvalidParameter);

        let consent = &mut ctx.accounts.voice_consent;
        consent.author = ctx.accounts.author.key();
        consent.voice_id_hash = voice_id_hash;
        consent.allowed_uses = allowed_uses;
        consent.price_per_minute = price_per_minute;
        consent.revoked = false;
        consent.bump = ctx.bumps.voice_consent;
        Ok(())
    }

    // nonce: random u64 from caller — prevents receipt PDA collision under concurrent calls
    // Payment is handled off-chain by x402 middleware. This instruction is log-only:
    // it records the usage event on-chain after x402 confirms payment.
    // Server calls this fire-and-forget; no payer signature needed for token transfer.
    pub fn record_usage(
        ctx: Context<RecordUsage>,
        usage_type: u8,
        amount_paid: u64,
        _nonce: u64,
    ) -> Result<()> {
        let config = &ctx.accounts.config;
        require!(config.is_active && !config.is_paused, SelloError::ConfigInactive);

        let sello = &ctx.accounts.sello;
        require!(!sello.revoked, SelloError::ConsentRevoked);
        require!(amount_paid >= sello.base_price, SelloError::InsufficientPayment);

        // bitmap check: usage_type must be enabled in allowed_uses
        require!(usage_type <= 3, SelloError::InvalidParameter);
        let use_bit = 1u8 << usage_type;
        require!(sello.allowed_uses & use_bit != 0, SelloError::UsageTypeNotAllowed);

        let sello = &mut ctx.accounts.sello;
        sello.usage_count = sello.usage_count
            .checked_add(1)
            .ok_or(SelloError::MathOverflow)?;

        let receipt = &mut ctx.accounts.receipt;
        receipt.sello = sello.key();
        receipt.payer = ctx.accounts.payer.key();
        receipt.usage_type = usage_type;
        receipt.amount_paid = amount_paid;
        receipt.timestamp = Clock::get()?.unix_timestamp;
        receipt.bump = ctx.bumps.receipt;

        Ok(())
    }

    pub fn revoke_consent(ctx: Context<RevokeConsent>, target: u8) -> Result<()> {
        require!(target == 1 || target == 2, SelloError::InvalidParameter);

        if target == 1 {
            let sello = &mut ctx.accounts.sello;
            require!(sello.author == ctx.accounts.author.key(), SelloError::Unauthorized);
            require!(!sello.revoked, SelloError::AlreadyRevoked);
            sello.revoked = true;
        }

        if target == 2 {
            let voice = &mut ctx.accounts.voice_consent;
            require!(voice.author == ctx.accounts.author.key(), SelloError::Unauthorized);
            require!(!voice.revoked, SelloError::AlreadyRevoked);
            voice.revoked = true;
        }

        Ok(())
    }
}

// ── Context Structs ──

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(
        init,
        seeds = [b"config", authority.key().as_ref()],
        bump,
        payer = authority,
        space = 8 + Config::LEN
    )]
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(content_hash: [u8; 32])]
pub struct RegisterSello<'info> {
    #[account(
        init,
        seeds = [b"sello", author.key().as_ref(), content_hash.as_ref()],
        bump,
        payer = author,
        space = 8 + ContentSello::LEN
    )]
    pub sello: Account<'info, ContentSello>,
    #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(voice_id_hash: [u8; 32])]
pub struct RegisterVoiceConsent<'info> {
    #[account(
        init,
        seeds = [b"voice", author.key().as_ref(), voice_id_hash.as_ref()],
        bump,
        payer = author,
        space = 8 + VoiceConsent::LEN
    )]
    pub voice_consent: Account<'info, VoiceConsent>,
    #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(usage_type: u8, amount_paid: u64, nonce: u64)]
pub struct RecordUsage<'info> {
    #[account(
        seeds = [b"config", config.authority.as_ref()],
        bump = config.bump,
        constraint = config.is_active && !config.is_paused @ SelloError::ConfigInactive,
    )]
    pub config: Box<Account<'info, Config>>,
    #[account(
        mut,
        seeds = [b"sello", sello.author.as_ref(), sello.content_hash.as_ref()],
        bump = sello.bump,
        constraint = !sello.revoked @ SelloError::ConsentRevoked,
    )]
    pub sello: Box<Account<'info, ContentSello>>,
    #[account(
        init,
        seeds = [
            b"receipt",
            sello.key().as_ref(),
            payer.key().as_ref(),
            &nonce.to_le_bytes(),
        ],
        bump,
        payer = payer,
        space = 8 + UsageReceipt::LEN
    )]
    pub receipt: Account<'info, UsageReceipt>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevokeConsent<'info> {
    #[account(
        mut,
        seeds = [b"sello", sello.author.as_ref(), sello.content_hash.as_ref()],
        bump = sello.bump,
    )]
    pub sello: Account<'info, ContentSello>,
    #[account(
        mut,
        seeds = [b"voice", voice_consent.author.as_ref(), voice_consent.voice_id_hash.as_ref()],
        bump = voice_consent.bump,
    )]
    pub voice_consent: Account<'info, VoiceConsent>,
    #[account(mut)]
    pub author: Signer<'info>,
}

// ── Account Data ──

#[account]
pub struct Config {
    pub bump: u8,
    pub authority: Pubkey,
    pub is_active: bool,
    pub is_paused: bool,
    pub fee_bps: u16,
    pub treasury: Pubkey,
    pub usdc_mint: Pubkey,
    pub version: u8,
}

impl Config {
    pub const LEN: usize = 1 + 32 + 1 + 1 + 2 + 32 + 32 + 1; // 102
}

#[account]
pub struct ContentSello {
    pub author: Pubkey,            // 32
    pub content_hash: [u8; 32],   // 32
    pub terms_cid: [u8; 46],      // IPFS CIDv1 via QuickNode — 46
    pub terms_hash: [u8; 32],     // 32
    pub allowed_uses: u8,         // bitmap: USE_SUMMARIZE|USE_QUOTE|USE_VOICE|USE_TRAIN — 1
    pub base_price: u64,          // USDC base units (6 decimals); 0 = sello-free — 8
    pub usage_count: u64,         // 8
    pub created_at: i64,          // 8
    pub revoked: bool,            // 1
    pub bump: u8,                 // 1
}

impl ContentSello {
    pub const LEN: usize = 32 + 32 + 46 + 32 + 1 + 8 + 8 + 8 + 1 + 1; // 169
}

#[account]
pub struct VoiceConsent {
    pub author: Pubkey,
    pub voice_id_hash: [u8; 32],
    pub allowed_uses: u8,
    pub price_per_minute: u64,
    pub revoked: bool,
    pub bump: u8,
}

impl VoiceConsent {
    pub const LEN: usize = 32 + 32 + 1 + 8 + 1 + 1; // 75
}

#[account]
pub struct UsageReceipt {
    pub sello: Pubkey,
    pub payer: Pubkey,
    pub usage_type: u8,
    pub amount_paid: u64,
    pub timestamp: i64,
    pub bump: u8,
}

impl UsageReceipt {
    pub const LEN: usize = 32 + 32 + 1 + 8 + 8 + 1; // 82
}

// ── Errors ──

#[error_code]
pub enum SelloError {
    #[msg("Math overflow occurred")]
    MathOverflow,
    #[msg("Insufficient payment")]
    InsufficientPayment,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Config is inactive or paused")]
    ConfigInactive,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Invalid parameter")]
    InvalidParameter,
    #[msg("Consent has been revoked")]
    ConsentRevoked,
    #[msg("Already revoked")]
    AlreadyRevoked,
    #[msg("Invalid mint")]
    InvalidMint,
    #[msg("Usage type not permitted by license")]
    UsageTypeNotAllowed,
}
