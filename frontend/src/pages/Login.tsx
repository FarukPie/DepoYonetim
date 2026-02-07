import { useState, FormEvent } from 'react';
import { Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const result = login(username, password);
        setLoading(false);

        if (!result.success) {
            setError(result.message);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <img src="/sidebar-logo.png" alt="Can Sağlık Grubu" className="login-logo-img" />
                <div className="login-title">

                    <p>Envanter Yönetim Sistemi</p>
                </div>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <div style={{ position: 'relative' }}>
                            <User style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-muted)',
                                width: '18px',
                                height: '18px'
                            }} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Kullanıcı Adı"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{ paddingLeft: '40px' }}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div style={{ position: 'relative' }}>
                            <Lock style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-muted)',
                                width: '18px',
                                height: '18px'
                            }} />
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Şifre"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ paddingLeft: '40px' }}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={loading}
                        style={{ marginTop: 'var(--spacing-lg)', height: '48px' }}
                    >
                        {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                    </button>
                </form>

                <div style={{
                    textAlign: 'left',
                    marginTop: 'var(--spacing-lg)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    backgroundColor: 'var(--bg-tertiary)',
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-sm)'
                }}>
                    <p style={{ margin: '0 0 4px', fontWeight: 600 }}>Demo Hesaplar:</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                        <div>
                            <strong>Admin:</strong> admin / admin123
                        </div>
                        <div>
                            <strong>Kullanıcı:</strong> user / user123
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
