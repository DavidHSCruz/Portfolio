import gsap from "gsap"
import { useRef, useState } from "react"
import { useGSAP } from "@gsap/react"
import styles from "./Avatar.stage.module.css"
import { setupAvatarMotion } from "./avatar-controller"
import { AVATAR_LIGHT_RENDERING } from "./motion-state"

gsap.registerPlugin(useGSAP)

export const Avatar = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const avatarRef = useRef<SVGSVGElement>(null)
    const boxAvatarRef = useRef<HTMLDivElement>(null)
    const lookAtRef = useRef<HTMLDivElement>(null)
    const [earLeftTop, setEarLeftTop] = useState<boolean | null>(null)

    useGSAP((_, contextSafe) => {
        if (!contextSafe) return

        return setupAvatarMotion({
            containerRef,
            avatarRef,
            boxAvatarRef,
            lookAtRef,
            setEarLeftTop,
            contextSafe,
        })
    }, {
        scope: containerRef,
    })

    const earFront = (isFront: boolean) => (
        <>
            <g className='earLeftPosition'>
                <g className='earLeft' id="earLeft" style={{filter: !earLeftTop || earLeftTop === null ? 'brightness(.95) contrast(1.2)' : '', opacity: isFront ? getEarTop('left') ? 1 : 0 : !getEarTop('left') ? 1 : 0}}>
                    <mask id="mask0_2_99" style={{maskType: 'alpha'}} maskUnits="userSpaceOnUse" x="26" y="136" width="24"
                        height="61">
                        <rect id="cut" x="26" y="136.695" width="24" height="60" fill="#000" />
                    </mask>
                    <g mask="url(#mask0_2_99)">
                        <rect id="earLeft_2" x="26" y="136.695" width="40" height="60" rx="15" fill="url(#paint_skin)" />
                        <path id="detail1"
                            d="M30 150.695C30 145.172 34.4772 140.695 40 140.695H41C45.9706 140.695 50 144.724 50 149.695V184.695C50 189.113 46.4183 192.695 42 192.695H34C31.7909 192.695 30 190.904 30 188.695V150.695Z"
                            fill="#C78E70" />
                        <path id="detail2"
                            d="M29 145.695C29 145.142 29.4477 144.695 30 144.695H37C42.5228 144.695 47 149.172 47 154.695V190.695C47 192.904 45.2091 194.695 43 194.695H37C32.5817 194.695 29 191.113 29 186.695V145.695Z"
                            fill="url(#paint_skin)" />
                        <circle id="detail3" cx="49.5" cy="172.195" r="10.5" fill="#C78E70" />
                        <circle id="detail4" cx="50.5" cy="172.195" r="6.5" fill="url(#paint_skin)" />
                    </g>
                </g>
            </g>
            <g className='earRightPosition'>
                <g className='earRight' id="earRight" style={{filter: earLeftTop || earLeftTop === null ? 'brightness(.95) contrast(1.2)' : '', opacity: isFront ? !getEarTop('right') ? 1: 0 : getEarTop('right') ? 1 : 0}}>
                    <mask id="mask1_2_98" style={{maskType: 'alpha'}} maskUnits="userSpaceOnUse" x="250" y="136" width="24"
                        height="61">
                        <rect id="cut_2" x="250" y="136.695" width="24" height="60" fill="#000" />
                    </mask>
                    <g mask="url(#mask1_2_98)">
                        <rect id="earRight_2" x="234" y="136.695" width="40" height="60" rx="15" fill="url(#paint_skin)" />
                        <path id="detail1_2"
                            d="M270 150.695C270 145.172 265.523 140.695 260 140.695H259C254.029 140.695 250 144.724 250 149.695V184.695C250 189.113 253.582 192.695 258 192.695H266C268.209 192.695 270 190.904 270 188.695V150.695Z"
                            fill="#C78E70" />
                        <path id="detail2_2"
                            d="M271 145.695C271 144.59 270.105 143.695 269 143.695H263C257.477 143.695 253 148.172 253 153.695V190.695C253 192.904 254.791 194.695 257 194.695H263C267.418 194.695 271 191.113 271 186.695V145.695Z"
                            fill="url(#paint_skin)" />
                        <ellipse id="detail3_2" cx="10" cy="10.5" rx="10" ry="10.5"
                            transform="matrix(-1 0 0 1 261 161.695)" fill="#C78E70" />
                        <circle id="detail4_2" cx="6.5" cy="6.5" r="6.5" transform="matrix(-1 0 0 1 258 165.695)"
                            fill="url(#paint_skin)" />
                    </g>
                </g>
            </g>
        </>
    )

    function getEarTop(ear: "left" | "right") {
        if(earLeftTop !== null) {
            if(earLeftTop) return true
            else return false
        }
        if(ear !== 'right') return false
        else return true
    }

    return (
        <div ref={containerRef} className={styles.container}>
            <div 
                ref={boxAvatarRef}
                className={styles.boxMouseMove}
            >
                {Array.from({ length: 6 }, (_, trailIndex) => (
                    <span
                        key={trailIndex}
                        aria-hidden="true"
                        data-firefly-trail
                        className={styles.fireflyTrailDot}
                    />
                ))}
                <div
                    ref={lookAtRef}
                    aria-hidden="true"
                    data-avatar-firefly
                    className={styles.firefly}
                >
                    <span
                        data-firefly-aura
                        className={styles.fireflyAura}
                        style={{
                            inset: -AVATAR_LIGHT_RENDERING.auraSpread,
                            filter: `blur(${AVATAR_LIGHT_RENDERING.auraBlur}px)`,
                        }}
                    />
                    <span className={styles.fireflyWingLeft} />
                    <span className={styles.fireflyWingRight} />
                    <span className={styles.fireflyGlow} />
                    <span className={styles.fireflyCore} />
                </div>
            </div>
            <div className={styles.containerSVG}>
                <svg
                    ref={avatarRef} 
                    width='400' height='500'
                    viewBox='0 0 500 600'
                    fill="none" xmlns="http://www.w3.org/2000/svg">

                    {/* BODY */}
                    <g className="body" id="body" transform='translate(100, 50)'>
                        <rect id="body_2" y="325.695" width="300" height="378" rx="82" fill="url(#paint_shirt)" />

                        {/* NECK */}
                        <g className="neckRotate">
                            <g className="neck">
                                <rect id="neck_2" x="105" y="228.695" width="90" height="147" rx="45" fill="url(#paint_skinNeck)" />

                                {/* HEAD */}
                                <g className="headPosition">
                                    <g className="head">

                                        {earFront(false)}

                                        <rect id="face" x="50" y="43.6948" width="200" height="250" rx="60" fill="url(#paint_skin)" />

                                        {/* MOUTH */}
                                        <g id="mouth">
                                            <g className='jawPosition'>
                                                <rect className='jaw' id="jaw" x="81" y="203.695" width="138" height="68" rx="16" fill="url(#paint_skin)" />
                                            </g>
                                            <g className='mouthPosition'>
                                                <rect className='mouth' id="mouth_2" x="90" y="212.695" width="120" height="50" rx="16" fill="url(#paint_mouth)" />
                                            </g>
                                            <mask id="mask_mouth" style={{maskType: "alpha"}} maskUnits="userSpaceOnUse" x="40" y="152" width="220" height="171">
                                                <g className='mouthPosition'>
                                                    <rect className='mouth' x="90" y="212.695" width="120" height="50" rx="16" fill="#000" />
                                                </g>
                                            </mask>
                                            <g mask="url(#mask_mouth)">
                                                <g className='tonguePosition'>
                                                    <rect className='tongue' id="tongue" x="116" y="237.695" width="68" height="25" rx="12.5" fill="url(#paint_tongue)" />
                                                </g>
                                                <g className='teethBottomPosition'>
                                                    <rect className='teethBottom' id="teethBottom" x="87" y="258.695" width="126" height="38" rx="12" fill="#EEE3CB" />
                                                </g>
                                                <g className='teethTopPosition'>
                                                    <rect className='teethTop' id="teethTop" x="87" y="197.695" width="126" height="38" rx="12" fill="#EEE3CB" />
                                                </g>
                                                <g className='gumPosition'>
                                                    <rect className='gum' id="gum" x="77" y="195.695" width="146" height="23" rx="11.5" fill="#854C4C" />
                                                </g>
                                            </g>
                                        </g>

                                        {/* EYES */}
                                        <g className='eyesPosition'>
                                            <g className='eyes' id="eyes">
                                                <g className='eyeLeftPosition'>
                                                    <g className='eyeLeft' id="eyeLeft">
                                                        <mask id="mask3_2_16" style={{maskType: "alpha"}} maskUnits="userSpaceOnUse" x="77" y="119"
                                                            width="59" height="60">
                                                            <circle id="cut_4" cx="106.5" cy="148.695" r="29.5" fill="#D9D9D9" />
                                                        </mask>

                                                        <g mask="url(#mask3_2_16)">
                                                            <g className='eyePosition'>
                                                                <circle className='eye' id="eye" cx="106.5" cy="148.695" r="29.5" fill="#D9D9D9" />
                                                            </g>
                                                            <g className='pupilPosition'>
                                                                <g className='pupil' id="pupil">
                                                                    <circle id="pupil_2" cx="106" cy="148.695" r="10" fill="url(#paint_pupila)" />
                                                                    <circle id="iris" cx="106" cy="148.695" r="4" fill="#302A26" />
                                                                </g>
                                                            </g>
                                                            <circle id="highlight" cx="94.5" cy="141.195" r="7.5" fill="#fefefecc" />

                                                            <g className='eyelidBottomPosition'>
                                                                <g className='eyelidBottomBlink'>
                                                                    <path className='eyelidBottom' id="eyelidBottom"
                                                                        d="M143 164.857C138.572 160.429 73 160.857 69 164.857C69 164.857 69 228.695 104.5 228.695C143 228.695 143 164.857 143 164.857Z"
                                                                        fill="url(#paint_skin)" />
                                                                </g>
                                                            </g>
                                                            <g className='eyelidTopPosition'>
                                                                <g className='eyelidTopBlink'>
                                                                    <path className='eyelidTop' id="eyelidTop"
                                                                        d="M69 131.767C73.4282 136.195 139 135.766 143 131.767C143 131.767 143 58.6948 107.5 58.6948C69 58.6948 69 131.767 69 131.767Z"
                                                                        fill="url(#paint_skin)" />
                                                                </g>
                                                            </g>

                                                        </g>
                                                    </g>
                                                </g>
                                                <g className='eyeRightPosition'>
                                                    <g className='eyeRight' id="eyeRight">
                                                        <mask id="mask4_2_16" style={{maskType: "alpha"}} maskUnits="userSpaceOnUse" x="165" y="119"
                                                            width="59" height="60">
                                                            <circle id="cut_5" cx="194.5" cy="148.695" r="29.5" fill="#D9D9D9" />
                                                        </mask>

                                                        <g mask="url(#mask4_2_16)">
                                                            <g className='eyePosition'>
                                                                <circle className='eye' id="eye_2" cx="194.5" cy="148.695" r="29.5" fill="#D9D9D9" />
                                                            </g>
                                                            <g className='pupilPosition'>
                                                                <g className='pupil' id="pupil_3">
                                                                    <circle id="pupil_4" cx="194" cy="148.695" r="10" fill="url(#paint_pupila)" />
                                                                    <circle id="iris_2" cx="194" cy="148.695" r="4" fill="#302A26" />
                                                                </g>
                                                            </g>
                                                            <circle id="highlight_2" cx="182.5" cy="141.195" r="7.5" fill="#fefefecc" />

                                                            <g className='eyelidBottomPosition'>
                                                                <g className='eyelidBottomBlink'>
                                                                    <path className='eyelidBottom' id="eyelidBottom_2"
                                                                        d="M231 164.857C226.572 160.429 161 160.857 157 164.857C157 164.857 157 228.695 192.5 228.695C231 228.695 231 164.857 231 164.857Z"
                                                                        fill="url(#paint_skin)" />
                                                                </g>
                                                            </g>
                                                            <g className='eyelidTopPosition'>
                                                                <g className='eyelidTopBlink'>
                                                                    <path className='eyelidTop' id="eyelidTop_2"
                                                                        d="M157 131.767C161.428 136.195 227 135.766 231 131.767C231 131.767 231 58.6948 195.5 58.6948C157 58.6948 157 131.767 157 131.767Z"
                                                                        fill="url(#paint_skin)" />
                                                                </g>
                                                            </g>

                                                        </g>
                                                    </g>
                                                </g>
                                                <g className='eyebrowLeftPosition'>
                                                    <rect className='eyebrowLeft' id="eyebrowLeft" x="76" y="109.695" width="60" height="20" rx="9" fill="url(#paint_eyebrow)" />
                                                </g>
                                                <g className='eyebrowRightPosition'>
                                                    <rect className='eyebrowRight' id="eyebrowRight" x="164" y="109.695" width="60" height="20" rx="9" fill="url(#paint_eyebrow)" />
                                                </g>
                                            </g>
                                        </g>

                                        {/* GLASSES */}
                                        <g id="glasses" style={{filter: 'drop-shadow(0px 5px 0px #9a473630)'}}>
                                            <g id="astes">
                                                <mask id="mask1_2_16" style={{maskType: "alpha"}} maskUnits="userSpaceOnUse" x="50" y="43" width="200" height="251">
                                                    <rect x="50" y="43.6948" width="200" height="250" rx="60" fill="#000" />
                                                </mask>
                                                <g mask="url(#mask1_2_16)">
                                                    <g className='glassesPosition'>
                                                        <g className='glasses'>
                                                            <line id="asteLeft" x1="68.2902" y1="140.656" x2="30.4942" y2="126.899" stroke="#292935" strokeWidth="5" strokeLinecap="round" />
                                                            <line id="asteRight" x1="270" y1="126.899" x2="232.204" y2="140.656" stroke="#292935" strokeWidth="5" strokeLinecap="round" />
                                                        </g>
                                                    </g>
                                                </g>
                                            </g>
                                            <g className='glassesPosition'>
                                                <g className='glasses'>
                                                    <circle id="lensLeft" cx="106" cy="149.195" r="37.5" fill="#30343A" fillOpacity="0.1" stroke="#292935" strokeWidth="5" />
                                                    <circle id="lensRight" cx="194" cy="149.195" r="37.5" fill="#30343A" fillOpacity="0.1" stroke="#292935" strokeWidth="5" />
                                                    <line id="asteCenter" x1="144.5" y1="144.195" x2="155.5" y2="144.195" stroke="#292935" strokeWidth="5" strokeLinecap="round" />
                                                </g>
                                            </g>
                                        </g>

                                        {/* HAIR */}
                                        <g id="hair">
                                            <g className='hairLeftPosition'>
                                                <path className='hairLeft' id="hairLeft" d="M50.2773 163.195V137.695C27.2773 89.6948 49.7773 39.6948 87.7773 33.1948C87.7773 33.1948 92.444 44.1948 87.7773 52.1948C81.444 69.1948 65.8773 104.295 54.2773 108.695C57.4773 118.695 56.2773 149.195 55.2773 163.195H50.2773Z" fill="url(#paint_hair)" />
                                            </g>
                                            <g className='hairRightPosition'>
                                                <path className='hairRight' id="hairRight" d="M250.573 162.695V137.195C273.572 89.1948 251.073 39.1948 213.074 32.6948C213.074 32.6948 208.407 43.6948 213.074 51.6948C219.407 68.6948 234.973 103.795 246.573 108.195C243.373 118.195 244.573 148.695 245.573 162.695H250.573Z" fill="url(#paint_hair)" />
                                            </g>
                                            <g className='hairTopPosition'>
                                                <path className='hairTop' id="hairTop" d="M234.499 41.1948L217.499 56.1948C99 105.195 27.4995 83.1948 27.4995 56.1948C27.4995 29.1948 74.4995 2.69479 132.999 0.194785C191.499 -2.30522 245.5 19.6948 234.499 41.1948Z" fill="url(#paint_hair)" />
                                            </g>
                                        </g>

                                        {/* NOSE */}
                                        <g className='nosePosition'>
                                            <g className='noseBreathe'>
                                                <rect className='nose' style={{filter: 'drop-shadow(0px 10px 0px #9a473630)'}} id="nose" x="120" y="141.695" width="60" height="95" rx="20" fill="url(#paint_skinNose)" />
                                            </g>
                                        </g>

                                        {earFront(true)}

                                    </g>
                                </g>
                            </g>
                        </g>
                    </g>
                    <defs>
                        <linearGradient id="paint_skin" x1="150" y1="43.6948" x2="150" y2="293.695"
                            gradientUnits="userSpaceOnUse">
                            <stop stopColor="#C79E70" />
                            <stop offset="1" stopColor="#C79470" />
                        </linearGradient>
                        <linearGradient id="paint_skinNeck" x1="150" y1="280" x2="150" y2="330"
                            gradientUnits="userSpaceOnUse">
                            <stop stopColor="#ba7e68" />
                            <stop offset="1" stopColor="#C79E70" />
                        </linearGradient>
                        <linearGradient id="paint_skinNose" x1="150" y1="141.695" x2="150" y2="236.695"
                            gradientUnits="userSpaceOnUse">
                            <stop stopColor="#C78E70" />
                            <stop offset="1" stopColor="#BF7066" />
                        </linearGradient>
                        <radialGradient id="paint_mouth" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"
                            gradientTransform="translate(150 237.695) rotate(90) scale(25 50)">
                            <stop stopColor="#401530" />
                            <stop offset="1" stopColor="#5C2D2D" />
                        </radialGradient>
                        <linearGradient id="paint_tongue" x1="152" y1="220" x2="150" y2="250"
                            gradientUnits="userSpaceOnUse">
                            <stop stopColor="#401530" />
                            <stop offset="1" stopColor="#854C4C" />
                        </linearGradient>
                        <radialGradient id="paint_pupila" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"
                            gradientTransform="translate(194 148.695) rotate(90) scale(15)">
                            <stop stopColor="#593D2F" />
                            <stop offset="1" stopColor="#553128" />
                        </radialGradient>
                        <linearGradient id="paint_hair" x1="65.4257" y1="33.1948" x2="65.4257" y2="140"
                            gradientUnits="userSpaceOnUse">
                            <stop stopColor="#1a1512" />
                            <stop offset="1" stopColor="#120e1a" />
                        </linearGradient>
                        <linearGradient id="paint_eyebrow" x1="194" y1="109.695" x2="194" y2="129.695"
                            gradientUnits="userSpaceOnUse">
                            <stop stopColor="#1a1512" />
                            <stop offset="1" stopColor="#120e1a" />
                        </linearGradient>
                        <linearGradient id="paint_shirt" x1="150" y1="300" x2="150" y2="550"
                            gradientUnits="userSpaceOnUse">
                            <stop stopColor="#328272" />
                            <stop offset="1" stopColor="#20636f" />
                        </linearGradient>
                        <radialGradient
                            id="firefly_light_gradient"
                            data-firefly-light-gradient
                            cx="250"
                            cy="300"
                            r="145"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop offset="0" stopColor="#70fcba" />
                            <stop offset="0.18" stopColor="#1ac776" stopOpacity="0.8" />
                            <stop offset="0.52" stopColor="#418062" stopOpacity="0.54" />
                            <stop offset="1" stopColor="#000000" />
                        </radialGradient>
                        <mask
                            id="firefly_light_mask"
                            maskUnits="userSpaceOnUse"
                            x="0"
                            y="0"
                            width="500"
                            height="600"
                        >
                            <rect width="500" height="600" fill="url(#firefly_light_gradient)" />
                        </mask>
                        <filter
                            id="firefly_exposure_color"
                            x="-5%"
                            y="-5%"
                            width="110%"
                            height="110%"
                            colorInterpolationFilters="sRGB"
                        >
                            <feFlood
                                floodColor="#82ffc5"
                                floodOpacity="1"
                                result="lightColor"
                            />
                            <feComposite
                                in="lightColor"
                                in2="SourceAlpha"
                                operator="in"
                                result="coloredExposure"
                            />
                        </filter>
                        <clipPath id="firefly_head_clip" clipPathUnits="userSpaceOnUse">
                            <rect x="50" y="43.6948" width="200" height="250" rx="60" />
                        </clipPath>
                        <clipPath id="firefly_eye_left_clip" clipPathUnits="userSpaceOnUse">
                            <circle cx="106.5" cy="148.695" r="29.5" />
                        </clipPath>
                        <clipPath id="firefly_eye_right_clip" clipPathUnits="userSpaceOnUse">
                            <circle cx="194.5" cy="148.695" r="29.5" />
                        </clipPath>
                        <filter
                            id="firefly_silhouette_edges"
                            x="-16%"
                            y="-16%"
                            width="132%"
                            height="132%"
                            colorInterpolationFilters="sRGB"
                        >
                            <feMorphology in="SourceAlpha" operator="erode" radius="4" result="contracted" />
                            <feComposite in="SourceAlpha" in2="contracted" operator="out" result="innerOutline" />
                            <feFlood floodColor="#61ffb5" floodOpacity="0.96" result="edgeColor" />
                            <feComposite in="edgeColor" in2="innerOutline" operator="in" result="coloredOutline" />
                            <feGaussianBlur in="coloredOutline" stdDeviation="2.4" result="outlineGlowRaw" />
                            <feComposite in="outlineGlowRaw" in2="SourceAlpha" operator="in" result="outlineGlow" />
                            <feMerge>
                                <feMergeNode in="outlineGlow" />
                                <feMergeNode in="coloredOutline" />
                            </feMerge>
                        </filter>
                        <mask
                            id="firefly_body_behind_head_mask"
                            maskUnits="userSpaceOnUse"
                            x="-60"
                            y="-60"
                            width="420"
                            height="820"
                            style={{maskType: "luminance"}}
                        >
                            <rect x="-60" y="-60" width="420" height="820" fill="#ffffff" />
                            <use
                                href="#avatar_head_occluder_shape"
                                fill="#000000"
                                style={{filter: "brightness(0)"}}
                            />
                        </mask>
                        <mask
                            id="firefly_glasses_behind_nose_mask"
                            maskUnits="userSpaceOnUse"
                            x="-60"
                            y="-60"
                            width="420"
                            height="820"
                            style={{maskType: "luminance"}}
                        >
                            <rect x="-60" y="-60" width="420" height="820" fill="#ffffff" />
                            <use
                                href="#avatar_nose_occluder_shape"
                                fill="#000000"
                                style={{filter: "brightness(0)"}}
                            />
                        </mask>
                    </defs>
                    <use
                        aria-hidden="true"
                        data-avatar-shadow-layer
                        href="#body"
                        opacity="0.82"
                        style={{
                            filter: "brightness(0.3) saturate(0.68) contrast(1.12)",
                            mixBlendMode: "multiply",
                            pointerEvents: "none",
                        }}
                    />
                    <use
                        aria-hidden="true"
                        data-avatar-light-layer
                        data-avatar-light-overlay
                        href="#body"
                        mask="url(#firefly_light_mask)"
                        opacity="0"
                        style={{
                            filter: "brightness(1.55) contrast(1.48) saturate(1.28)",
                            mixBlendMode: "overlay",
                            pointerEvents: "none",
                        }}
                    />
                    <use
                        aria-hidden="true"
                        data-avatar-light-layer
                        data-avatar-light-luminosity
                        href="#body"
                        mask="url(#firefly_light_mask)"
                        opacity="0"
                        style={{
                            filter: "brightness(1.82) contrast(1.28) saturate(1.12)",
                            mixBlendMode: "luminosity",
                            pointerEvents: "none",
                        }}
                    />
                    <use
                        aria-hidden="true"
                        data-avatar-light-layer
                        data-avatar-light-exposure
                        href="#body"
                        mask="url(#firefly_light_mask)"
                        opacity="0"
                        style={{
                            filter: "url(#firefly_exposure_color)",
                            mixBlendMode: "screen",
                            pointerEvents: "none",
                        }}
                    />

                    <g
                        aria-hidden="true"
                        data-avatar-light-layer
                        data-avatar-feature-edges
                        mask="url(#firefly_light_mask)"
                        opacity="0"
                        fill="none"
                        stroke="#baffdf"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                            mixBlendMode: "screen",
                            pointerEvents: "none",
                        }}
                    >
                        <g transform="translate(100 50)">
                            <g
                                data-avatar-edge-layer="body"
                                data-avatar-unified-edge="body"
                                data-avatar-edge-placement="behind-head"
                                mask="url(#firefly_body_behind_head_mask)"
                                style={{filter: "url(#firefly_silhouette_edges)"}}
                            >
                                <rect
                                    data-avatar-edge-part="body"
                                    y="325.695"
                                    width="300"
                                    height="378"
                                    rx="82"
                                    fill="#ffffff"
                                    stroke="none"
                                />
                                <g className="neckRotate">
                                    <g className="neck">
                                        <rect
                                            data-avatar-edge-bounds="neck-body"
                                            x="26"
                                            y="0"
                                            width="248"
                                            height="375.695"
                                            fill="transparent"
                                            stroke="none"
                                            opacity="0"
                                        />
                                        <rect
                                            data-avatar-edge-part="neck"
                                            x="105"
                                            y="228.695"
                                            width="90"
                                            height="147"
                                            rx="45"
                                            fill="#ffffff"
                                            stroke="none"
                                        />
                                    </g>
                                </g>
                            </g>

                            <g
                                data-avatar-edge-layer="head"
                                data-avatar-unified-edge="head"
                                data-avatar-edge-alignment="inside"
                                style={{filter: "url(#firefly_silhouette_edges)"}}
                            >
                                <g id="avatar_head_occluder_shape" className="neckRotate">
                                    <g className="neck">
                                        <rect
                                            data-avatar-edge-bounds="neck-head"
                                            x="26"
                                            y="0"
                                            width="248"
                                            height="375.695"
                                            fill="transparent"
                                            stroke="none"
                                            opacity="0"
                                        />
                                        <g className="headPosition">
                                            <g className="head">
                                                <rect
                                                    data-avatar-edge-bounds="head"
                                                    x="26"
                                                    y="0"
                                                    width="248"
                                                    height="293.695"
                                                    fill="transparent"
                                                    stroke="none"
                                                    opacity="0"
                                                />
                                                <rect
                                                    data-avatar-edge-part="head"
                                                    x="50"
                                                    y="43.6948"
                                                    width="200"
                                                    height="250"
                                                    rx="60"
                                                    fill="#ffffff"
                                                    stroke="none"
                                                />
                                                <g className="earLeftPosition">
                                                    <rect
                                                        data-avatar-edge-part="ear-left"
                                                        x="26"
                                                        y="136.695"
                                                        width="40"
                                                        height="60"
                                                        rx="15"
                                                        fill="#ffffff"
                                                        stroke="none"
                                                    />
                                                </g>
                                                <g className="earRightPosition">
                                                    <rect
                                                        data-avatar-edge-part="ear-right"
                                                        x="234"
                                                        y="136.695"
                                                        width="40"
                                                        height="60"
                                                        rx="15"
                                                        fill="#ffffff"
                                                        stroke="none"
                                                    />
                                                </g>
                                                <g className="hairLeftPosition">
                                                    <path
                                                        data-avatar-edge-part="hair-left"
                                                        className="hairLeft"
                                                        d="M50.2773 163.195V137.695C27.2773 89.6948 49.7773 39.6948 87.7773 33.1948C87.7773 33.1948 92.444 44.1948 87.7773 52.1948C81.444 69.1948 65.8773 104.295 54.2773 108.695C57.4773 118.695 56.2773 149.195 55.2773 163.195H50.2773Z"
                                                    fill="#ffffff"
                                                        stroke="none"
                                                    />
                                                </g>
                                                <g className="hairRightPosition">
                                                    <path
                                                        data-avatar-edge-part="hair-right"
                                                        className="hairRight"
                                                        d="M250.573 162.695V137.195C273.572 89.1948 251.073 39.6948 213.074 32.6948C213.074 32.6948 208.407 43.6948 213.074 51.6948C219.407 68.6948 234.973 103.795 246.573 108.195C243.373 118.195 244.573 148.695 245.573 162.695H250.573Z"
                                                    fill="#ffffff"
                                                        stroke="none"
                                                    />
                                                </g>
                                                <g className="hairTopPosition">
                                                    <path
                                                        data-avatar-edge-part="hair-top"
                                                        className="hairTop"
                                                        d="M234.499 41.1948L217.499 56.1948C99 105.195 27.4995 83.1948 27.4995 56.1948C27.4995 29.1948 74.4995 2.69479 132.999 0.194785C191.499 -2.30522 245.5 19.6948 234.499 41.1948Z"
                                                    fill="#ffffff"
                                                        stroke="none"
                                                    />
                                                </g>
                                            </g>
                                        </g>
                                    </g>
                                </g>
                            </g>

                            <g
                                data-avatar-eye-reflections
                                stroke="none"
                                style={{mixBlendMode: "screen", pointerEvents: "none"}}
                            >
                                <g className="neckRotate">
                                    <g className="neck">
                                        <rect
                                            x="26"
                                            y="0"
                                            width="248"
                                            height="375.695"
                                            fill="transparent"
                                            stroke="none"
                                            opacity="0"
                                        />
                                        <g className="headPosition">
                                            <g className="head">
                                                <rect
                                                    x="26"
                                                    y="0"
                                                    width="248"
                                                    height="293.695"
                                                    fill="transparent"
                                                    stroke="none"
                                                    opacity="0"
                                                />
                                                <g className="eyesPosition">
                                                    <g className="eyeLeftPosition" clipPath="url(#firefly_eye_left_clip)">
                                                        <g data-avatar-eye-reflection="left" opacity="0">
                                                            <circle
                                                                cx="106.5"
                                                                cy="148.695"
                                                                r="11"
                                                                fill="#65f2b7"
                                                                fillOpacity="0.52"
                                                                stroke="none"
                                                                style={{filter: "blur(4px)"}}
                                                            />
                                                            <circle cx="106.5" cy="148.695" r="3.6" fill="#ffffff" stroke="none" />
                                                        </g>
                                                    </g>
                                                    <g className="eyeRightPosition" clipPath="url(#firefly_eye_right_clip)">
                                                        <g data-avatar-eye-reflection="right" opacity="0">
                                                            <circle
                                                                cx="194.5"
                                                                cy="148.695"
                                                                r="11"
                                                                fill="#65f2b7"
                                                                fillOpacity="0.52"
                                                                stroke="none"
                                                                style={{filter: "blur(4px)"}}
                                                            />
                                                            <circle cx="194.5" cy="148.695" r="3.6" fill="#ffffff" stroke="none" />
                                                        </g>
                                                    </g>
                                                </g>
                                            </g>
                                        </g>
                                    </g>
                                </g>
                            </g>

                            <g
                                data-avatar-edge-layer="glasses"
                                data-avatar-edge-placement="behind-nose"
                                mask="url(#firefly_glasses_behind_nose_mask)"
                            >
                                <g className="neckRotate">
                                    <g className="neck">
                                        <rect
                                            data-avatar-edge-bounds="neck-glasses"
                                            x="26"
                                            y="0"
                                            width="248"
                                            height="375.695"
                                            fill="transparent"
                                            stroke="none"
                                            opacity="0"
                                        />
                                        <g className="headPosition">
                                            <g className="head">
                                                <rect
                                                    data-avatar-edge-bounds="head-glasses"
                                                    x="26"
                                                    y="0"
                                                    width="248"
                                                    height="293.695"
                                                    fill="transparent"
                                                    stroke="none"
                                                    opacity="0"
                                                />
                                                <g
                                                    data-avatar-glasses-clip="head"
                                                    clipPath="url(#firefly_head_clip)"
                                                    style={{filter: "drop-shadow(0 0 7px #8effd2)"}}
                                                >
                                                    <g className="glassesPosition">
                                                        <g className="glasses" data-avatar-edge-part="glasses">
                                                            <line x1="68.2902" y1="140.656" x2="30.4942" y2="126.899" />
                                                            <line x1="270" y1="126.899" x2="232.204" y2="140.656" />
                                                            <circle cx="106" cy="149.195" r="37.5" />
                                                            <circle cx="194" cy="149.195" r="37.5" />
                                                            <line x1="144.5" y1="144.195" x2="155.5" y2="144.195" />
                                                        </g>
                                                    </g>
                                                </g>
                                            </g>
                                        </g>
                                    </g>
                                </g>
                            </g>

                            <g
                                data-avatar-edge-layer="nose"
                                data-avatar-edge-alignment="inside"
                                style={{filter: "url(#firefly_silhouette_edges)"}}
                            >
                                <g id="avatar_nose_occluder_shape" className="neckRotate">
                                    <g className="neck">
                                        <rect
                                            data-avatar-edge-bounds="neck-nose"
                                            x="26"
                                            y="0"
                                            width="248"
                                            height="375.695"
                                            fill="transparent"
                                            stroke="none"
                                            opacity="0"
                                        />
                                        <g className="headPosition">
                                            <g className="head">
                                                <rect
                                                    data-avatar-edge-bounds="head-nose"
                                                    x="26"
                                                    y="0"
                                                    width="248"
                                                    height="293.695"
                                                    fill="transparent"
                                                    stroke="none"
                                                    opacity="0"
                                                />
                                                <g className="nosePosition">
                                                    <g className="noseBreathe">
                                                        <rect
                                                            className="nose"
                                                            data-avatar-edge-part="nose"
                                                            x="120"
                                                            y="141.695"
                                                            width="60"
                                                            height="95"
                                                            rx="20"
                                                            fill="url(#paint_skinNose)"
                                                            stroke="none"
                                                        />
                                                    </g>
                                                </g>
                                            </g>
                                        </g>
                                    </g>
                                </g>
                            </g>
                        </g>
                    </g>
                </svg>
            </div>
        </div>
    )
}