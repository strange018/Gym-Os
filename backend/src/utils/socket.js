let io;

export const initSocket = (socketIo) => {
  io = socketIo;
};

export const emitToUser = (userId, type, data) => {
  if (io) {
    io.to(userId.toString()).emit('live_update', {
      type,
      ...data,
      timestamp: new Date()
    });
  }
};

export const broadcast = (type, data) => {
  if (io) {
    io.emit('live_update', {
      type,
      ...data,
      timestamp: new Date()
    });
  }
};
