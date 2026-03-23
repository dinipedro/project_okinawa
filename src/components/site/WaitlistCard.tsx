import React, { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import PhoneInput from '@/components/ui/phone-input';

const BR_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
] as const;

const BR_STATE_NAMES: Record<string, string> = {
  AC:'Acre',AL:'Alagoas',AP:'Amapá',AM:'Amazonas',BA:'Bahia',CE:'Ceará',
  DF:'Distrito Federal',ES:'Espírito Santo',GO:'Goiás',MA:'Maranhão',
  MT:'Mato Grosso',MS:'Mato Grosso do Sul',MG:'Minas Gerais',PA:'Pará',
  PB:'Paraíba',PR:'Paraná',PE:'Pernambuco',PI:'Piauí',RJ:'Rio de Janeiro',
  RN:'Rio Grande do Norte',RS:'Rio Grande do Sul',RO:'Rondônia',RR:'Roraima',
  SC:'Santa Catarina',SP:'São Paulo',SE:'Sergipe',TO:'Tocantins',
};

interface WaitlistCardProps {
  compact?: boolean;
  className?: string;
}

const WaitlistCard: React.FC<WaitlistCardProps> = ({ compact = false, className = '' }) => {
  const { lang, t } = useLang();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const statePlaceholder = lang === 'pt' ? 'Estado' : lang === 'es' ? 'Estado/Provincia' : 'State';
  const cityPlaceholder = lang === 'pt' ? 'Cidade' : lang === 'es' ? 'Ciudad' : 'City';
  const phonePlaceholder = lang === 'pt' ? 'WhatsApp' : lang === 'es' ? 'WhatsApp' : 'WhatsApp';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setStatus('loading');
    setErrorMsg('');

    const { error } = await supabase
      .from('waitlist')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
        state: state.trim() || null,
        city: city.trim() || null,
      });

    if (error) {
      if (error.code === '23505') {
        setErrorMsg(t('waitlist.already'));
      } else {
        setErrorMsg(t('waitlist.error'));
      }
      setStatus('error');
    } else {
      setStatus('success');
    }
  };

  const inputClass =
    'w-full px-4 py-3.5 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors';

  if (status === 'success') {
    return (
      <div className={`rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center ${className}`}>
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Check size={24} className="text-primary" />
        </div>
        <h3 className="font-display font-bold text-foreground text-lg mb-2">{t('waitlist.success_title')}</h3>
        <p className="text-muted-foreground text-sm">{t('waitlist.success_body')}</p>
      </div>
    );
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-3 ${className}`}>
        <input type="text" required placeholder={t('waitlist.name_placeholder')} value={name}
          onChange={(e) => setName(e.target.value)} className={`flex-1 px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors`} />
        <input type="email" required placeholder={t('waitlist.email_placeholder')} value={email}
          onChange={(e) => setEmail(e.target.value)} className={`flex-1 px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors`} />
        <button type="submit" disabled={status === 'loading'}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50">
          {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <>{t('waitlist.cta')} <ArrowRight size={14} /></>}
        </button>
        {status === 'error' && <p className="text-destructive text-xs sm:col-span-full">{errorMsg}</p>}
      </form>
    );
  }

  return (
    <div className={`rounded-2xl border border-border bg-background p-8 ${className}`}>
      <h3 className="font-display font-bold text-foreground text-xl mb-2">{t('waitlist.title')}</h3>
      <p className="text-muted-foreground text-sm mb-6">{t('waitlist.sub')}</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" required placeholder={t('waitlist.name_placeholder')} value={name}
          onChange={(e) => setName(e.target.value)} className={inputClass} />
        <input type="email" required placeholder={t('waitlist.email_placeholder')} value={email}
          onChange={(e) => setEmail(e.target.value)} className={inputClass} />

        <PhoneInput value={phone} onChange={setPhone} />

        <div className="grid grid-cols-2 gap-3">
          <select value={state} onChange={(e) => setState(e.target.value)}
            className={`${inputClass} appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat`}
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}>
            <option value="">{statePlaceholder}</option>
            {BR_STATES.map(uf => (
              <option key={uf} value={uf}>{uf} — {BR_STATE_NAMES[uf]}</option>
            ))}
          </select>
          <input type="text" placeholder={cityPlaceholder} value={city}
            onChange={(e) => setCity(e.target.value)} className={inputClass} />
        </div>

        {status === 'error' && <p className="text-destructive text-sm">{errorMsg}</p>}

        <button type="submit" disabled={status === 'loading'}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 shadow-[var(--shadow-glow)]">
          {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <>{t('waitlist.cta')} <ArrowRight size={16} /></>}
        </button>
      </form>
    </div>
  );
};

export default WaitlistCard;
