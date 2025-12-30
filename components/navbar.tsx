"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const { user, isGuest, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <nav className="glass sticky top-0 z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">BG</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline">Brain Games</span>
          </Link>

          <div className="flex items-center gap-4">
            {user && !isGuest ? (
              <>
                <Link href="/dashboard" className="text-sm hover:text-primary transition-smooth">
                  Dashboard
                </Link>
                <Link href="/profile" className="text-sm hover:text-primary transition-smooth">
                  {user.username}
                </Link>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  Logout
                </Button>
              </>
            ) : isGuest ? (
              <>
                <span className="text-sm text-muted-foreground">Playing as Guest</span>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
