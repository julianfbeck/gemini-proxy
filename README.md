# Gemini Proxy Server

A simple proxy server for the Gemini API with CORS support.

## Setup

1. Get a Gemini API key from [Google AI Studio](https://ai.google.dev/)
2. Set your API key as an environment variable:

```bash
export GEMINI_API_KEY=your_api_key_here
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

## CORS Support

This proxy has full CORS support with the following configurations:
- All origins allowed
- Supported methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed headers: Content-Type, Authorization
- Supports credentials 