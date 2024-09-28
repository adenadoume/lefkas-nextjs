import { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API route called', req.method, req.body);
  if (req.method === 'POST') {
    const { id, month, day, building, employee, description, cost } = req.body;

    try {
      // Get existing entries
      let entries = await kv.get<any[]>('entries') || [];
      
      if (id) {
        // Update existing entry
        entries = entries.map(entry => 
          entry.id === id ? { ...entry, month, day, building, employee, description, cost } : entry
        );
      } else {
        // Add new entry
        const newEntry = {
          id: Date.now().toString(),
          month,
          day,
          building,
          employee,
          description,
          cost
        };
        entries.push(newEntry);
      }

      // Save updated entries
      await kv.set('entries', entries);

      console.log('Entry saved successfully');
      res.status(200).json({ message: 'Entry saved successfully', data: entries });
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