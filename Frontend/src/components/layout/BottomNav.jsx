import { NavLink } from 'react-router-dom';
import { Home, Bookmark, User, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/saved', label: 'Saved', icon: Bookmark },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-cream-300 bg-cream-50/95 px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 shadow-[0_-4px_16px_rgba(30,42,56,0.06)] backdrop-blur dark:border-ink-800 dark:bg-surface-dark/95 lg:hidden"
      aria-label="Primary navigation"
    >
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[11px] font-medium transition-colors ${
              isActive
                ? 'text-azure-500 dark:text-gilt-300'
                : 'text-ink-300 hover:text-ink-500 dark:hover:text-ink-100'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                size={20}
                className={
                  isActive
                    ? 'drop-shadow-[0_0_6px_rgba(47,93,159,0.55)] dark:drop-shadow-[0_0_6px_rgba(240,199,94,0.65)]'
                    : ''
                }
              />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
