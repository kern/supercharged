import { omit } from 'ramda'
import fetch from 'node-fetch'
import * as config from './config'
import { AirtableActivity, ActivityTrainingData, AirtableErrorResponse } from './types'

const fetchTrainingData = async (): Promise<ActivityTrainingData> => {
  const url = 'https://api.airtable.com/v0/' + config.airtable.base + '/' + encodeURIComponent(config.airtable.trainingTable)
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${config.airtable.apiKey}`,
      'Content-Type': 'application/json',
    }
  })

  const body = await res.json()

  if (!res.ok) {
    handleError(body as AirtableErrorResponse)
  }

  return body.records.map((r: any) => {
    return [r.fields.Input, r.fields.Output]
  })
}

const appendActivity = async (activity: AirtableActivity): Promise<void> => {
  const fields = omit(['Type'], activity)

  const url = 'https://api.airtable.com/v0/' + config.airtable.base + '/' + encodeURIComponent(config.airtable.resultsTable)
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.airtable.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ records: [{ fields }] })
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

export {
  fetchTrainingData,
  appendActivity
}
