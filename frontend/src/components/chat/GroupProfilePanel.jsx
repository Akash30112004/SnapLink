import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Star, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import Avatar from '../common/Avatar';
import ImagePreviewModal from '../common/ImagePreviewModal';
import conversationService from '../../services/conversationService';
import { STORAGE_KEYS } from '../../utils/constants';

const GroupProfilePanel = ({ group, allUsers, onClose, onFavoriteToggle, onlineUsers, onDeleteGroup, onGroupUpdate }) => {
  const [isFavorite, setIsFavorite] = useState(group?.isFavorite || false);
  const [isLoading, setIsLoading] = useState(false);
  const [groupData, setGroupData] = useState(group);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [selectedNewMembers, setSelectedNewMembers] = useState(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRemoveMemberConfirm, setShowRemoveMemberConfirm] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [showImagePreview, setShowImagePreview] = useState(false);

  // Fetch fresh group data with members when panel opens
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const groupId = group._id || group.id;
        if (groupId) {
          // Fetch group details with populated members
          const response = await conversationService.getGroupById(groupId);
          if (response.group) {
            setGroupData(response.group);
          }
        }
      } catch (error) {
        console.error('Failed to fetch group data:', error);
        setGroupData(group);
      }
    };

    if (group) {
      fetchGroupData();
    }
  }, [group]);

  if (!groupData) return null;

  const groupName = groupData.name || 'Group Chat';
  const memberCount = groupData.members?.length || 0;
  const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
  const currentUserId = storedUser ? (JSON.parse(storedUser)._id || JSON.parse(storedUser).id) : null;
  const isAdmin = groupData.admin && currentUserId && (groupData.admin._id || groupData.admin.id || groupData.admin) === currentUserId;

  console.log('👤 Current User ID:', currentUserId);
  console.log('👑 Group Admin:', groupData.admin);
  console.log('✅ Is Admin:', isAdmin);

  // Get users not in the group
  const availableUsers = (allUsers || []).filter(user => {
    const userId = user._id || user.id;
    return !groupData.members.some(member => {
      const memberId = member._id || member.id;
      return memberId === userId || memberId === userId;
    });
  });

  const toggleSelectMember = (userId) => {
    const newSelected = new Set(selectedNewMembers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedNewMembers(newSelected);
  };

  const handleAddMembers = async () => {
    if (selectedNewMembers.size === 0) {
      alert('Please select at least one member');
      return;
    }

    try {
      setIsLoading(true);
      const memberIds = Array.from(selectedNewMembers);
      const response = await conversationService.addGroupMembers(groupData._id, memberIds);
      
      if (response.group) {
        setGroupData(response.group);
        setSelectedNewMembers(new Set());
        setShowAddMembers(false);
        alert(response.message);
      }
    } catch (error) {
      console.error('Failed to add members:', error);
      alert('Failed to add members. ' + (error.response?.data?.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    try {
      setIsLoading(true);
      await conversationService.deleteGroup(groupData._id);
      
      if (onDeleteGroup) {
        onDeleteGroup(groupData._id);
      }
      onClose();
    } catch (error) {
      console.error('Failed to delete group:', error);
      alert('Failed to delete group. ' + (error.response?.data?.message || ''));
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      setIsLoading(true);
      const memberId = memberToRemove._id || memberToRemove.id;
      const response = await conversationService.removeGroupMember(groupData._id, memberId);
      
      if (response.group) {
        setGroupData(response.group);
        setMemberToRemove(null);
        setShowRemoveMemberConfirm(false);
        alert(response.message);
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert('Failed to remove member. ' + (error.response?.data?.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      setIsLoading(true);
      if (onFavoriteToggle) {
        await onFavoriteToggle(groupData._id || groupData.id, !isFavorite);
        // The parent will update the state, but we update local state for immediate feedback
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateGroupName = async () => {
    if (!editedName.trim() || editedName.trim() === groupData.name) {
      setIsEditingName(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await conversationService.updateGroup(groupData._id, { name: editedName.trim() });
      if (response.group) {
        setGroupData(response.group);
        setIsEditingName(false);
        // Notify parent to update the group in the list
        if (onGroupUpdate) {
          onGroupUpdate(response.group);
        }
      }
    } catch (error) {
      console.error('Failed to update group name:', error);
      alert('Failed to update group name. ' + (error.response?.data?.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateGroupDescription = async () => {
    if (editedDescription.trim() === (groupData.description || '')) {
      setIsEditingDescription(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await conversationService.updateGroup(groupData._id, { description: editedDescription.trim() });
      if (response.group) {
        setGroupData(response.group);
        setIsEditingDescription(false);
        // Notify parent to update the group in the list
        if (onGroupUpdate) {
          onGroupUpdate(response.group);
        }
      }
    } catch (error) {
      console.error('Failed to update group description:', error);
      alert('Failed to update group description. ' + (error.response?.data?.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  const startEditingName = () => {
    setEditedName(groupData.name || '');
    setIsEditingName(true);
  };

  const startEditingDescription = () => {
    setEditedDescription(groupData.description || '');
    setIsEditingDescription(true);
  };

  return (
    <>
      {/* Header */}
      <div className="h-20 border-b-2 border-[#10B981]/20 bg-[#064E3B]/40 backdrop-blur-xl px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="p-3 rounded-xl bg-[#10B981]/20 hover:bg-[#10B981]/30 transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-6 h-6 text-[#10B981]" />
          </button>
          <h2 className="text-2xl font-bold text-[#D1FAE5]">{groupName}</h2>
        </div>
      </div>

      {/* Profile Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-2xl mx-auto">
          {showAddMembers ? (
            // Add Members Form
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMembers(false);
                    setSelectedNewMembers(new Set());
                  }}
                  className="p-2 rounded-lg hover:bg-[#10B981]/20 text-[#D1FAE5] transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-bold text-[#D1FAE5]">Add Members ({selectedNewMembers.size} selected)</h3>
              </div>

              {availableUsers.length > 0 ? (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                  {availableUsers.map((user) => {
                    const userId = user._id || user.id;
                    const isSelected = selectedNewMembers.has(userId);
                    return (
                      <button
                        key={userId}
                        type="button"
                        onClick={() => toggleSelectMember(userId)}
                        className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 ${
                          isSelected
                            ? 'bg-[#10B981]/20 border-[#10B981]/50'
                            : 'bg-white/5 border-[#10B981]/10 hover:bg-[#10B981]/10 hover:border-[#10B981]/40'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-5 h-5 rounded-md border-[#10B981]/50 bg-[#10B981]/20 cursor-pointer accent-[#10B981]"
                        />
                        <Avatar
                          name={user.name}
                          src={user.avatar}
                          online={user.status === 'online'}
                          size="md"
                        />
                        <div className="text-left flex-1">
                          <p className="text-sm font-semibold text-[#D1FAE5]">{user.name}</p>
                          <p className="text-xs text-[#D1FAE5]/60">{user.email}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-[#D1FAE5]/60 py-8">All available users are already in the group</p>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMembers(false);
                    setSelectedNewMembers(new Set());
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-[#D1FAE5]/20 text-[#D1FAE5] hover:bg-white/10 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddMembers}
                  disabled={selectedNewMembers.size === 0 || isLoading}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] hover:bg-[#10B981]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  {isLoading ? 'Adding...' : 'Add Members'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Group Avatar and Name */}
              <div className="text-center mb-8">
                <button
                  type="button"
                  onClick={() => groupData.avatar && setShowImagePreview(true)}
                  className="flex justify-center mb-8 mx-auto rounded-full hover:opacity-80 transition-opacity active:scale-95"
                >
                  <div className="w-32 h-32 rounded-full bg-linear-to-br from-[#10B981] to-[#065F46] flex items-center justify-center shadow-2xl ring-4 ring-[#10B981]/30">
                    <Users className="w-16 h-16 text-white" strokeWidth={2.5} />
                  </div>
                </button>
                {isEditingName ? (
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdateGroupName();
                        if (e.key === 'Escape') setIsEditingName(false);
                      }}
                      className="text-3xl font-bold text-[#D1FAE5] bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#10B981]/50 text-center max-w-md"
                      autoFocus
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={handleUpdateGroupName}
                      disabled={isLoading}
                      className="p-2 rounded-lg bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#10B981] transition-colors disabled:opacity-50"
                      title="Save"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingName(false)}
                      disabled={isLoading}
                      className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors disabled:opacity-50"
                      title="Cancel"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <h3 className="text-4xl font-bold text-[#D1FAE5]">{groupName}</h3>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={startEditingName}
                        className="p-2 rounded-lg bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#10B981] transition-all hover:scale-105 active:scale-95"
                        title="Edit group name"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}
                <p className="text-lg text-[#D1FAE5]/60">{memberCount} members</p>
              </div>

              {/* About Section */}
              {(groupData.description || isAdmin) && (
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-[#10B981]/20">
                      <Users className="w-6 h-6 text-[#10B981]" />
                    </div>
                    <h4 className="text-base font-bold text-[#D1FAE5] uppercase tracking-wide">About</h4>
                    {isAdmin && !isEditingDescription && (
                      <button
                        type="button"
                        onClick={startEditingDescription}
                        className="ml-auto p-2 rounded-lg bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#10B981] transition-all hover:scale-105 active:scale-95"
                        title="Edit description"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {isEditingDescription ? (
                    <div className="space-y-3">
                      <textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        placeholder="Add a group description..."
                        rows={4}
                        className="w-full text-[#D1FAE5]/80 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#10B981]/50 resize-none"
                        disabled={isLoading}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setIsEditingDescription(false)}
                          disabled={isLoading}
                          className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleUpdateGroupDescription}
                          disabled={isLoading}
                          className="px-4 py-2 rounded-lg bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#10B981] transition-colors disabled:opacity-50"
                        >
                          {isLoading ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[#D1FAE5]/70 leading-relaxed px-1">
                      {groupData.description || (isAdmin ? 'No description yet. Click edit to add one.' : '')}
                    </p>
                  )}
                </div>
              )}

              {/* Members Section */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-[#10B981]/20">
                    <Users className="w-6 h-6 text-[#10B981]" />
                  </div>
                  <h4 className="text-base font-bold text-[#D1FAE5] uppercase tracking-wide">Members</h4>
                </div>

                <div className="space-y-2">
                  {groupData.members && groupData.members.length > 0 ? (
                    groupData.members.map((member) => {
                      const memberId = member._id || member.id;
                      const isOnline = onlineUsers && memberId ? onlineUsers.has(memberId) : false;
                      const isMemberAdmin = groupData.admin && (groupData.admin._id || groupData.admin.id || groupData.admin) === memberId;
                      const canRemove = isAdmin && !isMemberAdmin && (memberId !== currentUserId);
                      
                      return (
                      <div
                        key={memberId}
                        className="flex items-center gap-4 p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 hover:bg-[#10B981]/20 transition-colors group"
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
                            {isMemberAdmin && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#10B981]/30 text-[#10B981] border border-[#10B981]/50 whitespace-nowrap">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[#D1FAE5]/70">
                            {isOnline ? 'Active now' : 'Offline'}
                          </p>
                        </div>
                        {canRemove && (
                          <button
                            type="button"
                            onClick={() => {
                              setMemberToRemove(member);
                              setShowRemoveMemberConfirm(true);
                            }}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all hover:scale-105 active:scale-95"
                            title="Remove member from group"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-[#D1FAE5]/60 py-8">No members found</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-8 space-y-3">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setShowAddMembers(true)}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl bg-[#10B981]/10 border-2 border-[#10B981]/30 text-[#D1FAE5] hover:bg-[#10B981]/20 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5" />
                    Add Members
                  </button>
                )}
                
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

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl bg-red-500/10 border-2 border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete Group
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <div className="relative bg-[#064E3B]/60 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-red-500/20 p-8 max-w-sm">
            <h3 className="text-2xl font-bold text-[#D1FAE5] mb-3">Delete Group?</h3>
            <p className="text-[#D1FAE5]/70 mb-6">
              Are you sure you want to delete <strong>{groupName}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-[#D1FAE5]/20 text-[#D1FAE5] hover:bg-white/10 transition-colors font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteGroup}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Dialog */}
      {showRemoveMemberConfirm && memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <button
            type="button"
            onClick={() => {
              setShowRemoveMemberConfirm(false);
              setMemberToRemove(null);
            }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <div className="relative bg-[#064E3B]/60 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-red-500/20 p-8 max-w-sm">
            <h3 className="text-2xl font-bold text-[#D1FAE5] mb-3">Remove Member?</h3>
            <p className="text-[#D1FAE5]/70 mb-6">
              Are you sure you want to remove <strong>{memberToRemove.name}</strong> from {groupName}?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowRemoveMemberConfirm(false);
                  setMemberToRemove(null);
                }}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-[#D1FAE5]/20 text-[#D1FAE5] hover:bg-white/10 transition-colors font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemoveMember}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showImagePreview && groupData.avatar && (
        <ImagePreviewModal
          imageUrl={groupData.avatar}
          userName={groupData.name}
          onClose={() => setShowImagePreview(false)}
        />
      )}
    </>
  );
};

GroupProfilePanel.propTypes = {
  group: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    _id: PropTypes.string,
    name: PropTypes.string,
    members: PropTypes.array,
    isFavorite: PropTypes.bool,
    admin: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }).isRequired,
  allUsers: PropTypes.array,
  onClose: PropTypes.func.isRequired,
  onFavoriteToggle: PropTypes.func,
  onlineUsers: PropTypes.instanceOf(Set),
  onDeleteGroup: PropTypes.func,
  onGroupUpdate: PropTypes.func,
};

GroupProfilePanel.defaultProps = {
  allUsers: [],
  onFavoriteToggle: null,
  onlineUsers: new Set(),
  onDeleteGroup: null,
  onGroupUpdate: null,
};

export default GroupProfilePanel;
