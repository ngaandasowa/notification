import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ArrowRight, Share2, Heart, Check, ThumbsDown, Download, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { NotificationCard } from '../components/NotificationCard';
import html2canvas from 'html2canvas';

const SAMPLES = [
  {
    senderName: "Shaq",
    message: "Don't let them outwork you. The grind never stops. 🏀",
    likesCount: 1240,
    gotItCount: 850,
    sharesCount: 420,
    dislikesCount: 12,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop"
  },
  {
    senderName: "Mom",
    message: "Did you eat today? I left some food in the fridge. Love you! ❤️",
    likesCount: 520,
    gotItCount: 980,
    sharesCount: 150,
    dislikesCount: 2,
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"
  },
  {
    senderName: "System",
    message: "New Achievement Unlocked: Viral Creator. Keep it up! 🚀",
    likesCount: 890,
    gotItCount: 450,
    sharesCount: 310,
    dislikesCount: 5,
    avatarUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=200&h=200&fit=crop"
  }
];

export const LandingPage: React.FC = () => {
  const sampleRefs = useRef<(HTMLDivElement | null)[]>([]);

  const downloadSample = async (index: number, name: string) => {
    const element = sampleRefs.current[index];
    if (!element) return;

    try {
      // Small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: false,
      });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `sample-${name.toLowerCase()}.png`;
      link.click();
    } catch (err) {
      console.error('Failed to download sample:', err);
    }
  };

  return (
    <div className="flex flex-col items-center py-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl text-center mb-24"
      >
        <h1 className="text-6xl sm:text-8xl font-black tracking-tighter text-black mb-8 leading-[0.9]">
          NOTIFY THE <br /> WORLD.
        </h1>
        
        <p className="text-xl text-gray-500 mb-12 max-w-xl mx-auto leading-relaxed">
          Create minimal, high-impact notification cards. Export as images or share interactive links. Designed for virality.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/create"
            className="group flex items-center gap-2 px-10 py-5 bg-black text-white text-lg font-black rounded-full hover:bg-gray-800 transition-all hover:scale-105 active:scale-95"
          >
            Create Notification
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/dashboard"
            className="px-10 py-5 bg-white border-2 border-black text-black text-lg font-black rounded-full hover:bg-gray-50 transition-all active:scale-95"
          >
            View Dashboard
          </Link>
        </div>
      </motion.div>

      {/* Templates Section */}
      <div className="w-full max-w-6xl px-4 mb-32">
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
            <Sparkles className="w-4 h-4" />
            Popular Templates
          </div>
          <h2 className="text-4xl font-black tracking-tighter uppercase">Get Inspired</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SAMPLES.map((sample, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="group relative flex flex-col items-center"
            >
              <div ref={el => sampleRefs.current[i] = el} className="w-full">
                <NotificationCard {...sample} />
              </div>
              
              <button
                onClick={() => downloadSample(i, sample.senderName)}
                className="mt-6 flex items-center gap-2 px-6 py-3 bg-gray-100 text-black text-xs font-black uppercase tracking-widest rounded-full hover:bg-black hover:text-white transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-4xl">
        {[
          { icon: Heart, label: "Engagement" },
          { icon: Check, label: "Verification" },
          { icon: Share2, label: "Virality" },
          { icon: ThumbsDown, label: "Feedback" }
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
              <feature.icon className="w-6 h-6 text-black" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{feature.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
