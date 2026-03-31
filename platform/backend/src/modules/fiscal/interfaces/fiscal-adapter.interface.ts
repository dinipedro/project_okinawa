/**
 * Fiscal Adapter Interface
 *
 * Interface that every fiscal adapter must implement.
 * Focus NFe (Phase 1) and SEFAZ Direct (Phase 2) use the same interface.
 * The FiscalEmissionService does not know which adapter is being used.
 *
 * Same adapter pattern as Payment Gateway (Asaas/Stripe) and KDS Brain (iFood/Rappi/UberEats).
 */

// ─── Core Interface ──────────────────────────────────────────────────────────

export interface FiscalAdapter {
  readonly provider: 'focus_nfe' | 'sefaz_direct';

  /** Emit NFC-e */
  emitNfce(params: EmitNfceParams): Promise<FiscalEmissionResult>;

  /** Cancel NFC-e (up to 24h after emission) */
  cancelNfce(accessKey: string, reason: string): Promise<FiscalCancelResult>;

  /** Consult status of an NFC-e */
  consultNfce(accessKey: string): Promise<FiscalConsultResult>;

  /** Invalidate number range (when necessary) */
  invalidateRange(
    series: number,
    startNumber: number,
    endNumber: number,
    reason: string,
  ): Promise<void>;
}

// ─── Emission Params ─────────────────────────────────────────────────────────

export interface EmitNfceParams {
  // Emitter (restaurant)
  restaurant_id: string;
  cnpj: string;
  ie: string;
  razao_social: string;
  nome_fantasia: string;
  endereco: FiscalAddress;
  regime_tributario: 'simples_nacional' | 'lucro_presumido' | 'lucro_real';

  // Fiscal config
  serie: number;
  numero: number;
  csc_id: string;
  csc_token: string;

  // Items
  items: FiscalItem[];

  // Payment
  payments: FiscalPayment[];

  // Totals
  total_amount: number;

  // Consumer (optional - required if value >= R$10,000 or if requested)
  consumer_cpf?: string;
  consumer_name?: string;

  // Internal reference
  order_id: string;
  idempotency_key: string;
}

// ─── Supporting Types ────────────────────────────────────────────────────────

export interface FiscalAddress {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  municipio: string;
  codigo_municipio: string;
  uf: string;
  cep: string;
}

export interface FiscalItem {
  description: string;
  ncm: string;
  cfop: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  unit: string;

  // Taxes (depends on regime)
  icms: {
    origem: string;
    cst?: string;
    csosn?: string;
    aliquota?: number;
    valor?: number;
  };
  pis: { cst: string; aliquota?: number; valor?: number };
  cofins: { cst: string; aliquota?: number; valor?: number };
}

export interface FiscalPayment {
  method: string; // '01'=Cash, '03'=Credit, '04'=Debit, '17'=PIX
  amount: number;
}

// ─── Result Types ────────────────────────────────────────────────────────────

export interface FiscalEmissionResult {
  success: boolean;
  access_key?: string;
  number?: number;
  series?: number;
  protocol?: string;
  xml?: string;
  qr_code_url?: string;
  danfe_url?: string;
  error_code?: string;
  error_message?: string;
}

export interface FiscalCancelResult {
  success: boolean;
  protocol?: string;
  error_code?: string;
  error_message?: string;
}

export interface FiscalConsultResult {
  status: 'authorized' | 'cancelled' | 'denied' | 'pending' | 'not_found';
  access_key?: string;
  protocol?: string;
  xml?: string;
  qr_code_url?: string;
  danfe_url?: string;
  error_code?: string;
  error_message?: string;
}
