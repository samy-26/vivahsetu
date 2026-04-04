import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);
  private userSocketMap = new Map<number, string>();

  constructor(private chatService: ChatService, private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];
      if (!token) { client.disconnect(); return; }
      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;
      this.userSocketMap.set(payload.sub, client.id);
      client.join(`user:${payload.sub}`);
      this.logger.log(`User ${payload.sub} connected`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) this.userSocketMap.delete(userId);
    this.logger.log(`User ${userId} disconnected`);
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: number; message: string },
  ) {
    const senderId = client.data.userId;
    try {
      const msg = await this.chatService.sendMessage(senderId, data.receiverId, data.message);
      this.server.to(`user:${data.receiverId}`).emit('new_message', msg);
      client.emit('message_sent', msg);
    } catch (err) {
      client.emit('error', { message: err.message });
    }
  }

  @SubscribeMessage('join_conversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { partnerId: number },
  ) {
    const roomId = [client.data.userId, data.partnerId].sort().join(':');
    client.join(`conversation:${roomId}`);
    client.emit('joined_conversation', { roomId });
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: number },
  ) {
    this.server
      .to(`user:${data.receiverId}`)
      .emit('user_typing', { userId: client.data.userId });
  }
}
