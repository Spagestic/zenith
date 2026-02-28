# 🌍 Zenith

**Learn the news, don't just read it.**

Zenith is an AI-powered news & knowledge platform that transforms daily news into structured, personalized learning — with interactive knowledge graphs, AI-generated video & audio briefings, adaptive difficulty, and comprehension tracking.

**Safe by default.** Unauthenticated users see a kids-safe, zero-tracking experience. Adults opt in to full coverage by verifying their age at login.

> 🏆 Built at [HackTheEast 2026](https://hacktheeast.com)

---

## ✨ Features

### 🛡️ Privacy-First, Safe by Default

- **No login required** — browse kids-safe news with zero data collection
- **Age-gated content** — only verified 18+ users unlock full/sensitive coverage
- **No ads, no tracking, no algorithmic manipulation**
- Transparent content filtering — open source, inspectable by parents & educators

### 📰 AI-Curated News Feed

- Aggregates HK local & global news from multiple sources (RSS, NewsAPI)
- Every article exists in **two versions**: kids-safe and full adult
- Cron-powered ingestion pipeline processes articles with AI summarization, categorization, and safety rating

### 🎬 Multimodal Consumption (Powered by MiniMax)

- **Read** — AI-curated summaries at your level
- **Watch** — Auto-generated video news briefings
- **Listen** — Text-to-speech audio briefings on the go
- **🎵 Background music** — AI-generated tracks for briefings

### 🧠 Knowledge Graphs & Timelines

- Obsidian-style interactive knowledge graph showing how topics connect
- Click any node to explore related articles and sub-topics
- Timeline view showing how a story evolved over time

### 📝 EdTech & Adaptive Learning

- **Adaptive difficulty** — Same article at Simple / Standard / Expert levels
- **Comprehension quizzes** — Auto-generated MCQs after reading
- **Learning dashboard** — Topics mastered, streak tracking, knowledge areas
- **"Did You Know?"** fun facts on every kids article
- **"Why Should HK Care?"** localization on every global story

### 🇭🇰 Hong Kong Focus

- Dedicated HK Local category
- Every global story gets a "Why HK Should Care" paragraph
- Sources include RTHK, SCMP, and international outlets

---

## 🏗️ Tech Stack

| Layer               | Technology                                                                     |
| ------------------- | ------------------------------------------------------------------------------ |
| **Framework**       | [Next.js 14](https://nextjs.org/) (App Router)                                 |
| **Language**        | TypeScript                                                                     |
| **Styling**         | [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Backend / DB**    | [Convex](https://convex.dev/)                                                  |
| **Auth**            | [Convex Auth](https://labs.convex.dev/auth)                                    |
| **AI / LLM**        | [MiniMax API](https://platform.minimax.io/) (LLM, TTS, Video, Music)           |
| **News Sources**    | NewsAPI, RSS feeds (Reuters, BBC, RTHK, SCMP)                                  |
| **Package Manager** | [Bun](https://bun.sh/)                                                         |
| **Deployment**      | [Vercel](https://vercel.com/)                                                  |

---

## 📁 Project Structure

```

zenith/
├── app/
│ ├── page.tsx # Root page (kids-safe default)
│ ├── article/[id]/page.tsx # Article detail page
│ ├── graph/page.tsx # Full knowledge graph explorer
│ ├── topic/[id]/page.tsx # Topic detail + timeline
│ └── dashboard/page.tsx # Learning progress (auth required)
├── components/
│ ├── landing/
│ │ ├── SafeModeBanner.tsx # Kids safe mode notification
│ │ ├── HeroBriefing.tsx # Daily video/audio briefing hero
│ │ ├── CategoryFilters.tsx # Category filter chips
│ │ ├── NewsCard.tsx # Individual article card
│ │ ├── NewsFeed.tsx # Article grid with load more
│ │ ├── KnowledgeGraphTeaser.tsx# Mini graph preview
│ │ ├── HowItWorks.tsx # Feature showcase grid
│ │ ├── TransparencyPanel.tsx # Parents & educators section
│ │ └── Footer.tsx # Site footer
│ └── ui/ # shadcn/ui components
├── convex/
│ ├── schema.ts # Database schema
│ ├── articles.ts # Article queries & mutations
│ ├── topics.ts # Topic/graph queries
│ ├── users.ts # User management
│ ├── quizzes.ts # Quiz generation & scoring
│ └── crons.ts # Scheduled news ingestion
└── lib/
└── minimax.ts # MiniMax API integration

```

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- [Convex account](https://convex.dev/)
- [MiniMax API key](https://platform.minimax.io/)

### Setup

```bash
# Clone the repo
git clone https://github.com/your-team/zenith.git
cd zenith

# Install dependencies
bun install

# Set up Convex
bunx convex dev

# Start the dev server
bun run dev
```

### Environment Variables

Create a `.env.local` file:

```env
# Convex
CONVEX_DEPLOYMENT=your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# MiniMax
MINIMAX_API_KEY=your-minimax-api-key
MINIMAX_GROUP_ID=your-group-id

# News
NEWS_API_KEY=your-newsapi-key
```

---

## 🧩 How It Works

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  News Sources│────▶│  Convex Cron │────▶│  MiniMax LLM │
│  (RSS, API)  │     │  (every 30m) │     │  (summarize) │
└─────────────┘     └──────────────┘     └──────┬───────┘
                                                 │
                                                 ▼
                                        ┌────────────────┐
                                        │   Convex DB    │
                                        │                │
                                        │  · kids_summary│
                                        │  · full_summary│
                                        │  · safety_rating│
                                        │  · entities    │
                                        │  · embeddings  │
                                        └───────┬────────┘
                                                │
                    ┌───────────────────────────┼───────────────────────┐
                    │                           │                       │
                    ▼                           ▼                       ▼
            ┌──────────────┐          ┌──────────────┐        ┌──────────────┐
            │  Kids Feed   │          │  Adult Feed  │        │  Knowledge   │
            │  (default)   │          │  (18+ login) │        │  Graph       │
            │              │          │              │        │              │
            │  · Safe only │          │  · All news  │        │  · Topics    │
            │  · No tracking│         │  · Bias lens │        │  · Timelines │
            │  · Fun facts │          │  · Analytics │        │  · Quizzes   │
            └──────────────┘          └──────────────┘        └──────────────┘
```

---

## 🏆 Hackathon Track Alignment

| Track                               | How Zenith Qualifies                                                     |
| ----------------------------------- | ------------------------------------------------------------------------ |
| **Main Award**                      | Novel AI platform with strong demo, real-world impact                    |
| **ExpressVPN Digital Guardian**     | Privacy-first, kids-safe by default, zero tracking, open source          |
| **OAX Foundation AI EdTech**        | Intelligent curation, adaptive learning paths, content overload solution |
| **MiniMax Creative Usage**          | Multi-tool usage: LLM + TTS + Video + Music generation                   |
| **RevisionDojo Future of Learning** | Adaptive difficulty, quizzes, knowledge tracking, learning dashboards    |

---

## 👥 Team

Built with ❤️ at HackTheEast 2026.

---

## 📄 License

MIT

```

```
