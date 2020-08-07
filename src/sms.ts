import { TwilioPayload, ActivityInput } from './types'

const processSMS = (payload: TwilioPayload): ActivityInput[] => {
  const lines =
    payload.Body
      .split('\n')
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0)

  return lines.map((l: string) => {
    return {
      text: l,
      imageURL: payload.MediaUrl0,
    }
  })
}

export { processSMS }
