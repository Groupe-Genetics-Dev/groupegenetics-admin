"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { apiClient, type IncidentOut, IncidentStatus, Priority, Category } from "@/lib/api"

// Mappage des statuts de l'API vers des libellés plus lisibles pour l'affichage
const STATUS_DISPLAY_MAP: Record<IncidentStatus, string> = {
  [IncidentStatus.EN_ATTENTE]: "En attente",
  [IncidentStatus.EN_TRAITEMENT]: "En traitement",
  [IncidentStatus.TERMINE]: "Terminé",
  [IncidentStatus.FERME]: "Fermé",
}

// Mappage des priorités pour l'affichage
const PRIORITY_DISPLAY_MAP: Record<Priority, string> = {
  [Priority.FAIBLE]: "Faible",
  [Priority.MOYENNE]: "Moyenne",
  [Priority.HAUTE]: "Haute",
  [Priority.CRITIQUE]: "Critique",
}

// Mappage des catégories pour l'affichage
const CATEGORY_DISPLAY_MAP: Record<Category, string> = {
  [Category.RESEAU]: "Réseau",
  [Category.SECURITE]: "Sécurité",
  [Category.LOGICIEL]: "Logiciel",
  [Category.MATERIEL]: "Matériel",
  [Category.ACCES]: "Accès",
  [Category.SURVEVEILLANCE]: "Surveillance",
  [Category.AUTRE]: "Autre",
}

export default function IncidentDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const [incident, setIncident] = useState<IncidentOut | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchIncidentDetails = async () => {
      if (!apiClient.isAuthenticated()) {
        router.push("/login")
        return
      }

      setLoading(true)
      setError(null)

      // Pour l'instant, nous récupérons tous les incidents et filtrons par ID.
      // Idéalement, votre API devrait avoir un endpoint `/incidents/{id}`.
      const response = await apiClient.getAllIncidents()
      if (response.data) {
        const foundIncident = response.data.find((inc) => inc.id === id)
        if (foundIncident) {
          setIncident(foundIncident)
        } else {
          setError("Incident non trouvé.")
        }
      } else {
        setError(response.error || "Erreur lors du chargement des détails de l'incident.")
        if (response.status === 401 || response.status === 403) {
          apiClient.removeToken()
          router.push("/login")
        }
      }
      setLoading(false)
    }

    fetchIncidentDetails()
  }, [id, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-primary">Chargement des détails de l'incident...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <p className="text-red-500 text-center">{error}</p>
        <Button onClick={() => router.back()} className="mt-4 bg-secondary text-white hover:bg-secondary/90">
          Retour
        </Button>
      </div>
    )
  }

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <p className="text-muted-foreground text-center">Aucune donnée d'incident disponible.</p>
        <Button onClick={() => router.back()} className="mt-4 bg-secondary text-white hover:bg-secondary/90">
          Retour
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <header className="w-full py-4 border-b mb-6 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-5 w-5 text-primary" />
          <span className="sr-only">Retour</span>
        </Button>
        <h1 className="text-3xl font-bold text-primary">Détails de l'Incident</h1>
      </header>

      <main className="flex-1 container mx-auto">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">{incident.title}</CardTitle>
            <CardDescription>ID de l'incident: {incident.id}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Statut</p>
                <p className="text-lg font-semibold">
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-semibold
                      ${incident.status === IncidentStatus.EN_ATTENTE ? "bg-gray-100 text-gray-800" : ""}
                      ${incident.status === IncidentStatus.EN_TRAITEMENT ? "bg-yellow-100 text-yellow-800" : ""}
                      ${incident.status === IncidentStatus.TERMINE ? "bg-blue-100 text-blue-800" : ""}
                      ${incident.status === IncidentStatus.FERME ? "bg-green-100 text-green-800" : ""}
                    `}
                  >
                    {STATUS_DISPLAY_MAP[incident.status]}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Priorité</p>
                <p className="text-lg font-semibold">{PRIORITY_DISPLAY_MAP[incident.priority]}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Catégorie</p>
                <p className="text-lg font-semibold">{CATEGORY_DISPLAY_MAP[incident.category]}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assigné à (ID Utilisateur)</p>
                <p className="text-lg font-semibold">{incident.userId}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-base whitespace-pre-wrap">{incident.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date de création</p>
                <p className="text-base">{new Date(incident.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dernière mise à jour</p>
                <p className="text-base">{new Date(incident.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
