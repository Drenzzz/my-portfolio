import { z } from "zod"

export const contactSubjectOptions = [
  "Project Inquiry",
  "Freelance Opportunity",
  "Internship Opportunity",
  "Collaboration",
  "General Message",
] as const

export const contactFormSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.email().max(120),
  subject: z.enum(contactSubjectOptions),
  message: z.string().trim().min(10).max(1000),
})

export type ContactFormValues = z.infer<typeof contactFormSchema>
