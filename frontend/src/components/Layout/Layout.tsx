import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Warehouse, Package, FileText, Users,
    FolderTree, UserCog, LogOut, ChevronDown, Menu, X,
    ClipboardList, Shield, FileCheck, Activity, PlusCircle,
    PanelLeftClose, PanelLeftOpen, Info
} from 'lucide-react';
import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { taleplerService } from '../../services/api';

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
    description?: string;
}

export default function Layout({ children }: LayoutProps) {
    const location = useLocation();
    const { user, logout, hasPagePermission, isAdmin } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [expandedMenu, setExpandedMenu] = useState<string | null>(() => {
        // Initial state: Expand 'Tanımlar' if we are currently on one of its pages
        const path = location.pathname;
        if (['/cariler', '/urunler', '/kategoriler', '/zimmetler', '/faturalar'].some(p => path.startsWith(p))) {
            return 'Tanımlar';
        }
        return null;
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [bekleyenTalepSayisi, setBekleyenTalepSayisi] = useState(0);

    // Auto-collapse 'Tanımlar' menu when navigating outside of it
    useEffect(() => {
        const path = location.pathname;
        const isTanimlarPage = ['/cariler', '/urunler', '/kategoriler', '/zimmetler', '/faturalar'].some(p => path.startsWith(p));

        if (expandedMenu === 'Tanımlar' && !isTanimlarPage) {
            setExpandedMenu(null);
        }
    }, [location.pathname]);

    useEffect(() => {
        const loadBekleyenSayisi = async () => {
            if (isAdmin) {
                try {
                    const sayisi = await taleplerService.getBekleyenSayisi();
                    setBekleyenTalepSayisi(sayisi);
                } catch (error) {
                    console.error('Bekleyen talep sayısı alınamadı:', error);
                }
            }
        };
        loadBekleyenSayisi();
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
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', pageKey: 'dashboard', description: 'Genel durum ve istatistikler' },
        {
            label: 'Tanımlar',
            icon: Warehouse,
            description: 'Sistem tanımları ve yönetimi',
            children: [
                { path: '/cariler', label: 'Cari', pageKey: 'cariler' },
                { path: '/kategoriler', label: 'Kategori', pageKey: 'kategoriler' },
                { path: '/urunler', label: 'Malzeme', pageKey: 'urunler' },
                { path: '/faturalar', label: 'Fatura', pageKey: 'faturalar' },
                { path: '/zimmetler', label: 'Zimmet', pageKey: 'zimmetler' },
            ]
        },
        { path: '/personeller', icon: UserCog, label: 'Personel', pageKey: 'personeller', description: 'Personel listesi ve yönetimi' },
        { path: '/bolumler', icon: FolderTree, label: 'Odalar / Bölümler', pageKey: 'bolumler', description: 'Kat ve oda yerleşimi yönetimi' },
    ];

    // Admin navigation items
    const adminNavItems: NavItem[] = [
        { path: '/kullanicilar', icon: Users, label: 'Kullanıcılar', pageKey: 'kullanicilar', description: 'Sistem kullanıcılarını yönet' },
        { path: '/roller', icon: Shield, label: 'Rol Yönetimi', pageKey: 'roller', description: 'Kullanıcı rolleri ve yetkileri' },
        { path: '/talepler', icon: FileCheck, label: 'Talepler', pageKey: 'talepler', badge: bekleyenTalepSayisi, description: 'Kullanıcı taleplerini onayla/reddet' },
        { path: '/loglar', icon: Activity, label: 'Sistem Kayıt', pageKey: 'loglar', description: 'Sistem işlem geçmişini görüntüle' },
    ];

    // User navigation items
    const userNavItems: NavItem[] = [
        { path: '/talep-olustur', icon: PlusCircle, label: 'Talep Oluştur', pageKey: 'talep-olustur', description: 'Yeni bir talep oluştur' },
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
            // Parent is active if current path matches any child path
            const isParentActive = item.children.some(child =>
                location.pathname === child.path || location.pathname.startsWith(`${child.path}/`)
            );

            return (
                <div key={item.label}>
                    <div
                        className={`nav-item ${isParentActive ? 'active' : ''}`}
                        onClick={() => toggleMenu(item.label)}
                        style={{ cursor: 'pointer' }}
                    >
                        <item.icon />
                        <span>{item.label}</span>

                        <div
                            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}
                            onClick={(e) => e.stopPropagation()}
                            title={item.description}
                        >
                            {!isCollapsed && <Info size={16} className="text-muted" style={{ opacity: 0.7 }} />}
                            <ChevronDown
                                style={{
                                    transform: expandedMenu === item.label ? 'rotate(180deg)' : 'none',
                                    transition: 'transform 0.2s ease'
                                }}
                            />
                        </div>
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
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.badge && item.badge > 0 && (
                        <span className="badge" style={{ fontSize: '0.75rem', padding: '2px 8px', backgroundColor: 'var(--accent-error)', color: 'white', border: '1px solid var(--accent-error)' }}>
                            {item.badge}
                        </span>
                    )}
                    {!isCollapsed && (
                        <div title={item.description} style={{ display: 'flex', alignItems: 'center' }}>
                            <Info size={16} style={{ opacity: 0.7 }} />
                        </div>
                    )}
                </div>
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
            <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
                <div style={{
                    padding: 'var(--spacing-md)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border-primary)',
                    marginBottom: 'var(--spacing-sm)'
                }}>
                    <img
                        src="/sidebar-logo.png"
                        alt="Can Hastanesi"
                        style={{
                            maxWidth: isCollapsed ? '40px' : '100%',
                            maxHeight: '50px',
                            objectFit: 'contain',
                            transition: 'all 0.3s ease'
                        }}
                    />
                </div>

                <nav className="sidebar-nav">
                    {/* Main Menu */}
                    <div className="nav-section">
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
                <div style={{
                    padding: 'var(--spacing-md)',
                    borderTop: '1px solid var(--border-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'space-between',
                    flexDirection: isCollapsed ? 'column' : 'row',
                    gap: isCollapsed ? 'var(--spacing-md)' : '0'
                }}>
                    {/* Toggle Button (Moved here) */}
                    <button
                        className="btn-icon"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        style={{
                            color: 'var(--text-muted)',
                            background: 'transparent',
                            flexShrink: 0,
                            order: isCollapsed ? -1 : 0
                        }}
                    >
                        {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                    </button>

                    {user && !isCollapsed && (
                        <div style={{ paddingLeft: 'var(--spacing-sm)', flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user.roleName}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user.fullName}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={logout}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            padding: 'var(--spacing-xs)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="Çıkış Yap"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </aside>

            <main className="main-content" style={{ marginLeft: isCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)' }}>

                {children}
            </main>
        </div>
    );
}
