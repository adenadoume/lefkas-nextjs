import Airtable from 'airtable';

const base = new Airtable({apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN}).base(process.env.AIRTABLE_BASE_ID!);
const table = base(process.env.AIRTABLE_TABLE_NAME!);

export async function seed() {
  try {
    const sampleEntries = [
      { month: 'January', day: 1, building: 'OIK50', employee: 'Elina', description: 'Cleaning', cost: 100 },
      { month: 'January', day: 2, building: 'OIK60', employee: 'Alex', description: 'Maintenance', cost: 150 },
      { month: 'February', day: 1, building: 'OIK90', employee: 'Ferman', description: 'Repairs', cost: 200 },
    ];

    const createdRecords = await Promise.all(
      sampleEntries.map(entry => 
        table.create([
          {
            fields: {
              month: entry.month,
              day: entry.day,
              building: entry.building,
              employee: entry.employee,
              description: entry.description,
              cost: entry.cost
            }
          }
        ])
      )
    );

    console.log(`Seeded ${createdRecords.length} entries`);

    return {
      createdRecords
    };
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}
