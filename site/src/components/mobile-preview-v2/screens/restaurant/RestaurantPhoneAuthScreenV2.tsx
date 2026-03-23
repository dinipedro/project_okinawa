import { FC, useState, useEffect, useRef } from 'react';
import { ArrowLeft, ChevronDown, RefreshCw, CheckCircle2 } from 'lucide-react';

interface RestaurantPhoneAuthScreenV2Props {
  onNavigate: (screen: string) => void;
  onBack?: () => void;
}

const countries = [
  { code: '+55', flag: '🇧🇷', name: 'Brasil' },
  { code: '+1', flag: '🇺🇸', name: 'EUA' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
];

const RestaurantPhoneAuthScreenV2: FC<RestaurantPhoneAuthScreenV2Props> = ({ onNavigate, onBack }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleSendCode = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      setResendTimer(60);
    }, 1000);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(d => d) && newOtp.join('').length === 6) {
      verifyOtp(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = (code: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsVerified(true);
      setTimeout(() => {
        onNavigate('dashboard');
      }, 1000);
    }, 1000);
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setResendTimer(60);
  };

  const isPhoneValid = phoneNumber.replace(/\D/g, '').length >= 10;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button 
          onClick={() => step === 'otp' ? setStep('phone') : onBack?.()}
          className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            {step === 'phone' ? 'Entrar com telefone' : 'Verificar código'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {step === 'phone' ? 'Enviaremos um código por SMS' : `Enviado para ${selectedCountry.code} ${phoneNumber}`}
          </p>
        </div>
      </div>

      <div className="flex-1 px-6 pt-8">
        {step === 'phone' ? (
          <>
            <div className="mb-6">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Número de telefone
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCountryPicker(!showCountryPicker)}
                  className="flex items-center gap-2 px-4 py-4 bg-muted rounded-2xl shrink-0"
                >
                  <span className="text-xl">{selectedCountry.flag}</span>
                  <span className="text-foreground font-medium">{selectedCountry.code}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>

                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="(00) 00000-0000"
                  className="flex-1 bg-muted rounded-2xl px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-lg tracking-wide"
                />
              </div>

              {showCountryPicker && (
                <div className="mt-2 bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
                  {countries.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => {
                        setSelectedCountry(country);
                        setShowCountryPicker(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors ${
                        selectedCountry.code === country.code ? 'bg-primary/5' : ''
                      }`}
                    >
                      <span className="text-xl">{country.flag}</span>
                      <span className="text-foreground">{country.name}</span>
                      <span className="text-muted-foreground ml-auto">{country.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-primary/5 rounded-2xl p-4 mb-6">
              <p className="text-sm text-primary">
                📱 Você receberá um SMS com um código de 6 dígitos para verificar seu número.
              </p>
            </div>

            <button
              onClick={handleSendCode}
              disabled={!isPhoneValid || isLoading}
              className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary/25 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                'Enviar código'
              )}
            </button>
          </>
        ) : (
          <>
            <div className="mb-8">
              <label className="text-sm font-medium text-foreground mb-4 block text-center">
                Digite o código de 6 dígitos
              </label>
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={isVerified}
                    className={`w-12 h-14 text-center text-2xl font-bold rounded-2xl border-2 transition-all focus:outline-none ${
                      isVerified
                        ? 'bg-success/10 border-success text-success'
                        : digit
                        ? 'bg-primary/5 border-primary text-foreground'
                        : 'bg-muted border-transparent text-foreground focus:border-primary'
                    }`}
                  />
                ))}
              </div>
            </div>

            {isVerified ? (
              <div className="flex flex-col items-center gap-3 mb-6">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <p className="text-success font-medium">Verificado com sucesso!</p>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center gap-3 mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
                <p className="text-muted-foreground">Verificando...</p>
              </div>
            ) : null}

            {!isVerified && (
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Não recebeu o código?</p>
                <button
                  onClick={handleResend}
                  disabled={resendTimer > 0}
                  className={`flex items-center gap-2 mx-auto font-medium ${
                    resendTimer > 0 ? 'text-muted-foreground' : 'text-primary'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  {resendTimer > 0 ? `Reenviar em ${resendTimer}s` : 'Reenviar código'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RestaurantPhoneAuthScreenV2;
