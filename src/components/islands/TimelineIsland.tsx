import { GraduationCap } from "lucide-react"
import { Accordion } from "@/components/retroui/Accordion"
import { education } from "@/data/education"

export function TimelineIsland() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden pt-3 pb-8">
      <div className="relative z-10 mb-6 flex items-center gap-3 px-2 lg:px-4">
        <div className="rounded-sm border-2 border-black bg-black p-3 text-white">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-head text-2xl leading-none font-black uppercase">
            Journey / Experience
          </h3>
          <p className="mt-1 text-sm font-bold tracking-wider text-muted-foreground uppercase">
            Academic & Beyond
          </p>
        </div>
      </div>

      <Accordion
        type="single"
        collapsible
        className="relative z-10 flex w-full flex-grow flex-col gap-4 px-2 lg:px-4"
      >
        {education.map((item, index) => (
          <Accordion.Item
            key={index}
            value={`item-${index}`}
            className="border-4 border-black"
          >
            <Accordion.Header className="border-b-0 bg-[#C4A1FF] text-xl font-black uppercase transition-colors hover:bg-[#C4A1FF]/90 data-[state=open]:border-b-4 data-[state=open]:border-black md:text-2xl">
              <div className="flex flex-col items-start gap-1 text-left">
                <span>{item.degree}</span>
                <span className="rounded bg-black px-2 py-0.5 text-xs tracking-widest text-white shadow-[2px_2px_0px_rgba(230,166,39,1)]">
                  {item.date}
                </span>
              </div>
            </Accordion.Header>
            <Accordion.Content className="bg-[#F4F4F5] p-5 text-base font-medium text-black">
              <p className="mb-2 text-lg font-black">{item.school}</p>
              {item.description && (
                <p className="leading-relaxed font-semibold text-muted-foreground">
                  {item.description}
                </p>
              )}
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}
