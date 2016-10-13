'use strict'

import test from 'ava'
import {EventEmitter} from 'events'
import Server from '../../lib/server/Server'

test('Server should correctly create and remove listeners for servers', (t) => {
  t.plan(1)
  const ee = new EventEmitter()
  let eventEmitted = false
  function sampleHandler () {
    t.is(eventEmitted, false)
    eventEmitted = true
  }

  const server = new Server()
  server._wssHeadersHandler = sampleHandler

  server.listen(ee)
  ee.emit('headers')
  server.stopListening(ee)
  ee.emit('headers')
})

test('Server should not allow multiple listeners', (t) => {
  t.plan(1)

  const ee = new EventEmitter()

  const server = new Server()
  server.listen(ee)
  try {
    server.listen(ee)
    throw new Error('Server did not throw an error during the second listen!')
  } catch (err) {
    t.is(err.message, 'Server is already listening!')
  }
})

test('Server should allow starting of server after stopping', (t) => {
  const ee = new EventEmitter()
  const server = new Server()
  server.listen(ee)
  server.stopListening(ee)
  server.listen(ee)
})

test('Server.start should be the same thing as Server.listen', (t) => {
  const ee = new EventEmitter()
  const server = new Server()
  server.start(ee)
  server.stopListening(ee)
  server.start(ee)
})
