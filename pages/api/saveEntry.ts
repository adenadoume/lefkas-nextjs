import { sql } from '@vercel/postgres';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { month, day, building, employee, description, cost } = req.body;

    try {
      await sql`
        INSERT INTO entries (month, day, building, employee, description, cost)
        VALUES (${month}, ${day}, ${building}, ${employee}, ${description}, ${cost})
      `;
      res.status(200).json({ message: 'Entry saved successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save entry' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}