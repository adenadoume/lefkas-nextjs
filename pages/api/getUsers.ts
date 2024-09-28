import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'entries.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const data = await fs.readFile(dataFilePath, 'utf8');
      const entries = JSON.parse(data);
      
      // Extract unique users from entries
      const uniqueEmployees = Array.from(new Set(entries.map((entry: any) => entry.employee)));
      const users = uniqueEmployees.map(employee => ({
        name: employee,
        email: `${employee.toLowerCase()}@example.com`, // Generate a dummy email
        image: `https://api.dicebear.com/6.x/initials/svg?seed=${employee}`, // Generate an avatar
        createdAt: new Date().toISOString() // Use current date as creation date
      }));

      res.status(200).json(users);
    } catch (error: unknown) {
      console.error('Error fetching users:', error);
      if (error instanceof Error) {
        res.status(500).json({ error: 'Failed to fetch users', details: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch users', details: 'An unknown error occurred' });
      }
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}