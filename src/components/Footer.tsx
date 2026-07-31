import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <span className="brand-mark">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2v6M12 16v6M4.9 4.9l4.2 4.2M14.9 14.9l4.2 4.2M2 12h6M16 12h6M4.9 19.1l4.2-4.2M14.9 9.1l4.2-4.2"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              TaperTrack
            </div>
            <p>Organize your tapering data, and optionally donate it to help future patients.</p>
          </div>
          <div>
            <h4>Product</h4>
            <Link href="/">Home</Link>
            <Link href="/upload">Upload Data</Link>
            <Link href="/profile">Profile</Link>
          </div>
          <div>
            <h4>Company</h4>
            <Link href="/about">About Us</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
          <div>
            <h4>Get the app</h4>
            <a href="#">App Store</a>
            <a href="#">Google Play</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 TaperTrack. All data is voluntary.</span>
          <span>Not a substitute for medical advice.</span>
        </div>
      </div>
    </footer>
  );
}
