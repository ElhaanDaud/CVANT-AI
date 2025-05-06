"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";

const Header = () => {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <header className="w-full px-6 sm:px-12 py-6 flex justify-between items-center sticky top-0 bg-white z-50 shadow-md">
      <Link href="/" className="text-2xl font-extrabold text-gray-800 tracking-tight">
        CVANT<span className="text-blue-600">.AI</span>
      </Link>

      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
        <a href="#" className="hover:text-blue-600 transition">BUILDER</a>
        <a href="#" className="hover:text-blue-600 transition">ABOUT</a>
        <a href="#" className="hover:text-blue-600 transition">CONTACT</a>
        <a href="#" className="hover:text-blue-600 transition">FAQ</a>
      </nav>

      <div className="flex items-center gap-2">
        {!isLoaded ? null : !isSignedIn ? (
          <>
            <Link
              href="/sign-up"
              className="text-sm px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition"
            >
              Sign up
            </Link>
            <Link
              href="/dashboard"
              className="text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow"
            >
              Get started
            </Link>
          </>
        ) : (
          <>
            <Link
                href="/dashboard"
                className="text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow"
              >
                Dashboard
              </Link>
            <div className="hidden md:flex items-center ">
              <UserButton showName={true} />
            </div>
            <div className="flex md:hidden items-center">
              <UserButton showName={false} />
            </div>
            
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
