import PropTypes from 'prop-types';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Edit, Check, X, Camera, Loader, Trash2, Bell, BellOff } from 'lucide-react';
import Avatar from '../common/Avatar';
import ImageCropModal from '../common/ImageCropModal';
import ImagePreviewModal from '../common/ImagePreviewModal';
import ChangePasswordModal from '../common/ChangePasswordModal';
import { STORAGE_KEYS, ROUTES } from '../../utils/constants';
import userService from '../../services/userService';
import authService from '../../services/authService';
import socketService from '../../services/socketService';

const OwnProfilePanel = ({ user, onClose, settings, onUpdateSettings }) => {
  const navigate = useNavigate();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutText, setAboutText] = useState('');
  const [draftAbout, setDraftAbout] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(user?.avatar || '');
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const notificationsEnabled = settings?.notifications ?? true;
  const fileInputRef = useRef(null);

  const userId = user?._id || user?.id;
  const aboutStorageKey = userId ? `snaplink_about_${userId}` : 'snaplink_about';

  useEffect(() => {
    if (!user) return;
    const storedAbout = localStorage.getItem(aboutStorageKey);
    const initialAbout = storedAbout || user.about || "Hey There! Feel Free to chat";
    setAboutText(initialAbout);
    setDraftAbout(initialAbout);
    setIsEditingAbout(false);
  }, [aboutStorageKey, user?.about, user]);

  useEffect(() => {
    if (!user) return;
    setCurrentAvatar(user?.avatar || '');
  }, [user?.avatar, user]);

  // Handle password change
  const handlePasswordChange = async (newPassword) => {
    await authService.changePassword(newPassword);
  };

  // Handle logout
  const handleLogout = () => {
    authService.logout();
    navigate(ROUTES.LOGIN);
  };

  const handleAvatarClick = () => {
    if (!isUploadingAvatar && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Show crop modal
    setSelectedImageFile(file);
    setShowCropModal(true);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (croppedFile) => {
    try {
      setShowCropModal(false);
      setIsUploadingAvatar(true);
      console.log('⬆️ Uploading profile picture...');

      // Upload to backend
      const response = await userService.uploadProfilePic(croppedFile);
      const newAvatarUrl = response.profilePic || response.user?.avatar;

      // Update local state immediately
      setCurrentAvatar(newAvatarUrl);

      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
      const updatedStoredUser = {
        ...storedUser,
        avatar: newAvatarUrl,
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedStoredUser));

      // Broadcast to other users via socket
      const userId = user._id || user.id;
      socketService.emitProfileUpdate({
        userId,
        avatar: newAvatarUrl,
      });

      console.log('✅ Profile picture updated successfully');
    } catch (error) {
      console.error('❌ Failed to upload profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
      setSelectedImageFile(null);
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setSelectedImageFile(null);
  };

  const handleAvatarImageClick = (e) => {
    // If avatar exists, show preview modal on click
    if (currentAvatar && !isUploadingAvatar) {
      e.stopPropagation();
      setShowImagePreview(true);
    }
  };

  const handleRemoveProfilePic = async () => {
    try {
      setIsUploadingAvatar(true);
      console.log('🗑️ Removing profile picture...');

      // Call backend to remove avatar
      await userService.removeProfilePic();

      // Update local state
      setCurrentAvatar('');

      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
      const updatedStoredUser = {
        ...storedUser,
        avatar: '',
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedStoredUser));

      // Broadcast to other users via socket
      const userId = user._id || user.id;
      socketService.emitProfileUpdate({
        userId,
        avatar: '',
      });

      // Close preview modal
      setShowImagePreview(false);

      console.log('✅ Profile picture removed successfully');
    } catch (error) {
      console.error('❌ Failed to remove profile picture:', error);
      alert('Failed to remove profile picture. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Early return after all hooks
  if (!user) return null;

  return (
    <>
      {/* Header */}
      <div className="h-20 border-b-2 border-[#10B981]/20 bg-[#064E3B]/40 backdrop-blur-xl px-8 flex items-center justify-between shadow-sm">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 text-[#D1FAE5]/80 hover:text-[#D1FAE5] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <h2 className="text-lg font-bold text-[#D1FAE5]">My Profile</h2>
        <div className="w-10" />
      </div>

      {/* Profile Content */}
      <div className="flex-1 overflow-y-auto px-8 py-12 flex flex-col items-center justify-start">
        <div className="w-full flex flex-col items-center">
          {/* Profile Avatar - Centered & Large */}
          <div className="flex flex-col items-center justify-center text-center mb-16 w-full">
            <div className="w-full flex items-center justify-center mb-6">
              <div className="relative inline-block group">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Avatar with click handler */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    disabled={isUploadingAvatar}
                    className="w-36 h-36 rounded-full overflow-hidden flex items-center justify-center font-bold shadow-lg bg-linear-to-br from-emerald-600 to-teal-600 ring-4 ring-[#10B981]/30 relative cursor-pointer transition-all hover:ring-[#10B981]/50 disabled:cursor-not-allowed"
                  >
                    {currentAvatar ? (
                      <img 
                        src={currentAvatar} 
                        alt={user.name} 
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={handleAvatarImageClick}
                      />
                    ) : (
                      <span className="text-white font-semibold text-4xl">{user.name.split(' ').map(n => n[0]).join('')}</span>
                    )}

                    {/* Loading overlay */}
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}

                    {/* Hover overlay */}
                    {!isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                        <Camera className="w-8 h-8 mb-1" />
                        <span className="text-xs font-medium">Change Photo</span>
                      </div>
                    )}
                  </button>
                </div>

                {/* Remove DP Button - Only show if avatar exists */}
                {currentAvatar && !isUploadingAvatar && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to remove your profile picture?')) {
                        await handleRemoveProfilePic();
                      }
                    }}
                    className="absolute bottom-0 right-0 p-2.5 rounded-full bg-red-500/80 hover:bg-red-600 text-white transition-colors shadow-lg active:scale-95"
                    title="Remove profile picture"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Name Section - Editable */}
          <div className="mb-16 text-center w-full flex flex-col items-center">
            <p className="text-xs font-bold text-[#D1FAE5]/60 mb-4 uppercase tracking-widest">Name</p>
            {isEditingName ? (
              <div className="flex gap-3 items-center justify-center">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="
                    flex-1 text-4xl font-normal bg-transparent text-[#D1FAE5] placeholder-[#D1FAE5]/40
                    focus:outline-none border-b-2 border-[#10B981] pb-2
                    transition-all text-center max-w-sm
                  "
                  autoFocus
                />
                <button
                  type="button"
                  onClick={async () => {
                    const nextName = editedName.trim();
                    if (!nextName) return;

                    try {
                      // Update backend
                      const response = await userService.updateProfile({ name: nextName });
                      const updatedUser = response.user;

                      // Update localStorage
                      const storedUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
                      const updatedStoredUser = {
                        ...storedUser,
                        name: nextName,
                      };
                      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedStoredUser));

                      // Broadcast to other users via socket
                      const userId = updatedUser._id || updatedUser.id;
                      socketService.emitProfileUpdate({
                        userId,
                        name: nextName,
                      });

                      setEditedName(nextName);
                      setIsEditingName(false);
                      console.log('✅ Profile name updated successfully');
                    } catch (error) {
                      console.error('❌ Failed to update name:', error);
                      // Revert on error
                      setEditedName(user.name);
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-[#10B981]/20 text-[#10B981] transition-colors"
                >
                  <Check className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingName(false);
                    setEditedName(user.name);
                  }}
                  className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <div className="relative w-full flex items-center justify-center group">
                <h2 className="text-5xl font-normal text-[#D1FAE5] tracking-tight text-center">{editedName}</h2>
                <button
                  type="button"
                  onClick={() => setIsEditingName(true)}
                  className="absolute right-0 p-3 rounded-lg hover:bg-[#10B981]/20 text-[#D1FAE5]/60 hover:text-[#10B981] transition-all opacity-0 group-hover:opacity-100"
                >
                  <Edit className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>

          {/* About Section */}
          <div className="mb-16 text-center w-full flex flex-col items-center">
            <p className="text-xs font-bold text-[#D1FAE5]/60 mb-4 uppercase tracking-widest">About You</p>
            {isEditingAbout ? (
              <div className="w-full flex flex-col items-center gap-4">
                <textarea
                  placeholder="Tell us about yourself..."
                  value={draftAbout}
                  onChange={(e) => setDraftAbout(e.target.value)}
                  className="
                    w-full text-lg text-[#D1FAE5] placeholder-[#D1FAE5]/40
                    focus:outline-none resize-none
                    leading-relaxed
                    bg-transparent text-center border-b-2 border-[#10B981]/40 pb-2
                  "
                  rows="4"
                />
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      const nextAbout = draftAbout.trim();

                      try {
                        // Update backend
                        await userService.updateProfile({ about: nextAbout });

                        // Update localStorage
                        localStorage.setItem(aboutStorageKey, nextAbout);
                        setAboutText(nextAbout);
                        setIsEditingAbout(false);
                        console.log('✅ About updated successfully');
                      } catch (error) {
                        console.error('❌ Failed to update about:', error);
                        // Revert on error
                        setDraftAbout(aboutText);
                      }
                    }}
                    className="p-2 rounded-lg hover:bg-[#10B981]/20 text-[#10B981] transition-colors"
                    title="Save about"
                  >
                    <Check className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDraftAbout(aboutText);
                      setIsEditingAbout(false);
                    }}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                    title="Cancel"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative w-full group">
                <p className="text-lg text-[#D1FAE5] leading-relaxed text-center">
                  {aboutText || 'Tell us about yourself...'}
                </p>
                <button
                  type="button"
                  onClick={() => setIsEditingAbout(true)}
                  className="absolute right-0 top-0 p-3 rounded-lg hover:bg-[#10B981]/20 text-[#D1FAE5]/60 hover:text-[#10B981] transition-all opacity-0 group-hover:opacity-100"
                  title="Edit about"
                >
                  <Edit className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>

          {/* Email Section */}
          {user.email && (
            <div className="mb-16 text-center w-full flex flex-col items-center">
              <p className="text-xs font-bold text-[#D1FAE5]/60 mb-4 uppercase tracking-widest">Email Address</p>
              <div className="mx-auto flex justify-center items-center mb-4">
                <div className="p-2.5 rounded-lg bg-[#10B981]/10">
                  <Mail className="w-5 h-5 text-[#10B981]" />
                </div>
              </div>
              <p className="text-lg text-[#D1FAE5] font-medium break-all text-center">{user.email}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-8 space-y-3 w-full">
            <button
              type="button"
              onClick={() => setShowChangePasswordModal(true)}
              className="w-full px-4 py-4 rounded-xl bg-[#10B981]/10 border-2 border-[#10B981]/30 text-[#D1FAE5] hover:bg-[#10B981]/20 transition-colors font-semibold text-base"
            >
              Change Password
            </button>
            <button
              type="button"
              onClick={() => {
                const newValue = !notificationsEnabled;
                const nextSettings = {
                  notifications: true,
                  sound: true,
                  compactMode: false,
                  previews: true,
                  ...settings,
                  notifications: newValue,
                };

                if (!newValue) {
                  nextSettings.sound = false;
                }

                onUpdateSettings?.(nextSettings);
              }}
              className="w-full px-4 py-4 rounded-xl bg-white/5 border-2 border-[#D1FAE5]/20 text-[#D1FAE5] hover:bg-white/10 transition-colors font-semibold text-base flex items-center justify-between"
            >
              <span className="flex items-center gap-3">
                {notificationsEnabled ? (
                  <Bell className="w-5 h-5 text-[#10B981]" />
                ) : (
                  <BellOff className="w-5 h-5 text-[#D1FAE5]/60" />
                )}
                <span>Notifications</span>
              </span>
              <div
                className={`
                  w-12 h-7 rounded-full p-1 transition-colors duration-200
                  ${
                    notificationsEnabled
                      ? 'bg-gradient-to-r from-[#10B981] to-[#065F46]'
                      : 'bg-[#D1FAE5]/20'
                  }
                `}
              >
                <span
                  className={`
                    block w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200
                    ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </div>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full px-4 py-4 rounded-xl bg-red-500/15 border-2 border-red-500/40 text-red-300 hover:bg-red-500/25 transition-colors font-semibold text-base"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Image Crop Modal */}
      {showCropModal && selectedImageFile && (
        <ImageCropModal
          imageFile={selectedImageFile}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      {/* Image Preview Modal */}
      {showImagePreview && currentAvatar && (
        <ImagePreviewModal
          imageUrl={currentAvatar}
          userName={user.name}
          onClose={() => setShowImagePreview(false)}
          onRemove={handleRemoveProfilePic}
        />
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowChangePasswordModal(false)}
          onPasswordChange={handlePasswordChange}
        />
      )}
    </>
  );
};

OwnProfilePanel.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string,
    avatar: PropTypes.string,
    status: PropTypes.string.isRequired,
  }),
  onClose: PropTypes.func.isRequired,
  settings: PropTypes.shape({
    notifications: PropTypes.bool,
    sound: PropTypes.bool,
    compactMode: PropTypes.bool,
    previews: PropTypes.bool,
  }),
  onUpdateSettings: PropTypes.func,
};

OwnProfilePanel.defaultProps = {
  user: null,
  settings: null,
  onUpdateSettings: null,
};

export default OwnProfilePanel;
