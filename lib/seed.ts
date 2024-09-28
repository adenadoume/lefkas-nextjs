import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'entries.json');

export async function seed() {
  try {
    const sampleEntries = [
      { id: '1', month: 'January', day: 1, building: 'OIK50', employee: 'Elina', description: 'Cleaning', cost: 100 },
      { id: '2', month: 'January', day: 2, building: 'OIK60', employee: 'Alex', description: 'Maintenance', cost: 150 },
      { id: '3', month: 'February', day: 1, building: 'OIK90', employee: 'Ferman', description: 'Repairs', cost: 200 },
    ];

    await fs.writeFile(dataFilePath, JSON.stringify(sampleEntries, null, 2));

    console.log(`Seeded ${sampleEntries.length} entries`);

    return {
      createdRecords: sampleEntries
    };
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}
