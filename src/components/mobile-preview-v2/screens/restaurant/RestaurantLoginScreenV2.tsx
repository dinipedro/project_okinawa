import { FC, useState } from 'react';
import { Fingerprint, Smartphone, ArrowRight, Sparkles, Store } from 'lucide-react';

interface RestaurantLoginScreenV2Props {
  onNavigate: (screen: string) => void;
}

const RestaurantLoginScreenV2: FC<RestaurantLoginScreenV2Props> = ({ onNavigate }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleBiometricAuth = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      onNavigate('dashboard');
    }, 1500);
  };

  const handlePhoneAuth = () => {
    onNavigate('phone-auth');
  };

  const handleSocialAuth = () => {
    onNavigate('dashboard');
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      {/* Hero Section */}
      <div className="relative h-64 shrink-0 bg-gradient-to-br from-primary via-primary/90 to-accent overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 -right-10 w-40 h-40 bg-primary-foreground/10 rounded-full blur-xl" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-accent/20 rounded-full blur-2xl" />
        
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full pb-8">
          <div className="w-24 h-24 bg-background rounded-[32px] flex items-center justify-center shadow-2xl shadow-black/30 mb-4">
            <Store className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-primary-foreground text-2xl font-bold tracking-tight">Okinawa Business</h1>
          <p className="text-primary-foreground/80 text-sm mt-1">Portal do Restaurante</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">Acesso Staff</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-1">
          Bem-vindo!
        </h2>
        <p className="text-muted-foreground mb-6">
          Acesse o painel do seu restaurante
        </p>

        {/* Biometric Button */}
        <button
          onClick={handleBiometricAuth}
          disabled={isAuthenticating}
          className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary/25 active:scale-[0.98] transition-all mb-4 disabled:opacity-70"
        >
          {isAuthenticating ? (
            <>
              <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Autenticando...
            </>
          ) : (
            <>
              <div className="w-10 h-10 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
                <Fingerprint className="w-5 h-5" />
              </div>
              Entrar com biometria
              <ArrowRight className="w-5 h-5 ml-auto" />
            </>
          )}
        </button>

        {/* Phone Auth */}
        <button
          onClick={handlePhoneAuth}
          className="w-full py-4 bg-muted text-foreground font-semibold rounded-2xl flex items-center justify-center gap-3 hover:bg-muted/80 transition-colors mb-6"
        >
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>
          Continuar com telefone
          <ArrowRight className="w-5 h-5 ml-auto text-muted-foreground" />
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-muted-foreground">ou continue com</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Social buttons */}
        <div className="flex gap-3">
          <button 
            onClick={handleSocialAuth}
            className="flex-1 py-3.5 bg-muted rounded-2xl flex items-center justify-center gap-2 font-medium text-foreground hover:bg-muted/80 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <button 
            onClick={handleSocialAuth}
            className="flex-1 py-3.5 bg-foreground text-background rounded-2xl flex items-center justify-center gap-2 font-medium hover:opacity-90 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Apple
          </button>
        </div>
      </div>

      {/* Bottom */}
      <div className="px-6 pb-8 pt-4">
        <p className="text-center text-sm text-muted-foreground">
          Precisa de ajuda?{' '}
          <button className="text-primary font-medium">Fale com o suporte</button>
        </p>
      </div>
    </div>
  );
};

export default RestaurantLoginScreenV2;
