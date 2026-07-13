export function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return <div className="max-w-3xl"><span className="eyebrow">{eyebrow}</span><h2 className="display-title mt-5 text-4xl sm:text-5xl md:text-7xl">{title}</h2>{body && <p className="mt-6 max-w-2xl text-base leading-7 text-muted md:text-lg">{body}</p>}</div>;
}
