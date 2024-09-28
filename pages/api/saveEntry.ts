import { sql } from '@vercel/postgres';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API route called', req.method, req.body);
  if (req.method === 'POST') {
    const { month, day, building, employee, description, cost } = req.body;

    try {
      console.log('Attempting to insert:', { month, day, building, employee, description, cost });
      await sql`
        INSERT INTO entries (month, day, building, employee, description, cost)
        VALUES (${month}, ${day}, ${building}, ${employee}, ${description}, ${cost})
      `;
      console.log('Entry saved successfully');
      res.status(200).json({ message: 'Entry saved successfully' });
    } catch (error: unknown) {
      console.error('Error saving entry:', error);
      if (error instanceof Error) {
        res.status(500).json({ error: 'Failed to save entry', details: error.message });
      } else {
        res.status(500).json({ error: 'Failed to save entry', details: 'An unknown error occurred' });
      }
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}