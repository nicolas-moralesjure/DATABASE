"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { getEmpresaScopedStore, seedIfEmpty } from "@/lib/store"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2 } from 'lucide-react'

export default function GeolocalizacionPage() {
  const [empresa, setEmpresa] = useState("acme")
  const [mensaje, setMensaje] = useState("")
  const [direccion, setDireccion] = useState("")
  const [lat, setLat] = useState<number>(-34.6037)
  const [lng, setLng] = useState<number>(-58.3816)
  const [radio, setRadio] = useState<number>(500)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const empresaCookie =
      document.cookie
        .split("; ")
        .find((c) => c.startsWith("empresa="))
        ?.split("=")[1] ?? "acme"
    setEmpresa(empresaCookie)
    seedIfEmpty(empresaCookie)
    const cfg = getEmpresaScopedStore(empresaCookie).getGeofence()
    if (cfg) {
      setMensaje(cfg.mensaje || "")
      setDireccion(cfg.direccion || "")
      setLat(cfg.lat ?? lat)
      setLng(cfg.lng ?? lng)
      setRadio(cfg.radio ?? radio)
    }
  }, [])

  const guardar = () => {
    const store = getEmpresaScopedStore(empresa)
    store.saveGeofence({ mensaje, direccion, lat, lng, radio })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Geolocalización</CardTitle>
          <CardDescription>{"Configura mensajes automáticos por proximidad."}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {saved && (
            <Alert className="border-green-500/40">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Guardado</AlertTitle>
              <AlertDescription>{"Los cambios se han guardado correctamente."}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-2">
            <Label htmlFor="mensaje">Mensaje cercano</Label>
            <Textarea
              id="mensaje"
              placeholder="Escribe el mensaje que se enviará al estar cerca del local"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              placeholder="Calle 123, Ciudad"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="lat">Latitud</Label>
              <Input
                id="lat"
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lng">Longitud</Label>
              <Input
                id="lng"
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Radio de activación: {radio} m</Label>
              <Slider value={[radio]} onValueChange={(v) => setRadio(v[0] || 0)} min={50} max={2000} step={50} />
            </div>
          </div>
          <div className="rounded-md border p-3 bg-muted/30">
            <div className="text-sm mb-2">Vista previa del área (mapa de ejemplo):</div>
            <img
              src="/static-map-preview-marker.png"
              alt="Vista previa del mapa"
              className="w-full h-[220px] object-cover rounded-md border"
            />
            <div className="text-xs text-muted-foreground mt-2">
              {"Integra un mapa real (p.ej., Leaflet u otro proveedor) en producción."}
            </div>
          </div>
          <div>
            <Button onClick={guardar}>Guardar cambios</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
