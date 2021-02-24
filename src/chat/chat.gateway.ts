import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '' })
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
    this.server.to(room).emit('leave', {
      id: client.id,
      userInfo: { userId, userName, avatar },
    });
    console.log('disconnected: ', `${client.id} has left room ${room}`);
  }

  @SubscribeMessage('online-list')
  async getOnlineList(@ConnectedSocket() client: Socket): Promise<any> {
    const { room } = client.handshake.query;
    // https://stackoverflow.com/a/25028953
    // @type/socket.io里的Server类型判断与实际不符, 这里的server可能是io.of('...')
    const io: any = this.server;
    const clientIds = io.adapter.rooms[`${room}`].sockets;
    const res = [...Object.keys(clientIds)].map(key => {
      const connection = io.connected[key];
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
    client.to(room).emit('message', data);
  }
}
