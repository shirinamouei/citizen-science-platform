"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const navLinks = [
  { href: "/profile", label: "Profile" },
  { href: "/privacy", label: "Privacy" },
  { href: "/about", label: "About Us" },
];

export default function Header() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();

  return (
    <header className="site-header">
      <nav className="nav">
        <Link href="/" className="brand">
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
        </Link>
        <div className="nav-right">
          <ul className="nav-links">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={pathname === link.href ? "active" : ""}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {isSignedIn ? (
            <Link href="/profile" className="btn btn-dark btn-sm">
              Profile
            </Link>
          ) : (
            <Link href="/signin" className="btn btn-dark btn-sm">
              Sign In
            </Link>
          )}
          <Link href="/upload" className="nav-cta">
            Upload Data
          </Link>
        </div>
      </nav>
    </header>
  );
}
