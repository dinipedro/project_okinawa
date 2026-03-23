import { useState } from "react";
import { Smartphone, ChevronLeft, ChevronRight, Store, User, Map, Settings } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";
import { MobilePreviewProvider, useMobilePreview } from "@/components/mobile-preview/context/MobilePreviewContext";
import { ServiceTypeSelector } from "@/components/mobile-preview/ServiceTypeSelector";
import { OnboardingScreen } from "@/components/mobile-preview/OnboardingScreen";
import { LoginScreen } from "@/components/mobile-preview/LoginScreen";
import { HomeScreen } from "@/components/mobile-preview/HomeScreen";
import { SearchScreen } from "@/components/mobile-preview/SearchScreen";
import { ProfileScreen } from "@/components/mobile-preview/ProfileScreen";
import { RestaurantDetailScreen } from "@/components/mobile-preview/client/RestaurantDetailScreen";
import { CartScreen } from "@/components/mobile-preview/client/CartScreen";
import { CheckoutScreen } from "@/components/mobile-preview/client/CheckoutScreen";
import { OrdersScreen } from "@/components/mobile-preview/client/OrdersScreen";
import { FavoritesScreen } from "@/components/mobile-preview/client/FavoritesScreen";
import { WalletScreen } from "@/components/mobile-preview/client/WalletScreen";
import { ReservationsScreen } from "@/components/mobile-preview/client/ReservationsScreen";
import { ReservationDetailScreen } from "@/components/mobile-preview/client/ReservationDetailScreen";
import { SharedOrderScreen } from "@/components/mobile-preview/client/SharedOrderScreen";
import { SplitPaymentScreen } from "@/components/mobile-preview/client/SplitPaymentScreen";
import { TipScreen } from "@/components/mobile-preview/client/TipScreen";
import { LoyaltyScreen } from "@/components/mobile-preview/client/LoyaltyScreen";
import { LoyaltyDetailScreen } from "@/components/mobile-preview/client/LoyaltyDetailScreen";
import { SettingsScreen } from "@/components/mobile-preview/client/SettingsScreen";
import { QRScannerScreen } from "@/components/mobile-preview/client/QRScannerScreen";
import { SupportScreen } from "@/components/mobile-preview/client/SupportScreen";
import { NotificationsScreen } from "@/components/mobile-preview/client/NotificationsScreen";
import { CouponsScreen } from "@/components/mobile-preview/client/CouponsScreen";
import { RatingScreen } from "@/components/mobile-preview/client/RatingScreen";
import { AddressesScreen } from "@/components/mobile-preview/client/AddressesScreen";
import { ExploreScreen } from "@/components/mobile-preview/client/ExploreScreen";
import { VirtualQueueScreen } from "@/components/mobile-preview/client/VirtualQueueScreen";
import { CallWaiterScreen } from "@/components/mobile-preview/client/CallWaiterScreen";
import { DishBuilderScreen } from "@/components/mobile-preview/client/DishBuilderScreen";
import { NewReservationScreen } from "@/components/mobile-preview/client/NewReservationScreen";
import { TrackLocationScreen } from "@/components/mobile-preview/client/TrackLocationScreen";
import { SplitByItemScreen } from "@/components/mobile-preview/client/SplitByItemScreen";
import { LoyaltyLeaderboardScreen } from "@/components/mobile-preview/client/LoyaltyLeaderboardScreen";
import { RestaurantDashboardScreen } from "@/components/mobile-preview/restaurant/RestaurantDashboardScreen";
import { RestaurantOrdersScreen } from "@/components/mobile-preview/restaurant/RestaurantOrdersScreen";
import { RestaurantMenuScreen } from "@/components/mobile-preview/restaurant/RestaurantMenuScreen";
import { KitchenDisplayScreen } from "@/components/mobile-preview/restaurant/KitchenDisplayScreen";
import { TablesScreen } from "@/components/mobile-preview/restaurant/TablesScreen";
import { WaiterScreen } from "@/components/mobile-preview/restaurant/WaiterScreen";
import { FinancialScreen } from "@/components/mobile-preview/restaurant/FinancialScreen";
import { RestaurantSettingsScreen } from "@/components/mobile-preview/restaurant/RestaurantSettingsScreen";
import { ReportsScreen } from "@/components/mobile-preview/restaurant/ReportsScreen";
import { ReviewsScreen } from "@/components/mobile-preview/restaurant/ReviewsScreen";
import { PromotionsScreen } from "@/components/mobile-preview/restaurant/PromotionsScreen";
import { RestaurantReservationsScreen } from "@/components/mobile-preview/restaurant/RestaurantReservationsScreen";
import { TipsManagementScreen } from "@/components/mobile-preview/restaurant/TipsManagementScreen";
import { OrderPaymentTrackingScreen } from "@/components/mobile-preview/restaurant/OrderPaymentTrackingScreen";
import { LoyaltyManagementScreen } from "@/components/mobile-preview/restaurant/LoyaltyManagementScreen";
import { BarKDSScreen } from "@/components/mobile-preview/restaurant/BarKDSScreen";
import { MaitreScreen } from "@/components/mobile-preview/restaurant/MaitreScreen";
import { ServiceTypeConfigScreen } from "@/components/mobile-preview/restaurant/ServiceTypeConfigScreen";
import { RoleDashboardScreen } from "@/components/mobile-preview/restaurant/RoleDashboardScreen";
import { StaffManagementScreen } from "@/components/mobile-preview/restaurant/StaffManagementScreen";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const clientScreens = [
  { id: "onboarding", name: "Onboarding", component: OnboardingScreen },
  { id: "login", name: "Login", component: LoginScreen },
  { id: "home", name: "Home", component: HomeScreen },
  { id: "explore", name: "Explorar", component: ExploreScreen },
  { id: "search", name: "Busca", component: SearchScreen },
  { id: "restaurant", name: "Restaurante", component: RestaurantDetailScreen },
  { id: "new-reservation", name: "Nova Reserva", component: NewReservationScreen },
  { id: "virtual-queue", name: "Fila Virtual", component: VirtualQueueScreen },
  { id: "call-waiter", name: "Chamar Garçom", component: CallWaiterScreen },
  { id: "dish-builder", name: "Monte seu Prato", component: DishBuilderScreen },
  { id: "track-location", name: "Rastrear", component: TrackLocationScreen },
  { id: "cart", name: "Carrinho", component: CartScreen },
  { id: "checkout", name: "Checkout", component: CheckoutScreen },
  { id: "split-by-item", name: "Split por Item", component: SplitByItemScreen },
  { id: "orders", name: "Pedidos", component: OrdersScreen },
  { id: "shared-order", name: "Pedido Compartilhado", component: SharedOrderScreen },
  { id: "split-payment", name: "Split Payment", component: SplitPaymentScreen },
  { id: "notifications", name: "Notificações", component: NotificationsScreen },
  { id: "favorites", name: "Favoritos", component: FavoritesScreen },
  { id: "wallet", name: "Carteira", component: WalletScreen },
  { id: "coupons", name: "Cupons", component: CouponsScreen },
  { id: "reservations", name: "Reservas", component: ReservationsScreen },
  { id: "reservation-detail", name: "Detalhe Reserva", component: ReservationDetailScreen },
  { id: "loyalty", name: "Fidelidade", component: LoyaltyScreen },
  { id: "loyalty-detail", name: "Fidelidade Detalhe", component: LoyaltyDetailScreen },
  { id: "loyalty-leaderboard", name: "Leaderboard", component: LoyaltyLeaderboardScreen },
  { id: "tip", name: "Gorjeta", component: TipScreen },
  { id: "rating", name: "Avaliação", component: RatingScreen },
  { id: "addresses", name: "Endereços", component: AddressesScreen },
  { id: "profile", name: "Perfil", component: ProfileScreen },
  { id: "settings", name: "Config", component: SettingsScreen },
  { id: "qr", name: "QR Scanner", component: QRScannerScreen },
  { id: "support", name: "Suporte", component: SupportScreen },
];

