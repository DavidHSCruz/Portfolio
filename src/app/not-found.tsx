import Link from "next/link";

export default function NotFound() {
  return <main className="container-shell flex min-h-[75vh] flex-col items-start justify-center py-32"><span className="eyebrow">Erro 404</span><h1 className="display-title mt-5 max-w-3xl text-6xl md:text-8xl">Essa ideia ainda não saiu do papel.</h1><p className="mt-6 max-w-xl text-lg text-muted">A página não existe ou o projeto não está disponível na vitrine.</p><Link href="/" className="mt-10 rounded-full bg-mint px-6 py-3 font-bold text-ink transition hover:bg-mint-bright">Voltar ao início</Link></main>;
}
