export interface Message {
  user?: string;
  senderId?: string;
  roomId: string;
  recipientId?: string;
  content: string;
  timestamp: string;
}
