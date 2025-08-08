"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Empresa por defecto si no hay cookie
  const [empresa, setEmpresa] = useState("demo")

  useEffect(() => {
    const emp =
      document.cookie
        .split("; ")
        .find((c) => c.startsWith("empresa="))
        ?.split("=")[1] ?? "demo"
    setEmpresa(emp)
  }, [])

  return (
    <div className="min-h-dvh w-full grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block border-r">
        <Sidebar empresaDefault={empresa} />
      </aside>
      <div className="flex min-h-dvh flex-col">
        <Topbar empresaDefault={empresa} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
