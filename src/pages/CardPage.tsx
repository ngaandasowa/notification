import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, setDoc, onSnapshot, runTransaction } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { NotificationCard } from '../components/NotificationCard';
import { Share2, Copy, Check, ArrowLeft, Loader2, Download, MessageCircle } from 'lucide-react';
import { Card } from '../types';
import html2canvas from 'html2canvas';

export const CardPage: React.FC = () => {
  const { cardId } = useParams<{ cardId: string }>();
  const [user] = useAuthState(auth);
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [interacting, setInteracting] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardId) return;

    const unsubscribe = onSnapshot(doc(db, 'cards', cardId), (doc) => {
      if (doc.exists()) {
        setCard(doc.data() as Card);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [cardId]);

  const handleInteraction = async (type: 'like' | 'gotIt' | 'share' | 'dislike') => {
    if (!user || !cardId || interacting) return;
    setInteracting(true);

    const interactionId = `${user.uid}_${cardId}_${type}`;
    const interactionRef = doc(db, 'interactions', interactionId);
    const cardRef = doc(db, 'cards', cardId);

    try {
      const interactionDoc = await getDoc(interactionRef);
      if (interactionDoc.exists()) {
        console.warn("Already interacted");
        return;
      }

      await runTransaction(db, async (transaction) => {
        const cardDoc = await transaction.get(cardRef);
        if (!cardDoc.exists()) throw "Document does not exist!";

        const currentCount = cardDoc.data()[`${type}Count`] || 0;
        transaction.update(cardRef, { [`${type}Count`]: currentCount + 1 });
        transaction.set(interactionRef, {
          interactionId,
          userId: user.uid,
          cardId,
          type,
        });
      });
    } catch (err) {
      console.error('Interaction error:', err);
    } finally {
      setInteracting(false);
    }
  };

  const handleShare = async () => {
    if (!cardId) return;
    
    // Increment share count
    const cardRef = doc(db, 'cards', cardId);
    const interactionId = `${user?.uid || 'anon'}_${cardId}_share_${Date.now()}`;
    const interactionRef = doc(db, 'interactions', interactionId);

    try {
      await runTransaction(db, async (transaction) => {
        const cardDoc = await transaction.get(cardRef);
        if (!cardDoc.exists()) throw "Document does not exist!";
        
        const currentCount = cardDoc.data().sharesCount || 0;
        transaction.update(cardRef, { sharesCount: currentCount + 1 });
        
        if (user) {
          transaction.set(interactionRef, {
            interactionId,
            userId: user.uid,
            cardId,
            type: 'share',
          });
        }
      });

      const url = window.location.href;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Check out this notification: ${url}`)}`;
      window.open(whatsappUrl, '_blank');
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPNG = async () => {
    if (!cardRef.current) return;
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('PNG generation timed out')), 10000)
    );

    const generationPromise = html2canvas(cardRef.current, {
      backgroundColor: null,
      scale: 2,
      logging: true,
      useCORS: true,
      allowTaint: true,
      onclone: (clonedDoc) => {
        const element = clonedDoc.getElementById('notification-card');
        if (element) {
          element.style.visibility = 'visible';
          element.style.display = 'block';
        }
      }
    });

    try {
      const canvas = await Promise.race([generationPromise, timeoutPromise]) as HTMLCanvasElement;
      const pngData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngData;
      link.download = `notification-${cardId}.png`;
      link.click();
    } catch (err) {
      console.error('PNG generation error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-black" />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Card Not Found</h1>
        <p className="text-gray-500">The notification card you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="px-8 py-3 bg-black text-white font-bold rounded-full">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400">
          <div className="w-2 h-2 bg-black rounded-full" />
          Public View
        </div>
      </div>

      <div className="flex flex-col items-center space-y-8">
        <div ref={cardRef} className="w-full flex justify-center">
          <NotificationCard
            message={card.message}
            senderName={card.senderName}
            avatarUrl={card.avatarUrl}
            likesCount={card.likesCount}
            gotItCount={card.gotItCount}
            sharesCount={card.sharesCount}
            dislikesCount={card.dislikesCount}
            isInteractive={!!user}
            onInteraction={handleInteraction}
            className="shadow-2xl"
          />
        </div>

        {!user && (
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              <Link to="/auth" className="text-black underline">Sign in</Link> to interact with this card
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-black text-white font-black rounded-2xl hover:bg-gray-800 transition-all active:scale-95"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp
          </button>
          
          <button
            onClick={copyLink}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-black text-black font-black rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>

          <button
            onClick={downloadPNG}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 text-black font-black rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
          >
            <Download className="w-5 h-5" />
            Save PNG
          </button>
        </div>
      </div>

      <div className="p-8 bg-black text-white rounded-3xl space-y-4">
        <h3 className="text-xl font-black uppercase tracking-tighter">Viral Loop</h3>
        <p className="text-sm text-gray-400 leading-relaxed">
          Share this card with your friends. Every interaction is tracked in real-time. 
          The more it's shared, the more visibility it gets.
        </p>
        <div className="flex items-center gap-4 pt-4">
          <div className="flex flex-col">
            <span className="text-2xl font-black">{card.sharesCount}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total Shares</span>
          </div>
          <div className="w-px h-10 bg-gray-800" />
          <div className="flex flex-col">
            <span className="text-2xl font-black">{card.likesCount + card.gotItCount}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Positive Vibes</span>
          </div>
        </div>
      </div>
    </div>
  );
};
