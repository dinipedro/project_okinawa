import { Users, Clock, DollarSign, Plus } from "lucide-react";

const tables = [
  { id: 1, seats: 2, status: "available", guests: 0, time: "", total: "" },
  { id: 2, seats: 4, status: "occupied", guests: 3, time: "1h 20min", total: "R$ 156,00" },
  { id: 3, seats: 4, status: "occupied", guests: 4, time: "45min", total: "R$ 89,50" },
  { id: 4, seats: 2, status: "reserved", guests: 0, time: "19:30", total: "" },
  { id: 5, seats: 6, status: "occupied", guests: 5, time: "2h 10min", total: "R$ 324,00" },
  { id: 6, seats: 4, status: "available", guests: 0, time: "", total: "" },
  { id: 7, seats: 2, status: "cleaning", guests: 0, time: "", total: "" },
  { id: 8, seats: 8, status: "reserved", guests: 0, time: "20:00", total: "" },
  { id: 9, seats: 4, status: "available", guests: 0, time: "", total: "" },
  { id: 10, seats: 2, status: "occupied", guests: 2, time: "30min", total: "R$ 67,00" },
  { id: 11, seats: 6, status: "available", guests: 0, time: "", total: "" },
  { id: 12, seats: 4, status: "occupied", guests: 4, time: "1h 45min", total: "R$ 198,00" },
];

const statusColors = {
  available: "bg-success/20 border-success text-success",
  occupied: "bg-primary/20 border-primary text-primary",
  reserved: "bg-accent/20 border-accent text-accent",
  cleaning: "bg-muted border-muted-foreground text-muted-foreground",
};

const statusLabels = {
  available: "Livre",
  occupied: "Ocupada",
  reserved: "Reservada",
  cleaning: "Limpeza",
};

export const TablesScreen = () => {
  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="px-5 py-4 bg-secondary text-secondary-foreground">
        <h1 className="font-display text-xl font-bold mb-1">Gestão de Mesas</h1>
        <p className="text-sm opacity-80">12 mesas no total</p>
      </div>

      {/* Stats */}
      <div className="px-5 py-4 flex gap-3">
        <div className="flex-1 p-3 rounded-xl bg-success/10 border border-success/30 text-center">
          <div className="text-2xl font-bold text-success">4</div>
          <div className="text-xs text-muted-foreground">Livres</div>
        </div>
        <div className="flex-1 p-3 rounded-xl bg-primary/10 border border-primary/30 text-center">
          <div className="text-2xl font-bold text-primary">5</div>
          <div className="text-xs text-muted-foreground">Ocupadas</div>
        </div>
        <div className="flex-1 p-3 rounded-xl bg-accent/10 border border-accent/30 text-center">
          <div className="text-2xl font-bold text-accent">2</div>
          <div className="text-xs text-muted-foreground">Reservadas</div>
        </div>
        <div className="flex-1 p-3 rounded-xl bg-muted text-center">
          <div className="text-2xl font-bold">1</div>
          <div className="text-xs text-muted-foreground">Limpeza</div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="flex-1 px-5 pb-4">
        <div className="grid grid-cols-3 gap-3">
          {tables.map((table) => (
            <div 
              key={table.id} 
              className={`p-3 rounded-xl border-2 ${statusColors[table.status as keyof typeof statusColors]}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-lg">{table.id}</span>
                <div className="flex items-center gap-1 text-xs">
                  <Users className="h-3 w-3" />
                  <span>{table.seats}</span>
                </div>
              </div>

              <div className="text-xs font-medium mb-1">
                {statusLabels[table.status as keyof typeof statusLabels]}
              </div>

              {table.status === "occupied" && (
                <div className="space-y-1 text-xs opacity-80">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{table.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span>{table.total}</span>
                  </div>
                </div>
              )}

              {table.status === "reserved" && (
                <div className="text-xs opacity-80">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {table.time}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Table Button */}
      <div className="sticky bottom-0 p-4 bg-background border-t border-border">
        <button className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold flex items-center justify-center gap-2">
          <Plus className="h-5 w-5" />
          Adicionar Mesa
        </button>
      </div>
    </div>
  );
};
