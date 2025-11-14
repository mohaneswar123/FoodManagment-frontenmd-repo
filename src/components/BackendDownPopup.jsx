import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'fm_backend_down_seen_v1';

export default function BackendDownPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const close = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {}
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={close} />
      <div className="relative z-10 w-[92%] max-w-md rounded-2xl bg-white shadow-2xl border border-amber-200">
        <div className="p-5">
          <div className="text-2xl font-bold text-amber-800">Heads up! 🍔⛽</div>
          <p className="mt-3 text-amber-900/90">
            Our backend ran out of credits and is on a snack break.
            Features that talk to the server may nap for now.
          </p>
          <p className="mt-2 text-sm text-amber-700">
            You can still explore the UI. We’ll be back after a top-up!
          </p>
          <button
            type="button"
            onClick={close}
            className="mt-4 w-full rounded-lg bg-amber-600 hover:bg-amber-700 text-white py-2 font-medium"
          >
            Got it — carry on
          </button>
        </div>
      </div>
    </div>
  );
}
