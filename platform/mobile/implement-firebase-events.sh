#!/bin/bash

# Script para documentar implementação dos eventos Firebase Analytics
# Este script cria snippets de código para serem implementados

echo "🔥 Firebase Analytics - Snippets de Implementação"
echo "=================================================="
echo ""

echo "📱 1. RESTAURANT SCREEN"
echo "Adicionar no topo do componente:"
cat << 'EOF'
import { useScreenTracking, useAnalytics } from '@/shared/hooks/useAnalytics';

// Dentro do componente:
useScreenTracking('Restaurant Details');
const analytics = useAnalytics();

// No loadRestaurant (após sucesso):
if (data) {
  await analytics.logRestaurantView(data.id, data.name);
}

// No handleCall:
await analytics.logEvent('restaurant_call', { restaurant_id: restaurantId });

// No handleDirections:
await analytics.logEvent('restaurant_directions', { restaurant_id: restaurantId });
EOF
echo ""
echo "---"
echo ""

echo "📱 2. MENU SCREEN"
echo "Adicionar no topo do componente:"
cat << 'EOF'
import { useScreenTracking, useAnalytics } from '@/shared/hooks/useAnalytics';

// Dentro do componente:
useScreenTracking('Menu');
const analytics = useAnalytics();

// No addToCart:
const addToCart = useCallback((item: MenuItem) => {
  // Track add to cart ANTES de adicionar
  analytics.logAddToCart(item.id, item.name, item.price, 1);

  cart.addItem({
    menu_item_id: item.id,
    name: item.name,
    price: item.price,
    quantity: 1,
    image_url: item.image_url,
    category: item.category,
  });
}, [cart, analytics]);

// No handleSearch (se existir):
const handleSearch = (query: string) => {
  setSearchQuery(query);
  if (query.length > 2) {
    analytics.logSearch(query, 'menu_item');
  }
};
EOF
echo ""
echo "---"
echo ""

echo "📱 3. PAYMENT SCREEN"
echo "Adicionar no topo do componente:"
cat << 'EOF'
import { useScreenTracking, useAnalytics } from '@/shared/hooks/useAnalytics';

// Dentro do componente:
useScreenTracking('Payment');
const analytics = useAnalytics();

// No handlePayment (após pagamento bem-sucedido):
try {
  const result = await ApiService.processPayment({...});

  // Track purchase
  await analytics.logPurchase(order.id, order.total_amount, 'BRL');

  setPaymentSuccess(true);
  navigation.navigate('OrderConfirmation', { orderId: order.id });
} catch (error) {
  await analytics.logError('Payment failed', error.code || 'PAYMENT_ERROR', false);
}

// Ao adicionar novo método de pagamento:
await analytics.logAddPaymentMethod(paymentType);
EOF
echo ""
echo "---"
echo ""

echo "📱 4. CREATE RESERVATION SCREEN"
echo "Adicionar no topo do componente:"
cat << 'EOF'
import { useScreenTracking, useAnalytics } from '@/shared/hooks/useAnalytics';

// Dentro do componente:
useScreenTracking('Create Reservation');
const analytics = useAnalytics();

// No handleSubmit (após criar reserva):
try {
  const reservation = await ApiService.createReservation({
    restaurant_id: restaurantId,
    reservation_time: combinedDateTime.toISOString(),
    party_size: partySize,
    special_requests: specialRequests,
  });

  // Track reservation
  await analytics.logReservation(
    reservation.id,
    restaurantId,
    partySize
  );

  Alert.alert('Sucesso!', 'Reserva criada com sucesso!');
  navigation.navigate('ReservationConfirmation', { reservationId: reservation.id });
} catch (error) {
  await analytics.logError('Reservation failed', error.code || 'RESERVATION_ERROR', false);
}
EOF
echo ""
echo "---"
echo ""

echo "📱 5. QR SCANNER SCREEN"
echo "Adicionar no topo do componente:"
cat << 'EOF'
import { useScreenTracking, useAnalytics } from '@/shared/hooks/useAnalytics';

// Dentro do componente:
useScreenTracking('QR Scanner');
const analytics = useAnalytics();

// No handleBarCodeScanned (após validar QR):
try {
  // ... código de validação ...

  // Track QR scan
  await analytics.logQRScan(qrData.type, qrData.restaurantId);

  // Navigate baseado no tipo
  if (qrData.type === 'table') {
    navigation.navigate('Menu', {
      restaurantId: qrData.restaurantId,
      tableId: qrData.tableId,
    });
  } else if (qrData.type === 'menu') {
    navigation.navigate('Menu', {
      restaurantId: qrData.restaurantId,
    });
  } else if (qrData.type === 'payment') {
    navigation.navigate('Payment', {
      orderId: qrData.orderId,
    });
  }
} catch (error) {
  await analytics.logError('QR scan failed', error.code || 'QR_ERROR', false);
}
EOF
echo ""
echo "---"
echo ""

echo "✅ DONE!"
echo ""
echo "Para reviews, adicione em qualquer tela que tenha submit de review:"
cat << 'EOF'
const handleSubmitReview = async (restaurantId, rating, comment) => {
  try {
    await ApiService.createReview({ restaurantId, rating, comment });
    await analytics.logReview(restaurantId, rating);
    showSuccessToast('Avaliação enviada!');
  } catch (error) {
    await analytics.logError('Review submission failed', error.code, false);
  }
};
EOF
echo ""
