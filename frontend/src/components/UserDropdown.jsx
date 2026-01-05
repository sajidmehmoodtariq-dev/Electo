import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { LogOut, User, ChevronDown, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserDropdown = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    // Update dropdown position when opening
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right
            });
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                buttonRef.current && !buttonRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Helper to get initials
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <div className="relative" ref={buttonRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-3 focus:outline-none group p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                {/* Avatar */}
                <div className="relative">
                    {user?.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-10 w-10 rounded-full object-cover border-2 border-indigo-500 shadow-sm"
                        />
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm border-2 border-white">
                            {getInitials(user?.name)}
                        </div>
                    )}
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">{user?.name}</span>
                    <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu - Rendered via Portal */}
            {isOpen && createPortal(
                <div 
                    ref={dropdownRef}
                    className="fixed w-56 bg-white rounded-xl shadow-2xl py-2 border border-gray-100 z-[99999]"
                    style={{ 
                        top: `${dropdownPosition.top}px`, 
                        right: `${dropdownPosition.right}px` 
                    }}
                >
                    <div className="px-4 py-3 border-b border-gray-50">
                        <p className="text-sm text-gray-900 font-bold truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>

                    <div className="py-1">
                        <Link
                            to="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <User className="mr-3 h-4 w-4" />
                            My Profile
                        </Link>
                        {/* Could add more links here like Settings if separate */}
                    </div>

                    <div className="border-t border-gray-50 py-1">
                        <button
                            onClick={logout}
                            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                        >
                            <LogOut className="mr-3 h-4 w-4" />
                            Sign out
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default UserDropdown;
