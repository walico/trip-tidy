"use client";

import { useState } from 'react';
import { Mail, MapPin } from 'lucide-react';
import Footer from '@/components/Footer';
import TopProducts from '@/components/TopProducts';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      <div className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Get in Touch
          </h1>
          <p className="mt-4 text-gray-600">
            Have questions or feedback? We&apos;d love to hear from you.
          </p>
        </div>
      </div>

      {/* Contact Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <div className="lg:pr-8">
              <h2 className="text-2xl font-bold text-gray-900">Send us a message</h2>
              <p className="mt-2 text-gray-600">
                Fill out the form and our team will get back to you within 24 hours.
              </p>
              
              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full border-b border-gray-300 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full border-b border-gray-300 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="block w-full border-b border-gray-300 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="flex justify-end p-2 bg-(--color-primary) hover:bg-[var(--color-primary)/90] cursor-pointer"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>

            {/* Contact Information */}
            <div className="lg:pl-8 lg:border-l lg:border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
              <p className="mt-2 text-gray-600">
                We&apos;re here to help and answer any questions you might have.
              </p>

              <div className="mt-8 space-y-6">
                <div className="flex items-start">
                  <div className="shrink-0 rounded-md bg-[var(--color-primary)/10] p-3">
                    <MapPin className="h-6 w-6 text-[--color-primary]" aria-hidden="true" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Our Location</h3>
                    <p className="mt-1 text-sm text-gray-600">123 Adventure St.<br />Outdoor City, OC 12345</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="shrink-0 rounded-md bg-[var(--color-primary)/10] p-3">
                    <Mail className="h-6 w-6 text-[--color-primary]" aria-hidden="true" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Email Us</h3>
                    <p className="mt-1 text-sm text-gray-600">krisicare27@gmail.com</p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>

      <TopProducts />
      <Footer />
    </main>
  );
}
