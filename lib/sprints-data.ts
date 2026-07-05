export interface Task {
  t: string; // title
  o: string; // owner (Sathish or Karthik)
}

export interface Sprint {
  i: number;   // ID (1-12)
  n: string;   // Name
  w: string;   // Week range (W1, W2, etc.)
  m: string;   // Month label
  t: string[]; // Tag list
  tasks: Task[];
  dod: string; // Definition of Done
  dep: string; // Dependencies
}

export interface Phase {
  id: number;
  name: string;
  period: string;
  color: string;
  icon: string;
  cl: string;
  sprints: Sprint[];
}

export const PHASES: Phase[] = [
  {
    id: 1,
    name: 'Foundation & First Scans',
    period: 'M1',
    color: '#1D9E75',
    icon: 'ti-rocket',
    cl: 'rgba(29,158,117,0.08)',
    sprints: [
      {
        i: 1,
        n: 'Shared setup & Data Store',
        w: 'W1',
        m: 'Month 1',
        t: ['Sathish', 'Karthik'],
        tasks: [
          { t: 'Day 1 (Sathish): Install Python 3.12, Docker, Git, create repo structure & .gitignore', o: 'Sathish' },
          { t: 'Day 1 (Karthik): Install Node.js 20 LTS & bootstrap Next.js 15 app in frontend/', o: 'Karthik' },
          { t: 'Day 2 (Sathish): Write docker-compose.yml (Postgres, Redis, MinIO) & .env.example', o: 'Sathish' },
          { t: 'Day 2 (Karthik): Configure Tailwind CSS, Inter font, lucide-react & shadcn/ui base in app', o: 'Karthik' },
          { t: 'Day 3 (Sathish): Set up Python venv, install SQLAlchemy & Alembic, write 5 core models', o: 'Sathish' },
          { t: 'Day 3 (Karthik): Build app layout with persistent Sidebar (left) + TopBar (sticky) shell', o: 'Karthik' },
          { t: 'Day 4 (Sathish): Write database.py connection engine, session & org/user seed script', o: 'Sathish' },
          { t: 'Day 4 (Karthik): Build LoginForm (react-hook-form + zod) & dashboard placeholder cards', o: 'Karthik' },
          { t: 'Day 5 (Sathish): Walk through database schema & document in backend/SCHEMA.md', o: 'Sathish' },
          { t: 'Day 5 (Karthik): Review schema, set up pre-commit (ESLint/Prettier) & add package scripts', o: 'Karthik' },
        ],
        dod: 'All 5 tables in Postgres; App shell renders with active states; Login form validates.',
        dep: 'None — first week setup',
      },
      {
        i: 2,
        n: 'Backend skeleton & Auth wires',
        w: 'W2',
        m: 'Month 1',
        t: ['Sathish', 'Karthik'],
        tasks: [
          { t: 'Day 6 (Sathish): Write FastAPI skeleton, configure CORS, and implement GET /health endpoint', o: 'Sathish' },
          { t: 'Day 6 (Karthik): Install Auth.js v5, create API route, and build typed fetch wrapper', o: 'Karthik' },
          { t: 'Day 7 (Sathish): Implement JWT auth, password hashing, and POST /auth/token + GET /auth/me', o: 'Sathish' },
          { t: 'Day 7 (Karthik): Wire LoginForm to Auth.js signIn, add route protection & remember me', o: 'Karthik' },
          { t: 'Day 8 (Sathish): Create Pydantic schemas, orgs/users endpoints, and RBAC decorator', o: 'Sathish' },
          { t: 'Day 8 (Karthik): Build /dashboard UI with 4 stat Cards, TopBar user menu & navigation', o: 'Karthik' },
          { t: 'Day 9 (Sathish): Set up Celery with Redis broker & write asynchronous scan task stub', o: 'Sathish' },
          { t: 'Day 9 (Karthik): Install TanStack Table & build ScansListPage with NewScanDialog form', o: 'Karthik' },
          { t: 'Day 10 (Sathish): Write POST /scans, GET /scans, and GET /scans/{id}/findings endpoints', o: 'Sathish' },
          { t: 'Day 10 (Karthik): Install TanStack Query, wrap layout, and wire scans list to backend API', o: 'Karthik' },
        ],
        dod: 'FastAPI connected to Postgres/Redis; Auth.js login works; Scan list shows data from API.',
        dep: 'Sprint 1: Database and frontend shell',
      },
      {
        i: 3,
        n: 'First scanners & live scan UI',
        w: 'W3',
        m: 'Month 1',
        t: ['Sathish', 'Karthik'],
        tasks: [
          { t: 'Day 11 (Sathish): Download Nuclei binary, verify execution, and document JSON output mappings', o: 'Sathish' },
          { t: 'Day 11 (Karthik): Build SeverityBadge component with color-coding & Vitest unit tests', o: 'Karthik' },
          { t: 'Day 12 (Sathish): Write BaseAdapter ABC and implement NucleiAdapter with stdout parsing', o: 'Sathish' },
          { t: 'Day 12 (Karthik): Build FindingsTable using shadcn DataTable with severity sort & polling', o: 'Karthik' },
          { t: 'Day 13 (Sathish): Install Trivy, write TrivyAdapter, and extract fixed_version to metadata', o: 'Sathish' },
          { t: 'Day 13 (Karthik): Add Docker image input, zod image validation, and severity filter toggle', o: 'Karthik' },
          { t: 'Day 14 (Sathish): Wire Nuclei + Trivy into Celery group, collect results, and write SSE progress endpoint', o: 'Sathish' },
          { t: 'Day 14 (Karthik): Implement SSE client for progress, show progress bar & step descriptions', o: 'Karthik' },
          { t: 'Day 15 (Sathish): Write Postman collections & integration tests for scan lifecycle & isolation', o: 'Sathish' },
          { t: 'Day 15 (Karthik): Polish ScansList empty state, add skeleton loaders, and handle error toast notification', o: 'Karthik' },
        ],
        dod: 'Parallel scan of Nuclei and Trivy working; UI updates progress live via SSE.',
        dep: 'Sprint 2: Backend API and ScansListPage',
      },
      {
        i: 4,
        n: 'Third scanner & Hardening',
        w: 'W4',
        m: 'Month 1',
        t: ['Sathish', 'Karthik'],
        tasks: [
          { t: 'Day 16 (Sathish): Download Gitleaks, write adapter with shallow clone & cleanups', o: 'Sathish' },
          { t: 'Day 16 (Karthik): Add Git repo URL input to NewScanDialog with regex validation', o: 'Karthik' },
          { t: 'Day 17 (Sathish): Implement secret deduplication & timeout safety logic in Celery scans', o: 'Sathish' },
          { t: 'Day 17 (Karthik): Build FindingDetailPanel using shadcn Sheet with raw collapsible output', o: 'Karthik' },
          { t: 'Day 18 (Sathish): Add rate limiting, input sanitization, exploit validation mode, and audit logs', o: 'Sathish' },
          { t: 'Day 18 (Karthik): Build /settings page (API keys, Org, notifications) and topbar profile widget', o: 'Karthik' },
          { t: 'Day 19 (Sathish): Implement asset management endpoints & automatically register assets on scan', o: 'Sathish' },
          { t: 'Day 19 (Karthik): Build /assets page with weight inline edits and dashboard count sync', o: 'Karthik' },
          { t: 'Day 20 (Sathish): Run multi-tenant security audit with 2 orgs and write pytest isolation fixture', o: 'Sathish' },
          { t: 'Day 20 (Karthik): Execute responsive UI checks & collapse sidebar to drawer on mobile', o: 'Karthik' },
        ],
        dod: 'Gitleaks integrated; asset weights editable; multi-tenant isolation verified.',
        dep: 'Sprint 3: Adaptor architecture and findings list',
      },
    ],
  },
  {
    id: 2,
    name: 'Intelligence & AI Layer',
    period: 'M2',
    color: '#7F77DD',
    icon: 'ti-brain',
    cl: 'rgba(127,119,221,0.08)',
    sprints: [
      {
        i: 5,
        n: 'Threat intel enrichment',
        w: 'W5',
        m: 'Month 2',
        t: ['Sathish', 'Karthik'],
        tasks: [
          { t: 'Day 21 (Sathish): Integrate NVD API client to fetch CVSS scores & cache results in Redis', o: 'Sathish' },
          { t: 'Day 21 (Karthik): Add CVSS column to FindingsTable and show vector strings on hover', o: 'Karthik' },
          { t: 'Day 22 (Sathish): Integrate CISA KEV JSON parser & write Celery Beat daily refresh task', o: 'Sathish' },
          { t: 'Day 22 (Karthik): Add Exploited in Wild badge and KEV filter toggle to FindingsTable', o: 'Karthik' },
          { t: 'Day 23 (Sathish): Integrate EPSS API client with batch processing & add epss columns to findings', o: 'Sathish' },
          { t: 'Day 23 (Karthik): Render EPSS percentile bar and description tooltip in FindingDetailPanel', o: 'Karthik' },
          { t: 'Day 24 (Sathish): Implement priority_score formula & store score + rank using database window function', o: 'Sathish' },
          { t: 'Day 24 (Karthik): Order FindingsTable by priority_score and build Fix Immediately section', o: 'Karthik' },
          { t: 'Day 25 (Sathish): Perform performance test with 100 findings & add api retry logic with backoff', o: 'Sathish' },
          { t: 'Day 25 (Karthik): Build IntelStatusCard on dashboard & add force refresh button', o: 'Karthik' },
        ],
        dod: 'NVD, CISA KEV, and EPSS scores saved in DB; priority formula ranks top 10 items.',
        dep: 'Sprint 4: Asset weight database schema',
      },
      {
        i: 6,
        n: 'Claude AI integration',
        w: 'W6',
        m: 'Month 2',
        t: ['Sathish', 'Karthik'],
        tasks: [
          { t: 'Day 26 (Sathish): Write app/ai/claude_client.py wrapper using Anthropic SDK and Sonnet 3.5', o: 'Sathish' },
          { t: 'Day 26 (Karthik): Build AI summary placeholder UI in FindingDetailPanel with skeleton loader', o: 'Karthik' },
          { t: 'Day 27 (Sathish): Write AI prompt builder & parse JSON responses into Pydantic models', o: 'Sathish' },
          { t: 'Day 27 (Karthik): Render plain English explanation and remediation steps in FindingDetailPanel', o: 'Karthik' },
          { t: 'Day 28 (Sathish): Implement source-call reachability parser & adjust priority scores by impact', o: 'Sathish' },
          { t: 'Day 28 (Karthik): Add ReachabilityBadge component & call-site snippet collapsible view', o: 'Karthik' },
          { t: 'Day 29 (Sathish): Create POST /scans/{id}/ask endpoint using Claude tool-use agent', o: 'Sathish' },
          { t: 'Day 29 (Karthik): Build AskAgent floating chat UI sheet with suggested queries', o: 'Karthik' },
          { t: 'Day 30 (Sathish): Add AI usage & cost tracking database table & monthly aggregation endpoint', o: 'Sathish' },
          { t: 'Day 30 (Karthik): Build /admin/ai-usage page with token usage and cost Recharts', o: 'Karthik' },
        ],
        dod: 'AI summaries generated; reachability code snippet shown; Agentic chat answers query.',
        dep: 'Sprint 5: Threat intelligence data',
      },
      {
        i: 7,
        n: 'Outputs: Jira, Slack & PDF',
        w: 'W7',
        m: 'Month 2',
        t: ['Sathish', 'Karthik'],
        tasks: [
          { t: 'Day 31 (Sathish): Write JiraConfig table, encryption, and Jira ticket creation endpoint', o: 'Sathish' },
          { t: 'Day 31 (Karthik): Build /settings Jira tab configuration form and Create Jira Ticket buttons', o: 'Karthik' },
          { t: 'Day 32 (Sathish): Write SlackConfig table, encryption, and Slack alert posting Celery task', o: 'Sathish' },
          { t: 'Day 32 (Karthik): Build /settings Slack tab configuration and Last Slack alert sent badge', o: 'Karthik' },
          { t: 'Day 33 (Sathish): Implement POST /findings/{id}/create-fix-pr endpoint for Gitleaks and Trivy', o: 'Sathish' },
          { t: 'Day 33 (Karthik): Add Create Fix PR buttons in FindingDetailPanel & GitHub settings integration', o: 'Karthik' },
          { t: 'Day 34 (Sathish): Write Executive Summary Claude call & write PDF report generator using reportlab', o: 'Sathish' },
          { t: 'Day 34 (Karthik): Add Executive Summary card, copy text button, and download PDF button', o: 'Karthik' },
          { t: 'Day 35 (Sathish): Implement Slack threads with button links and perform end-to-end output test', o: 'Sathish' },
          { t: 'Day 35 (Karthik): Build bulk CSV asset owner upload dropzone and polish output states', o: 'Karthik' },
        ],
        dod: 'Slack notifications, Jira tickets, and AI fix PRs open successfully from UI.',
        dep: 'Sprint 6: AI prompt engine and reachability results',
      },
      {
        i: 8,
        n: 'Hardening & CISO view',
        w: 'W8',
        m: 'Month 2',
        t: ['Sathish', 'Karthik'],
        tasks: [
          { t: 'Day 36 (Sathish): Run 5 concurrent scans, identify database query bottlenecks, and add indexes', o: 'Sathish' },
          { t: 'Day 36 (Karthik): Conduct Lighthouse performance/accessibility audits & resolve issues', o: 'Karthik' },
          { t: 'Day 37 (Sathish): Write deep multi-tenant endpoints validator and property-based tests', o: 'Sathish' },
          { t: 'Day 37 (Karthik): Implement beforeunload unsaved changes guards & Next.js error boundaries', o: 'Karthik' },
          { t: 'Day 38 (Sathish): Create finding tag database schema, tagging endpoints, and tags filter index', o: 'Sathish' },
          { t: 'Day 38 (Karthik): Add tag chips in FindingsTable, autocomplete combobox, and tags filter dropdown', o: 'Karthik' },
          { t: 'Day 39 (Sathish): Build GET /executive endpoint returning score delta, top risks, and summary', o: 'Sathish' },
          { t: 'Day 39 (Karthik): Build /executive board-room dashboard with large posture score circle and present mode', o: 'Karthik' },
          { t: 'Day 40 (Sathish): Conduct a full bug bash, document limitations, and script final demo flow', o: 'Sathish' },
          { t: 'Day 40 (Karthik): Address CSS regressions, broken empty states, and record screen captures', o: 'Karthik' },
        ],
        dod: 'CISO dashboard renders in <500ms; multi-tenant security audit passes with 0 leaks.',
        dep: 'Sprint 7: PDF exports and slack/jira configurations',
      },
    ],
  },
  {
    id: 3,
    name: 'Production & Customer',
    period: 'M3',
    color: '#378ADD',
    icon: 'ti-link',
    cl: 'rgba(55,138,221,0.08)',
    sprints: [
      {
        i: 9,
        n: 'CI/CD, Docker & Monitoring',
        w: 'W9',
        m: 'Month 3',
        t: ['Sathish', 'Karthik'],
        tasks: [
          { t: 'Day 41 (Sathish): Write multi-stage Dockerfiles for FastAPI backend and Celery worker', o: 'Sathish' },
          { t: 'Day 41 (Karthik): Write multi-stage Dockerfile for Next.js frontend using standalone mode', o: 'Karthik' },
          { t: 'Day 42 (Sathish): Create docker-compose.prod.yml & add local test environment settings', o: 'Sathish' },
          { t: 'Day 42 (Karthik): Write GitHub Actions CI/CD workflows for linting, testing, and building', o: 'Karthik' },
          { t: 'Day 43 (Sathish): Configure cloud server DNS, firewall, SSH keys, and set up production config', o: 'Sathish' },
          { t: 'Day 43 (Karthik): Setup Docker and run production docker-compose services on Hetzner VPS', o: 'Karthik' },
          { t: 'Day 44 (Sathish): Set up Caddy reverse proxy with SSL certification & execute end-to-end tests', o: 'Sathish' },
          { t: 'Day 44 (Karthik): Configure CSP policies, security headers, and test login on mobile device', o: 'Karthik' },
          { t: 'Day 45 (Sathish): Set up Sentry Python SDK & write DB daily backup cron task', o: 'Sathish' },
          { t: 'Day 45 (Karthik): Integrate Sentry Next.js wizard, configure UptimeRobot, and test error reporting', o: 'Karthik' },
        ],
        dod: 'App deployed to Hetzner with SSL, Caddy, backup crons, and active monitoring.',
        dep: 'Sprint 8: Hardened codebase',
      },
      {
        i: 10,
        n: 'Onboarding & Polish',
        w: 'W10',
        m: 'Month 3',
        t: ['Sathish', 'Karthik'],
        tasks: [
          { t: 'Day 46 (Sathish): Build self-onboarding signup endpoint and email verification code flow', o: 'Sathish' },
          { t: 'Day 46 (Karthik): Build /signup page and /onboarding multi-step asset setup wizard', o: 'Karthik' },
          { t: 'Day 47 (Sathish): Set up pricing tier enforcement scaffolding and checks in middleware', o: 'Sathish' },
          { t: 'Day 47 (Karthik): Build public /pricing tier cards and topbar usage indicator widget', o: 'Karthik' },
          { t: 'Day 48 (Sathish): Create API keys generation endpoints and API authentication middleware', o: 'Sathish' },
          { t: 'Day 48 (Karthik): Build inline /docs getting started guides with syntax highlighted blocks', o: 'Karthik' },
          { t: 'Day 49 (Sathish): Write security posture details document and setup support routing email', o: 'Sathish' },
          { t: 'Day 49 (Karthik): Build /security, /privacy, and /terms server-rendered pages and footer', o: 'Karthik' },
          { t: 'Day 50 (Sathish): Document backend runbook covering restore, rotation, and custom adapters', o: 'Sathish' },
          { t: 'Day 50 (Karthik): Create customer onboarding guide PDF and setup help/FAQ in-app search', o: 'Karthik' },
        ],
        dod: 'Self-onboarding signup works; pricing tiers enforced; API keys and docs page live.',
        dep: 'Sprint 9: Production domain and secure servers',
      },
      {
        i: 11,
        n: 'GitHub App & PR scanning',
        w: 'W11',
        m: 'Month 3',
        t: ['Sathish', 'Karthik'],
        tasks: [
          { t: 'Day 51 (Sathish): Run platform dogfood scans, fix issues, and add daily self auto-scan', o: 'Sathish' },
          { t: 'Day 51 (Karthik): Build /status dashboard using UptimeRobot API and public footer link', o: 'Karthik' },
          { t: 'Day 52 (Sathish): Build outreach contact target list and write templates for prospects', o: 'Sathish' },
          { t: 'Day 52 (Karthik): Build public demo page with video embed & Calendly booking integration', o: 'Karthik' },
          { t: 'Day 53 (Sathish): Register GitHub App, write webhook endpoint, and clone repo at PR head', o: 'Sathish' },
          { t: 'Day 53 (Karthik): Build /settings GitHub tab UI with installation and repo selectors', o: 'Karthik' },
          { t: 'Day 54 (Sathish): Integrate GitHub Checks API to write results and inline line annotations', o: 'Sathish' },
          { t: 'Day 54 (Karthik): Build /scans/pr/{repo}/{pr} review page and demo sample data flag', o: 'Karthik' },
          { t: 'Day 55 (Sathish): Conduct pricing pressure tests & write enterprise custom SLA documents', o: 'Sathish' },
          { t: 'Day 55 (Karthik): Conduct outreach email followups & refine project demo pitch deck', o: 'Karthik' },
        ],
        dod: 'GitHub App intercepts PRs, triggers scans, and posts inline annotations to GitHub.',
        dep: 'Sprint 10: User signup and database APIs',
      },
      {
        i: 12,
        n: 'First customer live',
        w: 'W12',
        m: 'Month 3',
        t: ['Sathish', 'Karthik'],
        tasks: [
          { t: 'Day 56 (Sathish): Host white-glove setup calls, scan customer assets, and resolve issues', o: 'Sathish' },
          { t: 'Day 56 (Karthik): Gather setup feedback, implement immediate UI fixes & add feedback dialog', o: 'Karthik' },
          { t: 'Day 57 (Sathish): Monitor scans, find drop-offs, and implement slack alerts for aged findings', o: 'Sathish' },
          { t: 'Day 57 (Karthik): Build internal analytics page tracking customer KPIs & login activity', o: 'Karthik' },
          { t: 'Day 58 (Sathish): Run Server COGS cost audit, add Claude cache-control, and chaos scan tests', o: 'Sathish' },
          { t: 'Day 58 (Karthik): Write launch marketing blogs and submit launch posts to communities', o: 'Karthik' },
          { t: 'Day 59 (Sathish): Design v1.1 backlog (deferred scanners, recurring scans, and SSO)', o: 'Sathish' },
          { t: 'Day 59 (Karthik): Build public /roadmap page displaying status columns and request form', o: 'Karthik' },
          { t: 'Day 60 (Sathish): Hold retrospective, set month 4 targets, and celebrate product release', o: 'Sathish' },
          { t: 'Day 60 (Karthik): Document retrospective, update team CVs, and draft Month 4 execution plan', o: 'Karthik' },
        ],
        dod: 'First paying customer running on production; public roadmap live; retrospective complete.',
        dep: 'Sprint 11: GitHub App integration and billing configuration',
      },
    ],
  },
];

export const ALL_SPRINTS = PHASES.flatMap((p) => p.sprints.map((s) => ({ ...s, phase: p })));

export const OWNER_COLORS: Record<string, string> = {
  Sathish: '#1D9E75', // Emerald
  Karthik: '#378ADD', // Blue
  // Fallbacks for custom roles
  DevOps: '#5BA3E0',
  BE: '#1D9E75',
  'AI/ML': '#9B93F0',
  FE: '#D85A30',
  Product: '#BA7517',
  CIE: '#E06060',
  BC: '#378ADD',
  QA: '#7BBF44',
  GTM: '#D4A040',
};

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  manager: 'Project Manager',
  lead: 'Team Lead',
  developer: 'Developer',
  designer: 'UI/UX Designer',
  tester: 'QA Engineer',
  devops: 'DevOps Engineer',
  ai: 'AI/ML Engineer',
  product: 'Product Manager',
  user: 'User',
};
