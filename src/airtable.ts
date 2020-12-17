import fetch from 'node-fetch'
import * as config from './config'
import {
  AirtableActivity,
  ActivityTrainingData,
  AirtableErrorResponse,
} from './types'

interface AirtableTrainingDataRecord {
  fields: {
    Input: string
    Output: string
  }
}

const fetchTrainingData = async (): Promise<ActivityTrainingData> => {
  const url =
    'https://api.airtable.com/v0/' +
    config.airtable.base +
    '/' +
    encodeURIComponent(config.airtable.trainingTable)
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${config.airtable.apiKey}`,
      'Content-Type': 'application/json',
    },
  })

  const body = await res.json()

  if (!res.ok) {
    handleError(body as AirtableErrorResponse)
  }

  return body.records.map((r: AirtableTrainingDataRecord) => {
    return [r.fields.Input, r.fields.Output]
  })
}

const appendActivity = async (activity: AirtableActivity): Promise<void> => {
  const url =
    'https://api.airtable.com/v0/' +
    config.airtable.base +
    '/' +
    encodeURIComponent(config.airtable.resultsTable)
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.airtable.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ records: [{ fields: activity }] }),
  })

  const body = await res.json()

  if (!res.ok) {
    handleError(body as AirtableErrorResponse)
  }
}

const handleError = (errRes: AirtableErrorResponse): void => {
  const errMessage = `${errRes.error.type}: ${errRes.error.message}`
  throw new Error(errMessage)
}

export { fetchTrainingData, appendActivity }
