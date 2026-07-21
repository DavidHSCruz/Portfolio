import { SectionHeading } from "./section-heading";

const steps = [
  ["Entender", "Objetivo, público e problema antes de escolher a tecnologia."],
  ["Desenhar", "Fluxos e interface alinhados para reduzir retrabalho."],
  ["Construir", "Implementação incremental, responsiva e testável."],
  ["Evoluir", "Validação, entrega e próximos passos claros para o produto."],
];

export function Process() {
  return (
    <section
      data-motion-section
      data-motion-process
      className="border-y border-cloud/8 bg-panel/45 py-24 md:py-32"
    >
      <div className="container-shell">
        <SectionHeading
          eyebrow="Processo"
          title={"Clareza do in\u00edcio ao deploy."}
        />
        <div className="relative mt-14">
          <div
            aria-hidden="true"
            data-process-track
            className="absolute left-[1.15rem] top-0 h-full w-px bg-cloud/10 md:left-0 md:top-[1.15rem] md:h-px md:w-full"
          >
            <span
              data-process-progress
              className="absolute inset-0 block origin-top bg-mint shadow-[0_0_18px_rgb(101_242_183_/_0.45)] md:origin-left"
            />
          </div>
          <ol className="relative grid gap-8 md:grid-cols-4 md:gap-5">
            {steps.map(([title, text], index) => (
              <li
                key={title}
                data-process-step
                className="relative pl-14 md:pl-0 md:pt-14"
              >
                <span
                  aria-hidden="true"
                  data-process-dot
                  className="absolute left-[.7rem] top-1 size-4 rounded-full border-2 border-mint bg-panel shadow-[0_0_0_6px_var(--color-panel)] md:left-0 md:top-[.7rem]"
                />
                <div className="rounded-2xl border border-cloud/8 bg-panel/35 p-6">
                  <span className="font-mono text-sm text-mint">
                    0{index + 1}
                  </span>
                  <h3 className="mt-10 text-xl font-black">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
