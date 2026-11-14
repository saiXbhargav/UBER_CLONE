import React, { useState } from 'react';
import Field from '../common/Field';
import Spinner from '../common/Spinner';
import { api, getErrorMessage } from '../../lib/api';
import { useToast } from '../../Context/ToastContext';

/** Inline panel for setting Home and Work addresses. */
const SavedPlacesEditor = ({ places, pickup, destination, onSaved, onClose }) => {
  const [form, setForm] = useState({ home: places?.home || '', work: places?.work || '' });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await api('user').put('/users/places', form);
      onSaved(saved);
      toast.success('Saved places updated');
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not save your places'));
    } finally {
      setSaving(false);
    }
  };

  const copyButtons = (key) =>
    [pickup && ['pickup', pickup], destination && ['destination', destination]].filter(Boolean).map(([label, value]) => (
      <button
        key={label}
        type="button"
        onClick={() => setForm((f) => ({ ...f, [key]: value }))}
        className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium hover:bg-neutral-200"
      >
        Use {label}
      </button>
    ));

  return (
    <form onSubmit={save} className="animate-fade-in">
      <div className="mb-4 flex items-center gap-3">
        <button type="button" onClick={onClose} aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100">
          <i className="ri-arrow-left-line text-xl" />
        </button>
        <h2 className="panel-title">Saved places</h2>
      </div>
      {['home', 'work'].map((key) => (
        <div key={key} className="mb-4">
          <Field
            label={key === 'home' ? 'Home' : 'Work'}
            placeholder={key === 'home' ? 'Your home address' : 'Your work address'}
            maxLength={200}
            value={form[key]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          />
          <div className="mt-2 flex gap-2">{copyButtons(key)}</div>
        </div>
      ))}
      <button className="btn-primary w-full" disabled={saving}>
        {saving ? <Spinner /> : 'Save'}
      </button>
    </form>
  );
};

export default SavedPlacesEditor;
