import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import NooweLogo from '@/components/site/NooweLogo';
import SiteFooter from '@/components/site/SiteFooter';
import SEOHead from '@/components/seo/SEOHead';
import {
  ChevronDown, ChevronUp, Download, Printer, Search, X, ArrowUp,
  Menu, ChevronsUpDown, FileText, Shield, ExternalLink,
  BookOpen, Scale, Layers, UserCheck, Users, Building2,
  CreditCard, Copyright, Eye, FolderOpen, Globe, Server,
  Lock, Cookie, Clock, RefreshCw, Gavel, CheckCircle2,
  Brain, Share2, ArrowRightLeft, AlertTriangle, type LucideIcon,
} from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

/* ────── types ────── */
export interface LegalSection {
  id: string;
  title: Record<string, string>;
  content: Record<string, string>;
  keyPoint?: Record<string, string>;
}

interface LegalPageLayoutProps {
  pageType: 'terms' | 'privacy';
  title: Record<string, string>;
  subtitle: Record<string, string>;
  effectiveDate: string;
  version: string;
  sections: LegalSection[];
  pdfPath: string;
  seoTitle: Record<string, string>;
  seoDescription: Record<string, string>;
  jsonLd?: object[];
}

/* ────── section icon mapping ────── */
const sectionIcons: Record<string, LucideIcon> = {
  // Terms
  'disposicoes-preliminares': FileText,
  'definicoes': BookOpen,
  'arcabouco-legal': Scale,
  'descricao-servicos': Layers,
  'cadastro-conta': UserCheck,
  'direitos-usuario': Users,
  'obrigacoes-usuario': CheckCircle2,
  'obrigacoes-noowe': Building2,
  'pagamentos': CreditCard,
  'propriedade-intelectual': Copyright,
  'privacidade-protecao': Shield,
  'conteudo-usuario': FolderOpen,
  'disponibilidade': Globe,
  'terceiros': Share2,
  'contato': Users,
  'alteracoes': RefreshCw,
  'foro': Gavel,
  'disposicoes-finais': CheckCircle2,
  // Privacy
  'introducao': Eye,
  'definicoes-privacidade': BookOpen,
  'bases-legais': Scale,
  'controlador': Building2,
  'operadores': Server,
  'dpo': Shield,
  'direitos-titular': Users,
  'dados-tratados': FolderOpen,
  'como-coletados': Layers,
  'decisoes-automatizadas': Brain,
  'compartilhamento': Share2,
  'transferencia-internacional': ArrowRightLeft,
  'seguranca': Lock,
  'cookies': Cookie,
  'retencao': Clock,
  'alteracoes-politica': RefreshCw,
  'disposicoes-finais-privacidade': CheckCircle2,
};

/* ────── accent colors per section index ────── */
const accentColors = [
  'hsl(var(--primary))',
  'hsl(220, 70%, 55%)',
  'hsl(262, 60%, 55%)',
  'hsl(340, 65%, 50%)',
  'hsl(160, 55%, 40%)',
  'hsl(25, 75%, 50%)',
  'hsl(200, 65%, 50%)',
  'hsl(280, 55%, 50%)',
];

