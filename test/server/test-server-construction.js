'use strict'

import test from 'ava'

import Server from '../../lib/server/Server'

test('Server should be constructed easily with correct default options', (t) => {
  t.plan(6)

  const server = new Server()

  t.is(server.heartbeatTimeout, 15000)
  t.is(server.heartbeatInterval, 10000)
  t.is(server.handshakeTimeout, 10000)
  t.is(server.supportsResuming, false)
  t.is(server.resumeAllowsDifferentIPs, false)
  t.is(server.maxSessionAge, 10000)
})

test('Server should be constructed with overridable options', (t) => {
  t.plan(3)

  const server = new Server({
    heartbeatTimeout: 900,
    resumeAllowsDifferentIPs: true,
    maxSessionAge: 0
  })

  t.is(server.heartbeatTimeout, 900)
  t.is(server.resumeAllowsDifferentIPs, true)
  t.is(server.maxSessionAge, 10000)
})

test('Server should not allow invalid values', (t) => {
  t.plan(1)

  try {
    new Server({ // eslint-disable-line no-new
      heartbeatTimeout: 'potato'
    })
    throw new Error('Server constructed without error!')
  } catch (err) {
    t.is(err.message, 'Invalid parameter for heartbeatTimeout: Must be a number')
  }
})

test('Server should be provided with a data property that we can freely use', (t) => {
  t.plan(1)

  const server = new Server()
  server.data.foo = 'bar'
  t.is(server.data.foo, 'bar')
})
