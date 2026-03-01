"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, X } from "lucide-react";
import Logo from "./Logo";

export function Header() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const updateTheme = (newTheme: "light" | "dark") => {
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setMounted(true);
      const stored = localStorage.getItem("theme") as "light" | "dark" | null;
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      updateTheme(stored || (prefersDark ? "dark" : "light"));
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const toggleTheme = () => updateTheme(theme === "light" ? "dark" : "light");

  const navigationItems = [
    { href: "/exam", label: "exams" },
    { href: "/practice", label: "practice" },
    { href: "/mock-tests", label: "mock tests" },
    { href: "/materials", label: "materials" },
  ];

  const ThemeToggle = (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="h-8 w-8 p-0 rounded-md"
    >
      {mounted && theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm"
            : "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
        }`}
      >
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-12 sm:h-14">
            <Link href="/" className="flex items-center">
              <Logo
                width={180}
                height={52}
                className="hover:opacity-90 transition-opacity"
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-5">
              {navigationItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`text-sm font-semibold capitalize relative pb-1 transition-colors ${
                      isActive
                        ? "text-blue-600 dark:text-blue-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 dark:after:bg-blue-500"
                        : "text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-500"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden lg:flex items-center gap-2">
              {ThemeToggle}
              <Link href="/login">
                <Button variant="outline" size="sm" className="h-8 px-3">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Sign up
                </Button>
              </Link>
            </div>

            <div className="lg:hidden flex items-center gap-2">
              {ThemeToggle}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-8 h-8 flex items-center justify-center text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-500"
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed top-12 sm:top-14 inset-x-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <nav className="px-4 py-4 space-y-3">
            {navigationItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block text-sm font-medium capitalize transition-colors px-3 py-2 rounded-lg ${
                    isActive
                      ? "text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-900/10"
                      : "text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-500"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
