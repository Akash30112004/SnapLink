import { useState } from 'react';
import PropTypes from 'prop-types';
import { Search, Users, X, Plus } from 'lucide-react';
import Avatar from '../common/Avatar';

const ContactsModal = ({ isOpen, onClose, users, onSelectUser, onCreateGroup, initialCreateMode = false, currentUser }) => {
  const [query, setQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(initialCreateMode);

  const currentUserName = currentUser?.name || 'You';

  if (!isOpen) return null;

  // Use initialCreateMode to determine the view when it's provided
  const isCreatingGroup = initialCreateMode || showCreateForm;

  if (!isOpen) return null;

  const normalizedQuery = query.trim().toLowerCase();
  const filteredUsers = users.filter((user) => {
    if (!normalizedQuery) return true;
    return (
      user.name.toLowerCase().includes(normalizedQuery) ||
      user.email.toLowerCase().includes(normalizedQuery)
    );
  });

  // Filter members for the group creation form
  const normalizedMemberQuery = memberSearchQuery.trim().toLowerCase();
  const filteredMembersForGroup = filteredUsers.filter((user) => {
    if (!normalizedMemberQuery) return true;
    return (
      user.name.toLowerCase().includes(normalizedMemberQuery) ||
      user.email.toLowerCase().includes(normalizedMemberQuery)
    );
  });

  const toggleSelectUser = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }
    if (selectedUsers.size === 0) {
      alert('Please select at least one member');
      return;
    }

    try {
      const memberIds = Array.from(selectedUsers);
      await onCreateGroup(groupName, memberIds, groupDescription.trim());
      setGroupName('');
      setGroupDescription('');
      setSelectedUsers(new Set());
      setMemberSearchQuery('');
      setShowCreateForm(false);
      onClose();
    } catch (error) {
      console.error('Failed to create group:', error);
      alert('Failed to create group');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Close contacts"
      />
      <div
        className="
          relative w-[98%] max-w-7xl bg-[#064E3B]/60 backdrop-blur-xl rounded-3xl
          shadow-2xl border-2 border-[#10B981]/20 overflow-hidden
          animate-fade-in h-[95vh]
        "
        role="dialog"
        aria-modal="true"
        aria-label="Contacts"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#10B981]/20 bg-[#064E3B]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#10B981] to-[#065F46] flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#D1FAE5]">
                {isCreatingGroup ? 'Create Group' : 'Contacts'}
              </h3>
              {isCreatingGroup && groupName ? (
                <p className="text-xs text-[#10B981] font-semibold">{groupName}</p>
              ) : (
                <p className="text-xs text-[#D1FAE5]/60">
                  {isCreatingGroup ? `${selectedUsers.size} members selected` : `${filteredUsers.length} friends`}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isCreatingGroup && !initialCreateMode && selectedUsers.size > 0 && (
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="p-2 rounded-lg hover:bg-[#10B981]/20 text-[#10B981] transition-colors"
                title="Create group"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onClose();
                setGroupName('');
                setGroupDescription('');
                setSelectedUsers(new Set());
                setMemberSearchQuery('');
                setShowCreateForm(false);
              }}
              className="p-2 rounded-lg hover:bg-white/10 text-[#D1FAE5] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-6 flex flex-col h-[calc(95vh-80px)]">
          {isCreatingGroup ? (
            <div className="flex flex-col space-y-4 h-full">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                className="w-full h-12 rounded-full bg-white/10 border border-[#10B981]/20 text-[#D1FAE5] placeholder:text-[#D1FAE5]/50 px-4 text-base focus:outline-none focus:ring-2 focus:ring-[#10B981]/40 focus:border-transparent"
              />

              <textarea
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="Add a group description (optional)"
                className="w-full h-20 rounded-2xl bg-white/10 border border-[#10B981]/20 text-[#D1FAE5] placeholder:text-[#D1FAE5]/50 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#10B981]/40 focus:border-transparent resize-none"
              />

              {/* Admin Section */}
              <div className="bg-[#10B981]/5 border border-[#10B981]/30 rounded-2xl p-4">
                <p className="text-xs font-semibold text-[#D1FAE5]/70 uppercase mb-3 tracking-wide">Group Admin</p>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/40">
                  <Avatar
                    name={currentUserName}
                    src={currentUser?.avatar}
                    online={currentUser?.status === 'online'}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#D1FAE5] truncate">{currentUserName}</p>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#10B981]/30 text-[#10B981] border border-[#10B981]/50 whitespace-nowrap">
                        Admin
                      </span>
                    </div>
                    <p className="text-xs text-[#D1FAE5]/60">{currentUser?.email}</p>
                  </div>
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
                {/* Member Selection Card */}
                <div className="bg-[#10B981]/5 border border-[#10B981]/30 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-[#D1FAE5]/70 uppercase mb-4 tracking-wide">Add Members</p>
                  
                  {/* Search Members - Fixed */}
                  <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#10B981]/70" />
                    <input
                      type="text"
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      placeholder="Search members by name or email..."
                      className="w-full h-12 rounded-xl bg-white/15 border-2 border-[#10B981]/40 text-[#D1FAE5] placeholder:text-[#D1FAE5]/60 px-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/60 focus:border-[#10B981]/60 focus:bg-white/20 transition-all"
                    />
                  </div>

                  {/* Scrollable Members List - Expanded to show more members */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-2 bg-[#064E3B]/60 border-2 border-[#10B981]/40 rounded-xl p-4 min-h-0">
                    {filteredMembersForGroup.map((user) => {
                      const isSelected = selectedUsers.has(user._id || user.id);
                      return (
                        <button
                          key={user._id || user.id}
                          type="button"
                          onClick={() => toggleSelectUser(user._id || user.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200 ${
                            isSelected
                              ? 'bg-[#10B981]/30 border-[#10B981]/70 shadow-md shadow-[#10B981]/30'
                              : 'bg-white/10 border-[#10B981]/30 hover:bg-[#10B981]/20 hover:border-[#10B981]/60 hover:shadow-md hover:shadow-[#10B981]/20'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-6 h-6 rounded-md border-2 border-[#10B981]/70 bg-[#10B981]/40 cursor-pointer accent-[#10B981] shrink-0"
                          />
                          <Avatar
                            name={user.name}
                            src={user.avatar}
                            online={user.status === 'online'}
                            size="md"
                          />
                          <div className="text-left flex-1">
                            <p className="text-sm font-semibold text-[#D1FAE5]">{user.name}</p>
                            <p className="text-xs text-[#D1FAE5]/70">{user.email}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons - Sticky to bottom */}
              <div className="flex gap-3 pt-4 border-t border-[#10B981]/20 mt-4 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (initialCreateMode) {
                      onClose();
                    } else {
                      setShowCreateForm(false);
                      setGroupName('');
                      setGroupDescription('');
                      setSelectedUsers(new Set());
                      setMemberSearchQuery('');
                    }
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-[#D1FAE5]/20 text-[#D1FAE5] hover:bg-white/10 transition-colors font-semibold"
                >
                  {initialCreateMode ? 'Close' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || selectedUsers.size === 0}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] hover:bg-[#10B981]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  Create Group
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-4 h-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D1FAE5]/60" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search contacts"
                  className="w-full h-12 rounded-full bg-white/10 border border-[#10B981]/20 text-[#D1FAE5] placeholder:text-[#D1FAE5]/50 px-12 text-base focus:outline-none focus:ring-2 focus:ring-[#10B981]/40 focus:border-transparent"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
                {filteredUsers.map((user) => {
                  const isSelected = selectedUsers.has(user._id || user.id);
                  return (
                    <button
                      key={user._id || user.id}
                      type="button"
                      onClick={() => {
                        if (isCreatingGroup) {
                          toggleSelectUser(user._id || user.id);
                        } else {
                          onSelectUser(user);
                          onClose();
                        }
                      }}
                      className={`
                        w-full flex items-center justify-between gap-4 p-4 rounded-2xl
                        border transition-all duration-200
                        ${
                          isSelected
                            ? 'bg-[#10B981]/20 border-[#10B981]/50'
                            : 'bg-white/5 border-[#10B981]/10 hover:bg-[#10B981]/10 hover:border-[#10B981]/40'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {isSelected && (
                          <input
                            type="checkbox"
                            checked={true}
                            onChange={() => {}}
                            className="w-5 h-5 rounded-md border-[#10B981]/50 bg-[#10B981]/20 cursor-pointer accent-[#10B981]"
                          />
                        )}
                        <Avatar
                          name={user.name}
                          src={user.avatar}
                          online={user.status === 'online'}
                          size="md"
                        />
                        <div className="text-left">
                          <p className="text-sm font-semibold text-[#D1FAE5]">{user.name}</p>
                          <p className="text-xs text-[#D1FAE5]/60">{user.email}</p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                          user.status === 'online'
                            ? 'border-[#10B981]/40 text-[#10B981]'
                            : 'border-[#D1FAE5]/20 text-[#D1FAE5]/60'
                        }`}
                      >
                        {user.status === 'online' ? 'Online' : 'Offline'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ContactsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      _id: PropTypes.string,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      avatar: PropTypes.string,
      status: PropTypes.string.isRequired,
    })
  ).isRequired,
  onSelectUser: PropTypes.func.isRequired,
  onCreateGroup: PropTypes.func.isRequired,
  initialCreateMode: PropTypes.bool,
  currentUser: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    _id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    avatar: PropTypes.string,
    status: PropTypes.string,
  }),
};

export default ContactsModal;
