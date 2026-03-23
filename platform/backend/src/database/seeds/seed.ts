import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

export async function runSeeds(dataSource: DataSource) {
  console.log('🌱 Starting database seeding...');

  const profileRepository = dataSource.getRepository('Profile');
  const restaurantRepository = dataSource.getRepository('Restaurant');
  const menuItemRepository = dataSource.getRepository('MenuItem');
  const tableRepository = dataSource.getRepository('RestaurantTable');
  const userRoleRepository = dataSource.getRepository('UserRole');
  const walletRepository = dataSource.getRepository('Wallet');

  // Create users
  console.log('Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 12);

  const owner = await profileRepository.save({
    email: 'owner@okinawa.com',
    full_name: 'Restaurant Owner',
    phone: '+55 11 98765-4321',
    cpf: '123.456.789-00',
  });

  const customer1 = await profileRepository.save({
    email: 'customer1@example.com',
    full_name: 'João Silva',
    phone: '+55 11 91234-5678',
    cpf: '987.654.321-00',
  });

  const customer2 = await profileRepository.save({
    email: 'customer2@example.com',
    full_name: 'Maria Santos',
    phone: '+55 11 92345-6789',
    cpf: '456.789.123-00',
  });

  const chef = await profileRepository.save({
    email: 'chef@okinawa.com',
    full_name: 'Chef Tanaka',
    phone: '+55 11 93456-7890',
    cpf: '321.654.987-00',
  });

  const waiter = await profileRepository.save({
    email: 'waiter@okinawa.com',
    full_name: 'Carlos Oliveira',
    phone: '+55 11 94567-8901',
    cpf: '654.321.987-00',
  });

  // Create wallets
  console.log('Creating wallets...');
  await walletRepository.save([
    { user_id: customer1.id, balance: 100.00 },
    { user_id: customer2.id, balance: 50.00 },
  ]);

  // Create restaurant
  console.log('Creating restaurant...');
  const restaurant = await restaurantRepository.save({
    owner_id: owner.id,
    name: 'Okinawa Sushi Bar',
    description: 'Authentic Japanese cuisine with a modern twist. Experience the finest sushi and sashimi in São Paulo.',
    address: 'Rua Augusta, 1500',
    city: 'São Paulo',
    state: 'SP',
    zip_code: '01304-001',
    phone: '+55 11 3456-7890',
    email: 'contact@okinawa.com',
    logo_url: 'https://example.com/logo.png',
    banner_url: 'https://example.com/banner.png',
    location: {
      type: 'Point',
      coordinates: [-46.6520, -23.5629], // São Paulo coordinates
    },
    service_type: 'fine_dining',
    cuisine_types: ['Japanese', 'Sushi', 'Asian'],
    opening_hours: {
      monday: '18:00-23:00',
      tuesday: '18:00-23:00',
      wednesday: '18:00-23:00',
      thursday: '18:00-23:00',
      friday: '18:00-00:00',
      saturday: '12:00-00:00',
      sunday: '12:00-22:00',
    },
    average_ticket: 150.00,
    rating: 4.7,
    total_reviews: 342,
    is_active: true,
  });

  // Create user roles
  console.log('Creating user roles...');
  await userRoleRepository.save([
    {
      user_id: owner.id,
      restaurant_id: restaurant.id,
      role: 'owner',
      is_active: true,
    },
    {
      user_id: chef.id,
      restaurant_id: restaurant.id,
      role: 'chef',
      is_active: true,
    },
    {
      user_id: waiter.id,
      restaurant_id: restaurant.id,
      role: 'waiter',
      is_active: true,
    },
  ]);

  // Create tables
  console.log('Creating tables...');
  const tables = [];
  for (let i = 1; i <= 10; i++) {
    tables.push({
      restaurant_id: restaurant.id,
      table_number: `T${i.toString().padStart(2, '0')}`,
      seats: i % 3 === 0 ? 6 : i % 2 === 0 ? 4 : 2,
      status: 'available',
      position_x: i - 1,
      position_y: 0,
    });
  }
  await tableRepository.save(tables);

  // Create menu items
  console.log('Creating menu items...');
  const menuItems = [
    // Starters
    {
      restaurant_id: restaurant.id,
      name: 'Edamame',
      description: 'Steamed soybeans with sea salt',
      price: 18.00,
      category: 'starters',
      image_url: 'https://example.com/edamame.jpg',
      is_available: true,
      preparation_time: 5,
      calories: 120,
      dietary_info: ['vegetarian', 'vegan', 'gluten-free'],
    },
    {
      restaurant_id: restaurant.id,
      name: 'Gyoza',
      description: 'Pan-fried pork dumplings with ponzu sauce',
      price: 28.00,
      category: 'starters',
      image_url: 'https://example.com/gyoza.jpg',
      is_available: true,
      preparation_time: 10,
      calories: 180,
    },
    {
      restaurant_id: restaurant.id,
      name: 'Tempura Misto',
      description: 'Assorted vegetables and shrimp tempura',
      price: 42.00,
      category: 'starters',
      image_url: 'https://example.com/tempura.jpg',
      is_available: true,
      preparation_time: 12,
      calories: 320,
      allergens: ['shellfish'],
    },
    // Sushi & Sashimi
    {
      restaurant_id: restaurant.id,
      name: 'Nigiri Sushi Set',
      description: '10 pieces of chef selection nigiri',
      price: 85.00,
      category: 'sushi',
      image_url: 'https://example.com/nigiri.jpg',
      is_available: true,
      preparation_time: 15,
      calories: 450,
      allergens: ['fish', 'soy'],
      dietary_info: ['gluten-free'],
    },
    {
      restaurant_id: restaurant.id,
      name: 'Salmon Sashimi',
      description: 'Fresh salmon slices (8 pieces)',
      price: 68.00,
      category: 'sashimi',
      image_url: 'https://example.com/salmon-sashimi.jpg',
      is_available: true,
      preparation_time: 8,
      calories: 280,
      allergens: ['fish'],
      dietary_info: ['gluten-free', 'low-carb'],
    },
    {
      restaurant_id: restaurant.id,
      name: 'California Roll',
      description: 'Crab, avocado, cucumber (8 pieces)',
      price: 38.00,
      category: 'rolls',
      image_url: 'https://example.com/california-roll.jpg',
      is_available: true,
      preparation_time: 10,
      calories: 240,
      allergens: ['shellfish', 'soy'],
    },
    {
      restaurant_id: restaurant.id,
      name: 'Spicy Tuna Roll',
      description: 'Spicy tuna, cucumber, sesame (8 pieces)',
      price: 45.00,
      category: 'rolls',
      image_url: 'https://example.com/spicy-tuna.jpg',
      is_available: true,
      preparation_time: 10,
      calories: 290,
      allergens: ['fish', 'soy'],
    },
    // Main Dishes
    {
      restaurant_id: restaurant.id,
      name: 'Chicken Teriyaki',
      description: 'Grilled chicken with teriyaki sauce, rice and vegetables',
      price: 52.00,
      category: 'main',
      image_url: 'https://example.com/teriyaki.jpg',
      is_available: true,
      preparation_time: 20,
      calories: 520,
      allergens: ['soy', 'gluten'],
    },
    {
      restaurant_id: restaurant.id,
      name: 'Beef Yakisoba',
      description: 'Stir-fried noodles with beef and vegetables',
      price: 48.00,
      category: 'main',
      image_url: 'https://example.com/yakisoba.jpg',
      is_available: true,
      preparation_time: 18,
      calories: 580,
      allergens: ['gluten', 'soy'],
    },
    {
      restaurant_id: restaurant.id,
      name: 'Ramen Tonkotsu',
      description: 'Pork bone broth ramen with chashu, egg, and vegetables',
      price: 58.00,
      category: 'main',
      image_url: 'https://example.com/ramen.jpg',
      is_available: true,
      preparation_time: 25,
      calories: 650,
      allergens: ['gluten', 'soy', 'egg'],
    },
    // Desserts
    {
      restaurant_id: restaurant.id,
      name: 'Mochi Ice Cream',
      description: 'Japanese rice cake with ice cream (3 pieces)',
      price: 22.00,
      category: 'desserts',
      image_url: 'https://example.com/mochi.jpg',
      is_available: true,
      preparation_time: 5,
      calories: 180,
      dietary_info: ['vegetarian'],
    },
    {
      restaurant_id: restaurant.id,
      name: 'Green Tea Cheesecake',
      description: 'Creamy matcha cheesecake',
      price: 28.00,
      category: 'desserts',
      image_url: 'https://example.com/matcha-cheesecake.jpg',
      is_available: true,
      preparation_time: 5,
      calories: 320,
      allergens: ['dairy', 'egg', 'gluten'],
      dietary_info: ['vegetarian'],
    },
    // Drinks
    {
      restaurant_id: restaurant.id,
      name: 'Sake Hot',
      description: 'Traditional Japanese hot sake (180ml)',
      price: 35.00,
      category: 'drinks',
      image_url: 'https://example.com/sake.jpg',
      is_available: true,
      preparation_time: 3,
      dietary_info: ['vegan', 'gluten-free'],
    },
    {
      restaurant_id: restaurant.id,
      name: 'Green Tea',
      description: 'Premium Japanese green tea',
      price: 12.00,
      category: 'drinks',
      image_url: 'https://example.com/green-tea.jpg',
      is_available: true,
      preparation_time: 3,
      dietary_info: ['vegan', 'gluten-free'],
    },
  ];

  await menuItemRepository.save(menuItems);

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${await profileRepository.count()}`);
  console.log(`   - Restaurants: ${await restaurantRepository.count()}`);
  console.log(`   - Menu Items: ${await menuItemRepository.count()}`);
  console.log(`   - Tables: ${await tableRepository.count()}`);
  console.log('\n🔐 Test Credentials:');
  console.log('   Owner: owner@okinawa.com / password123');
  console.log('   Customer 1: customer1@example.com / password123');
  console.log('   Customer 2: customer2@example.com / password123');
  console.log('   Chef: chef@okinawa.com / password123');
  console.log('   Waiter: waiter@okinawa.com / password123');
}
