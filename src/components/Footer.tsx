import Link from "next/link";
import BrandMark from "@/components/BrandMark";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <BrandMark />
              Cascade
            </div>
            <p>Donate your tapering data to help future patients. Create an account to bring it all together first.</p>
          </div>
          <nav aria-labelledby="footer-product">
            <h2 id="footer-product">Product</h2>
            <Link href="/">Home</Link>
            <Link href="/upload">Upload Data</Link>
            <Link href="/profile">Profile</Link>
          </nav>
          <nav aria-labelledby="footer-company">
            <h2 id="footer-company">Company</h2>
            <Link href="/about">About Us</Link>
            <Link href="/privacy">Privacy</Link>
          </nav>
          <nav aria-labelledby="footer-app">
            <h2 id="footer-app">Get the app</h2>
            <a href="#">App Store</a>
            <a href="#">Google Play</a>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Cascade. All data is voluntary.</span>
          <span>Not a substitute for medical advice.</span>
        </div>
      </div>
    </footer>
  );
}
