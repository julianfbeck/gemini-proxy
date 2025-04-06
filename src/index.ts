import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

// Get API keys from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHANNEL_ID = '885966540'

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY environment variable is required')
  process.exit(1)
}

const app = new Hono()

// Configure CORS middleware for all routes
app.use('*', cors({
  origin: '*', // Allow all origins
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400, // 24 hours
  credentials: true
}))

// Send error message to Telegram channel
async function sendErrorToTelegram(message: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is not set, cannot send error report')
    return
  }

  try {
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHANNEL_ID,
        text: `🚨 Gemini Proxy Error: ${message}`,
        parse_mode: 'HTML'
      })
    })
  } catch (error) {
    console.error('Failed to send message to Telegram:', error)
  }
}

// Basic home route
app.get('/', (c) => {
  return c.text('Gemini Proxy Server')
})

// Test endpoint
app.get('/test', async (c) => {
  try {
    return c.json({
      status: 'ok',
      message: 'Gemini proxy server is running correctly',
      environment: {
        geminiApiKeySet: !!GEMINI_API_KEY,
        telegramBotTokenSet: !!TELEGRAM_BOT_TOKEN
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    await sendErrorToTelegram(`Test endpoint error: ${errorMessage}`)
    return c.json({ error: 'Test endpoint failed' }, 500)
  }
})

// Test error reporting
app.get('/test-error', async (c) => {
  try {
    await sendErrorToTelegram('This is a test error message from the Gemini proxy')
    return c.json({ status: 'ok', message: 'Test error sent to Telegram' })
  } catch (error) {
    return c.json({ error: 'Failed to send test error' }, 500)
  }
})

// Gemini proxy endpoint
app.post('/api/gemini/generate-image', async (c) => {
  try {
    const requestBody = await c.req.json()

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      const errorMessage = `Gemini API returned ${response.status}: ${errorText}`
      console.error(errorMessage)
      await sendErrorToTelegram(errorMessage)
      return c.json({ error: 'Gemini API error', details: errorText }, response.status as any)
    }

    const data = await response.json()
    return c.json(data)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error proxying request to Gemini API:', error)
    await sendErrorToTelegram(`Gemini API proxy error: ${errorMessage}`)
    return c.json({ error: 'Failed to process request' }, 500)
  }
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
