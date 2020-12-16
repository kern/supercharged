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
  const text =
    payload.Body
      .split('\n')
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0)
      .join('. ')

  return [{
    text,
    mediaURL: payload.MediaUrl0,
  }]
}

export { validatePayload, parseSMS }
