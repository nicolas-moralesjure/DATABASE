"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User2 } from 'lucide-react'
import { useEffect, useState } from "react"

export function Topbar({ empresaDefault = "acme" }: { empresaDefault?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [empresa, setEmpresa] = useState(empresaDefault)

  useEffect(() => {
    setEmpresa(
      document.cookie
        .split("; ")
        .find((c) => c.startsWith("empresa="))
        ?.split("=")[1] ?? empresaDefault
    )
  }, [empresaDefault])

  const logout = () => {
    // Remove cookies client-side for demo; a better way is a server action to delete the cookie [^1][^2].
    document.cookie = "session=; Max-Age=0; path=/"
    document.cookie = "empresa=; Max-Age=0; path=/"
    router.refresh()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="h-14 flex items-center justify-between px-4">
        <div className="font-medium truncate">
          {pathname === "/"
            ? "Home"
            : pathname
                .split("/")
                .filter(Boolean)
                .map((s) => s[0]?.toUpperCase() + s.slice(1))
                .join(" / ")}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-sm text-muted-foreground">Empresa: {empresa}</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8">
                <User2 className="h-4 w-4 mr-2" />
                Cuenta
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/login">Cambiar empresa</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
