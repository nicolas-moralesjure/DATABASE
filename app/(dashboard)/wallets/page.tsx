"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getEmpresaScopedStore, seedIfEmpty } from "@/lib/store"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

type Wallet = {
  id: string
  nombre: string
  creadoEl: string
  activa: boolean
  imagen: string
}

export default function WalletsPage() {
  const [empresa, setEmpresa] = useState("acme")
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [open, setOpen] = useState(false)
  const [nombre, setNombre] = useState("")
  const [activa, setActiva] = useState(true)

  useEffect(() => {
    const empresaCookie =
      document.cookie
        .split("; ")
        .find((c) => c.startsWith("empresa="))
        ?.split("=")[1] ?? "acme"
    setEmpresa(empresaCookie)
    seedIfEmpty(empresaCookie)
    const store = getEmpresaScopedStore(empresaCookie)
    setWallets(store.getWallets())
  }, [])

  const agregar = () => {
    const store = getEmpresaScopedStore(empresa)
    store.addWallet({ nombre, activa })
    setWallets(store.getWallets())
    setOpen(false)
    setNombre("")
    setActiva(true)
  }

  const toggleEstado = (id: string, valor: boolean) => {
    const store = getEmpresaScopedStore(empresa)
    store.updateWallet(id, { activa: valor })
    setWallets(store.getWallets())
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Wallets</CardTitle>
            <CardDescription>{"Vista y administración de wallets de la empresa."}</CardDescription>
          </div>
          <Button onClick={() => setOpen(true)}>Agregar nueva wallet</Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wallets.map((w) => (
              <Card key={w.id} className="overflow-hidden">
                <img
                  src={w.imagen || "/placeholder.svg"}
                  alt={`Vista previa de la wallet ${w.nombre}`}
                  className="w-full h-40 object-cover border-b"
                />
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{w.nombre}</div>
                    <Badge variant={w.activa ? "default" : "secondary"}>
                      {w.activa ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ID: {w.id.slice(0, 8)} · Creada el {new Date(w.creadoEl).toLocaleDateString()}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm">Estado</div>
                    <Switch checked={w.activa} onCheckedChange={(v) => toggleEstado(w.id, v)} />
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" className="w-full">
                      Editar diseño
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {wallets.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-10">
                {"No hay wallets creadas aún."}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar wallet</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="activa">Activa</Label>
              <Switch id="activa" checked={activa} onCheckedChange={setActiva} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={agregar} disabled={!nombre}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
