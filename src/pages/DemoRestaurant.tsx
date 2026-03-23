/**
 * Demo Restaurant Page — Refined responsive layouts
 *
 * Mobile:  Compact header + inline journey stepper + PhoneShell content
 * Tablet:  Sidebar journey + content, no PhoneShell
 * Desktop: 3-column with both sidebars visible
 *
 * ViewportSwitch: allows user to preview any layout regardless of device
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { DemoProvider, useDemoContext } from '@/contexts/DemoContext';
import { PhoneShell } from '@/components/demo/DemoShared';
import DemoFeedbackWidget, { trackDemoAction } from '@/components/demo/DemoFeedbackWidget';
import { DemoAutoTranslate, DemoI18nProvider, DemoLangSelector, useDemoI18n } from '@/components/demo/DemoI18n';
import {
  ArrowLeft, Check, ChevronDown, ChevronRight, ChevronLeft,
  Info, List, Monitor, Smartphone, Tablet, X, Zap,
} from 'lucide-react';
import {
  ROLE_CONFIG,
  ROLE_JOURNEYS,
  SCREEN_INFO,
  type RestaurantScreen,
  type StaffRole,
} from '@/components/demo/restaurant/RestaurantDemoShared';
import { MobileRestaurantScreen } from '@/components/demo/restaurant/MobileRestaurantScreens';
import { TabletRestaurantScreen } from '@/components/demo/restaurant/TabletRestaurantScreen';
import { DesktopRestaurantScreen } from '@/components/demo/restaurant/DesktopRestaurantScreen';
import { useDeviceType } from '@/hooks/useDeviceType';
import { ViewportSwitch, type ViewportMode } from '@/components/demo/ViewportSwitch';

// ─────────────────────────────────────────────
// Journey steps adapter
// ─────────────────────────────────────────────

interface RoleJourneyStep {
  step: number;
  label: string;
  screenKey: string;
  screens: RestaurantScreen[];
  icon: React.FC<{ className?: string }>;
  desc: string;
}

function buildJourneySteps(role: StaffRole): RoleJourneyStep[] {
  return ROLE_JOURNEYS[role].map((stage, index) => ({
    step: index + 1,
    label: stage.label,
    screenKey: stage.screen,
    screens: [stage.screen],
    icon: stage.icon,
    desc: stage.desc,
  }));
}

// ─────────────────────────────────────────────
// Shared types
// ─────────────────────────────────────────────

interface LayoutProps {
  activeRole: StaffRole;
  setActiveRole: (r: StaffRole) => void;
  currentScreen: RestaurantScreen;
  setCurrentScreen: (s: RestaurantScreen) => void;
  roleConfig: (typeof ROLE_CONFIG)[0];
  steps: RoleJourneyStep[];
  info: { title: string; desc: string };
  roleLabel: (id: StaffRole) => string;
  roleDesc: (id: StaffRole) => string;
  stepLabel: (key: string) => string;
  t: (ns: string, key: string) => string;
  restaurant: { name: string };
  currentStepIdx: number;
  viewportMode: ViewportMode;
  setViewportMode: (m: ViewportMode) => void;
}

// ─────────────────────────────────────────────
// Shared header bar (used by all 3 layouts)
// ─────────────────────────────────────────────

const DemoHeader: React.FC<{
  viewportMode: ViewportMode;
  setViewportMode: (m: ViewportMode) => void;
  t: (ns: string, key: string) => string;
  compact?: boolean;
  children?: React.ReactNode;
}> = ({ viewportMode, setViewportMode, t, compact, children }) => (
  <header className={`flex items-center justify-between border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-30 ${compact ? 'px-3 py-2' : 'px-5 py-3'}`}>
    <div className="flex items-center gap-3">
      <Link to="/demo" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        {!compact && <span>{t('shared', 'backToDemo')}</span>}
      </Link>
      {children}
    </div>
    <div className="flex items-center gap-2">
      <ViewportSwitch value={viewportMode} onChange={setViewportMode} />
      <DemoLangSelector />
    </div>
  </header>
);

// ═════════════════════════════════════════════
// MOBILE LAYOUT — mirrors DemoClient pattern
// Sidebar journey on the left + PhoneShell center
// ═════════════════════════════════════════════

const MobileLayout: React.FC<LayoutProps> = ({
  activeRole, setActiveRole, currentScreen, setCurrentScreen,
  roleConfig, steps, info, roleLabel, roleDesc, stepLabel, t, restaurant, currentStepIdx,
  viewportMode, setViewportMode,
}) => {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center py-6 px-4">
      {/* ── Header ── */}
      <div className="w-full max-w-7xl flex items-center justify-between mb-4">
        <Link to="/demo" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />{t('shared', 'backToDemo')}
        </Link>
        <div className="flex items-center gap-3">
          <ViewportSwitch value={viewportMode} onChange={setViewportMode} />
          <DemoLangSelector />
          <Link to="/demo/client" className="px-3 py-1.5 rounded-full border border-border text-xs font-medium hover:bg-muted transition-colors">
            {t('shared', 'viewClientDemo')}
          </Link>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">{t('shared', 'demoRestaurant')}</span>
        </div>
      </div>

      {/* ── Role Selector — horizontal scroll ── */}
      <div className="w-full max-w-7xl mb-4">
        <div className="flex items-center gap-3 mb-3">
          <Zap className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">{t('restaurant', 'chooseProfile')}</h2>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {ROLE_CONFIG.map(role => {
            const isActive = activeRole === role.id;
            const RoleIcon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-primary bg-primary/10 shadow-sm shadow-primary/10'
                    : 'border-border bg-card hover:border-primary/30 hover:bg-muted/50'
                }`}
              >
                <div className={`flex h-6 w-6 items-center justify-center rounded-md ${role.bgClass}`}>
                  <RoleIcon className={`w-3 h-3 ${role.colorClass}`} />
                </div>
                <div className="text-left">
                  <p className={`text-xs font-semibold ${isActive ? 'text-primary' : 'text-foreground'}`}>{roleLabel(role.id)}</p>
                  <p className="text-[10px] text-muted-foreground hidden sm:block">{roleDesc(role.id)}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active role title bar ── */}
      <div className="w-full max-w-7xl mb-4">
        <div className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r ${roleConfig.gradient} border border-border/50`}>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${roleConfig.bgClass}`}>
            <roleConfig.icon className={`w-5 h-5 ${roleConfig.colorClass}`} />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">{restaurant.name}</h1>
            <p className="text-sm text-muted-foreground">{roleLabel(activeRole)} · {roleDesc(activeRole)}</p>
          </div>
        </div>
      </div>

      {/* ── Main content: journey sidebar + phone + info ── */}
      <div className="flex gap-8 items-start max-w-7xl w-full justify-center">
        {/* Journey sidebar — visible on md+ */}
        <div className="hidden md:block w-60 shrink-0 sticky top-8">
          <h2 className="font-display text-sm font-bold mb-1 text-foreground">
            {t('restaurant', 'journeyOf')} {roleLabel(activeRole)}
          </h2>
          <p className="text-xs text-muted-foreground mb-2">{t('shared', 'followSteps')}</p>
          {/* Progress */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
              <span>Progresso</span>
              <span className="font-semibold text-foreground">{Math.round(((currentStepIdx + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${((currentStepIdx + 1) / steps.length) * 100}%` }} />
            </div>
          </div>
          <div className="space-y-0.5">
            {steps.map(({ step, screenKey, screens, icon: StepIcon, desc }) => {
              const isActive = screens.includes(currentScreen);
              const isPast = currentStepIdx > steps.findIndex(s => s.step === step);
              return (
                <button
                  key={step}
                  onClick={() => setCurrentScreen(screens[0])}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${
                    isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isActive ? 'bg-primary text-primary-foreground'
                    : isPast ? 'bg-success/20 text-success'
                    : 'bg-muted text-muted-foreground'
                  }`}>
                    {isPast && !isActive ? <Check className="w-3 h-3" /> : <StepIcon className="w-3 h-3" />}
                  </div>
                  <div className="min-w-0">
                    <span className={`text-xs ${isActive ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{stepLabel(screenKey)}</span>
                    <p className="text-[9px] text-muted-foreground truncate">{desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Phone */}
        <div className="relative">
          <PhoneShell>
            <MobileRestaurantScreen
              screen={currentScreen}
              activeRole={activeRole}
              onNavigate={screen => setCurrentScreen(screen as RestaurantScreen)}
              onSelectRole={setActiveRole}
            />
          </PhoneShell>
        </div>

        {/* Info sidebar — visible on xl+ */}
        <div className="hidden xl:block w-72 shrink-0 sticky top-8">
          <div className="p-5 rounded-2xl bg-card border border-border mb-5">
            <h3 className="font-display font-bold mb-2">{info.title}</h3>
            <p className="text-sm text-muted-foreground">{info.desc}</p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border mb-5">
            <h3 className="font-display font-bold text-sm mb-3">{t('shared', 'otherProfiles')}</h3>
            <div className="space-y-1.5">
              {ROLE_CONFIG.filter(r => r.id !== activeRole).map(role => {
                const RIcon = role.icon;
                return (
                  <button key={role.id} onClick={() => setActiveRole(role.id)}
                    className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition-colors hover:bg-muted/50">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${role.bgClass}`}>
                      <RIcon className={`w-3.5 h-3.5 ${role.colorClass}`} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">{roleLabel(role.id)}</p>
                      <p className="text-[10px] text-muted-foreground">{roleDesc(role.id)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
            <h3 className="font-display font-bold mb-2">{t('shared', 'wantThis')}</h3>
            <p className="text-xs text-muted-foreground mb-4">{t('shared', 'ctaDesc')}</p>
            <a
              href="https://wa.me/5511999999999?text=Olá! Vi a demo do app restaurante da NOOWE e gostaria de saber mais."
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm shadow-glow"
            >
              {t('shared', 'talkToTeam')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════
// TABLET LAYOUT (768px – 1199px)
// ═════════════════════════════════════════════

const TabletLayout: React.FC<LayoutProps> = ({
  activeRole, setActiveRole, currentScreen, setCurrentScreen,
  roleConfig, steps, info, roleLabel, roleDesc, stepLabel, t, restaurant,
  viewportMode, setViewportMode, currentStepIdx,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* ── Header ── */}
      <DemoHeader viewportMode={viewportMode} setViewportMode={setViewportMode} t={t}>
        <div className="h-5 w-px bg-border" />
        <div className="flex items-center gap-2">
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${roleConfig.bgClass}`}>
            <roleConfig.icon className={`w-3.5 h-3.5 ${roleConfig.colorClass}`} />
          </div>
          <span className="text-sm font-semibold text-foreground">{restaurant.name}</span>
          <span className="text-xs text-muted-foreground">· {roleLabel(activeRole)}</span>
        </div>
      </DemoHeader>

      {/* ── Role selector — compact horizontal ── */}
      <div className="px-5 py-3 border-b border-border/50 bg-card/30">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {ROLE_CONFIG.map(role => {
            const isActive = activeRole === role.id;
            const RoleIcon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all shrink-0 ${
                  isActive
                    ? 'border-primary bg-primary/10 shadow-sm shadow-primary/10'
                    : 'border-border bg-card hover:border-primary/30'
                }`}
              >
                <div className={`flex h-6 w-6 items-center justify-center rounded-md shrink-0 ${role.bgClass}`}>
                  <RoleIcon className={`w-3 h-3 ${role.colorClass}`} />
                </div>
                <div className="text-left min-w-0">
                  <p className={`text-xs font-semibold truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>{roleLabel(role.id)}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main area: sidebar + content ── */}
      <div className="flex flex-1 px-5 py-4 gap-4">
        {/* Journey sidebar */}
        <div className={`shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-14' : 'w-56'}`}>
          <div className="sticky top-16 space-y-2">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors w-full"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4 shrink-0" /> : <ChevronLeft className="w-4 h-4 shrink-0" />}
              {!sidebarCollapsed && <span className="truncate font-semibold">{t('restaurant', 'journeyOf')} {roleLabel(activeRole)}</span>}
            </button>

            {/* Progress */}
            {!sidebarCollapsed && (
              <div className="px-2 pb-1">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Progresso</span>
                  <span className="font-semibold text-foreground">{Math.round(((currentStepIdx + 1) / steps.length) * 100)}%</span>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((currentStepIdx + 1) / steps.length) * 100}%` }} />
                </div>
              </div>
            )}

            <div className="space-y-0.5">
              {steps.map(({ step, screenKey, screens, icon: StepIcon, desc }) => {
                const isActive = screens.includes(currentScreen);
                const isPast = currentStepIdx > steps.findIndex(s => s.step === step);
                return (
                  <button
                    key={step}
                    onClick={() => setCurrentScreen(screens[0])}
                    title={sidebarCollapsed ? stepLabel(screenKey) : undefined}
                    className={`w-full flex items-center gap-3 rounded-xl transition-all ${
                      sidebarCollapsed ? 'p-2 justify-center' : 'p-2.5'
                    } ${isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'}`}
                  >
                    <div className={`${sidebarCollapsed ? 'w-8 h-8' : 'w-7 h-7'} rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-primary text-primary-foreground' : isPast ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                    }`}>
                      {isPast && !isActive ? <Check className="w-3.5 h-3.5" /> : <StepIcon className="w-3.5 h-3.5" />}
                    </div>
                    {!sidebarCollapsed && (
                      <div className="min-w-0">
                        <p className={`text-xs truncate ${isActive ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{stepLabel(screenKey)}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{desc}</p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Central content — no PhoneShell */}
        <div className="flex-1 min-w-0">
          <div className="rounded-2xl border border-border bg-card/30 overflow-hidden">
            <TabletRestaurantScreen
              screen={currentScreen}
              activeRole={activeRole}
              onNavigate={screen => setCurrentScreen(screen as RestaurantScreen)}
              onSelectRole={setActiveRole}
            />
          </div>
        </div>

        {/* Info toggle button (floating) */}
        <button
          onClick={() => setInfoOpen(!infoOpen)}
          className="fixed bottom-6 right-6 z-20 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all"
          aria-label="Info"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* ── Info slide-over ── */}
      {infoOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setInfoOpen(false)} />
          <div className="relative w-80 bg-card border-l border-border h-full overflow-y-auto p-5 space-y-5 animate-in slide-in-from-right">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">{info.title}</h3>
              <button onClick={() => setInfoOpen(false)} className="p-1 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-muted-foreground">{info.desc}</p>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('shared', 'otherProfiles')}</h4>
              {ROLE_CONFIG.filter(r => r.id !== activeRole).map(role => {
                const RIcon = role.icon;
                return (
                  <button key={role.id} onClick={() => { setActiveRole(role.id); setInfoOpen(false); }}
                    className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition-colors hover:bg-muted/50">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${role.bgClass}`}><RIcon className={`w-3.5 h-3.5 ${role.colorClass}`} /></div>
                    <div><p className="text-xs font-medium text-foreground">{roleLabel(role.id)}</p><p className="text-[10px] text-muted-foreground">{roleDesc(role.id)}</p></div>
                  </button>
                );
              })}
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
              <h4 className="font-display font-bold text-sm mb-2">{t('shared', 'wantThis')}</h4>
              <p className="text-xs text-muted-foreground mb-3">{t('shared', 'ctaDesc')}</p>
              <a href="https://wa.me/5511999999999?text=Olá! Vi a demo do app restaurante da NOOWE e gostaria de saber mais."
                target="_blank" rel="noopener noreferrer"
                className="block text-center py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm">
                {t('shared', 'talkToTeam')}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════
// DESKTOP LAYOUT (≥ 1200px)
// ═════════════════════════════════════════════

const DesktopLayout: React.FC<LayoutProps> = ({
  activeRole, setActiveRole, currentScreen, setCurrentScreen,
  roleConfig, steps, info, roleLabel, roleDesc, stepLabel, t, restaurant, currentStepIdx,
  viewportMode, setViewportMode,
}) => {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* ── Sticky header ── */}
      <DemoHeader viewportMode={viewportMode} setViewportMode={setViewportMode} t={t}>
        <div className="h-5 w-px bg-border" />
        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          {t('shared', 'demoRestaurant')}
        </span>
      </DemoHeader>

      {/* ── Rich role banner ── */}
      <div className="px-5 py-4">
        <div className={`flex items-center gap-5 p-5 rounded-2xl bg-gradient-to-r ${roleConfig.gradient} border border-border/50`}>
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${roleConfig.bgClass} shadow-sm`}>
            <roleConfig.icon className={`w-7 h-7 ${roleConfig.colorClass}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl font-bold text-foreground">{restaurant.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {roleLabel(activeRole)} — {roleDesc(activeRole)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{t('restaurant', 'chooseProfile')}:</span>
            <div className="flex gap-1.5">
              {ROLE_CONFIG.map(role => {
                const isActive = activeRole === role.id;
                const RoleIcon = role.icon;
                return (
                  <button
                    key={role.id}
                    onClick={() => setActiveRole(role.id)}
                    title={roleLabel(role.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${
                      isActive
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-border bg-card/80 hover:border-primary/30 hover:bg-muted/50'
                    }`}
                  >
                    <div className={`flex h-6 w-6 items-center justify-center rounded-md ${role.bgClass}`}>
                      <RoleIcon className={`w-3 h-3 ${role.colorClass}`} />
                    </div>
                    <span className={`text-xs font-semibold whitespace-nowrap ${isActive ? 'text-primary' : 'text-foreground'}`}>
                      {roleLabel(role.id)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3-column layout ── */}
      <div className="flex px-5 pb-6 gap-5 items-start">
        {/* Left: Journey sidebar */}
        <nav className="w-52 shrink-0 sticky top-16">
          <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
            <h2 className="font-display text-xs font-bold text-foreground mb-1">
              {t('restaurant', 'journeyOf')} {roleLabel(activeRole)}
            </h2>
            {/* Progress */}
            <div className="pb-2">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                <span>Progresso</span>
                <span className="font-semibold text-foreground">{Math.round(((currentStepIdx + 1) / steps.length) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((currentStepIdx + 1) / steps.length) * 100}%` }} />
              </div>
            </div>
            {steps.map(({ step, screenKey, screens, icon: StepIcon, desc }) => {
              const isActive = screens.includes(currentScreen);
              const isPast = currentStepIdx > steps.findIndex(s => s.step === step);
              return (
                <button
                  key={step}
                  onClick={() => setCurrentScreen(screens[0])}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${
                    isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-primary text-primary-foreground' : isPast ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                  }`}>
                    {isPast && !isActive ? <Check className="w-3.5 h-3.5" /> : <StepIcon className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs ${isActive ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{stepLabel(screenKey)}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Center: Main content */}
        <main className="flex-1 min-w-0">
          <DesktopRestaurantScreen
            screen={currentScreen}
            activeRole={activeRole}
            onNavigate={screen => setCurrentScreen(screen as RestaurantScreen)}
            onSelectRole={setActiveRole}
          />
        </main>

        {/* Right: Info sidebar */}
        <aside className="w-64 shrink-0 sticky top-16 space-y-4 hidden xl:block">
          {/* Current screen info */}
          <div className="p-5 rounded-2xl bg-card border border-border">
            <h3 className="font-display font-bold mb-2">{info.title}</h3>
            <p className="text-sm text-muted-foreground">{info.desc}</p>
          </div>

          {/* Switch profiles */}
          <div className="p-5 rounded-2xl bg-card border border-border">
            <h3 className="font-display font-bold text-sm mb-3">{t('shared', 'otherProfiles')}</h3>
            <div className="space-y-1.5">
              {ROLE_CONFIG.filter(r => r.id !== activeRole).map(role => {
                const RIcon = role.icon;
                return (
                  <button
                    key={role.id}
                    onClick={() => setActiveRole(role.id)}
                    className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition-colors hover:bg-muted/50"
                  >
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${role.bgClass}`}>
                      <RIcon className={`w-3.5 h-3.5 ${role.colorClass}`} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">{roleLabel(role.id)}</p>
                      <p className="text-[10px] text-muted-foreground">{roleDesc(role.id)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
            <h3 className="font-display font-bold mb-2">{t('shared', 'wantThis')}</h3>
            <p className="text-xs text-muted-foreground mb-4">{t('shared', 'ctaDesc')}</p>
            <a
              href="https://wa.me/5511999999999?text=Olá! Vi a demo do app restaurante da NOOWE e gostaria de saber mais."
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm shadow-glow"
            >
              {t('shared', 'talkToTeam')}
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════

const DemoRestaurantInner = () => {
  const device = useDeviceType();
  const [viewportMode, setViewportMode] = useState<ViewportMode>(device);
  const [activeRole, setActiveRole] = useState<StaffRole>('owner');
  const [currentScreen, setCurrentScreen] = useState<RestaurantScreen>('dashboard');
  const { restaurant } = useDemoContext();
  const { lang, t } = useDemoI18n();

  // Sync viewport mode to device only on initial mount
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (!initialized) {
      setViewportMode(device);
      setInitialized(true);
    }
  }, [device, initialized]);

  const roleConfig = useMemo(() => ROLE_CONFIG.find(r => r.id === activeRole)!, [activeRole]);
  const steps = useMemo(() => buildJourneySteps(activeRole), [activeRole]);

  const info = {
    title: t('screenTitles', currentScreen) !== currentScreen ? t('screenTitles', currentScreen) : (SCREEN_INFO[currentScreen]?.title || 'Demo'),
    desc: t('screenDescs', currentScreen) !== currentScreen ? t('screenDescs', currentScreen) : (SCREEN_INFO[currentScreen]?.desc || ''),
  };
  const currentStepIdx = steps.findIndex(s => s.screens.includes(currentScreen));

  const roleLabel = (id: StaffRole) => t('roles', id);
  const roleDesc = (id: StaffRole) => t('roleDescs', id);
  const stepLabel = (screenKey: string) => {
    const translated = t('journeySteps', screenKey);
    return translated !== screenKey ? translated : screenKey;
  };

  useEffect(() => {
    setCurrentScreen(roleConfig.defaultScreen);
  }, [activeRole, roleConfig]);

  const sharedProps: LayoutProps = {
    activeRole, setActiveRole, currentScreen, setCurrentScreen,
    roleConfig, steps, info, roleLabel, roleDesc, stepLabel, t, restaurant, currentStepIdx,
    viewportMode, setViewportMode,
  };

  // Scale logic: when user picks a layout that doesn't match real device
  const isScaledDown = (viewportMode === 'desktop' && device !== 'desktop');
  const isScaledUp = (viewportMode === 'mobile' && device === 'desktop');

  const renderLayout = () => {
    switch (viewportMode) {
      case 'mobile': return <MobileLayout {...sharedProps} />;
      case 'tablet': return <TabletLayout {...sharedProps} />;
      case 'desktop': return <DesktopLayout {...sharedProps} />;
    }
  };

  // Calculate scale factor for cross-device previews
  const getScaleStyles = (): React.CSSProperties | undefined => {
    if (isScaledDown) {
      const scale = device === 'mobile' ? 0.38 : 0.72;
      return {
        width: '1400px',
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        height: `${100 / scale}%`,
      };
    }
    return undefined;
  };

  // Track role/screen changes as actions
  useEffect(() => {
    trackDemoAction(`role:${activeRole}`);
  }, [activeRole]);

  useEffect(() => {
    trackDemoAction(`screen:${currentScreen}`);
  }, [currentScreen]);

  const feedbackContext = useMemo(() => ({
    viewportMode,
    activeRole,
    journeyStep: steps[currentStepIdx]?.screenKey || currentScreen,
    currentScreen,
  }), [viewportMode, activeRole, currentStepIdx, steps, currentScreen]);

  return (
    <>
      <Helmet>
        <title>{t('restaurant', 'title')}</title>
        <meta name="description" content={t('restaurant', 'metaDesc')} />
      </Helmet>

      <DemoAutoTranslate>
        {isScaledDown ? (
          <div className="w-full overflow-x-auto overflow-y-hidden" style={{ height: device === 'mobile' ? '260vh' : '140vh' }}>
            <div style={getScaleStyles()}>
              {renderLayout()}
            </div>
          </div>
        ) : isScaledUp ? (
          <div className="flex justify-center py-8 bg-muted/30 min-h-screen">
            <div className="w-[420px] shadow-2xl rounded-3xl border border-border overflow-hidden bg-background">
              {renderLayout()}
            </div>
          </div>
        ) : (
          renderLayout()
        )}
      </DemoAutoTranslate>

      <DemoFeedbackWidget context={feedbackContext} />
    </>
  );
};

const DemoRestaurant = () => (
  <DemoI18nProvider>
    <DemoProvider>
      <DemoRestaurantInner />
    </DemoProvider>
  </DemoI18nProvider>
);

export default DemoRestaurant;
