"use client";

import { useState } from "react";

const items = [
  ["Frontend", "Interfaces vivas, claras e responsivas."],
  ["Backend", "APIs e integrações que fazem o produto funcionar."],
  ["Mobile", "Experiências pensadas para acompanhar pessoas."],
  ["Design + Motion", "Forma e movimento com intenção."],
] as const;

export function ExpertiseFocus() {
  const [active, setActive] = useState(0);

  return (
    <section aria-label="Áreas de atuação" className="flex flex-col justify-center lg:min-h-[24rem]">
      <p className="mb-5 text-[.65rem] font-black uppercase tracking-[.28em] text-mint">Eu crio</p>
      <div className="border-l border-cloud/10">
        {items.map(([label], index) => (
          <button
            key={label}
            type="button"
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
            onClick={() => setActive(index)}
            aria-pressed={active === index}
            className={`block w-full border-b border-cloud/8 py-3 pl-5 text-left text-xl font-black tracking-[-.04em] transition ${
              active === index ? "translate-x-2 text-mint" : "text-cloud/40 hover:text-cloud"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mt-5 min-h-12 max-w-xs pl-5 text-sm leading-6 text-muted" aria-live="polite">
        {items[active][1]}
      </p>
    </section>
  );
}
