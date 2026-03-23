import { FC, useState, useEffect, useRef } from 'react';
import { ArrowLeft, ChevronDown, Check } from 'lucide-react';

interface PhoneAuthScreenV2Props {
  onNavigate: (screen: string) => void;
  onBack?: () => void;
}

const countries = [
  { code: '+55', flag: '🇧🇷', name: 'Brasil' },
  { code: '+1', flag: '🇺🇸', name: 'EUA' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
];

const PhoneAuthScreenV2: FC<PhoneAuthScreenV2Props> = ({ onNavigate, onBack }) => {
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
    }, 800);
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
        onNavigate('biometric-enrollment');
      }, 800);
    }, 800);
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setResendTimer(60);
  };

  const isPhoneValid = phoneNumber.replace(/\D/g, '').length >= 10;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4">
        <button 
          onClick={() => step === 'otp' ? setStep('phone') : onBack?.()}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </div>

      <div className="flex-1 px-6">
        {step === 'phone' ? (
          <>
            {/* Title */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                Qual é seu número?
              </h1>
              <p className="text-muted-foreground text-sm">
                Enviaremos um código de verificação
              </p>
            </div>

            {/* Phone Input */}
            <div className="space-y-3">
              {/* Country Selector */}
              <button
                onClick={() => setShowCountryPicker(!showCountryPicker)}
                className="w-full flex items-center justify-between px-4 py-3.5 bg-muted rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{selectedCountry.flag}</span>
                  <span className="text-foreground font-medium">{selectedCountry.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{selectedCountry.code}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>

              {/* Country Dropdown */}
              {showCountryPicker && (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  {countries.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => {
                        setSelectedCountry(country);
                        setShowCountryPicker(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                        selectedCountry.code === country.code ? 'bg-primary/5' : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{country.flag}</span>
                        <span className="text-foreground">{country.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{country.code}</span>
                        {selectedCountry.code === country.code && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Phone Number Input */}
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
                className="w-full bg-muted rounded-xl px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-lg tracking-wide font-medium"
              />
            </div>
          </>
        ) : (
          <>
            {/* OTP Step */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                Código de verificação
              </h1>
              <p className="text-muted-foreground text-sm">
                Enviado para {selectedCountry.code} {phoneNumber}
              </p>
            </div>

            {/* OTP Input */}
            <div className="flex justify-between gap-2 mb-8">
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
                  className={`w-12 h-14 text-center text-xl font-semibold rounded-xl border-2 transition-all focus:outline-none ${
                    isVerified
                      ? 'bg-success/10 border-success text-success'
                      : digit
                      ? 'bg-primary/5 border-primary text-foreground'
                      : 'bg-muted border-transparent text-foreground focus:border-primary/50'
                  }`}
                />
              ))}
            </div>

            {/* Status */}
            {isVerified ? (
              <div className="flex items-center justify-center gap-2 text-success mb-6">
                <Check className="w-5 h-5" />
                <span className="font-medium">Verificado</span>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
                <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                <span>Verificando...</span>
              </div>
            ) : (
              <div className="text-center mb-6">
                <button
                  onClick={handleResend}
                  disabled={resendTimer > 0}
                  className={`text-sm font-medium ${
                    resendTimer > 0 ? 'text-muted-foreground' : 'text-primary'
                  }`}
                >
                  {resendTimer > 0 ? `Reenviar em ${resendTimer}s` : 'Reenviar código'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Button */}
      {step === 'phone' && (
        <div className="px-6 pb-10">
          <button
            onClick={handleSendCode}
            disabled={!isPhoneValid || isLoading}
            className="w-full h-14 bg-foreground text-background font-medium rounded-2xl flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-40"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
            ) : (
              'Continuar'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default PhoneAuthScreenV2;
