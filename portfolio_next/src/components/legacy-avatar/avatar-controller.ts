import gsap from "gsap"
import type { useGSAP } from "@gsap/react"
import type { Dispatch, RefObject, SetStateAction } from "react"
import { AVATAR_EYE_REFLECTION, AVATAR_IDLE_WHISTLE_KEYFRAMES, AVATAR_LIGHT_RENDERING, AVATAR_NOSE_INTERACTION, AVATAR_NOSE_SWING_KEYFRAMES, AVATAR_TIMELINE_REPEAT, canTriggerNoseCollision, getAvatarInteractionBounds, getAvatarLightIntensity, getAvatarLightingState, getEyeReflectionState, getSurpriseReaction, isPointerNearNose, nextAvatarMotionPhase, shouldAvatarBlink, shouldShowFirefly, type AvatarMotionPhase } from "./motion-state"
import { LAMP_INTERACTION, canTriggerLampCollision, getCreatureMode, getLampCollisionSide, getLampSwingKeyframes, isNearLampBulb, nextLampPhase, type CreatureMode, type LampPhase } from "./lamp-motion-state"
import { getAutonomousFlyBounds, getAutonomousFlyPauseDuration, getAutonomousFlyTravelDuration, getAutonomousFlyWaypoint, type CreaturePoint } from "./autonomous-creature-motion"

const FIREFLY_CURSOR_CLASS = "avatar-firefly-active"
const LAMP_AVATAR_EDGE_OPACITY = 0.46
const TRACKING_SELECTOR = ".hairTopPosition, .hairLeftPosition, .hairRightPosition, .earLeftPosition, .earRightPosition, .nosePosition, .glassesPosition, .eyebrowLeftPosition, .eyebrowRightPosition, .eyelidTopPosition, .eyelidBottomPosition, .eyesPosition, .teethTopPosition, .teethBottomPosition, .gumPosition, .jawPosition, .mouthPosition, .headPosition, .neckRotate, .pupilPosition"

type ContextSafe = ReturnType<typeof useGSAP>["contextSafe"]
type EarState = boolean | null
type NumberSetter = (value: number) => void
type MotionTarget = string | Element
type QuickFactory = (target: MotionTarget, property: string, duration?: number) => NumberSetter
type TimelineName = "ambient" | "blink" | "enter" | "idle" | "reset" | "surprise"

export interface AvatarSceneController {
    activateLamp(): void
}

interface SetupAvatarMotionOptions {
    containerRef: RefObject<HTMLDivElement | null>
    avatarRef: RefObject<SVGSVGElement | null>
    boxAvatarRef: RefObject<HTMLDivElement | null>
    lookAtRef: RefObject<HTMLDivElement | null>
    setEarLeftTop: Dispatch<SetStateAction<EarState>>
    setLampPhase: Dispatch<SetStateAction<LampPhase>>
    setCreatureMode: Dispatch<SetStateAction<CreatureMode>>
    sceneControllerRef: RefObject<AvatarSceneController | null>
    initialTheme: "dark" | "light"
    activateDarkTheme: () => void
    activateLightTheme: () => void
    contextSafe: ContextSafe
}

interface PointerMetrics {
    clientX: number
    clientY: number
    dx: number
    dy: number
}

interface PointerTracker {
    update(metrics: PointerMetrics): void
}

interface PupilTracker {
    eye: Element
    pupil: Element
    x: NumberSetter
    y: NumberSetter
}

