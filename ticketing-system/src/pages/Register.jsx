import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../lib/apiServices';

const fields = [
  ['fullName', 'Full name', 'text'],
  ['email', 'Email', 'email'],
  ['password', 'Password', 'password'],
  ['department', 'Department', 'text'],
];

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
      setError(registerError.response?.data?.message || 'Registrasi gagal. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-orange-100 p-4 text-ink">
      <section className="w-full max-w-md rounded-none border-2 border-ink bg-paper p-6 shadow-brutal md:p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink/70">
          PetroChina
        </p>
        <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight">
          Register
        </h1>
        <p className="mt-3 text-sm leading-6 text-ink/70">Buat akun employee untuk mengirim ticket.</p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-3">
          {fields.map(([name, label, type]) => (
            <label key={name} className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ink/70">
              {label}
              <input
                name={name}
                type={type}
                value={form[name]}
                onChange={handleChange}
                required
                className="mt-2 w-full border-2 border-ink bg-paper px-3 py-3 font-sans text-sm text-ink outline-none"
              />
            </label>
          ))}

          {error ? <p className="text-sm font-bold text-alert">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-3 cursor-pointer border-2 border-ink bg-go px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.18em] text-paper shadow-brutal-sm transition-all duration-150 hover:-translate-y-1 hover:shadow-lg active:translate-y-0"
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="cursor-pointer border-2 border-ink bg-paper px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.18em] text-ink transition-all duration-150 hover:-translate-y-1 hover:shadow-md active:translate-y-0"
          >
            Back to login
          </button>
        </form>
      </section>
    </main>
  );
}
