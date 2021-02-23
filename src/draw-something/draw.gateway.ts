import { SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatGateway } from '../chat/chat.gateway';

@WebSocketGateway({ namespace: 'draw' })
export class DrawGateway extends ChatGateway {
  constructor() {
    super();
    this.defaultRoom = 'public';
    this.nameSpace = 'draw';
    this.keyList = ['Monkey', 'Dog', 'Bear', 'Flower', 'Girl'];
    this.key = '';
    this.curPlayerIndex = 0;
    this.getKey();
  }

  @WebSocketServer()
  server: Server;
  defaultRoom: string;
  nameSpace: string;
  curPlayerIndex: number;
  keyList: string[];
  key: string;

  @SubscribeMessage('start')
  async handleStart(@ConnectedSocket() client: Socket): Promise<any> {
    const { room } = client.handshake.query;
    this.currentPlayer(room);
  }

  @SubscribeMessage('drawing')
  async handleDrawing(@MessageBody() data: any, @ConnectedSocket() client: Socket): Promise<any> {
    const { room } = client.handshake.query;
    client.to(room).emit('drawing', data);
  }

  @SubscribeMessage('clear')
  async handleClear(@ConnectedSocket() client: Socket) {
    const { room } = client.handshake.query;
    this.server.to(room).emit('clear');
  }

  @SubscribeMessage('message')
  async handleMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket): Promise<any> {
    const { room = this.defaultRoom } = client.handshake.query;
    client.to(room).emit('message', data);
    if (String(data.message).toLowerCase().trim() === this.key) {
      const { userName } = client.handshake.query;
      this.server.to(room).emit('won', userName);
      const io: any = this.server;
      const clientIds = io.adapter.rooms[room].sockets;
      if (this.curPlayerIndex === [...Object.keys(clientIds)].length - 1) {
        // this.endGame(room);
        this.curPlayerIndex = 0;
      } else {
        this.curPlayerIndex++;
      }
      this.currentPlayer(room);
    }
  }

  getKey() {
    const keyIndex = Math.floor(Math.random() * this.keyList.length);
    if (this.key === this.keyList[keyIndex]) {
      this.getKey();
      return;
    }
    this.key = this.keyList[keyIndex];
  }

  currentPlayer(room) {
    const io: any = this.server;
    const clientIds = io.adapter.rooms[room].sockets;
    const curPlayerId = [...Object.keys(clientIds)][this.curPlayerIndex];
    const connection = io.connected[curPlayerId];
    const { userName } = connection.handshake.query;
    this.getKey();
    this.server.to(room).emit('game-start', { userName });
    this.server.to(curPlayerId).emit('key', this.key);
  }

  endGame(room) {
    this.server.to(room).emit('end-game');
  }
}
