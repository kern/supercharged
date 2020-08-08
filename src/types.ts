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

export type ActivityType = 'FOOD' | 'ENERGY' | 'EXERCISE'

export type AirtableAttachments = Array<{ url: string }>

export type AirtableFoodActivity = {
  "Type": 'FOOD',
  "Activity Date": string,
  "Description": string,
  "Meal Type": string,
  "Count": number,
  "Size": string,
  "Location": string,
  "Tags": string,
  "Attachment URL"?: string,
  "Attachments"?: AirtableAttachments,
}

export type AirtableEnergyActivity = {
  "Type": 'ENERGY',
  "Attachment URL"?: string,
  "Attachments"?: AirtableAttachments,
}

export type AirtableExerciseActivity = {
  "Type": 'EXERCISE',
  "Attachment URL"?: string,
  "Attachments"?: AirtableAttachments,
}

export type AirtableActivity = AirtableFoodActivity | AirtableEnergyActivity | AirtableExerciseActivity

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
