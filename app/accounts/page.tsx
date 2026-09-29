"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Clock, Loader2, LogOut, RefreshCw, Search, UserCheck, UserX, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { apiClient, type Account, type AccountStatus } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

type Filter = "ALL" | AccountStatus

const STATUS: Record<AccountStatus, { label: string; className: string }> = {
  PENDING: { label: "En attente", className: "bg-amber-50 text-amber-800 ring-amber-200" },
  APPROVED: { label: "Validé", className: "bg-emerald-50 text-emerald-800 ring-emerald-200" },
  REJECTED: { label: "Refusé", className: "bg-red-50 text-red-700 ring-red-200" },
}

const TABS: { key: Filter; label: string }[] = [
  { key: "PENDING", label: "En attente" },
  { key: "APPROVED", label: "Validés" },
  { key: "REJECTED", label: "Refusés" },
  { key: "ALL", label: "Tous" },
]

function formatDate(iso?: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
}

export default function AccountsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [accounts, setAccounts] = useState<Account[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>("PENDING")
  const [search, setSearch] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [rejecting, setRejecting] = useState<Account | null>(null)
  const [reason, setReason] = useState("")

  const handleAuthError = useCallback(
    (status: number) => {
      if (status === 401 || status === 403) {
        apiClient.removeToken()
        router.push("/login")
        return true
      }
      return false
    },
    [router],
  )

  const load = useCallback(async () => {
    setRefreshing(true)
    const res = await apiClient.listAccounts()
    setRefreshing(false)
    if (res.data) {
      setAccounts(res.data)
      setError(null)
    } else if (!handleAuthError(res.status)) {
      setError(res.error || "Impossible de charger les comptes.")
    }
  }, [handleAuthError])

  useEffect(() => {
    if (!apiClient.isAuthenticated()) {
      router.push("/login")
      return
    }
    load()
  }, [router, load])

  const counts = useMemo(() => {
    const list = accounts ?? []
    return {
      ALL: list.length,
      PENDING: list.filter((a) => a.account_status === "PENDING").length,
      APPROVED: list.filter((a) => a.account_status === "APPROVED").length,
      REJECTED: list.filter((a) => a.account_status === "REJECTED").length,
    }
  }, [accounts])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (accounts ?? []).filter(
      (a) =>
        (filter === "ALL" || a.account_status === filter) &&
        (!q || [a.name, a.email, a.company ?? "", a.phone ?? ""].some((v) => v.toLowerCase().includes(q))),
    )
  }, [accounts, filter, search])

  const replace = (updated: Account) =>
    setAccounts((list) => (list ?? []).map((a) => (a.id === updated.id ? updated : a)))

  const approve = async (account: Account) => {
    setBusyId(account.id)
    const res = await apiClient.approveAccount(account.id)
    setBusyId(null)
    if (res.data) {
      replace(res.data)
      toast({ title: "Compte validé", description: `${account.name} a été informé par e-mail qu'il peut se connecter.`, variant: "default" })
    } else if (!handleAuthError(res.status)) {
      toast({ title: "Validation impossible", description: res.error, variant: "destructive" })
    }
  }

  const confirmReject = async () => {
    if (!rejecting) return
    const account = rejecting
    setBusyId(account.id)
    const res = await apiClient.rejectAccount(account.id, reason.trim())
    setBusyId(null)
    if (res.data) {
      replace(res.data)
      setRejecting(null)
      setReason("")
      toast({ title: "Compte refusé", description: `${account.name} a été informé par e-mail.`, variant: "default" })
    } else if (!handleAuthError(res.status)) {
      toast({ title: "Refus impossible", description: res.error, variant: "destructive" })
    }
  }

  const actions = (account: Account) => {
    const busy = busyId === account.id
    return (
      <div className="flex flex-wrap justify-end gap-2">
        {account.account_status !== "APPROVED" && (
          <Button size="sm" disabled={busy} onClick={() => approve(account)} className="gap-1 bg-emerald-600 text-white hover:bg-emerald-700">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Valider
          </Button>
        )}
        {account.account_status !== "REJECTED" && (
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => {
              setReason("")
              setRejecting(account)
            }}
            className="gap-1 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
          >
            <X className="h-4 w-4" />
            Refuser
          </Button>
        )}
      </div>
    )
  }

  const badge = (status: AccountStatus) => (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${STATUS[status].className}`}>
      {STATUS[status].label}
    </span>
  )

  const stats = [
    { key: "PENDING" as Filter, label: "En attente de validation", value: counts.PENDING, icon: Clock, color: "text-amber-600 bg-amber-50" },
    { key: "APPROVED" as Filter, label: "Comptes validés", value: counts.APPROVED, icon: UserCheck, color: "text-emerald-600 bg-emerald-50" },
    { key: "REJECTED" as Filter, label: "Comptes refusés", value: counts.REJECTED, icon: UserX, color: "text-red-600 bg-red-50" },
    { key: "ALL" as Filter, label: "Total des comptes", value: counts.ALL, icon: Users, color: "text-primary bg-primary/10" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background shadow-sm">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} title="Retour au tableau de bord">
              <ArrowLeft className="h-5 w-5 text-primary" />
            </Button>
            <h1 className="text-2xl font-bold text-primary md:text-3xl">Gestion des comptes</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            title="Déconnexion"
            onClick={() => {
              apiClient.removeToken()
              router.push("/login")
            }}
          >
            <LogOut className="h-5 w-5 text-primary" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto space-y-6 px-4 py-8 md:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map(({ key, label, value, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-xl border bg-card p-5 text-left shadow-sm transition hover:shadow-md ${filter === key ? "ring-2 ring-primary" : ""}`}
            >
              <div className={`inline-flex rounded-lg p-2 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-3xl font-bold">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </button>
          ))}
        </div>

        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-xl text-primary">Demandes et comptes clients</CardTitle>
              <Button variant="outline" size="sm" onClick={load} disabled={refreshing} className="gap-2">
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                {TABS.map((tab) => (
                  <Button
                    key={tab.key}
                    size="sm"
                    variant={filter === tab.key ? "default" : "outline"}
                    onClick={() => setFilter(tab.key)}
                  >
                    {tab.label}
                    <span className="ml-2 rounded-full bg-black/10 px-2 text-xs">{counts[tab.key]}</span>
                  </Button>
                ))}
              </div>
              <div className="relative md:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un nom, e-mail, entreprise..."
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <p className="py-10 text-center text-red-600">{error}</p>
            ) : accounts === null ? (
              <p className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement des comptes...
              </p>
            ) : visible.length === 0 ? (
              <p className="py-10 text-center text-muted-foreground">
                {filter === "PENDING" && !search ? "Aucune demande en attente de validation." : "Aucun compte ne correspond."}
              </p>
            ) : (
              <>
                {/* Desktop : tableau */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Entreprise</TableHead>
                        <TableHead>Téléphone</TableHead>
                        <TableHead>Inscription</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visible.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell>
                            <p className="font-medium">{a.name}</p>
                            <p className="text-sm text-muted-foreground">{a.email}</p>
                          </TableCell>
                          <TableCell>{a.company || "—"}</TableCell>
                          <TableCell className="whitespace-nowrap">{a.phone || "—"}</TableCell>
                          <TableCell className="whitespace-nowrap">{formatDate(a.createdAt)}</TableCell>
                          <TableCell>{badge(a.account_status)}</TableCell>
                          <TableCell>{actions(a)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Mobile : cartes */}
                <ul className="space-y-3 md:hidden">
                  {visible.map((a) => (
                    <li key={a.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium">{a.name}</p>
                          <p className="break-all text-sm text-muted-foreground">{a.email}</p>
                        </div>
                        {badge(a.account_status)}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {a.company || "—"} · {a.phone || "—"} · inscrit le {formatDate(a.createdAt)}
                      </p>
                      <div className="mt-3">{actions(a)}</div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={!!rejecting} onOpenChange={(open) => !open && setRejecting(null)}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Refuser le compte de {rejecting?.name} ?</DialogTitle>
            <DialogDescription>
              Le client sera informé par e-mail que sa demande n&apos;a pas été validée.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Motif (facultatif, inclus dans l&apos;e-mail)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Ex. : entreprise non cliente de Genetics"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejecting(null)}>
              Annuler
            </Button>
            <Button
              onClick={confirmReject}
              disabled={busyId === rejecting?.id}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {busyId === rejecting?.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Refuser le compte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
