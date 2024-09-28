'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from "@/components/ui/button"

export default function RefreshButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      className={`spreadsheet-button ${
        isPending ? 'cursor-not-allowed opacity-50' : ''
      }`}
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          router.refresh()
        })
      }}
    >
      {isPending ? 'Refreshing...' : 'Refresh'}
    </Button>
  )
}
