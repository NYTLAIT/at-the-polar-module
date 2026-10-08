# at-the-polar-module
Socket.IO toolkit for research station communication themed fandom platform.

Package provides server and client utilities for:
- User connections
- Station creation
- Station subsciption and membership
- Real time messaging
- Threaded replies

## Complementary Application
https://github.com/NYTLAIT/at-the-polar

## Install
```bash
npm install at-the-polar-module
```
## Dependencies
- socket.io
- socket.io-client

# Setup
## Server Setup
Setup socket.io and call setFeatures(io). All events are handled through client. 
```js
import { Server } from 'socket.io'
import { setFeatures } from 'at-the-polar-module'

const io = new Server(server)

setFeatures(io)
```

## Client Setup
Import client socket events as needed. State is handled at server.
```js
import {
  connect,
  getStations,
  postMessage
} from 'at-the-polar-module'
```

# Client API
### connect
Connect a user and initialize the Socket.IO client.
```js
connect(username, role, onLoginSuccess)
```

### disconnect
Disconnect the current user.
```js
disconnect()
```

### getStations
Load and subscribe to station updates.
```js
getStations(setStations)
```

### createStation
Create a new station.
```js
createStation(stationName, callback)
```

### subscribeStation
Subscribe to a station.
```js
subscribeStation(stationName, callback)
```

### unsubscribeStation
Unsubscribe from a station.
```js
unsubscribeStation(stationName, callback)
```

### joinStation
Join a station as a researcher.
```js
joinStation(stationName, callback)
```

### leaveStation
Leave a station.
```js
leaveStation(stationName, callback)
```

### getMessages
Retrieve station messages and subscribe to updates.
```js
getMessages(stationName, setMessages)
```

### postMessage
Post a new station message.
```js
postMessage(stationName, text, callback)
```

### replyToMessage
Reply to an existing message.
```js
replyToMessage(stationName, messageId, text, callback)
```

# Future Improvements
- Documentation
- Optimization and organization
- Database persistence
- Authentication
- Message pagination
- Image uploads
- Search functionality




