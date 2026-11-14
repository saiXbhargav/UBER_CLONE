import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../Components/common/AuthLayout';
import Field from '../Components/common/Field';
import Spinner from '../Components/common/Spinner';
import { UserDataContext } from '../Context/Usercontext';
import { useToast } from '../Context/ToastContext';
import { api, getErrorMessage } from '../lib/api';
import { setToken } from '../lib/auth';

const UserLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const { setUser } = useContext(UserDataContext);
  const toast = useToast();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submitHandler = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await api().post('/users/login', form);
      setToken('user', data.token);
      setUser(data.user);
      navigate('/home');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Login failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      variant="rider"
      title="Welcome back"
      subtitle="Log in to book your next ride."
      footer={
        <div className="space-y-4 border-t border-neutral-200 pt-6">
          <p className="text-center text-sm text-neutral-600">
            New here?{' '}
            <Link to="/signup" className="font-semibold text-neutral-900 underline underline-offset-4">
              Create an account
            </Link>
          </p>
          <Link to="/captain-login" className="btn-secondary w-full">
            <i className="ri-steering-2-line" /> Sign in as a driver
          </Link>
        </div>
      }
    >
      <form onSubmit={submitHandler} className="space-y-5">
        <Field label="Email" type="email" required autoComplete="email" placeholder="email@example.com" value={form.email} onChange={update('email')} />
        <Field label="Password" type="password" required minLength={6} autoComplete="current-password" placeholder="Your password" value={form.password} onChange={update('password')} />
        <button className="btn-primary w-full" disabled={submitting}>
          {submitting ? <Spinner /> : 'Log in'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default UserLogin;
