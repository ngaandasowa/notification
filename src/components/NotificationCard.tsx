import React from 'react';
import { Heart, Check, Share2, ThumbsDown, User } from 'lucide-react';
import { cn } from '../lib/utils';

interface NotificationCardProps {
  message: string;
  senderName: string;
  avatarUrl?: string;
  likesCount: number;
  gotItCount: number;
  sharesCount: number;
  dislikesCount: number;
  className?: string;
  onInteraction?: (type: 'like' | 'gotIt' | 'share' | 'dislike') => void;
  isInteractive?: boolean;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  message,
  senderName,
  avatarUrl,
  likesCount,
  gotItCount,
  sharesCount,
  dislikesCount,
  className,
  onInteraction,
  isInteractive = false,
}) => {
  return (
    <div
      id="notification-card"
      className={cn(
        "w-full max-w-md rounded-2xl shadow-sm overflow-hidden font-sans",
        className
      )}
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #000000'
      }}
    >
      {/* Header */}
      <div 
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid #f3f4f6' }}
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: '#000000' }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={senderName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User className="w-5 h-5" style={{ color: '#ffffff' }} />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#9ca3af' }}>Notification</span>
            <span className="text-sm font-bold leading-tight" style={{ color: '#000000' }}>{senderName}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-8 flex flex-col items-center justify-center text-center">
        <p className="text-lg font-medium leading-relaxed whitespace-pre-wrap" style={{ color: '#000000' }}>
          {message || "Your message here..."}
        </p>
      </div>

      {/* Footer */}
      <div 
        className="px-4 py-3 flex items-center justify-around"
        style={{ 
          backgroundColor: '#f9fafb',
          borderTop: '1px solid #f3f4f6'
        }}
      >
        <button
          onClick={() => onInteraction?.('like')}
          disabled={!isInteractive}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            isInteractive ? "hover:scale-110 active:scale-95" : "cursor-default"
          )}
        >
          <Heart className="w-5 h-5" style={{ color: '#000000' }} />
          <span className="text-[10px] font-bold" style={{ color: '#000000' }}>{likesCount}</span>
        </button>

        <button
          onClick={() => onInteraction?.('gotIt')}
          disabled={!isInteractive}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            isInteractive ? "hover:scale-110 active:scale-95" : "cursor-default"
          )}
        >
          <Check className="w-5 h-5" style={{ color: '#000000' }} />
          <span className="text-[10px] font-bold" style={{ color: '#000000' }}>{gotItCount}</span>
        </button>

        <button
          onClick={() => onInteraction?.('share')}
          disabled={!isInteractive}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            isInteractive ? "hover:scale-110 active:scale-95" : "cursor-default"
          )}
        >
          <Share2 className="w-5 h-5" style={{ color: '#000000' }} />
          <span className="text-[10px] font-bold" style={{ color: '#000000' }}>{sharesCount}</span>
        </button>

        <button
          onClick={() => onInteraction?.('dislike')}
          disabled={!isInteractive}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            isInteractive ? "hover:scale-110 active:scale-95" : "cursor-default"
          )}
        >
          <ThumbsDown className="w-5 h-5" style={{ color: '#000000' }} />
          <span className="text-[10px] font-bold" style={{ color: '#000000' }}>{dislikesCount}</span>
        </button>
      </div>
    </div>
  );
};
