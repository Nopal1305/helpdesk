import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../lib/apiServices';
import { DEPARTMENTS } from '../lib/constants';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    department: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await authApi.register(form);
      navigate('/login');
    } catch (registerError) {
      setError(registerError.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isHovering, setIsHovering] = useState(false);

  return (
    <main className="flex h-screen bg-slate-900 overflow-hidden relative">
      <div className="absolute inset-0 lg:w-1/2 h-full z-0 overflow-hidden">
        <img 
          src="/petro-building.jpg" 
          alt="PetroChina Building" 
          className={`w-full h-full object-cover opacity-40 lg:opacity-50 transition-transform duration-1000 ease-in-out ${isHovering ? 'scale-105' : 'scale-100'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/20 to-transparent mix-blend-multiply pointer-events-none"></div>
      </div>

      <div className="relative z-10 flex w-full h-full flex-col lg:flex-row">
        <div 
          className="hidden lg:flex w-1/2 flex-col justify-end p-10 pb-12"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="flex items-center gap-4 mb-8">
            <img src="/petrochina-logo.png" alt="PetroChina" className="h-14 w-auto object-contain drop-shadow-lg" />
            <img src="/skk-migas-logo.png" alt="SKK Migas" className="h-14 w-auto object-contain drop-shadow-lg" />
          </div>
          <h2 className="text-6xl font-extrabold tracking-tight text-white mb-4 drop-shadow-md">SI-PETRO JABUNG</h2>
          <p className="text-2xl font-medium text-white/95 max-w-lg drop-shadow-md">Join us and manage your IT requests better.</p>
        </div>

        <div className="flex flex-1 w-full lg:w-1/2 items-center justify-center p-4 sm:p-6 lg:p-12 lg:bg-white overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-2xl lg:shadow-none lg:rounded-none lg:bg-transparent lg:p-0">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
               <img src="/petrochina-logo.png" alt="PetroChina" className="h-8 w-auto object-contain" />
               <img src="/skk-migas-logo.png" alt="SKK Migas" className="h-8 w-auto object-contain" />
            </div>
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Create an account</h1>
              <p className="mt-1 text-sm text-slate-500">
                Sign up to create and manage tickets in <abbr title="Sistem Informasi Pelaporan Elektronik dan Tiket Resolusi Operasional IT PetroChina Jabung" className="font-semibold cursor-help decoration-dashed underline underline-offset-2">SI-PETRO JABUNG</abbr>
              </p>
            </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={handleChange}
                required
                className="block w-full rounded-md border border-slate-300 px-4 py-2 text-sm placeholder-slate-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="block w-full rounded-md border border-slate-300 px-4 py-2 text-sm placeholder-slate-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                required
                className="block w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="" disabled>Select Department</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border border-slate-300 px-4 py-2 pr-12 text-sm placeholder-slate-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md bg-blue-600 py-2.5 text-sm font-bold tracking-wide text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </button>
            </div>

            <div className="text-center text-sm text-slate-500 pt-3 border-t border-slate-100">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign in here
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </main>
  );
}