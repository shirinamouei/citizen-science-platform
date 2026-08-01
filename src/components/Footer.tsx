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