export function setupAvatarMotion({
    containerRef,
    avatarRef,
    boxAvatarRef,
    lookAtRef,
    setEarLeftTop,
    setLampPhase,
    setCreatureMode,
    sceneControllerRef,
    initialTheme,
    activateDarkTheme,
    activateLightTheme,
    contextSafe,
}: SetupAvatarMotionOptions): () => void {
    const avatar = avatarRef.current
    const boxAvatar = boxAvatarRef.current
    const lookAt = lookAtRef.current

    if (!avatar || !boxAvatar || !lookAt) {
        sceneControllerRef.current = null
        return () => undefined
    }

    const select = gsap.utils.selector(containerRef)
    const timelines: Record<TimelineName, gsap.core.Timeline | null> = {
        ambient: null,
        blink: null,
        enter: null,
        idle: null,
        reset: null,
        surprise: null,
    }
    const blink: { active: boolean; timeout: gsap.core.Tween | null; doubleTimeout: gsap.core.Tween | null } = {
        active: false,
        timeout: null,
        doubleTimeout: null,
    }
    let phase: AvatarMotionPhase = "entering"
    let lastPointerMetrics: PointerMetrics = { clientX: 0, clientY: 0, dx: 0, dy: 0 }
    let pointerInside = false
    let fireflyVisible = false
    let lampPhase: LampPhase = initialTheme === "light" ? "on" : "off"
    let creatureMode: CreatureMode = getCreatureMode(lampPhase)
    let collisionArmed = true
    let lastLampHitAt = Number.NEGATIVE_INFINITY
    let activationTimer: number | null = null
    let lampSwingTimeline: gsap.core.Timeline | null = null
    let lampFlickerTimeline: gsap.core.Timeline | null = null
    let noseCollisionArmed = true
    let lastNoseHitAt = Number.NEGATIVE_INFINITY
    let noseSwingTimeline: gsap.core.Timeline | null = null
    let autonomousFlyTween: gsap.core.Tween | null = null
    let autonomousFlyPause: gsap.core.Tween | null = null
    let autonomousFlyActive = false
    const autonomousPosition: CreaturePoint = { x: 0, y: 0 }
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const targets: gsap.utils.SelectorFunc = select
    const quick: QuickFactory = (target, property, duration = 0.28) => {
        const selectedTargets = typeof target === "string" ? targets(target) : [target]

        return (value: number) => {
            gsap.to(selectedTargets, {
                [property]: value,
                duration,
                ease: "power2.out",
                overwrite: "auto",
            })
        }
    }

    setPose({ avatar, targets })

    if (reduceMotion) {
        phase = "reduced"
        gsap.set(avatar, { y: 0, visibility: "visible" })
    }

    const tracker = createPointerTracker({ quick, targets })
    const avatarShadowLayer = avatar.querySelector<SVGUseElement>("[data-avatar-shadow-layer]")
    const avatarLightOverlay = avatar.querySelector<SVGUseElement>("[data-avatar-light-overlay]")
    const avatarLightLuminosity = avatar.querySelector<SVGUseElement>("[data-avatar-light-luminosity]")
    const avatarLightExposure = avatar.querySelector<SVGUseElement>("[data-avatar-light-exposure]")
    const avatarFeatureEdges = avatar.querySelector<SVGGElement>("[data-avatar-feature-edges]")
    const avatarLampEdges = avatar.querySelector<SVGUseElement>("[data-avatar-lamp-edges]")
    const avatarNoses = Array.from(avatar.querySelectorAll<SVGRectElement>(".nose"))
    const avatarNose = avatarNoses[0] ?? null
    const avatarLightLayers = Array.from(avatar.querySelectorAll<SVGElement>("[data-avatar-light-layer]"))
    const avatarLightGradient = avatar.querySelector<SVGRadialGradientElement>("[data-firefly-light-gradient]")
    const avatarEyeReflections = [
        {
            element: avatar.querySelector<SVGGElement>('[data-avatar-eye-reflection="left"]'),
            center: AVATAR_EYE_REFLECTION.left,
        },
        {
            element: avatar.querySelector<SVGGElement>('[data-avatar-eye-reflection="right"]'),
            center: AVATAR_EYE_REFLECTION.right,
        },
    ]
    const fireflyAura = lookAt.querySelector<HTMLElement>("[data-firefly-aura]")
    const navigation = document.querySelector<HTMLElement>("header")
    const trailDots = Array.from(boxAvatar.querySelectorAll<HTMLElement>("[data-firefly-trail]"))
    const pointerSvgPoint = avatar.createSVGPoint()
    const setCursorX = gsap.quickSetter(lookAt, "left", "px")
    const setCursorY = gsap.quickSetter(lookAt, "top", "px")
    const scene = containerRef.current
    const lampShade = scene?.querySelector<SVGGraphicsElement>("[data-part=shade]") ?? null
    const lampBulb = scene?.querySelector<SVGGraphicsElement>("[data-lamp-bulb]") ?? null
    const lampBulbGlow = scene?.querySelector<SVGCircleElement>("[data-lamp-bulb-glow]") ?? null
    const lampBulbGlass = scene?.querySelector<SVGPathElement>("[data-lamp-bulb-glass]") ?? null
    const lampBeam = scene?.querySelector<SVGElement>("[data-part=beam]") ?? null
    const lampSwingTargets = scene ? Array.from(scene.querySelectorAll<Element>("[data-lamp-swing]")) : []
    const lampFlickerTargets: SVGElement[] = []
    if (lampBulbGlow) lampFlickerTargets.push(lampBulbGlow)
    if (lampBulbGlass) lampFlickerTargets.push(lampBulbGlass)

    setLampPhase(lampPhase)
    setCreatureMode(creatureMode)

    const keepAvatarDark = () => {
        if (!avatarShadowLayer || lampPhase === "activating" || lampPhase === "on") return

        gsap.to(avatarShadowLayer, {
            opacity: getAvatarLightingState(0).shadowOpacity,
            duration: 0.35,
            ease: "power2.out",
            overwrite: "auto",
        })
    }

    const updateFireflyScene = (
        localX: number,
        localY: number,
        lightX: number,
        lightY: number,
        lightIntensity: number,
    ) => {
        if (!fireflyVisible) {
            gsap.set(trailDots, { left: localX, top: localY, opacity: 0 })
        }

        if (creatureMode === "fly") {
            gsap.set(trailDots, { left: localX, top: localY, opacity: 0 })
        } else {
            trailDots.forEach((dot, index) => {
                gsap.to(dot, {
                    left: localX,
                    top: localY,
                    opacity: Math.max(0.12, 0.62 - index * 0.09),
                    scale: Math.max(0.45, 1 - index * 0.1),
                    duration: 0.1 + index * 0.055,
                    ease: "power3.out",
                    overwrite: "auto",
                })
            })
        }

        if (lampPhase === "activating" || lampPhase === "on") {
            gsap.to(avatarLightLayers, { opacity: 0, duration: 0.16, overwrite: "auto" })
            avatarEyeReflections.forEach(({ element }) => {
                if (element) gsap.to(element, { opacity: 0, duration: 0.16, overwrite: "auto" })
            })
            if (creatureMode === "fly" && fireflyAura) {
                gsap.to(fireflyAura, { opacity: 0, duration: 0.16, overwrite: "auto" })
            }
            return
        }

        const lighting = getAvatarLightingState(lightIntensity)

        avatarEyeReflections.forEach(({ element, center }) => {
            if (!element) return

            const reflection = getEyeReflectionState({ x: lightX, y: lightY }, center)
            gsap.to(element, {
                x: reflection.offsetX,
                y: reflection.offsetY,
                opacity: reflection.opacity,
                duration: AVATAR_EYE_REFLECTION.followDuration,
                ease: AVATAR_LIGHT_RENDERING.ease,
                overwrite: "auto",
            })
        })

        if (avatarLightGradient) {
            gsap.to(avatarLightGradient, {
                attr: {
                    cx: lightX,
                    cy: lightY,
                    r: lighting.radius,
                },
                duration: AVATAR_LIGHT_RENDERING.followDuration,
                ease: AVATAR_LIGHT_RENDERING.ease,
                overwrite: "auto",
            })
        }

        if (avatarLightOverlay) {
            gsap.to(avatarLightOverlay, {
                opacity: lighting.overlayOpacity,
                duration: AVATAR_LIGHT_RENDERING.intensityDuration,
                ease: AVATAR_LIGHT_RENDERING.ease,
                overwrite: "auto",
            })
        }

        if (avatarLightLuminosity) {
            gsap.to(avatarLightLuminosity, {
                opacity: lighting.luminosityOpacity,
                duration: AVATAR_LIGHT_RENDERING.intensityDuration,
                ease: AVATAR_LIGHT_RENDERING.ease,
                overwrite: "auto",
            })
        }

        if (avatarLightExposure) {
            gsap.to(avatarLightExposure, {
                opacity: lighting.exposureOpacity,
                duration: AVATAR_LIGHT_RENDERING.intensityDuration,
                ease: AVATAR_LIGHT_RENDERING.ease,
                overwrite: "auto",
            })
        }

        if (avatarFeatureEdges) {
            gsap.to(avatarFeatureEdges, {
                opacity: lighting.featureEdgeOpacity,
                duration: AVATAR_LIGHT_RENDERING.intensityDuration,
                ease: AVATAR_LIGHT_RENDERING.ease,
                overwrite: "auto",
            })
        }

        if (fireflyAura) {
            gsap.to(fireflyAura, {
                opacity: lighting.auraOpacity,
                scale: lighting.auraScale,
                duration: AVATAR_LIGHT_RENDERING.intensityDuration,
                ease: AVATAR_LIGHT_RENDERING.ease,
                overwrite: "auto",
            })
        }
    }

    const setFireflyVisible = (visible: boolean) => {
        document.documentElement.classList.toggle(
            FIREFLY_CURSOR_CLASS,
            visible && creatureMode === "firefly",
        )
        if (visible === fireflyVisible) return
        fireflyVisible = visible
        if (visible && creatureMode === "firefly") keepAvatarDark()
        else {
            gsap.to(trailDots, { opacity: 0, duration: 0.14, overwrite: "auto" })
            gsap.to(avatarLightLayers, { opacity: 0, duration: 0.12, overwrite: "auto" })
            if (fireflyAura) {
                gsap.to(fireflyAura, {
                    opacity: 0.28,
                    scale: 0.8,
                    duration: 0.12,
                    overwrite: "auto",
                })
            }
        }
        gsap.to(lookAt, {
            autoAlpha: visible ? 1 : 0,
            duration: visible ? 0.18 : 0.1,
            ease: visible ? "back.out(2)" : "power2.out",
            overwrite: true,
        })
    }

    const stopLampFlicker = () => {
        lampFlickerTimeline?.kill()
        lampFlickerTimeline = null
        if (lampBulbGlass) {
            gsap.to(lampBulbGlass, { opacity: 1, duration: reduceMotion ? 0 : 0.16, overwrite: true })
        }
        if (lampBulbGlow && lampPhase !== "activating" && lampPhase !== "on") {
            gsap.to(lampBulbGlow, { opacity: 0.02, duration: reduceMotion ? 0 : 0.16, overwrite: true })
        }
    }

    const startLampFlicker = () => {
        if (lampFlickerTargets.length === 0 || lampPhase === "activating" || lampPhase === "on") return
        lampFlickerTimeline?.kill()

        if (reduceMotion) {
            gsap.set(lampFlickerTargets, { opacity: 0.72 })
            return
        }

        lampFlickerTimeline = gsap.timeline({ repeat: -1 })
            .to(lampFlickerTargets, { opacity: 0.72, duration: 0.12, ease: "power2.out" })
            .to(lampFlickerTargets, { opacity: 0.18, duration: 0.08, ease: "power1.in" })
            .to(lampFlickerTargets, { opacity: 0.92, duration: 0.18, ease: "power2.out" })
            .to(lampFlickerTargets, { opacity: 0.24, duration: 0.28, ease: "power1.inOut" })
            .to(lampFlickerTargets, { opacity: 0.62, duration: 0.14, ease: "power2.out" })
            .to(lampFlickerTargets, { opacity: 0.12, duration: 0.34, ease: "power1.inOut" })
    }

    const startLampSwing = (side: "left" | "right") => {
        if (reduceMotion || lampSwingTargets.length === 0) return
        lampSwingTimeline?.kill()
        lampSwingTimeline = gsap.timeline()
            .to(lampSwingTargets, {
                keyframes: getLampSwingKeyframes(side),
                transformOrigin: "50% 0%",
                overwrite: true,
            })
    }

    const startNoseSwing = () => {
        if (reduceMotion || !avatarNose) return
        noseSwingTimeline?.kill()
        noseSwingTimeline = gsap.timeline()
            .to(avatarNoses, {
                keyframes: AVATAR_NOSE_SWING_KEYFRAMES,
                transformOrigin: "50% 0%",
                overwrite: "auto",
            })
    }

    const updateNoseInteraction = (point: CreaturePoint) => {
        if (!avatarNose || !fireflyVisible) return

        const noseBounds = avatarNose.getBoundingClientRect()
        const now = performance.now()

        if (
            isPointerNearNose(point, noseBounds)
            && canTriggerNoseCollision({ now, lastHitAt: lastNoseHitAt, armed: noseCollisionArmed })
        ) {
            startNoseSwing()
            lastNoseHitAt = now
            noseCollisionArmed = false
        } else if (!isPointerNearNose(point, noseBounds, AVATAR_NOSE_INTERACTION.rearmPadding)) {
            noseCollisionArmed = true
        }
    }

    const activateLamp = contextSafe(() => {
        if (lampPhase === "activating") return

        if (lampPhase === "on") {
            lampPhase = nextLampPhase(lampPhase, "DEACTIVATE")
            creatureMode = getCreatureMode(lampPhase)
            setLampPhase(lampPhase)
            setCreatureMode(creatureMode)
            stopAutonomousFly()
            pointerInside = false
            setFireflyVisible(false)
            if (!reduceMotion) {
                phase = "idle"
                startIdle()
            }
            stopLampFlicker()
            activateDarkTheme()

            const duration = reduceMotion ? 0 : 0.42
            if (lampBeam) {
                gsap.to(lampBeam, {
                    opacity: 0,
                    duration,
                    ease: "power2.out",
                    overwrite: true,
                })
            }
            if (lampBulbGlow) {
                gsap.to(lampBulbGlow, {
                    opacity: 0.02,
                    duration,
                    ease: "power2.out",
                    overwrite: true,
                })
            }
            gsap.to(avatarLightLayers, { opacity: 0, duration, overwrite: true })
            if (avatarLampEdges) {
                gsap.to(avatarLampEdges, { opacity: 0, duration, ease: "power2.out", overwrite: true })
            }
            if (avatarShadowLayer) {
                gsap.to(avatarShadowLayer, {
                    opacity: getAvatarLightingState(0).shadowOpacity,
                    duration,
                    ease: "power2.out",
                    overwrite: true,
                })
            }
            gsap.to(avatar, {
                filter: "none",
                duration,
                ease: "power2.out",
                overwrite: "auto",
            })
            if (fireflyAura) {
                gsap.to(fireflyAura, {
                    opacity: 0.28,
                    scale: 0.8,
                    duration,
                    overwrite: true,
                })
            }
            return
        }

        lampPhase = nextLampPhase(lampPhase, "ACTIVATE")
        setLampPhase(lampPhase)
        creatureMode = "fly"
        setCreatureMode(creatureMode)
        startAutonomousFly()
        stopLampFlicker()

        gsap.to(trailDots, { opacity: 0, duration: reduceMotion ? 0 : 0.2, overwrite: true })
        if (fireflyAura) gsap.to(fireflyAura, { opacity: 0, duration: reduceMotion ? 0 : 0.2, overwrite: true })

        const duration = reduceMotion ? 0 : 0.48
        if (lampBeam) gsap.set(lampBeam, { opacity: 1 })
        if (avatarLampEdges) gsap.set(avatarLampEdges, { opacity: LAMP_AVATAR_EDGE_OPACITY })
        if (lampBulbGlow) gsap.to(lampBulbGlow, { opacity: 0.94, duration, ease: "power2.out", overwrite: true })
        gsap.to(avatarLightLayers, { opacity: 0, duration, overwrite: true })
        if (avatarShadowLayer) gsap.to(avatarShadowLayer, { opacity: 0.18, duration, ease: "power2.out", overwrite: true })
        gsap.to(avatar, { filter: "brightness(1.12) contrast(1.06)", duration, ease: "power2.out", overwrite: "auto" })

        if (activationTimer !== null) window.clearTimeout(activationTimer)
        activationTimer = window.setTimeout(contextSafe(() => {
            lampPhase = nextLampPhase(lampPhase, "ACTIVATION_COMPLETE")
            setLampPhase(lampPhase)
            activateLightTheme()
            gsap.to(avatarLightLayers, { opacity: 0, duration: reduceMotion ? 0 : 0.2, overwrite: true })
            if (avatarLampEdges) {
                gsap.to(avatarLampEdges, { opacity: 0, duration: reduceMotion ? 0 : 0.28, overwrite: true })
            }
            activationTimer = null
        }), LAMP_INTERACTION.activationDelayMs)
    })

    const updateLampInteraction = (point: CreaturePoint) => {
        if (!lampShade || !lampBulb || lampPhase === "activating") return

        const shadeBounds = lampShade.getBoundingClientRect()
        const side = getLampCollisionSide(point, shadeBounds)
        const now = performance.now()

        if (side && canTriggerLampCollision({ now, lastHitAt: lastLampHitAt, armed: collisionArmed })) {
            startLampSwing(side)
            lastLampHitAt = now
            collisionArmed = false
        } else if (
            point.x < shadeBounds.left - LAMP_INTERACTION.collisionBand
            || point.x > shadeBounds.right + LAMP_INTERACTION.collisionBand
            || point.y < shadeBounds.top - LAMP_INTERACTION.collisionBand
            || point.y > shadeBounds.bottom + LAMP_INTERACTION.collisionBand
        ) {
            collisionArmed = true
        }

        if (lampPhase === "on") return

        const bulbBounds = lampBulb.getBoundingClientRect()
        const bulbCenter = {
            x: bulbBounds.left + bulbBounds.width / 2,
            y: bulbBounds.top + bulbBounds.height / 2,
        }
        const isNear = isNearLampBulb(point, bulbCenter)

        if (isNear && lampPhase === "off") {
            lampPhase = nextLampPhase(lampPhase, "NEAR_ENTER")
            setLampPhase(lampPhase)
            startLampFlicker()
        } else if (!isNear && lampPhase === "near") {
            lampPhase = nextLampPhase(lampPhase, "NEAR_LEAVE")
            setLampPhase(lampPhase)
            stopLampFlicker()
        }
    }

    sceneControllerRef.current = { activateLamp }

    if (lampPhase === "on") {
        gsap.set(lampBeam, { opacity: 1 })
        gsap.set(lampBulbGlow, { opacity: 0.94 })
        gsap.set(avatarLightLayers, { opacity: 0 })
        if (avatarLampEdges) gsap.set(avatarLampEdges, { opacity: 0 })
        if (avatarShadowLayer) gsap.set(avatarShadowLayer, { opacity: 0.18 })
        gsap.set(avatar, { filter: "brightness(1.12) contrast(1.06)" })
    }

    const stopBlink = () => {        blink.active = false
        blink.timeout?.kill()
        blink.doubleTimeout?.kill()
        timelines.blink?.kill()
        blink.timeout = null
        blink.doubleTimeout = null
        timelines.blink = null
    }

    const playBlink = () => {
        timelines.blink?.kill()
        timelines.blink = gsap.timeline()
            .to(targets(".eyelidTopBlink"), { y: 15, duration: 0.1, ease: "power1.in" })
            .to(targets(".eyelidBottomBlink"), { y: -15, duration: 0.1, ease: "power1.in" }, 0)
            .to(targets(".eyelidTopBlink"), { y: 0, duration: 0.15, ease: "power1.out" }, "+=0.1")
            .to(targets(".eyelidBottomBlink"), { y: 0, duration: 0.15, ease: "power1.out" }, "<")
    }

    const scheduleBlink = () => {
        if (!blink.active) return
        const delay = gsap.utils.random(2, 8, 0.1)

        blink.timeout = gsap.delayedCall(delay, contextSafe(() => {
            if (!blink.active) return
            playBlink()

            if (Math.random() < 0.1) {
                blink.doubleTimeout = gsap.delayedCall(0.3, contextSafe(() => {
                    if (blink.active) playBlink()
                }))
            }
            scheduleBlink()
        }))
    }

    const startBlink = () => {
        if (blink.active || !shouldAvatarBlink(phase)) return
        blink.active = true
        scheduleBlink()
    }

    const killMainTimelines = () => {
        timelines.idle?.kill()
        timelines.reset?.kill()
        timelines.surprise?.kill()
    }

    const resetExpression = () => {
        timelines.reset?.kill()
        timelines.reset = gsap.timeline({
            defaults: { duration: 0.24, ease: "power2.out", overwrite: "auto" },
        })
            .to(targets(".eyeRight, .eyeLeft, .pupil"), { scaleX: 1, scaleY: 1 }, 0)
            .to(targets(".head, .neck"), { x: 0, y: 0, rotate: 0 }, 0)
            .to(targets(".eyebrowLeft, .eyebrowRight, .eyelidTop, .eyelidBottom"), { y: 0 }, 0)
            .to(targets(".nose"), { scaleX: 1, scaleY: 1 }, 0)
            .to(targets(".jaw, .mouth"), { x: 0, y: 0, scaleX: 0.5, scaleY: 0.5 }, 0)
            .to(targets(".teethBottom, .tongue"), { x: 0, y: 0 }, 0)
    }

    const resetTrackingOffsets = () => {
        gsap.killTweensOf(targets(TRACKING_SELECTOR))
        timelines.reset?.kill()
        timelines.reset = gsap.timeline({
            defaults: { duration: 0.24, ease: "power2.out", overwrite: "auto" },
        })
            .to(targets(TRACKING_SELECTOR), { x: 0, y: 0 }, 0)
            .to(targets(".hairLeftPosition, .hairRightPosition"), { scaleX: 1 }, 0)
            .to(targets(".neckRotate"), { rotate: 0 }, 0)
    }

    const preserveFinalTrackingOffsets = () => {
        gsap.getTweensOf(targets(TRACKING_SELECTOR)).forEach((tween) => {
            tween.progress(1).kill()
        })
    }

    const startIdle = contextSafe(() => {
        killMainTimelines()
        resetTrackingOffsets()
        keepAvatarDark()
        startBlink()

        timelines.idle = gsap.timeline({
            defaults: { ease: "power2.inOut", duration: 0.3 },
            repeat: AVATAR_TIMELINE_REPEAT.idle,
            repeatDelay: 1,
        })
            .to(targets(".head, .neck"), { x: 0, y: 0, rotate: 0, duration: 0.45 })
            .to(targets(".pupilPosition"), { x: -6, y: 1, duration: 0.35 }, "<")
            .to(targets(".eyebrowLeft, .eyebrowRight"), { y: 12 }, "<+0.9")
            .to(targets(".pupil"), { scaleX: 0.55, scaleY: 0.55 }, "<")
            .to(targets(".eyelidTop"), { y: 8 }, "<")
            .to(targets(".eyelidBottom"), { y: -8 }, "<")
            .to(targets(".nose"), { scaleY: 0.92, ease: "back.out(1.7)" }, "<")
            .to(targets(".mouth, .jaw"), { y: -4, scaleX: 0.58, scaleY: 0.5, ease: "back.out(1.7)" }, "<")
            .to(targets(".eyebrowLeft, .eyebrowRight, .eyelidTop, .eyelidBottom"), { y: 0, delay: 1.5, duration: 0.45 })
            .to(targets(".pupil"), { scaleX: 1, scaleY: 1 }, "<")
            .to(targets(".nose"), { scaleY: 1 }, "<")
            .to(targets(".pupilPosition"), { x: 6, y: -2, duration: 0.35 }, "+=0.8")
            .to(targets(".hairTopPosition"), { x: 8, y: -2 }, "<")
            .to(targets(".hairLeftPosition, .hairRightPosition"), { y: 1 }, "<")
            .to(targets(".hairLeftPosition"), { x: 6, scaleX: 1.12 }, "<")
            .to(targets(".hairRightPosition"), { x: 0, scaleX: 0.88 }, "<")
            .to(targets(".earLeftPosition"), { x: 6, y: 1 }, "<")
            .to(targets(".earRightPosition"), { x: -10, y: 1 }, "<")
            .to(targets(".nosePosition"), { x: 15, y: -4 }, "<")
            .to(targets(".glassesPosition"), { x: 12, y: -3 }, "<")
            .to(targets(".eyebrowLeftPosition"), { y: -2 }, "<")
            .to(targets(".eyebrowRightPosition"), { y: -4 }, "<")
            .to(targets(".eyelidTopPosition"), { y: -2 }, "<")
            .to(targets(".eyelidBottomPosition"), { y: -1 }, "<")
            .to(targets(".eyesPosition"), { x: 8, y: -2 }, "<")
            .to(targets(".teethTopPosition, .teethBottomPosition, .gumPosition"), { x: 4, y: -1 }, "<")
            .to(targets(".jawPosition, .mouthPosition"), { x: 8, y: -2 }, "<")
            .to(targets(".headPosition"), { x: 2, y: -0.5 }, "<")
            .to(targets(".neckRotate"), { rotate: 4 }, "<")
            .to(targets(".teethBottom"), { x: 0, y: 15, ease: "back.out(1.7)" }, "<")
            .to(targets(".tongue"), { x: -10, y: 10, ease: "back.out(1.7)" }, "<")
            .to(targets(".eyebrowLeft, .eyebrowRight"), { y: -15 }, "<")
            .to(targets(".head"), { keyframes: AVATAR_IDLE_WHISTLE_KEYFRAMES.head }, "<")
            .to(targets(".mouth"), { keyframes: AVATAR_IDLE_WHISTLE_KEYFRAMES.mouth }, "<")
            .to(targets(".jaw"), { keyframes: AVATAR_IDLE_WHISTLE_KEYFRAMES.jaw }, "<")
            .to(targets(".mouth, .jaw"), {
                x: -50,
                scaleX: 0.1,
                scaleY: 0.5,
                duration: 0.5,
                ease: "back.out(1.7)",
            })
            .to(targets(".mouth, .jaw"), { y: 20, duration: 1 })
            .to(targets(".mouth"), {
                x: 25,
                y: 50,
                scaleX: 1.3,
                scaleY: 1,
                ease: "back.out(1.7)",
            })
            .to(targets(".jaw"), {
                x: 25,
                y: 30,
                scaleX: 1.3,
                scaleY: 1.4,
                ease: "back.out(1.7)",
            }, "<")
            .to(targets(".teethBottom"), { y: 25, ease: "back.out(1.7)" }, "<")
            .to(targets(".tongue"), { x: 0, y: 20, ease: "back.out(1.7)" }, "<")
            .to(targets(".head"), { y: 10, ease: "back.out(1.7)" }, "<")
            .to(targets(".head, .neck"), { x: 0, y: 0, rotate: 0, delay: 1.2, duration: 0.45 })
            .to(targets(TRACKING_SELECTOR), { x: 0, y: 0 }, "<")
            .to(targets(".hairLeftPosition, .hairRightPosition"), { scaleX: 1 }, "<")
            .to(targets(".neckRotate"), { rotate: 0 }, "<")
            .to(targets(".eyebrowLeft, .eyebrowRight"), { y: 0 }, "<")
            .to(targets(".mouth, .jaw"), { x: 0, y: 0, scaleX: 0.5, scaleY: 0.5 }, "<")
            .to(targets(".teethBottom, .tongue"), { x: 0, y: 0 }, "<")
    })

    const startSurprise = contextSafe((metrics: PointerMetrics) => {
        killMainTimelines()
        stopBlink()
        preserveFinalTrackingOffsets()

        const reaction = getSurpriseReaction(metrics)

        timelines.surprise = gsap.timeline({
            defaults: { ease: "power2.inOut", duration: 0.3 },
            repeat: AVATAR_TIMELINE_REPEAT.surprise,
            onComplete: contextSafe(() => {
                phase = nextAvatarMotionPhase(phase, "SURPRISE_COMPLETE")
                if (phase === "idle") startIdle()
            }),
        })
            .to(targets(".eyeRight, .eyeLeft"), { scaleX: 1.25, scaleY: 1.25, duration: 0.08 })
            .to(targets(".eyelidTopBlink, .eyelidBottomBlink"), { y: 0, duration: 0.08 }, "<")
            .to(targets(".pupil"), { scaleX: 0.55, scaleY: 0.55, ease: "elastic.out(1, .2)" }, "<")
            .to(targets(".eyebrowLeft, .eyebrowRight"), { y: -10, duration: 0.08 }, "<")
            .to(targets(".eyelidTop"), { y: -10, duration: 0.08 }, "<")
            .to(targets(".nose"), { scaleY: 1 }, "<")
            .to(targets(".mouth, .jaw"), { scaleX: 1, scaleY: 1.5, x: 10, ease: "elastic.out(1, .2)" }, "<")
            .to(targets(".neck"), { rotate: reaction.neckRotate, y: reaction.neckY, duration: 0.1 }, "<")
            .to(targets(".teethBottom, .tongue"), { y: 25, x: 14, ease: "elastic.out(2, .2)" }, "<")
            .to(targets(".head"), { x: reaction.headX, y: reaction.headY, rotate: 0, ease: "elastic.out(1, .2)" }, "<")
            .to(targets(".eyeRight, .eyeLeft, .pupil"), { scaleX: 1, scaleY: 1, delay: 0.8, duration: 0.24 })
            .to(targets(".eyebrowLeft, .eyebrowRight, .eyelidTop"), { y: 0, duration: 0.24 }, "<")
            .to(targets(".mouth, .jaw"), { x: 0, y: 0, scaleX: 0.5, scaleY: 0.5, duration: 0.24 }, "<")
            .to(targets(".head, .neck"), { x: 0, y: 0, rotate: 0, duration: 0.24 }, "<")
            .to(targets(".teethBottom, .tongue"), { x: 0, y: 0, duration: 0.24 }, "<")
    })

    const getTrackingMetrics = (
        clientX: number,
        clientY: number,
        box: DOMRect,
    ): PointerMetrics => {
        const centerX = box.left + box.width / 2
        const centerY = box.top + box.height / 2 - 60
        const dx = gsap.utils.clamp(-20, 20, (clientX - centerX) / 16)
        const dy = gsap.utils.clamp(-20, 20, (clientY - centerY) / 16)

        return { clientX, clientY, dx, dy }
    }

    const updateCreatureTracking = (
        localX: number,
        localY: number,
        box: DOMRect,
    ) => {
        setCursorX(localX)
        setCursorY(localY)

        if (phase === "reduced") return

        if (phase !== "tracking") {
            phase = nextAvatarMotionPhase(phase, "POINTER_MOVE")
            killMainTimelines()
            resetExpression()
            startBlink()
        }

        const clientX = box.left + localX
        const clientY = box.top + localY
        lastPointerMetrics = getTrackingMetrics(clientX, clientY, box)
        setEarLeftTop(lastPointerMetrics.dx < -7 ? false : lastPointerMetrics.dx > 7 ? true : null)
        tracker.update(lastPointerMetrics)
        updateLampInteraction({ x: clientX, y: clientY })
        updateNoseInteraction({ x: clientX, y: clientY })
    }

    const stopAutonomousFly = () => {
        autonomousFlyActive = false
        autonomousFlyTween?.kill()
        autonomousFlyPause?.kill()
        autonomousFlyTween = null
        autonomousFlyPause = null
    }

    const moveAutonomousFly = () => {
        if (!autonomousFlyActive || creatureMode !== "fly" || reduceMotion) return

        const box = boxAvatar.getBoundingClientRect()
        const avatarBounds = avatar.getBoundingClientRect()
        const bounds = getAutonomousFlyBounds(box, avatarBounds)
        const waypoint = getAutonomousFlyWaypoint(bounds, {
            x: Math.random(),
            y: Math.random(),
        })
        const duration = getAutonomousFlyTravelDuration(autonomousPosition, waypoint)

        autonomousFlyTween?.kill()
        autonomousFlyTween = gsap.to(autonomousPosition, {
            x: waypoint.x,
            y: waypoint.y,
            duration,
            ease: "sine.inOut",
            overwrite: true,
            onUpdate: () => {
                updateCreatureTracking(autonomousPosition.x, autonomousPosition.y, box)
            },
            onComplete: () => {
                autonomousFlyTween = null
                if (!autonomousFlyActive || creatureMode !== "fly") return
                autonomousFlyPause = gsap.delayedCall(
                    getAutonomousFlyPauseDuration(Math.random()),
                    moveAutonomousFly,
                )
            },
        })
    }

    const startAutonomousFly = () => {
        document.documentElement.classList.remove(FIREFLY_CURSOR_CLASS)

        if (autonomousFlyActive) {
            setFireflyVisible(true)
            return
        }

        const box = boxAvatar.getBoundingClientRect()
        const avatarBounds = avatar.getBoundingClientRect()
        const bounds = getAutonomousFlyBounds(box, avatarBounds)
        const currentX = Number.parseFloat(String(gsap.getProperty(lookAt, "left")))
        const currentY = Number.parseFloat(String(gsap.getProperty(lookAt, "top")))
        const fallback = getAutonomousFlyWaypoint(bounds, { x: 0.68, y: 0.28 })

        autonomousPosition.x = fireflyVisible && Number.isFinite(currentX) ? currentX : fallback.x
        autonomousPosition.y = fireflyVisible && Number.isFinite(currentY) ? currentY : fallback.y
        autonomousFlyActive = true
        pointerInside = false
        setFireflyVisible(true)
        updateCreatureTracking(autonomousPosition.x, autonomousPosition.y, box)

        if (!reduceMotion) moveAutonomousFly()
    }

    const handlePointerMove = contextSafe((event: PointerEvent) => {
        if (event.pointerType === "touch" || phase === "reduced") return
        if (creatureMode === "fly") {
            document.documentElement.classList.remove(FIREFLY_CURSOR_CLASS)
            return
        }

        const box = boxAvatar.getBoundingClientRect()
        const interactionBounds = getAvatarInteractionBounds(
            box,
            navigation?.getBoundingClientRect().bottom,
        )
        const isInside = event.clientX >= interactionBounds.left
            && event.clientX <= interactionBounds.right
            && event.clientY >= interactionBounds.top
            && event.clientY <= interactionBounds.bottom

        if (!isInside) {
            if (pointerInside) handlePointerLeave()
            return
        }

        pointerInside = true
        const localX = event.clientX - box.left
        const localY = event.clientY - box.top
        setCursorX(localX)
        setCursorY(localY)
        updateLampInteraction({ x: event.clientX, y: event.clientY })

        if (phase !== "tracking") {
            phase = nextAvatarMotionPhase(phase, "POINTER_MOVE")
            killMainTimelines()
            resetExpression()
            startBlink()
        }

        setFireflyVisible(shouldShowFirefly(phase, pointerInside))
        const avatarBounds = avatar.getBoundingClientRect()
        const lightIntensity = getAvatarLightIntensity(
            { x: event.clientX, y: event.clientY },
            avatarBounds,
        )
        pointerSvgPoint.x = event.clientX
        pointerSvgPoint.y = event.clientY
        const screenMatrix = avatar.getScreenCTM()
        const lightPoint = screenMatrix
            ? pointerSvgPoint.matrixTransform(screenMatrix.inverse())
            : {
                x: ((event.clientX - avatarBounds.left) / avatarBounds.width) * 500,
                y: ((event.clientY - avatarBounds.top) / avatarBounds.height) * 600,
            }

        updateFireflyScene(localX, localY, lightPoint.x, lightPoint.y, lightIntensity)
        updateNoseInteraction({ x: event.clientX, y: event.clientY })

        lastPointerMetrics = getTrackingMetrics(event.clientX, event.clientY, box)

        setEarLeftTop(lastPointerMetrics.dx < -7 ? false : lastPointerMetrics.dx > 7 ? true : null)
        tracker.update(lastPointerMetrics)
    })

    const handlePointerLeave = contextSafe(() => {
        pointerInside = false
        noseCollisionArmed = true
        setFireflyVisible(false)
        if (phase !== "tracking") {
            keepAvatarDark()
            return
        }

        phase = nextAvatarMotionPhase(phase, "POINTER_LEAVE")
        startSurprise(lastPointerMetrics)
    })

    if (!reduceMotion) {
        window.addEventListener("pointermove", handlePointerMove)
        startBlink()

        const enterTimeline = gsap.timeline()
        timelines.enter = enterTimeline
        gsap.set(avatar, { y: 350 })
        enterTimeline.to(avatar, {
            y: 0,
            duration: 1,
            delay: 0.35,
            ease: "elastic.out(1, 1)",
            onComplete: contextSafe(() => {
                const nextPhase = nextAvatarMotionPhase(phase, "ENTER_COMPLETE")
                phase = nextPhase
                if (nextPhase === "idle") startIdle()
            }),
        })

        timelines.ambient = gsap.timeline({ repeat: -1, yoyo: true })
            .to(targets(".noseBreathe"), { scaleX: 1.05, scaleY: 0.95, duration: 2, ease: "power2.inOut" })
    }

    if (creatureMode === "fly") startAutonomousFly()

    return () => {
        window.removeEventListener("pointermove", handlePointerMove)
        stopAutonomousFly()
        if (activationTimer !== null) window.clearTimeout(activationTimer)
        activationTimer = null
        lampSwingTimeline?.kill()
        lampFlickerTimeline?.kill()
        noseSwingTimeline?.kill()
        sceneControllerRef.current = null
        setFireflyVisible(false)
        document.documentElement.classList.remove(FIREFLY_CURSOR_CLASS)
        gsap.set(avatar, { filter: "none" })
        if (avatarShadowLayer) gsap.set(avatarShadowLayer, { opacity: getAvatarLightingState(0).shadowOpacity })
        gsap.set(avatarLightLayers, { opacity: 0 })
        if (avatarLampEdges) gsap.set(avatarLampEdges, { opacity: 0 })
        if (fireflyAura) gsap.set(fireflyAura, { opacity: 0.28, scale: 0.8 })
        stopBlink()
        Object.values(timelines).forEach((timeline) => timeline?.kill())
        gsap.killTweensOf(targets(TRACKING_SELECTOR))
    }
}

