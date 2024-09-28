import { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API route called', req.method, req.body);
  if (req.method === 'POST') {
    const { month, day, building, employee, description, cost } = req.body;

    try {
      const newEntry = {
        id: Date.now().toString(),
        month,
        day,
        building,
        employee,
        description,
        cost
      };

      // Get existing entries
      let entries = await kv.get<any[]>('entries') || [];
      
      // Add new entry
      entries.push(newEntry);

      // Save updated entries
      await kv.set('entries', entries);

      console.log('Entry saved successfully:', newEntry);
      res.status(200).json({ message: 'Entry saved successfully', data: newEntry });
    } catch (error: unknown) {
      console.error('Error saving entry:', error);
      if (error instanceof Error) {
        res.status(500).json({ error: 'Failed to save entry', details: error.message, stack: error.stack });
      } else {
        res.status(500).json({ error: 'Failed to save entry', details: 'An unknown error occurred' });
      }
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}