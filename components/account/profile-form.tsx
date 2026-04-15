"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { updateProfileAction } from "@/app/actions/profile"
import { Loader2 } from "lucide-react"
import type { User } from "@/lib/types"

interface ProfileFormProps {
  user: User | null
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
  })

  useEffect(() => {
    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
    })
  }, [user])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const result = await updateProfileAction(formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Profile updated successfully")

      // Notify Header immediately with the new name so it updates
      // without waiting for router.refresh() to complete
      window.dispatchEvent(
        new CustomEvent("profile:updated", {
          detail: { name: formData.name, role: user?.role ?? "customer" },
        })
      )

      router.refresh()
    }

    setIsLoading(false)
  }

  return (
    <Card className="border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-black">Informasi Profil</CardTitle>
        <CardDescription>
          Perbarui informasi pribadi dan detail kontak Anda
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-black">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ""}
              disabled
              className="bg-gray-100 text-gray-600 border-gray-200"
            />
            <p className="text-xs text-gray-500">
              Email tidak dapat diubah
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-black">Nama Lengkap</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap Anda"
              className="border-gray-200 focus:border-red-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-black">Nomor Telepon</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Masukkan nomor telepon Anda"
              className="border-gray-200 focus:border-red-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium text-black">Alamat</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Masukkan alamat Anda"
              rows={3}
              className="border-gray-200 focus:border-red-600"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#E10600] hover:bg-red-700 text-white font-semibold py-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
