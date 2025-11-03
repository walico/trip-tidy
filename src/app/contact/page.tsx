"use client";

import { useState } from 'react';
import { Mail, Package, Clock, Headset, MessageSquare, Phone } from 'lucide-react';
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
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, you would send the data to your server here
    console.log('Form submitted:', formData);
    
    // Show success message
    setIsSubmitted(true);
    
    // Optional: Reset form
    setFormData({
      firstName: '',
      lastName: '',
      inquiry: '',
      email: '',
      message: ''
    });
    
    // Optional: Hide success message after 5 seconds
    setTimeout(() => {
      setIsSubmitted(false);
    }, 5000);
  };

  return (
    <main className="bg-white">
      {/* Hero Section */}
      <div className="bg-gray-50">
       <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Contact us
          </h1>
          <p className="mt-4 text-gray-500">
            We're here to help you with any questions or concerns you may have.
          </p>
        </div>
      </div>

      {/* Contact Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Left Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-start">
              <div className="shrink-0 rounded-md bg-[color:var(--color-primary,theme(colors.indigo.500))]/10 p-3">
                <Headset className="h-5 w-5 text-gray-700" aria-hidden="true" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Customer Support</h3>
                <p className="mt-1 text-sm text-gray-600">We're here to help</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="shrink-0 rounded-md bg-[color:var(--color-primary,theme(colors.indigo.500))]/10 p-3">
                <Clock className="h-5 w-5 text-gray-700" aria-hidden="true" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Support Hours</h3>
                <p className="mt-1 text-sm text-gray-600">Monday - Sunday</p>
                <p className="text-sm text-gray-600">9 AM - 6 PM EST</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="shrink-0 rounded-md bg-[color:var(--color-primary,theme(colors.indigo.500))]/10 p-3">
                <MessageSquare className="h-5 w-5 text-gray-700" aria-hidden="true" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Response Time</h3>
                <p className="mt-1 text-sm text-gray-600">Within 24 hours</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="shrink-0 rounded-md bg-[color:var(--color-primary,theme(colors.indigo.500))]/10 p-3">
                <Package className="h-5 w-5 text-gray-700" aria-hidden="true" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Shipping Worldwide</h3>
                  <p className="mt-1 text-sm text-gray-600">Free shipping on orders<br />over $50</p>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="lg:col-span-8">
            {isSubmitted ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <h3 className="text-lg font-medium text-green-800 mb-2">Thank you for your message!</h3>
                <p className="text-green-700">We've received your inquiry and will get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-gray-900">Name (required)</label>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="sr-only">First Name</label>
                    <input id="firstName" name="firstName" type="text" placeholder="First Name" value={formData.firstName} onChange={handleChange} className="w-full border-0 border-b border-gray-300 py-2 text-gray-900 placeholder-gray-500" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="sr-only">Last Name</label>
                    <input id="lastName" name="lastName" type="text" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className="w-full border-0 border-b border-gray-300 py-2 text-gray-900 placeholder-gray-500" />
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
                  className="mt-2 block w-full border-0 border-b border-gray-300 py-2 bg-white text-gray-900 placeholder-gray-600"
                >
                  <option value="" className="text-gray-500">Select an inquiry type</option>
                  <option value="order" className="text-gray-900">Order Status</option>
                  <option value="return" className="text-gray-900">Returns & Exchanges</option>
                  <option value="shipping" className="text-gray-900">Shipping Questions</option>
                  <option value="product" className="text-gray-900">Product Information</option>
                  <option value="payment" className="text-gray-900">Payment Issues</option>
                  <option value="other" className="text-gray-900">Other</option>
                </select>
              </div>

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
                  className="mt-2 block w-full border-0 border-b border-gray-300 py-2 text-gray-900 placeholder-gray-500"
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
                  className="mt-2 block w-full border-0 border-b border-gray-300 py-2 text-gray-900 placeholder-gray-500"
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
            )}
          </div>
        </div>
      </div>

      {/* Bottom large contacts */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <div className="flex items-center space-x-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Customer Support</h3>
                  <a href="mailto:krisicare27@gmail.com" className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-extrabold tracking-tight text-gray-900 hover:underline">krisicare27@gmail.com</a>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 md:justify-end">
              <Phone className="h-5 w-5 text-gray-500" />
              <s className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-extrabold tracking-tight text-gray-900:disabled">+48 762 864 075</s>
            </div>
          </div>
        </div>
      </div>

      <TopProducts />
      <Footer />
    </main>
  );
}

