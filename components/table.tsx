import { sql } from '@vercel/postgres'
import { timeAgo } from '@/lib/utils'
import Image from 'next/image'
import RefreshButton from './refresh-button'
import { seed } from '@/lib/seed'
import { Button } from "@/components/ui/button"

// Define the User type
interface User {
  name: string;
  email: string;
  image: string;
  createdAt: Date;
}

export default async function Table() {
  let data
  let startTime = Date.now()

  try {
    data = await sql`SELECT * FROM users`
  } catch (e: any) {
    if (e.message.includes('relation "users" does not exist')) {
      console.log(
        'Table does not exist, creating and seeding it with dummy data now...'
      )
      // Table is not created yet
      await seed()
      startTime = Date.now()
      data = await sql`SELECT * FROM users`
    } else {
      throw e
    }
  }

  const users = data.rows.map((row: any): User => ({
    name: row.name,
    email: row.email,
    image: row.image,
    createdAt: new Date(row.createdAt)
  }));
  const duration = Date.now() - startTime

  return (
    <div className="bg-white/30 p-12 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg max-w-xl mx-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Recent Users</h2>
          <p className="text-sm text-gray-500">
            Fetched {users.length} users in {duration}ms
          </p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" className="bg-blue-500 text-white hover:bg-blue-600">Add User</Button>
          <RefreshButton />
        </div>
      </div>
      <div className="divide-y divide-gray-900/5">
        {users.map((user) => (
          <div
            key={user.name}
            className="flex items-center justify-between py-3"
          >
            <div className="flex items-center space-x-4">
              <Image
                src={user.image}
                alt={user.name}
                width={48}
                height={48}
                className="rounded-full ring-1 ring-gray-900/5"
              />
              <div className="space-y-1">
                <p className="font-medium leading-none">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">{timeAgo(user.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
