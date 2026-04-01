import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  FiscalAdapter,
  EmitNfceParams,
  FiscalEmissionResult,
  FiscalCancelResult,
  FiscalConsultResult,
} from '../../interfaces/fiscal-adapter.interface';

/**
 * Adapter for Focus NFe API (https://focusnfe.com.br/doc/)
 *
 * PHASE 1 of fiscal strategy — intermediary API.
 * NOOWE sends invoice data as JSON, Focus NFe handles:
 * XML build, certificate signing, SEFAZ transmission, contingency.
 *
 * Endpoints:
 * - POST   /v2/nfce?ref={ref}       → Emit NFC-e
 * - DELETE /v2/nfce/{ref}            → Cancel NFC-e
 * - GET    /v2/nfce/{ref}            → Consult NFC-e
 * - POST   /v2/nfce/inutiliza       → Invalidate numbering range
 *
 * Auth: "Authorization: Token token={api_token}" header
 */
@Injectable()
export class FocusNfeAdapter implements FiscalAdapter {
  readonly provider = 'focus_nfe' as const;
  private readonly logger = new Logger(FocusNfeAdapter.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Create axios instance with token auth for a specific restaurant.
   * Token comes from FiscalConfig.focus_nfe_token per restaurant.
   */
  private createClient(token: string): AxiosInstance {
    const environment = this.configService.get<string>('ASAAS_ENVIRONMENT', 'sandbox');
    const baseURL =
      environment === 'production'
        ? 'https://api.focusnfe.com.br'
        : 'https://homologacao.focusnfe.com.br';

    return axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        Authorization: `Token token=${token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Emit NFC-e via Focus NFe API.
   * POST /v2/nfce?ref={idempotency_key}
   */
  async emitNfce(params: EmitNfceParams): Promise<FiscalEmissionResult> {
    const token = (params as any).focus_nfe_token;

    if (!token) {
      this.logger.warn(
        `No Focus NFe token for order ${params.order_id} — returning simulated response`,
      );
      return this.simulatedEmission(params);
    }

    const client = this.createClient(token);
    const payload = this.buildFocusNfePayload(params);
    const ref = params.idempotency_key || params.order_id;

    try {
      this.logger.log(
        `Emitting NFC-e: order=${params.order_id}, CNPJ=${params.cnpj}, ` +
          `items=${params.items.length}, total=R$${params.total_amount}`,
      );

      const response = await client.post(`/v2/nfce?ref=${ref}`, payload);
      const data = response.data;

      if (data.status === 'autorizado' || data.status === 'authorized') {
        this.logger.log(
          `NFC-e authorized: order=${params.order_id}, ` +
            `access_key=${data.chave_nfe || data.access_key}`,
        );

        return {
          success: true,
          access_key: data.chave_nfe || data.access_key || '',
          number: params.numero,
          series: params.serie,
          protocol: data.numero_protocolo || data.protocol || '',
          xml: data.xml || '',
          qr_code_url: data.qrcode_url || data.qr_code_url || '',
          danfe_url: data.danfe_url || data.url_danfe || '',
        };
      }

      if (data.status === 'processando_autorizacao' || data.status === 'processing') {
        this.logger.log(
          `NFC-e processing: order=${params.order_id} — webhook will confirm`,
        );

        return {
          success: true,
          access_key: '',
          number: params.numero,
          series: params.serie,
          protocol: '',
          status: 'pending',
        };
      }

      // Error from Focus NFe
      this.logger.error(
        `NFC-e emission error: order=${params.order_id}, ` +
          `status=${data.status}, message=${data.mensagem_sefaz || data.erros || JSON.stringify(data)}`,
      );

      return {
        success: false,
        error_code: data.status_sefaz || data.status || 'UNKNOWN',
        error_message: data.mensagem_sefaz || data.erros?.[0]?.mensagem || 'Emission failed',
        access_key: '',
        number: params.numero,
        series: params.serie,
      };
    } catch (err) {
      const error = err as AxiosError;
      const errorData = error.response?.data as any;

      this.logger.error(
        `Focus NFe API error: order=${params.order_id}, ` +
          `status=${error.response?.status}, ` +
          `message=${errorData?.mensagem || errorData?.erros?.[0]?.mensagem || error.message}`,
      );

      return {
        success: false,
        error_code: String(error.response?.status || 'NETWORK_ERROR'),
        error_message:
          errorData?.mensagem ||
          errorData?.erros?.[0]?.mensagem ||
          error.message ||
          'Focus NFe API unreachable',
        access_key: '',
        number: params.numero,
        series: params.serie,
      };
    }
  }

  /**
   * Cancel NFC-e via Focus NFe API.
   * DELETE /v2/nfce/{ref}
   */
  async cancelNfce(
    accessKey: string,
    reason: string,
    token?: string,
  ): Promise<FiscalCancelResult> {
    if (!token) {
      this.logger.warn(`No token for cancellation of ${accessKey} — simulated`);
      return { success: true, protocol: `SIM_CANCEL_${Date.now()}` };
    }

    const client = this.createClient(token);

    try {
      this.logger.log(`Cancelling NFC-e: access_key=${accessKey}`);

      const response = await client.delete(`/v2/nfce/${accessKey}`, {
        data: { justificativa: reason },
      });

      const data = response.data;

      return {
        success: data.status === 'cancelado' || data.status === 'cancelled',
        protocol: data.numero_protocolo || data.protocol || '',
      };
    } catch (err) {
      const error = err as AxiosError;
      const errorData = error.response?.data as any;

      this.logger.error(`Cancel failed: ${errorData?.mensagem || error.message}`);

      return {
        success: false,
        error_message: errorData?.mensagem || error.message,
      };
    }
  }

  /**
   * Consult NFC-e status via Focus NFe API.
   * GET /v2/nfce/{ref}
   */
  async consultNfce(accessKey: string, token?: string): Promise<FiscalConsultResult> {
    if (!token) {
      return { status: 'authorized', access_key: accessKey, protocol: '' };
    }

    const client = this.createClient(token);

    try {
      const response = await client.get(`/v2/nfce/${accessKey}`);
      const data = response.data;

      const statusMap: Record<string, string> = {
        autorizado: 'authorized',
        cancelado: 'cancelled',
        erro_autorizacao: 'denied',
        processando_autorizacao: 'pending',
      };

      return {
        status: statusMap[data.status] || data.status,
        access_key: data.chave_nfe || accessKey,
        protocol: data.numero_protocolo || '',
      };
    } catch (err) {
      const error = err as AxiosError;
      this.logger.error(`Consult failed: ${error.message}`);
      return { status: 'error', access_key: accessKey };
    }
  }

  /**
   * Invalidate number range via Focus NFe API.
   * POST /v2/nfce/inutiliza
   */
  async invalidateRange(
    series: number,
    start: number,
    end: number,
    reason: string,
    token?: string,
  ): Promise<void> {
    if (!token) {
      this.logger.warn(`No token for range invalidation — simulated`);
      return;
    }

    const client = this.createClient(token);

    try {
      await client.post('/v2/nfce/inutiliza', {
        serie: series,
        numero_inicial: start,
        numero_final: end,
        justificativa: reason,
      });
      this.logger.log(`Range invalidated: series=${series}, ${start}-${end}`);
    } catch (err) {
      const error = err as AxiosError;
      this.logger.error(`Range invalidation failed: ${error.message}`);
      throw error;
    }
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  /**
   * Simulated response when no token is configured (dev/testing).
   */
  private simulatedEmission(params: EmitNfceParams): FiscalEmissionResult {
    this.logger.warn(
      `[SIMULATED] NFC-e for order ${params.order_id} — no Focus NFe token configured`,
    );

    const simulatedAccessKey =
      params.cnpj.padEnd(14, '0') +
      '65' +
      String(params.serie).padStart(3, '0') +
      String(params.numero).padStart(9, '0') +
      '1' +
      '00000001' +
      '0';

    return {
      success: true,
      access_key: simulatedAccessKey.padEnd(44, '0'),
      number: params.numero,
      series: params.serie,
      protocol: `SIMULATED_${Date.now()}`,
      xml: `<!-- Simulated XML for order ${params.order_id} -->`,
      qr_code_url: `https://homologacao.focusnfe.com.br/qrcode/${params.order_id}`,
      danfe_url: `https://homologacao.focusnfe.com.br/danfe/${params.order_id}`,
    };
  }

