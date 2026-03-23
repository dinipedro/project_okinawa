import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import SiteNavbar from '@/components/site/SiteNavbar';
import SiteFooter from '@/components/site/SiteFooter';
import WaitlistCard from '@/components/site/WaitlistCard';
import SEOHead from '@/components/seo/SEOHead';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { ArrowRight, Building2, Smartphone, Layers, Zap, Globe, Shield, Play } from 'lucide-react';

const Reveal: React.FC<{
  children: React.ReactNode; delay?: number; className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  const [ref, visible] = useScrollReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`noowe-reveal ${visible ? 'visible' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const SiteHome: React.FC = () => {
  const { t } = useLang();

  const pillars = [
    { icon: Layers, key: 'pillar_integration' },
    { icon: Zap, key: 'pillar_realtime' },
    { icon: Globe, key: 'pillar_multilingual' },
    { icon: Shield, key: 'pillar_security' },
  ];

  return (
    <div className="bg-background text-foreground min-h-screen">
      <SEOHead
        title={t('seo.home_title')}
        description={t('seo.home_desc')}
        canonical="/"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'NOOWE',
            url: 'https://noowebr.com',
            description: t('seo.home_desc'),
            logo: 'https://noowebr.com/favicon.png',
            sameAs: [],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'NOOWE',
            url: 'https://noowebr.com',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://noowebr.com/platform?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          },
        ]}
      />
      <SiteNavbar />

      {/* ═══ HERO ═══ */}
      <section className="relative pt-36 pb-28 overflow-hidden">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.03]" style={{ background: 'radial-gradient(circle, hsl(var(--secondary)) 0%, transparent 70%)' }} />

        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-8">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-primary font-medium text-sm">{t('home.hero_overline')}</span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1
              className="font-display font-bold text-foreground max-w-4xl mx-auto"
              style={{ fontSize: 'clamp(40px, 6.5vw, 72px)', letterSpacing: '-0.04em', lineHeight: 1.05 }}
            >
              {t('home.hero_h1_1')}
              <br />
              <span className="text-primary">{t('home.hero_h1_2')}</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p
              className="text-muted-foreground mt-7 max-w-2xl mx-auto"
              style={{ fontSize: 'clamp(17px, 1.4vw, 21px)', lineHeight: 1.7 }}
            >
              {t('home.hero_sub')}
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <Link
                to="/request-demo"
                className="group inline-flex items-center gap-2.5 bg-primary text-primary-foreground font-semibold px-8 py-4 rounded-xl hover:bg-primary-dark transition-all shadow-glow"
                style={{ fontSize: 'clamp(15px, 1vw, 17px)' }}
              >
                <Play size={16} />
                {t('home.hero_cta_sim')}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/platform"
                className="inline-flex items-center gap-2 text-muted-foreground font-medium text-sm hover:text-foreground transition-colors"
              >
                {t('home.hero_cta_platform')} <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ PILLARS ═══ */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-[1200px] mx-auto px-6">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="text-secondary font-semibold text-sm tracking-wide uppercase mb-4">{t('home.pillars_overline')}</p>
              <h2 className="font-display font-bold text-foreground" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                {t('home.pillars_title')}
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {pillars.map((p, i) => (
              <Reveal key={p.key} delay={i * 70}>
                <div className="p-6 rounded-2xl border border-border bg-background hover:border-primary/20 transition-all duration-300 hover:shadow-md h-full">
                  <div className="w-11 h-11 rounded-xl bg-primary/8 text-primary flex items-center justify-center mb-4">
                    <p.icon size={22} />
                  </div>
                  <h3 className="text-foreground font-semibold text-base mb-2">{t(`home.${p.key}_title`)}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t(`home.${p.key}_desc`)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ AUDIENCE ═══ */}
      <section className="py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <Reveal>
            <h2 className="font-display font-bold text-foreground text-center mb-4" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', letterSpacing: '-0.03em' }}>
              {t('home.audience_title')}
            </h2>
          </Reveal>
          <Reveal delay={60}>
            <p className="text-muted-foreground text-center max-w-lg mx-auto mb-14 text-lg">
              {t('home.audience_sub')}
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Reveal delay={100}>
              <Link to="/platform" className="group block p-10 rounded-2xl border-2 border-border bg-background hover:border-primary/40 transition-all duration-300 hover:shadow-lg h-full">
                <div className="w-14 h-14 rounded-xl bg-primary/8 text-primary flex items-center justify-center mb-6">
                  <Building2 size={28} />
                </div>
                <h3 className="font-display font-bold text-foreground text-2xl mb-3">{t('home.biz_title')}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-8">{t('home.biz_desc')}</p>
                <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
                  {t('home.biz_cta')} <ArrowRight size={16} />
                </span>
              </Link>
            </Reveal>

            <Reveal delay={180}>
              <Link to="/para-voce" className="group block p-10 rounded-2xl border-2 border-border bg-background hover:border-secondary/40 transition-all duration-300 hover:shadow-lg h-full">
                <div className="w-14 h-14 rounded-xl bg-secondary/8 text-secondary flex items-center justify-center mb-6">
                  <Smartphone size={28} />
                </div>
                <h3 className="font-display font-bold text-foreground text-2xl mb-3">{t('home.you_title')}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-8">{t('home.you_desc')}</p>
                <span className="inline-flex items-center gap-2 text-secondary font-semibold text-sm group-hover:gap-3 transition-all">
                  {t('home.you_cta')} <ArrowRight size={16} />
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ QUOTE ═══ */}
      <section className="py-28 bg-muted/30">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <Reveal>
            <blockquote
              className="font-display text-foreground font-bold leading-tight"
              style={{ fontSize: 'clamp(24px, 3vw, 40px)', letterSpacing: '-0.02em' }}
            >
              {t('home.quote')}
            </blockquote>
          </Reveal>
          <Reveal delay={120}>
            <div className="flex items-center justify-center gap-2 mt-8">
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#FF5E3A' }} />
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#0D4F4F' }} />
              <span className="text-muted-foreground text-sm ml-2 font-medium">NOOWE Team</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ WAITLIST ═══ */}
      <section className="py-20">
        <div className="max-w-[560px] mx-auto px-6 text-center">
          <Reveal>
            <h2 className="font-display font-bold text-foreground mb-3" style={{ fontSize: 'clamp(26px, 3vw, 38px)', letterSpacing: '-0.03em' }}>
              {t('foryou.waitlist_title')}
            </h2>
            <p className="text-muted-foreground text-lg mb-8">{t('foryou.waitlist_sub')}</p>
          </Reveal>
          <Reveal delay={100}>
            <WaitlistCard />
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default SiteHome;
