import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-navy text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-heading font-bold mb-4">YieldBase</h3>
            <p className="text-gray-300 text-sm">
              Built for global investors.
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/properties" className="text-gray-300 hover:text-accent-gold transition-colors">
                  Properties
                </Link>
              </li>
              <li>
                <Link href="/yield-calculator" className="text-gray-300 hover:text-accent-gold transition-colors">
                  Yield Calculator
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-accent-gold transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-accent-gold transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-accent-gold transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-accent-gold transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
          <p>© {currentYear} YieldBase. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

