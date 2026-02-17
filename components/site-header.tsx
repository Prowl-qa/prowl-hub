import Image from 'next/image';
import Link from 'next/link';

export default function SiteHeader() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="site-header">
        <div className="container nav-shell">
          <Link href="/" className="brand" aria-label="Prowl Hub home">
            <Image src="/assets/brand/mascot.png" alt="" width={34} height={34} />
            <span>Prowl QA Hub</span>
          </Link>

          <nav className="primary-nav" aria-label="Primary">
            <Link href="/browse">Browse hunts</Link>
            <Link href="/#submit">Submit hunt</Link>
            <Link href="/#quality">Quality and safety</Link>
          </nav>
        </div>
      </header>
    </>
  );
}
