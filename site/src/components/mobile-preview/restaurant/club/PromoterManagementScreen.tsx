import { useState } from 'react';
import { useMobilePreview } from '../../context/MobilePreviewContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Users, 
  TrendingUp,
  DollarSign,
  Search,
  Plus,
  Star,
  Copy,
  CheckCircle2,
  Clock,
  Trophy,
  Ticket,
  Percent,
  MoreVertical,
  Phone,
  Mail
} from 'lucide-react';

interface Promoter {
  id: string;
  name: string;
  nickname: string;
  code: string;
  photo: string;
  status: 'active' | 'inactive' | 'pending';
  commissionRate: number;
  totalSales: number;
  totalRevenue: number;
  pendingCommission: number;
  rank: number;
}

export function PromoterManagementScreen() {
  const { navigate } = useMobilePreview();
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPromoter, setSelectedPromoter] = useState<Promoter | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Simulated promoters data
  const promoters: Promoter[] = [
    {
      id: '1',
      name: 'Carlos Mendes',
      nickname: 'DJ Carlos',
      code: 'CAR123',
      photo: '🎧',
      status: 'active',
      commissionRate: 15,
      totalSales: 234,
      totalRevenue: 14580,
      pendingCommission: 450,
      rank: 1,
    },
    {
      id: '2',
      name: 'Fernanda Lima',
      nickname: 'Fer Promoter',
      code: 'FER456',
      photo: '👩‍🎤',
      status: 'active',
      commissionRate: 12,
      totalSales: 189,
      totalRevenue: 11340,
      pendingCommission: 280,
      rank: 2,
    },
    {
      id: '3',
      name: 'Bruno Costa',
      nickname: 'Bruno Events',
      code: 'BRU789',
      photo: '🎉',
      status: 'active',
      commissionRate: 10,
      totalSales: 156,
      totalRevenue: 9360,
      pendingCommission: 180,
      rank: 3,
    },
    {
      id: '4',
      name: 'Ana Souza',
      nickname: 'Ana VIP',
      code: 'ANA321',
      photo: '💃',
      status: 'pending',
      commissionRate: 10,
      totalSales: 0,
      totalRevenue: 0,
      pendingCommission: 0,
      rank: 0,
    },
  ];

  const activePromoters = promoters.filter(p => p.status === 'active');
  const pendingPromoters = promoters.filter(p => p.status === 'pending');
  const inactivePromoters = promoters.filter(p => p.status === 'inactive');

  // Summary stats
  const totalRevenue = promoters.reduce((sum, p) => sum + p.totalRevenue, 0);
  const totalSales = promoters.reduce((sum, p) => sum + p.totalSales, 0);
  const pendingCommissions = promoters.reduce((sum, p) => sum + p.pendingCommission, 0);

  const handleCopyCode = (code: string) => {
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: '🥇', color: 'bg-yellow-500/20 text-yellow-600' };
    if (rank === 2) return { icon: '🥈', color: 'bg-gray-400/20 text-gray-500' };
    if (rank === 3) return { icon: '🥉', color: 'bg-orange-500/20 text-orange-600' };
    return null;
  };

  // Promoter Detail View
  if (selectedPromoter) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button 
            onClick={() => setSelectedPromoter(null)} 
            className="p-2 -ml-2 hover:bg-accent rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Detalhes do Promoter</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Profile Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-3xl">
              {selectedPromoter.photo}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">{selectedPromoter.name}</h2>
                {getRankBadge(selectedPromoter.rank) && (
                  <span>{getRankBadge(selectedPromoter.rank)?.icon}</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{selectedPromoter.nickname}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="font-mono">
                  {selectedPromoter.code}
                </Badge>
                <button 
                  onClick={() => handleCopyCode(selectedPromoter.code)}
                  className="p-1 hover:bg-accent rounded"
                >
                  {copiedCode === selectedPromoter.code ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <Ticket className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{selectedPromoter.totalSales}</p>
                <p className="text-xs text-muted-foreground">Vendas Totais</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <DollarSign className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">
                  R$ {selectedPromoter.totalRevenue.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-muted-foreground">Receita Gerada</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <Percent className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{selectedPromoter.commissionRate}%</p>
                <p className="text-xs text-muted-foreground">Comissão</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <Clock className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">
                  R$ {selectedPromoter.pendingCommission}
                </p>
                <p className="text-xs text-muted-foreground">Pendente</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Sales */}
          <h3 className="font-medium text-foreground mb-3">Vendas Recentes</h3>
          <Card className="bg-card border-border mb-4">
            <CardContent className="p-0 divide-y divide-border">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                      <Ticket className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {i === 0 ? '3 Entradas' : i === 1 ? 'Camarote VIP' : '2 Entradas'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {i === 0 ? 'Hoje, 14:30' : i === 1 ? 'Ontem, 22:15' : 'Há 2 dias'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      R$ {i === 0 ? '180' : i === 1 ? '1.500' : '120'}
                    </p>
                    <p className="text-xs text-green-500">
                      +R$ {i === 0 ? '27' : i === 1 ? '225' : '18'}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button className="w-full" variant="outline">
              <DollarSign className="w-4 h-4 mr-2" />
              Pagar Comissões Pendentes
            </Button>
            <Button className="w-full" variant="outline">
              <Percent className="w-4 h-4 mr-2" />
              Editar Taxa de Comissão
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
          <h1 className="text-lg font-semibold text-foreground">Promoters</h1>
          <p className="text-xs text-muted-foreground">
            {activePromoters.length} ativo(s)
          </p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Novo
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="p-4 pb-2">
        <div className="grid grid-cols-3 gap-2">
          <Card className="bg-card border-border">
            <CardContent className="p-3 text-center">
              <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{totalSales}</p>
              <p className="text-[10px] text-muted-foreground">Vendas</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-3 text-center">
              <DollarSign className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">
                {(totalRevenue / 1000).toFixed(1)}k
              </p>
              <p className="text-[10px] text-muted-foreground">Receita</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-3 text-center">
              <Clock className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">
                R$ {pendingCommissions}
              </p>
              <p className="text-[10px] text-muted-foreground">Pendente</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar promoter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 mx-4">
          <TabsTrigger value="active" className="relative">
            Ativos
            <span className="ml-1 text-xs text-muted-foreground">({activePromoters.length})</span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            Pendentes
            {pendingPromoters.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 text-white rounded-full text-[10px] flex items-center justify-center">
                {pendingPromoters.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="leaderboard">
            <Trophy className="w-4 h-4" />
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="active" className="mt-0 space-y-3">
            {activePromoters
              .filter(p => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.code.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((promoter) => (
                <Card 
                  key={promoter.id} 
                  className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setSelectedPromoter(promoter)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-2xl relative">
                        {promoter.photo}
                        {getRankBadge(promoter.rank) && (
                          <span className="absolute -top-1 -right-1 text-sm">
                            {getRankBadge(promoter.rank)?.icon}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-foreground truncate">{promoter.name}</h3>
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">
                            Ativo
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{promoter.nickname}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="font-mono bg-accent px-1.5 py-0.5 rounded">
                            {promoter.code}
                          </span>
                          <span>{promoter.totalSales} vendas</span>
                          <span className="text-green-500">
                            R$ {promoter.pendingCommission} pendente
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="pending" className="mt-0 space-y-3">
            {pendingPromoters.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhuma aprovação pendente</p>
              </div>
            ) : (
              pendingPromoters.map((promoter) => (
                <Card key={promoter.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-2xl">
                        {promoter.photo}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{promoter.name}</h3>
                        <p className="text-sm text-muted-foreground">{promoter.nickname}</p>
                      </div>
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                        <Clock className="w-3 h-3 mr-1" />
                        Pendente
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        Rejeitar
                      </Button>
                      <Button size="sm" className="flex-1">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Aprovar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-0">
            <h3 className="font-medium text-foreground mb-3">Ranking do Mês</h3>
            <div className="space-y-2">
              {activePromoters
                .sort((a, b) => a.rank - b.rank)
                .map((promoter, index) => (
                  <Card 
                    key={promoter.id} 
                    className={`bg-card border-border ${index < 3 ? 'border-primary/30' : ''}`}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="w-8 text-center font-bold text-lg">
                        {getRankBadge(promoter.rank)?.icon || `#${promoter.rank}`}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-xl">
                        {promoter.photo}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{promoter.name}</p>
                        <p className="text-xs text-muted-foreground">{promoter.totalSales} vendas</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          R$ {promoter.totalRevenue.toLocaleString('pt-BR')}
                        </p>
                        <p className="text-xs text-muted-foreground">receita</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
