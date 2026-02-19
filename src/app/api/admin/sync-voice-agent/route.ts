import { NextRequest, NextResponse } from 'next/server'

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const AGENT_ID = process.env.ELEVENLABS_AGENT_ID || 'agent_1101kg5vbnzkfbpa55jqgawb4exv'

export async function POST(request: NextRequest) {
  try {
    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { message: 'ElevenLabs API key not configured' },
        { status: 500 }
      )
    }

    const { prompt, greeting } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { message: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Update the ElevenLabs agent
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
      {
        method: 'PATCH',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_config: {
            agent: {
              prompt: { prompt },
              ...(greeting && { first_message: greeting }),
            },
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('ElevenLabs API error:', error)
      return NextResponse.json(
        { message: 'Failed to update voice agent', error },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: 'Voice agent updated successfully',
      agent: {
        name: data.name,
        first_message: data.conversation_config?.agent?.first_message,
      },
    })
  } catch (error) {
    console.error('Error syncing voice agent:', error)
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    )
  }
}
