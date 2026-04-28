import type { APIRoute } from "astro"
import { Resend } from "resend"
import { contactFormSchema } from "@/lib/contact"
import { buildKvKey, incrementCounter, setIfNotExists } from "@/lib/kv"

export const prerender = false

const toSafeNumber = (value: string | null | undefined, fallback: number) => {
  if (!value) return fallback
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return parsed
}

const getClientIp = (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (!forwardedFor) return "anonymous"
  return forwardedFor.split(",")[0]?.trim() || "anonymous"
}

const resendApiKey = import.meta.env.RESEND_API_KEY
const contactToEmail = import.meta.env.CONTACT_TO_EMAIL
const contactFromEmail = import.meta.env.CONTACT_FROM_EMAIL
const contactReplyTo = import.meta.env.CONTACT_REPLY_TO

const resend = resendApiKey ? new Resend(resendApiKey) : null

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")

const createRateLimit = async (request: Request) => {
  const windowSeconds = Math.max(
    toSafeNumber(import.meta.env.CONTACT_RATE_LIMIT_WINDOW_SECONDS, 300),
    60
  )
  const maxRequests = Math.max(
    toSafeNumber(import.meta.env.CONTACT_RATE_LIMIT_MAX_REQUESTS, 3),
    1
  )

  const ip = getClientIp(request)
  const rateKey = buildKvKey("contact", "rate", ip)

  await setIfNotExists(rateKey, "0", windowSeconds)
  const currentCount = await incrementCounter(rateKey)
  return currentCount <= maxRequests
}

export const POST: APIRoute = async ({ request }) => {
  if (!resend || !contactToEmail || !contactFromEmail || !contactReplyTo) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Contact form is not configured.",
      }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      }
    )
  }

  const allowed = await createRateLimit(request)
  if (!allowed) {
    return new Response(
      JSON.stringify({ success: false, error: "Rate limit exceeded." }),
      {
        status: 429,
        headers: { "content-type": "application/json" },
      }
    )
  }

  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: "Invalid JSON body." }),
      {
        status: 400,
        headers: { "content-type": "application/json" },
      }
    )
  }

  const parsed = contactFormSchema.safeParse(payload)
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ success: false, error: "Invalid payload." }),
      {
        status: 400,
        headers: { "content-type": "application/json" },
      }
    )
  }

  const { name, email, subject, message } = parsed.data
  const emailSubject = `[Portfolio Contact] ${subject} - ${name}`
  const safeName = escapeHtml(name)
  const safeEmail = escapeHtml(email)
  const safeSubject = escapeHtml(subject)
  const safeMessage = escapeHtml(message)
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin-bottom: 16px;">New portfolio contact message</h2>
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <p><strong>Subject:</strong> ${safeSubject}</p>
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap;">${safeMessage}</p>
    </div>
  `
  const text = `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`

  const { error } = await resend.emails.send({
    from: `Drenzzz Contact <${contactFromEmail}>`,
    to: [contactToEmail],
    replyTo: contactReplyTo,
    subject: emailSubject,
    html,
    text,
  })

  if (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Unable to send message right now.",
      }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: "Message sent successfully.",
    }),
    {
      status: 200,
      headers: { "content-type": "application/json" },
    }
  )
}
