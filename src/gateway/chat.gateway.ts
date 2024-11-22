import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { group } from 'console';

@WebSocketGateway(8081, {
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private prisma: PrismaClient = new PrismaClient();

  handleConnection(socket: Socket) {
    // console.log(`Client connected: ${socket.id}`);
  }
  handleDisconnect(socket: Socket) {
    // console.log(`Client disconnected: ${socket.id}`);
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(socket: Socket, roomId: string) {
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });

    await socket.join(roomId);

    const chatHistory = await this.prisma.chat.findMany({
      where: {
        room_id: roomId,
      },
      include: {
        Employees: {
          select: {
            employee_id: true,
            avatar: true,
            full_name: true,
          },
        },
      },
    });

    this.server.to(roomId).emit('load-chat', chatHistory);
  }

  @SubscribeMessage('send-mess')
  async handleMessage(socket: Socket, data: any) {
    // console.log(data);
    const newChat = {
      employee_id: data.user_id,
      content: data.content,
      room_id: data.roomId,
      date_chat: new Date(),
    };
    await this.prisma.chat.create({ data: newChat });
    // Log sau khi lưu
    // console.log('Saved chat to DB:', createdChat);

    this.server.to(data.roomId).emit('mess-server', newChat);
  }

  @SubscribeMessage('join-group')
  async handleJoinGroup(socket: Socket, projectId: number) {
    const room = `project-${projectId}`;
    socket.join(room);

    const chatHistory = await this.prisma.group_Chat_Messages.findMany({
      where: { group_id: projectId },
      include: {
        Employees: {
          select: {
            employee_id: true,
            avatar: true,
            full_name: true,
          },
        },
      },
    });

    socket.emit('load-chat', chatHistory);
  }

  @SubscribeMessage('group-message')
  async handleGroupMessage(socket: Socket, message: any) {
    const { projectId, content, senderId } = message;
    const room = `project-${projectId}`;

    const chatMessage = await this.prisma.group_Chat_Messages.create({
      data: {
        content,
        sender_id: senderId,
        group_id: projectId,
        sent_at: new Date(),
      },
    });

    this.server.to(room).emit('group-message', chatMessage);
  }
}
