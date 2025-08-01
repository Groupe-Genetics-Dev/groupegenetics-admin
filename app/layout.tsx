import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster" 

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Incident Management App",
  description: "Gérez vos incidents de manière efficace et intuitive.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        {children}
        <Toaster /> {/* Ajoutez le Toaster ici */}
      </body>
    </html>
  )
}
