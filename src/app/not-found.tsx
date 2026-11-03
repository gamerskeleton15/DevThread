import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md text-center">
        <h1 className="text-9xl font-bold text-muted mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Page Not Found
        </h2>
        <p className="text-muted mb-8">
          {"Sorry, we couldn't find the page you're looking for. It might have been "}
          moved, deleted, or is temporarily unavailable.
        </p>

        <div className="space-y-4">
          <Link
            href="/"
            className="
              inline-block bg-accent hover:opacity-90 text-white font-medium
              py-2 px-6 rounded transition-colors duration-200
            "
          >
            Return Home
          </Link>

          <div>
            <p className="text-muted text-sm mb-2">Or try one of these pages:</p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/blog"
                className="text-accent hover:underline text-sm"
              >
                Blog
              </Link>
              <Link
                href="/about"
                className="text-accent hover:underline text-sm"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-accent hover:underline text-sm"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}