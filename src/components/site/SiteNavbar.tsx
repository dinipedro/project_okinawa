import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import NooweLogo from './NooweLogo';
import { useLang } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';
import { Menu, X } from 'lucide-react';

const SiteNavbar: React.FC = () => {
  const { lang, setLang, t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const links = [
    { to: '/platform', label: t('nav.platform') },
    { to: '/demo', label: t('nav.demo') },
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
  ];

  const langs: Lang[] = ['PT' as unknown as Lang, 'EN' as unknown as Lang, 'ES' as unknown as Lang];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-noowe-bg/82 backdrop-blur-xl backdrop-saturate-[1.8] border-b border-noowe-border'
          : 'bg-transparent'
      }`}
      style={{ height: 44 }}
    >
      <div className="max-w-[980px] mx-auto px-5 h-full flex items-center justify-between">
        <Link to="/" className="flex-shrink-0">
          <NooweLogo size="sm" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-[13px] font-normal transition-colors duration-200 ${
                location.pathname === l.to ? 'text-noowe-t1' : 'text-noowe-t3 hover:text-noowe-t2'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language switcher */}
          <div className="flex items-center gap-1 text-[12px]">
            {(['pt', 'en', 'es'] as const).map((l, i) => (
              <React.Fragment key={l}>
                {i > 0 && <span className="text-noowe-t4">|</span>}
                <button
                  onClick={() => setLang(l)}
                  className={`transition-colors px-0.5 ${
                    lang === l ? 'text-noowe-t1 font-semibold' : 'text-noowe-t3 font-normal hover:text-noowe-t2'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              </React.Fragment>
            ))}
          </div>

          <Link
            to="/request-demo"
            className="text-[13px] font-medium bg-noowe-blue text-white px-4 py-1.5 rounded-full hover:bg-[#0077ed] transition-all duration-200 hover:scale-[1.03]"
          >
            {t('nav.request_demo')}
          </Link>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden text-noowe-t1" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-noowe-bg/95 backdrop-blur-xl border-t border-noowe-border">
          <div className="px-5 py-6 flex flex-col gap-4">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-[15px] text-noowe-t2 hover:text-noowe-t1 transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 pt-2 text-[13px]">
              {(['pt', 'en', 'es'] as const).map((l, i) => (
                <React.Fragment key={l}>
                  {i > 0 && <span className="text-noowe-t4">|</span>}
                  <button
                    onClick={() => setLang(l)}
                    className={lang === l ? 'text-noowe-t1 font-semibold' : 'text-noowe-t3'}
                  >
                    {l.toUpperCase()}
                  </button>
                </React.Fragment>
              ))}
            </div>
            <Link
              to="/request-demo"
              className="mt-2 text-center text-[14px] font-medium bg-noowe-blue text-white px-5 py-2.5 rounded-full"
            >
              {t('nav.request_demo')}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default SiteNavbar;
