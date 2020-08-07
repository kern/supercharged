import { ActivityTrainingData, ActivityInput, GPT3Options } from './types'
import * as config from './config'

const prepareOptions = (trainingData: ActivityTrainingData, input: ActivityInput): GPT3Options => {
  const prompt = trainingData.concat([[input.text, '']]).map(([q, a]) => {
    return 'Q: ' + q + '\nA: ' + a
  }).join('\n\n').trim()
  
  return {
    prompt,
    ...config.gpt3.defaultOpts
  }
}

const predict = async (opts: GPT3Options): Promise<string> => {
  const res = await fetch(config.gpt3.endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.gpt3.apiKey}`,
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

const tokenizeOutput = (rawOutput: string): Array<[string, string]> => {
  return (
    rawOutput
      .split(/\s+/g)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(t => t.split(':'))
  ) as Array<[string, string]>
}

export {
  prepareOptions,
  predict,
  tokenizeOutput,
}
