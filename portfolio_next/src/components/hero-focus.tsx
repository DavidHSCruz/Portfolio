import Link from "next/link";
import { HiArrowUpRight } from "react-icons/hi2";
import { Avatar } from "./avatar";
import { ExpertiseFocus } from "./expertise-focus";
import { getWhatsAppUrl } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-18">
      <div className="container-shell grid min-h-[calc(100vh-4.5rem)] items-center gap-x-6 gap-y-8 py-10 lg:grid-cols-[minmax(0,.8fr)_minmax(25rem,1.2fr)_minmax(0,.72fr)] lg:py-0">
        <div className="relative z-10 order-1">
          <p className="flex items-center gap-3 font-mono text-[.68rem] uppercase tracking-[.25em] text-mint">
            <span className="size-2 rounded-full bg-mint shadow-[0_0_14px_#65f2b7]" />
            Olá, eu sou
          </p>
          <h1 className="mt-5 font-display text-[clamp(4.8rem,8vw,8.8rem)] leading-[.72] tracking-[-.085em] text-cloud">
            DAVID<span className="text-mint">.</span>
          </h1>
          <p className="mt-8 max-w-md text-xl font-black leading-tight tracking-[-.035em] md:text-2xl">
            Desenvolvedor Full Stack com olhar de design e movimento.
          </p>
          <div className="mt-8 flex flex-wrap gap-7 text-sm">
            <Link href="/projetos" className="group inline-flex items-center gap-2 border-b border-mint/40 pb-2 font-black text-mint hover:border-mint">
              ver projetos
              <HiArrowUpRight className="transition group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
            <a href={getWhatsAppUrl()} target="_blank" rel="noreferrer" className="border-b border-white/15 pb-2 font-bold text-cloud/60 hover:border-cloud hover:text-cloud">
              conversar
            </a>
          </div>
        </div>

        <div className="relative order-2 flex min-h-[31rem] items-center justify-center lg:min-h-[calc(100vh-7rem)]">
          <span aria-hidden="true" className="absolute bottom-[14%] left-1/2 h-8 w-[48%] -translate-x-1/2 rounded-[100%] bg-black/55 blur-xl" />
          <Avatar />
        </div>

        <div className="relative z-10 order-3">
          <ExpertiseFocus />
        </div>
      </div>
    </section>
  );
}
