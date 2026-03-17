import React from 'react';
import { Link } from 'react-router-dom';
import NooweLogo from './NooweLogo';
import { useLang } from '@/lib/i18n';

const SiteFooter: React.FC = () => {
  const { t } = useLang();

  const cols = [
    {
      title: t('footer.platform'),
      links: [
        { label: t('footer.overview'), to: '/platform' },
        { label: t('footer.service_types'), to: '/platform#services' },
        { label: t('footer.roles'), to: '/platform#roles' },
        { label: t('footer.features'), to: '/platform#features' },
      ],
    },
    {
      title: t('footer.company'),
      links: [
        { label: t('footer.about'), to: '/about' },
        { label: t('footer.careers'), to: '#' },
        { label: t('footer.press'), to: '#' },
      ],
    },
    {
      title: t('footer.resources'),
      links: [
        { label: t('footer.blog'), to: '#' },
        { label: t('footer.docs'), to: '#' },
        { label: t('footer.help'), to: '#' },
      ],
    },
    {
      title: t('footer.legal'),
      links: [
        { label: t('footer.privacy'), to: '#' },
        { label: t('footer.terms'), to: '#' },
      ],
    },
  ];

  return (
    <footer className="bg-noowe-bg2 border-t border-noowe-border py-16">
      <div className="max-w-[980px] mx-auto px-5">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo column */}
          <div className="col-span-2 md:col-span-1">
            <NooweLogo size="sm" />
            <p className="text-noowe-t4 text-[12px] mt-4 leading-relaxed">
              The Operating System for Restaurants
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-noowe-t2 text-[12px] font-semibold uppercase tracking-wider mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-noowe-t3 text-[12px] hover:text-noowe-t2 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-noowe-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-noowe-t4 text-[11px]">
            © {new Date().getFullYear()} NOOWE. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
