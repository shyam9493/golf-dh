import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminLoginPage() {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if user is admin and redirect if so
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin');
    } else if (user && user.role !== 'admin') {
      // User logged in but is not an admin
      setError('❌ This account does not have admin privileges. Please use your admin account.');
      localStorage.removeItem('authToken');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    const result = await login(formData.email, formData.password);

    if (result.success) {
      // After login, check if user is admin
      setTimeout(() => {
        // The AuthContext will handle fetching the user profile
        // which includes the role
      }, 100);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#eef0f2] text-[#1e2530] flex items-center justify-center px-5">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="relative h-10 w-10 rounded-full bg-[#0b4a51]">
              <span className="absolute left-3 top-2 text-lg text-[#94f7c4]">●</span>
              <span className="absolute bottom-2 right-2 h-2.5 w-2.5 rounded-full bg-white"></span>
            </div>
            <p className="text-2xl font-extrabold text-[#0b4a51]">GolFMaster</p>
          </div>
          <h1 className="text-3xl font-extrabold text-[#20323a] mb-2">Admin Portal</h1>
          <p className="text-base text-[#6b7a82]">Sign in to manage platform</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-[#c9d1d6] p-8 shadow-sm">
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#1e2530] mb-2">Admin Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                className="w-full px-4 py-2.5 border border-[#c9d1d6] rounded-xl text-base focus:outline-none focus:border-[#0b4a51] focus:ring-1 focus:ring-[#0b4a51]"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-[#1e2530] mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-[#c9d1d6] rounded-xl text-base focus:outline-none focus:border-[#0b4a51] focus:ring-1 focus:ring-[#0b4a51]"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 rounded-full bg-[#0b4a51] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#083c42] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In as Admin'}
            </button>
          </form>

          {/* Back Link */}
          <p className="text-center text-sm text-[#6b7a82] mt-6">
            <Link to="/login" className="font-semibold text-[#0b4a51] hover:underline">
              User Login
            </Link>
          </p>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-[#8d99a0] mt-8">
          Admin access only
        </p>
      </div>
    </main>
  );
}
