import React from 'react';

interface DesktopRestaurantScreenProps {
  screen: string;
  activeRole: string;
  onNavigate: (screen: string) => void;
  onSelectRole: (role: any) => void;
}

export const DesktopRestaurantScreen: React.FC<DesktopRestaurantScreenProps> = ({
  screen, activeRole, onNavigate, onSelectRole,
}) => (
  <div className="p-8 text-center text-muted-foreground">
    <p className="text-sm">Desktop view — {activeRole} / {screen}</p>
    <p className="text-xs mt-2">Em construção</p>
  </div>
);
