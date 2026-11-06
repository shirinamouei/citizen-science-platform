"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import BrandMark from "@/components/BrandMark";

const navLinks = [
  { href: "/profile", label: "Profile" },
  { href: "/privacy", label: "Privacy" },
  { href: "/about", label: "About Us" },
];

export default function Header() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen]);

  return (
    <header className="site-header">
      <nav className="nav" aria-label="Main">
        <Link href="/" className="brand">
          <BrandMark />
          Cascade
        </Link>
        <button
          type="button"
          className="menu-toggle"
          aria-label="Menu"
          aria-expanded={isMenuOpen}
          aria-controls="site-menu"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
        <div id="site-menu" className={`nav-right ${isMenuOpen ? "nav-right-open" : ""}`}>
          <ul className="nav-links">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={pathname === link.href ? "active" : ""}
                  aria-current={pathname === link.href ? "page" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {!isSignedIn && (
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
