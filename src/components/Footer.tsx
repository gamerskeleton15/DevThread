import Link from 'next/link';
import NewsletterForm from './NewsletterForm';

export default function Footer() {
  return (
    <footer className="bg-surface text-foreground py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div>
            <div className="flex items-center mb-4">
              <img
                src="/devthread-icon.svg"
                alt="DevThread logo"
                className="w-6 h-6 rounded-lg mr-2"
              />
              <h3 className="text-foreground font-bold text-xl font-display tracking-tight">DevThread</h3>
            </div>
            <p className="text-muted">
              A modern tech blog covering the latest in technology, programming,
              AI, and gadgets.
            </p>
          </div>

          <div>
            <h4 className="text-foreground font-bold mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-foreground font-bold mb-4">Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/blog?category=AI"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Artificial Intelligence
                </Link>
              </li>
              <li>
                <Link
                  href="/blog?category=Programming"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Programming
                </Link>
              </li>
              <li>
                <Link
                  href="/blog?category=Gadgets"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Gadgets
                </Link>
              </li>
              <li>
                <Link
                  href="/blog?category=News"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Industry News
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-foreground font-bold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/disclaimer"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-foreground font-bold mb-4">Stay Updated</h4>
            <p className="text-muted mb-4">
              Subscribe for the latest tech insights and tutorials
            </p>
            <NewsletterForm dark />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center text-sm">
          <p className="text-muted">
            © {new Date().getFullYear()} DevThread. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}