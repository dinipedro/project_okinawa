import { FC, useState } from 'react';
import { Fingerprint, Check } from 'lucide-react';

interface BiometricEnrollmentScreenV2Props {
  onNavigate: (screen: string) => void;
  onBack?: () => void;
}

const BiometricEnrollmentScreenV2: FC<BiometricEnrollmentScreenV2Props> = ({ onNavigate }) => {
  const [step, setStep] = useState<'prompt' | 'enrolling' | 'success'>('prompt');

  const handleEnroll = () => {
    setStep('enrolling');
    setTimeout(() => {
      setStep('success');
    }, 1500);
  };

  const handleSkip = () => {
    onNavigate('home');
  };

  const handleComplete = () => {
    onNavigate('home');
  };

  // Success State
  if (step === 'success') {
    return (
      <div className="flex flex-col h-full bg-background items-center justify-center px-8">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-6">
          <Check className="w-10 h-10 text-success" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-2 text-center">
          Tudo pronto!
        </h2>
        <p className="text-muted-foreground text-center text-sm mb-10">
          Agora você pode entrar rapidamente usando biometria
        </p>
        <button
          onClick={handleComplete}
          className="w-full h-14 bg-foreground text-background font-medium rounded-2xl transition-all active:scale-[0.98]"
        >
          Começar
        </button>
      </div>
    );
  }

  // Enrolling State
  if (step === 'enrolling') {
    return (
      <div className="flex flex-col h-full bg-background items-center justify-center px-8">
        <div className="relative w-28 h-28 mb-8">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <Fingerprint className="w-14 h-14 text-primary-foreground" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Escaneando...
        </h2>
        <p className="text-muted-foreground text-sm">
          Mantenha seu dedo no sensor
        </p>
      </div>
    );
  }

  // Prompt State
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Skip */}
      <div className="flex justify-end px-5 py-4">
        <button
          onClick={handleSkip}
          className="text-muted-foreground text-sm font-medium"
        >
          Pular
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Icon */}
        <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-[28px] flex items-center justify-center mb-8 shadow-lg shadow-primary/20">
          <Fingerprint className="w-12 h-12 text-primary-foreground" />
        </div>

        <h1 className="text-2xl font-semibold text-foreground mb-2 text-center">
          Acesso rápido
        </h1>
        <p className="text-muted-foreground text-center text-sm mb-10 max-w-[260px]">
          Use Face ID ou Touch ID para entrar de forma segura e instantânea
        </p>
      </div>

      {/* Bottom */}
      <div className="px-6 pb-10 space-y-3">
        <button
          onClick={handleEnroll}
          className="w-full h-14 bg-foreground text-background font-medium rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <Fingerprint className="w-5 h-5" />
          Ativar biometria
        </button>
        <button
          onClick={handleSkip}
          className="w-full h-12 text-muted-foreground font-medium text-sm"
        >
          Configurar depois
        </button>
      </div>
    </div>
  );
};

export default BiometricEnrollmentScreenV2;
