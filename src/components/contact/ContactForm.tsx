"use client"

import { useEffect, useRef } from "react"
import { useState } from "react"
import { Loader2, Send } from "lucide-react"
import { Select } from "@/components/retroui/Select"
import {
  contactFormSchema,
  contactSubjectOptions,
  type ContactFormValues,
} from "@/lib/contact"
import { revealMotionGroupWithRotation } from "@/lib/animation/motion"

const initialValues: ContactFormValues = {
  name: "",
  email: "",
  subject: "Project Inquiry",
  message: "",
}

export function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(initialValues)
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")
  const [feedback, setFeedback] = useState<string | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const targets = section.querySelectorAll(".motion-target")
    if (!targets.length) return

    revealMotionGroupWithRotation(targets, {
      delay: 0,
      duration: 0.5,
      staggerDelay: 0.1,
      offsetY: 22,
      scale: 0.96,
      rotation: -2,
    })
  }, [])

  const handleChange = (
    field: keyof ContactFormValues,
    value: ContactFormValues[keyof ContactFormValues]
  ) => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const parsed = contactFormSchema.safeParse(values)
    if (!parsed.success) {
      setStatus("error")
      setFeedback("Please check the form fields and try again.")
      return
    }

    setStatus("loading")
    setFeedback(null)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      })

      const json = (await response.json()) as {
        success?: boolean
        message?: string
        error?: string
      }

      if (!response.ok || !json.success) {
        setStatus("error")
        setFeedback(json.error || "Unable to send message right now.")
        return
      }

      setStatus("success")
      setFeedback(json.message || "Message sent successfully.")
      setValues(initialValues)
    } catch {
      setStatus("error")
      setFeedback("Network error. Please try again.")
    }
  }

  return (
    <section ref={sectionRef} className="motion-target rounded-xl border-[3px] border-black bg-white p-5 shadow-brutal md:p-6">
      <div className="mb-5 motion-target">
        <p className="font-head text-[11px] font-black tracking-widest text-muted-foreground uppercase">
          Send a Message
        </p>
        <h2 className="font-head mt-1 text-2xl font-black text-black uppercase md:text-3xl">
          Contact Form
        </h2>
        <p className="mt-3 text-sm leading-relaxed font-semibold text-muted-foreground">
          Have a project, collaboration idea, or opportunity in mind? Send me a
          message and I will get back to you as soon as possible.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="motion-target grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="font-head text-xs font-black tracking-wide text-black uppercase">
              Name
            </span>
            <input
              value={values.name}
              onChange={(event) => handleChange("name", event.target.value)}
              placeholder="Your name"
              className="rounded-sm border-2 border-black bg-white px-3 py-3 text-sm font-semibold text-black transition-colors outline-none focus:bg-[#F4F4F5]"
              maxLength={60}
              autoComplete="name"
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="font-head text-xs font-black tracking-wide text-black uppercase">
              Email
            </span>
            <input
              type="email"
              value={values.email}
              onChange={(event) => handleChange("email", event.target.value)}
              placeholder="you@example.com"
              className="rounded-sm border-2 border-black bg-white px-3 py-3 text-sm font-semibold text-black transition-colors outline-none focus:bg-[#F4F4F5]"
              maxLength={120}
              autoComplete="email"
              required
            />
          </label>
        </div>

        <div className="motion-target grid gap-2">
          <span className="font-head text-xs font-black tracking-wide text-black uppercase">
            Subject
          </span>
          <Select
            value={values.subject}
            onValueChange={(value) =>
              handleChange(
                "subject",
                value as ContactFormValues["subject"]
              )
            }
          >
            <Select.Trigger className="h-auto w-full rounded-sm border-2 border-black bg-white px-3 py-3 text-left text-sm font-semibold text-black shadow-none focus:bg-[#F4F4F5] focus:shadow-none">
              <Select.Value placeholder="Select a subject">
                {values.subject}
              </Select.Value>
            </Select.Trigger>
            <Select.Content className="rounded-sm border-2 border-black bg-white shadow-brutal-sm">
              {contactSubjectOptions.map((subject) => (
                <Select.Item
                  key={subject}
                  value={subject}
                  className="px-3 py-3 text-sm font-semibold text-black data-[highlighted]:bg-[#C4A1FF] data-[highlighted]:text-black"
                >
                  {subject}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>

        <label className="motion-target grid gap-2">
          <span className="font-head text-xs font-black tracking-wide text-black uppercase">
            Message
          </span>
          <textarea
            value={values.message}
            onChange={(event) => handleChange("message", event.target.value)}
            placeholder="Tell me about your project, opportunity, or idea."
            className="min-h-40 resize-y rounded-sm border-2 border-black bg-white px-3 py-3 text-sm font-semibold text-black transition-colors outline-none focus:bg-[#F4F4F5]"
            maxLength={1000}
            required
          />
        </label>

        {feedback && (
          <p
            className={
              status === "success"
                ? "text-sm font-bold text-emerald-700"
                : "text-sm font-bold text-red-600"
            }
          >
            {feedback}
          </p>
        )}

        <div className="motion-target flex items-center justify-between gap-4">
          <span className="text-xs font-bold text-muted-foreground uppercase">
            Replies usually go through email.
          </span>
          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex items-center gap-2 rounded-sm border-2 border-black bg-[#C4A1FF] px-4 py-3 text-xs font-black text-black uppercase shadow-brutal-sm transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Message
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  )
}
