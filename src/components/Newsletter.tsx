export default function Newsletter() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h3 className="text-2xl md:text-3xl font-semibold text-gray-800">Subscribe to our newsletter to get updates to our latest collections</h3>
        <p className="mt-2 text-gray-500">Get 20% off on your first order just by subscribing to our newsletter</p>
        <form className="mt-6 mx-auto max-w-xl flex items-stretch">
          <input
            type="email"
            required
            placeholder="Enter your email"
            className="flex-1 rounded-l-md border border-gray-300 px-4 py-4 text-sm focus:outline-none"
          />
          <button type="submit" className="rounded-r-md bg-gray-900 text-white px-6 text-sm font-medium hover:bg-gray-800">Subscribe</button>
        </form>
        <div className="mt-3 text-xs text-gray-400">You will be able to unsubscribe at any time. Read our Privacy Policy <a className="underline" href="#">here</a></div>
      </div>
    </section>
  );
}
