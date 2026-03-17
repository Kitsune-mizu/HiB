"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface CancelOrderButtonProps {
  orderId: string
}

export function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleCancel = async () => {
    const confirmCancel = confirm("Are you sure you want to cancel this order?")
    if (!confirmCancel) return

    setLoading(true)

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId)

      if (error) throw error

      toast.success("Order cancelled successfully")

      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Failed to cancel order")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="destructive"
      className="w-full"
      onClick={handleCancel}
      disabled={loading}
    >
      {loading ? "Cancelling..." : "Cancel Order"}
    </Button>
  )
}