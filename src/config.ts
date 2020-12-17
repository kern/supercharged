import * as dotenv from 'dotenv'
import { get } from 'env-var'

switch (process.env.NODE_ENV) {
  case 'test':
    dotenv.config({ path: '.env.test' })
    break

  default:
    dotenv.config()
}

const app = {
  timezone: get('ACTIVITY_TIMEZONE').default('America/Los_Angeles').asString(),
}

const gpt3 = {
  endpoint: get('GPT3_ENDPOINT')
    .default('https://api.openai.com/v1/engines/curie/completions')
    .asString(),
  apiKey: get('GPT3_KEY').required().asString(),
  defaultOpts: {
    max_tokens: 50,
    temperature: 0,
    top_p: 1,
    n: 1,
    stream: false,
    logprobs: null,
    stop: '\n\n',
  },
}

const airtable = {
  base: get('AIRTABLE_BASE').required().asString(),
  resultsTable: get('AIRTABLE_RESULTS_TABLE').required().asString(),
  trainingTable: get('AIRTABLE_TRAINING_TABLE').required().asString(),
  apiKey: get('AIRTABLE_API_KEY').required().asString(),
}

export { app, gpt3, airtable }