/* ────── glossary tooltip definitions ────── */
const glossaryTerms: Record<string, Record<string, string>> = {
  'dados pessoais': {
    pt: 'Qualquer informação que identifique ou possa identificar uma pessoa, como nome, CPF, e-mail ou telefone.',
    en: 'Any information that identifies or can identify a person, such as name, ID number, email or phone.',
    es: 'Cualquier información que identifique o pueda identificar a una persona, como nombre, documento, correo o teléfono.',
  },
  'dados pessoais sensíveis': {
    pt: 'Dados sobre saúde, biometria, orientação sexual, religião, opinião política, etnia ou genética — têm proteção reforçada pela LGPD.',
    en: 'Data about health, biometrics, sexual orientation, religion, political opinion, ethnicity or genetics — have enhanced protection under Brazilian law (LGPD).',
    es: 'Datos sobre salud, biometría, orientación sexual, religión, opinión política, etnia o genética — tienen protección reforzada por la LGPD.',
  },
  'legítimo interesse': {
    pt: 'Base legal que permite o tratamento de dados quando há um interesse real e justo da empresa, desde que não prejudique os direitos do titular.',
    en: 'Legal basis that allows data processing when the company has a real and fair interest, provided it doesn\'t harm the data subject\'s rights.',
    es: 'Base legal que permite el tratamiento de datos cuando la empresa tiene un interés real y justo, siempre que no perjudique los derechos del titular.',
  },
  'encarregado': {
    pt: 'Pessoa indicada pela empresa para ser o canal de comunicação sobre proteção de dados com os usuários e a autoridade nacional (ANPD).',
    en: 'Person designated by the company to be the communication channel about data protection with users and the national authority (ANPD).',
    es: 'Persona designada por la empresa para ser el canal de comunicación sobre protección de datos con los usuarios y la autoridad nacional (ANPD).',
  },
  'tratamento': {
    pt: 'Qualquer operação feita com dados pessoais: coleta, armazenamento, uso, compartilhamento ou eliminação.',
    en: 'Any operation performed on personal data: collection, storage, use, sharing or deletion.',
    es: 'Cualquier operación realizada con datos personales: recopilación, almacenamiento, uso, intercambio o eliminación.',
  },
  'controlador': {
    pt: 'A empresa que decide como e por que os dados pessoais são tratados. No caso, a NOOWE (DINI & CIA. TECNOLOGIA LTDA).',
    en: 'The company that decides how and why personal data is processed. In this case, NOOWE (DINI & CIA. TECNOLOGIA LTDA).',
    es: 'La empresa que decide cómo y por qué se tratan los datos personales. En este caso, NOOWE (DINI & CIA. TECNOLOGIA LTDA).',
  },
  'consentimento': {
    pt: 'Autorização clara e voluntária que você dá para que seus dados sejam usados para uma finalidade específica.',
    en: 'Clear and voluntary authorization you give for your data to be used for a specific purpose.',
    es: 'Autorización clara y voluntaria que das para que tus datos se usen para un fin específico.',
  },
  'anonimização': {
    pt: 'Processo que torna impossível identificar a pessoa a partir dos dados, removendo qualquer vínculo.',
    en: 'Process that makes it impossible to identify the person from the data, removing any link.',
    es: 'Proceso que hace imposible identificar a la persona a partir de los datos, eliminando cualquier vínculo.',
  },
  'LGPD': {
    pt: 'Lei Geral de Proteção de Dados (Lei nº 13.709/2018) — a lei brasileira que regula como empresas coletam e usam dados pessoais.',
    en: 'Brazilian General Data Protection Law (Law No. 13,709/2018) — regulates how companies collect and use personal data in Brazil.',
    es: 'Ley General de Protección de Datos de Brasil (Ley nº 13.709/2018) — regula cómo las empresas recopilan y usan datos personales.',
  },
  'ANPD': {
    pt: 'Autoridade Nacional de Proteção de Dados — órgão do governo responsável por fiscalizar o cumprimento da LGPD.',
    en: 'Brazil\'s National Data Protection Authority — government body responsible for overseeing LGPD compliance.',
    es: 'Autoridad Nacional de Protección de Datos de Brasil — órgano gubernamental responsable de supervisar el cumplimiento de la LGPD.',
  },
};

/* ────── i18n labels ────── */
const labels = {
  downloadPdf: { pt: 'Baixar documento completo em PDF', en: 'Download full document (PDF)', es: 'Descargar documento completo (PDF)' },
  print: { pt: 'Imprimir', en: 'Print', es: 'Imprimir' },
  expandAll: { pt: 'Expandir todas', en: 'Expand all', es: 'Expandir todas' },
  collapseAll: { pt: 'Recolher todas', en: 'Collapse all', es: 'Colapsar todas' },
  searchPlaceholder: { pt: 'Buscar no documento...', en: 'Search document...', es: 'Buscar en el documento...' },
  results: { pt: 'resultados', en: 'results', es: 'resultados' },
  backToTop: { pt: 'Voltar ao topo', en: 'Back to top', es: 'Volver arriba' },
  tableOfContents: { pt: 'Índice', en: 'Table of Contents', es: 'Índice' },
  readProgress: { pt: 'Progresso de leitura', en: 'Reading progress', es: 'Progreso de lectura' },
  bindingLang: { pt: 'O texto vinculante é o Português Brasileiro.', en: 'The binding text is Brazilian Portuguese. This is a convenience translation.', es: 'El texto vinculante es el Portugués Brasileño. Esta es una traducción de conveniencia.' },
  version: { pt: 'Versão', en: 'Version', es: 'Versión' },
  effectiveDate: { pt: 'Vigência', en: 'Effective', es: 'Vigencia' },
  lastUpdate: { pt: 'Última atualização', en: 'Last updated', es: 'Última actualización' },
  summary: { pt: 'Ponto-chave', en: 'Key Point', es: 'Punto clave' },
  seeAlso: { pt: 'Veja também', en: 'See also', es: 'Ver también' },
  terms: { pt: 'Termos de Uso', en: 'Terms of Use', es: 'Términos de Uso' },
  privacy: { pt: 'Política de Privacidade', en: 'Privacy Policy', es: 'Política de Privacidad' },
};

