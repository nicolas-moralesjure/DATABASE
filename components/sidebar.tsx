"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { Home, Users, Bell, MapPin, Clock, Wallet } from 'lucide-react'

export function Sidebar({ empresaDefault = "acme" }: { empresaDefault?: string }) {
  const pathname = usePathname()

  const Item = ({
    href,
    icon,
    children,
  }: {
    href: string
    icon: React.ReactNode
    children: React.ReactNode
  }) => {
    const active = pathname === href
    return (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
          active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {icon}
        <span>{children}</span>
      </Link>
    )
  }
  Item.defaultProps = {}

  return (
    <div className="h-dvh sticky top-0 p-4">
      <div className="text-sm font-semibold px-3 pb-3">Empresa: {empresaDefault}</div>
      <nav className="grid gap-1">
        <Item href="/" icon={<Home className="h-4 w-4" />}>
          Home
        </Item>
        <Item href="/clientes" icon={<Users className="h-4 w-4" />}>
          Clientes
        </Item>
        <Accordion type="single" collapsible defaultValue={pathname?.startsWith("/push") ? "push" : undefined}>
          <AccordionItem value="push" className="border-none">
            <AccordionTrigger className="px-3 py-2 hover:no-underline rounded-md [&>svg]:h-4 [&>svg]:w-4">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4" />
                <span>Push</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pl-8">
              <div className="grid">
                <Item href="/push/enviar" icon={<span className="inline-block w-4" />}>
                  Enviar Push
                </Item>
                <Item href="/push/geolocalizacion" icon={<MapPin className="h-4 w-4" />}>
                  Geolocalización
                </Item>
                <Item href="/push/programar" icon={<Clock className="h-4 w-4" />}>
                  Programar Push
                </Item>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Item href="/wallets" icon={<Wallet className="h-4 w-4" />}>
          Wallets
        </Item>
      </nav>
    </div>
  )
}
