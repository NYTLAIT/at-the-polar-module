import { handleConnection } from "./serverEvents.js"
import { handleStations } from "./serverEvents.js"
import { handleMessages } from "./serverEvents.js"

export default function setFeatures(io) {
  const state = {
    // Tracks users
    users: new Map(),
    // Tracks users online
    connections: new Map(),
    // Stations && Messages
    stations: new Map()
  }

  io.on('connection', socket => {
    handleConnection(socket, state)
    handleStations(io, socket, state)
    handleMessages(io, socket, state)
  })
} 