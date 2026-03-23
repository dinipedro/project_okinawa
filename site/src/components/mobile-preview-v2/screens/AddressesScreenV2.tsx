import { MapPin, Plus, Home, Briefcase, Heart, MoreVertical, Edit, Trash2, Check, Navigation } from "lucide-react";
import { useState } from "react";

export const AddressesScreenV2 = () => {
  const [selectedAddress, setSelectedAddress] = useState(1);

  const addresses = [
    {
      id: 1,
      label: "Casa",
      icon: Home,
      address: "Rua das Flores, 123",
      complement: "Apt 45, Bloco B",
      neighborhood: "Jardim Paulista",
      city: "São Paulo - SP",
      cep: "01234-567",
      isDefault: true,
      color: "from-orange-400 to-amber-500",
    },
    {
      id: 2,
      label: "Trabalho",
      icon: Briefcase,
      address: "Av. Paulista, 1000",
      complement: "10º andar",
      neighborhood: "Bela Vista",
      city: "São Paulo - SP",
      cep: "01310-100",
      isDefault: false,
      color: "from-blue-400 to-indigo-500",
    },
    {
      id: 3,
      label: "Favorito",
      icon: Heart,
      address: "Rua Augusta, 500",
      complement: "",
      neighborhood: "Consolação",
      city: "São Paulo - SP",
      cep: "01304-000",
      isDefault: false,
      color: "from-pink-400 to-rose-500",
    },
  ];

  return (
    <div className="h-full bg-gradient-to-b from-orange-50 to-amber-50 dark:from-background dark:to-background overflow-y-auto">
      {/* Header */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Meus Endereços</h1>
              <p className="text-xs text-muted-foreground">{addresses.length} endereços salvos</p>
            </div>
          </div>
        </div>

        {/* Add New Address */}
        <button className="w-full p-4 rounded-2xl border-2 border-dashed border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-900/10 flex items-center justify-center gap-2 text-orange-600 dark:text-orange-400 font-medium">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
            <Plus className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm">Adicionar novo endereço</span>
        </button>
      </div>

      {/* Addresses List */}
      <div className="px-4 space-y-3 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center">
            <Navigation className="h-3 w-3 text-white" />
          </div>
          <span className="text-sm font-semibold text-foreground">Endereços Salvos</span>
        </div>

        {addresses.map((addr) => {
          const Icon = addr.icon;
          const isSelected = selectedAddress === addr.id;

          return (
            <div
              key={addr.id}
              onClick={() => setSelectedAddress(addr.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-300 dark:border-orange-700"
                  : "bg-card border-border"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${addr.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{addr.label}</h3>
                    {addr.isDefault && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs">
                        Padrão
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground">{addr.address}</p>
                  {addr.complement && (
                    <p className="text-sm text-muted-foreground">{addr.complement}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {addr.neighborhood} • {addr.city}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className="flex gap-1">
                    <button className="p-2 rounded-lg bg-muted">
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button className="p-2 rounded-lg bg-muted">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Info Card */}
        <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/30">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 <strong>Dica:</strong> Seus endereços são usados apenas para localização de restaurantes próximos. O Okinawa é exclusivo para experiências presenciais.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddressesScreenV2;
