import { FC, useState } from 'react';
import { ChevronLeft, Users, Clock, CheckCircle2, QrCode, Plus, MoreVertical, Settings } from "lucide-react";
import RestaurantLiquidGlassNav from '../../components/RestaurantLiquidGlassNav';

interface TablesScreenV2Props { onNavigate: (screen: string) => void; }

const tables = [
  { id: '1', number: 'Mesa 1', status: 'occupied', guests: 4, time: '45 min', section: 'Interna', hasQR: true },
  { id: '2', number: 'Mesa 2', status: 'available', guests: 0, time: '', section: 'Interna', hasQR: true },
  { id: '3', number: 'Mesa 3', status: 'reserved', guests: 2, time: '19:00', section: 'Interna', hasQR: false },
  { id: '4', number: 'Mesa 4', status: 'occupied', guests: 2, time: '20 min', section: 'Varanda', hasQR: true },
  { id: '5', number: 'Mesa 5', status: 'available', guests: 0, time: '', section: 'Varanda', hasQR: false },
  { id: '6', number: 'Mesa 6', status: 'occupied', guests: 6, time: '1h 10min', section: 'Privativo', hasQR: true },
];

const TablesScreenV2: FC<TablesScreenV2Props> = ({ onNavigate }) => {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-muted to-background relative pb-28">
      {/* Header */}
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('dashboard')} className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="text-xl font-semibold text-foreground">Mapa de Mesas</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onNavigate('qr-batch')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span className="text-sm font-medium">QR Codes</span>
            </button>
            <button className="p-2 rounded-xl hover:bg-muted transition-colors">
              <Plus className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Status Legend */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Ocupada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary" />
            <span className="text-xs text-muted-foreground">Reservada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">Livre</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-3 gap-3">
          {tables.map(table => (
            <button
              key={table.id}
              onClick={() => setSelectedTable(table.id === selectedTable ? null : table.id)}
              className={`relative p-4 rounded-2xl border-2 text-center transition-all ${
                table.status === 'occupied' ? 'bg-primary/10 border-primary' :
                table.status === 'reserved' ? 'bg-secondary/10 border-secondary' : 'bg-success/10 border-success'
              } ${selectedTable === table.id ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
            >
              {/* QR indicator */}
              {table.hasQR && (
                <div className="absolute top-1.5 right-1.5">
                  <QrCode className="w-3 h-3 text-muted-foreground" />
                </div>
              )}
              
              <span className="text-2xl font-bold text-foreground">{table.id}</span>
              <p className="text-xs text-muted-foreground mt-1">{table.section}</p>
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                {table.status === 'occupied' && <><Users className="w-3 h-3" />{table.guests} • {table.time}</>}
                {table.status === 'reserved' && <><Clock className="w-3 h-3" />{table.time}</>}
                {table.status === 'available' && <><CheckCircle2 className="w-3 h-3 text-success" />Livre</>}
              </div>
            </button>
          ))}
        </div>

        {/* Selected Table Actions */}
        {selectedTable && (
          <div className="mt-6 p-4 bg-card rounded-2xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">Mesa {selectedTable}</h3>
                <p className="text-xs text-muted-foreground">{tables.find(t => t.id === selectedTable)?.section}</p>
              </div>
              <button className="p-2 rounded-xl hover:bg-muted transition-colors">
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => onNavigate('qr-generator')}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium text-sm"
              >
                <QrCode className="w-4 h-4" />
                Gerar QR Code
              </button>
              <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-muted text-foreground font-medium text-sm">
                <Settings className="w-4 h-4" />
                Configurar
              </button>
            </div>
          </div>
        )}
      </div>
      
      <RestaurantLiquidGlassNav activeTab="tables" onNavigate={onNavigate} />
    </div>
  );
};

export default TablesScreenV2;
