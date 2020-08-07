export type GPT3Options = {
  prompt?: string,
  max_tokens?: number,
  temperature?: number,
  top_p?: number,
  n?: number,
  stream?: boolean,
  logprobs?: number,
  stop?: string,
}

export type AMPM = 'am' | 'pm'

export type ActivityTrainingData = Array<[string, string]>

export type AirtableFoodActivity = {
  "Activity Date": string,
  "Description": string,
  "Meal Type": string,
  "Count": number,
  "Size": string,
  "Location": string,
  "Tags": string,
  "Attachment URL": string,
  "Attachments": string,
}

export type AirtableActivity = AirtableFoodActivity

export type TwilioPayload = {
  Body: string,
  MediaUrl0?: string,
}

export type ActivityInput = {
  text: string,
  imageURL?: string,
}
