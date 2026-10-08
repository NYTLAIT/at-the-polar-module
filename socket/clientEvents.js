import { io } from 'socket.io-client'

// REMEMBER SOCKET AFTER CONNECT
let socket = null
export const isConnected = () => socket !== null

// ------ LOGIN AND DISCONNECT --------------------------------

// -- CONNECT USER && SET SOCKET --
export function connect(username, role, onLoginSuccess) {
  if (socket) return
  socket = io('http://localhost:3000')

  socket.on('connect', () => {
    socket.emit('login', username, role)
  })

  socket.on('loginSuccess', () => {
    onLoginSuccess?.()
  })
}

// -- DISCONNECT USER --
export function disconnect() {
  socket?.disconnect()
  socket = null
}

// ------ SETTING STATIONS -----------------------------------

// -- POPULATE STATIONS AND HANDLE UPDATES --
export function getStations(setStations) {
  if (!socket) return () => { }

  const loadStations = () => socket.emit('getStations', setStations)

  loadStations() // First load
  socket.on('stationsChanged', loadStations) // Continuous

  return () => socket.off('stationsChanged', loadStations) // Strictmode cleaning
}

// -- CREATE STATIONS --
export function createStation(stationName, creationResultAlert) {
  if (!socket) return
  socket.emit('createStation', stationName, creationResultAlert)
}

// -- SUBSCRIPTIONS AND JOINS --
function stationAction(event, stationName, resultAlert) {
  if (!socket) return
  socket.emit(event, stationName, resultAlert)
}

export const subscribeStation = (stationName, resultAlert) => {
  stationAction('subscribeStation', stationName, resultAlert)
}
export const unsubscribeStation = (stationName, resultAlert) => {
  stationAction('unsubscribeStation', stationName, resultAlert)
}
export const joinStation = (stationName, resultAlert) => {
  stationAction('joinStation', stationName, resultAlert)
}
export const leaveStation = (stationName, resultAlert) => {
  stationAction('leaveStation', stationName, resultAlert)
}

// ------ SETTING MESSAGES -----------------------------------
export function getMessages(stationName, setMessages) {
  if (!socket) return () => { }

  const loadMessages = () => socket.emit('getMessages', stationName, setMessages)

  loadMessages()
  const onMessagesChanged = (changedStation) => { // Listen for Station on only
    if (changedStation === stationName) loadMessages()
  }
  socket.on('messagesChanged', onMessagesChanged)

  return () => socket.off('messagesChanged', onMessagesChanged)
}

export function postMessage(stationName, text, resultAlert) {
  if (!socket) return
  socket.emit('postMessage', stationName, text, resultAlert)
}

export function replyToMessage(stationName, messageId, text, resultAlert) {
  if (!socket) return
  socket.emit('replyToMessage', stationName, messageId, text, resultAlert)
}