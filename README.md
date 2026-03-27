# Taxwise Solutions

**Certified Public Accountants | Mombasa & Kwale, Kenya**

Professional website for Taxwise Solutions — a Kenyan accounting and tax consultancy firm providing bookkeeping, audit, tax compliance, financial advisory, and statutory compliance services.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend / Data**: Supabase (PostgreSQL, RLS)
- **Routing**: React Router v6
- **State / Fetching**: TanStack Query
- **Animations**: Framer Motion

---

## Pages

| Route | Description |
|---|---|
| `/` | Homepage — hero, stats, services overview, CTA |
| `/about` | About the firm, office locations |
| `/services` | Full services listing |
| `/compliance-check` | Interactive compliance health-check tool |
| `/training` | Training topics and formats |
| `/documents` | Document management guide |
| `/job-tracker` | Internal job tracking (PIN-protected) |
| `/contact` | Contact form |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The dev server runs on `http://localhost:8080`.

---

## Environment Variables

The Supabase connection is configured in `src/integrations/supabase/client.ts`. No additional environment variables are required to run the project — the Supabase anon key is public by design.

---

## Database

The Supabase schema and seed data live in `supabase/migrations/`. Tables include:

- `site_settings` — company info, hero text, CTAs
- `stats` — homepage statistics
- `offices` — office locations and contact details
- `services` — services listing
- `compliance_sections` / `compliance_questions` — compliance check tool
- `training_topics` / `training_formats` — training page content
- `document_steps` / `document_folders` — documents page
- `job_types` / `jobs` — internal job tracker
- `contact_submissions` — contact form submissions

---

## Deployment

Deployed on [Render](https://render.com) as a static site. Auto-deploys on every push to `main`.

**Live URL**: https://taxwise-solutions.onrender.com
