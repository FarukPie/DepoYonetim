import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Warehouse, Package, FileText, Users,
    FolderTree, UserCog, LogOut, ChevronDown, Menu, X,
    ClipboardList, Shield, FileCheck, Activity, PlusCircle
} from 'lucide-react';
import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { taleplerService } from '../../services/mockData';

interface LayoutProps {
    children: ReactNode;
}

interface NavItem {
    path?: string;
    icon: React.ElementType;
    label: string;
    pageKey?: string;
    children?: { path: string; label: string; pageKey: string }[];
    badge?: number;
}

export default function Layout({ children }: LayoutProps) {
    const location = useLocation();
    const { user, logout, hasPagePermission, isAdmin } = useAuth();
    const [expandedMenu, setExpandedMenu] = useState<string | null>('Depo');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [bekleyenTalepSayisi, setBekleyenTalepSayisi] = useState(0);

    useEffect(() => {
        if (isAdmin) {
            setBekleyenTalepSayisi(taleplerService.getBekleyenSayisi());
        }
    }, [isAdmin, location.pathname]);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Close mobile menu on window resize (when going to desktop)
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleMenu = (label: string) => {
        setExpandedMenu(expandedMenu === label ? null : label);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Main navigation items
    const mainNavItems: NavItem[] = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', pageKey: 'dashboard' },
        {
            label: 'Depo',
            icon: Warehouse,
            children: [
                { path: '/depolar', label: 'Depolar', pageKey: 'depolar' },
                { path: '/urunler', label: 'Ürünler', pageKey: 'urunler' },
            ]
        },
        { path: '/faturalar', icon: FileText, label: 'Faturalar', pageKey: 'faturalar' },
        { path: '/cariler', icon: Users, label: 'Cariler', pageKey: 'cariler' },
        { path: '/kategoriler', icon: FolderTree, label: 'Kategoriler', pageKey: 'kategoriler' },
        { path: '/personeller', icon: UserCog, label: 'Personeller', pageKey: 'personeller' },
        { path: '/zimmetler', icon: ClipboardList, label: 'Zimmetler', pageKey: 'zimmetler' },
    ];

    // Admin navigation items
    const adminNavItems: NavItem[] = [
        { path: '/kullanicilar', icon: Users, label: 'Kullanıcılar', pageKey: 'kullanicilar' },
        { path: '/roller', icon: Shield, label: 'Rol Yönetimi', pageKey: 'roller' },
        { path: '/talepler', icon: FileCheck, label: 'Talepler', pageKey: 'talepler', badge: bekleyenTalepSayisi },
        { path: '/loglar', icon: Activity, label: 'Loglar', pageKey: 'loglar' },
    ];

    // User navigation items
    const userNavItems: NavItem[] = [
        { path: '/talep-olustur', icon: PlusCircle, label: 'Talep Oluştur', pageKey: 'talep-olustur' },
    ];

    const filterNavItems = (items: NavItem[]): NavItem[] => {
        return items.filter(item => {
            if (item.children) {
                const filteredChildren = item.children.filter(child => hasPagePermission(child.pageKey));
                return filteredChildren.length > 0;
            }
            return item.pageKey ? hasPagePermission(item.pageKey) : true;
        }).map(item => {
            if (item.children) {
                return {
                    ...item,
                    children: item.children.filter(child => hasPagePermission(child.pageKey))
                };
            }
            return item;
        });
    };

    const filteredMainItems = filterNavItems(mainNavItems);
    const filteredAdminItems = filterNavItems(adminNavItems);
    const filteredUserItems = filterNavItems(userNavItems);

    const renderNavItem = (item: NavItem) => {
        if (item.children) {
            return (
                <div key={item.label}>
                    <div
                        className={`nav-item ${expandedMenu === item.label ? 'active' : ''}`}
                        onClick={() => toggleMenu(item.label)}
                        style={{ cursor: 'pointer' }}
                    >
                        <item.icon />
                        <span>{item.label}</span>
                        <ChevronDown
                            style={{
                                marginLeft: 'auto',
                                transform: expandedMenu === item.label ? 'rotate(180deg)' : 'none',
                                transition: 'transform 0.2s ease'
                            }}
                        />
                    </div>
                    {expandedMenu === item.label && (
                        <div style={{ paddingLeft: '1rem' }}>
                            {item.children.map((child) => (
                                <NavLink
                                    key={child.path}
                                    to={child.path}
                                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                >
                                    <span style={{ marginLeft: '1.75rem' }}>{child.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <NavLink
                key={item.path}
                to={item.path!}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
                <item.icon />
                <span>{item.label}</span>
                {item.badge && item.badge > 0 && (
                    <span className="badge badge-warning" style={{ marginLeft: 'auto', fontSize: '0.7rem', padding: '2px 6px' }}>
                        {item.badge}
                    </span>
                )}
            </NavLink>
        );
    };

    return (
        <div className="app-layout">
            {/* Mobile Menu Toggle */}
            <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Overlay (Mobile) */}
            <div
                className={`sidebar-overlay ${isMobileMenuOpen ? 'open' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <img src="/logo.png" alt="Can Sağlık Grubu" className="sidebar-logo-img" />
                    <div className="sidebar-title">
                        <h1>Can Hastanesi</h1>
                        <span>Envanter Yönetim Sistemi</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {/* Main Menu */}
                    <div className="nav-section">
                        <div className="nav-section-title">Ana Menü</div>
                        {filteredMainItems.map(renderNavItem)}
                    </div>

                    {/* User Menu */}
                    {filteredUserItems.length > 0 && !isAdmin && (
                        <div className="nav-section">
                            <div className="nav-section-title">Talepler</div>
                            {filteredUserItems.map(renderNavItem)}
                        </div>
                    )}

                    {/* Admin Menu */}
                    {filteredAdminItems.length > 0 && (
                        <div className="nav-section">
                            <div className="nav-section-title">Yönetim</div>
                            {filteredAdminItems.map(renderNavItem)}
                        </div>
                    )}
                </nav>

                {/* User Info & Logout */}
                <div style={{ padding: 'var(--spacing-md)', borderTop: '1px solid var(--border-primary)' }}>
                    {user && (
                        <div style={{ marginBottom: 'var(--spacing-sm)', padding: '0 var(--spacing-sm)' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                                {user.fullName}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {user.roleName}
                            </div>
                        </div>
                    )}
                    <button className="nav-item" onClick={logout} style={{ width: '100%', background: 'none', border: 'none' }}>
                        <LogOut />
                        <span>Çıkış Yap</span>
                    </button>
                </div>
            </aside>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
