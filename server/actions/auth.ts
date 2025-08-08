"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Simple demo action: sets a cookie "session" and "empresa" then redirects.
// For production, implement proper session encryption, expiration, and deletion as recommended by Next.js guides [^1][^2].
export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "")
  const empresa = String(formData.get("empresa") || "acme")

  // naive validation (demo)
  if (!email || !empresa) {
    redirect("/login")
  }

  const cookieStore = await cookies()
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  cookieStore.set("session", "demo-session", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires,
  })
  cookieStore.set("empresa", empresa, {
    httpOnly: false,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires,
  })

  redirect("/")
}
