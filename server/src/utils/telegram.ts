const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? ''
const CHAT_ID   = process.env.TELEGRAM_CHAT_ID   ?? ''

async function send(text: string): Promise<void> {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text }),
  }).catch(() => {})
}

export async function sendTelegram(message: string, link?: string): Promise<void> {
  if (!BOT_TOKEN || !CHAT_ID) return
  await send(message)
  if (link) await send(link)
}
