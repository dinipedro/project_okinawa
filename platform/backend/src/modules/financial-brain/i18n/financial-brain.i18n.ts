/**
 * Financial Brain i18n keys.
 *
 * These keys are referenced by the ForecastService alerts and
 * should be added to the mobile i18n files (pt-BR, en-US, es-ES).
 */
export const FINANCIAL_BRAIN_I18N_KEYS = {
  forecast: {
    title: 'financial.forecast.title',
    alert_low_balance: 'financial.forecast.alert_low_balance',
    alert_high_food_cost: 'financial.forecast.alert_high_food_cost',
    projected_balance: 'financial.forecast.projected_balance',
    projected_revenue: 'financial.forecast.projected_revenue',
    projected_expenses: 'financial.forecast.projected_expenses',
    next_7_days: 'financial.forecast.next_7_days',
    next_30_days: 'financial.forecast.next_30_days',
    next_90_days: 'financial.forecast.next_90_days',
  },
  bills: {
    title: 'financial.bills.title',
    create: 'financial.bills.create',
    mark_paid: 'financial.bills.mark_paid',
    overdue: 'financial.bills.overdue',
    upcoming: 'financial.bills.upcoming',
    recurring: 'financial.bills.recurring',
    categories: {
      rent: 'financial.bills.categories.rent',
      utilities: 'financial.bills.categories.utilities',
      supplies: 'financial.bills.categories.supplies',
      staff: 'financial.bills.categories.staff',
      marketing: 'financial.bills.categories.marketing',
      maintenance: 'financial.bills.categories.maintenance',
      other: 'financial.bills.categories.other',
    },
  },
  export: {
    title: 'financial.export.title',
    accounting: 'financial.export.accounting',
    csv: 'financial.export.csv',
    pdf: 'financial.export.pdf',
  },
} as const;
