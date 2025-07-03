/**
 * Bottom Navigation for Mobile
 */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  UserIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  HeartIcon as HeartIconSolid,
  UserIcon as UserIconSolid,
  SparklesIcon as SparklesIconSolid,
} from '@heroicons/react/24/solid';
import { useAuth } from '../../hooks/useAuth';

const BottomNavigation = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
    },
    {
      name: 'Search',
      path: '/search',
      icon: MagnifyingGlassIcon,
      iconSolid: MagnifyingGlassIconSolid,
    },
    {
      name: 'Products',
      path: '/products',
      icon: SparklesIcon,
      iconSolid: SparklesIconSolid,
    },
    ...(isAuthenticated ? [
      {
        name: 'For You',
        path: '/recommendations',
        icon: HeartIcon,
        iconSolid: HeartIconSolid,
      },
      {
        name: 'Profile',
        path: '/profile',
        icon: UserIcon,
        iconSolid: UserIconSolid,
      },
    ] : []),
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden z-40">
      <div className="glass-effect border-t border-white/20">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = active ? item.iconSolid : item.icon;

            return (
              <Link
                key={item.name}
                to={item.path}
                className="flex flex-col items-center justify-center p-2 min-w-0 flex-1"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`flex flex-col items-center space-y-1 ${
                    active ? 'text-primary-600' : 'text-gray-500'
                  }`}
                >
                  <div className="relative">
                    <Icon className="w-6 h-6" />
                    {active && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </div>
                  <span className={`text-xs font-medium ${
                    active ? 'text-primary-600' : 'text-gray-500'
                  }`}>
                    {item.name}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
