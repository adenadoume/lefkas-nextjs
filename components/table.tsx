import { sql } from '@vercel/postgres'
import { timeAgo } from '@/lib/utils'
import Image from 'next/image'
import RefreshButton from './refresh-button'
import { seed } from '@/lib/seed'

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

  const { rows: users } = data as { rows: User[] }
  const duration = Date.now() - startTime

  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-center p-4 bg-blue-600 text-white">
        <div>
          <h2 className="text-2xl font-bold">Recent Users</h2>
          <p className="text-sm opacity-80">
            Fetched {users.length} users in {duration}ms
          </p>
        </div>
        <RefreshButton />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 text-left font-semibold text-gray-600">User</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">Email</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: User) => (
              <tr key={user.name} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4 flex items-center space-x-3">
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <span className="font-medium">{user.name}</span>
                </td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4 text-gray-500">{timeAgo(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
