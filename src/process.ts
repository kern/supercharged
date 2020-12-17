import { DateTime } from 'luxon'
import { tokenizeOutput } from './gpt3'
import { AirtableActivity, ActivityInput, AMPM, OutputTokens } from './types'
import * as airtable from './airtable'
import * as gpt3 from './gpt3'
import * as config from './config'

const parseTokens = (tokens: OutputTokens): AirtableActivity[] => {
  const activities: AirtableActivity[] = []
  const tokensLeft = tokens

  let activityType: string | null = null
  let date: string = new Date().toISOString()
  let desc: string[] = []
  let count: number | null = null
  let size: string | null = null
  let meal: string | null = null
  const loc: string[] = []
  let hour: number | null = null
  let min: number | null = null
  let day: string | null = null
  let duration: string | null = null
  let distance: string | null = null
  let energy: number | null = null
  let feeling: number | null = null
  let stress: number | null = null
  let ampm: AMPM | null = null
  let tags: string[] = []

  const addActivity = (): void => {
    const activity: AirtableActivity = {
      Description: desc.join(' '),
      'Meal Type': meal,
      Count: count,
      Size: size,
      Duration: duration,
      Distance: distance,
      Tags: tags.join(', '),
    }

    activities.push(activity)

    desc = []
    count = null
    size = null
    meal = null
    duration = null
    distance = null
    tags = []
  }

  // process all tokens in the message
  while (tokensLeft.length > 0) {
    const nextToken = tokensLeft.shift()!
    const [s, type] = nextToken
    switch (type) {
      case 'type':
        activityType = s
        break

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

      case 'day':
        day = s
        break

      case 'loc':
        loc.push(s)
        break

      case 'tag':
        tags.push(s)
        break

      case 'energy':
        energy = parseInt(s, 10)
        break

      case 'feeling':
        feeling = parseInt(s, 10)
        break

      case 'stress':
        stress = parseInt(s, 10)
        break

      case 'duration':
        duration = s
        break

      case 'distance':
        distance = s
        break

      case 'separator':
        addActivity()
        break
    }

    if (tokensLeft.length === 0) {
      addActivity()
    }
  }

  // calculate the date for the activities
  if (hour || min || ampm || day) {
    date = DateTime.fromObject({
      hour: (hour || 0) + (ampm === 'pm' ? +12 : 0),
      minute: min || 0,
      second: 0,
      millisecond: 0,
      zone: config.app.timezone,
    }).toISO() as string

    if (day === 'yesterday') {
      date = DateTime.fromISO(date).plus({ days: -1 }).toISO() as string
    } else if (day === '2daysago') {
      date = DateTime.fromISO(date).plus({ days: -2 }).toISO() as string
    }
  }

  // add values that are the same for all activities in an input
  for (const activity of activities) {
    Object.assign(activity, {
      Type: activityType,
      'Activity Date': date,
      Location: loc.join(' '),
      Tags: tags.join(', '),
      Energy: energy,
      Feeling: feeling,
      Stress: stress,
    })

    // heuristic for meal based on time of day
    if (activityType === 'food' && !meal && date) {
      const hr = DateTime.fromISO(date).setZone(config.app.timezone).hour
      if (hr < 11) {
        meal = 'breakfast'
      } else if (hr < 17) {
        meal = 'lunch'
      } else {
        meal = 'dinner'
      }
    }
  }

  return activities
}

const process = async (input: ActivityInput): Promise<AirtableActivity[]> => {
  const receivedAt = DateTime.utc().toISO() as string

  const trainingData = await airtable.fetchTrainingData()
  const opts = gpt3.prepareOptions(trainingData, input)
  const rawOutput = await gpt3.predict(opts)
  const tokens = tokenizeOutput(rawOutput)
  const activities = parseTokens(tokens)

  for (const activity of activities) {
    activity['Original Text'] = input.text
    activity['Received At'] = receivedAt

    if (input.mediaURL) {
      activity['Attachment URL'] = input.mediaURL
      activity['Attachments'] = [{ url: input.mediaURL }]
    }

    await airtable.appendActivity(activity)
  }

  return activities
}

export { process }
