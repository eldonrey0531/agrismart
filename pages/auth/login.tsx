import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { useRouter } from 'next/router';

const Login = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Implement secure login with 2FA
      await login({
        email: 'email@example.com',
        password: 'password'
      });
      router.push('/dashboard');
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleLogin}>
        {/* Secure login form will be implemented here */}
      </form>
    </div>
  );
};

export default Login;