import { handleConnection } from "./serverEvents"
import { handleStations } from "./serverEvents"
import { handleMessages } from "./serverEvents"

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