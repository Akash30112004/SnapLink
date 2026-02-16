import PropTypes from 'prop-types';
import { Mail, Phone, MessageSquare, Video } from 'lucide-react';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';

const UserProfileModal = ({ isOpen, onClose, user }) => {
  if (!user) return null;

  const lastSeenText = user.status === 'online' ? 'Active now' : 'Last seen recently';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profile" size="md">
      <div className="flex items-center gap-4 mb-6">
        <Avatar
          name={user.name}
          src={user.avatar}
          online={user.status === 'online'}
          size="xl"
        />
        <div>
          <h4 className="text-xl font-bold text-gray-900">{user.name}</h4>
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${user.status === 'online' ? 'bg-[#013220] animate-pulse' : 'bg-gray-400'}`} />
            {lastSeenText}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-6">
        <p className="text-sm text-gray-700">
          "Always open to new ideas and quick to respond."
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl">
          <Mail className="w-5 h-5 text-gray-600" />
          <span className="text-sm text-gray-700">user@sample.io</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl">
          <Phone className="w-5 h-5 text-gray-600" />
          <span className="text-sm text-gray-700">+1 (555) 204-8891</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold transition-colors"
        >
          <MessageSquare className="w-5 h-5 inline-block mr-2" />
          Message
        </button>
        <button
          type="button"
          className="flex-1 py-3 rounded-xl bg-linear-to-r from-[#013220] to-[#014a2f] text-white font-semibold hover:from-[#014a2f] hover:to-[#016338] transition-colors"
        >
          <Video className="w-5 h-5 inline-block mr-2" />
          Video Call
        </button>
      </div>
    </Modal>
  );
};

UserProfileModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    status: PropTypes.string.isRequired,
  }),
};

UserProfileModal.defaultProps = {
  user: null,
};

export default UserProfileModal;
