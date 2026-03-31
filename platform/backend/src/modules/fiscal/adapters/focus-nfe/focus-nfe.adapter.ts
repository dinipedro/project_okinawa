import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
 * PHASE 1 of fiscal strategy -- intermediary API.
 * NOOWE sends invoice data as JSON, Focus NFe handles everything:
 * builds XML, signs with restaurant certificate, transmits to SEFAZ,
 * handles contingency, and returns the result.
 *
 * Endpoints used:
 * - POST   /v2/nfce?ref={ref}       -> Emit NFC-e
 * - DELETE /v2/nfce/{ref}            -> Cancel NFC-e
 * - GET    /v2/nfce/{ref}            -> Consult NFC-e
 * - POST   /v2/nfce/inutilizar       -> Invalidate numbering
 *
 * Auth: Token in header "Authorization: Token token={api_token}"
 * Base URL prod: https://api.focusnfe.com.br
 * Base URL homolog: https://homologacao.focusnfe.com.br
 *
 * CURRENT STATUS: LOG PLACEHOLDERS -- real API calls to be wired
 * when Focus NFe sandbox credentials are available.
 */
@Injectable()
export class FocusNfeAdapter implements FiscalAdapter {
  readonly provider = 'focus_nfe' as const;
  private readonly logger = new Logger(FocusNfeAdapter.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Emit NFC-e via Focus NFe API.
   *
   * Maps EmitNfceParams to Focus NFe JSON format:
   * { natureza_operacao, tipo_documento, consumidor_final,
   *   presenca_comprador, items[], formas_pagamento[], ... }
   *
   * POST /v2/nfce?ref={order_id}
   * Header: Authorization: Token token={restaurant_api_token}
   */
  async emitNfce(params: EmitNfceParams): Promise<FiscalEmissionResult> {
    this.logger.log(
      `[PLACEHOLDER] Emitting NFC-e for order ${params.order_id} | ` +
        `CNPJ: ${params.cnpj} | Items: ${params.items.length} | ` +
        `Total: R$ ${params.total_amount} | Serie: ${params.serie} | Numero: ${params.numero}`,
    );

    // Build Focus NFe payload (logged for validation)
    const focusPayload = this.buildFocusNfePayload(params);
    this.logger.debug(
      `[PLACEHOLDER] Focus NFe payload built: ${JSON.stringify(focusPayload).substring(0, 500)}...`,
    );

    // Simulated successful response
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
      protocol: `PLACEHOLDER_${Date.now()}`,
      xml: `<!-- PLACEHOLDER XML for order ${params.order_id} -->`,
      qr_code_url: `https://homologacao.focusnfe.com.br/qrcode/${params.order_id}`,
      danfe_url: `https://homologacao.focusnfe.com.br/danfe/${params.order_id}`,
    };
  }

  /**
   * Cancel NFC-e via Focus NFe API.
   * DELETE /v2/nfce/{ref}
   * Body: { justificativa: reason } (minimum 15 characters)
   */
  async cancelNfce(
    accessKey: string,
    reason: string,
  ): Promise<FiscalCancelResult> {
    this.logger.log(
      `[PLACEHOLDER] Cancelling NFC-e | Access Key: ${accessKey} | Reason: ${reason}`,
    );

    return {
      success: true,
      protocol: `CANCEL_PLACEHOLDER_${Date.now()}`,
    };
  }

  /**
   * Consult NFC-e status via Focus NFe API.
   * GET /v2/nfce/{ref}
   */
  async consultNfce(accessKey: string): Promise<FiscalConsultResult> {
    this.logger.log(
      `[PLACEHOLDER] Consulting NFC-e | Access Key: ${accessKey}`,
    );

    return {
      status: 'authorized',
      access_key: accessKey,
      protocol: `CONSULT_PLACEHOLDER_${Date.now()}`,
    };
  }

  /**
   * Invalidate number range via Focus NFe API.
   * POST /v2/nfce/inutilizar
   */
  async invalidateRange(
    series: number,
    start: number,
    end: number,
    reason: string,
  ): Promise<void> {
    this.logger.log(
      `[PLACEHOLDER] Invalidating range | Series: ${series} | ` +
        `Start: ${start} | End: ${end} | Reason: ${reason}`,
    );
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  /**
   * Builds the Focus NFe JSON payload from EmitNfceParams.
   * See: https://focusnfe.com.br/doc/#nfc-e
   */
  private buildFocusNfePayload(params: EmitNfceParams): Record<string, any> {
    return {
      natureza_operacao: 'VENDA AO CONSUMIDOR',
      tipo_documento: 1, // 1 = saida
      consumidor_final: 1,
      presenca_comprador: 1, // 1 = operacao presencial
      finalidade_emissao: 1, // 1 = NFC-e normal

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

      // CSC
      informacoes_adicionais_contribuinte: `Pedido NOOWE: ${params.order_id}`,
    };
  }
}
