"use client"
import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, LogOut, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient, type IncidentOut, IncidentStatus, Priority, Category } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

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

// Options de statut pour le menu déroulant, basées sur l'enum
const STATUS_OPTIONS = Object.values(IncidentStatus)
const PRIORITY_OPTIONS = Object.values(Priority)
const CATEGORY_OPTIONS = Object.values(Category)
const POLLING_INTERVAL = 30000 // 30 secondes

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<IncidentStatus | "all">("all")
  const [selectedPriority, setSelectedPriority] = useState<Priority | "all">("all")
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all")
  const [incidents, setIncidents] = useState<IncidentOut[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const userName = apiClient.getUserName()
  const { toast } = useToast()
  // Ref pour stocker les incidents précédemment récupérés pour la détection de nouveaux incidents
  const lastFetchedIncidentsRef = useRef<Set<string>>(new Set())

  // Fonction pour récupérer les incidents
  const fetchIncidents = async (showNotifications = false) => {
    if (!apiClient.isAuthenticated()) {
      router.push("/login")
      return
    }
    if (!showNotifications) {
      setLoading(true)
      setError(null)
    }
    const response = await apiClient.getAllIncidents()
    if (response.data) {
      const currentIncidentIds = new Set(response.data.map((inc) => inc.id))
      if (showNotifications) {
        const newIncidents = response.data.filter((inc) => !lastFetchedIncidentsRef.current.has(inc.id))
        newIncidents.forEach((newInc) => {
          toast({
            title: "Nouvel incident signalé !",
            description: `ID: ${newInc.id} - ${newInc.title} (Statut: ${STATUS_DISPLAY_MAP[newInc.status]})`,
            variant: "default",
            duration: 5000,
          })
        })
      }
      lastFetchedIncidentsRef.current = currentIncidentIds
      const sortedIncidents = response.data.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      setIncidents(sortedIncidents)
    } else {
      setError(response.error || "Erreur lors du chargement des incidents.")
      if (response.status === 401 || response.status === 403) {
        apiClient.removeToken()
        router.push("/login")
      }
    }
    if (!showNotifications) {
      setLoading(false)
    }
  }

  // Effet pour le chargement initial et le polling
  useEffect(() => {
    fetchIncidents(false)
    const intervalId = setInterval(() => {
      fetchIncidents(true)
    }, POLLING_INTERVAL)
    return () => clearInterval(intervalId)
  }, [router])

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesSearchTerm = Object.values(incident).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase()),
      )
      const matchesStatus = selectedStatus === "all" || incident.status === selectedStatus
      const matchesPriority = selectedPriority === "all" || incident.priority === selectedPriority
      const matchesCategory = selectedCategory === "all" || incident.category === selectedCategory
      return matchesSearchTerm && matchesStatus && matchesPriority && matchesCategory
    })
  }, [incidents, searchTerm, selectedStatus, selectedPriority, selectedCategory])

  const incidentStats = useMemo(() => {
    return incidents.reduce(
      (acc, incident) => {
        acc[incident.status] = (acc[incident.status] || 0) + 1
        return acc
      },
      {} as Record<IncidentStatus, number>,
    )
  }, [incidents])

  const handleShowDetails = (incidentId: string) => {
    router.push(`/dashboard/incidents/${incidentId}`)
  }

  const handleUpdateStatus = async (incidentId: string, newStatus: IncidentStatus) => {
    const response = await apiClient.updateIncidentStatus(incidentId, newStatus)
    if (response.data) {
      setIncidents((prevIncidents) =>
        prevIncidents.map((inc) => (inc.id === incidentId ? { ...inc, status: newStatus } : inc)),
      )
      toast({
        title: "Statut mis à jour !",
        description: `L'incident ${incidentId} est maintenant "${STATUS_DISPLAY_MAP[newStatus]}".`,
        variant: "default",
        duration: 3000,
      })
    } else {
      toast({
        title: "Erreur de mise à jour",
        description: `Impossible de mettre à jour le statut de l'incident ${incidentId}: ${response.error || "Erreur inconnue"}`,
        variant: "destructive",
        duration: 5000,
      })
      if (response.status === 401 || response.status === 403) {
        apiClient.removeToken()
        router.push("/login")
      }
    }
  }

  const handleLogout = () => {
    apiClient.removeToken()
    router.push("/login")
  }

  const handleGenerateReport = () => {
    router.push('/reports'); 
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-primary">Chargement des incidents...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => fetchIncidents(false)} className="mt-4 bg-primary text-white hover:bg-primary/90">
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-10 w-full py-4 border-b bg-background shadow-sm">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">Tableau de Bord des Incidents</h1>
          <div className="flex items-center space-x-4">
            {userName && <span className="text-lg text-primary hidden sm:block">Bienvenue, {userName}</span>}
            <Button variant="ghost" size="icon" onClick={handleGenerateReport} title="Générer rapport">
              <FileText className="h-5 w-5 text-primary" />
              <span className="sr-only">Générer rapport</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Déconnexion">
              <LogOut className="h-5 w-5 text-primary" />
              <span className="sr-only">Déconnexion</span>
            </Button>
          </div>
        </div>
      </header>
      {/* Main content with padding to account for fixed header */}
      <main className="flex-1 container mx-auto pt-20 pb-6 px-4 md:px-6 lg:px-8">
        {/* Incident Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <span className="text-gray-500">●</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{incidentStats[IncidentStatus.EN_ATTENTE] || 0}</div>
              <p className="text-xs text-muted-foreground">Incidents en attente de traitement</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En traitement</CardTitle>
              <span className="text-yellow-500">●</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{incidentStats[IncidentStatus.EN_TRAITEMENT] || 0}</div>
              <p className="text-xs text-muted-foreground">Incidents en cours de résolution</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terminé</CardTitle>
              <span className="text-blue-500">●</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{incidentStats[IncidentStatus.TERMINE] || 0}</div>
              <p className="text-xs text-muted-foreground">Incidents résolus, en attente de fermeture</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fermé</CardTitle>
              <span className="text-green-500">●</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{incidentStats[IncidentStatus.FERME] || 0}</div>
              <p className="text-xs text-muted-foreground">Incidents clôturés</p>
            </CardContent>
          </Card>
        </div>
        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            type="text"
            placeholder="Rechercher un incident par titre, description..."
            className="w-full sm:max-w-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={selectedStatus} onValueChange={(value: IncidentStatus | "all") => setSelectedStatus(value)}>
            <SelectTrigger className="w-full sm:max-w-[180px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_DISPLAY_MAP[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedPriority} onValueChange={(value: Priority | "all") => setSelectedPriority(value)}>
            <SelectTrigger className="w-full sm:max-w-[180px]">
              <SelectValue placeholder="Filtrer par priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les priorités</SelectItem>
              {PRIORITY_OPTIONS.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {PRIORITY_DISPLAY_MAP[priority]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={(value: Category | "all") => setSelectedCategory(value)}>
            <SelectTrigger className="w-full sm:max-w-[180px]">
              <SelectValue placeholder="Filtrer par catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {CATEGORY_OPTIONS.map((category) => (
                <SelectItem key={category} value={category}>
                  {CATEGORY_DISPLAY_MAP[category]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary">Liste des Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="hidden md:table-cell">Priorité</TableHead>
                    <TableHead className="hidden lg:table-cell">Catégorie</TableHead>
                    <TableHead className="hidden sm:table-cell">Date Création</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncidents.length > 0 ? (
                    filteredIncidents.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell className="font-medium">{incident.id}</TableCell>
                        <TableCell>
                          <span className="line-clamp-1 max-w-[150px] md:max-w-none">{incident.title}</span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold
                            ${incident.status === IncidentStatus.EN_ATTENTE ? "bg-gray-100 text-gray-800" : ""}
                            ${incident.status === IncidentStatus.EN_TRAITEMENT ? "bg-yellow-100 text-yellow-800" : ""}
                            ${incident.status === IncidentStatus.TERMINE ? "bg-blue-100 text-blue-800" : ""}
                            ${incident.status === IncidentStatus.FERME ? "bg-green-100 text-green-800" : ""}
                          `}
                          >
                            {STATUS_DISPLAY_MAP[incident.status]}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {PRIORITY_DISPLAY_MAP[incident.priority]}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {CATEGORY_DISPLAY_MAP[incident.category]}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {new Date(incident.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Ouvrir le menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleShowDetails(incident.id)}>
                                Afficher détails
                              </DropdownMenuItem>
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Modifier statut</DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  {STATUS_OPTIONS.map((status) => (
                                    <DropdownMenuItem
                                      key={status}
                                      onClick={() => handleUpdateStatus(incident.id, status)}
                                    >
                                      {STATUS_DISPLAY_MAP[status]}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                        Aucun incident trouvé.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
