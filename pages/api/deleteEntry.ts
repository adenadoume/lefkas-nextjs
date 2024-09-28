import { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { id } = req.query;

    try {
      let entries = await kv.get<any[]>('entries') || [];
      entries = entries.filter(entry => entry.id !== id);
      await kv.set('entries', entries);

      res.status(200).json({ message: 'Entry deleted successfully' });
    } catch (error: unknown) {
      console.error('Error deleting entry:', error);
      res.status(500).json({ error: 'Failed to delete entry' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}