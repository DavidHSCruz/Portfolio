import type { LampPhase } from "./legacy-avatar/lamp-motion-state";

type PendantLampProps = {
  className?: string;
  phase: LampPhase;
  onActivate: () => void;
};

export function PendantLamp({ className, phase, onActivate }: PendantLampProps) {
  const isOn = phase === "activating" || phase === "on";
  const isIlluminated = isOn || phase === "near";

  return (
    <div className={className} data-avatar-pendant-lamp data-lamp-phase={phase}>
      <svg
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-[64%] z-0 h-[185%] w-[185%] -translate-x-1/2 origin-[50%_0%] ${isOn ? "opacity-100" : "opacity-0"}`}
        data-lamp-swing
        data-part="beam"
        focusable="false"
        viewBox="0 0 420 620"
      >
        <path
          d="M150 0H270L414 620H6L150 0Z"
          data-part="beam-shape"
          fill="#ffffff"
          fillOpacity="0.15"
        />
      </svg>

      <div className="pointer-events-none absolute inset-0 z-30 origin-[50%_0%]" data-lamp-swing>
        <svg
          aria-hidden="true"
          className="h-full w-full overflow-visible"
          focusable="false"
          viewBox="0 0 260 330"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="pendant-cable" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#08150f" />
              <stop offset="0.46" stopColor="#6b9a86" />
              <stop offset="1" stopColor="#08150f" />
            </linearGradient>
            <linearGradient id="pendant-shade" x1="0.12" x2="0.88" y1="0.06" y2="0.94">
              <stop offset="0" stopColor="#18382d" />
              <stop offset="0.52" stopColor="#0d241c" />
              <stop offset="1" stopColor="#030a07" />
            </linearGradient>
            <radialGradient id="pendant-bulb" cx="42%" cy="28%" r="78%">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.38" stopColor="#f4fff9" />
              <stop offset="1" stopColor="#b9d8ca" />
            </radialGradient>
            <clipPath id="pendant-bulb-half-clip">
              <rect x="88" y="208" width="84" height="66" />
            </clipPath>
            <filter id="pendant-bulb-glow" x="-180%" y="-80%" width="460%" height="300%">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g>
            <rect
              x="112"
              y="-18"
              width="36"
              height="17"
              rx="8.5"
              fill="#0d211a"
              stroke="#65f2b7"
              strokeOpacity="0.4"
            />
            <path
              d="M130 -42V101"
              data-part="cable-shadow"
              fill="none"
              stroke="#020806"
              strokeLinecap="round"
              strokeOpacity="0.78"
              strokeWidth="10"
            />
            <path
              d="M130 -42V101"
              data-cable-form="braided"
              data-part="cable"
              fill="none"
              stroke="url(#pendant-cable)"
              strokeLinecap="round"
              strokeWidth="6"
            />
            <path
              d="M130 -42V101"
              data-part="cable-thread"
              fill="none"
              stroke="#c5f5df"
              strokeDasharray="2 7"
              strokeLinecap="round"
              strokeOpacity="0.34"
              strokeWidth="1.5"
            />
            <rect
              x="114"
              y="82"
              width="32"
              height="35"
              rx="11"
              data-part="socket"
              fill="#0a1b15"
              stroke="#65f2b7"
              strokeOpacity="0.22"
              strokeWidth="2"
            />

            <path
              d="M108 88H152Q158 88 161 94L209 202Q212 210 202 210H58Q48 210 52 202L99 94Q102 88 108 88Z"
              data-part="shade"
              data-shade-form="trapezoid"
              fill="url(#pendant-shade)"
              stroke="#081711"
              strokeLinejoin="round"
              strokeWidth="3"
            />
            <path
              d="M106 98L61 199"
              fill="none"
              stroke="#8effd2"
              strokeLinecap="round"
              strokeOpacity="0.16"
              strokeWidth="5"
            />
            <path
              d="M55 207H205"
              fill="none"
              stroke="#65f2b7"
              strokeLinecap="round"
              strokeOpacity="0.28"
              strokeWidth="2"
            />

            <g
              data-bulb-form="half-circle"
              data-lamp-bulb
              data-part="bulb"
            >
              <circle
                cx="130"
                cy="208"
                r="35"
                clipPath="url(#pendant-bulb-half-clip)"
                data-lamp-bulb-glow
                fill="#dfffee"
                filter="url(#pendant-bulb-glow)"
                opacity={isOn ? 0.38 : 0.02}
              />
              <path
                d="M110 208H150A20 20 0 0 1 110 208Z"
                data-lamp-bulb-glass
                data-part="bulb-glass"
                fill={isIlluminated ? "url(#pendant-bulb)" : "#18241f"}
                stroke={isIlluminated ? "#65f2b7" : "#31483f"}
                strokeOpacity={isIlluminated ? 0.22 : 0.36}
                strokeWidth="1.5"
              />
              <ellipse
                cx="122"
                cy="215"
                rx="4"
                ry="7"
                fill="#ffffff"
                fillOpacity={isIlluminated ? 0.58 : 0.06}
              />
            </g>
          </g>
        </svg>

        <button
          aria-label={phase === "on" ? "Apagar luminária" : phase === "activating" ? "Acendendo luminária" : "Acender luminária"}
          className="pointer-events-auto absolute left-1/2 top-[65%] size-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-0 bg-transparent p-0 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-mint"
          data-lamp-button
          disabled={phase === "activating"}
          onClick={onActivate}
          type="button"
        />
      </div>
    </div>
  );
}
