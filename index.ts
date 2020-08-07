import fetch from 'node-fetch'
import DateTime from 'luxon'
import { GPT3Options, AirtableFoodActivity, AirtableActivity, AMPM, ActivityTrainingData } from './types'
import * as config from './config'

const fetchTrainingData = (): ActivityTrainingData[] => {
  return [] // TODO
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
