import { FC, useState } from 'react';
import { Fingerprint, Smartphone, ChevronRight } from 'lucide-react';

interface WelcomeScreenV2Props {
  onNavigate: (screen: string) => void;
}

const WelcomeScreenV2: FC<WelcomeScreenV2Props> = ({ onNavigate }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleBiometricAuth = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      onNavigate('home');
    }, 1500);
  };

  const handlePhoneAuth = () => {
    onNavigate('phone-auth');
  };

  const handleSocialAuth = (provider: 'google' | 'apple') => {
    onNavigate('home');
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Minimal Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Logo */}
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
          <span className="text-4xl font-bold text-primary-foreground">O</span>
        </div>
        
        <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-1">
          Okinawa
        </h1>
        <p className="text-muted-foreground text-sm mb-12">
          Experiências gastronômicas
        </p>

        {/* Auth Options */}
        <div className="w-full space-y-3">
          {/* Biometric - Primary */}
          <button
            onClick={handleBiometricAuth}
            disabled={isAuthenticating}
            className="w-full h-14 bg-foreground text-background rounded-2xl flex items-center justify-center gap-3 font-medium transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {isAuthenticating ? (
              <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
            ) : (
              <>
                <Fingerprint className="w-5 h-5" />
                Entrar com Face ID
              </>
            )}
          </button>

          {/* Phone */}
          <button
            onClick={handlePhoneAuth}
            className="w-full h-14 bg-muted text-foreground rounded-2xl flex items-center justify-center gap-3 font-medium transition-all hover:bg-muted/80"
          >
            <Smartphone className="w-5 h-5" />
            Continuar com telefone
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 w-full my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">ou</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Social Buttons */}
        <div className="flex gap-3 w-full">
          <button 
            onClick={() => handleSocialAuth('google')}
            className="flex-1 h-12 bg-card border border-border rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-foreground hover:border-primary/30 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <button 
            onClick={() => handleSocialAuth('apple')}
            className="flex-1 h-12 bg-card border border-border rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-foreground hover:border-primary/30 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Apple
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 pb-10 pt-4">
        <p className="text-center text-xs text-muted-foreground">
          Ao continuar, você concorda com nossos{' '}
          <button className="text-foreground font-medium">Termos</button>
          {' '}e{' '}
          <button className="text-foreground font-medium">Privacidade</button>
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreenV2;
