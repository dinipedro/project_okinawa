import { useState } from 'react';
import { useMobilePreview } from '../../context/MobilePreviewContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Gift, 
  Calendar, 
  Users, 
  PartyPopper,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Upload,
  Camera
} from 'lucide-react';

type RequestStatus = 'idle' | 'submitting' | 'submitted';

export function BirthdayEntryRequestScreen() {
  const { navigate } = useMobilePreview();
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [companions, setCompanions] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [documentUploaded, setDocumentUploaded] = useState(false);
  
  // Simulated user data
  const userBirthday = new Date(1995, 0, 28);
  const today = new Date();
  const daysUntilBirthday = Math.ceil(
    (new Date(today.getFullYear(), userBirthday.getMonth(), userBirthday.getDate()).getTime() - today.getTime()) 
    / (1000 * 60 * 60 * 24)
  );
  const isWithinWindow = daysUntilBirthday >= -3 && daysUntilBirthday <= 7;
  
  // Simulated upcoming events
  const upcomingEvents = [
    { id: '1', name: 'Friday Night Fever', date: '31 Jan', price: 'R$ 60', free: true },
    { id: '2', name: 'Saturday Boom', date: '01 Feb', price: 'R$ 80', free: true },
    { id: '3', name: 'Sunday Chill', date: '02 Feb', price: 'R$ 40', free: true },
  ];
  
  // Existing requests
  const existingRequests = [
    { 
      id: '1', 
      eventName: 'New Year Bash', 
      date: '01 Jan', 
      status: 'approved', 
      companions: 2,
      qrCode: 'BDAY-2024-001'
    },
  ];

  const handleSubmit = () => {
    setStatus('submitting');
    setTimeout(() => {
      setStatus('submitted');
    }, 1500);
  };

  if (status === 'submitted') {
    return (
      <div className="h-full flex flex-col bg-background">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button 
            onClick={() => navigate('ticket-purchase')} 
            className="p-2 -ml-2 hover:bg-accent rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Entrada Aniversário</h1>
        </div>

        {/* Success State */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Solicitação Enviada!</h2>
          <p className="text-muted-foreground mb-6">
            Sua solicitação de entrada de aniversário foi enviada para análise. 
            Você receberá uma notificação quando for aprovada.
          </p>
          
          <Card className="w-full bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Evento</span>
                <span className="font-medium text-foreground">
                  {upcomingEvents.find(e => e.id === selectedEvent)?.name}
                </span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Data</span>
                <span className="font-medium text-foreground">
                  {upcomingEvents.find(e => e.id === selectedEvent)?.date}
                </span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Acompanhantes</span>
                <span className="font-medium text-foreground">{companions}</span>
              </div>
              <Separator className="my-3" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                  <Clock className="w-3 h-3 mr-1" />
                  Aguardando Aprovação
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Button 
            className="mt-6 w-full"
            onClick={() => navigate('ticket-purchase')}
          >
            Voltar aos Ingressos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button 
          onClick={() => navigate('ticket-purchase')} 
          className="p-2 -ml-2 hover:bg-accent rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Entrada Aniversário</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Birthday Banner */}
        <div className="p-4">
          <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-background border-primary/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
            <CardContent className="p-5 relative">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                  <Gift className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-foreground mb-1">
                    🎂 Entrada Grátis de Aniversário!
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Comemore seu dia especial conosco! Entrada gratuita para você 
                    + acompanhantes com desconto.
                  </p>
                </div>
              </div>
              
              <Separator className="my-4 bg-primary/20" />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Seu Aniversário</p>
                    <p className="text-sm font-medium text-foreground">
                      {userBirthday.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Período Válido</p>
                    <p className="text-sm font-medium text-foreground">
                      {isWithinWindow ? '7 dias' : `Em ${daysUntilBirthday} dias`}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Existing Requests */}
        {existingRequests.length > 0 && (
          <div className="px-4 mb-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Solicitações Anteriores</h3>
            {existingRequests.map((request) => (
              <Card key={request.id} className="bg-card border-border mb-2">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-foreground">{request.eventName}</p>
                      <p className="text-xs text-muted-foreground">{request.date}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={
                        request.status === 'approved' 
                          ? 'bg-green-500/10 text-green-600 border-green-500/30'
                          : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30'
                      }
                    >
                      {request.status === 'approved' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Aprovado
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          Pendente
                        </>
                      )}
                    </Badge>
                  </div>
                  {request.status === 'approved' && (
                    <div className="flex items-center gap-2 mt-3 p-2 bg-accent rounded-lg">
                      <PartyPopper className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground">
                        Código: <span className="font-mono font-medium text-foreground">{request.qrCode}</span>
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Eligibility Warning */}
        {!isWithinWindow && (
          <div className="px-4 mb-4">
            <Card className="bg-yellow-500/10 border-yellow-500/30">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-500">
                    Fora do período de elegibilidade
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-600/80 mt-1">
                    A entrada gratuita de aniversário está disponível de 3 dias antes até 7 dias 
                    após seu aniversário. Faltam {daysUntilBirthday} dias.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* New Request Form */}
        <div className="px-4 pb-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Nova Solicitação</h3>
          
          {/* Event Selection */}
          <div className="mb-4">
            <Label className="text-sm text-muted-foreground mb-2 block">Selecione o Evento</Label>
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event.id)}
                  disabled={!isWithinWindow}
                  className={`w-full p-4 rounded-xl border transition-all text-left ${
                    selectedEvent === event.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-primary/50'
                  } ${!isWithinWindow ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{event.name}</p>
                      <p className="text-xs text-muted-foreground">{event.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs line-through text-muted-foreground">{event.price}</p>
                      <Badge className="bg-green-500/20 text-green-600 border-0">
                        GRÁTIS
                      </Badge>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Companions */}
          <div className="mb-4">
            <Label className="text-sm text-muted-foreground mb-2 block">
              <Users className="w-4 h-4 inline mr-1" />
              Acompanhantes (máx. 3)
            </Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                disabled={companions <= 0 || !isWithinWindow}
                onClick={() => setCompanions(c => Math.max(0, c - 1))}
              >
                -
              </Button>
              <span className="text-2xl font-bold text-foreground w-8 text-center">{companions}</span>
              <Button
                variant="outline"
                size="icon"
                disabled={companions >= 3 || !isWithinWindow}
                onClick={() => setCompanions(c => Math.min(3, c + 1))}
              >
                +
              </Button>
              <span className="text-sm text-muted-foreground ml-2">
                50% de desconto cada
              </span>
            </div>
          </div>

          {/* Document Upload */}
          <div className="mb-6">
            <Label className="text-sm text-muted-foreground mb-2 block">
              Documento com Data de Nascimento
            </Label>
            <button
              onClick={() => setDocumentUploaded(true)}
              disabled={!isWithinWindow}
              className={`w-full p-4 rounded-xl border-2 border-dashed transition-all ${
                documentUploaded 
                  ? 'border-green-500 bg-green-500/5' 
                  : 'border-border hover:border-primary/50'
              } ${!isWithinWindow ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {documentUploaded ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Documento enviado</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <div className="flex gap-3">
                    <Camera className="w-6 h-6" />
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-sm">Tire uma foto ou faça upload do RG/CNH</span>
                </div>
              )}
            </button>
          </div>

          {/* Price Summary */}
          {selectedEvent && (
            <Card className="bg-card border-border mb-4">
              <CardContent className="p-4">
                <h4 className="font-medium text-foreground mb-3">Resumo</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Aniversariante</span>
                    <span className="text-green-600 font-medium">GRÁTIS</span>
                  </div>
                  {companions > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{companions}x Acompanhante(s)</span>
                      <span className="text-foreground">
                        R$ {(parseInt(upcomingEvents.find(e => e.id === selectedEvent)?.price.replace('R$ ', '') || '0') * 0.5 * companions).toFixed(0)}
                      </span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">
                      R$ {(parseInt(upcomingEvents.find(e => e.id === selectedEvent)?.price.replace('R$ ', '') || '0') * 0.5 * companions).toFixed(0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <Button
            className="w-full"
            size="lg"
            disabled={!selectedEvent || !documentUploaded || !isWithinWindow || status === 'submitting'}
            onClick={handleSubmit}
          >
            {status === 'submitting' ? (
              'Enviando...'
            ) : (
              <>
                <Gift className="w-4 h-4 mr-2" />
                Solicitar Entrada de Aniversário
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
