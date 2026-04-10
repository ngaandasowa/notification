export interface User {
  userId: string;
  name: string;
  email: string;
}

export interface Card {
  cardId: string;
  userId: string;
  message: string;
  senderName: string;
  avatarUrl?: string;
  likesCount: number;
  gotItCount: number;
  sharesCount: number;
  dislikesCount: number;
  createdAt: any;
}

export interface Interaction {
  interactionId: string;
  userId: string;
  cardId: string;
  type: 'like' | 'gotIt' | 'share' | 'dislike';
}
