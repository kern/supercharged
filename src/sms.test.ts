import * as sms from './sms'

const mediaURL = 'https://placekitten.com/128/128'

test('validates Twilio payloads', () => {
  expect(sms.validatePayload('foo')).toEqual(false)
  expect(sms.validatePayload({ foo: 'bar' })).toEqual(false)
  expect(sms.validatePayload({ Body: 'bar' })).toEqual(true)
  expect(sms.validatePayload({ Body: 'bar', MediaUrl0: false })).toEqual(false)
  expect(sms.validatePayload({ Body: 'bar', MediaUrl0: 'https://' })).toEqual(true)
})

test('parses SMS', () => {
  const inputs = sms.parseSMS({
    Body: 'fruit smoothie'
  })

  expect(inputs.length).toEqual(1)
  expect(inputs[0].text).toEqual('fruit smoothie')
  expect(inputs[0].mediaURL).toBeUndefined()
})

test('parses multi-line SMS', () => {
  const inputs = sms.parseSMS({
    Body: 'fruit smoothie \n1 can of baked beans\n\n',
  })

  expect(inputs.length).toEqual(2)
  expect(inputs[0].text).toEqual('fruit smoothie')
  expect(inputs[0].mediaURL).toBeUndefined()
  expect(inputs[1].text).toEqual('1 can of baked beans')
  expect(inputs[1].mediaURL).toBeUndefined()
})

test('parses MMS', () => {
  const inputs = sms.parseSMS({
    Body: 'fruit smoothie',
    MediaUrl0: mediaURL,
  })

  expect(inputs.length).toEqual(1)
  expect(inputs[0].text).toEqual('fruit smoothie')
  expect(inputs[0].mediaURL).toEqual(mediaURL)
})

test('parses multi-line MMS', () => {
  const inputs = sms.parseSMS({
    Body: 'fruit smoothie \n1 can of baked beans\n\n',
    MediaUrl0: mediaURL,
  })

  expect(inputs.length).toEqual(2)
  expect(inputs[0].text).toEqual('fruit smoothie')
  expect(inputs[0].mediaURL).toEqual(mediaURL)
  expect(inputs[1].text).toEqual('1 can of baked beans')
  expect(inputs[1].mediaURL).toEqual(mediaURL)
})
