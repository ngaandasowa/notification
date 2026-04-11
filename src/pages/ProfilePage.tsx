import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuthState } from 'react-firebase-hooks/auth';
import { User as UserIcon, Camera, Loader2, Check, AlertCircle } from 'lucide-react';
import { User } from '../types';
import { cn } from '../lib/utils';

export const ProfilePage: React.FC = () => {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as User;
          setProfile(data);
          setName(data.name || '');
          setUsername(data.username || '');
          setBio(data.bio || '');
          setAvatarPreview(data.avatarUrl || null);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      let avatarUrl = avatarPreview;

      if (avatar) {
        const avatarRef = ref(storage, `profiles/${user.uid}/avatar`);
        await uploadBytes(avatarRef, avatar);
        avatarUrl = await getDownloadURL(avatarRef);
      }

      await updateDoc(doc(db, 'users', user.uid), {
        name,
        username,
        bio,
        avatarUrl,
        updatedAt: serverTimestamp()
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tighter uppercase">Profile Settings</h1>
        <p className="text-gray-500">Customize how you appear to the world.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="w-32 h-32 rounded-3xl overflow-hidden bg-gray-100 border-4 border-black shadow-xl">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg">
              <Camera className="w-5 h-5" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Profile Picture</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-black focus:bg-white transition-all font-bold"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Username</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                placeholder="username"
                className="w-full pl-8 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-black focus:bg-white transition-all font-bold"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-gray-400">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
            rows={4}
            className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-black focus:bg-white transition-all font-medium resize-none"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className={cn(
            "w-full py-5 text-lg font-black rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl",
            success ? "bg-green-500 text-white" : "bg-black text-white hover:bg-gray-800"
          )}
        >
          {saving ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : success ? (
            <>
              <Check className="w-6 h-6" />
              Saved Successfully
            </>
          ) : (
            'Save Profile'
          )}
        </button>
      </form>
    </div>
  );
};
