import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, Divider, IconButton } from 'react-native-paper';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Order, OrderStatus } from '../../types';

interface OrderCardProps {
  order: Order;
  onPress?: () => void;
  onTrack?: () => void;
  onCancel?: () => void;
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#FFA726', confirmed: '#42A5F5', preparing: '#AB47BC', ready: '#66BB6A',
  delivering: '#29B6F6', completed: '#66BB6A', cancelled: '#EF5350',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendente', confirmed: 'Confirmado', preparing: 'Preparando', ready: 'Pronto',
  delivering: 'Em Entrega', completed: 'Concluído', cancelled: 'Cancelado',
};

export default function OrderCard({ order, onPress, onTrack, onCancel }: OrderCardProps) {
  const canTrack = ['confirmed', 'preparing', 'ready', 'delivering'].includes(order.status);
  const canCancel = ['pending', 'confirmed'].includes(order.status);

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text variant="titleMedium">{order.restaurant?.name || 'Restaurante'}</Text>
              <Text variant="bodySmall" style={styles.orderNumber}>
                Pedido #{order.order_number || order.id.slice(0, 8)}
              </Text>
            </View>
            <Chip
              style={[styles.statusChip, { backgroundColor: STATUS_COLORS[order.status] }]}
              textStyle={styles.chipText}
            >
              {STATUS_LABELS[order.status]}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.items}>
            <Text variant="bodyMedium" style={styles.itemsLabel}>Itens ({order.items.length})</Text>
            {order.items.slice(0, 3).map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text variant="bodySmall" style={styles.quantity}>{item.quantity}x</Text>
                <Text variant="bodySmall" numberOfLines={1} style={styles.itemName}>
                  {item.menu_item?.name}
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

          <View style={styles.footer}>
            <View style={styles.info}>
              <View style={styles.infoRow}>
                <IconButton icon="calendar" size={16} style={styles.icon} />
                <Text variant="bodySmall">
                  {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <IconButton icon="cash" size={16} style={styles.icon} />
                <Text variant="bodySmall">R$ {order.total_amount.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {(canTrack || canCancel) && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.actions}>
                {canTrack && onTrack && (
                  <TouchableOpacity style={styles.actionButton} onPress={onTrack}>
                    <IconButton icon="map-marker-path" size={20} />
                    <Text variant="bodySmall">Rastrear</Text>
                  </TouchableOpacity>
                )}
                {canCancel && onCancel && (
                  <TouchableOpacity style={styles.actionButton} onPress={onCancel}>
                    <IconButton icon="close-circle-outline" size={20} />
                    <Text variant="bodySmall">Cancelar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 16, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  headerLeft: { flex: 1, marginRight: 8 },
  orderNumber: { color: '#666', marginTop: 4 },
  statusChip: { height: 28 },
  chipText: { color: '#fff', fontSize: 12 },
  divider: { marginVertical: 12 },
  items: { marginBottom: 8 },
  itemsLabel: { fontWeight: '600', marginBottom: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  quantity: { minWidth: 30, fontWeight: '600', color: '#666' },
  itemName: { flex: 1, color: '#333' },
  moreItems: { marginTop: 4, color: '#666', fontStyle: 'italic' },
  footer: { marginBottom: 8 },
  info: { flexDirection: 'row', gap: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  icon: { margin: 0, padding: 0, marginRight: 4 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 8 },
  actionButton: { alignItems: 'center', padding: 8 },
});
