"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"

// Reçoit la session ouverte depuis l'espace support du site (groupegenetics-front) :
// l'URL contient #token=...&name=... ; le fragment n'est jamais envoyé au serveur.
export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1))
    const token = params.get("token")
    const name = params.get("name") || "Administrateur"
    // Retire le jeton de l'URL et de l'historique
    window.history.replaceState(null, "", window.location.pathname)

    if (token) {
      apiClient.setToken(token, name)
      router.replace("/dashboard")
    } else {
      router.replace("/login")
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center text-muted-foreground">
      Connexion au tableau de bord...
    </div>
  )
}
