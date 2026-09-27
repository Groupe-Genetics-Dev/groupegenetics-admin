# Application de Gestion d'Incidents

<div align="center">
  <h3>🎯 Interface Web moderne pour la gestion des incidents techniques</h3>
  <p>Application Next.js avec interface utilisateur élégante et intuitive</p>
</div>

---

## ⚡ Démarrage rapide

### 🐳 Avec Docker (recommandé)

Prérequis : Docker + Docker Compose v2, et l'API `groupegenetics-api` démarrée (voir son README).

```bash
cp .env.example .env          # NEXT_PUBLIC_API_URL = URL de l'API vue depuis le navigateur
docker compose up -d --build
```

- Interface admin : http://localhost:3000
- `NEXT_PUBLIC_API_URL` est intégrée au bundle au moment du build : après l'avoir modifiée, relancer `docker compose up -d --build`.
- Arrêter : `docker compose down`.

### 💻 En local (sans Docker)

Prérequis : Node.js 20+ (22 recommandé).

```bash
npm install                # .npmrc active legacy-peer-deps (React 19)
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev                # http://localhost:3000
```

Build de production : `npm run build && npm start`.

## 📋 Table des Matières

- [À Propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Structure du Projet](#-structure-du-projet)
- [Interface Utilisateur](#-interface-utilisateur)
- [Intégration API](#-intégration-api)
- [Déploiement](#-déploiement)
- [Contribution](#-contribution)

## 🎯 À Propos

Cette application web moderne développée avec **Next.js 14** offre une interface utilisateur intuitive pour la gestion des incidents techniques. Elle se connecte à l'API FastAPI du Groupe Genetics pour fournir une expérience utilisateur fluide et responsive.

### 🎭 Fonctionnalités Principales

- **🏠 Page d'accueil** accueillante avec design moderne
- **🔐 Système de connexion** sécurisé
- **📱 Design responsive** adapté à tous les écrans
- **🎨 Interface élégante** avec composants UI réutilisables
- **⚡ Performance optimisée** avec Next.js 14

## ✨ Fonctionnalités

### 🎨 **Interface Utilisateur**
- Design moderne et épuré
- Composants UI cohérents avec shadcn/ui
- Navigation intuitive
- Responsive design (mobile, tablet, desktop)
- Thème personnalisable (clair/sombre)

### 🔐 **Authentification**
- Page de connexion sécurisée
- Intégration avec l'API d'authentification
- Gestion des sessions utilisateur
- Redirection automatique après connexion

### 📊 **Gestion des Incidents** (À venir)
- Tableau de bord des incidents
- Création et modification d'incidents
- Suivi en temps réel des statuts
- Filtrage et recherche avancés
- Notifications en temps réel

### 📱 **Expérience Mobile**
- Interface optimisée pour mobile
- Navigation tactile intuitive
- Performance optimisée
- Offline support (PWA ready)

## 🛠️ Technologies

### **Frontend Framework**
- **Next.js 14** - Framework React avec App Router
- **React 18** - Bibliothèque UI moderne
- **TypeScript** - Typage statique pour plus de robustesse
- **Tailwind CSS** - Framework CSS utilitaire

### **Composants UI**
- **shadcn/ui** - Composants UI modernes et accessibles
- **Radix UI** - Composants primitifs accessibles
- **Lucide Icons** - Icônes modernes et cohérentes

### **Outils de Développement**
- **ESLint** - Linting du code
- **Prettier** - Formatage automatique
- **PostCSS** - Traitement CSS avancé

### **Déploiement**
- **Vercel** - Plateforme de déploiement optimisée
- **Docker** - Conteneurisation pour le déploiement

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- npm, yarn, ou pnpm
- Git

### 1. Cloner le Repository
```bash
git clone https://github.com/groupe-genetics/incidents-app.git
cd incidents-app
```

### 2. Installer les Dépendances
```bash
# Avec npm
npm install

# Avec yarn
yarn install

# Avec pnpm
pnpm install
```

### 3. Configurer l'Environnement
```bash
cp .env.example .env.local
```

### 4. Démarrer le Serveur de Développement
```bash
# Avec npm
npm run dev

# Avec yarn
yarn dev

# Avec pnpm
pnpm dev
```

### 5. Ouvrir dans le Navigateur
Visitez [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuration

### Variables d'Environnement

Créez un fichier `.env.local` :

```env
# 🔗 API Backend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_VERSION=v1

# 🔐 Authentification
NEXT_PUBLIC_JWT_SECRET=your-jwt-secret-key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# 🌐 Configuration App
NEXT_PUBLIC_APP_NAME=Gestion d'Incidents
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_COMPANY_NAME=Groupe Genetics

# 📧 Notifications (optionnel)
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true

# 🎨 Thème
NEXT_PUBLIC_DEFAULT_THEME=light
```

### Configuration API

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
}
```

## 🏗️ Structure du Projet

```
app/
├── 📁 (auth)/              # Groupe de routes d'authentification
│   ├── login/             # Page de connexion
│   ├── register/          # Page d'inscription
│   └── forgot-password/   # Réinitialisation mot de passe
├── 📁 dashboard/          # Tableau de bord utilisateur
│   ├── incidents/         # Gestion des incidents
│   ├── profile/           # Profil utilisateur
│   └── settings/          # Paramètres
├── 📁 admin/              # Interface administrateur
│   ├── users/             # Gestion utilisateurs
│   ├── reports/           # Rapports et analytics
│   └── settings/          # Configuration système
├── 📄 page.tsx           # Page d'accueil
├── 📄 layout.tsx         # Layout principal
├── 📄 loading.tsx        # Composant de chargement
├── 📄 error.tsx          # Gestion d'erreurs
├── 📄 not-found.tsx      # Page 404
└── 📄 globals.css        # Styles globaux

components/
├── 📁 ui/                # Composants UI de base (shadcn/ui)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── ...
├── 📁 forms/             # Composants de formulaires
├── 📁 layouts/           # Composants de mise en page
├── 📁 incidents/         # Composants spécifiques aux incidents
└── 📁 common/            # Composants réutilisables

lib/
├── 📄 api.ts            # Configuration API
├── 📄 auth.ts           # Gestion authentification
├── 📄 utils.ts          # Utilitaires généraux
├── 📄 validations.ts    # Schémas de validation
└── 📄 constants.ts      # Constantes de l'application

hooks/
├── 📄 use-auth.ts       # Hook d'authentification
├── 📄 use-api.ts        # Hook pour appels API
├── 📄 use-incidents.ts  # Hook gestion incidents
└── 📄 use-toast.ts      # Hook notifications

types/
├── 📄 auth.ts           # Types d'authentification
├── 📄 incident.ts       # Types d'incidents
├── 📄 user.ts           # Types utilisateur
└── 📄 api.ts            # Types API
```

## 🎨 Interface Utilisateur

### 🏠 Page d'Accueil

L'application démarre avec une page d'accueil moderne qui présente :

```tsx
// app/page.tsx
export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
        Bienvenue sur notre application de gestion d'incidents
      </h1>
      <p className="text-lg md:text-xl text-center max-w-2xl mb-12">
        Gérez vos incidents de manière efficace et intuitive
      </p>
      <Button>Connexion</Button>
    </div>
  )
}
```

### 🎨 Système de Design

- **Palette de couleurs** cohérente avec variables CSS
- **Typographie** responsive et accessible
- **Espacement** systématique avec Tailwind
- **Composants** réutilisables avec shadcn/ui

### 📱 Responsive Design

```css
/* Breakpoints Tailwind */
/* sm: 640px */
/* md: 768px */  
/* lg: 1024px */
/* xl: 1280px */
/* 2xl: 1536px */
```

## 🔌 Intégration API

### Configuration des Appels API

```typescript
// lib/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
})

// Intercepteur pour les tokens
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
```

### Hooks personnalisés

```typescript
// hooks/use-incidents.ts
export function useIncidents() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchIncidents = async () => {
    setLoading(true)
    try {
      const response = await api.get('/incidents/list-incidents')
      setIncidents(response.data)
    } catch (error) {
      console.error('Erreur fetch incidents:', error)
    } finally {
      setLoading(false)
    }
  }

  return { incidents, loading, fetchIncidents }
}
```

## 📦 Scripts Disponibles

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

### Commandes Utiles

```bash
# Développement
npm run dev              # Serveur de développement
npm run build           # Build de production
npm run start           # Serveur de production

