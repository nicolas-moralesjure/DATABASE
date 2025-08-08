"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getEmpresaScopedStore, seedIfEmpty } from "@/lib/store"

type Prog = {
  id: string
  mensaje: string
  audiencia: "todos" | "7" | "30"
  fechaISO: string
  estado: "Pendiente" | "Enviado" | "Cancelado"
}

export default function ProgramarPushPage() {
  const [empresa, setEmpresa] = useState("acme")
  const [mensaje, setMensaje] = useState("")
  const [audiencia, setAudiencia] = useState<"todos" | "7" | "30">("todos")
  const [fecha, setFecha] = useState<string>("")
  const [hora, setHora] = useState<string>("")
  const [lista, setLista] = useState<Prog[]>([])
  const [edit, setEdit] = useState<Prog | null>(null)

  useEffect(() => {
    const empresaCookie =
      document.cookie
        .split("; ")
        .find((c) => c.startsWith("empresa="))
        ?.split("=")[1] ?? "acme"
    setEmpresa(empresaCookie)
    seedIfEmpty(empresaCookie)
    const store = getEmpresaScopedStore(empresaCookie)
    setLista(store.getProgramados())
  }, [])

  const fechaISO = useMemo(() => {
    if (!fecha || !hora) return ""
    return new Date(`${fecha}T${hora}:00`).toISOString()
  }, [fecha, hora])

  const guardar = () => {
    if (!fechaISO || !mensaje) return
    const store = getEmpresaScopedStore(empresa)
    store.addProgramado({
      mensaje,
      audiencia,
      fechaISO,
    })
    setLista(store.getProgramados())
    setMensaje("")
    setAudiencia("todos")
    setFecha("")
    setHora("")
  }

  const cancelar = (id: string) => {
    const store = getEmpresaScopedStore(empresa)
    store.updateProgramado(id, { estado: "Cancelado" })
    setLista(store.getProgramados())
  }

  const editar = (p: Prog) => setEdit(p)

  const guardarEdicion = () => {
    if (!edit) return
    const store = getEmpresaScopedStore(empresa)
    store.updateProgramado(edit.id, edit)
    setLista(store.getProgramados())
    setEdit(null)
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Programar Push</CardTitle>
          <CardDescription>{"Programa mensajes para envío futuro."}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="mensaje">Mensaje</Label>
            <Textarea id="mensaje" value={mensaje} onChange={(e) => setMensaje(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Audiencia</Label>
            <RadioGroup value={audiencia} onValueChange={(v) => setAudiencia(v as any)} className="flex gap-4">
              <Label
                htmlFor="todos"
                className="border rounded-md p-2 cursor-pointer flex items-center gap-2 [&:has(:checked)]:bg-muted"
              >
                <RadioGroupItem id="todos" value="todos" />
                Todos
              </Label>
              <Label
                htmlFor="no7"
                className="border rounded-md p-2 cursor-pointer flex items-center gap-2 [&:has(:checked)]:bg-muted"
              >
                <RadioGroupItem id="no7" value="7" />
                No vinieron 7 días
              </Label>
              <Label
                htmlFor="no30"
                className="border rounded-md p-2 cursor-pointer flex items-center gap-2 [&:has(:checked)]:bg-muted"
              >
                <RadioGroupItem id="no30" value="30" />
                No vinieron 30 días
              </Label>
            </RadioGroup>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input id="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hora">Hora</Label>
              <Input id="hora" type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
            </div>
          </div>
          <div>
            <Button onClick={guardar} disabled={!mensaje || !fecha || !hora}>
              Guardar programación
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mensajes programados</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mensaje</TableHead>
                <TableHead>Audiencia</TableHead>
                <TableHead>Fecha y hora</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="max-w-[320px]">{p.mensaje}</TableCell>
                  <TableCell>
                    {p.audiencia === "todos" ? "Todos" : p.audiencia === "7" ? "No 7 días" : "No 30 días"}
                  </TableCell>
                  <TableCell>{new Date(p.fechaISO).toLocaleString()}</TableCell>
                  <TableCell>{p.estado}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => editar(p)}>
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelar(p.id)}
                      disabled={p.estado !== "Pendiente"}
                    >
                      Cancelar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {lista.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    {"No hay mensajes programados"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar programación</DialogTitle>
          </DialogHeader>
          {edit && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="emsg">Mensaje</Label>
                <Textarea
                  id="emsg"
                  value={edit.mensaje}
                  onChange={(e) => setEdit({ ...edit, mensaje: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Audiencia</Label>
                <RadioGroup
                  value={edit.audiencia}
                  onValueChange={(v) => setEdit({ ...edit, audiencia: v as any })}
                  className="flex gap-4"
                >
                  <Label
                    htmlFor="etodos"
                    className="border rounded-md p-2 cursor-pointer flex items-center gap-2 [&:has(:checked)]:bg-muted"
                  >
                    <RadioGroupItem id="etodos" value="todos" />
                    Todos
                  </Label>
                  <Label
                    htmlFor="e7"
                    className="border rounded-md p-2 cursor-pointer flex items-center gap-2 [&:has(:checked)]:bg-muted"
                  >
                    <RadioGroupItem id="e7" value="7" />
                    No 7 días
                  </Label>
                  <Label
                    htmlFor="e30"
                    className="border rounded-md p-2 cursor-pointer flex items-center gap-2 [&:has(:checked)]:bg-muted"
                  >
                    <RadioGroupItem id="e30" value="30" />
                    No 30 días
                  </Label>
                </RadioGroup>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="efecha">Fecha y hora</Label>
                <Input
                  id="efecha"
                  type="datetime-local"
                  value={new Date(edit.fechaISO).toISOString().slice(0, 16)}
                  onChange={(e) =>
                    setEdit({ ...edit, fechaISO: new Date(e.target.value).toISOString() })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={guardarEdicion}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
