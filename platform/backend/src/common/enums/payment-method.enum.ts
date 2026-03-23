export enum PaymentMethodType {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PIX = 'pix',
  CASH = 'cash',
  VOUCHER = 'voucher',
  WALLET = 'wallet',
}

export enum WalletType {
  CLIENT = 'client',
  RESTAURANT = 'restaurant',
  STAFF = 'staff',
}

export enum TransactionType {
  RECHARGE = 'recharge',
  PAYMENT = 'payment',
  REFUND = 'refund',
  WITHDRAWAL = 'withdrawal',
  TIP_RECEIVED = 'tip_received',
  TIP_DISTRIBUTED = 'tip_distributed',
  SALARY = 'salary',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, string> = {
  [PaymentMethodType.CREDIT_CARD]: 'Cartão de Crédito',
  [PaymentMethodType.DEBIT_CARD]: 'Cartão de Débito',
  [PaymentMethodType.PIX]: 'PIX',
  [PaymentMethodType.CASH]: 'Dinheiro',
  [PaymentMethodType.VOUCHER]: 'Voucher',
  [PaymentMethodType.WALLET]: 'Carteira Digital',
};