const l = (obj: Record<string, string>, lang: string) => obj[lang] || obj['en'] || '';

/* ────── GlossaryContent: adds tooltips to legal text ────── */
function GlossaryContent({ html, lang }: { html: string; lang: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ term: string; x: number; y: number } | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const terms = Object.keys(glossaryTerms);
    let updatedHtml = html;
    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      updatedHtml = updatedHtml.replace(regex, `<span class="glossary-term cursor-help border-b border-dotted border-muted-foreground/40 hover:border-primary hover:text-primary transition-colors" data-glossary="${term.toLowerCase()}">$1</span>`);
    });
    el.innerHTML = updatedHtml;

    const handleOver = (e: Event) => {
      const target = e.target as HTMLElement;
      const gTerm = target.getAttribute?.('data-glossary');
      if (gTerm) {
        const rect = target.getBoundingClientRect();
        setTooltip({ term: gTerm, x: rect.left + rect.width / 2, y: rect.top });
      }
    };
    const handleOut = () => setTooltip(null);
    el.addEventListener('mouseover', handleOver);
    el.addEventListener('mouseout', handleOut);
    return () => { el.removeEventListener('mouseover', handleOver); el.removeEventListener('mouseout', handleOut); };
  }, [html, lang]);

  return (
    <>
      <div
        ref={ref}
        className="legal-prose prose prose-sm sm:prose-base max-w-none
          prose-headings:text-foreground prose-headings:font-semibold
          prose-p:text-foreground/85 prose-p:leading-[1.8] prose-p:tracking-wide
          prose-li:text-foreground/85 prose-li:leading-[1.8]
          prose-strong:text-foreground prose-strong:font-semibold
          prose-table:text-sm
          prose-td:py-2.5 prose-td:px-3 prose-th:py-2.5 prose-th:px-3
          prose-table:border-separate prose-table:border-spacing-0
          prose-thead:bg-muted/60
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
      />
      <AnimatePresence>
        {tooltip && glossaryTerms[tooltip.term] && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed z-[100] max-w-xs p-3.5 rounded-xl bg-card border border-border shadow-2xl text-sm text-foreground pointer-events-none"
            style={{ left: Math.min(tooltip.x, window.innerWidth - 280), top: tooltip.y - 8, transform: 'translateX(-50%) translateY(-100%)' }}
          >
            <p className="font-semibold text-primary mb-1.5 capitalize">{tooltip.term}</p>
            <p className="text-muted-foreground text-xs leading-relaxed">{l(glossaryTerms[tooltip.term], lang)}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ────── Scroll-reveal section wrapper ────── */
function RevealSection({ children, index }: { children: React.ReactNode; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px 0px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.2), ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

/* ────── Main Layout ────── */
export default function LegalPageLayout({
  pageType, title, subtitle, effectiveDate, version, sections, pdfPath,
  seoTitle, seoDescription, jsonLd,
}: LegalPageLayoutProps) {
  const { lang, setLang } = useLang();
  const location = useLocation();

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(sections.map(s => s.id)));
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [readProgress, setReadProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id ?? '');
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Scroll progress
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setReadProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0);
      setShowBackToTop(scrollTop > 300);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // IntersectionObserver scroll-spy
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sectionRefs.current.forEach((el, id) => {
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSectionId(id); },
        { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [sections]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(() => {
      const q = searchQuery.toLowerCase();
      const results = sections.filter(s => {
        const content = (l(s.title, lang) + ' ' + l(s.content, lang)).toLowerCase();
        return content.includes(q);
      }).map(s => s.id);
      setSearchResults(results);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, sections, lang]);

  const toggleSection = useCallback((id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setExpandedSections(prev =>
      prev.size === sections.length ? new Set() : new Set(sections.map(s => s.id))
    );
  }, [sections]);

  const scrollToSection = useCallback((id: string) => {
    const el = sectionRefs.current.get(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileTocOpen(false);
      setExpandedSections(prev => new Set([...prev, id]));
    }
  }, []);

  const allExpanded = expandedSections.size === sections.length;
  const crossLink = pageType === 'terms' ? '/privacy' : '/terms';
  const crossLabel = pageType === 'terms' ? l(labels.privacy, lang) : l(labels.terms, lang);

  const highlightContent = useCallback((html: string) => {
    if (!searchQuery.trim()) return html;
    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return html.replace(new RegExp(`(${escaped})`, 'gi'), '<mark class="bg-accent/30 text-foreground px-0.5 rounded">$1</mark>');
  }, [searchQuery]);

  const getAccent = (i: number) => accentColors[i % accentColors.length];

  return (
    <>
      <SEOHead
        title={l(seoTitle, lang)}
        description={l(seoDescription, lang)}
        canonical={`https://noowebr.com${location.pathname}`}
        jsonLd={jsonLd as Record<string, unknown>[] | undefined}
      />

      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-transparent" role="progressbar" aria-label={l(labels.readProgress, lang)} aria-valuenow={Math.round(readProgress)}>
        <div className="h-full bg-gradient-to-r from-primary via-primary to-primary/60 transition-all duration-150 shadow-sm shadow-primary/20" style={{ width: `${readProgress}%` }} />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/40" style={{ height: 64 }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex-shrink-0"><NooweLogo size="sm" /></Link>
            <span className="text-border/60">/</span>
            <span className="text-sm text-muted-foreground hidden sm:inline font-medium">{l(labels[pageType === 'terms' ? 'terms' : 'privacy'], lang)}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted/50 rounded-full px-1 py-0.5">
              {(['pt', 'en', 'es'] as const).map((lc) => (
                <button
                  key={lc}
                  onClick={() => setLang(lc)}
                  className={cn(
                    'px-2.5 py-1 rounded-full transition-all duration-200 text-xs',
                    lang === lc
                      ? 'bg-foreground text-background font-semibold shadow-sm'
                      : 'hover:bg-muted text-muted-foreground'
                  )}
                >
                  {lc.toUpperCase()}
                </button>
              ))}
            </div>
            <a href={pdfPath} target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
              <Download size={14} /> PDF
            </a>
          </div>
        </div>
      </header>

      <main className="pt-[80px] min-h-screen bg-background">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">

          {/* Mobile TOC trigger */}
          <div className="lg:hidden sticky top-[64px] z-40 bg-background/95 backdrop-blur-md border-b border-border/40 -mx-4 px-4 py-2">
            <button
              onClick={() => setMobileTocOpen(!mobileTocOpen)}
              className="w-full flex items-center justify-between text-sm font-medium text-foreground py-2"
              aria-expanded={mobileTocOpen}
            >
              <span className="flex items-center gap-2"><Menu size={16} />{l(labels.tableOfContents, lang)}</span>
              <ChevronsUpDown size={16} className="text-muted-foreground" />
            </button>
            <AnimatePresence>
              {mobileTocOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <nav className="py-2 max-h-[50vh] overflow-y-auto space-y-0.5">
                    {sections.map((s, i) => {
                      const Icon = sectionIcons[s.id] || FileText;
                      return (
                        <button
                          key={s.id}
                          onClick={() => scrollToSection(s.id)}
                          className={cn(
                            'flex items-center gap-2.5 w-full text-left text-sm py-2 px-3 rounded-lg transition-all',
                            activeSectionId === s.id ? 'text-primary font-medium bg-primary/8' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          )}
                        >
                          <Icon size={14} style={{ color: getAccent(i) }} />
                          <span className="truncate">{l(s.title, lang)}</span>
                        </button>
                      );
                    })}
                  </nav>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-12 py-8 lg:py-14">
            {/* Sidebar (desktop) — Timeline style */}
            <aside className="hidden lg:block w-[280px] flex-shrink-0">
              <div className="sticky top-[88px]">
                {/* Progress */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-300" style={{ width: `${readProgress}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono tabular-nums">{Math.round(readProgress)}%</span>
                </div>

                <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">{l(labels.tableOfContents, lang)}</h3>

                {/* Timeline nav */}
                <nav className="relative max-h-[calc(100vh-240px)] overflow-y-auto scrollbar-thin pr-2" aria-label={l(labels.tableOfContents, lang)}>
                  {/* Vertical timeline line */}
                  <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />

                  <div className="space-y-0.5">
                    {sections.map((s, i) => {
                      const isActive = activeSectionId === s.id;
                      const Icon = sectionIcons[s.id] || FileText;
                      return (
                        <button
                          key={s.id}
                          onClick={() => scrollToSection(s.id)}
                          aria-current={isActive ? 'location' : undefined}
                          className={cn(
                            'relative flex items-center gap-3 w-full text-left py-2 px-3 pl-7 rounded-lg transition-all duration-200 text-[13px] leading-snug group',
                            isActive
                              ? 'text-foreground font-medium bg-muted/60'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                          )}
                        >
                          {/* Timeline dot */}
                          <div
                            className={cn(
                              'absolute left-[5px] w-[9px] h-[9px] rounded-full border-2 transition-all duration-300',
                              isActive
                                ? 'border-primary bg-primary scale-125 shadow-sm'
                                : 'border-muted-foreground/30 bg-background group-hover:border-muted-foreground/60'
                            )}
                            style={isActive ? { borderColor: getAccent(i), backgroundColor: getAccent(i) } : undefined}
                          />
                          <Icon size={13} className="flex-shrink-0 transition-colors" style={{ color: isActive ? getAccent(i) : undefined }} />
                          <span className="truncate">{l(s.title, lang)}</span>
                        </button>
                      );
                    })}
                  </div>
                </nav>

                {/* Cross-link */}
                <div className="mt-6 pt-5 border-t border-border/60">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">{l(labels.seeAlso, lang)}</p>
                  <Link to={crossLink} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                    {pageType === 'terms' ? <Shield size={14} /> : <FileText size={14} />}
                    {crossLabel}
                    <ExternalLink size={11} />
                  </Link>
                </div>
              </div>
            </aside>

            {/* Content */}
            <div className="flex-1 min-w-0" ref={contentRef}>
              {/* Hero */}
              <motion.div
                className="mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {/* Icon badge */}
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-5">
                  {pageType === 'terms' ? <FileText size={28} className="text-primary" /> : <Shield size={28} className="text-primary" />}
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-foreground tracking-tight leading-[1.15] mb-3">
                  {l(title, lang)}
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-6 max-w-2xl">{l(subtitle, lang)}</p>

                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/80 rounded-full font-medium text-foreground/70">
                    {l(labels.version, lang)} {version}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/80 rounded-full text-foreground/70">
                    {l(labels.effectiveDate, lang)}: {effectiveDate}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/80 rounded-full text-foreground/70">
                    {l(labels.lastUpdate, lang)}: {effectiveDate}
                  </span>
                </div>

                {lang !== 'pt' && (
                  <div className="mt-5 p-4 bg-accent/5 border border-accent/15 rounded-xl text-sm text-foreground/80 flex items-start gap-3">
                    <AlertTriangle size={18} className="text-accent-foreground flex-shrink-0 mt-0.5" />
                    <span>{l(labels.bindingLang, lang)}</span>
                  </div>
                )}
              </motion.div>

              {/* Search + controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
                <div className="relative flex-1" role="search">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder={l(labels.searchPlaceholder, lang)}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 text-sm border border-border/60 rounded-xl bg-muted/30 focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-muted-foreground/60"
                    aria-label={l(labels.searchPlaceholder, lang)}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {searchQuery && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">
                      {searchResults.length} {l(labels.results, lang)}
                    </span>
                  )}
                  <button
                    onClick={toggleAll}
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors whitespace-nowrap flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-primary/5"
                  >
                    {allExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {allExpanded ? l(labels.collapseAll, lang) : l(labels.expandAll, lang)}
                  </button>
                </div>
              </div>

              {/* Timeline sections */}
              <div className="relative">
                {/* Main timeline line */}
                <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-border via-border/60 to-transparent hidden sm:block" />

                <div className="space-y-4 sm:space-y-6">
                  {sections.map((section, i) => {
                    const isExpanded = expandedSections.has(section.id);
                    const isSearchHit = searchResults.includes(section.id);
                    const contentHtml = highlightContent(l(section.content, lang));
                    const Icon = sectionIcons[section.id] || FileText;
                    const accent = getAccent(i);

                    return (
                      <RevealSection key={section.id} index={i}>
                        <section
                          ref={el => { if (el) sectionRefs.current.set(section.id, el); }}
                          id={section.id}
                          className={cn(
                            'relative sm:pl-12 scroll-mt-[120px] group/section',
                          )}
                        >
                          {/* Timeline node */}
                          <div
                            className="hidden sm:flex absolute left-0 top-5 w-10 h-10 rounded-xl items-center justify-center border-2 bg-background z-10 transition-all duration-300 shadow-sm"
                            style={{
                              borderColor: activeSectionId === section.id ? accent : 'hsl(var(--border))',
                              color: activeSectionId === section.id ? accent : 'hsl(var(--muted-foreground))',
                            }}
                          >
                            <Icon size={18} />
                          </div>

                          {/* Card */}
                          <div
                            className={cn(
                              'border rounded-2xl transition-all duration-300 overflow-hidden',
                              isSearchHit && searchQuery
                                ? 'border-primary/40 ring-2 ring-primary/10 shadow-lg shadow-primary/5'
                                : activeSectionId === section.id
                                  ? 'border-border/80 shadow-md bg-card'
                                  : 'border-border/50 hover:border-border/80 hover:shadow-sm bg-card/50 hover:bg-card',
                            )}
                          >
                            <button
                              onClick={() => toggleSection(section.id)}
                              className="w-full flex items-center justify-between p-5 sm:p-6 text-left group"
                              aria-expanded={isExpanded}
                              aria-controls={`content-${section.id}`}
                            >
                              <div className="flex items-start gap-3 min-w-0">
                                <div className="sm:hidden flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0" style={{ backgroundColor: `${accent}15`, color: accent }}>
                                  <Icon size={16} />
                                </div>
                                <div className="min-w-0">
                                  <span className="text-[11px] text-muted-foreground/60 font-mono tracking-wider block mb-1">
                                    {String(i + 1).padStart(2, '0')}
                                  </span>
                                  <h2 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                                    {l(section.title, lang)}
                                  </h2>
                                </div>
                              </div>
                              <div
                                className={cn(
                                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ml-3 transition-all duration-300',
                                  isExpanded ? 'bg-primary/10 text-primary rotate-180' : 'bg-muted text-muted-foreground'
                                )}
                              >
                                <ChevronDown size={16} />
                              </div>
                            </button>

                            <AnimatePresence initial={false}>
                              {isExpanded && (
                                <motion.div
                                  id={`content-${section.id}`}
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-5 sm:px-6 pb-6">
                                    {/* Separator */}
                                    <div className="h-px bg-border/40 mb-5" />

                                    {/* Key point — pull-quote style */}
                                    {section.keyPoint && (
                                      <div
                                        className="mb-6 p-4 sm:p-5 rounded-xl relative overflow-hidden"
                                        style={{ backgroundColor: `${accent}08` }}
                                      >
                                        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full" style={{ backgroundColor: accent }} />
                                        <div className="pl-4">
                                          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-2" style={{ color: accent }}>
                                            {l(labels.summary, lang)}
                                          </p>
                                          <p className="text-sm sm:text-base text-foreground/80 leading-relaxed font-medium italic">
                                            &ldquo;{l(section.keyPoint, lang)}&rdquo;
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    <GlossaryContent html={contentHtml} lang={lang} />
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </section>
                      </RevealSection>
                    );
                  })}
                </div>
              </div>

              {/* Cross-link footer */}
              <motion.div
                className="mt-14 p-6 sm:p-8 bg-gradient-to-br from-muted/60 to-muted/30 rounded-2xl border border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">{l(labels.seeAlso, lang)}</p>
                  <Link to={crossLink} className="text-base text-primary hover:text-primary/80 font-semibold inline-flex items-center gap-2 transition-colors">
                    {crossLabel} <ExternalLink size={14} />
                  </Link>
                </div>
                <a
                  href={pdfPath}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-5 py-3 bg-foreground text-background rounded-xl text-sm font-semibold hover:bg-foreground/90 transition-colors shadow-sm"
                >
                  <Download size={16} />
                  {l(labels.downloadPdf, lang)}
                </a>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Mobile bottom bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/40 px-4 py-2.5 flex items-center justify-between gap-2">
          <a href={pdfPath} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-foreground text-background rounded-xl text-sm font-semibold">
            <Download size={14} /> PDF
          </a>
          <button onClick={() => window.print()} className="px-4 py-2.5 border border-border rounded-xl text-sm text-foreground hover:bg-muted transition-colors">
            <Printer size={14} />
          </button>
        </div>

        {/* Back to top */}
        <AnimatePresence>
          {showBackToTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 z-50 w-11 h-11 bg-foreground text-background rounded-full shadow-lg flex items-center justify-center hover:bg-foreground/90 transition-colors"
              aria-label={l(labels.backToTop, lang)}
            >
              <ArrowUp size={16} />
            </motion.button>
          )}
        </AnimatePresence>
      </main>

      <div className="lg:hidden h-16" />
      <SiteFooter />
    </>
  );
}
