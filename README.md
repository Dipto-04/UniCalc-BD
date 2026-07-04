# UniCalc-BD
🎓 UniCalc BD — SGPA, CGPA &amp; tuition waiver calculator for Bangladesh private university students. BUBT policy fully modeled. Built with HTML, Tailwind &amp; Chart.js.
# UniCalc BD — Demo Build

## What this is
A fully working, static website (no build step, no server, no database required).
Unzip it and open `index.html` in any browser, or deploy the folder as-is to any
static host (Vercel, Netlify, GitHub Pages, etc.) — internet connection is needed
because fonts/Chart.js load from a CDN.

## What's included and working
- Home page with a live mini SGPA calculator, animated stats, feature grid
- SGPA Calculator (unlimited subjects, live gauge, grade-distribution chart, print/export)
- CGPA Calculator (unlimited semesters, cumulative trend chart, save to dashboard)
- Target GPA Calculator
- Waiver Calculator (BUBT's real entry/continuing waiver brackets, generic logic for others)
- Grade Converter (marks → letter grade → point, full scale table)
- Credit Calculator
- Universities directory + detail pages for 15 Bangladesh private universities
- Dashboard (calculations saved to browser local storage)
- Blog listing, FAQ, About, Contact, Privacy, Terms, 404
- Dark/light mode, responsive layout, SEO meta tags, JSON-LD schema

## Important honesty note
This was generated as a **static front-end demo**, not the full production stack
requested (Next.js + Prisma + PostgreSQL + Clerk/Firebase auth + admin CMS + PWA +
real blog backend). That full stack is a genuine multi-week engineering project —
it can't be produced as working code in a single pass, and a scaffold without a
real database/auth setup wouldn't actually run.

**BUBT's grading scale, SGPA/CGPA formulas, and waiver brackets are modeled exactly
per your brief.** Every other university's numbers (grading scale variants, waiver
percentages, minimum CGPA) are placeholder/representative data for demo purposes —
marked "Demo Data" in the Universities directory — and should be replaced with each
institution's official published policy before real-world use.

## If you want to go further
Good next steps, roughly in order of effort:
1. Replace placeholder university data with verified official policies.
2. Add a real backend (e.g. Next.js + Prisma + PostgreSQL) so calculations and
   dashboards persist per logged-in user instead of local storage.
3. Add authentication (Clerk/NextAuth) and an admin panel for managing universities,
   grading scales, and waiver rules without touching code.
4. Wire up a real blog/CMS and PWA install support.

Happy to build any one of these next as a focused, real (not scaffolded) piece —
that tends to produce much better results than generating the entire stack at once.
