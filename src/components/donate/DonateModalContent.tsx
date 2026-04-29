"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, Copy, ExternalLink, Globe, Wallet } from "lucide-react"
import { donationMethods } from "@/data/donation"
import type { InternationalDonation, LocalDonation } from "@/types"

const getQrImageSrc = (imageKey?: string) => {
  if (!imageKey) return undefined

  return `/images/donations/${imageKey}-qr.png`
}

const copyToClipboard = async (value: string) => {
  await navigator.clipboard.writeText(value)
}

export function DonateModalContent() {
  const [selectedMethod, setSelectedMethod] = useState<LocalDonation | null>(null)

  const qrImageSrc = useMemo(
    () => getQrImageSrc(selectedMethod?.imageKey),
    [selectedMethod?.imageKey]
  )

  if (selectedMethod) {
    return (
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setSelectedMethod(null)}
            className="inline-flex items-center gap-2 rounded-sm border-2 border-black bg-white px-3 py-2 text-xs font-black uppercase shadow-brutal-sm transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <span className="rounded-full border-2 border-black bg-[#C4A1FF] px-3 py-1 text-[10px] font-black uppercase shadow-brutal-sm">
            {selectedMethod.type}
          </span>
        </div>

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-[4px] border-black bg-[#F4F4F5] p-3 shadow-brutal-sm">
            <img
              src={selectedMethod.icon}
              alt={selectedMethod.name}
              className="h-full w-full object-contain"
              loading="lazy"
            />
          </div>

          <div>
            <h3 className="font-head text-3xl font-black uppercase text-black">
              {selectedMethod.name}
            </h3>
            <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
              {selectedMethod.description || `Transfer via ${selectedMethod.name}`}
            </p>
          </div>
        </div>

        <div className="grid gap-5 border-t-4 border-dashed border-black/20 pt-6">
          {selectedMethod.number && (
            <div className="grid gap-2">
              <span className="w-fit self-center rounded border-2 border-black bg-black px-2 py-1 text-xs font-black tracking-widest text-[#C4A1FF] uppercase">
                Account Number
              </span>
              <button
                type="button"
                onClick={() => void copyToClipboard(selectedMethod.number!)}
                className="flex w-full items-center justify-between rounded-xl border-[4px] border-black bg-[#F4F4F5] px-4 py-4 text-left shadow-brutal-sm transition-colors hover:bg-[#C4A1FF]/20"
              >
                <code className="text-lg font-black tracking-widest text-black md:text-xl">
                  {selectedMethod.number}
                </code>
                <Copy className="h-6 w-6 text-black/70" />
              </button>
            </div>
          )}

          {selectedMethod.link && (
            <a
              href={selectedMethod.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-[4px] border-black bg-[#C4A1FF] px-6 py-4 text-lg font-black text-black shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
            >
              Pay via Link
              <ExternalLink className="h-5 w-5" />
            </a>
          )}

          {qrImageSrc && (
            <div className="mt-2 flex flex-col items-center gap-3">
              <span className="text-xs font-black tracking-widest text-black uppercase">
                Or Scan QR Code
              </span>
              <div className="w-fit rounded-2xl border-[4px] border-black bg-white p-4 shadow-brutal">
                <img
                  src={qrImageSrc}
                  alt={`QR Code for ${selectedMethod.name}`}
                  className="h-48 w-48 rounded-lg md:h-56 md:w-56"
                />
              </div>
            </div>
          )}
        </div>
      </section>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      <section>
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-sm border-2 border-black bg-black p-3 text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            <Wallet className="h-6 w-6" />
          </div>
          <h3 className="font-head text-2xl font-black tracking-tight uppercase">
            Domestik (Indonesia)
          </h3>
        </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {donationMethods.local.map((method) => (
            <button
              key={method.name}
              type="button"
              onClick={() => setSelectedMethod(method)}
              className="group flex h-full flex-col items-center justify-center rounded-2xl border-4 border-black bg-white p-6 text-center shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-2 hover:shadow-[10px_10px_0px_rgba(0,0,0,1)]"
            >
              <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-xl border-4 border-black bg-[#F4F4F5] p-3 transition-colors group-hover:bg-[#C4A1FF]">
                <img
                  src={method.icon}
                  alt={method.name}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              </div>
              <h4 className="font-head mb-2 text-xl font-black leading-tight text-black uppercase">
                {method.name}
              </h4>
              <p className="text-sm font-bold text-muted-foreground transition-colors group-hover:text-black">
                Tap for details
              </p>
            </button>
          ))}
        </div>
      </section>

      <div className="w-full border-t-4 border-black border-dashed" />

      <section>
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-sm border-2 border-black bg-[#C4A1FF] p-3 text-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            <Globe className="h-6 w-6" />
          </div>
          <h3 className="font-head text-2xl font-black tracking-tight uppercase">
            International Support
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {donationMethods.international.map((method) => (
            <InternationalSupportCard key={method.name} method={method} />
          ))}
        </div>
      </section>
    </div>
  )
}

function InternationalSupportCard({
  method,
}: {
  method: InternationalDonation
}) {
  return (
    <div className="group flex items-center justify-between rounded-xl border-4 border-black bg-white p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg border-2 border-black bg-[#F4F4F5] p-2">
            <img
              src={method.icon}
              alt={method.name}
              className="h-full w-full object-contain"
              loading="lazy"
            />
          </div>
        <span className="text-lg font-bold">{method.name}</span>
      </div>

      <a
        href={method.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-sm border-2 border-black bg-[#C4A1FF] px-3 py-1.5 text-xs font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-[#F4F4F5] hover:shadow-none"
      >
        Open
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  )
}
