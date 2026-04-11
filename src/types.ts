export interface User {
  userId: string;
  name: string;
  email: string;
  username?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt?: any;
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
  viewsCount?: number;
  createdAt: any;
  imageUrl?: string;
}

export interface CommunityPost {
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: any;
  likes?: number;
}

export interface Stats {
  totalUsers: number;
  totalViews: number;
  totalCards: number;
}

export interface Interaction {
  interactionId: string;
  userId: string;
  cardId: string;
  type: 'like' | 'gotIt' | 'share' | 'dislike';
}
