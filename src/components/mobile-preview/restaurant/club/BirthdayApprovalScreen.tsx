import { useState } from 'react';
import { useMobilePreview } from '../../context/MobilePreviewContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Gift, 
  Calendar, 
  Users, 
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileText,
  AlertTriangle,
  Cake,
  PartyPopper
} from 'lucide-react';

interface BirthdayRequest {
  id: string;
  userName: string;
  userPhoto: string;
  birthday: string;
  age: number;
  eventName: string;
  eventDate: string;
  companions: number;
  requestedAt: string;
  documentUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  verificationNotes?: string;
}

export function BirthdayApprovalScreen() {
  const { navigate } = useMobilePreview();
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<BirthdayRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showDocument, setShowDocument] = useState(false);
  
  // Simulated requests data
  const [requests, setRequests] = useState<BirthdayRequest[]>([
    {
      id: '1',
      userName: 'Marina Silva',
      userPhoto: '👩',
      birthday: '28/01/1998',
      age: 26,
      eventName: 'Friday Night Fever',
      eventDate: '31 Jan 2025',
      companions: 2,
      requestedAt: 'Há 2 horas',
      documentUrl: '/docs/rg-marina.jpg',
      status: 'pending',
    },
    {
      id: '2',
      userName: 'Pedro Santos',
      userPhoto: '👨',
      birthday: '30/01/1995',
      age: 30,
      eventName: 'Saturday Boom',
      eventDate: '01 Feb 2025',
      companions: 3,
      requestedAt: 'Há 5 horas',
      documentUrl: '/docs/cnh-pedro.jpg',
      status: 'pending',
    },
    {
      id: '3',
      userName: 'Ana Costa',
      userPhoto: '👩‍🦰',
      birthday: '25/01/1992',
      age: 33,
      eventName: 'Friday Night Fever',
      eventDate: '31 Jan 2025',
      companions: 1,
      requestedAt: 'Ontem',
      documentUrl: '/docs/rg-ana.jpg',
      status: 'approved',
      verificationNotes: 'Documento verificado. Aniversário confirmado.',
    },
    {
      id: '4',
      userName: 'Lucas Oliveira',
      userPhoto: '👨‍🦱',
      birthday: '15/02/1990',
      age: 34,
      eventName: 'Friday Night Fever',
      eventDate: '31 Jan 2025',
      companions: 2,
      requestedAt: 'Ontem',
      documentUrl: '/docs/rg-lucas.jpg',
      status: 'rejected',
      verificationNotes: 'Data de aniversário fora do período elegível (mais de 7 dias de diferença).',
    },
  ]);

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  const handleApprove = (request: BirthdayRequest) => {
    setRequests(prev => prev.map(r => 
      r.id === request.id 
        ? { ...r, status: 'approved' as const, verificationNotes: 'Documento verificado. Aniversário confirmado.' }
        : r
    ));
    setSelectedRequest(null);
  };

  const handleReject = (request: BirthdayRequest) => {
    setRequests(prev => prev.map(r => 
      r.id === request.id 
        ? { ...r, status: 'rejected' as const, verificationNotes: rejectReason || 'Solicitação rejeitada pelo staff.' }
        : r
    ));
    setSelectedRequest(null);
    setRejectReason('');
  };

  const RequestCard = ({ request, showActions = false }: { request: BirthdayRequest; showActions?: boolean }) => (
    <Card className="bg-card border-border mb-3">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* User Avatar */}
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-2xl">
            {request.userPhoto}
          </div>
          
          {/* Request Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-foreground truncate">{request.userName}</h3>
              <Badge 
                variant="outline" 
                className={
                  request.status === 'approved' 
                    ? 'bg-green-500/10 text-green-600 border-green-500/30'
                    : request.status === 'rejected'
                    ? 'bg-red-500/10 text-red-600 border-red-500/30'
                    : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30'
                }
              >
                {request.status === 'approved' ? (
                  <><CheckCircle2 className="w-3 h-3 mr-1" />Aprovado</>
                ) : request.status === 'rejected' ? (
                  <><XCircle className="w-3 h-3 mr-1" />Rejeitado</>
                ) : (
                  <><Clock className="w-3 h-3 mr-1" />Pendente</>
                )}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Cake className="w-3 h-3" />
                <span>{request.birthday} ({request.age} anos)</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{request.companions} acompanhante(s)</span>
              </div>
              <div className="flex items-center gap-1">
                <PartyPopper className="w-3 h-3" />
                <span>{request.eventName}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{request.eventDate}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Solicitado: {request.requestedAt}
            </p>

            {request.verificationNotes && (
              <div className="mt-2 p-2 rounded-lg bg-accent text-xs text-muted-foreground">
                <FileText className="w-3 h-3 inline mr-1" />
                {request.verificationNotes}
              </div>
            )}
          </div>
        </div>

        {showActions && (
          <>
            <Separator className="my-3" />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setSelectedRequest(request);
                  setShowDocument(true);
                }}
              >
                <Eye className="w-4 h-4 mr-1" />
                Ver Documento
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-red-500/30 text-red-600 hover:bg-red-500/10"
                onClick={() => setSelectedRequest(request)}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Rejeitar
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => handleApprove(request)}
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Aprovar
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  // Rejection Modal
  if (selectedRequest && !showDocument) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button 
            onClick={() => setSelectedRequest(null)} 
            className="p-2 -ml-2 hover:bg-accent rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Rejeitar Solicitação</h1>
        </div>

        <div className="flex-1 p-4">
          <Card className="bg-card border-border mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-2xl">
                  {selectedRequest.userPhoto}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{selectedRequest.userName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.birthday} • {selectedRequest.eventName}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mb-4">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Motivo da Rejeição
            </label>
            <Textarea
              placeholder="Descreva o motivo da rejeição..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <p className="text-xs text-yellow-700 dark:text-yellow-500">
                O usuário será notificado sobre a rejeição e o motivo informado.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setSelectedRequest(null)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={() => handleReject(selectedRequest)}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Confirmar Rejeição
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Document View Modal
  if (selectedRequest && showDocument) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button 
            onClick={() => {
              setShowDocument(false);
              setSelectedRequest(null);
            }} 
            className="p-2 -ml-2 hover:bg-accent rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Verificar Documento</h1>
        </div>

        <div className="flex-1 p-4">
          <Card className="bg-card border-border mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-2xl">
                  {selectedRequest.userPhoto}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{selectedRequest.userName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Aniversário declarado: {selectedRequest.birthday}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Simulated Document Image */}
          <div className="aspect-[3/4] bg-accent rounded-xl flex items-center justify-center mb-4 border border-border">
            <div className="text-center p-6">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Documento de identificação
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                (Simulação - RG/CNH do usuário)
              </p>
              <div className="mt-4 p-3 bg-background rounded-lg">
                <p className="text-sm font-medium text-foreground">
                  Data de Nascimento Verificada:
                </p>
                <p className="text-lg font-bold text-primary mt-1">
                  {selectedRequest.birthday}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-red-500/30 text-red-600 hover:bg-red-500/10"
              onClick={() => {
                setShowDocument(false);
              }}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Rejeitar
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                handleApprove(selectedRequest);
                setShowDocument(false);
              }}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Aprovar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button 
          onClick={() => navigate('door-control')} 
          className="p-2 -ml-2 hover:bg-accent rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-foreground">Aniversários</h1>
          <p className="text-xs text-muted-foreground">
            {pendingRequests.length} pendente(s) para análise
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Gift className="w-5 h-5 text-primary" />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 mx-4 mt-4">
          <TabsTrigger value="pending" className="relative">
            Pendentes
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Aprovados</TabsTrigger>
          <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="pending" className="mt-0">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Nenhuma solicitação pendente</p>
              </div>
            ) : (
              pendingRequests.map((request) => (
                <RequestCard key={request.id} request={request} showActions />
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="mt-0">
            {approvedRequests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhuma solicitação aprovada</p>
              </div>
            ) : (
              approvedRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="mt-0">
            {rejectedRequests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhuma solicitação rejeitada</p>
              </div>
            ) : (
              rejectedRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
