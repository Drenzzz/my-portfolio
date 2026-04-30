"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowUpRight, ChevronDown, FileText, ImageIcon, X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "@/lib/utils"

export interface CertificatePreviewItem {
  slug: string
  title: string
  issuer: string
  dateLabel: string
  category: string
  assetType: "image" | "pdf" | "external"
  asset?: string
  credentialUrl?: string
}

interface Props {
  items: CertificatePreviewItem[]
  initialVisibleCount?: number
  toggleLabels?: {
    expand: string
    collapse: string
  }
}

const assetLabels = {
  image: "Image",
  pdf: "PDF",
  external: "External",
} as const

export function CertificatePreview({
  items,
  initialVisibleCount,
  toggleLabels = {
    expand: "Show All Certificates",
    collapse: "Show Less",
  },
}: Props) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const canToggle = Boolean(
    initialVisibleCount && items.length > initialVisibleCount
  )
  const visibleItems =
    canToggle && !isExpanded ? items.slice(0, initialVisibleCount) : items

  const selectedItem = useMemo(
    () => items.find((item) => item.slug === selectedSlug) ?? null,
    [items, selectedSlug]
  )

  useEffect(() => {
    if (!selectedItem) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedSlug(null)
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [selectedItem])

  return (
    <>
      <motion.div
        layout
        className="flex flex-wrap justify-center gap-4"
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {visibleItems.map((item) => (
            <motion.div
              key={item.slug}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.96, rotate: -3 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="w-full md:max-w-[calc(50%-0.5rem)] md:flex-[0_1_calc(50%-0.5rem)] xl:max-w-[calc((100%-2rem)/3)] xl:flex-[0_1_calc((100%-2rem)/3)]"
            >
              <article
                className="group flex min-h-[320px] flex-col overflow-hidden rounded-xl border-[3px] border-black bg-white shadow-brutal transition-all hover:-translate-y-1 hover:shadow-none"
              >
                <button
                  type="button"
                  onClick={() => setSelectedSlug(item.slug)}
                  className="flex flex-1 flex-col text-left"
                >
                  <div className="flex h-52 items-center justify-center border-b-[3px] border-black bg-[#F4F4F5] p-3">
                    {item.assetType === "image" && item.asset ? (
                      <img
                        src={item.asset}
                        alt={item.title}
                        className="h-full w-full rounded-sm border-2 border-black object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-sm border-2 border-dashed border-black bg-white p-4">
                        {item.assetType === "pdf" ? (
                          <FileText className="h-10 w-10" />
                        ) : (
                          <ImageIcon className="h-10 w-10" />
                        )}
                        <span className="font-head text-sm font-black uppercase">
                          {assetLabels[item.assetType]} Preview
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-head text-[11px] font-black tracking-widest text-muted-foreground uppercase">
                          {item.issuer}
                        </p>
                        <h3 className="font-head mt-1 text-xl leading-tight font-black text-black">
                          {item.title}
                        </h3>
                      </div>

                      <span
                        className={cn(
                          "rounded-full border-2 border-black px-2.5 py-1 text-[10px] font-black uppercase shadow-brutal-sm",
                          item.assetType === "pdf"
                            ? "bg-[#E7F193]"
                            : "bg-[#C4A1FF]"
                        )}
                      >
                        {assetLabels[item.assetType]}
                      </span>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3 border-t-2 border-black/10 pt-3 text-xs font-bold uppercase">
                      <span className="text-muted-foreground">
                        {item.category}
                      </span>
                      <span className="text-muted-foreground">
                        {item.dateLabel}
                      </span>
                    </div>
                  </div>
                </button>
              </article>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {canToggle && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setIsExpanded((currentValue) => !currentValue)}
            className="inline-flex items-center gap-2 rounded-sm border-2 border-black bg-[#C4A1FF] px-4 py-3 text-xs font-black text-black uppercase shadow-brutal-sm transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
          >
            {isExpanded ? toggleLabels.collapse : toggleLabels.expand}
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isExpanded && "rotate-180"
              )}
            />
          </button>
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Close certificate preview"
            onClick={() => setSelectedSlug(null)}
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="certificate-preview-title"
            className="relative z-10 flex h-[min(90vh,920px)] w-full max-w-6xl flex-col overflow-hidden rounded-xl border-[3px] border-black bg-[#111111] text-white shadow-[12px_12px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex items-start justify-between gap-4 border-b-[3px] border-black bg-[#1B1B1B] px-5 py-4">
              <div>
                <p className="text-xs font-black tracking-widest text-white/60 uppercase">
                  {selectedItem.issuer} • {selectedItem.category} •{" "}
                  {selectedItem.dateLabel}
                </p>
                <h2
                  id="certificate-preview-title"
                  className="font-head mt-1 text-2xl font-black text-white"
                >
                  {selectedItem.title}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {selectedItem.credentialUrl && (
                  <a
                    href={selectedItem.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-sm border-2 border-black bg-[#C4A1FF] px-3 py-2 text-xs font-black text-black uppercase shadow-brutal-sm transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                  >
                    Verify
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                )}
                {selectedItem.asset && (
                  <a
                    href={selectedItem.asset}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-sm border-2 border-white/20 bg-white/10 px-3 py-2 text-xs font-black text-white uppercase"
                  >
                    Open File
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedSlug(null)}
                  className="rounded-sm border-2 border-white/20 bg-white/10 p-2 text-white"
                  aria-label="Close certificate preview"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-[#1B1B1B] p-4 md:p-5">
              {selectedItem.assetType === "image" && selectedItem.asset ? (
                <div className="flex min-h-full items-center justify-center">
                  <img
                    src={selectedItem.asset}
                    alt={selectedItem.title}
                    className="max-h-full w-auto max-w-full rounded-sm border-2 border-white/10 bg-white object-contain"
                  />
                </div>
              ) : selectedItem.assetType === "pdf" && selectedItem.asset ? (
                <iframe
                  src={selectedItem.asset}
                  title={selectedItem.title}
                  className="h-full min-h-[70vh] w-full rounded-sm border-2 border-white/10 bg-white"
                />
              ) : (
                <div className="flex h-full min-h-[50vh] flex-col items-center justify-center gap-4 rounded-sm border-2 border-dashed border-white/20 bg-white/5 p-6 text-center">
                  <ImageIcon className="h-12 w-12 text-white/60" />
                  <p className="max-w-md text-sm font-semibold text-white/70">
                    This certificate does not have a local preview file yet.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  )
}
