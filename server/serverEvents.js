// ------ LOGIN AND DISCONNECT --------------------------------
export function handleConnection(socket, state) {
  socket.on('login', (username, role) => {
    // CONNECTION
    socket.data.username = username
    state.connections.set(username, socket.id)

    // PERSISTENT USER
    if (!state.users.has(username)) {
      state.users.set(username, {
        role,
        station: null,
        stations: {
          subscribed: [],
          memberOf: role === 'researcher' ? [] : null
        }
      })
    }

    console.log(state.connections)

    socket.emit('loginSuccess')
  })

  // DISCONNECT
  socket.on('disconnect', () => {
    const username = socket.data.username
    if (!username) return

    const user = state.users.get(username)
    user.station = null

    state.connections.delete(socket.data.username)
    console.log(state.connections)
  })
}

// ------ SETTING STATIONS -----------------------------------
export function handleStations(io, socket, state) {
  const getUser = () => state.users.get(socket.data.username)

  // GET USER STATIONS LIST
  socket.on('getStations', (setStations) => {
    const user = getUser()
    if (!user) return

    setStations({
      role: user.role,
      allStations: [...state.stations.keys()],
      subscribed: user.stations.subscribed,
      memberOf: user.stations.memberOf ?? []
    })
  })

  // CREATE STATION
  socket.on('createStation', (stationName, creationResultAlert) => {
    const user = getUser()
    if (!user) return

    if (user.role !== 'researcher') {
      return creationResultAlert('Only researchers can create stations')
    }
    if (!stationName?.trim()) {
      return creationResultAlert('Station needs a name')
    }
    if (state.stations.has(stationName)) {
      return creationResultAlert('Station name taken')
    }

    state.stations.set(stationName, { messages: [] }) // Add station to state
    user.stations.memberOf.push(stationName)

    io.emit('stationsChanged') // Update everybody about state
    creationResultAlert('New Station Created!')
  })

  // -- SUBSCRIPTIONS && JOINS
  // SUBSCRIBE
  socket.on('subscribeStation', (stationName, resultAlert) => {
    const user = getUser()
    if (!user) return
    if (user.stations.memberOf?.includes(stationName)) {
      return resultAlert?.('Members cannot subscribe to their own stations')
    }

    user.stations.subscribed.push(stationName)
    socket.emit('stationsChanged')
    resultAlert?.(`Subscribed to ${stationName}`)
  })
  // UNSUBSCRIBE
  socket.on('unsubscribeStation', (stationName, resultAlert) => {
    const user = getUser()
    if (!user) return

    user.stations.subscribed = user.stations.subscribed.filter(station => station !== stationName)
    socket.emit('stationsChanged')
    resultAlert?.(`Unsubscribed to ${stationName}`)
  })
  // JOIN
  socket.on('joinStation', (stationName, resultAlert) => {
    const user = getUser()
    if (!user) return
    if (user.role !== 'researcher') {
      return resultAlert?.('Only researchers can join stations')
    }

    user.stations.memberOf.push(stationName)
    user.stations.subscribed = user.stations.subscribed.filter((station) => station !== stationName)
    socket.emit('stationsChanged')
    resultAlert?.(`Joined ${stationName}`)
  })
  // LEAVE
  socket.on('leaveStation', (stationName, resultAlert) => {
    const user = getUser()
    if (!user) return
    if (user.role !== 'researcher') {
      return resultAlert?.('Only researchers can join stations')
    }

    user.stations.memberOf = user.stations.memberOf.filter(station => station !== stationName)
    socket.emit('stationsChanged')
    resultAlert?.(`Left ${stationName}`)
  })
}

// -- JOINING ROOMS

// ------ SETTING MESSAGES -----------------------------------
// Note: text is incoming, message is state
// MESSAGE BUILDER
function buildMessage(username, text) {
  return {
    messageId: crypto.randomUUID(),
    user: username,
    timestamp: Date.now(),
    message: text,
    replies: [],
  }
}
// FIND MESSAGE
function findMessage(messages, messageId) {
  for (const message of messages) {
    if (message.messageId === messageId) return message // 
    const foundMessage = findMessage(message.replies, messageId) // pass messages replies

    if (foundMessage) return foundMessage
  }
  return null
}

// -- END! OF HELPER FUNCTIONS

export function handleMessages(io, socket, state) {
  const getUser = () => state.users.get(socket.data.username)

  // GET MESSAGES OF A STATION
  socket.on('getMessages', (stationName, setMessages) => {
    const station = state.stations.get(stationName)
    if (!getUser() || !station) return setMessages?.([])

    setMessages?.(station.messages)
  })

  // SEND MESSAGE
  socket.on('postMessage', (stationName, text, resultAlert) => {
    const user = getUser()
    const station = state.stations.get(stationName)
    if (!user || !station) return resultAlert?.('Station not found')

    const message = text?.trim()
    if (!message) return resultAlert?.('Message is empty')

    const isMember = user.stations.memberOf?.includes(stationName)
    if (user.role !== 'researcher' || !isMember) {
      return resultAlert?.('Only the station researchers can post')
    }

    station.messages.push(buildMessage(socket.data.username, message))
    io.emit('messagesChanged', stationName)
    resultAlert?.('Posted')
  })

  // REPLY TO MESSAGES
  socket.on('replyToMessage', (stationName, messageId, text, resultAlert) => {
    const user = getUser()
    const station = state.stations.get(stationName)
    if (!user || !station) return resultAlert?.('Station not found')

    const message = text?.trim()
    if (!message) return resultAlert?.('Reply is empty')

    const { subscribed, memberOf } = user.stations
    const canReply = subscribed.includes(stationName) || memberOf?.includes(stationName)
    if (!canReply) return resultAlert?.('Subscribe or join to reply')

    const targetMessage = findMessage(station.messages, messageId)
    if (!targetMessage) {
      return resultAlert?.('Message not found')
    }

    targetMessage.replies.push(buildMessage(socket.data.username, message))
    io.emit('messagesChanged', stationName)
    resultAlert?.('Replied')
  })
}