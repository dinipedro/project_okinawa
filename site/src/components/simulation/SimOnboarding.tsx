import React from 'react';

export interface SimOnboardingResult {
  profile: string;
  model: string;
  painPoints: string[];
}

interface SimOnboardingProps {
  onComplete: (result: SimOnboardingResult) => void;
  onExit: () => void;
}

const SimOnboarding: React.FC<SimOnboardingProps> = ({ onComplete, onExit }) => (
  <div className="min-h-screen flex items-center justify-center bg-background px-6">
    <div className="text-center max-w-md">
      <h1 className="font-display font-bold text-2xl text-foreground mb-4">Simulação Guiada</h1>
      <p className="text-muted-foreground text-sm mb-8">Em construção — esta experiência está sendo migrada.</p>
      <div className="flex gap-3 justify-center">
        <button onClick={onExit} className="px-6 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
          Voltar
        </button>
        <button
          onClick={() => onComplete({ profile: 'owner', model: 'fine-dining', painPoints: [] })}
          className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
        >
          Iniciar Demo
        </button>
      </div>
    </div>
  </div>
);

export default SimOnboarding;