function createPointerTracker({
    quick,
    targets,
}: {
    quick: QuickFactory
    targets: gsap.utils.SelectorFunc
}): PointerTracker {
    const pupils: PupilTracker[] = targets<Element>(".eyePosition").flatMap((eye) => {
        const pupil = eye.nextElementSibling
        if (!pupil) return []

        return [{
            eye,
            pupil,
            x: quick(pupil, "x", 0.22),
            y: quick(pupil, "y", 0.22),
        }]
    })
    const to = {
        hairTopX: quick(".hairTopPosition", "x"),
        hairTopY: quick(".hairTopPosition", "y"),
        hairSidesY: quick(".hairLeftPosition, .hairRightPosition", "y"),
        hairLeftX: quick(".hairLeftPosition", "x"),
        hairLeftScale: quick(".hairLeftPosition", "scaleX"),
        hairRightX: quick(".hairRightPosition", "x"),
        hairRightScale: quick(".hairRightPosition", "scaleX"),
        earsY: quick(".earLeftPosition, .earRightPosition", "y"),
        earLeftX: quick(".earLeftPosition", "x"),
        earRightX: quick(".earRightPosition", "x"),
        noseX: quick(".nosePosition", "x"),
        noseY: quick(".nosePosition", "y"),
        glassesX: quick(".glassesPosition", "x"),
        glassesY: quick(".glassesPosition", "y"),
        eyebrowLeftY: quick(".eyebrowLeftPosition", "y"),
        eyebrowRightY: quick(".eyebrowRightPosition", "y"),
        eyelidTopY: quick(".eyelidTopPosition", "y"),
        eyelidBottomY: quick(".eyelidBottomPosition", "y"),
        eyesX: quick(".eyesPosition", "x"),
        eyesY: quick(".eyesPosition", "y"),
        teethX: quick(".teethTopPosition, .teethBottomPosition, .gumPosition", "x"),
        teethY: quick(".teethTopPosition, .teethBottomPosition, .gumPosition", "y"),
        jawX: quick(".jawPosition, .mouthPosition", "x"),
        jawY: quick(".jawPosition, .mouthPosition", "y"),
        headX: quick(".headPosition", "x", 0.38),
        headY: quick(".headPosition", "y", 0.38),
        neckRotate: quick(".neckRotate", "rotation", 0.38),
    }

    return {
        update({ clientX, clientY, dx, dy }: PointerMetrics) {
            pupils.forEach(({ eye, pupil, x, y }) => {
                const rect = eye.getBoundingClientRect()
                let pupilX = (clientX - (rect.left + rect.width / 2)) / 20
                let pupilY = (clientY - (rect.top + rect.height / 2)) / 20
                const radius = Math.max(0, rect.width / 2 - pupil.clientWidth / 2)
                const distance = Math.hypot(pupilX, pupilY)

                if (distance > radius) {
                    const angle = Math.atan2(pupilY, pupilX)
                    pupilX = Math.cos(angle) * radius
                    pupilY = Math.sin(angle) * radius
                }
                x(pupilX)
                y(pupilY)
            })

            to.hairTopX(dx / 2)
            to.hairTopY(dy / 3)
            to.hairSidesY(-dy / 4)
            to.hairLeftX(dx >= 0 ? dx / 3 : 0)
            to.hairLeftScale(1 + dx / 60)
            to.hairRightX(dx <= 0 ? dx / 3 : 0)
            to.hairRightScale(1 - dx / 60)
            to.earsY(-dy / 4)
            to.earLeftX(dx >= 0 ? dx / 3 : -dx / 1.5)
            to.earRightX(dx <= 0 ? dx / 3 : -dx / 1.5)
            to.noseX(dx)
            to.noseY(dy)
            to.glassesX(dx / 1.2)
            to.glassesY(dy / 1.2)
            to.eyebrowLeftY(dy / 2)
            to.eyebrowRightY(dy < 0 ? dy : dy / 1.5)
            to.eyelidTopY(dy / 2)
            to.eyelidBottomY(dy / 5)
            to.eyesX(dx / 2)
            to.eyesY(dy / 2)
            to.teethX(dx / 4)
            to.teethY(dy / 4)
            to.jawX(dx / 2)
            to.jawY(dy / 2)
            to.headX(dx / 10)
            to.headY(dy / 10)
            to.neckRotate(dx / 5)
        },
    }
}

