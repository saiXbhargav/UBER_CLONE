import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../Components/common/AuthLayout';
import Field from '../Components/common/Field';
import Spinner from '../Components/common/Spinner';
import { CaptainDataContext } from '../Context/CaptainContext';
import { useToast } from '../Context/ToastContext';
import { api, getErrorMessage } from '../lib/api';
import { setToken } from '../lib/auth';

const CaptainLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const { setCaptain } = useContext(CaptainDataContext);
  const toast = useToast();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submitHandler = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await api().post('/captains/login', form);
      setToken('captain', data.token);
      setCaptain(data.captain);
      navigate('/captain-home');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Login failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      variant="captain"
      title="Driver login"
      subtitle="Go online and start accepting trips."
      footer={
        <div className="space-y-4 border-t border-neutral-200 pt-6">
          <p className="text-center text-sm text-neutral-600">
            Want to drive?{' '}
            <Link to="/captain-signup" className="font-semibold text-neutral-900 underline underline-offset-4">
              Register as a driver
            </Link>
          </p>
          <Link to="/login" className="btn-secondary w-full">
            <i className="ri-user-3-line" /> Sign in as a rider
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

export default CaptainLogin;
