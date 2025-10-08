export default function Newsletter() {
  return (
    <section className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-14 text-center">
        <h3 className="text-2xl font-semibold">Join our newsletter</h3>
        <p className="mt-2 text-gray-600">Be the first to know about new arrivals, exclusive offers, and tips for smarter travel.</p>
        <form className="mt-6 mx-auto max-w-md flex items-center gap-2">
          <input
            type="email"
            required
            placeholder="Enter your email"
            className="flex-1 rounded border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus-border-primary"
          />
          <button type="submit" className="rounded btn-primary px-5 py-3 text-sm font-medium">Subscribe</button>
        </form>
        <div className="mt-2 text-xs text-gray-500">By subscribing, you agree to our privacy policy.</div>
      </div>
    </section>
  );
}
