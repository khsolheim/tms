import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

export interface SocketUser {
  id: string;
  email: string;
  bedriftId: string;
  role: string;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: Date;
  userId?: string;
  bedriftId?: string;
}

export class WebSocketManager {
  private io: SocketIOServer;
  private connectedUsers: Map<string, SocketUser> = new Map();
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> socketIds

  constructor(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware(): void {
    // Authentication middleware
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        socket.data.user = decoded;
        next();
      } catch (error) {
        next(new Error('Invalid authentication token'));
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      const user: SocketUser = socket.data.user;
      
      console.log(`🔌 User connected: ${user.email} (${socket.id})`);
      
      // Store user connection
      this.connectedUsers.set(socket.id, user);
      
      if (!this.userSockets.has(user.id)) {
        this.userSockets.set(user.id, new Set());
      }
      this.userSockets.get(user.id)!.add(socket.id);

      // Join user-specific and company-specific rooms
      socket.join(`user:${user.id}`);
      socket.join(`company:${user.bedriftId}`);
      socket.join(`role:${user.role}`);

      // Send welcome message
      socket.emit('connected', {
        message: 'Connected to TMS WebSocket',
        userId: user.id,
        timestamp: new Date()
      });

      // Handle custom events
      socket.on('subscribe', (data) => {
        this.handleSubscribe(socket, data);
      });

      socket.on('unsubscribe', (data) => {
        this.handleUnsubscribe(socket, data);
      });

      socket.on('message', (data) => {
        this.handleMessage(socket, data);
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log(`🔌 User disconnected: ${user.email} (${reason})`);
        
        this.connectedUsers.delete(socket.id);
        
        const userSocketSet = this.userSockets.get(user.id);
        if (userSocketSet) {
          userSocketSet.delete(socket.id);
          if (userSocketSet.size === 0) {
            this.userSockets.delete(user.id);
          }
        }
      });
    });
  }

  private handleSubscribe(socket: any, data: { channels: string[] }): void {
    const user = this.connectedUsers.get(socket.id);
    if (!user) return;

    for (const channel of data.channels) {
      // Validate channel access
      if (this.canAccessChannel(user, channel)) {
        socket.join(channel);
        console.log(`📺 User ${user.email} subscribed to ${channel}`);
      } else {
        socket.emit('error', {
          message: `Access denied to channel: ${channel}`,
          timestamp: new Date()
        });
      }
    }
  }

  private handleUnsubscribe(socket: any, data: { channels: string[] }): void {
    const user = this.connectedUsers.get(socket.id);
    if (!user) return;

    for (const channel of data.channels) {
      socket.leave(channel);
      console.log(`📺 User ${user.email} unsubscribed from ${channel}`);
    }
  }

  private handleMessage(socket: any, data: WebSocketMessage): void {
    const user = this.connectedUsers.get(socket.id);
    if (!user) return;

    // Add user context to message
    const message: WebSocketMessage = {
      ...data,
      userId: user.id,
      bedriftId: user.bedriftId,
      timestamp: new Date()
    };

    // Handle different message types
    switch (message.type) {
      case 'chat':
        this.handleChatMessage(socket, message);
        break;
      case 'notification':
        this.handleNotification(socket, message);
        break;
      case 'status_update':
        this.handleStatusUpdate(socket, message);
        break;
      default:
        console.log(`📨 Unknown message type: ${message.type}`);
    }
  }

  private handleChatMessage(socket: any, message: WebSocketMessage): void {
    const user = this.connectedUsers.get(socket.id);
    if (!user) return;

    // Broadcast to company channel
    this.io.to(`company:${user.bedriftId}`).emit('chat_message', {
      ...message,
      senderName: user.email,
      senderRole: user.role
    });
  }

  private handleNotification(socket: any, message: WebSocketMessage): void {
    const user = this.connectedUsers.get(socket.id);
    if (!user) return;

    // Send notification to specific user or broadcast
    if (message.data.targetUserId) {
      this.sendToUser(message.data.targetUserId, 'notification', message.data);
    } else {
      this.io.to(`company:${user.bedriftId}`).emit('notification', message);
    }
  }

  private handleStatusUpdate(socket: any, message: WebSocketMessage): void {
    const user = this.connectedUsers.get(socket.id);
    if (!user) return;

    // Broadcast status update to company
    this.io.to(`company:${user.bedriftId}`).emit('status_update', {
      userId: user.id,
      userEmail: user.email,
      status: message.data.status,
      timestamp: message.timestamp
    });
  }

  private canAccessChannel(user: SocketUser, channel: string): boolean {
    // Basic channel access control
    if (channel.startsWith('company:')) {
      const companyId = channel.split(':')[1];
      return user.bedriftId === companyId;
    }

    if (channel.startsWith('user:')) {
      const userId = channel.split(':')[1];
      return user.id === userId;
    }

    if (channel.startsWith('role:')) {
      const role = channel.split(':')[1];
      return user.role === role || user.role === 'ADMIN';
    }

    // Public channels
    if (channel.startsWith('public:')) {
      return true;
    }

    return false;
  }

  // Public methods for sending messages

  sendToUser(userId: string, event: string, data: any): void {
    this.io.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: new Date()
    });
  }

  sendToCompany(bedriftId: string, event: string, data: any): void {
    this.io.to(`company:${bedriftId}`).emit(event, {
      ...data,
      timestamp: new Date()
    });
  }

  sendToRole(role: string, event: string, data: any): void {
    this.io.to(`role:${role}`).emit(event, {
      ...data,
      timestamp: new Date()
    });
  }

  broadcast(event: string, data: any): void {
    this.io.emit(event, {
      ...data,
      timestamp: new Date()
    });
  }

  // Send notification to specific users
  sendNotification(userIds: string[], notification: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    data?: any;
  }): void {
    for (const userId of userIds) {
      this.sendToUser(userId, 'notification', notification);
    }
  }

  // Send real-time updates for specific events
  sendQuizCompleted(bedriftId: string, data: {
    userId: string;
    quizId: string;
    score: number;
    passed: boolean;
  }): void {
    this.sendToCompany(bedriftId, 'quiz_completed', data);
  }

  sendSikkerhetskontrollCompleted(bedriftId: string, data: {
    userId: string;
    kontrollId: string;
    status: string;
  }): void {
    this.sendToCompany(bedriftId, 'sikkerhetskontroll_completed', data);
  }

  sendInvoiceStatusUpdate(bedriftId: string, data: {
    invoiceId: string;
    status: string;
    updatedBy: string;
  }): void {
    this.sendToCompany(bedriftId, 'invoice_status_update', data);
  }

  sendAttendanceUpdate(bedriftId: string, data: {
    employeeId: string;
    type: string;
    timestamp: Date;
  }): void {
    this.sendToCompany(bedriftId, 'attendance_update', data);
  }

  // Get connection statistics
  getStats(): {
    totalConnections: number;
    uniqueUsers: number;
    companiesOnline: Set<string>;
  } {
    const companiesOnline = new Set<string>();
    
    for (const user of this.connectedUsers.values()) {
      companiesOnline.add(user.bedriftId);
    }

    return {
      totalConnections: this.connectedUsers.size,
      uniqueUsers: this.userSockets.size,
      companiesOnline
    };
  }

  // Get connected users for a company
  getCompanyUsers(bedriftId: string): SocketUser[] {
    return Array.from(this.connectedUsers.values())
      .filter(user => user.bedriftId === bedriftId);
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }
}

// Global WebSocket manager instance (will be initialized in each service)
export let webSocketManager: WebSocketManager | null = null;

export function initializeWebSocket(server: HttpServer): WebSocketManager {
  webSocketManager = new WebSocketManager(server);
  console.log('🔌 WebSocket manager initialized');
  return webSocketManager;
}

export function getWebSocketManager(): WebSocketManager | null {
  return webSocketManager;
} 