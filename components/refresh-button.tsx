'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export default function RefreshButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <button
      className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
        isPending 
          ? 'bg-blue-400 cursor-not-allowed' 
          : 'bg-blue-500 hover:bg-blue-700'
      }`}
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          router.refresh()
        })
      }}
    >
      {isPending ? 'Refreshing...' : 'Refresh'}
    </button>
  )
}
