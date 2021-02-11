import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway {
  constructor() {
    this.defaultRoom = 'public';
  }

  @WebSocketServer()
  server: Server;
  defaultRoom: string;

  handleConnection(client: Socket) {
    const { userName, userId, avatar = '', room = this.defaultRoom } = client.handshake.query;
    client.join(room);
    this.server.in(room).emit('join', {
      id: client.id,
      userInfo: { userId, userName, avatar },
    });
    console.log('connected: ', `${client.id} has joind room ${room}`);
  }

  handleDisconnect(client: any) {
    const { userName, userId, avatar = '', room = this.defaultRoom } = client.handshake.query;
    this.server.to(room).emit('leave', 'leave', {
      id: client.id,
      userInfo: { userId, userName, avatar },
    });
    console.log('disconnected: ', `${client.id} has leaved room ${room}`);
  }

  @SubscribeMessage('online-list')
  async getOnlineList(@ConnectedSocket() client: Socket): Promise<any> {
    const { room } = client.handshake.query;
    // https://stackoverflow.com/a/25028953
    const clientIds = this.server.sockets.adapter.rooms[`${room}`].sockets;
    const res = [...Object.keys(clientIds)].map(key => {
      const connection = this.server.sockets.connected[key];
      const { userId, userName, avatar = '' } = connection.handshake.query;
      return {
        userInfo: {
          userId,
          userName,
          avatar,
        },
        id: key,
      };
    });
    return res;
  }

  @SubscribeMessage('message')
  async handleMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket): Promise<any> {
    // data:
    // type: 'room',
    // id: socket.id,
    // from: {
    //   userId: socketUserId,
    //   userName: socketUserName,
    // },
    // to: 'public',
    // message,
    // timestamp: +new Date(),
    const { room = this.defaultRoom } = client.handshake.query;
    this.server.to(room).emit('message', data);
  }
}
