import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from '../types';
import { authService } from '../services/mockData';

interface AuthContextType {
    user: AuthUser | null;
    isLoggedIn: boolean;
    isAdmin: boolean;
    login: (username: string, password: string) => { success: boolean; message: string };
    logout: () => void;
    hasPagePermission: (page: string) => boolean;
    hasEntityPermission: (entity: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check for existing session
        if (authService.isLoggedIn()) {
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
                setIsLoggedIn(true);
            }
        }
    }, []);

    const login = (username: string, password: string) => {
        const result = authService.login(username, password);
        if (result.success && result.user) {
            setUser(result.user);
            setIsLoggedIn(true);
        }
        return { success: result.success, message: result.message };
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setIsLoggedIn(false);
    };

    const hasPagePermission = (page: string): boolean => {
        if (!user) return false;
        return user.pagePermissions.includes(page);
    };

    const hasEntityPermission = (entity: string, action: string): boolean => {
        if (!user) return false;
        const perms = user.entityPermissions[entity];
        return perms ? perms.includes(action) : false;
    };

    const isAdmin = user?.roleName === 'Admin';

    return (
        <AuthContext.Provider value={{
            user,
            isLoggedIn,
            isAdmin,
            login,
            logout,
            hasPagePermission,
            hasEntityPermission
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
