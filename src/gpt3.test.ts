import fetchMock from 'jest-fetch-mock'
import * as config from './config'
import * as gpt3 from './gpt3'
import { ActivityTrainingData } from './types'

const trainingData = [
  ['fruit smoothie', 'fruit:desc smoothie:desc'],
  ['3 peanuts', '3:count peanuts:desc'],
] as ActivityTrainingData

const activityInput = { text: '12oz chicken salad' }

test('prepares GPT3 options', async () => {
  const opts = gpt3.prepareOptions(trainingData, activityInput)
  const prompt = `Q: fruit smoothie
A: fruit:desc smoothie:desc

Q: 3 peanuts
A: 3:count peanuts:desc

Q: 12oz chicken salad
A:`

  expect(opts.prompt).toEqual(prompt)
  expect(opts.n).toEqual(1)
  expect(opts.max_tokens).toEqual(50)
  expect(opts.temperature).toEqual(0)
  expect(opts.top_p).toEqual(1)
  expect(opts.stream).toEqual(false)
  expect(opts.stop).toEqual('\n\n')
  expect(opts.logprobs).toEqual(null)
})

test('predicts using GPT3 successfully', async () => {
  const outputText = '12oz:size chicken:desc salad:desc'

  fetchMock.mockIf(config.gpt3.endpoint, async (req: Request) => {
    expect(req.method).toEqual('POST')
    expect(req.headers.get('authorization')).toEqual('Bearer ' + config.gpt3.apiKey)
    expect(req.headers.get('content-type')).toEqual('application/json')

    const body = {
      choices: [
        { text: outputText }
      ]
    }

    return {
      status: 200,
      body: JSON.stringify(body)
    }
  })

  const opts = gpt3.prepareOptions(trainingData, activityInput)
  const res = await gpt3.predict(opts)
  expect(res).toEqual(outputText)
})

test('tokenizes GPT3 output', async () => {
  const outputText = '12oz:size chicken:desc salad:desc'
  const tokens = gpt3.tokenizeOutput(outputText)
  expect(tokens).toEqual([['12oz', 'size'], ['chicken', 'desc'], ['salad', 'desc']])
})
