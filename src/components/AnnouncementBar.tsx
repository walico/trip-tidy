"use client";

import { useState } from 'react';

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="w-full text-sm flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}>
      <div className="mx-auto max-w-7xl px-4 py-2 flex items-center gap-4">
        <span className="font-regular text-white">Free shipping on orders over $150. 30-day returns</span>
        <button
          aria-label="Dismiss announcement"
          className="ml-auto opacity-80 hover:opacity-100"
          onClick={() => setVisible(false)}
        >
          ×
        </button>
      </div>
    </div>
  );
}
