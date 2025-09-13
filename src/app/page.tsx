// New landing homepage derived and simplified. Focus on what the app does.
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { NavbarServerConfig } from "../components/NavbarServerConfig";
import NavbarTip from "@/components/NavbarTip";

export const metadata: Metadata = {
  title: "Optix Toolkit | Team Optix 3749",
  description:
    "Outreach tracking, scouting, and team operations for FRC Team Optix 3749."
};

export default function Home() {
  const features = [
    {
      title: "Track Outreach Hours",
      body: "Log events, record minutes, and see totals update right away."
    },
    {
      title: "Run Scouting",
      body: "Collect match and pit data fast on phones. Share findings quickly."
    },
    {
      title: "See Progress",
      body: "Simple charts show outreach impact and robot performance trends."
    },
    {
      title: "Manage Sessions",
      body: "Approve, adjust, and audit participation with clear histories."
    },
    {
      title: "Built for Speed",
      body: "Fast UI, instant feedback, dark mode first, mobile friendly."
    },
    {
      title: "Role Aware",
      body: "Admins manage settings. Members focus on tasks. Guests see basics."
    }
  ];

  const valuePoints = [
    {
      h: "Faster Decisions",
      p: "Scouting data turns into insights you can act on between matches."
    },
    {
      h: "Less Spreadsheet Chaos",
      p: "Central place for outreach + scouting. No more scattered tabs."
    },
    {
      h: "Student Owned",
      p: "Built by the team. Easy to extend for new seasons."
    }
  ];

  return (
    <main className="space-y-32 pb-40">
      <NavbarServerConfig setDefaultShown={false} />
      <NavbarTip />

      <section className="pt-32 container mx-auto px-6 max-w-5xl flex flex-col items-center text-center gap-8">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-br from-primary to-chart-2 bg-clip-text text-transparent">
          Optix Toolkit
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
          Outreach + Scouting platform for FRC Team Optix 3749. Simple, fast,
          and built for real event use.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button asChild variant="outline" size="lg" className="font-medium">
            <Link href="/outreach">Open Outreach</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="font-medium">
            <Link href="/scouting">Open Scouting</Link>
          </Button>
        </div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground flex gap-3">
          <span>Next.js</span>
          <span>PocketBase</span>
          <span>TypeScript</span>
          <span>Tailwind</span>
        </div>
      </section>

      <section className="container mx-auto px-6 max-w-6xl">
        <div className="grid gap-8 md:grid-cols-2 items-start">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold">Team Optix 3749</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Earum
              iusto reiciendis ea odio eos, error quaerat. Libero consequuntur,
              cupiditate reprehenderit nam non quia, eius atque qui, consectetur
              officia voluptatum repudiandae?
            </p>
          </div>
        </div>
      </section>

      {/* WHAT IT DOES */}
      <section className="container mx-auto px-6 max-w-6xl">
        <header className="mb-10 max-w-3xl">
          <h2 className="text-3xl font-semibold mb-3">What It Does</h2>
          <p className="text-muted-foreground">
            Focused tools for robotics team operations. No bloat. Everything is
            one click or swipe away.
          </p>
        </header>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-xl border border-border bg-card/70 backdrop-blur-sm p-5 flex flex-col gap-3 hover:border-primary/60 transition">
              <h3 className="font-medium text-base flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                {f.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* VALUE */}
      <section className="container mx-auto px-6 max-w-6xl">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-sm p-10 flex flex-col gap-10">
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-3xl font-semibold">Why It Matters</h2>
            <p className="text-muted-foreground text-base">
              Better insight → better choices → better performance. The toolkit
              keeps your data clean and usable while events move fast.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {valuePoints.map((v) => (
              <div key={v.h} className="space-y-2">
                <h3 className="text-sm font-semibold tracking-wide text-primary uppercase">
                  {v.h}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {v.p}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FLOW SUMMARY */}
      <section className="container mx-auto px-6 max-w-6xl">
        <div className="grid gap-10 md:grid-cols-2 items-start">
          <div className="space-y-5">
            <h2 className="text-3xl font-semibold">How It Flows</h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <span className="text-foreground font-medium">1.</span> Members
                log outreach sessions or scouting results.
              </li>
              <li>
                <span className="text-foreground font-medium">2.</span> Data
                syncs instantly via PocketBase.
              </li>
              <li>
                <span className="text-foreground font-medium">3.</span> Admins
                approve, adjust, and monitor.
              </li>
              <li>
                <span className="text-foreground font-medium">4.</span> Charts
                highlight trends and gaps.
              </li>
              <li>
                <span className="text-foreground font-medium">5.</span> Strategy
                improves match by match.
              </li>
            </ul>
            <p className="text-sm text-muted-foreground max-w-md">
              Auth, storage, and role logic stay behind the scenes so users stay
              focused.
            </p>
          </div>
          <div className="relative rounded-xl border border-border bg-card/50 backdrop-blur p-6 text-sm leading-relaxed space-y-4">
            <p>
              <strong className="text-foreground">Outreach:</strong> Create
              events, sign in, log minutes, review history.
            </p>
            <p>
              <strong className="text-foreground">Scouting:</strong> Record
              match & pit data in consistent forms. Use results fast.
            </p>
            <p>
              <strong className="text-foreground">Roles:</strong> Admin, member,
              guest. Access adapts automatically.
            </p>
            <p>
              <strong className="text-foreground">Experience:</strong> Dark,
              fast, keyboard friendly, mobile ready.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 max-w-6xl">
        <div className="rounded-xl border border-border p-8 flex flex-col gap-6 bg-card/60 backdrop-blur">
          <h2 className="text-3xl font-semibold">Open to Teams</h2>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Anyone can fork this project and adapt it to your own team.
          </p>
          <div>
            <Button asChild size="sm" variant="secondary">
              <Link
                href="https://github.com/your-username/optix-toolkit"
                target="_blank"
                rel="noreferrer">
                View Repository
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="container mx-auto px-6 max-w-6xl pt-14 border-t border-border text-xs text-muted-foreground flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>© {new Date().getFullYear()} Team Optix 3749 • MIT License</div>
        <nav className="flex flex-wrap gap-4">
          <Link href="#" className="hover:text-foreground transition">
            Features
          </Link>
          <Link href="#" className="hover:text-foreground transition">
            Value
          </Link>
          <Link href="#" className="hover:text-foreground transition">
            Flow
          </Link>
          <Link href="#" className="hover:text-foreground transition">
            Contribute
          </Link>
          <Link href="#" className="hover:text-foreground transition">
            About
          </Link>
        </nav>
      </footer>
    </main>
  );
}