# Qualité de code
npm run lint            # Vérifier le linting
npm run type-check      # Vérifier les types TypeScript
npm run format          # Formater le code

# Tests (à ajouter)
npm run test            # Lancer les tests
npm run test:watch      # Tests en mode watch
npm run test:coverage   # Tests avec couverture
```

## 🚀 Déploiement

### 🟢 Vercel (Recommandé)

```bash
# Installation Vercel CLI
npm i -g vercel

# Déploiement
vercel --prod
```

Configuration `vercel.json` :
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url"
  }
}
```

### 🐳 Docker

Le projet fournit un `Dockerfile` multi-stage (sortie Next.js `standalone`) et un `docker-compose.yml`.
Voir [Démarrage rapide](#-démarrage-rapide).

```bash
docker compose up -d --build
```

### ☁️ Autres Plateformes

- **Netlify** : Déploiement automatique depuis Git
- **Railway** : Déploiement avec base de données intégrée
- **DigitalOcean App Platform** : Déploiement scalable

## 🧪 Tests (À implémenter)

### Configuration Jest

```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)
```

### Tests Types

- **Tests unitaires** : Composants individuels
- **Tests d'intégration** : Flux utilisateur complets
- **Tests E2E** : Scénarios utilisateur avec Playwright
- **Tests accessibilité** : Conformité WCAG

## 🔧 Personnalisation

### Thèmes

```css
/* app/globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --secondary: 240 4.8% 95.9%;
}

[data-theme="dark"] {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --secondary: 240 3.7% 15.9%;
}
```

### Configuration Tailwind

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: 'hsl(var(--primary))',
        secondary: 'hsl(var(--secondary))',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
```

## 🤝 Contribution

### Standards de Développement

1. **Code Style** : Prettier + ESLint
2. **Commits** : Convention Conventional Commits
3. **Branches** : GitFlow workflow
4. **Reviews** : Pull Request obligatoire

### Workflow

```bash
# 1. Créer une branche feature
git checkout -b feature/nouvelle-fonctionnalite

# 2. Développer et commiter
git add .
git commit -m "feat: ajout nouvelle fonctionnalité"

# 3. Push et Pull Request
git push origin feature/nouvelle-fonctionnalite
```

### Guidelines

- **Composants** : Un composant par fichier
- **Hooks** : Logique réutilisable dans des hooks personnalisés
- **Types** : TypeScript strict activé
- **Performance** : Lazy loading et optimisations

## 📞 Support & Contact

- **🌐 Site web** : [groupegenetics.com](https://groupegenetics.com)
- **📧 Support** : support@groupegenetics.com
- **📧 Développement** : dev@groupegenetics.com
- **📚 Documentation** : [docs.groupegenetics.com](https://docs.groupegenetics.com)

## 📄 Licence

© 2024 **Groupe Genetics**. Tous droits réservés.

---

## 🚀 Roadmap

### Phase 1 - Core Features
- [x] Page d'accueil et navigation
- [x] Système d'authentification
- [ ] Dashboard utilisateur
- [ ] CRUD incidents complet

### Phase 2 - Advanced Features  
- [ ] Notifications en temps réel
- [ ] Recherche et filtres avancés
- [ ] Export de données
- [ ] Mode hors ligne (PWA)

### Phase 3 - Analytics & Admin
- [ ] Dashboard admin complet
- [ ] Analytics et rapports
- [ ] Gestion des permissions
- [ ] API webhooks

### Phase 4 - Mobile & Integration
- [ ] Application mobile (React Native)
- [ ] Intégrations tierces (Slack, Teams)
- [ ] API publique
- [ ] Marketplace de plugins

---

**Développé avec ❤️ par l'équipe Groupe Genetics** 🧬✨
