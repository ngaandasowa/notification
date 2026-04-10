import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { NotificationCard } from '../components/NotificationCard';
import { Plus, Trash2, ExternalLink, Loader2, Bell, Grid, List } from 'lucide-react';
import { Card } from '../types';

export const Dashboard: React.FC = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'cards'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cardsData = snapshot.docs.map((doc) => doc.data() as Card);
      setCards(cardsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (cardId: string) => {
    // In a real app, use a custom modal. For now, we'll just delete.
    try {
      await deleteDoc(doc(db, 'cards', cardId));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-tighter uppercase">Dashboard</h1>
          <p className="text-gray-500">Manage your notification cards and track engagement.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-black'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-black'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          <Link
            to="/create"
            className="flex items-center gap-2 px-6 py-3 bg-black text-white font-black rounded-full hover:bg-gray-800 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            New Card
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-12 h-12 animate-spin text-black" />
        </div>
      ) : cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-6 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center">
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase tracking-tighter">No Cards Yet</h3>
            <p className="text-gray-500 max-w-xs mx-auto">Start by creating your first notification card to see it here.</p>
          </div>
          <Link
            to="/create"
            className="px-8 py-3 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all"
          >
            Create My First Card
          </Link>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8" : "space-y-6"}>
          {cards.map((card) => (
            <div key={card.cardId} className="group relative">
              <div className="transition-transform group-hover:scale-[1.02]">
                <NotificationCard
                  message={card.message}
                  senderName={card.senderName}
                  avatarUrl={card.avatarUrl}
                  likesCount={card.likesCount}
                  gotItCount={card.gotItCount}
                  sharesCount={card.sharesCount}
                  dislikesCount={card.dislikesCount}
                  className={viewMode === 'list' ? "max-w-none" : ""}
                />
              </div>
              
              <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  to={`/card/${card.cardId}`}
                  className="p-2 bg-white border border-gray-200 text-black rounded-lg hover:bg-gray-50 transition-all shadow-lg"
                  title="View Public Page"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(card.cardId)}
                  className="p-2 bg-white border border-gray-200 text-black rounded-lg hover:bg-gray-50 transition-all shadow-lg"
                  title="Delete Card"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
