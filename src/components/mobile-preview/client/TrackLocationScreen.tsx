import React, { useState, useEffect } from 'react';
import { useMobilePreview, SERVICE_TYPE_CONFIG } from '../context/MobilePreviewContext';
import { 
  ArrowLeft, Navigation, MapPin, Clock, Car, Bell, 
  ChevronRight, Utensils, CheckCircle, AlertCircle
} from 'lucide-react';

export function TrackLocationScreen() {
  const { goBack, navigate, params, serviceConfig } = useMobilePreview();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [estimatedArrival, setEstimatedArrival] = useState(8);
  const [distance, setDistance] = useState(2.5);

  const restaurant = params.restaurant;
  const isDriveThru = restaurant?.type === 'drive_thru';
  const isFoodTruck = restaurant?.type === 'food_truck';

  // Simulate distance decreasing
  useEffect(() => {
    if (orderPlaced && distance > 0.1) {
      const timer = setInterval(() => {
        setDistance(d => Math.max(0.1, d - 0.3));
        setEstimatedArrival(t => Math.max(1, t - 1));
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [orderPlaced, distance]);

  const handlePlaceOrder = () => {
    setOrderPlaced(true);
    navigate('menu', { restaurant, fromTracking: true });
  };

  if (isFoodTruck) {
    return (
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 border-b border-border">
          <button onClick={goBack} className="p-2 -ml-2 rounded-lg hover:bg-accent">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-foreground">Localização</h1>
            <p className="text-xs text-muted-foreground">{restaurant?.name}</p>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="relative h-64 bg-accent">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-primary/20 flex items-center justify-center">
                <Navigation className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Mapa em tempo real</p>
            </div>
          </div>
          
          {/* Food Truck Location Pin */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center animate-pulse">
              <span className="text-2xl">🚚</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Current Location */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Localização Atual</p>
                <p className="text-sm text-muted-foreground">Praça da República, Centro</p>
              </div>
            </div>
          </div>

          {/* Distance & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-xl p-4 border border-border text-center">
              <Navigation className="w-5 h-5 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">1.2 km</p>
              <p className="text-xs text-muted-foreground">de você</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border text-center">
              <Clock className="w-5 h-5 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">~5 min</p>
              <p className="text-xs text-muted-foreground">a pé</p>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <h3 className="font-semibold text-foreground mb-3">Horário de Hoje</h3>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Praça da República</span>
              <span className="text-foreground">11:00 - 15:00</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-muted-foreground">Parque Ibirapuera</span>
              <span className="text-foreground">17:00 - 21:00</span>
            </div>
          </div>

          {/* Notifications */}
          <button className="w-full bg-accent/50 rounded-xl p-4 flex items-center gap-3">
            <Bell className="w-5 h-5 text-primary" />
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground">Ativar notificações</p>
              <p className="text-xs text-muted-foreground">Saiba quando estivermos por perto</p>
            </div>
            <div className="w-12 h-6 rounded-full bg-primary relative">
              <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white"></div>
            </div>
          </button>
        </div>

        {/* Bottom Action */}
        <div className="p-4 border-t border-border">
          <button
            onClick={() => navigate('menu', { restaurant })}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2"
          >
            <Utensils className="w-5 h-5" />
            Ver Cardápio
          </button>
        </div>
      </div>
    );
  }

  // Drive-Thru View
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <button onClick={goBack} className="p-2 -ml-2 rounded-lg hover:bg-accent">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold text-foreground">Pedido no Caminho</h1>
          <p className="text-xs text-muted-foreground">{restaurant?.name}</p>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="relative h-48 bg-accent">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Car className="w-12 h-12 mx-auto mb-2 text-primary opacity-50" />
            <p className="text-sm text-muted-foreground">Rastreamento GPS</p>
          </div>
        </div>
        
        {/* Route visualization */}
        <div className="absolute bottom-4 left-4 right-4 bg-card/90 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <div className="flex-1 h-1 bg-primary/30 relative">
            <div 
              className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all"
              style={{ width: `${Math.max(10, 100 - (distance / 2.5) * 100)}%` }}
            ></div>
          </div>
          <div className="w-3 h-3 rounded-full bg-primary"></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {!orderPlaced ? (
          <>
            {/* How it works */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="font-semibold text-foreground mb-3">Como funciona?</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Faça seu pedido</p>
                    <p className="text-sm text-muted-foreground">Escolha seus itens enquanto dirige</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">GPS detecta sua chegada</p>
                    <p className="text-sm text-muted-foreground">Preparamos quando você estiver perto</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Retire sem esperar</p>
                    <p className="text-sm text-muted-foreground">Seu pedido estará pronto na janela</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="font-semibold text-foreground mb-3">Seu Veículo</h3>
              <button className="w-full flex items-center justify-between p-3 rounded-lg bg-accent">
                <div className="flex items-center gap-3">
                  <Car className="w-5 h-5 text-primary" />
                  <span className="text-foreground">ABC-1234 • Honda Civic Preto</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
              <p className="text-xs text-muted-foreground mt-2">
                Identificamos seu carro pela placa para agilizar o atendimento
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Order Status */}
            <div className={`rounded-xl p-6 text-center ${distance < 0.5 ? 'bg-green-500' : 'bg-primary'} text-primary-foreground`}>
              {distance < 0.5 ? (
                <>
                  <CheckCircle className="w-16 h-16 mx-auto mb-3" />
                  <h2 className="text-xl font-bold mb-1">Pedido Pronto!</h2>
                  <p className="text-sm opacity-80">Dirija até a janela de retirada</p>
                </>
              ) : (
                <>
                  <Car className="w-12 h-12 mx-auto mb-3 opacity-80" />
                  <p className="text-sm opacity-80 mb-1">Você chegará em</p>
                  <p className="text-4xl font-bold mb-2">~{estimatedArrival} min</p>
                  <p className="text-sm opacity-80">{distance.toFixed(1)} km restantes</p>
                </>
              )}
            </div>

            {/* Preparation Status */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="font-semibold text-foreground mb-3">Status do Preparo</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-foreground">Pedido recebido</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className={`w-5 h-5 ${distance < 1.5 ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <span className={distance < 1.5 ? 'text-foreground' : 'text-muted-foreground'}>Preparando</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className={`w-5 h-5 ${distance < 0.5 ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <span className={distance < 0.5 ? 'text-foreground' : 'text-muted-foreground'}>Pronto para retirada</span>
                </div>
              </div>
            </div>

            {/* Your Order */}
            <div className="bg-accent/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-foreground">Seu Pedido</span>
                <span className="text-primary text-sm">Ver detalhes</span>
              </div>
              <p className="text-sm text-muted-foreground">
                2 itens • R$ 35,90
              </p>
            </div>
          </>
        )}
      </div>

      {/* Bottom Action */}
      <div className="p-4 border-t border-border">
        {!orderPlaced ? (
          <button
            onClick={handlePlaceOrder}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2"
          >
            <Utensils className="w-5 h-5" />
            Fazer Pedido no Caminho
          </button>
        ) : distance < 0.5 ? (
          <button
            onClick={() => navigate('rating')}
            className="w-full py-3 rounded-xl bg-green-500 text-white font-semibold"
          >
            Confirmar Retirada
          </button>
        ) : (
          <button
            onClick={() => setOrderPlaced(false)}
            className="w-full py-3 rounded-xl bg-destructive text-destructive-foreground font-semibold"
          >
            Cancelar Pedido
          </button>
        )}
      </div>
    </div>
  );
}
