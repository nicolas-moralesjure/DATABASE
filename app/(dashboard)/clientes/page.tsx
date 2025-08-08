"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Upload, Download, Search, Filter } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Papa from "papaparse"
import { getEmpresaScopedStore, seedIfEmpty } from "@/lib/store"
import { cn } from "@/lib/utils"
import { DateRange } from "react-day-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

type ClienteForm = {
  nombre: string
  fechaNacimiento: string
  celular: string
  email: string
}

export default function ClientesPage() {
  const [empresa, setEmpresa] = useState("acme")
  const [query, setQuery] = useState("")
  const [range, setRange] = useState<DateRange | undefined>()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<ClienteForm>({
    nombre: "",
    fechaNacimiento: "",
    celular: "",
    email: "",
  })
  const [clientes, setClientes] = useState<
    {
      id: string
      nombre: string
      fechaNacimiento: string
      celular: string
      email: string
      creadoEl: string
      ultimoUso?: string
    }[]
  >([])

  useEffect(() => {
    const empresaCookie =
      document.cookie
        .split("; ")
        .find((c) => c.startsWith("empresa="))
        ?.split("=")[1] ?? "acme"
    setEmpresa(empresaCookie)
  }, [])

  useEffect(() => {
    if (!empresa) return
    seedIfEmpty(empresa)
    const store = getEmpresaScopedStore(empresa)
    setClientes(store.getClientes())
  }, [empresa])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let result = clientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.celular.toLowerCase().includes(q)
    )
    if (range?.from || range?.to) {
      result = result.filter((c) => {
        const created = new Date(c.creadoEl)
        const fromOk = range?.from ? created >= range.from : true
        const toOk = range?.to ? created <= range.to : true
        return fromOk && toOk
      })
    }
    return result
  }, [clientes, query, range])

  const addCliente = () => {
    const store = getEmpresaScopedStore(empresa)
    store.addCliente({
      nombre: form.nombre,
      fechaNacimiento: form.fechaNacimiento,
      celular: form.celular,
      email: form.email,
    })
    setClientes(store.getClientes())
    setOpen(false)
    setForm({ nombre: "", fechaNacimiento: "", celular: "", email: "" })
  }

  const onImport = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[]
        const store = getEmpresaScopedStore(empresa)
        const mapped = rows
          .map((r) => ({
            nombre: String(r.nombre || r["Nombre"] || ""),
            fechaNacimiento: String(r.fechaNacimiento || r["Fecha de nacimiento"] || r["fecha_nacimiento"] || ""),
            celular: String(r.celular || r["Celular"] || r["Telefono"] || ""),
            email: String(r.email || r["Email"] || r["Correo"] || ""),
          }))
          .filter((r) => r.nombre && r.email)
        store.bulkAddClientes(mapped)
        setClientes(store.getClientes())
      },
      error: () => {
        // no-op simple demo
      },
    })
  }

  const onExport = () => {
    const csv = Papa.unparse(
      filtered.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        fechaNacimiento: c.fechaNacimiento,
        celular: c.celular,
        email: c.email,
        creadoEl: c.creadoEl,
        ultimoUso: c.ultimoUso ?? "",
      }))
    )
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `clientes_${empresa}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Clientes</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o celular"
                className="pl-8 w-full sm:w-[300px]"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Buscar clientes"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  {"Fecha de creación"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="end">
                <Calendar mode="range" selected={range} onSelect={setRange} numberOfMonths={2} />
              </PopoverContent>
            </Popover>
            <Button variant="outline" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <label className={cn("inline-flex")}>
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) onImport(f)
                  e.currentTarget.value = ""
                }}
                aria-label="Importar CSV"
              />
              <Button variant="outline" asChild>
                <span className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar CSV
                </span>
              </Button>
            </label>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar cliente
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar cliente</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                  <div className="grid gap-2">
                    <Label htmlFor="nombre">Nombre completo</Label>
                    <Input
                      id="nombre"
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
                    <Input
                      id="fechaNacimiento"
                      type="date"
                      value={form.fechaNacimiento}
                      onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="celular">Número de celular</Label>
                    <Input
                      id="celular"
                      value={form.celular}
                      onChange={(e) => setForm({ ...form, celular: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={addCliente}>Guardar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre completo</TableHead>
                <TableHead>Fecha de nacimiento</TableHead>
                <TableHead>Celular</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead>Último uso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.nombre}</TableCell>
                  <TableCell>{c.fechaNacimiento || "-"}</TableCell>
                  <TableCell>{c.celular}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{new Date(c.creadoEl).toLocaleDateString()}</TableCell>
                  <TableCell>{c.ultimoUso ? new Date(c.ultimoUso).toLocaleDateString() : "-"}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    {"Sin resultados"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
