
const path = require('path')
const http = require('http')
const express = require('express')
const Filter = require('bad-words')
const socketio = require('socket.io')
const app = express()
const server = http.createServer(app)
const {generateMessage} = require('./utils/messages')
const { locationMessage } = require('./utils/locatoin')
const { addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath));



io.on('connection', (socket)=>{
    console.log('New WebSocket connected');


    socket.on('join', ({ username, room}, callback)=>{

        const {error, user} = addUser({ id: socket.id , username, room })

        if(error) {
           return callback(error)
        }

        socket.join(user.room)

        socket.emit('redirect', generateMessage('Welcome, newbie!'))
        socket.broadcast.to(user.room).emit('redirect', generateMessage(`${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()

    })
    socket.on('sendMessage', (received, callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(received)){
            return callback('Profanity is absolutely fucking forbidden!')
        }
        io.to(user.room).emit('redirect', generateMessage(user.username, received))
        callback("Delivered!")
    })

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('redirect', generateMessage(`${user.username} has left.`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
    
    socket.on('sendLocation', (received, callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', locationMessage(user.username, received))

        callback('location pinpointed.')
    })
    
})

server.listen(port, function( req, res){
    console.log(`Server is now up on ${port}`);
})

