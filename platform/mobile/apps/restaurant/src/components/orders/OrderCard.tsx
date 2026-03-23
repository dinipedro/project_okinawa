import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, IconButton, Button } from 'react-native-paper';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Order, OrderStatus } from '../../types';
import { useColors } from '../../../../shared/theme';

interface OrderCardProps {
  order: Order;
  onPress?: () => void;
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
  showActions?: boolean;
  compact?: boolean;
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#FFA726',
  confirmed: '#42A5F5',
  preparing: '#AB47BC',
  ready: '#66BB6A',
  delivering: '#29B6F6',
  completed: '#66BB6A',
  cancelled: '#EF5350',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Pronto',
  delivering: 'Em Entrega',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

export default function OrderCard({
  order,
  onPress,
  onStatusChange,
  showActions = true,
  compact = false,
}: OrderCardProps) {
  const colors = useColors();

  const styles = useMemo(() => StyleSheet.create({
    card: {
      marginBottom: 16,
      elevation: 2,
      backgroundColor: colors.card,
    },
    urgentCard: {
      borderLeftWidth: 4,
      borderLeftColor: '#d32f2f',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    headerLeft: {
      flex: 1,
      marginRight: 8,
    },
    orderTime: {
      color: colors.textMuted,
      marginTop: 4,
    },
    statusChip: {
      height: 28,
    },
    chipText: {
      color: '#fff',
      fontSize: 12,
    },
    orderItems: {
      marginBottom: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    itemRow: {
      flexDirection: 'row',
      marginBottom: 8,
      alignItems: 'flex-start',
    },
    itemQuantity: {
      fontWeight: 'bold',
      minWidth: 40,
      color: colors.primary,
    },
    itemDetails: {
      flex: 1,
    },
    itemName: {
      color: colors.foreground,
    },
    instructions: {
      color: '#FF6F00',
      marginTop: 4,
      fontStyle: 'italic',
    },
    moreItems: {
      marginTop: 4,
      color: colors.textMuted,
      fontStyle: 'italic',
    },
    orderFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    orderInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    icon: {
      margin: 0,
      padding: 0,
      marginRight: 4,
    },
    orderInfoText: {
      color: colors.foreground,
    },
    separator: {
      marginHorizontal: 8,
      color: colors.textMuted,
    },
    actionButton: {
      marginLeft: 8,
    },
    readyButton: {
      backgroundColor: '#00C853',
    },
    deliveryInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    address: {
      flex: 1,
      color: colors.textMuted,
    },
  }), [colors]);

  const getTimeElapsed = (createdAt: string) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    const minutes = Math.floor(diff / 60000);
    return minutes;
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const statusFlow: Record<OrderStatus, OrderStatus | null> = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'delivering',
      delivering: 'completed',
      completed: null,
      cancelled: null,
    };
    return statusFlow[currentStatus];
  };

  const minutesElapsed = getTimeElapsed(order.created_at);
  const isUrgent = minutesElapsed > 20;
  const nextStatus = getNextStatus(order.status);

  const handleStatusChange = () => {
    if (nextStatus && onStatusChange) {
      onStatusChange(order.id, nextStatus);
    }
  };

  const CardContent = () => (
    <Card.Content>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text variant={compact ? 'titleMedium' : 'titleLarge'} style={{ color: colors.foreground }}>
            Pedido #{order.order_number || order.id.slice(0, 8)}
          </Text>
          <Text variant="bodySmall" style={styles.orderTime}>
            {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })} - {minutesElapsed} min
          </Text>
        </View>
        <Chip
          style={[styles.statusChip, { backgroundColor: STATUS_COLORS[order.status] }]}
          textStyle={styles.chipText}
        >
          {STATUS_LABELS[order.status]}
        </Chip>
      </View>

      {!compact && (
        <View style={styles.orderItems}>
          {order.items.slice(0, 3).map((orderItem, index) => (
            <View key={index} style={styles.itemRow}>
              <Text variant="titleMedium" style={styles.itemQuantity}>
                {orderItem.quantity}x
              </Text>
              <View style={styles.itemDetails}>
                <Text variant="bodyMedium" style={styles.itemName}>{orderItem.menu_item?.name}</Text>
                {orderItem.special_instructions && (
                  <Text variant="bodySmall" style={styles.instructions}>
                    ⚠️ {orderItem.special_instructions}
                  </Text>
                )}
              </View>
            </View>
          ))}
          {order.items.length > 3 && (
            <Text variant="bodySmall" style={styles.moreItems}>
              +{order.items.length - 3} itens
            </Text>
          )}
        </View>
      )}

      <View style={styles.orderFooter}>
        <View style={styles.orderInfo}>
          <IconButton
            icon={
              order.order_type === 'delivery'
                ? 'truck-delivery'
                : order.order_type === 'pickup'
                ? 'package-variant'
                : 'silverware-fork-knife'
            }
            size={20}
            style={styles.icon}
            iconColor={colors.textMuted}
          />
          <Text variant="bodySmall" style={styles.orderInfoText}>
            {order.order_type === 'delivery' ? 'Entrega' : order.order_type === 'pickup' ? 'Retirada' : 'Mesa'}
          </Text>
          <Text variant="bodySmall" style={styles.separator}>
            •
          </Text>
          <Text variant="bodySmall" style={styles.orderInfoText}>R$ {order.total_amount.toFixed(2)}</Text>
        </View>

        {showActions && nextStatus && (
          <Button
            mode="contained"
            onPress={handleStatusChange}
            compact
            style={[styles.actionButton, order.status === 'preparing' && styles.readyButton]}
          >
            {order.status === 'confirmed'
              ? 'Iniciar'
              : order.status === 'preparing'
              ? 'Pronto'
              : `Marcar como ${STATUS_LABELS[nextStatus]}`}
          </Button>
        )}
      </View>

      {order.delivery_address && order.order_type === 'delivery' && !compact && (
        <View style={styles.deliveryInfo}>
          <IconButton icon="map-marker" size={16} style={styles.icon} iconColor={colors.textMuted} />
          <Text variant="bodySmall" numberOfLines={2} style={styles.address}>
            {order.delivery_address.street}, {order.delivery_address.number} - {order.delivery_address.neighborhood}
          </Text>
        </View>
      )}
    </Card.Content>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Card style={[styles.card, isUrgent && styles.urgentCard]}>{CardContent()}</Card>
      </TouchableOpacity>
    );
  }

  return <Card style={[styles.card, isUrgent && styles.urgentCard]}>{CardContent()}</Card>;
}
