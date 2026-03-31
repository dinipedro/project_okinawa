import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FiscalConfig } from '../entities/fiscal-config.entity';
import { UpsertFiscalConfigDto } from '../dto/fiscal-config.dto';
import { FISCAL_MESSAGES } from '../i18n/fiscal.i18n';

/**
 * FiscalOnboardingService -- handles fiscal onboarding for restaurants.
 *
 * When a restaurant activates fiscal emission:
 *
 * For Focus NFe (Phase 1):
 * 1. Restaurant fills fiscal data (CNPJ, IE, regime, CSC)
 * 2. NOOWE creates FiscalConfig in the database
 * 3. NOOWE uploads A1 certificate (.pfx) to Focus NFe
 *    POST https://api.focusnfe.com.br/v2/uploads/certificate
 *    (file .pfx + certificate password)
 * 4. Focus NFe stores the certificate and returns confirmation
 * 5. FiscalConfig.certificate_uploaded = true
 * 6. Ready to emit
 *
 * The A1 certificate is NOT stored on NOOWE servers in Phase 1 --
 * only on Focus NFe. This simplifies PCI/security compliance.
 */
@Injectable()
export class FiscalOnboardingService {
  private readonly logger = new Logger(FiscalOnboardingService.name);

  constructor(
    @InjectRepository(FiscalConfig)
    private readonly configRepo: Repository<FiscalConfig>,
  ) {}

  /**
   * Create or update fiscal configuration for a restaurant.
   */
  async upsertConfig(dto: UpsertFiscalConfigDto): Promise<FiscalConfig> {
    let config = await this.configRepo.findOne({
      where: { restaurant_id: dto.restaurantId },
    });

    if (config) {
      // Update existing
      config.cnpj = dto.cnpj;
      config.ie = dto.ie ?? config.ie;
      config.razao_social = dto.razaoSocial;
      config.nome_fantasia = dto.nomeFantasia ?? config.nome_fantasia;
      config.state_code = dto.stateCode;
      config.endereco = dto.endereco;
      config.regime_tributario = dto.regimeTributario;
      config.tax_defaults = dto.taxDefaults;
      config.csc_id = dto.cscId ?? config.csc_id;
      config.csc_token = dto.cscToken ?? config.csc_token;
      config.fiscal_provider = dto.fiscalProvider ?? config.fiscal_provider;
      config.focus_nfe_token = dto.focusNfeToken ?? config.focus_nfe_token;
      config.auto_emit = dto.autoEmit ?? config.auto_emit;

      this.logger.log(`Fiscal config updated for restaurant ${dto.restaurantId}`);
    } else {
      // Create new
      config = this.configRepo.create({
        restaurant_id: dto.restaurantId,
        cnpj: dto.cnpj,
        ie: dto.ie,
        razao_social: dto.razaoSocial,
        nome_fantasia: dto.nomeFantasia,
        state_code: dto.stateCode,
        endereco: dto.endereco,
        regime_tributario: dto.regimeTributario,
        tax_defaults: dto.taxDefaults,
        csc_id: dto.cscId,
        csc_token: dto.cscToken,
        fiscal_provider: dto.fiscalProvider || 'focus_nfe',
        focus_nfe_token: dto.focusNfeToken,
        auto_emit: dto.autoEmit ?? true,
        is_active: true,
        current_series: 1,
        next_number: 1,
      });

      this.logger.log(`Fiscal config created for restaurant ${dto.restaurantId}`);
    }

    return this.configRepo.save(config);
  }

  /**
   * Get fiscal configuration for a restaurant.
   */
  async getConfig(restaurantId: string): Promise<FiscalConfig> {
    const config = await this.configRepo.findOne({
      where: { restaurant_id: restaurantId },
    });
    if (!config) {
      throw new NotFoundException(FISCAL_MESSAGES.CONFIG_NOT_FOUND);
    }
    return config;
  }

  /**
   * Upload certificate placeholder.
   * In Phase 1, the certificate is sent to Focus NFe -- NOT stored locally.
   */
  async uploadCertificate(
    restaurantId: string,
    _certificateBuffer: Buffer,
    _password: string,
  ): Promise<{ success: boolean }> {
    const config = await this.configRepo.findOne({
      where: { restaurant_id: restaurantId },
    });
    if (!config) {
      throw new NotFoundException(FISCAL_MESSAGES.CONFIG_NOT_FOUND);
    }

    // [PLACEHOLDER] In production, this would:
    // POST to https://api.focusnfe.com.br/v2/uploads/certificate
    // with the .pfx file and password
    this.logger.log(
      `[PLACEHOLDER] Certificate upload for restaurant ${restaurantId} ` +
        `| Provider: ${config.fiscal_provider}`,
    );

    config.certificate_uploaded = true;
    await this.configRepo.save(config);

    return { success: true };
  }
}
