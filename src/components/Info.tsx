export default function Info() {
  const items = [
    { title: 'Free Shipping', desc: 'On orders over $50', icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 7h11v8H3z"/><path d="M14 10h4l3 3v2h-7z"/><circle cx="7.5" cy="18.5" r="1.5"/><circle cx="17.5" cy="18.5" r="1.5"/></svg>
    )},
    { title: 'Premium Quality', desc: 'Durable, made to last', icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2l3 6 6 .9-4.5 4.4 1 6.3L12 17l-5.5 2.6 1-6.3L3 8.9 9 8z"/></svg>
    )},
    { title: '24/7 Support', desc: 'We’re here to help', icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10a8 8 0 1 0-16 0v5a3 3 0 0 0 3 3h2"/><path d="M21 10v5a3 3 0 0 1-3 3h-2"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/></svg>
    )},
    { title: '30-day Returns', desc: 'Shop with confidence', icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 12a9 9 0 1 1 9 9"/><path d="M3 12h6"/><path d="M6 9l3 3-3 3"/></svg>
    )},
  ];

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-5xl px-4 py-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.title} className="flex justify-center flex-col items-center gap-3">
            <div className="text-[var(--color-primary)] text-lg">{it.icon}</div>
            <div>
              <div className="font-medium text-gray-600">{it.title}</div>
              <div className="text-gray-400 text-sm">{it.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
