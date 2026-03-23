import React from 'react';

interface TabletRestaurantScreenProps {
  screen: string;
  activeRole: string;
  onNavigate: (screen: string) => void;
  onSelectRole: (role: any) => void;
}

export const TabletRestaurantScreen: React.FC<TabletRestaurantScreenProps> = ({
  screen, activeRole, onNavigate, onSelectRole,
}) => (
  <div className="p-8 text-center text-muted-foreground">
    <p className="text-sm">Tablet view — {activeRole} / {screen}</p>
    <p className="text-xs mt-2">Em construção</p>
  </div>
);
