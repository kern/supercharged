import * as config from './config'
import { AirtableFoodActivity } from './types'

const appendFoodActivity = async (activity: AirtableFoodActivity): Promise<void> => {
  const url = 'https://api.airtable.com/v0/' + config.airtable.base + '/' + config.airtable.resultsTable
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.airtable.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(activity)
  })

  await res.json()
}

export {
  appendFoodActivity
}
