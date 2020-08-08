import { validatePayload, parseSMS } from './sms'
import { TwilioPayload } from './types'
import { Request, Response } from 'express'
import { process } from './process'

export const call = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.method !== 'POST') {
      res.send({
        status: 405
      })
      return
    }

    const validPayload = validatePayload(req.body)
    if (!validPayload) {
      res.send({
        status: 400,
        error: {
          message: 'invalid payload'
        }
      })
      return
    }

    const activityInputs = parseSMS(req.body as TwilioPayload)
    const activityPromises = activityInputs.map(process)
    const activities = await Promise.all(activityPromises)

    res.send({
      status: 200,
      body: { activities: activities.length },
    })
  } catch (err) {
    res.send({
      status: 400,
      body: { error: err.toString(), stack: err.stack },
    })
  }
}
