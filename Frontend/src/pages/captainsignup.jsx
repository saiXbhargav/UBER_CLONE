import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../Components/common/AuthLayout';
import Field from '../Components/common/Field';
import Spinner from '../Components/common/Spinner';
import { CaptainDataContext } from '../Context/CaptainContext';
import { useToast } from '../Context/ToastContext';
import { api, getErrorMessage } from '../lib/api';
import { setToken } from '../lib/auth';
import { VEHICLE_LIST } from '../lib/vehicles';

const CaptainSignup = () => {
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    color: '',
    plate: '',
    vehicleType: 'car',
    capacity: 4,
  });
  const [submitting, setSubmitting] = useState(false);
  const { setCaptain } = useContext(CaptainDataContext);
  const toast = useToast();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const pickVehicle = (v) => setForm((f) => ({ ...f, vehicleType: v.id, capacity: v.seats }));

  const submitHandler = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await api().post('/captains/register', {
        email: form.email,
        password: form.password,
        fullname: { firstname: form.firstname, lastname: form.lastname },
        vehicle: {
          color: form.color,
          plate: form.plate.toUpperCase(),
          vehicleType: form.vehicleType,
          capacity: Number(form.capacity),
        },
      });
      setToken('captain', data.token);
      setCaptain(data.captain);
      toast.success('Welcome aboard! Go online to start receiving trips.');
      navigate('/captain-home');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not register'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      variant="captain"
      title="Become a driver"
      subtitle="Tell us about you and your vehicle."
      footer={
        <p className="text-center text-sm text-neutral-600">
          Already registered?{' '}
          <Link to="/captain-login" className="font-semibold text-neutral-900 underline underline-offset-4">
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

        <fieldset>
          <legend className="label">Vehicle type</legend>
          <div className="grid grid-cols-3 gap-3">
            {VEHICLE_LIST.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => pickVehicle(v)}
                aria-pressed={form.vehicleType === v.id}
                className={`flex flex-col items-center rounded-xl border-2 p-3 transition ${
                  form.vehicleType === v.id ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <img src={v.image} alt="" className="h-10 object-contain" />
                <span className="mt-1 text-sm font-semibold">{v.name}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Colour" required placeholder="e.g. White" value={form.color} onChange={update('color')} />
          <Field label="Seats" type="number" required min={1} max={8} value={form.capacity} onChange={update('capacity')} />
        </div>
        <Field label="Number plate" required minLength={5} placeholder="e.g. TS09AB1234" value={form.plate} onChange={(e) => setForm((f) => ({ ...f, plate: e.target.value.toUpperCase() }))} />

        <button className="btn-primary w-full" disabled={submitting}>
          {submitting ? <Spinner /> : 'Create driver account'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default CaptainSignup;
