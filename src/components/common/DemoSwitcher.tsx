'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, setCurrentUser, getUsers, resetToDefaultData } from '@/lib/storage';
import { User } from '@/types';
import { ShieldCheck, UserCheck, Eye, RefreshCw, ChevronUp, ChevronDown, Check } from 'lucide-react';

export default function DemoSwitcher() {
  if (process.env.NODE_ENV === 'production') return null;

  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setCurrentUserState(getCurrentUser());
      setAllUsers(getUsers());
    };
    refresh();
    window.addEventListener('dh-storage-update', refresh);
    return () => window.removeEventListener('dh-storage-update', refresh);
  }, []);

  const handleSelectUser = (userId: string | null) => {
    setCurrentUser(userId);
    setCurrentUserState(getCurrentUser());
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-[#05070A]/95 backdrop-blur-md border border-[#D4AF37]/30 rounded-2xl shadow-2xl p-2 text-xs text-slate-200">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-white/10 rounded-xl transition font-medium"
        >
          <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
          <span className="text-slate-400">Testing Persona:</span>
          <span className="font-semibold text-white flex items-center gap-1.5">
            {currentUser ? (
              <>
                {currentUser.role === 'admin' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                )}
                {currentUser.name} ({currentUser.role})
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                Public Visitor
              </>
            )}
          </span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>

        {isOpen && (
          <div className="mt-2 pt-2 border-t border-white/10 space-y-1 w-72">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 px-3 py-1 font-semibold font-mono">
              Switch User Role
            </div>

            <button
              onClick={() => handleSelectUser(null)}
              className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition ${
                !currentUser ? 'bg-[#D4AF37]/20 text-[#F5E6AB] font-semibold border border-[#D4AF37]/40' : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="text-slate-200">Public Visitor</div>
                  <div className="text-[10px] text-slate-400">Logged out, browse & explore</div>
                </div>
              </div>
              {!currentUser && <Check className="w-4 h-4 text-[#D4AF37]" />}
            </button>

            {allUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user.id)}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition ${
                  currentUser?.id === user.id
                    ? 'bg-[#D4AF37]/20 text-[#F5E6AB] font-semibold border border-[#D4AF37]/40'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  {user.role === 'admin' ? (
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  ) : (
                    <UserCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  )}
                  <div className="truncate">
                    <div className="text-slate-200 truncate font-medium">
                      {user.name}{' '}
                      {user.role === 'admin' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#F5E6AB] ml-1 font-mono">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {user.subscriptionStatus === 'active' ? (
                        <span className="text-[#D4AF37]">Active {user.billingCycle}</span>
                      ) : (
                        <span className="text-rose-400 capitalize">{user.subscriptionStatus}</span>
                      )}
                      {user.id === 'user-1' && ' · Winner ($5,600)'}
                    </div>
                  </div>
                </div>
                {currentUser?.id === user.id && <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />}
              </button>
            ))}

            <div className="pt-2 border-t border-white/10 mt-2">
              <button
                onClick={resetToDefaultData}
                className="w-full text-left px-3 py-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition flex items-center gap-2 text-[11px]"
              >
                <RefreshCw className="w-3 h-3" />
                Reset All Demo Data to Defaults
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