const restaurantScreens = [
  { id: "dashboard", name: "Dashboard", component: RestaurantDashboardScreen },
  { id: "role-dashboard", name: "Dashboard por Role", component: RoleDashboardScreen },
  { id: "service-config", name: "Config. Serviço", component: ServiceTypeConfigScreen },
  { id: "orders", name: "Pedidos", component: RestaurantOrdersScreen },
  { id: "order-payment", name: "Split Payment", component: OrderPaymentTrackingScreen },
  { id: "kds", name: "KDS Cozinha", component: KitchenDisplayScreen },
  { id: "bar-kds", name: "KDS Bar", component: BarKDSScreen },
  { id: "maitre", name: "Maitre", component: MaitreScreen },
  { id: "menu", name: "Cardápio", component: RestaurantMenuScreen },
  { id: "tables", name: "Mesas", component: TablesScreen },
  { id: "reservations", name: "Reservas", component: RestaurantReservationsScreen },
  { id: "waiter", name: "Garçom", component: WaiterScreen },
  { id: "staff", name: "Equipe", component: StaffManagementScreen },
  { id: "tips", name: "Gorjetas", component: TipsManagementScreen },
  { id: "loyalty", name: "Fidelidade", component: LoyaltyManagementScreen },
  { id: "financial", name: "Financeiro", component: FinancialScreen },
  { id: "reports", name: "Relatórios", component: ReportsScreen },
  { id: "reviews", name: "Avaliações", component: ReviewsScreen },
  { id: "promotions", name: "Promoções", component: PromotionsScreen },
  { id: "settings", name: "Config", component: RestaurantSettingsScreen },
];

