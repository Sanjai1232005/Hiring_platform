import { Search, Bell } from 'lucide-react';

const TopHeader = () => {
  return (
    <header className="h-14 bg-[#0a0a0a] border-b border-[#1f1f1f] flex items-center justify-between px-6 shrink-0">
      {/* Search */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search…"
          className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#111111] border border-[#1f1f1f] text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-[#333] transition-colors"
        />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Notification icon */}
        <button className="relative p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors">
          <Bell className="w-[18px] h-[18px] text-gray-400" />
        </button>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white text-xs font-semibold select-none">
          U
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
