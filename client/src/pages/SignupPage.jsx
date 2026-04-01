import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';

export default function SignupPage() {
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await signup(formData.email, formData.password, formData.fullName);

    if (result.success) {
      navigate('/dashboard');
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
          <h1 className="text-3xl font-extrabold text-[#20323a] mb-2">Create Account</h1>
          <p className="text-base text-[#6b7a82]">Join us for monthly prize draws</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-[#c9d1d6] p-8 shadow-sm">
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-[#1e2530] mb-2">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-2.5 border border-[#c9d1d6] rounded-xl text-base focus:outline-none focus:border-[#0b4a51] focus:ring-1 focus:ring-[#0b4a51]"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#1e2530] mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-[#1e2530] mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-[#6b7a82] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#0b4a51] hover:underline">
              Sign In
            </Link>
          </p>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-[#8d99a0] mt-8">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </main>
  );
}
