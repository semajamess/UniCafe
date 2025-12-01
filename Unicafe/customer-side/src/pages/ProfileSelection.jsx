import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, RefreshCw, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// DiceBear avatar styles available
const AVATAR_STYLES = [
  { id: 'avataaars', name: 'Cartoon' },
  { id: 'bottts', name: 'Robots' },
  { id: 'pixel-art', name: 'Pixel Art' },
  { id: 'lorelei', name: 'Lorelei' },
  { id: 'notionists', name: 'Notionists' },
  { id: 'open-peeps', name: 'Open Peeps' },
  { id: 'thumbs', name: 'Thumbs' },
  { id: 'fun-emoji', name: 'Fun Emoji' },
];

const ProfileSelection = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  const [selectedStyle, setSelectedStyle] = useState('avataaars');
  const [seed, setSeed] = useState(Date.now().toString());
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [avatarOptions, setAvatarOptions] = useState([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Generate avatar options when style or seed changes
  useEffect(() => {
    const options = [];
    for (let i = 0; i < 8; i++) {
      const avatarSeed = `${seed}-${i}`;
      options.push({
        id: i,
        seed: avatarSeed,
        url: `https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${avatarSeed}`
      });
    }
    setAvatarOptions(options);
    setSelectedAvatar(null);
  }, [selectedStyle, seed]);

  const regenerateAvatars = () => {
    setSeed(Date.now().toString());
  };

  const handleSaveProfile = async () => {
    if (!selectedAvatar) {
      alert('Please select an avatar');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/customer/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          profile_image: selectedAvatar.url
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Update local storage with new user data
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        // Navigate to menu
        navigate('/menu');
      } else {
        alert(data.error || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/menu');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Avatar</h1>
            <p className="text-gray-600">Select a profile picture that represents you!</p>
          </div>

          {/* Style Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Avatar Style</label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedStyle === style.id
                      ? 'bg-amber-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          {/* Avatar Grid */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">Select Avatar</label>
              <button
                onClick={regenerateAvatars}
                className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700"
              >
                <RefreshCw className="w-4 h-4" />
                Generate New
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {avatarOptions.map((avatar) => (
                <motion.button
                  key={avatar.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`relative aspect-square rounded-2xl overflow-hidden border-4 transition-all ${
                    selectedAvatar?.id === avatar.id
                      ? 'border-amber-500 shadow-lg'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <img
                    src={avatar.url}
                    alt={`Avatar option ${avatar.id + 1}`}
                    className="w-full h-full object-cover bg-gray-50"
                  />
                  {selectedAvatar?.id === avatar.id && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-white rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {selectedAvatar && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-amber-50 rounded-2xl flex items-center gap-4"
            >
              <img
                src={selectedAvatar.url}
                alt="Selected avatar"
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
              />
              <div>
                <p className="font-semibold text-gray-800">{user?.username || 'User'}</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleSkip}
              className="flex-1 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Skip for Now
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={loading || !selectedAvatar}
              className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'Saving...' : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileSelection;
