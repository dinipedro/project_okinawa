import { useEffect } from 'react';
import analytics from '../services/analytics';

/**
 * Hook para tracking automático de screen views
 * Registra automaticamente quando o componente é montado
 * @param screenName - Nome da tela a ser registrada
 * @example
 * ```tsx
 * function RestaurantScreen() {
 *   useScreenTracking('Restaurant Details');
 *   return <View>...</View>;
 * }
 * ```
 */
export function useScreenTracking(screenName: string) {
  useEffect(() => {
    analytics.logScreenView(screenName);
  }, [screenName]);
}

/**
 * Hook para acessar o analytics service
 * Retorna instância do service para uso manual
 * @returns AnalyticsService instance
 * @example
 * ```tsx
 * function ProductScreen() {
 *   const analytics = useAnalytics();
 *
 *   const handleAddToCart = (item: MenuItem) => {
 *     analytics.logAddToCart(item.id, item.name, item.price, 1);
 *     addToCart(item);
 *   };
 *
 *   return <Button onPress={() => handleAddToCart(item)} />;
 * }
 * ```
 */
export function useAnalytics() {
  return analytics;
}
