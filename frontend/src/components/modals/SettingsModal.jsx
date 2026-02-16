import PropTypes from 'prop-types';
import { Bell, Volume2, LayoutGrid, Eye } from 'lucide-react';
import Modal from '../common/Modal';

const ToggleRow = ({ icon: Icon, label, description, value, onChange }) => {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`
          w-12 h-7 rounded-full p-1 transition-colors duration-200
          ${value ? 'bg-linear-to-r from-[#013220] to-[#014a2f]' : 'bg-gray-300'}
        `}
      >
        <span
          className={`
            block w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200
            ${value ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
};

ToggleRow.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

const SettingsModal = ({ isOpen, onClose, settings, onUpdate }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="md">
      <div className="space-y-2">
        <ToggleRow
          icon={Bell}
          label="Notifications"
          description="Show alerts for new messages"
          value={settings.notifications}
          onChange={(value) => onUpdate({ ...settings, notifications: value })}
        />
        <ToggleRow
          icon={Volume2}
          label="Sound"
          description="Play a sound for incoming messages"
          value={settings.sound}
          onChange={(value) => onUpdate({ ...settings, sound: value })}
        />
        <ToggleRow
          icon={LayoutGrid}
          label="Compact mode"
          description="Tighter spacing for message threads"
          value={settings.compactMode}
          onChange={(value) => onUpdate({ ...settings, compactMode: value })}
        />
        <ToggleRow
          icon={Eye}
          label="Message previews"
          description="Show last message in the sidebar"
          value={settings.previews}
          onChange={(value) => onUpdate({ ...settings, previews: value })}
        />
      </div>
    </Modal>
  );
};

SettingsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  settings: PropTypes.shape({
    notifications: PropTypes.bool.isRequired,
    sound: PropTypes.bool.isRequired,
    compactMode: PropTypes.bool.isRequired,
    previews: PropTypes.bool.isRequired,
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default SettingsModal;
