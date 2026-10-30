/**
 * Roast & Redline (Cars & Coffee) — Email Notifications via EmailJS REST API
 *
 * Uses PUBLIC keys from `.env.local` (VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID,
 * VITE_EMAILJS_PUBLIC_KEY). If keys are omitted or offline, fails silently so sign-up
 * and RSVPs always succeed.
 */

const ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send'

function emailConfig() {
  const env = import.meta.env || {}
  return {
    serviceId: env.VITE_EMAILJS_SERVICE_ID,
    templateId: env.VITE_EMAILJS_TEMPLATE_ID,
    publicKey: env.VITE_EMAILJS_PUBLIC_KEY
  }
}

export function isEmailConfigured() {
  const { serviceId, templateId, publicKey } = emailConfig()
  return Boolean(serviceId && templateId && publicKey)
}

export async function sendEmail({ toEmail, toName, subject, message }) {
  if (!isEmailConfigured() || !toEmail) return false
  const { serviceId, templateId, publicKey } = emailConfig()
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          to_email: toEmail,
          to_name: toName || 'Roast & Redline Member',
          subject,
          message
        }
      })
    })
    return res.ok
  } catch {
    return false
  }
}

export function sendWelcomeEmail(user) {
  if (!user || !user.email) return Promise.resolve(false)
  return sendEmail({
    toEmail: user.email,
    toName: user.name,
    subject: 'Welcome to Roast & Redline — Cars & Coffee Club',
    message: `Hi ${user.name}, your Roast & Redline (Cars & Coffee) garage profile is ready! Browse 100+ morning coffee runs across Melbourne & Malaysia, lock in your Car Roll-Call RSVPs, and pin meets to your Offline Vault.`
  })
}

export function sendRsvpEmail(user, meet, attendType, carBrought) {
  if (!user || !user.email || !meet) return Promise.resolve(false)
  const detail =
    attendType === 'bringing_car'
      ? `You are bringing ${carBrought || 'your car'} to`
      : 'You are joining for coffee at'
  return sendEmail({
    toEmail: user.email,
    toName: user.name,
    subject: `Roll-Call Confirmed: ${meet.title}`,
    message: `${detail} "${meet.title}" on ${meet.meet_datetime} at ${meet.cafe_name} (${meet.address}).`
  })
}
