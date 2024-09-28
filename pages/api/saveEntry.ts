import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'entries.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API route called', req.method, req.body);
  if (req.method === 'POST') {
    const { month, day, building, employee, description, cost } = req.body;

    try {
      // Check if the file exists, if not create it with an empty array
      try {
        await fs.access(dataFilePath);
      } catch {
        await fs.writeFile(dataFilePath, '[]');
      }

      const data = await fs.readFile(dataFilePath, 'utf8');
      const entries = JSON.parse(data);
      
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

      await fs.writeFile(dataFilePath, JSON.stringify(entries, null, 2));

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