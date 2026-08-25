"use client";

import { useRef, type MouseEvent as ReactMouseEvent } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { HiArrowUpRight, HiLockClosed } from "react-icons/hi2";
import { useProjectTransition } from "./project-transition";
import type { Project } from "@/types/project";

gsap.registerPlugin(useGSAP);

export function ProjectCard({
  project,
  priority = false,
}: {
  project: Project;
  priority?: boolean;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const transition = useProjectTransition();
  const href = `/projetos/${project.slug}`;

  useGSAP(
    (_, contextSafe) => {
      const card = cardRef.current;
      const image = imageRef.current;
      const line = lineRef.current;
      if (!card || !image || !line || !contextSafe) return;
      if (typeof window.matchMedia !== "function") return;

      const media = gsap.matchMedia();

      media.add(
        {
          canHover: "(hover: hover) and (pointer: fine)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const conditions = context.conditions as {
            canHover: boolean;
            reduceMotion: boolean;
          };
          if (!conditions.canHover || conditions.reduceMotion) return;

          gsap.set(card, {
            transformPerspective: 900,
            transformStyle: "preserve-3d",
          });
          gsap.set(line, { scaleX: 0, transformOrigin: "left center" });

          const rotateX = gsap.quickTo(card, "rotationX", {
            duration: 0.38,
            ease: "power3.out",
          });
          const rotateY = gsap.quickTo(card, "rotationY", {
            duration: 0.38,
            ease: "power3.out",
          });
          const imageX = gsap.quickTo(image, "xPercent", {
            duration: 0.55,
            ease: "power3.out",
          });
          const imageY = gsap.quickTo(image, "yPercent", {
            duration: 0.55,
            ease: "power3.out",
          });

          const onPointerMove = contextSafe((event: PointerEvent) => {
            const rect = card.getBoundingClientRect();
            const x = (event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5;
            const y = (event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5;

            rotateX(y * -2.4);
            rotateY(x * 2.4);
            imageX(x * -1.8);
            imageY(y * -1.4);
          });

          const onPointerEnter = contextSafe(() => {
            gsap.to(image, {
              scale: 1.045,
              duration: 0.7,
              ease: "power3.out",
              overwrite: "auto",
            });
            gsap.to(line, {
              scaleX: 1,
              duration: 0.52,
              ease: "power3.out",
              overwrite: true,
            });
          });

          const onPointerLeave = contextSafe(() => {
            rotateX(0);
            rotateY(0);
            imageX(0);
            imageY(0);
            gsap.to(image, {
              scale: 1,
              duration: 0.65,
              ease: "power3.out",
              overwrite: "auto",
            });
            gsap.to(line, {
              scaleX: 0,
              duration: 0.34,
              ease: "power2.out",
              overwrite: true,
            });
          });

          card.addEventListener("pointermove", onPointerMove);
          card.addEventListener("pointerenter", onPointerEnter);
          card.addEventListener("pointerleave", onPointerLeave);

          return () => {
            card.removeEventListener("pointermove", onPointerMove);
            card.removeEventListener("pointerenter", onPointerEnter);
            card.removeEventListener("pointerleave", onPointerLeave);
          };
        },
      );

      return () => media.revert();
    },
    { scope: cardRef },
  );

  const handleNavigation = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (
      !transition ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const source = cardRef.current;
    const image = imageRef.current;
    if (!source || !image) return;

    event.preventDefault();
    const rect = image.getBoundingClientRect();
    transition.startProjectTransition({
      href,
      image: project.image,
      source,
      sourceRect: {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      },
    });
  };

  return (
    <Link
      ref={cardRef}
      href={href}
      onClick={handleNavigation}
      aria-label={`Ver detalhes de ${project.name}`}
      data-motion-item
      data-project-card
      className={`group relative flex min-h-[430px] overflow-hidden rounded-3xl border border-cloud/10 bg-panel [transform-style:preserve-3d] ${priority ? "md:col-span-2 md:min-h-[520px]" : ""}`}
    >
      <div
        ref={imageRef}
        role="img"
        aria-label={`Capa do projeto ${project.name}`}
        data-project-image
        className="absolute -inset-[2%] bg-cover bg-center will-change-transform"
        style={
          project.image
            ? {
                backgroundImage: `linear-gradient(to top, #080d0f 3%, transparent 75%), url("${encodeURI(project.image)}")`,
              }
            : {
                background:
                  "radial-gradient(circle at 70% 20%, #274c40, #0d1518 60%)",
              }
        }
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" />
      <span
        ref={lineRef}
        aria-hidden="true"
        data-project-motion-line
        className="absolute inset-x-0 bottom-0 h-1 origin-left bg-mint shadow-[0_0_22px_var(--color-mint)]"
      />
      <div className="relative mt-auto w-full p-6 md:p-8 [transform:translateZ(18px)]">
        <div className="mb-4 flex flex-wrap gap-2">
          {project.private && (
            <span className="inline-flex items-center gap-1 rounded-full border border-cloud/15 bg-ink/70 px-3 py-1 text-xs font-bold text-muted">
              <HiLockClosed /> Privado
            </span>
          )}
          {project.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-mint px-3 py-1 text-xs font-black text-ink"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black tracking-tight md:text-4xl">
              {project.name}
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted md:text-base">
              {project.description}
            </p>
          </div>
          <span className="grid size-12 shrink-0 place-items-center rounded-full border border-cloud/15 transition group-hover:rotate-45 group-hover:bg-mint group-hover:text-ink">
            <HiArrowUpRight size={22} />
          </span>
        </div>
      </div>
    </Link>
  );
}
