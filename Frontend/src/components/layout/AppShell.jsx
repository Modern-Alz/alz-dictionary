import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import DropdownMenu from './DropdownMenu';
import ThemeToggle from '../ThemeToggle';
import Logo from '../Logo';

export default function AppShell() {
  return (
    <div className="flex min-h-screen bg-cream-100 dark:bg-ink-900">
      {/* Desktop sidebar */}
      <Sidebar />

      <div className="relative flex min-h-screen flex-1 flex-col">
        {/* Mobile top bar: Logo + Theme Toggle + Dropdown */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-cream-300 bg-cream-100/90 px-4 py-3 backdrop-blur dark:border-ink-800 dark:bg-ink-900/90 lg:hidden">
          <Logo size={30} />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu />
          </div>
        </header>

        {/* Desktop theme toggle + dropdown (top-right) */}
        <div className="absolute right-6 top-6 hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <DropdownMenu />
        </div>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-5 sm:px-6 sm:pt-8 lg:px-10 lg:pb-10 lg:pt-16">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav (always visible on mobile) */}
      <BottomNav />
    </div>
  );
}
