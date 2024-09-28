import { seed } from '../lib/seed';

async function runSeed() {
  try {
    const result = await seed();
    console.log('Seeding successful:', result);
  } catch (error) {
    console.error('Error during seeding:', error);
  }
  process.exit();
}

runSeed();