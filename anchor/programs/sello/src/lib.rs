use anchor_lang::prelude::*;

declare_id!("HhXvRpC6uDfCF6sHNWv3xD2yzyjpiEW17eeK13tFaycC");

pub const CONFIG_SEED: &[u8] = b"config";
pub const CONTENT_SELLO_SEED: &[u8] = b"sello";
pub const RECEIPT_SEED: &[u8] = b"receipt";
pub const VOICE_SEED: &[u8] = b"voice";

#[program]
pub mod sello {
    use super::*;

    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        fee_bps: u16,
        treasury: Pubkey,
    ) -> Result<()> {
        require!(fee_bps <= 1_000, SelloError::InvalidFee);

        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        config.treasury = treasury;
        config.fee_bps = fee_bps;
        config.is_active = true;
        config.bump = ctx.bumps.config;
        Ok(())
    }

    pub fn register_content_sello(
        ctx: Context<RegisterContentSello>,
        content_hash: [u8; 32],
        license_type: u8,
        allowed_uses: u8,
        attribution_required: bool,
        price_usdc_micros: u64,
    ) -> Result<()> {
        require!(allowed_uses != 0, SelloError::NoAllowedUses);

        let sello = &mut ctx.accounts.content_sello;
        sello.creator = ctx.accounts.creator.key();
        sello.content_hash = content_hash;
        sello.license_type = license_type;
        sello.allowed_uses = allowed_uses;
        sello.attribution_required = attribution_required;
        sello.price_usdc_micros = price_usdc_micros;
        sello.usage_count = 0;
        sello.revoked = false;
        sello.created_at = Clock::get()?.unix_timestamp;
        sello.bump = ctx.bumps.content_sello;
        Ok(())
    }

    pub fn record_usage_receipt(
        ctx: Context<RecordUsageReceipt>,
        usage_type: u8,
        amount_paid_micros: u64,
        timestamp: i64,
    ) -> Result<()> {
        require!(!ctx.accounts.content_sello.revoked, SelloError::ConsentRevoked);

        let receipt = &mut ctx.accounts.usage_receipt;
        receipt.content_sello = ctx.accounts.content_sello.key();
        receipt.payer = ctx.accounts.payer.key();
        receipt.usage_type = usage_type;
        receipt.amount_paid_micros = amount_paid_micros;
        receipt.timestamp = timestamp;
        receipt.bump = ctx.bumps.usage_receipt;

        let sello = &mut ctx.accounts.content_sello;
        sello.usage_count = sello
            .usage_count
            .checked_add(1)
            .ok_or(SelloError::UsageCountOverflow)?;
        Ok(())
    }

    pub fn grant_voice_consent(
        ctx: Context<GrantVoiceConsent>,
        voice_id_hash: [u8; 32],
        allowed_use: u8,
        price_usdc_micros: u64,
    ) -> Result<()> {
        let consent = &mut ctx.accounts.voice_consent;
        consent.creator = ctx.accounts.creator.key();
        consent.voice_id_hash = voice_id_hash;
        consent.allowed_use = allowed_use;
        consent.price_usdc_micros = price_usdc_micros;
        consent.revoked = false;
        consent.created_at = Clock::get()?.unix_timestamp;
        consent.bump = ctx.bumps.voice_consent;
        Ok(())
    }

    pub fn revoke_content_sello(ctx: Context<RevokeContentSello>) -> Result<()> {
        ctx.accounts.content_sello.revoked = true;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + ProtocolConfig::INIT_SPACE,
        seeds = [CONFIG_SEED, authority.key().as_ref()],
        bump
    )]
    pub config: Account<'info, ProtocolConfig>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(content_hash: [u8; 32])]
pub struct RegisterContentSello<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + ContentSello::INIT_SPACE,
        seeds = [CONTENT_SELLO_SEED, creator.key().as_ref(), content_hash.as_ref()],
        bump
    )]
    pub content_sello: Account<'info, ContentSello>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(_usage_type: u8, _amount_paid_micros: u64, timestamp: i64)]
pub struct RecordUsageReceipt<'info> {
    #[account(mut)]
    pub content_sello: Account<'info, ContentSello>,
    #[account(
        init,
        payer = payer,
        space = 8 + UsageReceipt::INIT_SPACE,
        seeds = [
            RECEIPT_SEED,
            content_sello.key().as_ref(),
            payer.key().as_ref(),
            timestamp.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub usage_receipt: Account<'info, UsageReceipt>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GrantVoiceConsent<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + VoiceConsent::INIT_SPACE,
        seeds = [VOICE_SEED, creator.key().as_ref()],
        bump
    )]
    pub voice_consent: Account<'info, VoiceConsent>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevokeContentSello<'info> {
    #[account(
        mut,
        has_one = creator,
        seeds = [CONTENT_SELLO_SEED, creator.key().as_ref(), content_sello.content_hash.as_ref()],
        bump = content_sello.bump
    )]
    pub content_sello: Account<'info, ContentSello>,
    pub creator: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct ProtocolConfig {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub fee_bps: u16,
    pub is_active: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct ContentSello {
    pub creator: Pubkey,
    pub content_hash: [u8; 32],
    pub license_type: u8,
    pub allowed_uses: u8,
    pub attribution_required: bool,
    pub price_usdc_micros: u64,
    pub usage_count: u64,
    pub revoked: bool,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct UsageReceipt {
    pub content_sello: Pubkey,
    pub payer: Pubkey,
    pub usage_type: u8,
    pub amount_paid_micros: u64,
    pub timestamp: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct VoiceConsent {
    pub creator: Pubkey,
    pub voice_id_hash: [u8; 32],
    pub allowed_use: u8,
    pub price_usdc_micros: u64,
    pub revoked: bool,
    pub created_at: i64,
    pub bump: u8,
}

#[error_code]
pub enum SelloError {
    #[msg("Protocol fee is too high for the MVP config.")]
    InvalidFee,
    #[msg("Content must allow at least one use.")]
    NoAllowedUses,
    #[msg("This consent record has been revoked.")]
    ConsentRevoked,
    #[msg("Usage counter overflowed.")]
    UsageCountOverflow,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn seed_constants_match_public_docs() {
        assert_eq!(CONFIG_SEED, b"config");
        assert_eq!(CONTENT_SELLO_SEED, b"sello");
        assert_eq!(RECEIPT_SEED, b"receipt");
        assert_eq!(VOICE_SEED, b"voice");
    }

    #[test]
    fn account_sizes_are_stable_for_codegen() {
        assert_eq!(ContentSello::INIT_SPACE, 93);
        assert_eq!(UsageReceipt::INIT_SPACE, 82);
        assert_eq!(VoiceConsent::INIT_SPACE, 83);
        assert_eq!(ProtocolConfig::INIT_SPACE, 68);
    }
}
