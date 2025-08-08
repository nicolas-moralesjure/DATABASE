"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [empresa, setEmpresa] = useState("acme")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Set simple demo cookies (no httpOnly, no secure) so the client layout pueda leerlas.
    document.cookie = `session=demo; Max-Age=604800; Path=/`
    document.cookie = `empresa=${encodeURIComponent(empresa)}; Max-Age=604800; Path=/`
    router.push("/")
  }

  const entrarDemo = () => {
    document.cookie = `session=demo; Max-Age=604800; Path=/`
    document.cookie = `empresa=demo; Max-Age=604800; Path=/`
    router.push("/")
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle>Iniciar sesión</CardTitle>
        <CardDescription>{"Accede a tu empresa para administrar clientes, push y wallets."}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="empresa">Empresa</Label>
            <Input
              id="empresa"
              name="empresa"
              placeholder="acme"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
          <Button type="button" variant="outline" onClick={entrarDemo}>
            Entrar como invitado (demo)
          </Button>
          <div className="text-xs text-muted-foreground text-center">
            {"Demo: el formulario solo establece cookies en el navegador para entrar."}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
LoginForm.defaultProps = {}
