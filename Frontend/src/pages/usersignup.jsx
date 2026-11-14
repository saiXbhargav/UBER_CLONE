import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../Components/common/AuthLayout';
import Field from '../Components/common/Field';
import Spinner from '../Components/common/Spinner';
import { UserDataContext } from '../Context/Usercontext';
import { useToast } from '../Context/ToastContext';
import { api, getErrorMessage } from '../lib/api';
import { setToken } from '../lib/auth';

const UserSignup = () => {
  const [form, setForm] = useState({ firstname: '', lastname: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const { setUser } = useContext(UserDataContext);
  const toast = useToast();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submitHandler = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await api().post('/users/register', {
        email: form.email,
        password: form.password,
        fullname: { firstname: form.firstname, lastname: form.lastname },
      });
      setToken('user', data.token);
      setUser(data.user);
      toast.success('Account created. Where to?');
      navigate('/home');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not create your account'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      variant="rider"
      title="Create your account"
      subtitle="It takes less than a minute."
      footer={
        <p className="text-center text-sm text-neutral-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-neutral-900 underline underline-offset-4">
            Log in
          </Link>
        </p>
      }
    >
      <form onSubmit={submitHandler} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="First name" required minLength={3} autoComplete="given-name" placeholder="First name" value={form.firstname} onChange={update('firstname')} />
          <Field label="Last name" minLength={3} autoComplete="family-name" placeholder="Last name" value={form.lastname} onChange={update('lastname')} />
        </div>
        <Field label="Email" type="email" required autoComplete="email" placeholder="email@example.com" value={form.email} onChange={update('email')} />
        <Field label="Password" type="password" required minLength={6} autoComplete="new-password" placeholder="At least 6 characters" value={form.password} onChange={update('password')} />
        <button className="btn-primary w-full" disabled={submitting}>
          {submitting ? <Spinner /> : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default UserSignup;
