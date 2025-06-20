import { Server } from 'socket.io';

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
    res.end();
    return;
  }

  const io = new Server(res.socket.server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  res.socket.server.io = io;

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('joinEmergencyRoom', () => {
      socket.join('emergency-room');
      console.log(`Client ${socket.id} joined emergency room`);
    });

    socket.on('emergencyUpdate', (data) => {
      io.to('emergency-room').emit('emergencyUpdate', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  console.log('Socket server started');
  res.end();
};

export default SocketHandler; 