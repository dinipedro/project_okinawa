import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { privacySections } from '@/data/privacyContent';

export default function SitePrivacy() {
  return (
    <LegalPageLayout
      pageType="privacy"
      title={{
        pt: 'Política de Privacidade',
        en: 'Privacy Policy',
        es: 'Política de Privacidad',
      }}
      subtitle={{
        pt: 'Proteção de Dados Pessoais — LGPD Compliance',
        en: 'Personal Data Protection — LGPD Compliance',
        es: 'Protección de Datos Personales — LGPD Compliance',
      }}
      effectiveDate="22/03/2026"
      version="1.0"
      sections={privacySections}
      pdfPath="/docs/NOOWE_Politica_de_Privacidade.pdf"
      seoTitle={{
        pt: 'Política de Privacidade | NOOWE',
        en: 'Privacy Policy | NOOWE',
        es: 'Política de Privacidad | NOOWE',
      }}
      seoDescription={{
        pt: 'Política de Privacidade da NOOWE — como coletamos, usamos e protegemos seus dados pessoais, em conformidade com a LGPD.',
        en: 'NOOWE Privacy Policy — how we collect, use, and protect your personal data, in compliance with LGPD.',
        es: 'Política de Privacidad de NOOWE — cómo recopilamos, usamos y protegemos sus datos personales, conforme la LGPD.',
      }}
      jsonLd={[
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Política de Privacidade — NOOWE',
          url: 'https://noowebr.com/privacy',
          description: 'Política de Privacidade da plataforma NOOWE — Proteção de Dados Pessoais conforme LGPD.',
          publisher: { '@type': 'Organization', name: 'NOOWE', url: 'https://noowebr.com' },
          inLanguage: ['pt-BR', 'en', 'es'],
          datePublished: '2026-03-22',
          dateModified: '2026-03-22',
        },
      ]}
    />
  );
}
