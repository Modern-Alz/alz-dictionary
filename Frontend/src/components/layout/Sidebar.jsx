import { NavLink } from 'react-router-dom';
import { Home, Bookmark, User, Settings, LogOut, Crown } from 'lucide-react';
import Logo from '../Logo';
import ThemeToggle from '../ThemeToggle';
import DropdownMenu from './DropdownMenu';
import { useAuth } from '../../contexts/AuthContext';
import { isPremium } from '../../services/storage';

const NAV_ITEMS = [
  { to: '/home',     label: 'Home',         icon: Home },
  { to: '/saved',    label: 'Saved words',  icon: Bookmark },
  { to: '/profile',  label: 'Profile',      icon: User },
  { to: '/settings', label: 'Settings',     icon: Settings },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const userIsPremium = isPremium(user);

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-cream-300 bg-cream-50/70 px-4 py-6 dark:border-ink-800 dark:bg-surface-dark/70 lg:flex">
      {/* Logo + controls row */}
      <div className="flex items-center justify-between px-2">
        <Logo />
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <DropdownMenu />
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-8 flex flex-1 flex-col gap-1.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-azure-500 text-cream-50 shadow-glow-blue dark:bg-gilt-400 dark:text-ink-900 dark:shadow-glow-gold'
                  : 'text-ink-500 hover:bg-cream-200 dark:text-ink-200 dark:hover:bg-surface-darkAlt'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User card */}
      <div className="mt-auto rounded-2xl border border-cream-300 bg-cream-50 p-3 dark:border-ink-800 dark:bg-surface-darkAlt">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-azure-400 to-azure-600 font-display text-sm font-semibold text-cream-50 shadow-glow-blue dark:shadow-glow-gold">
            {user?.fullName?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink-700 dark:text-ink-50">{user?.fullName}</p>
            {userIsPremium ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-gilt-500 dark:text-gilt-300">
                <Crown size={11} /> Premium
              </span>
            ) : (
              <p className="truncate text-xs text-ink-300">Free plan</p>
            )}
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="Log out"
            className="rounded-full p-1.5 text-ink-300 transition-colors hover:bg-cream-200 hover:text-red-500 dark:hover:bg-ink-800"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
