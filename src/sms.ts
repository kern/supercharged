import { TwilioPayload, ActivityInput } from './types'

const validatePayload = (body: any): boolean => {
  if (typeof body !== 'object') {
    return false
  }

  if (typeof body.Body !== 'string') {
    return false
  }

  if (!['undefined', 'string'].includes(typeof body.MediaUrl0)) {
    return false
  }

  return true
}

const parseSMS = (payload: TwilioPayload): ActivityInput[] => {
  const lines =
    payload.Body
      .split('\n')
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0)

  return lines.map((l: string) => {
    return {
      text: l,
      mediaURL: payload.MediaUrl0,
    }
  })
}

export { validatePayload, parseSMS }
