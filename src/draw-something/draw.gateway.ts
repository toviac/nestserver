import { SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatGateway } from '../chat/chat.gateway';
import * as keyList from '../../config/draw.config.js';

@WebSocketGateway({ namespace: 'draw' })
export class DrawGateway extends ChatGateway {
  constructor() {
    super();
    this.defaultRoom = 'public';
    this.nameSpace = 'draw';
    this.keyList = keyList;
    this.usedKeyList = [];
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
  usedKeyList: string[];
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
  @SubscribeMessage('drawing-dot')
  async handleDrawingDot(@MessageBody() data: any, @ConnectedSocket() client: Socket): Promise<any> {
    const { room } = client.handshake.query;
    client.to(room).emit('drawing-dot', data);
  }

  @SubscribeMessage('clear')
  async handleClear(@ConnectedSocket() client: Socket) {
    const { room } = client.handshake.query;
    this.server.to(room).emit('clear');
  }
  @SubscribeMessage('undo')
  async handleUndo(@ConnectedSocket() client: Socket) {
    const { room } = client.handshake.query;
    this.server.to(room).emit('undo');
  }
  @SubscribeMessage('draw-end')
  async handleDrawEnd(@ConnectedSocket() client: Socket) {
    const { room } = client.handshake.query;
    this.server.to(room).emit('draw-end');
  }

  @SubscribeMessage('message')
  async handleMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket): Promise<any> {
    const { room = this.defaultRoom } = client.handshake.query;
    client.to(room).emit('message', data);
    if (String(data.message).toLowerCase().trim() === String(this.key).toLowerCase()) {
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
    if (this.usedKeyList.length === this.keyList.length) {
      this.usedKeyList = [];
    }
    const keyIndex = Math.floor(Math.random() * this.keyList.length);
    if (this.key === this.keyList[keyIndex] || this.usedKeyList.includes(this.keyList[keyIndex])) {
      this.getKey();
      return;
    }
    this.key = this.keyList[keyIndex];
    this.usedKeyList.push(this.key);
  }

  currentPlayer(room) {
    const io: any = this.server;
    const clientIds = io.adapter.rooms[room].sockets;
    const curPlayerId = [...Object.keys(clientIds)][this.curPlayerIndex];
    const connection = io.connected[curPlayerId];
    const { userName } = connection.handshake.query;
    this.getKey();
    this.server.to(curPlayerId).emit('key', this.key);
    connection.to(room).emit('key-length', this.key.length);
    this.server.to(room).emit('game-start', { userName });
  }

  endGame(room) {
    this.server.to(room).emit('end-game');
  }
}
