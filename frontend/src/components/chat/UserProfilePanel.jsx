import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Users, Star, ShieldAlert, Trash2, Edit, ChevronDown, ChevronUp } from 'lucide-react';
import Avatar from '../common/Avatar';
import ImagePreviewModal from '../common/ImagePreviewModal';
import userService from '../../services/userService';
import conversationService from '../../services/conversationService';

const UserProfilePanel = ({ user, onClose, onFavoriteToggle, onlineUsers }) => {
  const [isFavorite, setIsFavorite] = useState(user?.isFavorite || false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(user);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);

  // Fetch fresh user data and groups when profile opens
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = user._id || user.id;
        if (userId) {
          const response = await userService.getUserById(userId);
          setProfileData(response.user);
          
          // Fetch groups for this user
          const groupsResponse = await conversationService.getUserGroups(userId);
          setGroups(groupsResponse.groups || []);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        // Fallback to the passed user data
        setProfileData(user);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user?._id, user?.id]);

  if (!profileData) return null;

  const statusText = profileData.status === 'online' ? 'Active now' : 'Offline';
  const aboutText = profileData.about && profileData.about.trim() ? profileData.about : "Hey There! Feel Free to chat";

  const handleGroupClick = (group) => {
    setSelectedGroup(group);
  };

  const handleBackFromMembers = () => {
    setSelectedGroup(null);
  };

  const handleToggleFavorite = async () => {
    try {
      setIsLoading(true);
      const result = await userService.toggleFavoriteUser(user._id || user.id);
      setIsFavorite(result.isFavorited);
      if (onFavoriteToggle) {
        onFavoriteToggle(user._id || user.id, result.isFavorited);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // If viewing group members, show members section
  if (selectedGroup) {
    return (
      <>
        {/* Header */}
        <div className="h-20 border-b-2 border-[#10B981]/20 bg-[#064E3B]/40 backdrop-blur-xl px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleBackFromMembers}
              className="p-3 rounded-xl bg-[#10B981]/20 hover:bg-[#10B981]/30 transition-all hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-6 h-6 text-[#10B981]" />
            </button>
            <h2 className="text-2xl font-bold text-[#D1FAE5]">{selectedGroup.name}</h2>
          </div>
        </div>

        {/* Members Section */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-[#10B981]/20">
                <Users className="w-6 h-6 text-[#10B981]" />
              </div>
              <h4 className="text-base font-bold text-[#D1FAE5] uppercase tracking-wide">
                Members ({selectedGroup.members?.length || 0})
              </h4>
            </div>
            
            <div className="space-y-2">
              {selectedGroup.members && selectedGroup.members.length > 0 ? (
                selectedGroup.members.map((member) => {
                  const memberId = member._id || member.id;
                  const isOnline = onlineUsers && memberId ? onlineUsers.has(memberId) : false;
                  const isAdmin = selectedGroup.admin && (selectedGroup.admin._id || selectedGroup.admin.id || selectedGroup.admin) === memberId;
                  
                  return (
                  <div
                    key={memberId}
                    className="flex items-center gap-4 p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 hover:bg-[#10B981]/20 transition-colors"
                  >
                    <Avatar
                      name={member.name}
                      src={member.avatar}
                      online={isOnline}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-base font-semibold text-[#D1FAE5] truncate">
                          {member.name}
                        </p>
                        {isAdmin && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#10B981]/30 text-[#10B981] border border-[#10B981]/50 whitespace-nowrap">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#D1FAE5]/70">
                        {isOnline ? 'Active now' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  );
                })
              ) : (
                <p className="text-center text-[#D1FAE5]/60 py-8">No members found</p>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

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
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Customize
        </button>
      </div>

      {/* Profile Content */}
      <div className="flex-1 overflow-y-auto px-12 py-12">
        <div className="w-full">
          {/* Profile Avatar & Info */}
          <div className="text-center mb-16">
            <button
              type="button"
              onClick={() => profileData.avatar && setShowImagePreview(true)}
              className="flex justify-center mb-8 mx-auto rounded-full hover:opacity-80 transition-opacity active:scale-95"
            >
              <Avatar
                name={profileData.name}
                src={profileData.avatar}
                online={profileData.status === 'online'}
                size="xl"
              />
            </button>
            <h3 className="text-4xl font-bold text-[#D1FAE5] mb-3">{profileData.name}</h3>
            <p className="text-base text-[#D1FAE5]/60">{statusText}</p>
          </div>

          {/* Contact Info */}
          {profileData.email && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-[#10B981]/20">
                  <Mail className="w-6 h-6 text-[#10B981]" />
                </div>
                <h4 className="text-base font-bold text-[#D1FAE5] uppercase tracking-wide">Email</h4>
              </div>
              <p className="text-lg text-[#D1FAE5]/80 break-all leading-relaxed">{profileData.email}</p>
            </div>
          )}

          {/* About */}
          <div className="mb-8">
            <h4 className="text-base font-bold text-[#D1FAE5] mb-4 uppercase tracking-wide">About</h4>
            <p className="text-base text-[#D1FAE5]/80 leading-relaxed">
              {aboutText}
            </p>
          </div>

          {/* Groups in Common */}
          {groups.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4 text-[#D1FAE5]">
                <div className="p-2 rounded-lg bg-[#10B981]/20">
                  <Users className="w-6 h-6 text-[#10B981]" />
                </div>
                <h4 className="text-base font-bold uppercase tracking-wide">Groups in Common</h4>
              </div>
              <div className="space-y-3">
                {groups.map((group) => {
                  const groupId = group._id || group.id;
                  const groupName = group.name;
                  const memberCount = group.members?.length || 0;
                  
                  return (
                    <button
                      key={groupId}
                      type="button"
                      onClick={() => handleGroupClick(group)}
                      className="w-full rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 hover:bg-[#10B981]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-10 h-10 rounded-full bg-[#10B981]/30 flex items-center justify-center">
                          <Users className="w-5 h-5 text-[#10B981]" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-semibold text-[#D1FAE5]">{groupName}</p>
                          <p className="text-xs text-[#D1FAE5]/60">{memberCount} members</p>
                        </div>
                        <ChevronDown className="w-5 h-5 text-[#10B981] transform -rotate-90" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-8 space-y-3">
            <button
              type="button"
              onClick={handleToggleFavorite}
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
                isFavorite
                  ? 'bg-[#10B981]/30 border-2 border-[#10B981]/50 text-[#10B981] hover:bg-[#10B981]/40'
                  : 'bg-[#10B981]/10 border-2 border-[#10B981]/30 text-[#D1FAE5] hover:bg-[#10B981]/20'
              }`}
            >
              <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
            {!profileData.isBot && (
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl bg-white/5 border-2 border-[#D1FAE5]/20 text-[#D1FAE5] hover:bg-white/10 transition-colors font-semibold"
              >
                <ShieldAlert className="w-5 h-5" />
                Block User
              </button>
            )}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl bg-red-500/15 border-2 border-red-500/40 text-red-300 hover:bg-red-500/25 transition-colors font-semibold"
            >
              <Trash2 className="w-5 h-5" />
              Delete Chat
            </button>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showImagePreview && profileData.avatar && (
        <ImagePreviewModal
          imageUrl={profileData.avatar}
          userName={profileData.name}
          onClose={() => setShowImagePreview(false)}
        />
      )}
    </>
  );
};

UserProfilePanel.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.number,
    name: PropTypes.string.isRequired,
    email: PropTypes.string,
    avatar: PropTypes.string,
    status: PropTypes.string.isRequired,
    about: PropTypes.string,
    groups: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          _id: PropTypes.string,
          id: PropTypes.string,
          name: PropTypes.string,
        })
      ])
    ),
    isFavorite: PropTypes.bool,
  }),
  onClose: PropTypes.func.isRequired,
  onFavoriteToggle: PropTypes.func,
  onlineUsers: PropTypes.instanceOf(Set),
};

UserProfilePanel.defaultProps = {
  user: null,
  onlineUsers: new Set(),
};

export default UserProfilePanel;
