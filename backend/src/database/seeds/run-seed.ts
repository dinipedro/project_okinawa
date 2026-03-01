import { DataSource } from 'typeorm';
import { runSeeds } from './seed';
import dataSource from '../../config/database.config';

async function bootstrap() {

  try {
    console.log('🔌 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Connected to database');

    await runSeeds(dataSource);

    console.log('\n✨ All done!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

bootstrap();
