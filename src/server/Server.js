'use strict'

import debug from 'debug'

// Takes the given options object, and creates a new object that
// contains the configured options. Used for setting defaults, and such.
export function resolveOptions (options) {
  // How long to wait for client's pong response before quitting.
  const heartbeatTimeout = Number(options.heartbeatTimeout || 15000)
  if (Number.isNaN(heartbeatTimeout)) {
    throw new Error('Invalid parameter for heartbeatTimeout: Must be a number')
  }

  // How long to wait since last ping to send another ping message.
  const heartbeatInterval = Number(options.heartbeatInterval || 10000)
  if (Number.isNaN(heartbeatInterval)) {
    throw new Error('Invalid parameter for heartbeatInterval: Must be a number')
  }

  // How long to wait before considering the handshake as timed out.
  const handshakeTimeout = Number(options.handshakeTimeout || 10000)
  if (Number.isNaN(handshakeTimeout)) {
    throw new Error('Invalid parameter for handshakeTimeout: Must be a number')
  }

  // Whether to allow session resuming for the server.
  const supportsResuming = Boolean(options.supportsResuming)

  // If we support session resuming, whether to allow session resuming to be done
  // from a client with a different IP.
  const resumeAllowsDifferentIPs = Boolean(options.resumeAllowsDifferentIPs)

  // How long to wait for someone to resume the session before we delete it.
  const maxSessionAge = Number(options.maxSessionAge || 10000)
  if (Number.isNaN(maxSessionAge)) {
    throw new Error('Invalid parameter for maxSessionAge: Must be a number')
  }

  return {
    heartbeatTimeout,
    heartbeatInterval,
    handshakeTimeout,
    supportsResuming,
    resumeAllowsDifferentIPs,
    maxSessionAge
  }
}

export default class Server {
  constructor (options) {
    if (!options) options = {}

    this._dbg = debug('socketeer:Server') // [DEBUG]

    const resolvedOptions = resolveOptions(options)

    for (let key of Object.keys(resolvedOptions)) {
      Object.defineProperty(this, key, {
        value: resolvedOptions[key]
      })
    }

    // Create the functions that will handle the socket server events.
    // We are doing this because so we can keep a reference to the function so we
    // can use it later to remove the listeners from the events.
    this._wssErrorHandler = (err) => handleWSSError(this, err)
    this._wssHeadersHandler = (headers) => handleWSSHeaders(this, headers)
    this._wssConnectionHandler = (connection) => handleWSSConnection(this, connection)

    // Reserved variable for anyone except the library to use.
    // Helps with not polluting the Socketeer instance namespace.
    this.data = {}
  }
}

// Attaches a uWebSockets server to the Socketeer server,
// and starts listening to it.
Server.prototype.listen = function (server) {
  if (this.wss) {
    throw new Error('Server is already listening!')
  }
  this.wss = server
  this.wss.on('error', this._wssErrorHandler)
  this.wss.on('headers', this._wssHeadersHandler)
  this.wss.on('connection', this._wssConnectionHandler)
}
Server.prototype.start = Server.prototype.listen

// Detaches the uWebSockets server from the Socketeer server,
// and purging all clients, effectively resetting the server to a
// just-constructed state.
Server.prototype.stop = function (server) {
  this.wss.removeListener('error', this._wssErrorHandler)
  this.wss.removeListener('headers', this._wssHeadersHandler)
  this.wss.removeListener('connection', this._wssConnectionHandler)
  delete this.wss
}

function handleWSSError () { }
function handleWSSHeaders () { }
function handleWSSConnection () { }
