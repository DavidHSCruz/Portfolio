import { SectionHeading } from "./section-heading";

const steps = [
  ["Entender", "Objetivo, público e problema antes de escolher a tecnologia."],
  ["Desenhar", "Fluxos e interface alinhados para reduzir retrabalho."],
  ["Construir", "Implementação incremental, responsiva e testável."],
  ["Evoluir", "Validação, entrega e próximos passos claros para o produto."],
];

export function Process() {
  return <section className="border-y border-white/8 bg-panel/45 py-24 md:py-32"><div className="container-shell"><SectionHeading eyebrow="Processo" title="Clareza do início ao deploy." /><ol className="mt-14 grid gap-5 md:grid-cols-4">{steps.map(([title, text], index) => <li key={title} className="rounded-2xl border border-white/8 p-6"><span className="font-mono text-sm text-mint">0{index + 1}</span><h3 className="mt-12 text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-muted">{text}</p></li>)}</ol></div></section>;
}
