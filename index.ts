import fetch from 'node-fetch'
import DateTime from 'luxon'

type GPT3Options = {
  prompt?: string,
  max_tokens?: number,
  temperature?: number,
  top_p?: number,
  n?: number,
  stream?: boolean,
  logprobs?: number,
  stop?: string,
}

type AirtableFoodActivity = {
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

type AirtableActivity = AirtableFoodActivity

type AMPM = 'am' | 'pm'

type ActivityTrainingData = [string, string][]

const GPT3_ENDPOINT = "https://api.openai.com/v1/engines/davinci/completions"
const GPT3_KEY = process.env.GPT3_API_KEY
const GPT3_DEFAULT_OPTIONS: GPT3Options = {
  max_tokens: 35,
  temperature: 0,
  top_p: 1,
  n: 1,
  stream: false,
  logprobs: null,
  stop: '\n\n'
}

const AIRTABLE_BASE = process.env.AIRTABLE_BASE
const AIRTABLE_RESULTS_TABLE = process.env.AIRTABLE_RESULTS_TABLE
const AIRTABLE_TRAINING_TABLE = process.env.AIRTABLE_TRAINING_TABLE
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY

const fetchTrainingData = (): ActivityTrainingData[] => {
  return [] // TODO
}

const prepareGPTOptions = (trainingData: ActivityTrainingData): GPT3Options[] {
  const prompt = trainingData.map(r => {
    return 'Q: ' + r.fields.Input + '\nA: ' + r.fields.Output
  }).join('\n\n')
  
  const lines = parameters.body.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  
  return lines.map(l => {
    const p = prompt + '\n\nQ: ' + l + '\nA:'
    return {
      prompt: p,
      ...gpt3Settings
    }
  })
}

const callGPT3 = async (opts: GPT3Options): Promise<async> => {
  const res = await fetch(GPT3_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GPT3_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(opts)
  })

  const body = await res.json()
  if (!body || !body.choices || body.choices.length === 0) {
    throw new Error('invalid GPT3 output')
  }

  return body.choices[0].text
}

const tokenizeGPT3Output = (rawOutput: string): Array<[string, string]> => {
  return rawOutput.split(/\s+/g).map(s => s.trim()).filter(s => !!s).map(t => t.split(':'))
}

const postProcessGPT3Output = (rawOutput: string): AirtableActivity[] => {
  const tokens = tokenizeGPT3Output(rawOutput)

  let date = (new Date()).toISOString()
  let desc: string[] = []
  let count: number = 1
  let size: string = ''
  let meal: string = 'unknown'
  let loc: string[] = []
  let hour: number | null = null
  let min: number | null = null
  let ampm: AMPM | null = null
  let tags: string[] = []

  for (const t of tokens) {
    const [s, type] = t
    switch (type) {
      case 'desc':
        desc.push(s)
        break

      case 'count':
        count = parseFloat(s, 10)
        break

      case 'size':
        size = s
        break

      case 'meal':
        meal = s
        break

      case 'hour':
        hour = parseInt(s, 10)
        break

      case 'min':
        min = parseInt(s, 10)
        break

      case 'ampm':
        ampm = s
        break

      case 'loc':
        loc.push(s)
        break

      case 'tag':
        tags.push(s)
        break
    }
  }

  if (hour || min || ampm) {
    date = libraries.moment()
      .tz('America/Los_Angeles')
      .hours(ampm === 'pm' ? hour + 12 : hour)
      .minutes(min || 0)
      .startOf('minute')
      .toISOString()
  }

  const attachments = parameters.mediaURL ? [{url: parameters.mediaURL}] : []
  
  return [
    {
      "Activity Date": date,
      "Description": desc.join(' '),
      "Meal Type": meal,
      "Count": count,
      "Size": size,
      "Location": loc.join(' '),
      "Tags": tags.join(', '),
      "Attachment URL": parameters.mediaURL,
      "Attachments": attachments
    }
  ]
}

const sendToAirtable = async (activity: AirtableFoodActivity): Promise<void> => {
  const url = 'https://api.airtable.com/v0/' + AIRTABLE_BASE + '/' + AIRTABLE_RESULTS_TABLE
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(activity)
  })

  await res.json()
}
