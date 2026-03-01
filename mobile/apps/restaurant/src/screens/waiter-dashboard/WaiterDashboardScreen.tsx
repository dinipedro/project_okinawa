import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  Badge,
  FAB,
  Avatar,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useColors } from '@/shared/theme';

interface Table {
  id: string;
  number: string;
  status: 'available' | 'occupied' | 'reserved' | 'needs_cleaning';
  guests?: number;
  waiter_id?: string;
  order_id?: string;
  order_total?: number;
  seated_at?: string;
}

interface WaiterStats {
  tables_assigned: number;
  active_orders: number;
  today_tips: number;
  today_sales: number;
}

const mockTables: Table[] = [
  {
    id: '1',
    number: '12',
    status: 'occupied',
    guests: 4,
    waiter_id: 'current_user',
    order_id: 'ord_123',
    order_total: 245.50,
    seated_at: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: '2',
    number: '8',
    status: 'occupied',
    guests: 2,
    waiter_id: 'current_user',
    order_id: 'ord_124',
    order_total: 98.00,
    seated_at: new Date(Date.now() - 20 * 60000).toISOString(),
  },
  {
    id: '3',
    number: '5',
    status: 'needs_cleaning',
    waiter_id: 'current_user',
  },
  {
    id: '4',
    number: '15',
    status: 'reserved',
    guests: 6,
    waiter_id: 'current_user',
  },
];

const mockStats: WaiterStats = {
  tables_assigned: 8,
  active_orders: 2,
  today_tips: 145.80,
  today_sales: 1250.00,
};

