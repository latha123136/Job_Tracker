import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (!this.socket) {
      this.socket = io('http://localhost:5000');
      
      this.socket.on('connect', () => {
        this.isConnected = true;
        console.log('Connected to server');
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
        console.log('Disconnected from server');
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  onNewJob(callback) {
    if (this.socket) {
      this.socket.on('newJob', callback);
    }
  }

  onJobUpdated(callback) {
    if (this.socket) {
      this.socket.on('jobUpdated', callback);
    }
  }

  offNewJob(callback) {
    if (this.socket) {
      this.socket.off('newJob', callback);
    }
  }

  offJobUpdated(callback) {
    if (this.socket) {
      this.socket.off('jobUpdated', callback);
    }
  }
}

export default new SocketService();