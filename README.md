# Gemini Proxy Server

A simple proxy server for the Gemini API with CORS support.

## Setup

1. Get a Gemini API key from [Google AI Studio](https://ai.google.dev/)
2. Set up environment variables:

```bash
# Required
export GEMINI_API_KEY=your_api_key_here

# Optional - for error reporting via Telegram
export TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

## Installation & Running

```bash
npm install
npm run dev
```

The server will start on [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Generate Image

```
POST /api/gemini/generate-image
```

Request body should match the Gemini API format for image generation.

Example:

```json
{
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "Generate an image of a mountain landscape"
        }
      ]
    }
  ]
}
```

The response will be forwarded directly from the Gemini API.

### Test Endpoints

```
GET /test
```

Returns server status information, including whether API keys are set.

```
GET /test-error
```

Tests the Telegram error reporting feature by sending a test message.

## Error Reporting

This server supports error reporting via Telegram. When configured with a Telegram bot token, errors will be sent to the channel ID: `885966540`.

## CORS Support

This proxy has full CORS support with the following configurations:
- All origins allowed
- Supported methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed headers: Content-Type, Authorization
- Supports credentials 