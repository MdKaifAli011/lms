import React from "react";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, MapPin, Phone, Mail } from "lucide-react";
import Logo from "../Logo";
import { FooterTicker } from "./FooterTicker";

export function FooterComponent() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 pt-10 pb-0">
        <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-8 md:mb-10">
          <div>
            <Link href="/" className="inline-block mb-3">
              <Logo width={180} height={52} className="hover:opacity-90 transition-opacity" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              Your trusted partner for competitive exam preparation. Learn smarter with expert
              guidance and structured content.
            </p>
            <div className="flex items-center gap-1.5">
              {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-blue-600 hover:text-white transition-colors"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-2.5 text-sm font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                ["All Exams", "/exam"],
                ["Practice Tests", "/practice"],
                ["Mock Tests", "/mock-tests"],
                ["Study Materials", "/materials"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-muted-foreground hover:text-blue-600 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-2.5 text-sm font-semibold text-foreground">Support</h4>
            <ul className="space-y-2 text-sm">
              {[
                ["About Us", "/about"],
                ["Contact Us", "/contact"],
                ["FAQ", "/faq"],
                ["Privacy Policy", "/privacy"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-muted-foreground hover:text-blue-600 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-2.5 text-sm font-semibold text-foreground">Contact Us</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <span className="text-muted-foreground leading-relaxed">
                  123 Education Street, Learning City, LC 12345
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-600" />
                <a href="tel:+1234567890" className="text-muted-foreground hover:text-blue-600 transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600 shrink-0" />
                <a href="mailto:contact@lmsdoors.com" className="text-muted-foreground hover:text-blue-600 transition-colors">
                  contact@lmsdoors.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <FooterTicker />

      <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 border-t border-border pt-4 pb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-xs sm:text-sm text-muted-foreground tracking-wide">
            <span className="font-semibold text-foreground">LMS Doors</span>
            <span className="mx-1.5 text-muted-foreground/70">·</span>
            © {new Date().getFullYear()} LMS Doors Education. All rights reserved.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground/80">
            Powered by{" "}
            <a
              href="https://eluntrixdigital.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground/90 hover:text-primary transition-colors"
            >
              Eluntrix Digital
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
