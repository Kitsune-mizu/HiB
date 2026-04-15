import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-2 mb-6">
            <div className="relative flex h-10 w-10 items-center justify-center bg-black">
              <span className="text-xl font-bold text-white font-heading">光</span>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E10600]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-heading text-lg font-bold tracking-tight text-black leading-none">
                HIKARU BOUKEN
              </span>
              <span className="text-[10px] text-neutral-500 tracking-widest">
                光る冒険
              </span>
            </div>
          </Link>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-blue-50 p-4">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          {/* Title and Description */}
          <h1 className="text-2xl font-bold text-black mb-2">Periksa Email Anda</h1>
          <p className="text-neutral-600 mb-6">
            Kami telah mengirimkan kode verifikasi ke alamat email Anda. Gunakan kode tersebut untuk menyelesaikan pendaftaran.
          </p>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              Kode verifikasi berlaku selama <span className="font-semibold">5 menit</span>. Jika kode habis, Anda dapat meminta kode baru.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full h-11 bg-[#E10600] hover:bg-red-700 text-white font-semibold">
              <Link href="/auth/login">Lanjut ke Verifikasi</Link>
            </Button>
            <Button asChild variant="outline" className="w-full h-11 border-gray-300 text-black hover:bg-gray-50">
              <Link href="/">Kembali ke Beranda</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
