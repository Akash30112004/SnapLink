import { useState } from 'react';
import PropTypes from 'prop-types';
import { Search, MessageSquare, Settings, LogOut, Menu, X, Users, Star, Grid, Plus } from 'lucide-react';
import Avatar from '../common/Avatar';
import UserList from './UserList';
import GroupList from './GroupList';

const Sidebar = ({
  users,
  groups = [],
  onlineUsers = new Set(),
  currentUser,
  selectedUserId,
  onSelectUser,
  onLogout,
  onOpenSettings,
  onOpenProfile,
  onOpenContacts,
  onOpenCreateGroup,
  showPreview,
  compactMode,
  selectedGroupId,
  onSelectGroup,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'chats', 'groups', 'favourite'

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoriteUsers = filteredUsers.filter(user => user.isFavorite);
  const favoriteGroups = filteredGroups.filter(group => group.isFavorite);

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'chats': return 'Search conversations...';
      case 'groups': return 'Search groups...';
      case 'favourite': return 'Search favourites...';
      default: return 'Search all...';
    }
  };

  const sidebarContent = (
    <>
      {/* Sidebar Header with SnapLink Branding */}
      <div className="h-20 bg-[#064E3B]/40 backdrop-blur-xl px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-linear-to-br from-[#10B981] to-[#065F46] rounded-xl shadow-lg">
            <MessageSquare className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#D1FAE5] tracking-tight">
              Snap<span className="text-[#10B981]">Link</span>
            </h2>
            <p className="text-xs text-[#D1FAE5]/60">{users.length} conversations</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-2 rounded-lg hover:bg-[#10B981]/10 text-[#D1FAE5] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar - Capsule Style */}
      <div className="px-4 pt-4 pb-2 bg-[#064E3B]/40">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D1FAE5]/60" />
          <input
            type="text"
            placeholder={getPlaceholder()}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              w-full pl-11 pr-4 py-2.5 
              bg-white/5 border border-[#10B981]/20 rounded-full
              text-sm text-[#D1FAE5] placeholder-[#D1FAE5]/40
              focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20
              transition-all duration-300
            "
          />
        </div>
      </div>

      {/* Tabs - Capsule Pills */}
      <div className="flex items-center justify-center gap-2 px-3 py-2 bg-[#064E3B]/40 border-b border-[#10B981]/10 overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            setActiveTab('all');
            setSearchQuery('');
          }}
          className={`
            px-3 py-1.5 rounded-full font-semibold text-xs transition-all duration-200
            flex items-center gap-1.5 whitespace-nowrap
            ${activeTab === 'all' 
              ? 'bg-[#10B981] text-white shadow-lg shadow-[#10B981]/30' 
              : 'bg-white/5 text-[#D1FAE5]/60 hover:text-[#D1FAE5] hover:bg-white/10 border border-[#10B981]/20'
            }
          `}
        >
          <Grid className="w-3 h-3" />
          All
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('chats');
            setSearchQuery('');
          }}
          className={`
            px-3 py-1.5 rounded-full font-semibold text-xs transition-all duration-200
            flex items-center gap-1.5 whitespace-nowrap
            ${activeTab === 'chats' 
              ? 'bg-[#10B981] text-white shadow-lg shadow-[#10B981]/30' 
              : 'bg-white/5 text-[#D1FAE5]/60 hover:text-[#D1FAE5] hover:bg-white/10 border border-[#10B981]/20'
            }
          `}
        >
          <MessageSquare className="w-3 h-3" />
          Chats
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('groups');
            setSearchQuery('');
          }}
          className={`
            px-3 py-1.5 rounded-full font-semibold text-xs transition-all duration-200
            flex items-center gap-1.5 whitespace-nowrap
            ${activeTab === 'groups' 
              ? 'bg-[#10B981] text-white shadow-lg shadow-[#10B981]/30' 
              : 'bg-white/5 text-[#D1FAE5]/60 hover:text-[#D1FAE5] hover:bg-white/10 border border-[#10B981]/20'
            }
          `}
        >
          <Users className="w-3 h-3" />
          Groups
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('favourite');
            setSearchQuery('');
          }}
          className={`
            px-3 py-1.5 rounded-full font-semibold text-xs transition-all duration-200
            flex items-center gap-1.5 whitespace-nowrap
            ${activeTab === 'favourite' 
              ? 'bg-[#10B981] text-white shadow-lg shadow-[#10B981]/30' 
              : 'bg-white/5 text-[#D1FAE5]/60 hover:text-[#D1FAE5] hover:bg-white/10 border border-[#10B981]/20'
            }
          `}
        >
          <Star className="w-3 h-3" />
          Favourite
        </button>
      </div>

      {/* Content - Based on Active Tab */}
      {activeTab === 'all' ? (
        <div className="flex-1 overflow-y-auto">
          <UserList 
            users={filteredUsers}
            onlineUsers={onlineUsers}
            selectedUserId={selectedUserId}
            showPreview={showPreview}
            compactMode={compactMode}
            onSelectUser={(user) => {
              onSelectUser(user);
              setIsMobileOpen(false);
            }}
          />
          {filteredGroups.length > 0 && (
            <div className="border-t-2 border-[#10B981]/20">
              <GroupList 
                groups={filteredGroups}
                selectedGroupId={selectedGroupId}
                onSelectGroup={(group) => {
                  onSelectGroup(group);
                  setIsMobileOpen(false);
                }}
              />
            </div>
          )}
        </div>
      ) : activeTab === 'chats' ? (
        <UserList 
          users={filteredUsers}
          onlineUsers={onlineUsers}
          selectedUserId={selectedUserId}
          showPreview={showPreview}
          compactMode={compactMode}
          onSelectUser={(user) => {
            onSelectUser(user);
            setIsMobileOpen(false);
          }}
        />
      ) : activeTab === 'groups' ? (
        <GroupList 
          groups={filteredGroups}
          selectedGroupId={selectedGroupId}
          onSelectGroup={(group) => {
            onSelectGroup(group);
            setIsMobileOpen(false);
          }}
        />
      ) : (
        <div className="flex-1 overflow-y-auto">
          {favoriteUsers.length > 0 && (
            <UserList 
              users={favoriteUsers}
              onlineUsers={onlineUsers}
              selectedUserId={selectedUserId}
              showPreview={showPreview}
              compactMode={compactMode}
              onSelectUser={(user) => {
                onSelectUser(user);
                setIsMobileOpen(false);
              }}
            />
          )}
          {favoriteGroups.length > 0 && (
            <div className={favoriteUsers.length > 0 ? 'border-t-2 border-[#10B981]/20' : ''}>
              <GroupList 
                groups={favoriteGroups}
                selectedGroupId={selectedGroupId}
                onSelectGroup={(group) => {
                  onSelectGroup(group);
                  setIsMobileOpen(false);
                }}
              />
            </div>
          )}
          {favoriteUsers.length === 0 && favoriteGroups.length === 0 && (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <Star className="w-12 h-12 text-[#D1FAE5]/20 mx-auto mb-4" />
                <p className="text-[#D1FAE5]/60">No favourites yet</p>
                <p className="text-sm text-[#D1FAE5]/40 mt-2">Add chats or groups to favourites</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sidebar Footer */}
      <div className="h-20 border-t-2 border-[#10B981]/20 bg-[#064E3B]/40 backdrop-blur-xl px-4 flex items-center justify-between gap-2 shadow-sm">
        <button
          type="button"
          onClick={onOpenProfile}
          className="p-1 rounded-xl hover:bg-[#10B981]/10 transition-all duration-200"
          title="Your profile"
        >
          <Avatar
            name={currentUser?.name || ''}
            src={currentUser?.avatar}
            online={currentUser?.status === 'online'}
            size="sm"
          />
        </button>
        <button
          type="button"
          onClick={onOpenContacts}
          className="p-3 rounded-xl hover:bg-[#10B981]/10 text-[#D1FAE5]/60 hover:text-[#10B981] transition-all duration-200 hover:scale-105"
          title="Contacts"
        >
          <Users className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onOpenCreateGroup}
          className="p-3 rounded-xl hover:bg-[#10B981]/10 text-[#D1FAE5]/60 hover:text-[#10B981] transition-all duration-200 hover:scale-105"
          title="Create Group"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-3 rounded-xl hover:bg-[#10B981]/10 text-[#D1FAE5]/60 hover:text-[#10B981] transition-all duration-200 hover:scale-105"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="p-3 rounded-xl hover:bg-red-500/10 text-[#D1FAE5]/60 hover:text-red-500 transition-all duration-200 hover:scale-105"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-[#064E3B] shadow-lg border-2 border-[#10B981]/20 text-[#D1FAE5] hover:bg-[#065F46] transition-all"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        w-full lg:w-96 h-full bg-[#064E3B]/60 backdrop-blur-xl flex flex-col border-r-2 border-[#10B981]/20 shadow-xl
        fixed lg:relative inset-y-0 left-0 z-40
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {sidebarContent}
      </div>
    </>
  );
};

Sidebar.propTypes = {
  users: PropTypes.array.isRequired,
  groups: PropTypes.array,
  onlineUsers: PropTypes.instanceOf(Set),
  currentUser: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    _id: PropTypes.string,
    name: PropTypes.string,
    avatar: PropTypes.string,
    status: PropTypes.string,
  }),
  selectedUserId: PropTypes.string,
  onSelectUser: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  onOpenSettings: PropTypes.func.isRequired,
  onOpenProfile: PropTypes.func.isRequired,
  onOpenContacts: PropTypes.func.isRequired,
  onOpenCreateGroup: PropTypes.func.isRequired,
  showPreview: PropTypes.bool.isRequired,
  compactMode: PropTypes.bool.isRequired,
  selectedGroupId: PropTypes.string,
  onSelectGroup: PropTypes.func.isRequired,
};

export default Sidebar;
