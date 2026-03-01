import { MapPin, Home, Briefcase, Heart, Plus, Edit, Trash2, Check, Navigation } from "lucide-react";

const addresses = [
  {
    id: 1,
    type: "home",
    label: "Casa",
    address: "Rua das Flores, 123",
    complement: "Apt 45, Bloco B",
    neighborhood: "Jardim Europa",
    city: "São Paulo, SP",
    isDefault: true
  },
  {
    id: 2,
    type: "work",
    label: "Trabalho",
    address: "Av. Paulista, 1000",
    complement: "10º andar",
    neighborhood: "Bela Vista",
    city: "São Paulo, SP",
    isDefault: false
  },
  {
    id: 3,
    type: "other",
    label: "Academia",
    address: "Rua Oscar Freire, 500",
    complement: "",
    neighborhood: "Pinheiros",
    city: "São Paulo, SP",
    isDefault: false
  },
];

const typeIcons = {
  home: Home,
  work: Briefcase,
  other: Heart,
};

export const AddressesScreen = () => {
  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="px-5 py-4 bg-card border-b border-border">
        <h1 className="font-display text-xl font-bold mb-1">Meus Endereços</h1>
        <p className="text-sm text-muted-foreground">{addresses.length} endereços salvos</p>
      </div>

      {/* Current Location */}
      <div className="px-5 py-4">
        <button className="w-full p-4 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
            <Navigation className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-primary">Usar localização atual</p>
            <p className="text-sm text-muted-foreground">Buscar endereço via GPS</p>
          </div>
        </button>
      </div>

      {/* Addresses List */}
      <div className="px-5 py-2 flex-1 space-y-3">
        {addresses.map((addr) => {
          const Icon = typeIcons[addr.type as keyof typeof typeIcons];
          return (
            <div 
              key={addr.id} 
              className={`p-4 rounded-2xl border-2 transition-colors ${
                addr.isDefault ? 'bg-secondary/5 border-secondary' : 'bg-card border-border'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    addr.isDefault ? 'bg-secondary text-secondary-foreground' : 'bg-muted'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                          Padrão
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg hover:bg-muted">
                    <Edit className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-muted">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>

              <div className="pl-13 ml-13">
                <p className="text-sm">{addr.address}</p>
                {addr.complement && <p className="text-sm text-muted-foreground">{addr.complement}</p>}
                <p className="text-sm text-muted-foreground">{addr.neighborhood} - {addr.city}</p>
              </div>

              {!addr.isDefault && (
                <button className="mt-3 text-sm text-primary font-medium flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  Definir como padrão
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Button */}
      <div className="sticky bottom-0 p-4 bg-background border-t border-border">
        <button className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2">
          <Plus className="h-5 w-5" />
          Adicionar Endereço
        </button>
      </div>
    </div>
  );
};
