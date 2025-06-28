const { Server } = require('socket.io');
const userModel = require('./models/user.model');
const captainModel = require('./models/captain.model');
let io;

function initializeSocket(server) {
    io = new Server(server, {
        cors: { origin: '*',
            methods: ['GET', 'POST']
         }
    });
    io.on('connection', socket => {
        console.log(`Socket connected: ${socket.id}`);
        socket.on('join',async(data)=>{
            const { userId, userType } = data;
            console.log(`User ${userId} of type ${userType} joined with socket ID: ${socket.id}`);
            if(userType === 'user') {
                await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
            } else if(userType === 'captain') {
                await captainModel.findByIdAndUpdate(userId, { socketId: socket.id });
            }
        });
        socket.on('update-location-captain', async (data) => {
            const { userId, location } = data;
            console.log(`Updating location for captain ${userId}:`, location);
            try {
                if (!location || !location.ltd || !location.lng) {
                    return socket.emit('error', 'Invalid location data');
                }
                await captainModel.findByIdAndUpdate(userId, { 
                    location:{
                        ltd: location.ltd,
                        lng: location.lng
                    }
                 });
            } catch (error) {
                console.error('Error updating captain location:', error);
            }
        });
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
}

function sendMessage(socketId, messageobject) {
    console.log(`Sending message to socket ${socketId}:`, messageobject);
    if (io) {
        io.to(socketId).emit(messageobject.event, messageobject.data);
    }
    else {
        console.error('Socket.io not initialized');
    }
}

module.exports = { initializeSocket, sendMessage };
