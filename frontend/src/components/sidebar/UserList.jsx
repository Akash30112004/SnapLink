import PropTypes from 'prop-types';
import UserItem from './UserItem';

const UserList = ({ users, onlineUsers = new Set(), selectedUserId, onSelectUser, showPreview, compactMode }) => {
  return (
    <div className={`flex-1 overflow-y-auto px-4 py-2 ${compactMode ? 'space-y-1.5' : 'space-y-2'}`}>
      {users.map((user) => (
        <UserItem
          key={user._id}
          user={user}
          isOnline={onlineUsers.has(user._id)}
          isSelected={selectedUserId === user._id}
          showPreview={showPreview}
          compactMode={compactMode}
          onClick={() => onSelectUser(user)}
        />
      ))}
    </div>
  );
};

UserList.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
    })
  ).isRequired,
  onlineUsers: PropTypes.instanceOf(Set),
  selectedUserId: PropTypes.string,
  onSelectUser: PropTypes.func.isRequired,
  showPreview: PropTypes.bool.isRequired,
  compactMode: PropTypes.bool.isRequired,
};

export default UserList;
