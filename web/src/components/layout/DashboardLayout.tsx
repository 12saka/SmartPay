"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, FileText, Settings, LogOut, 
  Wallet, PieChart, ShieldCheck, CalendarCheck, FileSpreadsheet,
  ChevronLeft, ChevronRight, Search, Star, Clock, Bell, HelpCircle,
  Menu, X, Command
} from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { ProtectedRoute } from '../providers/ProtectedRoute';
import { ToastProvider } from '../ui/ToastProvider';
import { CommandPalette } from '../ui/CommandPalette';
import { CelebrationProvider } from '../providers/CelebrationProvider';
import styles from './DashboardLayout.module.css';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
  description: string;
  shortcut: string;
  shortcutKey: string; // for keyboard events matching
  badge?: number;
  children?: { name: string; href: string; roles: string[] }[];
}

const NAV_ITEMS: NavItem[] = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: <LayoutDashboard size={20} />, 
    roles: ['MANAGER', 'ACCOUNTANT', 'EMPLOYEE'],
    description: 'Overview of payroll, employees, analytics and reports.',
    shortcut: 'Alt+D',
    shortcutKey: 'd'
  },
  { 
    name: 'Employees', 
    href: '/dashboard/employees', 
    icon: <Users size={20} />, 
    roles: ['MANAGER', 'ACCOUNTANT'],
    description: 'Manage staff profiles, roles, and status.',
    shortcut: 'Alt+E',
    shortcutKey: 'e',
    children: [
      { name: 'Staff Directory', href: '/dashboard/employees', roles: ['MANAGER', 'ACCOUNTANT'] },
      { name: 'Add Employee', href: '/dashboard/employees?action=add', roles: ['MANAGER'] }
    ]
  },
  { 
    name: 'Attendance & Leave', 
    href: '/dashboard/attendance', 
    icon: <CalendarCheck size={20} />, 
    roles: ['MANAGER', 'EMPLOYEE'],
    description: 'Track time off, check-ins, and leave requests.',
    shortcut: 'Alt+A',
    shortcutKey: 'a'
  },
  { 
    name: 'Payroll', 
    href: '/dashboard/payroll', 
    icon: <FileSpreadsheet size={20} />, 
    roles: ['MANAGER', 'ACCOUNTANT'],
    description: 'Calculate salaries, bonuses, and tax deductions.',
    shortcut: 'Alt+P',
    shortcutKey: 'p',
    children: [
      { name: 'Run Payroll', href: '/dashboard/payroll', roles: ['MANAGER', 'ACCOUNTANT'] },
      { name: 'Salary Advances', href: '/dashboard/advances', roles: ['MANAGER', 'ACCOUNTANT'] }
    ]
  },
  { 
    name: 'Finance & Taxes', 
    href: '/dashboard/finance', 
    icon: <Wallet size={20} />, 
    roles: ['MANAGER', 'ACCOUNTANT'],
    description: 'Direct deposits, statutory filings, and wallets.',
    shortcut: 'Alt+F',
    shortcutKey: 'f'
  },
  { 
    name: 'Reports', 
    href: '/dashboard/reports', 
    icon: <PieChart size={20} />, 
    roles: ['MANAGER', 'ACCOUNTANT'],
    description: 'Exportable visual data and audit summaries.',
    shortcut: 'Alt+R',
    shortcutKey: 'r'
  },
  { 
    name: 'My Payslips', 
    href: '/dashboard/payslips', 
    icon: <FileText size={20} />, 
    roles: ['EMPLOYEE'],
    description: 'View and download historical pay records.',
    shortcut: 'Alt+S',
    shortcutKey: 's'
  },
  { 
    name: 'Audit Logs', 
    href: '/dashboard/audit', 
    icon: <ShieldCheck size={20} />, 
    roles: ['MANAGER'],
    description: 'Trace account changes, auth events, and exports.',
    shortcut: 'Alt+L',
    shortcutKey: 'l'
  },
  { 
    name: 'Settings', 
    href: '/dashboard/settings', 
    icon: <Settings size={20} />, 
    roles: ['MANAGER'],
    description: 'Configure organization rules and workflows.',
    shortcut: 'Alt+G',
    shortcutKey: 'g'
  },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, hasRole } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Load preferences from local storage or defaults
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentPages, setRecentPages] = useState<string[]>([]);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);

  useEffect(() => {
    // Client-side initialization
    const savedCollapsed = localStorage.getItem('sidebar-collapsed');
    if (savedCollapsed) {
      setIsCollapsed(savedCollapsed === 'true');
    }
    const savedFavorites = localStorage.getItem('sidebar-favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Failed to parse favorites', e);
      }
    }
    const savedRecents = localStorage.getItem('sidebar-recents');
    if (savedRecents) {
      try {
        setRecentPages(JSON.parse(savedRecents));
      } catch (e) {
        console.error('Failed to parse recents', e);
      }
    }
  }, []);

  // Update recents when pathname changes
  useEffect(() => {
    if (!pathname) return;
    const activeItem = NAV_ITEMS.find(item => pathname === item.href || pathname.startsWith(`${item.href}/`));
    if (activeItem) {
      setRecentPages(prev => {
        const filtered = prev.filter(x => x !== activeItem.href);
        const updated = [activeItem.href, ...filtered].slice(0, 3);
        localStorage.setItem('sidebar-recents', JSON.stringify(updated));
        return updated;
      });
    }
  }, [pathname]);

  // Handle Global Shortcuts — Alt+key navigation + Ctrl+K palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K / Cmd+K → Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCmdPaletteOpen(prev => !prev);
        return;
      }
      if (e.altKey) {
        const matchingItem = NAV_ITEMS.find(item => item.shortcutKey === e.key.toLowerCase() && hasRole(item.roles));
        if (matchingItem) {
          e.preventDefault();
          router.push(matchingItem.href);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, user]);

  if (!user) return null;

  const allowedNavItems = NAV_ITEMS.filter(item => hasRole(item.roles));

  // Filter items based on search query
  const filteredNavItems = allowedNavItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPageTitle = () => {
    const activeItem = allowedNavItems.find(item => pathname === item.href || pathname.startsWith(`${item.href}/`));
    return activeItem ? activeItem.name : 'Dashboard';
  };

  const toggleCollapse = () => {
    const newVal = !isCollapsed;
    setIsCollapsed(newVal);
    localStorage.setItem('sidebar-collapsed', String(newVal));
  };

  const toggleFavorite = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(prev => {
      const updated = prev.includes(href) ? prev.filter(x => x !== href) : [...prev, href];
      localStorage.setItem('sidebar-favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleSubmenu = (name: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedMenus(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // Bottom nav primary items (visible always on mobile dock)
  const BOTTOM_NAV = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={22} /> },
    { name: 'Employees', href: '/dashboard/employees', icon: <Users size={22} /> },
    { name: 'Payroll', href: '/dashboard/payroll', icon: <FileSpreadsheet size={22} /> },
    { name: 'Finance', href: '/dashboard/finance', icon: <Wallet size={22} /> },
  ];

  return (
    <ProtectedRoute>
      <ToastProvider>

      {/* Skip to main content — A11y */}
      <a href="#main-content" className="skip-to-content">Skip to main content</a>

      {/* Global Command Palette */}
      <CommandPalette isOpen={cmdPaletteOpen} onClose={() => setCmdPaletteOpen(false)} />

      <CelebrationProvider>
      <div className={`${styles.container} ${isCollapsed ? styles.collapsedLayout : ''}`}>

        {/* ─── MOBILE TOP BAR ─────────────────────────── */}
        <header className={styles.mobileTopBar}>
          <span className={styles.mobileTopBarLogo}>
            SmartPay<span style={{ color: 'var(--accent)' }}>.</span>
          </span>
          <div className={styles.mobileTopBarActions}>
            <button className={styles.mobileTopBarBtn} aria-label="Notifications">
              <Bell size={20} />
              <span className={styles.bellBadge}></span>
            </button>
            <button
              className={styles.mobileTopBarBtn}
              aria-label="Open Menu"
              onClick={() => setMobileDrawerOpen(true)}
            >
              <Menu size={22} />
            </button>
          </div>
        </header>

        {/* ─── MOBILE DRAWER BACKDROP ─────────────────── */}
        {mobileDrawerOpen && (
          <div
            className={styles.mobileDrawerBackdrop}
            onClick={() => setMobileDrawerOpen(false)}
          />
        )}

        {/* ─── MOBILE DRAWER ──────────────────────────── */}
        {mobileDrawerOpen && (
          <div className={styles.mobileDrawer} role="dialog" aria-modal="true" aria-label="Navigation menu">
            <div className={styles.mobileDrawerHeader}>
              <span className={styles.mobileDrawerTitle}>Menu</span>
              <button
                className={styles.mobileDrawerClose}
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <nav className={styles.mobileDrawerNav}>
              {allowedNavItems.map(item => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`${styles.mobileDrawerItem} ${isActive ? styles.mobileDrawerItemActive : ''}`}
                  >
                    <span className={styles.mobileDrawerItemIcon}>{item.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.1rem' }}>{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className={styles.mobileDrawerFooter}>
              <div className={styles.mobileDrawerUserCard}>
                <div className={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
                <div>
                  <div className={styles.userName}>{user.name}</div>
                  <div className={styles.userRole}>{user.role}</div>
                </div>
              </div>
              <button className={styles.mobileDrawerLogoutBtn} onClick={logout}>
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
          {/* Logo Section */}
          <div className={styles.logo}>
            {!isCollapsed ? (
              <>
                <span className={styles.logoText}>SmartPay<span className={styles.accentText}>.</span></span>
              </>
            ) : (
              <span className={styles.logoTextIcon}>S.</span>
            )}
          </div>

          {/* Search Navigation - Hidden when collapsed */}
          {!isCollapsed && (
            <div className={styles.searchContainer}>
              <Search size={16} className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search menu..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          )}

          {/* Navigation Section */}
          <nav className={styles.nav}>
            {/* Favorites Category (if any) */}
            {favorites.length > 0 && !isCollapsed && !searchQuery && (
              <div className={styles.categoryGroup}>
                <div className={styles.categoryTitle}>Favorites</div>
                {allowedNavItems
                  .filter(item => favorites.includes(item.href))
                  .map(item => (
                    <Link 
                      key={`fav-${item.href}`} 
                      href={item.href}
                      className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
                    >
                      {item.icon}
                      <span className={styles.navItemText}>{item.name}</span>
                    </Link>
                  ))}
              </div>
            )}

            {/* Main Navigation Category */}
            <div className={styles.categoryGroup}>
              {!isCollapsed && <div className={styles.categoryTitle}>Main Menu</div>}
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const isFav = favorites.includes(item.href);
                const hasChildren = item.children && item.children.length > 0;
                const isSubExpanded = expandedMenus[item.name];

                return (
                  <div key={item.href} className={styles.navItemWrapper}>
                    <div 
                      className={`${styles.navItem} ${isActive ? styles.active : ''} ${isCollapsed ? styles.hasTooltip : ''}`}
                      onClick={(e) => hasChildren ? toggleSubmenu(item.name, e) : router.push(item.href)}
                      data-tooltip={item.name}
                    >
                      <div className={styles.navItemMain}>
                        {item.icon}
                        {!isCollapsed && (
                          <div className={styles.navItemDetails}>
                            <span className={styles.navItemName}>{item.name}</span>
                            <span className={styles.navItemDescription}>{item.description}</span>
                          </div>
                        )}
                      </div>

                      {/* Right side elements inside navItem (Shortcut, Favorite, Badge) */}
                      {!isCollapsed && (
                        <div className={styles.navItemMeta}>
                          {item.badge && <span className={styles.badge}>{item.badge}</span>}
                          <span className={styles.shortcutKeyLabel}>{item.shortcut}</span>
                          <button 
                            className={`${styles.favBtn} ${isFav ? styles.favActive : ''}`} 
                            onClick={(e) => toggleFavorite(item.href, e)}
                          >
                            <Star size={14} fill={isFav ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Render Nested Menu if expanded */}
                    {hasChildren && isSubExpanded && !isCollapsed && (
                      <div className={styles.submenu}>
                        {item.children?.map(sub => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <Link 
                              key={sub.href} 
                              href={sub.href}
                              className={`${styles.submenuItem} ${isSubActive ? styles.submenuActive : ''}`}
                            >
                              <span>{sub.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Recent Pages Section */}
            {recentPages.length > 0 && !isCollapsed && !searchQuery && (
              <div className={styles.categoryGroup}>
                <div className={styles.categoryTitle}>Recents</div>
                {recentPages.map(href => {
                  const item = NAV_ITEMS.find(x => x.href === href);
                  if (!item) return null;
                  return (
                    <Link 
                      key={`recent-${href}`} 
                      href={href}
                      className={styles.recentItem}
                    >
                      <Clock size={14} className={styles.recentIcon} />
                      <span className={styles.recentName}>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>

          {/* User Profile & Collapse Toggle */}
          <div className={styles.sidebarFooter}>
            <div className={styles.userProfile}>
              <div className={styles.avatar}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{user.name}</div>
                  <div className={styles.userRole}>{user.role}</div>
                </div>
              )}
              {!isCollapsed && (
                <button className={styles.logoutBtn} onClick={logout} title="Logout">
                  <LogOut size={18} />
                </button>
              )}
            </div>

            {/* Collapse / Expand Toggle Button */}
            <button className={styles.toggleCollapseBtn} onClick={toggleCollapse} aria-label="Toggle Sidebar">
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        </aside>
        
        <main className={styles.mainContent}>
          <header className={styles.topbar}>
            <div className={styles.pageTitle}>{getPageTitle()}</div>
            <div className={styles.topbarRight}>
              {/* Ctrl+K Command Palette trigger chip */}
              <button
                className="cmd-hint-chip"
                onClick={() => setCmdPaletteOpen(true)}
                aria-label="Open command palette (Ctrl+K)"
                title="Open command palette"
              >
                <Command size={12} />
                <span>Ctrl+K</span>
              </button>
              {/* Notification icon & user quick link placeholders */}
              <button className={styles.iconBtn} aria-label="Notifications">
                <Bell size={20} />
                <span className={styles.bellBadge}></span>
              </button>
              <button className={styles.iconBtn} aria-label="Help">
                <HelpCircle size={20} />
              </button>
            </div>
          </header>

          <div className={styles.content}>
            {/* Dynamic Breadcrumbs */}
            <div className={styles.breadcrumb}>
              <Link href="/dashboard" className={styles.breadcrumbLink}>Home</Link>
              {pathname.split('/').filter(Boolean).slice(1).map((path, idx, arr) => {
                const isLast = idx === arr.length - 1;
                const pathName = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
                const pathUrl = '/dashboard/' + arr.slice(0, idx + 1).join('/');
                return (
                  <React.Fragment key={pathUrl}>
                    <span className={styles.breadcrumbSeparator}>/</span>
                    {isLast ? (
                      <span className={styles.breadcrumbActive}>{pathName}</span>
                    ) : (
                      <Link href={pathUrl} className={styles.breadcrumbLink}>{pathName}</Link>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Dynamic Interactive Page Title/Header Section */}
            <div className={styles.pageHeaderSection}>
              <h2 className={styles.pageHeading}>{getPageTitle()}</h2>
              <p className={styles.pageDescription}>
                {allowedNavItems.find(item => pathname === item.href || pathname.startsWith(`${item.href}/`))?.description || 'Overview of payroll, employees, and analytics.'}
              </p>
            </div>

            {/* Main Page Content Body */}
            <div className={styles.innerContent} id="main-content">
              {children}
            </div>

            {/* Enterprise Layout Footer */}
            <footer className={styles.footer}>
              <div className={styles.footerLeft}>
                <span>© {new Date().getFullYear()} SmartPay Enterprise. All rights reserved.</span>
              </div>
              <div className={styles.footerRight}>
                <span className={styles.statusIndicator}>
                  <span className={styles.statusDot}></span> System Active
                </span>
                <span className={styles.divider}>|</span>
                <span className={styles.shortcutsHint}>Press Alt + Key to navigate</span>
              </div>
            </footer>
          </div>
        </main>

        {/* ─── MOBILE BOTTOM NAVIGATION DOCK ──────────── */}
        <nav className={styles.bottomNav} aria-label="Bottom navigation">
          {BOTTOM_NAV.filter(item => allowedNavItems.some(a => a.href === item.href)).map(item => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.bottomNavItem} ${isActive ? styles.bottomNavActive : ''}`}
                aria-label={item.name}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
          <button
            className={`${styles.bottomNavItem} ${mobileDrawerOpen ? styles.bottomNavActive : ''}`}
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="More options"
          >
            <Menu size={22} />
            <span>More</span>
          </button>
        </nav>

      </div>
      </CelebrationProvider>
    </ToastProvider>
    </ProtectedRoute>
  );
}

