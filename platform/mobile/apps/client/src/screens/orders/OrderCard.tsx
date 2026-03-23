import React, { memo, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  IconButton,
  Divider,
} from 'react-native-paper';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';

import type { Order, OrderStatus } from '../../types';

interface OrderCardProps {
  order: Order;
  onPress: (order: Order) => void;
  onTrack: (order: Order) => void;
  onCancel: (order: Order) => void;
  canTrack: boolean;
  canCancel: boolean;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Pronto',
  delivering: 'Em Entrega',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

const STATUS_ICONS: Record<OrderStatus, string> = {
  pending: 'clock-outline',
  confirmed: 'check-circle-outline',
  preparing: 'chef-hat',
  ready: 'food',
  delivering: 'truck-delivery',
  completed: 'check-circle',
  cancelled: 'close-circle-outline',
};

const OrderCard = memo<OrderCardProps>(({
  order,
  onPress,
  onTrack,
  onCancel,
  canTrack,
  canCancel,
}) => {
  const colors = useColors();
  
  const getStatusColor = useCallback((status: OrderStatus): string => {
    const statusColors: Record<OrderStatus, string> = {
      pending: colors.warning,
      confirmed: colors.info,
      preparing: colors.secondary,
      ready: colors.success,
      delivering: colors.info,
      completed: colors.success,
      cancelled: colors.destructive,
    };
    return statusColors[status] || colors.mutedForeground;
  }, [colors]);

  const statusColor = getStatusColor(order.status);
  const statusLabel = STATUS_LABELS[order.status];
  const statusIcon = STATUS_ICONS[order.status];

  const styles = useMemo(() => StyleSheet.create({
    orderCard: {
      marginBottom: 16,
      elevation: 2,
      backgroundColor: colors.card,
    },
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    orderHeaderLeft: {
      flex: 1,
      marginRight: 8,
    },
    orderNumber: {
      color: colors.mutedForeground,
      marginTop: 4,
    },
    statusChip: {
      height: 28,
    },
    statusChipText: {
      color: colors.primaryForeground,
      fontSize: 12,
    },
    divider: {
      marginVertical: 12,
      backgroundColor: colors.border,
    },
    itemsSection: {
      marginBottom: 8,
    },
    sectionTitle: {
      fontWeight: '600',
      marginBottom: 8,
      color: colors.foreground,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    itemQuantity: {
      minWidth: 30,
      fontWeight: '600',
      color: colors.mutedForeground,
    },
    itemName: {
      flex: 1,
      color: colors.foreground,
    },
    moreItems: {
      marginTop: 4,
      color: colors.mutedForeground,
      fontStyle: 'italic',
    },
    infoSection: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    infoIcon: {
      margin: 0,
      padding: 0,
      marginRight: 4,
    },
    actionsSection: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingTop: 8,
    },
    actionButton: {
      alignItems: 'center',
      padding: 8,
    },
    cancelButton: {
      opacity: 0.8,
    },
  }), [colors]);

  return (
    <TouchableOpacity
      onPress={() => onPress(order)}
      accessibilityRole="button"
      accessibilityLabel={`View order from ${order.restaurant?.name || 'Restaurant'}, status: ${statusLabel}`}
    >
      <Card style={styles.orderCard}>
        <Card.Content>
          {/* Header */}
          <View style={styles.orderHeader}>
            <View style={styles.orderHeaderLeft}>
              <Text variant="titleMedium" style={{ color: colors.foreground }}>
                {order.restaurant?.name || 'Restaurante'}
              </Text>
              <Text variant="bodySmall" style={styles.orderNumber}>
                Pedido #{order.order_number || order.id.slice(0, 8)}
              </Text>
            </View>
            <Chip
              icon={statusIcon}
              style={[styles.statusChip, { backgroundColor: statusColor }]}
              textStyle={styles.statusChipText}
            >
              {statusLabel}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          {/* Items Summary */}
          <View style={styles.itemsSection}>
            <Text variant="bodyMedium" style={styles.sectionTitle}>
              Itens ({order.items.length})
            </Text>
            {order.items.slice(0, 3).map((orderItem, index) => (
              <View key={index} style={styles.itemRow}>
                <Text variant="bodySmall" style={styles.itemQuantity}>
                  {orderItem.quantity}x
                </Text>
                <Text
                  variant="bodySmall"
                  numberOfLines={1}
                  style={styles.itemName}
                >
                  {orderItem.menu_item?.name || 'Item'}
                </Text>
              </View>
            ))}
            {order.items.length > 3 && (
              <Text variant="bodySmall" style={styles.moreItems}>
                +{order.items.length - 3} itens
              </Text>
            )}
          </View>

          <Divider style={styles.divider} />

          {/* Order Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <IconButton icon="calendar" size={16} style={styles.infoIcon} iconColor={colors.mutedForeground} />
              <Text variant="bodySmall" style={{ color: colors.foreground }}>
                {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', {
                  locale: ptBR,
                })}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <IconButton icon="cash" size={16} style={styles.infoIcon} iconColor={colors.mutedForeground} />
              <Text variant="bodySmall" style={{ color: colors.foreground }}>
                R$ {order.total_amount.toFixed(2)}
              </Text>
            </View>

            {order.order_type && (
              <View style={styles.infoRow}>
                <IconButton
                  icon={
                    order.order_type === 'delivery'
                      ? 'truck-delivery'
                      : order.order_type === 'pickup'
                      ? 'package-variant'
                      : 'silverware-fork-knife'
                  }
                  size={16}
                  style={styles.infoIcon}
                  iconColor={colors.mutedForeground}
                />
                <Text variant="bodySmall" style={{ color: colors.foreground }}>
                  {order.order_type === 'delivery'
                    ? 'Entrega'
                    : order.order_type === 'pickup'
                    ? 'Retirada'
                    : 'No Local'}
                </Text>
              </View>
            )}
          </View>

          {/* Actions */}
          {(canTrack || canCancel) && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.actionsSection}>
                {canTrack && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => onTrack(order)}
                    accessibilityRole="button"
                    accessibilityLabel="Track order"
                  >
                    <IconButton icon="map-marker-path" size={20} iconColor={colors.primary} />
                    <Text variant="bodySmall" style={{ color: colors.foreground }}>Rastrear</Text>
                  </TouchableOpacity>
                )}
                {canCancel && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => onCancel(order)}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel order"
                  >
                    <IconButton icon="close-circle-outline" size={20} iconColor={colors.destructive} />
                    <Text variant="bodySmall" style={{ color: colors.foreground }}>Cancelar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.order.id === nextProps.order.id &&
    prevProps.order.status === nextProps.order.status &&
    prevProps.canTrack === nextProps.canTrack &&
    prevProps.canCancel === nextProps.canCancel
  );
});

OrderCard.displayName = 'OrderCard';

export default OrderCard;