  /**
   * Builds the Focus NFe JSON payload from EmitNfceParams.
   * See: https://focusnfe.com.br/doc/#nfc-e
   */
  private buildFocusNfePayload(params: EmitNfceParams): Record<string, any> {
    return {
      natureza_operacao: 'VENDA AO CONSUMIDOR',
      tipo_documento: 1,
      consumidor_final: 1,
      presenca_comprador: 1,
      finalidade_emissao: 1,

      // Emitter data
      cnpj_emitente: params.cnpj,
      inscricao_estadual_emitente: params.ie,
      nome_emitente: params.razao_social,
      nome_fantasia_emitente: params.nome_fantasia,
      logradouro_emitente: params.endereco.logradouro,
      numero_emitente: params.endereco.numero,
      bairro_emitente: params.endereco.bairro,
      municipio_emitente: params.endereco.municipio,
      uf_emitente: params.endereco.uf,
      cep_emitente: params.endereco.cep,
      regime_tributario_emitente:
        params.regime_tributario === 'simples_nacional' ? 1 : 3,

      // Numbering
      serie: params.serie,
      numero: params.numero,

      // Consumer (optional)
      ...(params.consumer_cpf && { cpf: params.consumer_cpf }),
      ...(params.consumer_name && { nome: params.consumer_name }),

      // Items
      items: params.items.map((item, index) => ({
        numero_item: index + 1,
        descricao: item.description,
        ncm: item.ncm,
        cfop: item.cfop,
        quantidade: item.quantity,
        valor_unitario: item.unit_price,
        valor_bruto: item.total_price,
        unidade_comercial: item.unit,
        icms_origem: item.icms.origem,
        ...(item.icms.csosn && { icms_situacao_tributaria: item.icms.csosn }),
        ...(item.icms.cst && { icms_situacao_tributaria: item.icms.cst }),
        ...(item.icms.aliquota && { icms_aliquota: item.icms.aliquota }),
        ...(item.icms.valor && { icms_valor: item.icms.valor }),
        pis_situacao_tributaria: item.pis.cst,
        ...(item.pis.aliquota && { pis_aliquota: item.pis.aliquota }),
        cofins_situacao_tributaria: item.cofins.cst,
        ...(item.cofins.aliquota && { cofins_aliquota: item.cofins.aliquota }),
      })),

      // Payment methods
      formas_pagamento: params.payments.map((p) => ({
        forma_pagamento: p.method,
        valor_pagamento: p.amount,
      })),

      // Totals
      valor_produtos: params.total_amount,
      valor_total: params.total_amount,

      // Additional info
      informacoes_adicionais_contribuinte: `Pedido NOOWE: ${params.order_id}`,
    };
  }
}
