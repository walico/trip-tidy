"use client";

import { useState } from 'react';
import { Mail, Package } from 'lucide-react';
import Footer from '@/components/Footer';
import TopProducts from '@/components/TopProducts';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    inquiry: '',
    email: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    // Add your form submission logic here
  };

  return (
    <main className="bg-white">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-6">
          <h1 className="text-[12vw] leading-none font-extrabold tracking-tight text-gray-900 md:text-[8rem] lg:text-[10rem]">
            Contact us
          </h1>
        </div>
      </div>

      {/* Contact Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Left Info */}
          <div className="lg:col-span-4 space-y-10">
            <div className="text-gray-900">
              <h3 className="font-semibold">Customer Support</h3>
              <p className="text-sm text-gray-600">We&apos;re here to help</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Support Hours</h3>
              <p className="text-sm text-gray-600">Monday - Sunday</p>
              <p className="text-sm text-gray-600">9 AM - 6 PM EST</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Response Time</h3>
              <p className="text-sm text-gray-600">Within 24 hours</p>
            </div>

            <div className="hidden lg:block space-y-6 pt-6">
              <div className="flex items-start">
                <div className="shrink-0 rounded-md bg-[color:var(--color-primary,theme(colors.indigo.500))]/10 p-3">
                  <Package className="h-6 w-6 text-[--color-primary]" aria-hidden="true" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">Shipping Worldwide</h3>
                  <p className="mt-1 text-sm text-gray-600">Free shipping on orders<br />over $50</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-gray-900">Name (required)</label>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="sr-only">First Name</label>
                    <input id="firstName" name="firstName" type="text" placeholder="First Name" value={formData.firstName} onChange={handleChange} className="w-full border-0 border-b border-gray-300 py-2" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="sr-only">Last Name</label>
                    <input id="lastName" name="lastName" type="text" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className="w-full border-0 border-b border-gray-300 py-2" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="inquiry" className="block text-sm text-gray-900">How can we help? (required)</label>
                <select
                  id="inquiry"
                  name="inquiry"
                  required
                  value={formData.inquiry}
                  onChange={handleChange}
                  className="mt-2 block w-full border-0 border-b border-gray-300 py-2 bg-white"
                >
                  <option value="">Select an inquiry type</option>
                  <option value="order">Order Status</option>
                  <option value="return">Returns & Exchanges</option>
                  <option value="shipping">Shipping Questions</option>
                  <option value="product">Product Information</option>
                  <option value="payment">Payment Issues</option>
                  <option value="other">Other</option>
                </select>
              </div>v

              <div>
                <label htmlFor="email" className="block text-sm text-gray-900">Email (required)</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-2 block w-full border-0 border-b border-gray-300 py-2"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm text-gray-900">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="mt-2 block w-full border-0 border-b border-gray-300 py-2"
                />
              </div>

              <div className="pt-2 opacity-80 hover:opacity-100">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full bg-black px-6 py-2 text-white text-sm font-semibold"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom large contacts */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <h3 className="font-semibold text-gray-900">Customer Support</h3>
              <a href="mailto:krisicare27@gmail.com" className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-extrabold tracking-tight text-gray-900 hover:underline">krisicare27@gmail.com</a>
            </div>
            <a href="tel:+48762864075" className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-extrabold tracking-tight text-gray-900 md:text-right hover:underline">(+**) *** ***</a>
          </div>
        </div>
      </div>

      <TopProducts />
      <Footer />
    </main>
  );
}

