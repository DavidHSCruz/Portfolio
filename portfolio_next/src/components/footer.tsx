import Link from "next/link";
import { site } from "@/lib/site";

export function Footer() {
  return <footer className="border-t border-cloud/8 pb-24 pt-14 md:pb-10">
    <div className="container-shell grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
      <div><p className="display-title max-w-xl text-3xl md:text-5xl">Uma boa ideia merece uma execução <span className="text-mint">à altura.</span></p><p className="mt-5 text-sm text-muted">© {new Date().getFullYear()} David Cruz. Feito com Next.js.</p></div>
      <nav className="flex flex-wrap gap-5 text-sm font-bold text-muted" aria-label="Redes sociais"><a href={site.linkedin} target="_blank" rel="noreferrer" className="hover:text-mint">LinkedIn ↗</a><a href={site.github} target="_blank" rel="noreferrer" className="hover:text-mint">GitHub ↗</a><Link href="/contato" className="hover:text-mint">Contato</Link></nav>
    </div>
  </footer>;
}
