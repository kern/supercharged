import * as sms from './sms'

const imageURL = 'https://placekitten.com/128/128'

test('processes SMS', () => {
  const inputs = sms.processSMS({
    Body: 'fruit smoothie'
  })

  expect(inputs.length).toEqual(1)
  expect(inputs[0].text).toEqual('fruit smoothie')
  expect(inputs[0].imageURL).toBeUndefined()
})

test('processes multi-line SMS', () => {
  const inputs = sms.processSMS({
    Body: 'fruit smoothie \n1 can of baked beans\n\n',
  })

  expect(inputs.length).toEqual(2)
  expect(inputs[0].text).toEqual('fruit smoothie')
  expect(inputs[0].imageURL).toBeUndefined()
  expect(inputs[1].text).toEqual('1 can of baked beans')
  expect(inputs[1].imageURL).toBeUndefined()
})

test('processes MMS', () => {
  const inputs = sms.processSMS({
    Body: 'fruit smoothie',
    MediaUrl0: imageURL,
  })

  expect(inputs.length).toEqual(1)
  expect(inputs[0].text).toEqual('fruit smoothie')
  expect(inputs[0].imageURL).toEqual(imageURL)
})

test('processes multi-line MMS', () => {
  const inputs = sms.processSMS({
    Body: 'fruit smoothie \n1 can of baked beans\n\n',
    MediaUrl0: imageURL,
  })

  expect(inputs.length).toEqual(2)
  expect(inputs[0].text).toEqual('fruit smoothie')
  expect(inputs[0].imageURL).toEqual(imageURL)
  expect(inputs[1].text).toEqual('1 can of baked beans')
  expect(inputs[1].imageURL).toEqual(imageURL)
})
