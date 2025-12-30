"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Moon, Sun, User, LogOut, LayoutDashboard, ShieldCheck, Flame } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/providers/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { RequestMPAccess } from "@/components/auth/RequestMPAccess";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [showProfile, setShowProfile] = useState(false);
  const { user, signOut, loading } = useAuth();
  const { role, isAdmin, isMPStaff } = useUserRole();
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };

    if (showProfile) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfile]);

  const handleSignOut = async () => {
    setShowProfile(false);
    await signOut();
  };

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl border-b border-stone-200/50 dark:border-stone-800/50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30"
            >
              <Flame className="w-5 h-5 text-white" />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-stone-900 dark:text-stone-100 leading-none">
                CitizenVoice
              </span>
              <span className="text-[10px] text-orange-600 dark:text-orange-400 uppercase tracking-widest font-medium">
                Democracy
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link 
              href="/" 
              className="px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              Explore
            </Link>
            {(isMPStaff() || isAdmin()) && (
              <Link 
                href="/dashboard" 
                className="px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            )}
            {isAdmin() && (
              <Link 
                href="/admin" 
                className="px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full w-9 h-9 hover:bg-orange-50 dark:hover:bg-orange-950/50"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange-600" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-orange-400" />
            </Button>

            {/* Notifications - only show when logged in */}
            {!loading && user && <NotificationBell />}

            {/* User Menu */}
            {!loading && user ? (
              <div className="relative" ref={profileRef}>
                <Button
                  variant="ghost"
                  onClick={() => setShowProfile(!showProfile)}
                  className="h-9 px-3 rounded-full hover:bg-orange-50 dark:hover:bg-orange-950/50 font-medium text-sm"
                >
                  <User className="w-4 h-4 mr-2 text-orange-600 dark:text-orange-400" />
                  <span className="hidden sm:inline text-stone-700 dark:text-stone-300">
                    {user.email?.split('@')[0]}
                  </span>
                </Button>

                <AnimatePresence>
                  {showProfile && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-stone-200 dark:border-stone-800 overflow-hidden"
                    >
                      {/* Profile Info */}
                      <div className="p-4 border-b border-stone-200 dark:border-stone-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                            {user.email?.[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-stone-900 dark:text-stone-100 truncate">
                              {user.email}
                            </div>
                            {role && (
                              <div className="text-xs text-orange-600 dark:text-orange-400 capitalize">
                                {role.replace('_', ' ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        {/* Request MP Access - only for citizens, show if role is citizen OR if loading */}
                        {(role === 'citizen' || (!loading && role === null)) && (
                          <div className="mb-1">
                            <RequestMPAccess />
                          </div>
                        )}
                        
                        {/* Sign Out */}
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-orange-50 dark:hover:bg-orange-950/50 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Button 
                onClick={() => window.location.href = '/auth/signin'}
                className="h-9 px-4 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30 text-sm font-medium"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
