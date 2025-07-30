// Définition des types TypeScript basés sur vos modèles Pydantic
export enum Priority {
  FAIBLE = "FAIBLE",
  MOYENNE = "MOYENNE",
  HAUTE = "HAUTE",
  CRITIQUE = "CRITIQUE",
}

export enum Category {
  RESEAU = "RESEAU",
  SECURITE = "SECURITE",
  LOGICIEL = "LOGICIEL",
  MATERIEL = "MATERIEL",
  ACCES = "ACCES",
  SURVEVEILLANCE = "SURVEVEILLANCE",
  AUTRE = "AUTRE",
}

export enum IncidentStatus {
  EN_ATTENTE = "EN_ATTENTE",
  EN_TRAITEMENT = "EN_TRAITEMENT",
  TERMINE = "TERMINE",
  FERME = "FERME",
}

export interface IncidentOut {
  id: string // UUID sera une chaîne en JS/TS
  title: string
  description: string
  priority: Priority
  category: Category
  status: IncidentStatus
  createdAt: string // Date sera une chaîne en ISO format
  updatedAt: string // Date sera une chaîne en ISO format
  userId: string // UUID sera une chaîne en JS/TS
}

export interface IncidentStatusUpdate {
  status: IncidentStatus
}

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  status: number
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user_name: string
}

export interface DateRange {
  start_date: string
  end_date: string
}

class ApiClient {
  private baseURL: string
  private token: string | null = null
  private userName: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("access_token")
      this.userName = localStorage.getItem("user_name")
    }
  }

  setToken(token: string, userName: string) {
    this.token = token
    this.userName = userName
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token)
      localStorage.setItem("user_name", userName)
    }
  }

  removeToken() {
    this.token = null
    this.userName = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token")
      localStorage.removeItem("user_name")
    }
  }

  isAuthenticated(): boolean {
    return !!this.token
  }

  getUserName(): string | null {
    return this.userName
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    }

    // Ajouter Content-Type si ce n'est pas un FormData et si non spécifié
    if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json"
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (response.status === 204) {
        return {
          data: null as unknown as T,
          status: response.status,
        }
      }

      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json()
        if (!response.ok) {
          return {
            error: data.detail || "Une erreur est survenue",
            status: response.status,
          }
        }
        return {
          data,
          status: response.status,
        }
      } else {
        // Handle non-JSON responses (e.g., plain text, HTML, etc.)
        const text = await response.text()
        if (!response.ok) {
          return {
            error: text || "Une erreur est survenue (non-JSON)",
            status: response.status,
          }
        }
        // If it's not JSON but OK, return as is (might need specific handling for T)
        return {
          data: text as unknown as T, // Cast as T, but be careful with this
          status: response.status,
        }
      }
    } catch (error) {
      console.error("API Client Request Error:", error)
      return {
        error: "Erreur de connexion au serveur",
        status: 500,
      }
    }
  }

  async login(username: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const formData = new FormData()
    formData.append("username", username)
    formData.append("password", password)
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: "POST",
        body: formData,
      })
      const data = await response.json()
      if (!response.ok) {
        return {
          error: data.detail || "Erreur de connexion",
          status: response.status,
        }
      }
      this.setToken(data.access_token, data.user_name || username)
      return {
        data,
        status: response.status,
      }
    } catch (error) {
      return {
        error: "Erreur de connexion au serveur",
        status: 500,
      }
    }
  }

  /**
   * Récupère tous les incidents.
   * @returns Une promesse qui résout en une liste d'incidents.
   */
  async getAllIncidents(): Promise<ApiResponse<IncidentOut[]>> {
    return this.request<IncidentOut[]>("/incidents/all-incidents")
  }

  /**
   * Met à jour le statut d'un incident spécifique.
   * @param incidentId L'ID de l'incident à mettre à jour.
   * @param newStatus Le nouveau statut de l'incident.
   * @returns Une promesse qui résout en l'incident mis à jour.
   */
  async updateIncidentStatus(incidentId: string, newStatus: IncidentStatus): Promise<ApiResponse<IncidentOut>> {
    const payload: IncidentStatusUpdate = { status: newStatus }
    return this.request<IncidentOut>(`/incidents/update-status/${incidentId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  }

  /**
   * Génère et télécharge un rapport CEO au format PDF.
   * @param startDate La date de début du rapport (format YYYY-MM-DD).
   * @param endDate La date de fin du rapport (format YYYY-MM-DD).
   * @returns Une promesse qui résout en un Blob contenant le PDF.
   */
  async downloadCeoReport(startDate: string, endDate: string): Promise<ApiResponse<Blob>> {
    const payload: DateRange = { start_date: startDate, end_date: endDate }
    try {
      const url = `${this.baseURL}/incidents/report-ceo`
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      if (this.token) {
        headers["Authorization"] = `Bearer ${this.token}`
      }
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Erreur inconnue" }))
        return {
          error: errorData.detail || "Erreur lors de la génération du rapport",
          status: response.status,
        }
      }
      const blob = await response.blob()
      return {
        data: blob,
        status: response.status,
      }
    } catch (error) {
      console.error("API Client Download CEO Report Error:", error)
      return {
        error: "Erreur de connexion au serveur lors de la génération du rapport",
        status: 500,
      }
    }
  }

  /**
   * Liste les rapports PDF déjà générés.
   * @returns Une promesse qui résout en une liste de noms de fichiers de rapports.
   */
  async listGeneratedReports(): Promise<ApiResponse<string[]>> {
    // The backend returns a JSON object like { "reports": ["file1.pdf", "file2.pdf"] }
    const response = await this.request<{ reports: string[] }>("/incidents/list-reports")
    if (response.data) {
      return {
        data: response.data.reports,
        status: response.status,
      }
    }
    return {
      error: response.error || "Impossible de lister les rapports",
      status: response.status,
    }
  }

  /**
   * Télécharge un rapport PDF existant par son nom de fichier.
   * @param filename Le nom du fichier du rapport à télécharger.
   * @returns Une promesse qui résout en un Blob contenant le PDF.
   */
  async downloadExistingReport(filename: string): Promise<ApiResponse<Blob>> {
    try {
      const url = `${this.baseURL}/incidents/download-report/${filename}`
      const headers: Record<string, string> = {}
      if (this.token) {
        headers["Authorization"] = `Bearer ${this.token}`
      }
      const response = await fetch(url, {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Erreur inconnue" }))
        return {
          error: errorData.detail || "Erreur lors du téléchargement du rapport",
          status: response.status,
        }
      }
      const blob = await response.blob()
      return {
        data: blob,
        status: response.status,
      }
    } catch (error) {
      console.error("API Client Download Existing Report Error:", error)
      return {
        error: "Erreur de connexion au serveur lors du téléchargement du rapport",
        status: 500,
      }
    }
  }
}

const BASE_URL = "https://genetics-api.onrender.com"
export const apiClient = new ApiClient(BASE_URL)