export default function WaiterDashboardScreen() {
  const navigation = useNavigation();
  const colors = useColors();
  const [tables, setTables] = useState<Table[]>([]);
  const [stats, setStats] = useState<WaiterStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [tablesData, statsData] = await Promise.all([
        ApiService.getWaiterTables(),
        ApiService.getWaiterStats(),
      ]);
      setTables(tablesData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return colors.success;
      case 'reserved':
        return colors.info;
      case 'needs_cleaning':
        return colors.warning;
      default:
        return colors.muted;
    }
  };

  const getTableStatusIcon = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'account-group';
      case 'reserved':
        return 'calendar-check';
      case 'needs_cleaning':
        return 'broom';
      default:
        return 'table-furniture';
    }
  };

  const getTableStatusLabel = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'Ocupada';
      case 'reserved':
        return 'Reservada';
      case 'needs_cleaning':
        return 'Precisa Limpar';
      default:
        return 'Disponível';
    }
  };

  const getSeatedTime = (seatedAt?: string) => {
    if (!seatedAt) return '';
    const minutes = Math.floor((Date.now() - new Date(seatedAt).getTime()) / 60000);
    return `${minutes} min`;
  };

  const handleTablePress = (table: Table) => {
    if (table.order_id) {
      navigation.navigate('Orders' as never, { orderId: table.order_id } as never);
    } else {
      // Open table details or create new order
      navigation.navigate('Orders' as never, { tableId: table.id } as never);
    }
  };

  const myTables = tables.filter((t) => t.waiter_id === 'current_user');
  const occupiedTables = myTables.filter((t) => t.status === 'occupied');

  return (
    <View style={styles.container}>
      {/* Stats Header */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <View style={styles.statIcon}>
              <Icon name="table-furniture" size={24} color="#2196F3" />
            </View>
            <Text variant="bodySmall" style={styles.statLabel}>
              Mesas
            </Text>
            <Text variant="headlineSmall" style={styles.statValue}>
              {stats.tables_assigned}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <View style={styles.statIcon}>
              <Icon name="receipt" size={24} color="#4CAF50" />
            </View>
            <Text variant="bodySmall" style={styles.statLabel}>
              Pedidos Ativos
            </Text>
            <Text variant="headlineSmall" style={styles.statValue}>
              {stats.active_orders}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <View style={styles.statIcon}>
              <Icon name="cash-multiple" size={24} color="#FF9800" />
            </View>
            <Text variant="bodySmall" style={styles.statLabel}>
              Gorjetas Hoje
            </Text>
            <Text variant="headlineSmall" style={styles.statValue}>
              R$ {stats.today_tips.toFixed(2)}
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => navigation.navigate('Orders' as never)}
          style={styles.quickActionButton}
        >
          Novo Pedido
        </Button>

        <Button
          mode="outlined"
          icon="qrcode-scan"
          onPress={() => navigation.navigate('QRScanner' as never)}
          style={styles.quickActionButton}
        >
          Escanear Mesa
        </Button>
      </View>

      {/* My Tables */}
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Minhas Mesas ({myTables.length})
        </Text>

        {myTables.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="table-furniture" size={80} color="#ccc" />
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              Nenhuma Mesa Atribuída
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Aguardando atribuição de mesas pelo gerente
            </Text>
          </View>
        ) : (
          <>
            {/* Occupied Tables */}
            {occupiedTables.length > 0 && (
              <>
                <Text variant="titleMedium" style={styles.subsectionTitle}>
                  Ocupadas ({occupiedTables.length})
                </Text>
                {occupiedTables.map((table) => (
                  <TouchableOpacity
                    key={table.id}
                    onPress={() => handleTablePress(table)}
                    activeOpacity={0.7}
                  >
                    <Card style={styles.tableCard}>
                      <Card.Content>
                        <View style={styles.tableHeader}>
                          <View style={styles.tableHeaderLeft}>
                            <Avatar.Text
                              size={48}
                              label={table.number}
                              style={[
                                styles.tableAvatar,
                                { backgroundColor: getTableStatusColor(table.status) },
                              ]}
                            />
                            <View style={styles.tableInfo}>
                              <Text variant="titleLarge" style={styles.tableNumber}>
                                Mesa {table.number}
                              </Text>
                              <View style={styles.tableMetaRow}>
                                <Icon name="account-group" size={14} color="#666" />
                                <Text variant="bodySmall" style={styles.tableMetaText}>
                                  {table.guests} pessoas
                                </Text>
                                <Text variant="bodySmall" style={styles.separator}>
                                  •
                                </Text>
                                <Icon name="clock-outline" size={14} color="#666" />
                                <Text variant="bodySmall" style={styles.tableMetaText}>
                                  {getSeatedTime(table.seated_at)}
                                </Text>
                              </View>
                            </View>
                          </View>

                          <Chip
                            icon={getTableStatusIcon(table.status)}
                            style={[
                              styles.statusChip,
                              { backgroundColor: `${getTableStatusColor(table.status)}20` },
                            ]}
                            textStyle={{ color: getTableStatusColor(table.status) }}
                          >
                            {getTableStatusLabel(table.status)}
                          </Chip>
                        </View>

                        {table.order_total && (
                          <View style={styles.orderSummary}>
                            <View style={styles.orderTotal}>
                              <Text variant="bodyMedium" style={styles.orderLabel}>
                                Total do Pedido:
                              </Text>
                              <Text variant="titleLarge" style={styles.orderTotalValue}>
                                R$ {table.order_total.toFixed(2)}
                              </Text>
                            </View>

                            <View style={styles.tableActions}>
                              <Button
                                mode="text"
                                compact
                                onPress={() =>
                                  navigation.navigate('Orders' as never, {
                                    orderId: table.order_id,
                                  } as never)
                                }
                              >
                                Ver Pedido
                              </Button>
                              <Button
                                mode="text"
                                compact
                                onPress={() =>
                                  navigation.navigate('Payment' as never, {
                                    orderId: table.order_id,
                                  } as never)
                                }
                              >
                                Fechar Conta
                              </Button>
                            </View>
                          </View>
                        )}
                      </Card.Content>
                    </Card>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* Other Status Tables */}
            {myTables.filter((t) => t.status !== 'occupied').length > 0 && (
              <>
                <Text variant="titleMedium" style={styles.subsectionTitle}>
                  Outras
                </Text>
                {myTables
                  .filter((t) => t.status !== 'occupied')
                  .map((table) => (
                    <TouchableOpacity
                      key={table.id}
                      onPress={() => handleTablePress(table)}
                      activeOpacity={0.7}
                    >
                      <Card style={styles.tableCardCompact}>
                        <Card.Content style={styles.compactContent}>
                          <View style={styles.compactLeft}>
                            <Avatar.Text
                              size={40}
                              label={table.number}
                              style={[
                                styles.tableAvatarSmall,
                                { backgroundColor: getTableStatusColor(table.status) },
                              ]}
                            />
                            <Text variant="titleMedium" style={styles.compactTableNumber}>
                              Mesa {table.number}
                            </Text>
                          </View>

                          <Chip
                            icon={getTableStatusIcon(table.status)}
                            style={[
                              styles.statusChipSmall,
                              { backgroundColor: `${getTableStatusColor(table.status)}20` },
                            ]}
                            textStyle={{ color: getTableStatusColor(table.status) }}
                            compact
                          >
                            {getTableStatusLabel(table.status)}
                          </Chip>
                        </Card.Content>
                      </Card>
                    </TouchableOpacity>
                  ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        label="Novo Pedido"
        style={styles.fab}
        onPress={() => navigation.navigate('Orders' as never)}
      />
    </View>
  );
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    statsContainer: {
      flexDirection: 'row',
      padding: 15,
      gap: 10,
    },
    statCard: {
      flex: 1,
      elevation: 2,
      backgroundColor: colors.card,
    },
    statContent: {
      alignItems: 'center',
      paddingVertical: 10,
    },
    statIcon: {
      marginBottom: 8,
    },
    statLabel: {
      color: colors.textMuted,
      marginBottom: 4,
      textAlign: 'center',
    },
    statValue: {
      fontWeight: 'bold',
      color: colors.foreground,
    },
    quickActionsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 15,
      paddingBottom: 15,
      gap: 10,
    },
    quickActionButton: {
      flex: 1,
    },
    scrollContent: {
      padding: 15,
      paddingBottom: 80,
    },
    sectionTitle: {
      fontWeight: 'bold',
      marginBottom: 15,
      color: colors.foreground,
    },
    subsectionTitle: {
      fontWeight: '600',
      marginTop: 10,
      marginBottom: 10,
      color: colors.textMuted,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 80,
    },
    emptyTitle: {
      marginTop: 20,
      marginBottom: 10,
      color: colors.foreground,
    },
    emptyText: {
      color: colors.textMuted,
      textAlign: 'center',
    },
    tableCard: {
      marginBottom: 15,
      elevation: 3,
      backgroundColor: colors.card,
    },
    tableHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 15,
    },
    tableHeaderLeft: {
      flexDirection: 'row',
      flex: 1,
    },
    tableAvatar: {
      marginRight: 12,
    },
    tableInfo: {
      flex: 1,
    },
    tableNumber: {
      fontWeight: 'bold',
      marginBottom: 4,
      color: colors.foreground,
    },
    tableMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    tableMetaText: {
      color: colors.textMuted,
    },
    separator: {
      color: colors.border,
      marginHorizontal: 4,
    },
    statusChip: {
      height: 32,
    },
    orderSummary: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 15,
    },
    orderTotal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    orderLabel: {
      color: colors.textMuted,
    },
    orderTotalValue: {
      fontWeight: 'bold',
      color: colors.success,
    },
    tableActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
    },
    tableCardCompact: {
      marginBottom: 10,
      elevation: 2,
      backgroundColor: colors.card,
    },
    compactContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    compactLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    tableAvatarSmall: {
      width: 40,
      height: 40,
    },
    compactTableNumber: {
      fontWeight: '600',
      color: colors.foreground,
    },
    statusChipSmall: {
      height: 28,
    },
    fab: {
      position: 'absolute',
      right: 16,
      bottom: 16,
      backgroundColor: colors.primary,
    },
  }), [colors]);

  return (
