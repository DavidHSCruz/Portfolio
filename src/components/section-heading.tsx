export function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="max-w-3xl">
      <span data-motion-eyebrow className="eyebrow">
        {eyebrow}
      </span>
      <div className="overflow-hidden pb-2">
        <h2
          data-motion-title
          className="display-title mt-5 text-4xl sm:text-5xl md:text-7xl"
        >
          {title}
        </h2>
      </div>
      {body && (
        <p
          data-motion-body
          className="mt-6 max-w-2xl text-base leading-7 text-muted md:text-lg"
        >
          {body}
        </p>
      )}
    </div>
  );
}
