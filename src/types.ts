export type GPT3Options = {
  prompt?: string | null,
  max_tokens?: number | null,
  temperature?: number | null,
  top_p?: number | null,
  n?: number | null,
  stream?: boolean | null,
  logprobs?: number | null,
  stop?: string | null,
}

export type AMPM = 'am' | 'pm'

export type ActivityTrainingData = Array<[string, string]>

export type ActivityInput = {
  text: string,
  mediaURL?: string,
}

export type AirtableAttachments = Array<{ url: string }>

export type AirtableActivity = {
  "Type"?: string | null,
  "Activity Date"?: string | null,
  "Description"?: string | null,
  "Meal Type"?: string | null,
  "Count"?: number | null,
  "Size"?: string | null,
  "Location"?: string | null,
  "Energy"?: number | null,
  "Feeling"?: number | null,
  "Stress"?: number | null,
  "Tags"?: string | null,
  "Duration"?: string | null,
  "Distance"?: string | null,
  "Attachment URL"?: string | null,
  "Attachments"?: AirtableAttachments | null,
  "Original Text"?: string
  "Received At"?: string
}

export type AirtableErrorResponse = {
  error: {
    type: string,
    message: string,
  }
}

export type TwilioPayload = {
  Body: string,
  MediaUrl0?: string,
}

export type OutputTokens = Array<[string, string]>
