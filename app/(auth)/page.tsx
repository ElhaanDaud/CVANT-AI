"use client";

import Header from "@/components/layout/Header";
import { useUser } from "@clerk/nextjs";
import { ArrowBigUp, AtomIcon, Edit, Share2 } from "lucide-react";
import Link from "next/link";
import React from "react";



const Home = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Header */}
      <header className="w-full px-6 sm:px-12 py-6 flex justify-between items-center sticky top-0 bg-white z-50 shadow-md">
        <div className="text-2xl font-extrabold text-gray-800 tracking-tight">
          CVANT<span className="text-blue-600">.AI</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
          <a href="#" className="hover:text-blue-600 transition">BUILDER</a>
          <a href="#" className="hover:text-blue-600 transition">ABOUT</a>
          <a href="#" className="hover:text-blue-600 transition">CONTACT</a>
          <a href="#" className="hover:text-blue-600 transition">FAQ</a>
        </nav>
        <div className="flex gap-2">
          <Link href="/sign-up" className="text-sm px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition">
            Sign up
          </Link>
          <Link href="/dashboard" className="text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow">
            Get started →
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6 mx-auto max-w-screen-xl text-center lg:py-20 lg:px-12 md:px-10">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-black md:text-5xl lg:text-6xl">
          Build Your CV with <span className="text-blue-700 max-sm:block">CVANT.AI</span>
        </h1>
        <p className="mb-8 text-lg font-normal text-gray-700 lg:text-xl sm:px-16 xl:px-48">
          Forging career paths, with ant-like precision. AI-enhanced CV generation in seconds.
        </p>
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
          <Link
            href="/dashboard"
            className="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:bg-blue-700 before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
          >
            <span className="relative text-base font-semibold text-white">
              Get Started
            </span>
          </Link>
          <Link
            href="#learn-more"
            className="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:border before:border-transparent before:bg-slate-200 before:bg-gradient-to-b before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
          >
            <span className="relative text-base font-semibold text-blue-700">
              Learn more
            </span>
          </Link>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 px-6 mx-auto max-w-screen-xl text-center lg:py-20 lg:px-12 md:px-10">
        <h2 className="font-bold text-3xl" id="learn-more">
          How it Works?
        </h2>
        <p className="text-md text-gray-500">
          Build a professional CV in just 3 steps
        </p>

        <div className="mt-12 grid grid-cols-1 gap-8 text-center md:text-start md:grid-cols-2 lg:grid-cols-3 md:px-24">
          <div className="flex flex-col p-8 border border-gray-100 rounded-3xl bg-white shadow-xl hover:shadow-gray-600/15 transition-shadow duration-300 items-center md:items-start">
            <AtomIcon className="h-8 w-8 text-blue-600" />
            <h3 className="mt-4 text-xl font-bold text-black">Choose a Template</h3>
            <p className="mt-2 text-sm text-gray-600 md:text-justify">
              Start by selecting your ideal CV template. Each one is AI-optimized for readability and clarity.
            </p>
          </div>

          <div className="flex flex-col p-8 border border-gray-100 rounded-3xl bg-white shadow-xl hover:shadow-gray-600/15 transition-shadow duration-300 items-center md:items-start">
            <Edit className="h-8 w-8 text-blue-600" />
            <h3 className="mt-4 text-xl font-bold text-black">Add Your Info</h3>
            <p className="mt-2 text-sm text-gray-600 md:text-justify">
              Fill in your career details and personal information. Our smart editor helps you write it right.
            </p>
          </div>

          <div className="flex flex-col p-8 border border-gray-100 rounded-3xl bg-white shadow-xl hover:shadow-gray-600/15 transition-shadow duration-300 items-center md:items-start">
            <Share2 className="h-8 w-8 text-blue-600" />
            <h3 className="mt-4 text-xl font-bold text-black">Download or Share</h3>
            <p className="mt-2 text-sm text-gray-600 md:text-justify">
              Export your CV or share it with a link. Edit any time, from anywhere.
            </p>
          </div>
        </div>

        <div className="mt-16">
          <Link
            href="/dashboard"
            className="inline-block rounded-full bg-blue-700 px-12 py-3 text-sm font-medium text-white transition hover:bg-blue-800 focus:outline-none focus:ring focus:ring-blue-300"
          >
            <div className="flex items-center justify-center">
              <ArrowBigUp className="h-6 w-6 mr-2" />
              Get Started Today
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="backdrop-blur-md w-full">
        <div className="w-full mx-auto text-center max-w-screen-xl p-4 flex max-md:flex-col md:items-center md:justify-between">
          <span className="text-sm text-gray-500 sm:text-center">
            © 2025{" "}
            <span className="hover:text-blue-600 hover:cursor-pointer">
              CVANT.AI
            </span>
            . All Rights Reserved.
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
