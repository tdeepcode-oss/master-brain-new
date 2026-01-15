# Stage 1 — Teknoloji Seçimi + Repo/Dosya Sistemi + Kod Standartları

## Amaç
Sağlam, ölçeklenebilir ve geliştirici deneyimi (DX) yüksek bir temel atmak.

## 1. MVP Stack + Neden
- **Framework:** **Next.js 14 (App Router)**. (SSR/RSC performansı, Vercel deploy kolaylığı, React ekosistemi).
- **Dil:** **TypeScript** (Strict). (Tip güvenliği, refactoring kolaylığı).
- **Styling:** **Tailwind CSS** + **shadcn/ui**. (Hızlı UI geliştirme, copy-paste component mantığı).
- **Backend/DB:** **Supabase** (Postgres). (Auth, Database, Realtime, Edge Functions tek pakette. Self-host edilebilir).
- **Editor:** **TipTap**. (Headless, özelleştirilebilir, Markdown uyumlu).
- **State:** **React Context** + **SWR/TanStack Query** (Server state) + **Zustand** (Client global state - ör: Audio player).
- **DnD:** **@hello-pangea/dnd** (Kanban için).

## 2. Alternatif Stackler
- **Option B (Fully Self-Host):** Docker + Postgres + Express/NestJS (Backend) + React (Frontend).
    - *Artı:* Tam kontrol, vendor lock-in sıfır.
    - *Eksi:* Ops maliyeti yüksek (Auth, storage, backup yönetimi).
- **Option C (Local-First):** Electron + SQLite (Local DB) + React.
    - *Artı:* Gerçek offline, hız.
    - *Eksi:* Web/Mobile sync (Sync engine yazmak zordur - ör: ElectricSQL).

## 3. Monorepo Yapısı
Repo: `turbo` (Turborepo) ile yönetilen monorepo (Opsiyonel ama önerilen).

```text
/
├── apps/
│   └── web/                 # Ana Next.js uygulaması
│   └── mobile/              # (Future) Expo uygulaması
├── packages/
│   ├── ui/                  # Paylaşılan UI bileşenleri (shadcn)
│   ├── database/            # Prisma schema, client instance
│   ├── config/              # ESLint, TSConfig, Tailwind config
│   └── lib/                 # Paylaşılan utility functions (date format, string ops)
├── .github/                 # CI/CD workflows
├── turbo.json
└── package.json
```

## 4. Coding Standards
- **Lint/Format:** ESLint + Prettier (Auto-fix on save).
- **Commit:** Conventional Commits (`feat: add kanban board`, `fix: sidebar mobile layout`).
- **Branch:** Feature Branch Workflow (`main` <- `feature/xyz`).
- **Imports:** Absolute imports (`@/components/...`).
- **Naming:**
    - Components: PascalCase (`TaskCard.tsx`)
    - Functions/Vars: camelCase (`getUser`)
    - Folders: kebab-case (`components/task-card`)

## 5. Env Yönetimi
- **.env.local:** Local development secrets (Gitignored).
- **.env.example:** Template.
- **Secrets:** Supabase URL, Anon Key, Service Role Key (Sadece Server Actionlarda).

## 6. Test Stratejisi
- **Unit:** `Vitest`. (Helper functions, complex logic - ör: Spaced Repetition algoritması).
- **Integration:** Test yok, manuel QA (MVP hızı için).
- **E2E:** `Playwright` (Kritik flowlar: Sign up, Create Note, Delete Project).
- **Klasör:** `__tests__` klasörleri ilgili kodun yanına.

## 7. Definition of Done (DoD)
- [ ] Kod çalışıyor ve build oluyor.
- [ ] Linter hatası yok.
- [ ] Type hatası yok.
- [ ] Mobil ve Desktop'ta kırılma yok (Responsive).
- [ ] Basic "Happy Path" manuel test edildi.

## VARSAYIMLAR
- Vercel üzerinde host edilecek (Edge function yetenekleri için).
- Supabase'in ücretsiz tier'ı MVP için yeterli.

## DOĞRULAMA YOLU
- `pnpm build` komutu < 2 dk sürmeli.
- Lighthouse Skoru > 90 (Performance, SEO, Best Practices).
