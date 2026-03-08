import { Calendar, GraduationCap } from "lucide-react"
import { Accordion } from "@/components/retroui/Accordion"
import { education } from "@/data/education"

export function TimelineIsland() {
  return (
    <div className="h-full relative overflow-hidden flex flex-col pt-3 pb-8">
      <div className="flex items-center gap-3 mb-6 relative z-10 px-2 lg:px-4">
        <div className="p-3 bg-black text-white rounded-sm border-2 border-black">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-head font-black text-2xl leading-none uppercase">
            Journey / Experience
          </h3>
          <p className="font-bold text-muted-foreground mt-1 text-sm tracking-wider uppercase">
            Academic & Beyond
          </p>
        </div>
      </div>

      <Accordion
        type="single"
        collapsible
        className="w-full flex-grow flex flex-col gap-4 relative z-10 px-2 lg:px-4"
      >
        {education.map((item, index) => (
          <Accordion.Item key={index} value={`item-${index}`} className="border-4 border-black">
            <Accordion.Header className="bg-[#C4A1FF] hover:bg-[#C4A1FF]/90 font-black uppercase text-xl md:text-2xl transition-colors border-b-0 data-[state=open]:border-b-4 data-[state=open]:border-black">
              <div className="flex flex-col items-start gap-1 text-left">
                <span>{item.degree}</span>
                <span className="text-xs tracking-widest bg-black text-white px-2 py-0.5 rounded shadow-[2px_2px_0px_rgba(230,166,39,1)]">
                  {item.date}
                </span>
              </div>
            </Accordion.Header>
            <Accordion.Content className="font-medium text-base text-black bg-[#F4F4F5] p-5">
              <p className="font-black text-lg mb-2">{item.school}</p>
              {item.description && (
                <p className="font-semibold text-muted-foreground leading-relaxed">
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
