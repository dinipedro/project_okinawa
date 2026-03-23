import React from 'react';

interface SimTurnoLayoutProps {
  profile: string;
  model: string;
  painPoints: string[];
  onExit: () => void;
  onRestart: () => void;
}

const SimTurnoLayout: React.FC<SimTurnoLayoutProps> = ({ profile, model, onExit, onRestart }) => (
  <div className="min-h-screen flex items-center justify-center bg-background px-6">
    <div className="text-center max-w-md">
      <h1 className="font-display font-bold text-2xl text-foreground mb-4">Simulação em andamento</h1>
      <p className="text-muted-foreground text-sm mb-2">Perfil: {profile} · Modelo: {model}</p>
      <p className="text-muted-foreground text-xs mb-8">Em construção — esta experiência está sendo migrada.</p>
      <div className="flex gap-3 justify-center">
        <button onClick={onExit} className="px-6 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
          Sair
        </button>
        <button onClick={onRestart} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
          Recomeçar
        </button>
      </div>
    </div>
  </div>
);

export default SimTurnoLayout;
