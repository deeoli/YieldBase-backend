export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-navy to-[#0a1a33] text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            About YieldBase
          </h1>
          <p className="text-xl text-gray-200 leading-relaxed">
            Empowering global investors to access high-yield UK property investments
            with confidence and ease.
          </p>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-heading font-bold text-text-dark mb-6">
            What We Do
          </h2>
          <p className="text-lg text-text-muted leading-relaxed mb-6">
            YieldBase is a UK property investment platform designed specifically for 
            foreign investors looking to capitalize on the strong rental yields available 
            from student accommodation near UK universities.
          </p>
          <p className="text-lg text-text-muted leading-relaxed mb-6">
            We specialize in identifying and managing 2–3+ bedroom properties in prime 
            locations close to major UK universities, where rental demand is consistently 
            high and yields typically range from 7–10%+.
          </p>
        </div>
      </section>

      {/* Foreign Investor Focus */}
      <section className="py-16 bg-background-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-heading font-bold text-text-dark mb-6">
            Built for Global Investors
          </h2>
          <p className="text-lg text-text-muted leading-relaxed mb-6">
            We understand that investing in UK property from abroad can be complex. 
            That&apos;s why we&apos;ve built YieldBase to simplify the entire process. Our platform 
            provides transparent property listings, detailed yield calculations, and 
            comprehensive support throughout your investment journey.
          </p>
          <p className="text-lg text-text-muted leading-relaxed">
            Whether you&apos;re based in Asia, the Middle East, Europe, or anywhere else in 
            the world, YieldBase makes UK property investment accessible, transparent, 
            and profitable.
          </p>
        </div>
      </section>

      {/* End-to-End Service */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-heading font-bold text-text-dark mb-6">
            End-to-End Service
          </h2>
          <p className="text-lg text-text-muted leading-relaxed mb-6">
            When you invest through YieldBase, we handle everything:
          </p>
          <ul className="space-y-4 text-lg text-text-muted">
            <li className="flex items-start gap-3">
              <span className="text-accent-gold text-2xl">✓</span>
              <span>Property sourcing and due diligence</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent-gold text-2xl">✓</span>
              <span>Purchase process management</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent-gold text-2xl">✓</span>
              <span>Renovation and property preparation</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent-gold text-2xl">✓</span>
              <span>Tenant sourcing and management</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent-gold text-2xl">✓</span>
              <span>Ongoing property maintenance and support</span>
            </li>
          </ul>
          <p className="text-lg text-text-muted leading-relaxed mt-8">
            Our goal is to make UK property investment as hands-off as possible for you, 
            while maximizing your rental yield and ensuring your property is well-maintained 
            and profitable.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">
            Ready to Start Investing?
          </h2>
          <p className="text-lg text-gray-200 mb-8">
            Explore our curated selection of high-yield UK properties today.
          </p>
          <a
            href="/properties"
            className="inline-block bg-accent-gold text-primary-navy px-8 py-4 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
          >
            Browse Properties
          </a>
        </div>
      </section>
    </>
  );
}

