import { animate, inView, stagger } from "motion"

export const NEO_MOTION_EASING = [0.22, 1, 0.36, 1] as const

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

type MotionTargetInput = string | Element | Element[] | NodeListOf<Element>

const resolveMotionTargets = (targets: MotionTargetInput) => {
  if (typeof targets === "string") {
    return Array.from(document.querySelectorAll(targets))
  }

  if (targets instanceof Element) {
    return [targets]
  }

  return Array.from(targets)
}

export const shouldReduceMotion = () => {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

export const revealMotionTargets = (
  targets: MotionTargetInput,
  options?: {
    delay?: number
    duration?: number
    offsetY?: number
    offsetX?: number
    scale?: number
  }
) => {
  const {
    delay = 0,
    duration = 0.45,
    offsetY = 18,
    offsetX = 0,
    scale = 1,
  } = options ?? {}
  const resolvedTargets = resolveMotionTargets(targets)

  if (!resolvedTargets.length) {
    return
  }

  if (shouldReduceMotion()) {
    resolvedTargets.forEach((target) => {
      animate(
        target,
        { opacity: 1, x: 0, y: 0, scale: 1 } as Record<string, number>,
        { duration: 0.01 }
      )
    })
    return
  }

  resolvedTargets.forEach((target) => {
    animate(
      target,
      {
        opacity: [0, 1],
        x: [offsetX, 0],
        y: [offsetY, 0],
        scale: [scale, 1],
      } as Record<string, number | number[]>,
      {
        delay,
        duration,
        ease: NEO_MOTION_EASING,
      }
    )
  })
}

export const revealMotionGroup = (
  targets: MotionTargetInput,
  options?: {
    delay?: number
    duration?: number
    staggerDelay?: number
    offsetY?: number
    offsetX?: number
    scale?: number
  }
) => {
  const {
    delay = 0,
    duration = 0.4,
    staggerDelay = 0.08,
    offsetY = 18,
    offsetX = 0,
    scale = 1,
  } = options ?? {}
  const resolvedTargets = resolveMotionTargets(targets)

  if (!resolvedTargets.length) {
    return
  }

  if (shouldReduceMotion()) {
    resolvedTargets.forEach((target) => {
      animate(
        target,
        { opacity: 1, x: 0, y: 0, scale: 1 } as Record<string, number>,
        { duration: 0.01 }
      )
    })
    return
  }

  const createDelay = stagger(staggerDelay, { startDelay: delay })

  resolvedTargets.forEach((target, index) => {
    animate(
      target,
      {
        opacity: [0, 1],
        x: [offsetX, 0],
        y: [offsetY, 0],
        scale: [scale, 1],
      } as Record<string, number | number[]>,
      {
        delay: createDelay(index, resolvedTargets.length),
        duration,
        ease: NEO_MOTION_EASING,
      }
    )
  })
}

export const bindInViewReveal = (
  container: Element,
  selector: string,
  options?: {
    amount?: number
    delay?: number
    duration?: number
    staggerDelay?: number
    offsetY?: number
    offsetX?: number
    scale?: number
  }
) => {
  const targets = container.querySelectorAll(selector)
  if (!targets.length) {
    return () => {}
  }

  if (shouldReduceMotion()) {
    targets.forEach((target) => target.classList.add("is-visible"))
    return () => {}
  }

  const stop = inView(
    container,
    () => {
      targets.forEach((target) => target.classList.add("is-visible"))
      revealMotionGroup(targets, options)
      stop()
      return () => {}
    },
    { amount: options?.amount ?? 0.35 }
  )

  return () => stop()
}
