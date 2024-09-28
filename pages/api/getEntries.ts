import { NextApiRequest, NextApiResponse } from 'next';
import Airtable from 'airtable';

const base = new Airtable({apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN}).base(process.env.AIRTABLE_BASE_ID!);
const table = base(process.env.AIRTABLE_TABLE_NAME!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const records = await table.select().all();
      const data = records.map(record => ({
        id: record.id,
        ...record.fields
      }));
      res.status(200).json(data);
    } catch (error: unknown) {
      console.error('Error fetching entries:', error);
      if (error instanceof Error) {
        res.status(500).json({ error: 'Failed to fetch entries', details: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch entries', details: 'An unknown error occurred' });
      }
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}