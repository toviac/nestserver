import { SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatGateway } from '../chat/chat.gateway';

@WebSocketGateway({ namespace: 'draw' })
export class DrawGateway extends ChatGateway {
  constructor() {
    super();
    this.defaultRoom = 'public';
    this.keyList = ['Monkey', 'Dog', 'Bear', 'Flower', 'Girl'];
    this.key = '';
    this.curPlayerIndex = 0;
    this.getKey();
  }

  @WebSocketServer()
  server: Server;
  defaultRoom: string;
  curPlayerIndex: number;
  keyList: string[];
  key: string;

  @SubscribeMessage('start')
  async handleStart(): Promise<any> {
    this.currentPlayer();
    return this.key;
  }

  @SubscribeMessage('drawing')
  async handleDrawing(@MessageBody() data: any): Promise<any> {
    this.server.to(this.defaultRoom).emit('drawing', data);
  }

  @SubscribeMessage('clear')
  async handleClear() {
    this.server.to(this.defaultRoom).emit('clear');
  }

  @SubscribeMessage('message')
  async handleMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket): Promise<any> {
    console.log('draw message: ', data);
    const { room = this.defaultRoom } = client.handshake.query;
    this.server.to(room).emit('message', data);
    if (data === this.key) {
      const { userName } = client.handshake.query;
      this.server.to(this.defaultRoom).emit('success', userName);
      const clientIds = this.server.sockets.adapter.rooms[this.defaultRoom].sockets;
      if (this.curPlayerIndex === [...Object.keys(clientIds)].length - 1) {
        this.endGame();
      } else {
        this.curPlayerIndex++;
      }
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

  currentPlayer() {
    const clientIds = this.server.sockets.adapter.rooms[this.defaultRoom].sockets;
    const curPlayerId = [...Object.keys(clientIds)][this.curPlayerIndex];
    this.getKey();
    this.server.to(curPlayerId).emit('key', this.key);
  }

  endGame() {
    this.server.to(this.defaultRoom).emit('end-game');
  }
}
