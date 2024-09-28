import { timeAgo } from '@/lib/utils'
import Image from 'next/image'
import RefreshButton from './refresh-button'
import { Button } from "@/components/ui/button"
import { useEffect, useState } from 'react'

// Define the User type
interface User {
  name: string;
  email: string;
  image: string;
  createdAt: Date;
}

export default function Table() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/getUsers')
        if (!response.ok) {
          throw new Error('Failed to fetch users')
        }
        const data = await response.json()
        setUsers(data.map((user: any) => ({
          ...user,
          createdAt: new Date(user.createdAt)
        })))
      } catch (err) {
        setError('Failed to load users')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="spreadsheet-container">
      <div className="spreadsheet-header flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">Recent Users</h2>
          <p className="text-sm text-muted-foreground">
            Fetched {users.length} users
          </p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" className="spreadsheet-button">Add User</Button>
          <RefreshButton />
        </div>
      </div>
      <div className="spreadsheet-body divide-y divide-border">
        {users.map((user: User) => (
          <div
            key={user.name}
            className="spreadsheet-row flex items-center justify-between py-3"
          >
            <div className="flex items-center space-x-4">
              <Image
                src={user.image}
                alt={user.name}
                width={48}
                height={48}
                className="rounded-full ring-1 ring-border"
              />
              <div className="space-y-1">
                <p className="font-medium leading-none text-foreground">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{timeAgo(user.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
