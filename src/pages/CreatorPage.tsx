import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase';
import { collection, setDoc, serverTimestamp, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuthState } from 'react-firebase-hooks/auth';
import { NotificationCard } from '../components/NotificationCard';
import { Camera, Download, Loader2, Sparkles, Save, RotateCcw } from 'lucide-react';
import html2canvas from 'html2canvas';

export const CreatorPage: React.FC = () => {
  const [user, authLoading] = useAuthState(auth);
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Load draft and profile on mount
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      // Load draft from localStorage
      const savedDraft = localStorage.getItem(`draft_${user.uid}`);
      if (savedDraft) {
        const { message: m, senderName: s, avatarPreview: a } = JSON.parse(savedDraft);
        setMessage(m || '');
        setSenderName(s || '');
        setAvatarPreview(a || null);
      }

      // If senderName is empty, try to use profile name
      if (!senderName) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setSenderName(userData.name || userData.username || '');
          if (!avatarPreview) {
            setAvatarPreview(userData.avatarUrl || null);
          }
        }
      }
    };

    loadData();
  }, [user]);

  // Auto-save draft
  useEffect(() => {
    if (!user) return;
    const draft = { message, senderName, avatarPreview };
    localStorage.setItem(`draft_${user.uid}`, JSON.stringify(draft));
    setDraftSaved(true);
    const timer = setTimeout(() => setDraftSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [message, senderName, avatarPreview, user]);

  const clearDraft = () => {
    if (window.confirm('Clear current draft?')) {
      setMessage('');
      setSenderName('');
      setAvatarPreview(null);
      setAvatar(null);
      if (user) localStorage.removeItem(`draft_${user.uid}`);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generatePNG = async () => {
    if (!cardRef.current) return null;
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('PNG generation timed out')), 10000)
    );

    const generationPromise = html2canvas(cardRef.current, {
      backgroundColor: null,
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: false,
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
      return canvas.toDataURL('image/png');
    } catch (err) {
      console.error('PNG generation error:', err);
      return null;
    }
  };

  const handleCreate = async () => {
    if (!user || !message || !senderName) return;
    setLoading(true);
    console.log('Starting card creation process...');

    try {
      let avatarUrl = '';
      if (avatar) {
        try {
          console.log('Uploading avatar to Storage...');
          const avatarRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${avatar.name}`);
          
          // Add a timeout for the upload
          const uploadPromise = uploadBytes(avatarRef, avatar);
          const uploadTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Avatar upload timed out')), 5000)
          );

          await Promise.race([uploadPromise, uploadTimeout]);
          
          const downloadUrlPromise = getDownloadURL(avatarRef);
          const downloadUrlTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Get download URL timed out')), 3000)
          );

          avatarUrl = await Promise.race([downloadUrlPromise, downloadUrlTimeout]) as string;
          console.log('Avatar uploaded successfully:', avatarUrl);
        } catch (storageErr) {
          console.error('Storage upload failed or timed out:', storageErr);
          // Continue without avatar if upload fails
        }
      }

      console.log('Preparing card document...');
      const cardsRef = collection(db, 'cards');
      const newCardRef = doc(cardsRef);
      const cardId = newCardRef.id;

      console.log('Generating card image for SEO...');
      const pngData = await generatePNG();
      let imageUrl = '';
      if (pngData) {
        try {
          const imageRef = ref(storage, `cards/${cardId}.png`);
          const response = await fetch(pngData);
          const blob = await response.blob();
          await uploadBytes(imageRef, blob);
          imageUrl = await getDownloadURL(imageRef);
          console.log('Card image uploaded for SEO:', imageUrl);
        } catch (e) {
          console.warn('Failed to upload card image for SEO:', e);
        }
      }

      const cardData = {
        cardId,
        userId: user.uid,
        message,
        senderName,
        avatarUrl,
        imageUrl,
        likesCount: 0,
        gotItCount: 0,
        sharesCount: 0,
        dislikesCount: 0,
        viewsCount: 0,
        createdAt: serverTimestamp(),
      };

      console.log('Saving to Firestore...');
      const firestorePromise = setDoc(newCardRef, cardData);
      const firestoreTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firestore write timed out')), 8000)
      );

      await Promise.race([firestorePromise, firestoreTimeout]);
      
      // Update global stats
      try {
        await updateDoc(doc(db, 'stats', 'global'), {
          totalCards: increment(1)
        });
      } catch (e) {
        console.warn('Failed to update global stats:', e);
      }

      console.log('Firestore save successful');

      // Clear draft after successful creation
      localStorage.removeItem(`draft_${user.uid}`);

      console.log('Navigating to card page...');
      navigate(`/card/${cardId}`);
    } catch (err: any) {
      console.error('Critical error in handleCreate:', err);
      let errorMessage = 'Failed to create card.';
      if (err.message && err.message.includes('permission')) {
        errorMessage += ' Permission denied. Please check your account.';
      } else if (err.message && err.message.includes('timed out')) {
        errorMessage += ' The operation timed out. Please check your internet connection.';
      }
      alert(errorMessage + ' Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-black" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      <div className="space-y-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-black tracking-tighter uppercase">Create Card</h1>
            <div className="flex items-center gap-2">
              {draftSaved && (
                <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1">
                  <Save className="w-3 h-3" />
                  Saved
                </span>
              )}
              <button 
                onClick={clearDraft}
                className="p-2 text-gray-400 hover:text-black transition-colors"
                title="Clear Draft"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-gray-500">Design your notification-style message.</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Sender Name</label>
            <input
              type="text"
              placeholder="e.g. Shaq, Mom, Boss"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-black focus:bg-white transition-all font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Message Text</label>
            <textarea
              placeholder="What's the message?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-black focus:bg-white transition-all font-medium resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Optional Avatar</label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 hover:border-black hover:bg-gray-50 transition-all">
                <Camera className="w-6 h-6 text-gray-400" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
              {avatarPreview && (
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-black">
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <span className="text-xs text-gray-400 font-medium">Upload a photo for the sender</span>
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={loading || !message || !senderName}
            className="w-full py-5 bg-black text-white text-lg font-black rounded-2xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                Generate Card
              </>
            )}
          </button>
        </div>
      </div>

      <div className="sticky top-24 space-y-6">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-widest text-gray-400">Live Preview</label>
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
            Real-time
          </div>
        </div>

        <div className="flex items-center justify-center p-8 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <div ref={cardRef}>
            <NotificationCard
              message={message}
              senderName={senderName}
              avatarUrl={avatarPreview || undefined}
              likesCount={0}
              gotItCount={0}
              sharesCount={0}
              dislikesCount={0}
            />
          </div>
        </div>

        <div className="p-6 bg-black text-white rounded-2xl space-y-2">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest">Auto-Export</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            When you click "Generate Card", we'll automatically export a high-resolution PNG optimized for WhatsApp Status and Instagram Stories.
          </p>
        </div>
      </div>
    </div>
  );
};
