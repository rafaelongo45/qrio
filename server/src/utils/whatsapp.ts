const CALLMEBOT_API_KEY = process.env.CALLMEBOT_API_KEY ?? ''
const ADMIN_PHONE = process.env.ADMIN_PHONE ?? ''

export async function sendWhatsApp(message: string): Promise<void> {
  if (!CALLMEBOT_API_KEY || !ADMIN_PHONE) return

  const url = new URL('https://api.callmebot.com/whatsapp.php')
  url.searchParams.set('phone', ADMIN_PHONE)
  url.searchParams.set('text', message)
  url.searchParams.set('apikey', CALLMEBOT_API_KEY)

  await fetch(url.toString()).catch(() => {})
}
