"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { getEmpresaScopedStore, seedIfEmpty } from "@/lib/store"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2 } from 'lucide-react'

export default function EnviarPushPage() {
  const [empresa, setEmpresa] = useState("acme")
  const [mensaje, setMensaje] = useState("")
  const [audiencia, setAudiencia] = useState<"todos" | "7" | "30">("todos")
  const [sentOk, setSentOk] = useState(false)

  useEffect(() => {
    const empresaCookie =
      document.cookie
        .split("; ")
        .find((c) => c.startsWith("empresa="))
        ?.split("=")[1] ?? "acme"
    setEmpresa(empresaCookie)
    seedIfEmpty(empresaCookie)
  }, [])

  const enviar = () => {
    const store = getEmpresaScopedStore(empresa)
    store.addPushInmediato({
      mensaje,
      audiencia,
    })
    setSentOk(true)
    setTimeout(() => setSentOk(false), 3000)
    setMensaje("")
    setAudiencia("todos")
  }

  const remaining = 200 - mensaje.length // ejemplo de límite
  const limitExceeded = remaining < 0

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Enviar Push</CardTitle>
          <CardDescription>{"Envía notificaciones push inmediatas a los usuarios."}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {sentOk && (
            <Alert className="border-green-500/40">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Enviado</AlertTitle>
              <AlertDescription>{"El push se ha enviado (simulado) correctamente."}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-2">
            <Label htmlFor="mensaje">Mensaje</Label>
            <Textarea
              id="mensaje"
              placeholder="Escribe tu mensaje..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              maxLength={limitExceeded ? undefined : 200}
            />
            <div className={`text-sm ${limitExceeded ? "text-red-600" : "text-muted-foreground"}`}>
              {limitExceeded
                ? `Has excedido el límite por ${-remaining} caracteres`
                : `Te quedan ${remaining} caracteres`}
            </div>
          </div>
          <div className="grid gap-2">
            <Label>{"Seleccionar audiencia"}</Label>
            <RadioGroup value={audiencia} onValueChange={(v) => setAudiencia(v as any)} className="flex gap-4">
              <Label
                htmlFor="todos"
                className="border rounded-md p-2 cursor-pointer flex items-center gap-2 [&:has(:checked)]:bg-muted"
              >
                <RadioGroupItem id="todos" value="todos" />
                Todos los usuarios
              </Label>
              <Label
                htmlFor="no7"
                className="border rounded-md p-2 cursor-pointer flex items-center gap-2 [&:has(:checked)]:bg-muted"
              >
                <RadioGroupItem id="no7" value="7" />
                No han venido en últimos 7 días
              </Label>
              <Label
                htmlFor="no30"
                className="border rounded-md p-2 cursor-pointer flex items-center gap-2 [&:has(:checked)]:bg-muted"
              >
                <RadioGroupItem id="no30" value="30" />
                No han venido en últimos 30 días
              </Label>
            </RadioGroup>
          </div>
          <div>
            <Button onClick={enviar} disabled={!mensaje || limitExceeded}>
              Enviar ahora
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
