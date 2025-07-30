import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-primary">
        Bienvenue sur notre application de gestion d'incidents
      </h1>
      <p className="text-lg md:text-xl text-center max-w-2xl mb-12 text-muted-foreground">
        Gérez vos incidents de manière efficace et intuitive. Connectez-vous pour accéder à votre tableau de bord.
      </p>
      <Link href="/login" passHref>
        <Button className="px-8 py-4 text-lg bg-secondary text-white hover:bg-secondary/90">Connexion</Button>
      </Link>
    </div>
  )
}
