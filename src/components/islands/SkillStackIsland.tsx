import { Code2 } from "lucide-react"
import { skills } from "@/data/skills"
import { Accordion } from "@/components/retroui/Accordion"

const categoryColors: Record<string, string> = {
  "Languages": "bg-[#C4A1FF]",
  "Frameworks & Libraries": "bg-[#38BDF8]",
  "Database & ORM": "bg-[#4ADE80]",
  "Tools & Environment": "bg-[#F472B6]",
  "Runtimes & Package Managers": "bg-[#FBBF24]",
  "Design": "bg-[#A78BFA]"
};

export function SkillStackIsland() {
  return (
    <div className="h-full relative overflow-hidden flex flex-col p-6 bg-white border-4 border-black rounded-xl shadow-brutal transition-transform hover:rotate-1">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-black text-white rounded-sm border-2 border-black">
          <Code2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-head font-black text-2xl leading-none uppercase">Skills</h3>
          <p className="font-bold text-muted-foreground mt-1 text-sm tracking-wider uppercase">Technologies I use</p>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full flex-grow flex flex-col gap-4">
        {skills.map((category, index) => (
          <Accordion.Item key={index} value={`item-${index}`} className="border-4 border-black">
            <Accordion.Header className="bg-[#F4F4F5] hover:bg-[#E4E4E5] font-black uppercase text-lg transition-colors border-b-0 data-[state=open]:border-b-4 data-[state=open]:border-black">
              {category.category}
            </Accordion.Header>
            <Accordion.Content className="text-black bg-white p-5">
              <div className="flex flex-wrap gap-2">
                {category.items.map((skill) => {
                  const bgColor = categoryColors[category.category] || "bg-[#F4F4F5]";
                  return (
                    <span 
                      key={skill}
                      className={`px-3 py-1 font-bold text-sm ${bgColor} border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-default`}
                    >
                      {skill}
                    </span>
                  );
                })}
              </div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}