const MobilePreviewContent = () => {
  const [activeApp, setActiveApp] = useState<"client" | "restaurant">("client");
  const [currentScreen, setCurrentScreen] = useState(0);
  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const { serviceType } = useMobilePreview();

  const screens = activeApp === "client" ? clientScreens : restaurantScreens;

  const nextScreen = () => {
    setCurrentScreen((prev) => (prev + 1) % screens.length);
  };

  const prevScreen = () => {
    setCurrentScreen((prev) => (prev - 1 + screens.length) % screens.length);
  };

  const switchApp = (app: "client" | "restaurant") => {
    setActiveApp(app);
    setCurrentScreen(0);
  };

  const CurrentScreenComponent = screens[currentScreen].component;

  if (showServiceSelector) {
    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="font-display text-xl font-bold text-primary-foreground">O</span>
              </div>
              <div>
                <span className="font-display text-xl font-bold">Okinawa</span>
                <span className="text-xs text-muted-foreground ml-2">Service Type</span>
              </div>
            </div>
            <button
              onClick={() => setShowServiceSelector(false)}
              className="px-4 py-2 bg-muted rounded-full text-sm"
            >
              Voltar ao Preview
            </button>
          </div>
        </header>
        <main className="pt-24 pb-12 px-6">
          <ServiceTypeSelector />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Mobile Preview"
        description="Preview interativo do app Okinawa com todas as telas de cliente e restaurante."
        canonical="/mobile"
        noIndex
      />
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="font-display text-xl font-bold text-primary-foreground">O</span>
            </div>
            <div>
              <span className="font-display text-xl font-bold">Okinawa</span>
              <span className="text-xs text-muted-foreground ml-2">Mobile Preview</span>
            </div>
          </div>
          
          {/* App Switcher */}
          <div className="flex items-center gap-2 bg-muted p-1 rounded-full">
            <button
              onClick={() => switchApp("client")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeApp === "client" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              <User className="h-4 w-4" />
              Client
            </button>
            <button
              onClick={() => switchApp("restaurant")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeApp === "restaurant" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground"
              }`}
            >
              <Store className="h-4 w-4" />
              Restaurant
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowServiceSelector(true)}
              className="flex items-center gap-2 px-3 py-2 bg-muted rounded-full text-sm hover:bg-muted/80 transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">{serviceType.replace(/_/g, ' ')}</span>
            </button>
            <Smartphone className="h-5 w-5 text-primary" />
            <ThemeToggle size="sm" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Screen Navigation */}
          <div className="flex items-center justify-center gap-2 mb-8 flex-wrap max-h-32 overflow-y-auto">
            {screens.map((screen, index) => (
              <button
                key={screen.id}
                onClick={() => setCurrentScreen(index)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                  currentScreen === index
                    ? activeApp === "client" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {screen.name}
              </button>
            ))}
          </div>

          {/* Phone Mockup */}
          <div className="flex items-center justify-center gap-8">
            <button onClick={prevScreen} className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors">
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Phone Frame */}
            <div className="relative">
              <div className="relative w-[375px] h-[812px] bg-foreground rounded-[50px] p-3 shadow-2xl">
                <div className="relative w-full h-full bg-background rounded-[40px] overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-12 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-between px-8">
                    <span className="text-xs font-medium">9:41</span>
                    <div className="absolute left-1/2 -translate-x-1/2 w-32 h-7 bg-foreground rounded-full" />
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-2.5 border border-foreground rounded-sm relative">
                        <div className="absolute inset-0.5 bg-foreground rounded-sm" style={{ width: "70%" }} />
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 pt-12 overflow-hidden">
                    <CurrentScreenComponent />
                  </div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-foreground/30 rounded-full" />
                </div>
              </div>

              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center">
                <span className="text-lg font-display font-bold">{screens[currentScreen].name}</span>
                <span className="text-sm text-muted-foreground ml-2">{currentScreen + 1} / {screens.length}</span>
              </div>
            </div>

            <button onClick={nextScreen} className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors">
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

const MobilePreview = () => {
  return (
    <MobilePreviewProvider>
      <MobilePreviewContent />
    </MobilePreviewProvider>
  );
};

export default MobilePreview;
