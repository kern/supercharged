import { DateTime } from 'luxon'
import { tokenizeOutput } from './gpt3'
import { AirtableActivity, ActivityInput, AMPM, OutputTokens } from './types'
import * as airtable from './airtable'
import * as gpt3 from './gpt3'
import * as config from './config'

const parseTokens = (tokens: OutputTokens): AirtableActivity => {
  let date: string = (new Date()).toISOString()
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
        count = parseFloat(s)
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
        ampm = s as AMPM
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
    date =
      DateTime
        .fromObject({
          hour: (hour || 0) + (ampm === 'pm' ? + 12 : 0),
          minute: min || 0,
          second: 0,
          millisecond: 0,
          zone: config.app.timezone,
        })
        .toISO() as string
  }

  const activity: AirtableActivity = {
    "Type": 'FOOD',
    "Activity Date": date,
    "Description": desc.join(' '),
    "Meal Type": meal,
    "Count": count,
    "Size": size,
    "Location": loc.join(' '),
    "Tags": tags.join(', '),
  }

  return activity
}

const process = async (input: ActivityInput): Promise<AirtableActivity> => {
  const trainingData = await airtable.fetchTrainingData()
  const opts = gpt3.prepareOptions(trainingData, input)
  const rawOutput = await gpt3.predict(opts)
  const tokens = tokenizeOutput(rawOutput)
  const activity = parseTokens(tokens)

  if (input.mediaURL) {
    activity["Attachment URL"] = input.mediaURL
    activity["Attachments"] = [{url: input.mediaURL}]
  }

  await airtable.appendActivity(activity)

  return activity
}

export {
  process,
}
