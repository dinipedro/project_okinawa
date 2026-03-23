/**
 * Guided Simulation — Digital Twin (Redesigned)
 * Phase 1: Empathy + Onboarding (SimOnboarding)
 * Phase 2: 5-Act "Real Shift" Simulation (SimTurnoLayout)
 * P0: Cinematic zoom-in transition between phases
 */
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DemoProvider } from '@/contexts/DemoContext';
import { DemoI18nProvider } from '@/components/demo/DemoI18n';
import SimOnboarding, { type SimOnboardingResult } from '@/components/simulation/SimOnboarding';
import SimTurnoLayout from '@/components/simulation/SimTurnoLayout';
import SEOHead from '@/components/seo/SEOHead';

const cinematicVariants = {
  initial: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.2, filter: 'blur(8px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const enterVariants = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 } },
};

const GuidedSimulationInner: React.FC = () => {
  const navigate = useNavigate();
  const [onboardingResult, setOnboardingResult] = useState<SimOnboardingResult | null>(null);

  // Guard: only allow access if user completed request-demo flow
  useEffect(() => {
    const hasAccess = sessionStorage.getItem('demo-email');
    if (!hasAccess) {
      navigate('/request-demo', { replace: true });
    }
  }, [navigate]);

  const handleOnboardingComplete = useCallback((result: SimOnboardingResult) => {
    setOnboardingResult(result);
  }, []);

  const handleExit = useCallback(() => {
    navigate('/demo');
  }, [navigate]);

  const handleRestart = useCallback(() => {
    setOnboardingResult(null);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {!onboardingResult ? (
        <motion.div
          key="onboarding"
          variants={cinematicVariants}
          initial="initial"
          exit="exit"
          className="min-h-screen"
        >
          <SEOHead
            title="Simulação Guiada"
            description="Viva um turno real no seu restaurante com a simulação digital NOOWE. Descubra como resolver suas maiores dores operacionais."
            canonical="/demo/guided"
            noIndex
          />
          <SimOnboarding
            onComplete={handleOnboardingComplete}
            onExit={handleExit}
          />
        </motion.div>
      ) : (
        <motion.div
          key="simulation"
          variants={enterVariants}
          initial="initial"
          animate="animate"
          className="min-h-screen"
        >
          <SimTurnoLayout
            profile={onboardingResult.profile}
            model={onboardingResult.model}
            painPoints={onboardingResult.painPoints}
            onExit={handleExit}
            onRestart={handleRestart}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const GuidedSimulation: React.FC = () => (
  <DemoI18nProvider>
    <DemoProvider>
      <GuidedSimulationInner />
    </DemoProvider>
  </DemoI18nProvider>
);

export default GuidedSimulation;
