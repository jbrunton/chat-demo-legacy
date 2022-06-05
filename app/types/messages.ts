export interface Message {
  user?: string;
  senderId?: string;
  recipientId?: string;
  content: string;
  timestamp: string;
}
