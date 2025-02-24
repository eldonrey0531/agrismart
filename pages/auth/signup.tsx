import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAPI } from '@/hooks/useAPI';

const Signup = () => {
  const router = useRouter();
  const api = useAPI();
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Progressive registration implementation
      const response = await api.post('/api/auth/signup', {
        email: 'email@example.com',
        password: 'password',
        // Additional registration fields will be added
      });

      if (response.data.requiresVerification) {
        router.push('/auth/verify');
      } else {
        router.push('/auth/login');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div>
      <h1>Create Account</h1>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSignup}>
        {/* Progressive registration form will be implemented here */}
      </form>
      <div>
        Already have an account?{' '}
        <a href="/auth/login">Login here</a>
      </div>
    </div>
  );
};

export default Signup;