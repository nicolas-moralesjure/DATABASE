export type Cliente = {
  id: string
  nombre: string
  fechaNacimiento: string
  celular: string
  email: string
  creadoEl: string
  ultimoUso?: string
}

export type Wallet = {
  id: string
  nombre: string
  creadoEl: string
  activa: boolean
  imagen: string
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function keyEmpresa(empresa: string, key: string) {
  return `wallet-admin:${empresa}:${key}`
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // no-op
  }
}

export function seedIfEmpty(empresa: string) {
  if (typeof window === "undefined") return
  const seeded = localStorage.getItem(keyEmpresa(empresa, "seeded"))
  if (seeded) return

  const now = new Date()
  const clientes: Cliente[] = Array.from({ length: 24 }).map((_, i) => {
    const created = new Date(now.getTime() - i * 86400000)
    const usedDaysAgo = Math.random() > 0.5 ? Math.floor(Math.random() * 30) : null
    return {
      id: uid(),
      nombre: `Cliente ${i + 1}`,
      fechaNacimiento: "1990-01-01",
      celular: `+54 11 5555-${String(1000 + i)}`,
      email: `cliente${i + 1}@${empresa}.com`,
      creadoEl: created.toISOString(),
      ultimoUso: usedDaysAgo !== null ? new Date(now.getTime() - usedDaysAgo * 86400000).toISOString() : undefined,
    }
  })

  const wallets: Wallet[] = [
    {
      id: uid(),
      nombre: "Wallet Principal",
      creadoEl: now.toISOString(),
      activa: true,
      imagen: "/digital-card-wallet-preview.png",
    },
    {
      id: uid(),
      nombre: "Wallet Promociones",
      creadoEl: now.toISOString(),
      activa: false,
      imagen: "/digital-wallet-promo-card.png",
    },
  ]

  write(keyEmpresa(empresa, "clientes"), clientes)
  write(keyEmpresa(empresa, "wallets"), wallets)
  write(keyEmpresa(empresa, "push:inmediatos"), [])
  write(keyEmpresa(empresa, "push:programados"), [])
  write(keyEmpresa(empresa, "geofence"), {
    mensaje: "¡Estás cerca! Ven y recibe un beneficio.",
    direccion: "",
    lat: -34.6037,
    lng: -58.3816,
    radio: 500,
  })
  write(keyEmpresa(empresa, "seeded"), true)
}

export function getEmpresaScopedStore(empresa: string) {
  return {
    getClientes(): Cliente[] {
      return read<Cliente[]>(keyEmpresa(empresa, "clientes"), [])
    },
    addCliente(data: { nombre: string; fechaNacimiento: string; celular: string; email: string }) {
      const all = this.getClientes()
      all.unshift({
        id: uid(),
        nombre: data.nombre,
        fechaNacimiento: data.fechaNacimiento,
        celular: data.celular,
        email: data.email,
        creadoEl: new Date().toISOString(),
      })
      write(keyEmpresa(empresa, "clientes"), all)
    },
    bulkAddClientes(list: { nombre: string; fechaNacimiento: string; celular: string; email: string }[]) {
      const all = this.getClientes()
      const next = list.map((d) => ({
        id: uid(),
        nombre: d.nombre,
        fechaNacimiento: d.fechaNacimiento,
        celular: d.celular,
        email: d.email,
        creadoEl: new Date().toISOString(),
      }))
      write(keyEmpresa(empresa, "clientes"), [...next, ...all])
    },

    getUsoTrend(): { day: string; usos: number }[] {
      // 14 días de tendencia basada en ultimoUso de clientes
      const clientes = this.getClientes()
      const map = new Map<string, number>()
      const today = new Date()
      for (let i = 13; i >= 0; i--) {
        const d = new Date(today.getTime() - i * 86400000)
        const key = `${d.getMonth() + 1}/${d.getDate()}`
        map.set(key, 0)
      }
      clientes.forEach((c) => {
        if (!c.ultimoUso) return
        const d = new Date(c.ultimoUso)
        const key = `${d.getMonth() + 1}/${d.getDate()}`
        if (map.has(key)) map.set(key, (map.get(key) || 0) + 1)
      })
      return Array.from(map.entries()).map(([day, usos]) => ({ day, usos }))
    },

    addPushInmediato(data: { mensaje: string; audiencia: "todos" | "7" | "30" }) {
      const key = keyEmpresa(empresa, "push:inmediatos")
      const all = read<any[]>(key, [])
      all.unshift({
        id: uid(),
        ...data,
        enviadoEl: new Date().toISOString(),
      })
      write(key, all)
    },

    getProgramados(): any[] {
      return read<any[]>(keyEmpresa(empresa, "push:programados"), [])
    },
    addProgramado(data: { mensaje: string; audiencia: "todos" | "7" | "30"; fechaISO: string }) {
      const key = keyEmpresa(empresa, "push:programados")
      const all = read<any[]>(key, [])
      all.unshift({
        id: uid(),
        ...data,
        estado: "Pendiente",
        creadoEl: new Date().toISOString(),
      })
      write(key, all)
    },
    updateProgramado(id: string, patch: any) {
      const key = keyEmpresa(empresa, "push:programados")
      const all = read<any[]>(key, [])
      const next = all.map((p) => (p.id === id ? { ...p, ...patch } : p))
      write(key, next)
    },

    getGeofence(): { mensaje: string; direccion: string; lat: number; lng: number; radio: number } | null {
      return read<any>(keyEmpresa(empresa, "geofence"), null)
    },
    saveGeofence(cfg: { mensaje: string; direccion: string; lat: number; lng: number; radio: number }) {
      write(keyEmpresa(empresa, "geofence"), cfg)
    },

    getWallets(): Wallet[] {
      return read<Wallet[]>(keyEmpresa(empresa, "wallets"), [])
    },
    addWallet(data: { nombre: string; activa: boolean }) {
      const key = keyEmpresa(empresa, "wallets")
      const all = read<Wallet[]>(key, [])
      all.unshift({
        id: uid(),
        nombre: data.nombre,
        activa: data.activa,
        creadoEl: new Date().toISOString(),
        imagen: "/nueva-wallet-vista-previa.png",
      })
      write(key, all)
    },
    updateWallet(id: string, patch: Partial<Wallet>) {
      const key = keyEmpresa(empresa, "wallets")
      const all = read<Wallet[]>(key, [])
      const next = all.map((w) => (w.id === id ? { ...w, ...patch } : w))
      write(key, next)
    },
  }
}
