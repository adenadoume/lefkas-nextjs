import { NextApiRequest, NextApiResponse } from 'next';
import { seed } from '@/lib/seed';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
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