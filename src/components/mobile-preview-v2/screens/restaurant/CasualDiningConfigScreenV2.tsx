import { useState } from "react";
import { Settings, Check, Users, Clock, Bell, CreditCard, Utensils, ChevronRight, ToggleLeft, ToggleRight } from "lucide-react";

interface ConfigSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  settings: ConfigSetting[];
}

interface ConfigSetting {
  id: string;
  label: string;
  description: string;
  type: "toggle" | "number" | "select";
  value: boolean | number | string;
}

export const CasualDiningConfigScreenV2 = () => {
  const [config, setConfig] = useState({
    // Reservations & Entry
    reservations_optional: true,
    reservation_grace_period: 15,
    waitlist_enabled: true,
    waitlist_advance_drinks: true,
    estimated_wait_display: true,
    // Table Service
    table_service: true,
    order_at_table: true,
    call_waiter_button: true,
    partial_order_enabled: true,
    // Groups
    group_friendly: true,
    max_group_size: 20,
    group_reservation_required: 8,
    // Payment
    suggested_tip_percentage: 10,
    service_charge_included: false,
    split_bill_promoted: true,
    // Operational
    average_meal_duration: 75,
    table_turnover_target: 4,
  });

  const sections: ConfigSection[] = [
    {
      id: "reservations",
      title: "Reservas e Entrada",
      icon: <Clock className="h-5 w-5 text-primary" />,
      settings: [
        {
          id: "reservations_optional",
          label: "Reserva Opcional",
          description: "Aceitar walk-ins e reservas",
          type: "toggle",
          value: config.reservations_optional,
        },
        {
          id: "waitlist_enabled",
          label: "Lista de Espera",
          description: "Fila inteligente para walk-ins",
          type: "toggle",
          value: config.waitlist_enabled,
        },
        {
          id: "waitlist_advance_drinks",
          label: "Bebidas na Fila",
          description: "Pedir enquanto aguarda",
          type: "toggle",
          value: config.waitlist_advance_drinks,
        },
        {
          id: "estimated_wait_display",
          label: "Tempo Estimado",
          description: "Mostrar estimativa de espera",
          type: "toggle",
          value: config.estimated_wait_display,
        },
      ],
    },
    {
      id: "service",
      title: "Serviço de Mesa",
      icon: <Utensils className="h-5 w-5 text-primary" />,
      settings: [
        {
          id: "table_service",
          label: "Atendimento na Mesa",
          description: "Garçom dedicado",
          type: "toggle",
          value: config.table_service,
        },
        {
          id: "order_at_table",
          label: "Pedido pelo App",
          description: "Cliente pode pedir na mesa",
          type: "toggle",
          value: config.order_at_table,
        },
        {
          id: "call_waiter_button",
          label: "Botão Chamar Garçom",
          description: "Notificação instantânea",
          type: "toggle",
          value: config.call_waiter_button,
        },
        {
          id: "partial_order_enabled",
          label: "Pedido Parcial",
          description: "Adicionar itens durante refeição",
          type: "toggle",
          value: config.partial_order_enabled,
        },
      ],
    },
    {
      id: "groups",
      title: "Grupos",
      icon: <Users className="h-5 w-5 text-primary" />,
      settings: [
        {
          id: "group_friendly",
          label: "Aceita Grupos",
          description: "Grupos grandes bem-vindos",
          type: "toggle",
          value: config.group_friendly,
        },
        {
          id: "max_group_size",
          label: "Tamanho Máximo",
          description: "Limite de pessoas por grupo",
          type: "number",
          value: config.max_group_size,
        },
        {
          id: "group_reservation_required",
          label: "Reserva Obrigatória",
          description: "A partir de X pessoas",
          type: "number",
          value: config.group_reservation_required,
        },
      ],
    },
    {
      id: "payment",
      title: "Pagamento",
      icon: <CreditCard className="h-5 w-5 text-primary" />,
      settings: [
        {
          id: "suggested_tip_percentage",
          label: "Gorjeta Sugerida",
          description: "Percentual pré-selecionado",
          type: "number",
          value: config.suggested_tip_percentage,
        },
        {
          id: "service_charge_included",
          label: "Taxa de Serviço",
          description: "Inclusa nos preços",
          type: "toggle",
          value: config.service_charge_included,
        },
        {
          id: "split_bill_promoted",
          label: "Divisão de Conta",
          description: "Destacar opção de dividir",
          type: "toggle",
          value: config.split_bill_promoted,
        },
      ],
    },
  ];

  const toggleSetting = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      [id]: !prev[id as keyof typeof prev],
    }));
  };

  return (
    <div className="h-full bg-background overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/10 to-background p-4 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Casual Dining</h1>
            <p className="text-xs text-muted-foreground">Configure seu restaurante</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-3">
          <div className="flex-1 bg-card rounded-xl p-3 border border-border">
            <p className="text-xs text-muted-foreground">Ticket Médio</p>
            <p className="font-semibold text-foreground">R$ 60-150</p>
          </div>
          <div className="flex-1 bg-card rounded-xl p-3 border border-border">
            <p className="text-xs text-muted-foreground">Tempo Médio</p>
            <p className="font-semibold text-foreground">{config.average_meal_duration} min</p>
          </div>
          <div className="flex-1 bg-card rounded-xl p-3 border border-border">
            <p className="text-xs text-muted-foreground">Giros/Dia</p>
            <p className="font-semibold text-foreground">{config.table_turnover_target}x</p>
          </div>
        </div>
      </div>

      {/* Configuration Sections */}
      <div className="p-4 space-y-6">
        {sections.map((section) => (
          <div key={section.id}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                {section.icon}
              </div>
              <h2 className="font-semibold text-foreground">{section.title}</h2>
            </div>

            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {section.settings.map((setting, index) => (
                <div
                  key={setting.id}
                  className={`flex items-center justify-between p-4 ${
                    index !== section.settings.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{setting.label}</p>
                    <p className="text-xs text-muted-foreground">{setting.description}</p>
                  </div>

                  {setting.type === "toggle" && (
                    <button
                      onClick={() => toggleSetting(setting.id)}
                      className="ml-4"
                    >
                      {setting.value ? (
                        <ToggleRight className="h-8 w-8 text-primary" />
                      ) : (
                        <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                      )}
                    </button>
                  )}

                  {setting.type === "number" && (
                    <div className="ml-4 bg-muted rounded-lg px-3 py-1">
                      <span className="text-sm font-medium text-foreground">
                        {setting.value}
                        {setting.id === "suggested_tip_percentage" ? "%" : ""}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="p-4">
        <button className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
          Salvar Configurações
        </button>
      </div>
    </div>
  );
};

export default CasualDiningConfigScreenV2;
