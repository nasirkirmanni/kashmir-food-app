"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const userName = user?.name ? user.name.split(" ")[0] : "Guest";
  const displayName = userName.length > 12 ? userName.substring(0, 10) + "..." : userName;

  const greetingText = user ? `${greeting}, ${displayName}` : "Welcome, Guest";

  const css = `
    #app-header {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 80px;
      z-index: 999;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 24px 0 24px;
      background: linear-gradient(to bottom, rgba(15, 8, 3, 0.95) 40%, rgba(15, 8, 3, 0) 100%);
      box-shadow: none;
      border: none;
      transition: background 0.3s ease;
    }

    .greeting-sub {
      font-family: 'Inter', sans-serif;
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.25em;
      color: #c9a84c;
      text-transform: uppercase;
      opacity: 0.85;
      margin-bottom: 5px;
      display: block;
    }

    .greeting-main {
      font-family: var(--font-display, 'Cormorant Garamond', serif);
      font-size: 26px;
      font-weight: 500;
      letter-spacing: 0.03em;
      color: #f5efe6;
      line-height: 1;
      display: block;
    }

    .header-icon-btn {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.8);
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 12px rgba(0,0,0,0.2);
      overflow: hidden;
    }

    .header-icon-btn:active {
      transform: scale(0.95);
    }

    .header-icon-btn:hover {
      color: #f5efe6;
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <header id="app-header">
        {/* Left Side: Greeting */}
        <div className="flex flex-col justify-center">
          <span className="greeting-sub">{greetingText}</span>
          <h1 className="greeting-main">Explore Kashmir</h1>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-3">
          <button className="header-icon-btn" aria-label="Search">
            <Search size={18} strokeWidth={2} />
          </button>
          
          <Link 
            href={user ? "/profile" : "/login"}
            className="header-icon-btn"
            aria-label="Profile"
          >
            {user && user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User size={18} strokeWidth={2} />
            )}
          </Link>
        </div>
      </header>
    </>
  );
}
