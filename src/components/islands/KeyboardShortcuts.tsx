"use client"

import { useEffect, useRef, useState } from "react"
import { HelpCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

const shortcutTimeoutMs = 1200
const toastTimeoutMs = 1600

const shortcuts = [
  { keys: "G H", label: "Go to Home", path: "/" },
  { keys: "G A", label: "Go to About", path: "/about" },
  { keys: "G P", label: "Go to Projects", path: "/project" },
  { keys: "G C", label: "Go to Contact", path: "/contact" },
  { keys: "G U", label: "Go to Uses", path: "/uses" },
  { keys: "G G", label: "Go to Guestbook", path: "/guestbook" },
] as const

const shortcutRoutes: Record<string, string> = shortcuts.reduce(
  (routes, shortcut) => {
    const key = shortcut.keys.split(" ")[1]?.toLowerCase()
    if (key) routes[key] = shortcut.path
    return routes
  },
  {} as Record<string, string>
)

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false
  if (target instanceof HTMLInputElement) return true
  if (target instanceof HTMLTextAreaElement) return true
  if (target instanceof HTMLSelectElement) return true
  return target.isContentEditable
}

export function KeyboardShortcuts() {
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isAwaitingCombo, setIsAwaitingCombo] = useState(false)
  const [toastLabel, setToastLabel] = useState<string | null>(null)
  const comboTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(
    null
  )
  const toastTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(
    null
  )

  useEffect(() => {
    const clearComboTimer = () => {
      if (!comboTimerRef.current) return
      window.clearTimeout(comboTimerRef.current)
      comboTimerRef.current = null
    }

    const clearToastTimer = () => {
      if (!toastTimerRef.current) return
      window.clearTimeout(toastTimerRef.current)
      toastTimerRef.current = null
    }

    const showToast = (label: string) => {
      clearToastTimer()
      setToastLabel(label)
      toastTimerRef.current = window.setTimeout(() => {
        setToastLabel(null)
        toastTimerRef.current = null
      }, toastTimeoutMs)
    }

    const closeComboMode = () => {
      clearComboTimer()
      setIsAwaitingCombo(false)
    }

    const openComboMode = () => {
      clearComboTimer()
      setIsAwaitingCombo(true)
      showToast("Shortcut mode")
      comboTimerRef.current = window.setTimeout(() => {
        setIsAwaitingCombo(false)
        comboTimerRef.current = null
      }, shortcutTimeoutMs)
    }

    const navigateTo = (path: string) => {
      window.location.assign(path)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return

      const key = event.key.toLowerCase()

      if (event.key === "?") {
        event.preventDefault()
        closeComboMode()
        setIsHelpOpen((currentValue) => !currentValue)
        return
      }

      if (event.key === "Escape") {
        closeComboMode()
        setIsHelpOpen(false)
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) return

      if (!isAwaitingCombo && key === "g") {
        event.preventDefault()
        openComboMode()
        return
      }

      if (!isAwaitingCombo) return

      const targetPath = shortcutRoutes[key]
      if (!targetPath) {
        closeComboMode()
        return
      }

      event.preventDefault()
      closeComboMode()
      showToast(`Opening ${targetPath}`)
      navigateTo(targetPath)
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      clearComboTimer()
      clearToastTimer()
    }
  }, [isAwaitingCombo])

  return (
    <>
      {toastLabel && (
        <div className="animate-in fade-in slide-in-from-bottom-4 fixed right-4 bottom-4 z-50">
          <div className="font-head flex items-center gap-3 rounded-sm border-[3px] border-black bg-[#C4A1FF] px-4 py-3 shadow-brutal">
            <div className="rounded border-2 border-black bg-white px-2 py-0.5 text-sm font-black shadow-brutal-sm">
              G
            </div>
            <span className="text-sm font-black uppercase">{toastLabel}</span>
          </div>
        </div>
      )}

      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Close shortcuts dialog"
            onClick={() => setIsHelpOpen(false)}
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="keyboard-shortcuts-title"
            aria-describedby="keyboard-shortcuts-description"
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border-[3px] border-black bg-white shadow-brutal"
          >
            <div className="flex items-center justify-between border-b-[3px] border-black bg-[#C4A1FF] px-5 py-4">
              <h2
                id="keyboard-shortcuts-title"
                className="font-head flex items-center gap-2 text-lg font-black text-black uppercase"
              >
                <HelpCircle className="h-5 w-5" />
                Keyboard Shortcuts
              </h2>
              <button
                type="button"
                className="rounded-sm border-2 border-black bg-white p-1.5 text-black shadow-brutal-sm transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                aria-label="Close shortcuts dialog"
                onClick={() => setIsHelpOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p
              id="keyboard-shortcuts-description"
              className="px-5 pt-4 text-sm font-semibold text-muted-foreground"
            >
              Press G followed by a destination key. Press Esc to close this
              panel.
            </p>

            <div className="grid gap-2 p-5">
              {shortcuts.map((shortcut) => (
                <a
                  key={shortcut.keys}
                  href={shortcut.path}
                  className="flex items-center justify-between gap-4 rounded-sm border-2 border-black bg-[#F4F4F5] px-4 py-3 font-bold shadow-brutal-sm transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-white hover:shadow-none"
                >
                  <span>{shortcut.label}</span>
                  <span className="font-head flex items-center gap-1 text-xs font-black uppercase">
                    {shortcut.keys.split(" ").map((key, index) => (
                      <kbd
                        key={`${shortcut.keys}-${key}-${index}`}
                        className={cn(
                          "rounded-sm border-2 border-black bg-white px-2 py-1 shadow-[1px_1px_0px_rgba(0,0,0,1)]",
                          key === "G" && "bg-[#C4A1FF]"
                        )}
                      >
                        {key}
                      </kbd>
                    ))}
                  </span>
                </a>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  )
}
