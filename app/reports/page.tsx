"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Download } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import { apiClient } from "@/lib/api"

export default function Component() {
  const router = useRouter()

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5 // Nombre d'éléments par page

  const [reports, setReports] = useState<string[]>([]) // Store report filenames
  const [loadingReports, setLoadingReports] = useState(true)
  const [errorReports, setErrorReports] = useState<string | null>(null)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  // User authentication state (still needed for API calls, but not for Header display)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Function to fetch reports
  const fetchReports = useCallback(async () => {
    setLoadingReports(true)
    setErrorReports(null)
    const response = await apiClient.listGeneratedReports()
    if (response.data) {
      setReports(response.data)
    } else {
      setErrorReports(response.error || "Erreur lors du chargement des rapports.")
    }
    setLoadingReports(false)
  }, [])

  // Effect to load reports and user info on component mount
  useEffect(() => {
    const currentIsAuthenticated = apiClient.isAuthenticated()
    setIsAuthenticated(currentIsAuthenticated)

    // Only fetch reports if authenticated
    if (currentIsAuthenticated) {
      fetchReports()
    } else {
      setLoadingReports(false) // Stop loading if not authenticated
      setReports([]) // Clear reports if not authenticated
      setErrorReports("Veuillez vous connecter pour voir les rapports.")
    }
  }, [fetchReports])

  // Pagination logic
  const indexOfLastReport = currentPage * itemsPerPage
  const indexOfFirstReport = indexOfLastReport - itemsPerPage
  const currentReports = reports.slice(indexOfFirstReport, indexOfLastReport)
  const totalPages = Math.ceil(reports.length / itemsPerPage)

  const handleGenerateReport = async () => {
    if (!isAuthenticated) {
      alert("Veuillez vous connecter pour générer un rapport.")
      return
    }
    if (!startDate || !endDate) {
      alert("Veuillez sélectionner une date de début et une date de fin.")
      return
    }
    setIsGeneratingReport(true)
    const response = await apiClient.downloadCeoReport(startDate, endDate)
    if (response.data) {
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `rapport_ceo_incidents_${startDate}_to_${endDate}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      alert("Rapport généré et téléchargé avec succès !")
      fetchReports() // Refresh the list of reports
    } else {
      alert(`Erreur lors de la génération du rapport: ${response.error}`)
    }
    setIsGeneratingReport(false)
  }

  const handleDownload = async (filename: string) => {
    if (!isAuthenticated) {
      alert("Veuillez vous connecter pour télécharger un rapport.")
      return
    }
    const response = await apiClient.downloadExistingReport(filename)
    if (response.data) {
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      alert("Rapport téléchargé avec succès !")
    } else {
      alert(`Erreur lors du téléchargement du rapport: ${response.error}`)
    }
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  return (
    <>
      {/* Header ne prend plus de props userName, isAuthenticated, onAuthActionClick */}
      <Header />
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 pt-20 dark:bg-gray-950">
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6">
          {/* Formulaire de génération de rapport (Gauche) */}
          <Card className="w-full md:w-1/3 flex-shrink-0">
            <CardHeader>
              <CardTitle>Générer un Rapport</CardTitle>
              <CardDescription>Sélectionnez la période pour votre rapport.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Date de début</Label>
                <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">Date de fin</Label>
                <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <Button
                onClick={handleGenerateReport}
                className="w-full"
                disabled={isGeneratingReport || !isAuthenticated}
              >
                {isGeneratingReport ? "Génération..." : "Générer le rapport"}
              </Button>
            </CardContent>
          </Card>

          {/* Activités Récentes (Droite) */}
          <Card className="w-full md:w-2/3">
            <CardHeader>
              <CardTitle>Activités Récentes</CardTitle>
              <CardDescription>Rapports récemment générés.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {loadingReports ? (
                <p className="text-center text-muted-foreground">Chargement des rapports...</p>
              ) : errorReports ? (
                <p className="text-center text-red-500">{errorReports}</p>
              ) : currentReports.length > 0 ? (
                <div className="space-y-3">
                  {currentReports.map((reportName) => (
                    <div
                      key={reportName}
                      className="flex items-center justify-between p-3 border rounded-md bg-white dark:bg-gray-900"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{reportName}</span>
                        <span className="text-sm text-muted-foreground">
                          Période: {reportName.split("_to_")[0]?.split("_").slice(-1)[0] || "N/A"} au{" "}
                          {reportName.split("_to_")[1]?.replace(".pdf", "") || "N/A"}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(reportName)}
                        aria-label={`Télécharger ${reportName}`}
                        disabled={!isAuthenticated}
                      >
                        <Download className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">Aucun rapport généré récemment.</p>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage > 1) paginate(currentPage - 1)
                        }}
                        aria-disabled={currentPage === 1}
                        tabIndex={currentPage === 1 ? -1 : undefined}
                      />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink
                          href="#"
                          isActive={index + 1 === currentPage}
                          onClick={(e) => {
                            e.preventDefault()
                            paginate(index + 1)
                          }}
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage < totalPages) paginate(currentPage + 1)
                        }}
                        aria-disabled={currentPage === totalPages}
                        tabIndex={currentPage === totalPages ? -1 : undefined}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
