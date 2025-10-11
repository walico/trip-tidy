import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <h2 className="text-2xl font-medium text-gray-800">Page Not Found</h2>
        <p className="text-gray-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="pt-6">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-black bg-primary rounded-md hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
