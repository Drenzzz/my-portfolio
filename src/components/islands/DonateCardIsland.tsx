"use client"

import { Dialog } from "@/components/retroui/Dialog"
import { Copy, ExternalLink, X } from "lucide-react"
import type { LocalDonation } from "@/types"

interface Props {
  method: LocalDonation;
  qrImageSrc?: string;
}

export function DonateCardIsland({ method, qrImageSrc }: Props) {
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <button 
          className="w-full h-full p-6 bg-white border-4 border-black rounded-2xl shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-center group hover:-translate-y-2 hover:shadow-[10px_10px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
        >
          <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-xl border-4 border-black bg-[#F4F4F5] p-3 transition-colors group-hover:bg-[#C4A1FF]">
            <img src={method.icon} alt={method.name} className="h-full w-full object-contain" loading="lazy" />
          </div>
          
          <h4 className="font-head text-xl font-black mb-2 leading-tight uppercase text-black">{method.name}</h4>
          <p className="text-sm font-bold text-muted-foreground flex items-center gap-1 group-hover:text-black transition-colors">
            Tap for details
          </p>
        </button>
      </Dialog.Trigger>
      
      <Dialog.Content size="md" className="p-0 border-4 border-black rounded-2xl shadow-[12px_12px_0px_rgba(0,0,0,1)] bg-white overflow-hidden max-h-[90vh]">
        <Dialog.Header variant="default" className="border-b-4 border-black p-4 md:p-5 bg-[#C4A1FF] shrink-0" asChild>
          <div className="flex w-full items-center justify-between">
            <h3 className="font-head text-2xl font-black text-black uppercase tracking-tight">{method.name}</h3>
            <Dialog.Trigger asChild>
              <button className="p-1.5 bg-white border-2 border-black rounded-lg text-black hover:bg-black hover:text-white hover:-translate-y-0.5 shadow-brutal-sm hover:shadow-none transition-all">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Trigger>
          </div>
        </Dialog.Header>
        
        <div className="scrollbar-neo p-6 md:p-8 flex flex-col gap-6 items-center overflow-y-auto bg-white">
          <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-[4px] border-black bg-[#F4F4F5] p-3 shadow-brutal-sm">
            <img src={method.icon} alt={method.name} className="h-full w-full object-contain" loading="lazy" />
          </div>

          <div className="text-center w-full">
            {method.description ? (
              <p className="text-base font-bold text-muted-foreground leading-relaxed">{method.description}</p>
            ) : (
              <p className="text-base font-bold text-muted-foreground">Transfer via {method.name}</p>
            )}
          </div>

          <div className="w-full pt-6 border-t-4 border-dashed border-black/20 flex flex-col gap-5">
            {method.number && (
              <div className="w-full flex flex-col gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-[#C4A1FF] bg-black px-2 py-1 rounded w-fit self-center border-2 border-black">Account Number</span>
                <div 
                  className="w-full bg-[#F4F4F5] border-4 border-black rounded-xl px-4 py-4 flex items-center justify-between group/copy relative cursor-pointer hover:bg-[#C4A1FF]/20 transition-colors shadow-brutal-sm" 
                  onClick={() => navigator.clipboard.writeText(method.number!)}
                >
                  <code className="text-lg md:text-xl font-black text-black tracking-widest">{method.number}</code>
                  <Copy className="w-6 h-6 text-black opacity-60 group-hover/copy:opacity-100 transition-opacity" />
                </div>
              </div>
            )}
            
            {method.link && (
              <a href={method.link} target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#C4A1FF] border-[4px] border-black rounded-xl font-black text-lg text-black shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all decoration-transparent">
                Pay via Link <ExternalLink className="w-5 h-5" />
              </a>
            )}

            {qrImageSrc && (
              <div className="w-full mt-2 flex flex-col items-center">
                <span className="text-xs font-black uppercase tracking-widest mb-3 text-black">Or Scan QR Code</span>
                <div className="p-4 bg-white border-[4px] border-black rounded-2xl shadow-brutal w-fit group/qr">
                  <img src={qrImageSrc} alt={`QR Code for ${method.name}`} className="w-48 h-48 md:w-56 md:h-56 rounded-lg group-hover/qr:scale-[1.02] transition-transform" />
                </div>
              </div>
            )}
          </div>
        </div>
      </Dialog.Content>
    </Dialog>
  )
}
