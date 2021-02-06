import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatRoomGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    console.log('connected: ', client.id);
  }

  handleDisconnect(client: any) {
    console.log('disconnected: ', client.id);
  }

  @SubscribeMessage('createRoom')
  createRoom(@MessageBody() data: any, @ConnectedSocket() socket: Socket): WsResponse<unknown> {
    socket.join('aRoom');
    socket.to('aRoom').emit('roomCreated', { room: 'aRoom' });
    return { event: 'roomCreated', data: 'aRoom' };
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket): WsResponse<unknown> {
    const event = 'message';
    client.emit('');
    return { event, data };
  }
}
