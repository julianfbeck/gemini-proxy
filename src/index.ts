import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

// Get API key from environment variable
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

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

// Basic home route
app.get('/', (c) => {
  return c.text('Gemini Proxy Server')
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
    const data = await response.json()
    console.log("successful-image")
    return c.json(data)
  } catch (error) {
    console.error('Error proxying request to Gemini API:', error)
    return c.json({ error: 'Failed to process request' }, 500)
  }
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
