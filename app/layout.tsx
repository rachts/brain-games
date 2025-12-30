import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Brain Games - Enhance Your Cognitive Skills",
  description: "Train your mind with engaging brain games and track your progress",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.className} bg-background text-foreground`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
