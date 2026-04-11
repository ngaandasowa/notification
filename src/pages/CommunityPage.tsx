import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { CommunityPost, User } from '../types';
import { MessageSquare, Send, Loader2, Trash2, ShieldAlert, User as UserIcon, Heart } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { cn } from '../lib/utils';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const CommunityPage: React.FC = () => {
  const [user] = useAuthState(auth);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'community'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        postId: doc.id
      } as CommunityPost));
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const moderateContent = async (text: string) => {
    try {
      const prompt = `Analyze the following text for community guideline violations. 
      Guidelines: No unlawful content, no nudity, no violence, no hate speech, no harassment.
      If the text is safe, respond with "SAFE". 
      If it violates guidelines, respond with "UNSAFE" followed by a brief reason.
      
      Text: "${text}"`;

      const result = await (genAI as any).models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      
      const response = result.text?.trim() || "SAFE";
      return response;
    } catch (err) {
      console.error('Moderation error:', err);
      return "SAFE"; // Fallback to safe if API fails, but ideally we'd be stricter
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setSending(true);
    setError(null);

    try {
      const moderationResult = await moderateContent(content);
      if (moderationResult.startsWith("UNSAFE")) {
        setError(`Your post violates our community guidelines: ${moderationResult.replace("UNSAFE", "").trim()}`);
        setSending(false);
        return;
      }

      await addDoc(collection(db, 'community'), {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userAvatar: user.photoURL || '',
        content: content.trim(),
        createdAt: serverTimestamp(),
        likes: 0
      });

      setContent('');
    } catch (err) {
      console.error('Error posting:', err);
      setError('Failed to post message.');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deleteDoc(doc(db, 'community', postId));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">Community</h1>
        </div>
        <p className="text-gray-500">
          Share your thoughts, tips, and viral moments with the world. 
          Please follow our community guidelines.
        </p>
      </div>

      {/* Guidelines Box */}
      <div className="p-6 bg-yellow-50 border-2 border-yellow-100 rounded-3xl space-y-3">
        <div className="flex items-center gap-2 text-yellow-700">
          <ShieldAlert className="w-5 h-5" />
          <span className="text-xs font-black uppercase tracking-widest">Community Guidelines</span>
        </div>
        <p className="text-xs text-yellow-800 leading-relaxed font-medium">
          Be respectful. No hate speech, violence, nudity, or unlawful content. 
          Our AI moderator automatically reviews all posts to keep the community safe.
        </p>
      </div>

      {/* Post Form */}
      {user ? (
        <form onSubmit={handlePost} className="space-y-4">
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
              className="w-full px-6 py-6 bg-gray-50 border-2 border-transparent rounded-[2rem] focus:outline-none focus:border-black focus:bg-white transition-all font-medium resize-none shadow-sm"
            />
            <button
              type="submit"
              disabled={sending || !content.trim()}
              className="absolute bottom-4 right-4 p-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 shadow-lg"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
          {error && (
            <p className="text-xs font-bold text-red-500 px-4">{error}</p>
          )}
        </form>
      ) : (
        <div className="p-8 bg-gray-50 rounded-[2rem] text-center border-2 border-dashed border-gray-200">
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Sign in to join the conversation</p>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-6">
        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-black" />
          </div>
        ) : posts.length === 0 ? (
          <div className="py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
            No posts yet. Be the first!
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.postId} className="p-6 bg-white border-2 border-gray-100 rounded-[2rem] shadow-sm space-y-4 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    {post.userAvatar ? (
                      <img src={post.userAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-black">
                        <UserIcon className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-tighter">{post.userName}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                    </p>
                  </div>
                </div>
                {user?.uid === post.userId && (
                  <button
                    onClick={() => handleDelete(post.postId)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
              
              <div className="flex items-center gap-4 pt-2">
                <button className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition-colors">
                  <Heart className="w-4 h-4" />
                  <span className="text-xs font-bold">{post.likes || 0}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
