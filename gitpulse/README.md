<div align="center">

<img src="public/favicon.svg" width="80" height="80" alt="GitPulse Logo" />

# GitPulse

### GitHub Profile Analytics Dashboard

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-gitpulse--app.vercel.app-7c3aed?style=for-the-badge)](https://gitpulse-app.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

*Instantly explore any GitHub profile — repos, stats, contributions & more.*

[**→ Try Live Demo**](https://gitpulse-app.vercel.app)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **Smart Search** | Real-time GitHub username search with autocomplete suggestions |
| 📊 **Profile Analytics** | Followers, following, public repos, stars — all at a glance |
| 📁 **Repository Explorer** | Browse repos with language filters, sorting & search |
| 📈 **Contribution Charts** | Visual language breakdown & commit activity charts |
| 🔥 **Activity Heatmap** | GitHub-style contribution heatmap |
| ⚖️ **Profile Comparison** | Compare two GitHub users side-by-side |
| 🔖 **Bookmarks** | Save & revisit your favourite profiles (localStorage) |
| 🌗 **Dark / Light Mode** | Toggle theme — persisted across sessions |
| 📱 **PWA Support** | Install as an app on mobile & desktop |
| ⚡ **Response Caching** | Instant reload with GitHub API response caching |
| 🔗 **Shareable URLs** | Every profile has its own shareable link — `/user/:username` |

---

## 🛠️ Tech Stack

```
Frontend        →  React 19 + TypeScript 5.9
Build Tool      →  Vite 8
Styling         →  Tailwind CSS 3
Charts          →  Chart.js + react-chartjs-2
Icons           →  Lucide React
Routing         →  React Router DOM v7
Data            →  GitHub REST API v3
State           →  React Context API
Storage         →  localStorage (bookmarks + cache)
PWA             →  Custom Service Worker + Web Manifest
Deployment      →  Vercel (Global CDN)
```

---

## 📸 Screenshots

| Dashboard | User Profile |
|-----------|-------------|
| Search any GitHub username | Full profile with repos & charts |

> 🔗 **[View live at gitpulse-app.vercel.app](https://gitpulse-app.vercel.app)**

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/nikit78/gitpulse.git
cd gitpulse

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Add your GitHub Personal Access Token in .env
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_GITHUB_TOKEN=your_github_personal_access_token_here
```

> **Get a GitHub token:** [github.com/settings/tokens](https://github.com/settings/tokens)  
> Select scopes: `public_repo`, `read:user`  
> Token is **optional** — app works without it (60 req/hr limit applies)

### Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🎉

### Build for Production

```bash
npm run build
```

---

## 📁 Project Structure

```
gitpulse/
├── public/
│   ├── favicon.svg          # App icon
│   ├── manifest.json        # PWA manifest
│   └── sw.js                # Service Worker
├── src/
│   ├── components/
│   │   ├── Header.tsx        # Nav with search, bookmarks, theme
│   │   ├── SearchBar.tsx     # Autocomplete search component
│   │   ├── UserProfile.tsx   # Profile card & stats
│   │   ├── RepoCard.tsx      # Individual repo card
│   │   ├── RepoGrid.tsx      # Filterable repo grid
│   │   ├── Charts.tsx        # Language & activity charts
│   │   ├── ActivityHeatmap.tsx # Contribution heatmap
│   │   └── SkeletonLoaders.tsx # Loading states
│   ├── pages/
│   │   ├── Dashboard.tsx     # Home / search page
│   │   ├── UserPage.tsx      # Full user profile page
│   │   └── ComparePage.tsx   # Side-by-side comparison
│   ├── context/
│   │   ├── ThemeContext.tsx  # Dark/light mode
│   │   └── BookmarksContext.tsx # Saved profiles
│   ├── services/
│   │   └── githubApi.ts     # GitHub API calls + caching
│   ├── hooks/               # Custom React hooks
│   └── types/               # TypeScript type definitions
├── .env.example             # Template for env variables
├── vercel.json              # Vercel SPA routing config
└── vite.config.ts           # Vite configuration
```

---

## 🌐 Deployment

Deployed on **Vercel** with global CDN — automatically handles:
- HTTPS
- SPA routing (`vercel.json` rewrites)
- Performance optimization

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/nikit78/gitpulse)

---

## 📄 License

MIT License — feel free to use, fork & build on top of this.

---

<div align="center">

Made with ❤️ by **Nikit**

[⭐ Star this repo](https://github.com/nikit78/gitpulse) · [🐛 Report Bug](https://github.com/nikit78/gitpulse/issues) · [🚀 Live Demo](https://gitpulse-app.vercel.app)

</div>
