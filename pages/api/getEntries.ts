import { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const entries = await kv.get<any[]>('entries') || [];
      res.status(200).json(entries);
    } catch (error: unknown) {
      console.error('Error fetching entries:', error);
      res.status(500).json({ error: 'Failed to fetch entries' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}