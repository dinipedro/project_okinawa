import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import SEOHead from "@/components/seo/SEOHead";
import { useLang } from "@/lib/i18n";
import { ArrowRight, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const { lang } = useLang();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const text = {
    pt: { title: 'Página não encontrada', sub: 'A página que você procura não existe ou foi movida.', home: 'Voltar ao início', platform: 'Conhecer a plataforma', demo: 'Solicitar demo' },
    en: { title: 'Page not found', sub: 'The page you\'re looking for doesn\'t exist or has been moved.', home: 'Back to home', platform: 'Explore platform', demo: 'Request demo' },
    es: { title: 'Página no encontrada', sub: 'La página que buscas no existe o fue movida.', home: 'Volver al inicio', platform: 'Conocer la plataforma', demo: 'Solicitar demo' },
  }[lang];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <SEOHead title="404" noIndex />
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-8">
          <Search size={28} />
        </div>
        <h1 className="font-display font-bold text-5xl text-foreground mb-3">404</h1>
        <p className="text-muted-foreground text-lg mb-10">{text.sub}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl hover:bg-primary-dark transition-all"
          >
            {text.home}
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link to="/platform" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {text.platform}
          </Link>
          <Link to="/request-demo" className="text-sm font-medium text-primary hover:underline">
            {text.demo}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
