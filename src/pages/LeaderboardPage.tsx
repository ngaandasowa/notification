import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, getDocs, doc } from 'firebase/firestore';
import { Card, User, Stats } from '../types';
import { Trophy, Eye, Share2, Heart, Users, TrendingUp, Loader2, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export const LeaderboardPage: React.FC = () => {
  const [topCards, setTopCards] = useState<Card[]>([]);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalViews: 0, totalCards: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'likesCount' | 'sharesCount' | 'viewsCount'>('sharesCount');

  useEffect(() => {
    // Fetch global stats
    const fetchStats = async () => {
      try {
        // In a real app, we'd have a cloud function updating this
        // For now, we'll estimate from collections
        const usersSnap = await getDocs(collection(db, 'users'));
        const cardsSnap = await getDocs(collection(db, 'cards'));
        
        let totalViews = 0;
        cardsSnap.docs.forEach(doc => {
          totalViews += (doc.data().viewsCount || 0);
        });

        setStats({
          totalUsers: usersSnap.size,
          totalCards: cardsSnap.size,
          totalViews: totalViews
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'cards'),
      orderBy(filter, 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cardsData = snapshot.docs.map(doc => doc.data() as Card);
      setTopCards(cardsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filter]);

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center">
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">Leaderboard</h1>
        </div>
        <p className="text-gray-500 max-w-2xl">
          The most viral notification cards on the platform. Share your creations to climb the ranks!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-black text-white rounded-3xl space-y-4 relative overflow-hidden group">
          <Users className="w-12 h-12 text-gray-800 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform" />
          <p className="text-xs font-black uppercase tracking-widest text-gray-500">Total Subscribers</p>
          <h3 className="text-4xl font-black tracking-tighter">{stats.totalUsers.toLocaleString()}</h3>
          <div className="flex items-center gap-2 text-[10px] font-bold text-green-400 uppercase tracking-widest">
            <TrendingUp className="w-3 h-3" />
            Growing Live
          </div>
        </div>

        <div className="p-8 bg-gray-50 border-2 border-gray-100 rounded-3xl space-y-4 relative overflow-hidden group">
          <Eye className="w-12 h-12 text-gray-200 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform" />
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Total Views</p>
          <h3 className="text-4xl font-black tracking-tighter">{stats.totalViews.toLocaleString()}</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Across all cards</p>
        </div>

        <div className="p-8 bg-gray-50 border-2 border-gray-100 rounded-3xl space-y-4 relative overflow-hidden group">
          <Bell className="w-12 h-12 text-gray-200 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform" />
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Cards Created</p>
          <h3 className="text-4xl font-black tracking-tighter">{stats.totalCards.toLocaleString()}</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Viral moments</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-4">
        {[
          { id: 'sharesCount', label: 'Most Shared', icon: Share2 },
          { id: 'likesCount', label: 'Most Liked', icon: Heart },
          { id: 'viewsCount', label: 'Most Viewed', icon: Eye },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-full text-sm font-black uppercase tracking-widest transition-all active:scale-95",
              filter === tab.id 
                ? "bg-black text-white shadow-xl" 
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leaderboard List */}
      <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-24 flex items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-black" />
          </div>
        ) : topCards.length === 0 ? (
          <div className="p-24 text-center space-y-4">
            <p className="text-gray-400 font-bold uppercase tracking-widest">No data available yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {topCards.map((card, index) => (
              <Link
                key={card.cardId}
                to={`/card/${card.cardId}`}
                className="flex items-center gap-6 p-6 hover:bg-gray-50 transition-colors group"
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black shrink-0",
                  index === 0 ? "bg-yellow-400 text-white" :
                  index === 1 ? "bg-gray-300 text-white" :
                  index === 2 ? "bg-orange-400 text-white" : "bg-gray-100 text-gray-400"
                )}>
                  {index + 1}
                </div>

                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                  {card.avatarUrl ? (
                    <img src={card.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-black">
                      <Bell className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-lg truncate uppercase tracking-tighter">{card.senderName}</h4>
                  <p className="text-gray-500 text-sm truncate">{card.message}</p>
                </div>

                <div className="flex items-center gap-8 pr-4">
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Shares</p>
                    <p className="font-black">{card.sharesCount.toLocaleString()}</p>
                  </div>
                  <div className="text-center hidden sm:block">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Likes</p>
                    <p className="font-black">{card.likesCount.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Views</p>
                    <p className="font-black">{(card.viewsCount || 0).toLocaleString()}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="p-12 bg-gray-50 rounded-[3rem] text-center space-y-6">
        <h3 className="text-2xl font-black uppercase tracking-tighter">Want to be on top?</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Create a card that resonates, share it with your friends, and watch your engagement soar. 
          The top 10 cards are featured here for everyone to see!
        </p>
        <Link
          to="/create"
          className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-black rounded-full hover:bg-gray-800 transition-all active:scale-95 shadow-xl"
        >
          Create Viral Card
        </Link>
      </div>
    </div>
  );
};
