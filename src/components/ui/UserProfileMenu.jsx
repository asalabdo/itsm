import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const UserProfileMenu = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { isRtl, language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);

  const user = {
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@supportflow.com',
    role: 'Support Agent',
    avatar: null,
  };

  const menuItems = [
    { label: t('myProfile', 'My Profile'), icon: 'User', action: () => navigate('/user-management') },
    { label: t('settings', 'Settings'), icon: 'Settings', action: () => navigate('/settings') },
    { label: t('preferences', 'Preferences'), icon: 'Sliders', action: () => navigate('/settings') },
    { label: t('helpSupport', 'Help & Support'), icon: 'HelpCircle', action: () => navigate('/ticket-chatbot') },
    { divider: true },
    {
      label: t('signOut', 'Sign Out'),
      icon: 'LogOut',
      action: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      },
      danger: true,
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMenuItemClick = (action) => {
    action();
    setIsOpen(false);
  };

  const getInitials = (name) => name?.split(' ')?.map((n) => n?.[0])?.join('')?.toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-smooth"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('myProfile', 'User menu')}
      >
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium text-sm">
          {getInitials(user?.name)}
        </div>
        <Icon name="ChevronDown" size={16} />
      </button>
      {isOpen && (
        <div className={`absolute top-12 w-64 bg-popover border border-border rounded-md shadow-lg z-dropdown overflow-hidden ${isRtl ? 'left-0' : 'right-0'}`}>
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium text-lg">
                {getInitials(user?.name)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground truncate">{user?.name}</h4>
                <p className="text-sm text-muted-foreground truncate caption">{user?.role}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground truncate caption">{user?.email}</p>
          </div>

          <div className="py-2">
            {menuItems?.map((item, index) => {
              if (item?.divider) {
                return <div key={`divider-${index}`} className="my-2 border-t border-border" />;
              }

              return (
                <button
                  key={item?.label}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-smooth ${item?.danger ? 'text-error hover:text-error' : 'text-foreground'
                    }`}
                  onClick={() => handleMenuItemClick(item?.action)}
                >
                  <Icon
                    name={item?.icon}
                    size={18}
                    color={item?.danger ? 'var(--color-error)' : undefined}
                  />
                  <span>{item?.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileMenu;
