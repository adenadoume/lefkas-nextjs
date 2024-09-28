import { NextApiRequest, NextApiResponse } from 'next';
import { seed } from '@/lib/seed';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'entries.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Check if the file exists, if not create it with an empty array
      try {
        await fs.access(dataFilePath);
      } catch {
        await fs.writeFile(dataFilePath, '[]');
      }

      const result = await seed();
      res.status(200).json({ message: 'Seeding successful', result });
    } catch (error) {
      console.error('Error during seeding:', error);
      res.status(500).json({ error: 'Failed to seed data' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}