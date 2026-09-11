import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../lib/apiServices';
import Swal from 'sweetalert2';

export default function Login({ onLogin }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [step, setStep] = useState('LOGIN'); // 'LOGIN', 'FORGOT', 'RESET'
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isHovering, setIsHovering] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials((current) => ({ ...current, [name]: value }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onLogin(credentials);
      navigate('/dashboard');
    } catch (loginError) {
      setError(
        loginError.response?.data?.message
          || loginError.message
          || 'Login failed. Please check your email and password.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const res = await authApi.forgotPassword({ email: resetEmail });
      Swal.fire({
        icon: 'success',
        title: 'Email Sent',
        text: `Use this OTP Code (Mock): ${res.otp}`,
      });
      setStep('RESET_PASSWORD');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: err.response?.data?.message || 'Failed to send OTP.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await authApi.resetPassword({ email: resetEmail, otp: credentials.otp, newPassword: credentials.newPassword });
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Password has been successfully reset. Please login with your new password.',
      });
      setStep('LOGIN');
      setResetEmail('');
      setCredentials({ email: '', password: '', otp: '', newPassword: '' });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: err.response?.data?.message || 'Failed to reset password. OTP might be invalid or expired.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <p className="text-2xl font-medium text-white/95 max-w-lg drop-shadow-md">Integrated IT Service Management (ITSM) solution for operational efficiency.</p>
        </div>

        <div className="flex flex-1 w-full lg:w-1/2 items-center justify-center p-4 sm:p-6 lg:p-12 lg:bg-white overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-2xl lg:shadow-none lg:rounded-none lg:bg-transparent lg:p-0">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
               <img src="/petrochina-logo.png" alt="PetroChina" className="h-8 w-auto object-contain" />
               <img src="/skk-migas-logo.png" alt="SKK Migas" className="h-8 w-auto object-contain" />
            </div>

            {step === 'LOGIN' && (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Sign in</h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Welcome to <abbr title="Sistem Informasi Pelaporan Elektronik dan Tiket Resolusi Operasional IT PetroChina Jabung" className="font-semibold cursor-help decoration-dashed underline underline-offset-2">SI-PETRO JABUNG</abbr>
                  </p>
                </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={credentials.email}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm placeholder-slate-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={credentials.password}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-md border border-slate-300 px-4 py-2.5 pr-12 text-sm placeholder-slate-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter your password"
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
                  <div className="mt-1.5 flex justify-end">
                    <button 
                      type="button" 
                      onClick={() => { setStep('FORGOT_PASSWORD'); setError(''); }} 
                      className="text-xs font-medium text-blue-600 hover:text-blue-500"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
                    {error}
                  </div>
                )}

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-md bg-blue-600 py-2.5 text-sm font-bold tracking-wide text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>

                <div className="mt-6 text-center text-sm">
                  <span className="text-slate-500">Don't have an account? </span>
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 'FORGOT_PASSWORD' && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Forgot Password</h1>
                <p className="mt-1 text-sm text-slate-500">Enter your email to receive an OTP code</p>
              </div>

              <form onSubmit={handleForgotSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="block w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm placeholder-slate-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter your registered email"
                  />
                </div>

                {error && (
                  <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
                    {error}
                  </div>
                )}

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting || !resetEmail}
                    className="w-full rounded-md bg-blue-600 py-2.5 text-sm font-bold tracking-wide text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Reset Code'}
                  </button>
                </div>

                <div className="text-center text-sm pt-3">
                  <button
                    type="button"
                    onClick={() => { setStep('LOGIN'); setError(''); }}
                    className="font-medium text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 'RESET_PASSWORD' && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Reset Password</h1>
                <p className="mt-1 text-sm text-slate-500">Enter the OTP sent to your email</p>
              </div>

              <form onSubmit={handleResetSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">6-Digit OTP</label>
                  <input
                    name="otp"
                    type="text"
                    value={credentials.otp}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm placeholder-slate-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 tracking-widest text-center text-lg"
                    placeholder="------"
                    maxLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      name="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={credentials.newPassword}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-md border border-slate-300 px-4 py-2.5 pr-12 text-sm placeholder-slate-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter new password"
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

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting || !credentials.otp || !credentials.newPassword}
                    className="w-full rounded-md bg-blue-600 py-2.5 text-sm font-bold tracking-wide text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>

                <div className="text-center text-sm pt-3">
                  <button
                    type="button"
                    onClick={() => { setStep('FORGOT_PASSWORD'); setError(''); }}
                    className="font-medium text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </>
          )}
          </div>
        </div>
      </div>
    </main>
  );
}
