"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react" // Import ArrowLeft icon
import { useRouter } from "next/navigation" // Import useRouter

export default function Header() {
  const router = useRouter()

  const handleBackClick = () => {
    router.push("/dashboard")
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-10 w-full py-4 border-b bg-background shadow-sm">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {" "}
          {/* Added a div for grouping */}
          <Button variant="ghost" size="icon" onClick={handleBackClick} title="Retour au Tableau de Bord">
            <ArrowLeft className="h-5 w-5 text-primary" />
            <span className="sr-only">Retour au Tableau de Bord</span>
          </Button>
          <h1 className="text-3xl font-bold text-primary">Tableau de Bord des Incidents</h1>
        </div>
        {/* Le reste du contenu du header (comme le nom d'utilisateur ou d'autres boutons) est supprimé */}
      </div>
    </header>
  )
}
