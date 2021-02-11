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
    console.log('connected: ', client.id);
    client.join(this.defaultRoom);
    const { userName, userId, avatar = '' } = client.handshake.query;
    this.server.to(this.defaultRoom).emit('join', {
      id: client.id,
      userInfo: { userId, userName, avatar },
    });
  }

  handleDisconnect(client: any) {
    console.log('disconnected: ', client.id);
    const { userName, userId, avatar = '' } = client.handshake.query;
    this.server.to(this.defaultRoom).emit('leave', 'leave', {
      id: client.id,
      userInfo: { userId, userName, avatar },
    });
  }

  @SubscribeMessage('online-list')
  async getOnlineList(): Promise<any> {
    const { connected } = this.server.in(this.defaultRoom);
    const res = [...Object.keys(connected)].map(key => {
      const connection = connected[key];
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
    this.server.to('public').emit('message', data);
  }
}