function setPose({
    avatar,
    targets,
}: {
    avatar: SVGSVGElement
    targets: gsap.utils.SelectorFunc
}): void {
    targets<Element>(".eyePosition").forEach((eye) => {
        const pupil = eye.nextElementSibling
        if (pupil) gsap.set(pupil, { transformOrigin: "50% 50%", x: 0, y: 0 })
    })

    gsap.set(targets(".eyeRight, .eyeLeft, .pupil, .head"), { transformOrigin: "50% 50%" })
    gsap.set(targets(".jaw, .mouth"), { transformOrigin: "100% 0%", x: 0, y: 0, scaleX: 0.5, scaleY: 0.5 })
    gsap.set(targets(".jawPosition, .mouthPosition"), { transformOrigin: "100% 0%", x: 0, y: 0 })
    gsap.set(targets(".neck, .neckRotate, .body"), { transformOrigin: "50% 90%", rotate: 0 })
    gsap.set(targets(".hairLeft, .hairLeftPosition"), { transformOrigin: "left" })
    gsap.set(targets(".hairRight, .hairRightPosition"), { transformOrigin: "right" })
    gsap.set(targets(".nose, .nosePosition"), { transformOrigin: "50% 0%" })
    gsap.set(avatar, { visibility: "visible" })
}
