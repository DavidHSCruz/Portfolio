"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HiOutlineMenuAlt4, HiX } from "react-icons/hi";
import { getWhatsAppUrl } from "@/lib/site";

const links = [
  { href: "/", label: "Início" },
  { href: "/projetos", label: "Projetos" },
  { href: "/sobremim", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  return <header className="fixed inset-x-0 top-0 z-50 border-b border-cloud/8 bg-ink/75 backdrop-blur-xl">
    <div className="container-shell flex h-18 items-center justify-between">
      <Link href="/" className="group flex items-center gap-3 font-black tracking-tight" aria-label="David Cruz — início">
        <span className="grid size-9 place-items-center rounded-full border border-mint/35 bg-mint/10 text-mint transition group-hover:bg-mint group-hover:text-ink">DC</span>
        <span>David<span className="text-mint">.</span></span>
      </Link>
      <nav className="hidden items-center gap-8 md:flex" aria-label="Navegação principal">
        {links.map((link) => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined} className={`text-sm font-semibold transition hover:text-mint ${pathname === link.href ? "text-mint" : "text-muted"}`}>{link.label}</Link>)}
      </nav>
      <a href={getWhatsAppUrl()} target="_blank" rel="noreferrer" className="hidden rounded-full bg-mint px-5 py-2.5 text-sm font-extrabold text-ink transition hover:-translate-y-0.5 hover:bg-mint-bright md:inline-flex">Iniciar projeto ↗</a>
      <button className="grid size-11 place-items-center rounded-full border border-cloud/12 md:hidden" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Fechar menu" : "Abrir menu"}>{open ? <HiX size={24} /> : <HiOutlineMenuAlt4 size={24} />}</button>
    </div>
    {open && <div id="mobile-menu" className="border-t border-cloud/8 bg-ink md:hidden">
      <nav className="container-shell flex flex-col gap-1 py-5" aria-label="Navegação mobile">
        {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-lg font-bold hover:bg-cloud/5 hover:text-mint">{link.label}</Link>)}
      </nav>
    </div>}
  </header>;
}
