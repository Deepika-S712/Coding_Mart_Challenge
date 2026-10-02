import React, { useState, useRef, useEffect } from 'react';
import { Menu, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="cms-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          className="cms-mobile-menu-btn"
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>
        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--cms-text-secondary)' }}>
          College of Engineering & Technology
        </span>
      </div>

      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px 10px',
            borderRadius: 'var(--cms-radius-md)',
            transition: 'background-color 0.15s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--cms-bg-subtle)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--cms-radius-full)',
              backgroundColor: 'var(--cms-primary-light)',
              color: 'var(--cms-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '13px',
              border: '1px solid var(--cms-primary-border)'
            }}
          >
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'FC'}
          </div>
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 'var(--cms-font-base)', fontWeight: 600, color: 'var(--cms-text-primary)' }}>
              {user?.name || 'Faculty Member'}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--cms-text-secondary)' }}>
              {user?.designation || 'Faculty'}
            </span>
          </div>
          <ChevronDown size={14} color="var(--cms-text-secondary)" />
        </button>

        {dropdownOpen && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: '6px',
              width: '210px',
              backgroundColor: 'var(--cms-bg-surface)',
              border: '1px solid var(--cms-border-subtle)',
              borderRadius: 'var(--cms-radius-md)',
              boxShadow: 'var(--cms-shadow-lg)',
              zIndex: 50,
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--cms-border-subtle)' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cms-text-primary)' }}>{user?.name}</p>
              <p style={{ fontSize: '12px', color: 'var(--cms-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </p>
            </div>

            <div style={{ padding: '4px' }}>
              <Link
                to="/faculty/profile"
                onClick={() => setDropdownOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: 'var(--cms-text-primary)',
                  textDecoration: 'none',
                  borderRadius: 'var(--cms-radius-sm)'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--cms-bg-subtle)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <User size={15} />
                <span>My Profile</span>
              </Link>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: 'var(--cms-danger)',
                  background: 'none',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderRadius: 'var(--cms-radius-sm)'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEE2E2')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <LogOut size={15} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
