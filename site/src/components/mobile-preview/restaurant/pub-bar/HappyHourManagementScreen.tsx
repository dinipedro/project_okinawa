import { useState } from "react";
import { 
  Clock, 
  Percent, 
  Plus, 
  Edit2, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Beer,
  Wine,
  Coffee,
  Calendar,
  Zap
} from "lucide-react";

interface HappyHourSchedule {
  id: string;
  name: string;
  dayOfWeek: number[];
  startTime: string;
  endTime: string;
  discountPercentage: number;
  categories: string[];
  isActive: boolean;
}

const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const mockSchedules: HappyHourSchedule[] = [
  {
    id: "hh_001",
    name: "Happy Hour Clássico",
    dayOfWeek: [1, 2, 3, 4, 5],
    startTime: "17:00",
    endTime: "20:00",
    discountPercentage: 30,
    categories: ["Chopp", "Petiscos"],
    isActive: true
  },
  {
    id: "hh_002",
    name: "Wine Wednesday",
    dayOfWeek: [3],
    startTime: "18:00",
    endTime: "22:00",
    discountPercentage: 40,
    categories: ["Vinhos"],
    isActive: true
  },
  {
    id: "hh_003",
    name: "Weekend Especial",
    dayOfWeek: [5, 6],
    startTime: "22:00",
    endTime: "00:00",
    discountPercentage: 20,
    categories: ["Drinks", "Shots"],
    isActive: false
  },
];

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'chopp':
    case 'cerveja':
      return Beer;
    case 'vinhos':
      return Wine;
    case 'drinks':
    case 'shots':
      return Coffee;
    default:
      return Zap;
  }
};

export const HappyHourManagementScreen = () => {
  const [schedules, setSchedules] = useState(mockSchedules);
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);

  const toggleActive = (id: string) => {
    setSchedules(prev => prev.map(s => 
      s.id === id ? { ...s, isActive: !s.isActive } : s
    ));
  };

  const activeNow = schedules.find(s => {
    if (!s.isActive) return false;
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);
    return s.dayOfWeek.includes(currentDay) && 
           currentTime >= s.startTime && 
           currentTime <= s.endTime;
  });

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm opacity-80">Promoções</p>
            <h1 className="font-display text-xl font-bold flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Happy Hour
            </h1>
          </div>
          <button className="p-2 rounded-xl bg-primary-foreground/10 backdrop-blur-sm">
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Active Now Banner */}
        {activeNow && (
          <div className="p-3 rounded-xl bg-primary-foreground/20 backdrop-blur-sm border border-primary-foreground/30">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-medium">ATIVO AGORA</span>
            </div>
            <p className="font-semibold">{activeNow.name}</p>
            <p className="text-sm opacity-80">
              {activeNow.discountPercentage}% OFF em {activeNow.categories.join(", ")}
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="px-5 py-4 border-b border-border bg-card/50">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{schedules.length}</p>
            <p className="text-xs text-muted-foreground">Promoções</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">{schedules.filter(s => s.isActive).length}</p>
            <p className="text-xs text-muted-foreground">Ativas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">
              {Math.max(...schedules.map(s => s.discountPercentage))}%
            </p>
            <p className="text-xs text-muted-foreground">Maior Desc.</p>
          </div>
        </div>
      </div>

      {/* Schedules List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-3">
        <div className="space-y-3">
          {schedules.map((schedule) => {
            const isSelected = selectedSchedule === schedule.id;
            
            return (
              <div
                key={schedule.id}
                onClick={() => setSelectedSchedule(isSelected ? null : schedule.id)}
                className={`p-4 rounded-2xl bg-card border-2 transition-all cursor-pointer ${
                  isSelected ? 'border-primary shadow-lg' : 
                  schedule.isActive ? 'border-border' : 'border-border opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                      schedule.isActive ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <Percent className={`h-6 w-6 ${schedule.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{schedule.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{schedule.startTime} - {schedule.endTime}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleActive(schedule.id);
                    }}
                    className="p-1"
                  >
                    {schedule.isActive ? (
                      <ToggleRight className="h-8 w-8 text-success" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                    )}
                  </button>
                </div>

                {/* Days */}
                <div className="flex gap-1 mb-3">
                  {dayNames.map((day, i) => (
                    <span
                      key={day}
                      className={`w-8 h-6 flex items-center justify-center rounded text-[10px] font-medium ${
                        schedule.dayOfWeek.includes(i)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {day}
                    </span>
                  ))}
                </div>

                {/* Categories & Discount */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {schedule.categories.map(cat => {
                      const Icon = getCategoryIcon(cat);
                      return (
                        <span key={cat} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-lg">
                          <Icon className="h-3 w-3" />
                          {cat}
                        </span>
                      );
                    })}
                  </div>
                  <span className="text-xl font-bold text-primary">
                    {schedule.discountPercentage}%
                  </span>
                </div>

                {/* Expanded Actions */}
                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-border flex gap-2">
                    <button className="flex-1 py-2 rounded-xl bg-primary/10 text-primary font-medium text-sm flex items-center justify-center gap-2">
                      <Edit2 className="h-4 w-4" />
                      Editar
                    </button>
                    <button className="flex-1 py-2 rounded-xl bg-destructive/10 text-destructive font-medium text-sm flex items-center justify-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Button */}
      <div className="px-5 py-4 bg-card border-t border-border">
        <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2">
          <Plus className="h-5 w-5" />
          Nova Promoção Happy Hour
        </button>
      </div>
    </div>
  );
};
