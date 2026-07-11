"use client";
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  BookOpen, 
  Compass, 
  Calendar, 
  Activity, 
  Globe, 
  ChevronDown, 
  ChevronUp, 
  Sparkles 
} from 'lucide-react';
import { detailedArticleText } from './detailedArticleText';

const quickLinks = [
  { href: '#1-geography-hydrology-and-folklore', label: '1. Geography & Folklore', icon: Compass },
  { href: '#2-detailed-daybyday-expedition-itinerary', label: '2. 7-Day Itinerary', icon: Calendar },
  { href: '#3-preparation-fitness-and-gear-specifications', label: '3. Prep & Gear Spec', icon: Activity },
  { href: '#4-culture-nomads-wazwan-and-logistical-guide', label: '4. Culture & Logistics', icon: Globe },
];

// Helper to slugify heading text to match internal anchors for SEO
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
};

// Helper to extract text from React children nodes
const flattenChildren = (children) => {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(flattenChildren).join('');
  if (children && children.props && children.props.children) {
    return flattenChildren(children.props.children);
  }
  return '';
};

export default function DetailedArticle() {
  const [isExpanded, setIsExpanded] = useState(false);

  // Custom component renderers for ReactMarkdown
  const markdownComponents = {
    h1: ({ node, children, ...props }) => (
      <h3 className="font-serif text-[28px] md:text-[34px] text-white mt-12 mb-6 font-light tracking-wide border-b border-white/10 pb-3" {...props}>
        {children}
      </h3>
    ),
    h2: ({ node, children, ...props }) => {
      const text = flattenChildren(children);
      const id = slugify(text);
      return (
        <h4 id={id} className="font-serif text-[22px] md:text-[26px] text-[#D4A85D] mt-10 mb-5 font-normal scroll-mt-28" {...props}>
          {children}
        </h4>
      );
    },
    h3: ({ node, children, ...props }) => {
      const text = flattenChildren(children);
      const id = slugify(text);
      return (
        <h5 id={id} className="font-serif text-[18px] md:text-[21px] text-white/95 mt-8 mb-4 font-normal scroll-mt-28" {...props}>
          {children}
        </h5>
      );
    },
    h4: ({ node, ...props }) => (
      <h6 className="text-[12px] uppercase tracking-[0.2em] text-[#D4A85D] font-bold mt-6 mb-3" {...props} />
    ),
    p: ({ node, ...props }) => (
      <p className="mb-6 text-[15px] md:text-[16px] text-white/70 leading-relaxed font-light" {...props} />
    ),
    ul: ({ node, ...props }) => (
      <ul className="list-disc pl-5 mb-6 space-y-2 text-[15px] md:text-[16px] text-white/70 font-light" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="list-decimal pl-5 mb-6 space-y-2 text-[15px] md:text-[16px] text-white/70 font-light" {...props} />
    ),
    li: ({ node, ...props }) => (
      <li className="marker:text-[#D4A85D] pl-1" {...props} />
    ),
    strong: ({ node, ...props }) => (
      <strong className="font-semibold text-white/90" {...props} />
    ),
    blockquote: ({ node, ...props }) => (
      <blockquote className="border-l border-[#D4A85D]/40 pl-5 my-8 text-white/60 bg-[#D4A85D]/5 p-5 rounded-r-2xl italic leading-relaxed" {...props} />
    ),
    table: ({ node, ...props }) => (
      <div className="overflow-x-auto my-8 rounded-[16px] border border-white/5 bg-[#14110E]/40 backdrop-blur-sm shadow-inner">
        <table className="w-full text-left border-collapse text-[14px] text-white/70" {...props} />
      </div>
    ),
    thead: ({ node, ...props }) => (
      <thead className="bg-[#D4A85D]/10 text-[#D4A85D] border-b border-white/5 font-serif" {...props} />
    ),
    tbody: ({ node, ...props }) => (
      <tbody className="divide-y divide-white/5" {...props} />
    ),
    tr: ({ node, ...props }) => (
      <tr className="hover:bg-white/5 transition-colors" {...props} />
    ),
    th: ({ node, ...props }) => (
      <th className="px-5 py-4 font-serif font-semibold text-[14px] tracking-wide" {...props} />
    ),
    td: ({ node, ...props }) => (
      <td className="px-5 py-4 leading-relaxed font-light" {...props} />
    ),
  };

  const handleQuickLinkClick = (e, href) => {
    e.preventDefault();
    setIsExpanded(true);
    
    // Wait briefly for the UI to expand/render before scrolling to anchor
    setTimeout(() => {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <section id="detailed-article-section" className="mt-20 scroll-mt-28">
      {/* Outer Card Wrapper */}
      <div className="relative p-6 md:p-10 rounded-[28px] bg-[#14110E] border border-white/5 shadow-2xl transition-all duration-500 overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#D4A85D]/5 blur-[90px] rounded-full pointer-events-none" />
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6 mb-8 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#D4A85D]/10 flex items-center justify-center text-[#D4A85D] shrink-0 mt-1">
              <BookOpen size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4A85D] font-bold">
                  Expedition Archive
                </span>
                <span className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-white/40 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                  <Sparkles size={10} className="text-[#D4A85D]" /> Fully Crawlable / 20 Min Read
                </span>
              </div>
              <h3 className="font-serif text-[28px] md:text-[34px] text-white font-light">
                Read Detailed Article
              </h3>
            </div>
          </div>

          {isExpanded && (
            <button 
              onClick={() => {
                setIsExpanded(false);
                document.getElementById('detailed-article-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/10 hover:border-white/20 text-white/60 hover:text-white text-[12px] uppercase tracking-wider font-semibold transition-all active:scale-95"
            >
              Collapse <ChevronUp className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Table of Contents / Quick Jump Menu */}
        <div className="bg-[#0E0C0A]/40 border border-white/5 rounded-2xl p-6 mb-8 relative z-10">
          <p className="text-[11px] uppercase tracking-widest text-[#D4A85D] font-bold mb-4 flex items-center gap-2">
            <Sparkles size={12} className="text-[#D4A85D]" /> Jump to Section
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleQuickLinkClick(e, link.href)}
                className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-[#14110E]/60 hover:bg-[#D4A85D]/5 hover:border-[#D4A85D]/30 transition-all text-white/70 hover:text-white group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#D4A85D]/10 flex items-center justify-center text-[#D4A85D] group-hover:bg-[#D4A85D]/20 transition-all shrink-0">
                  <link.icon size={14} />
                </div>
                <span className="text-[13px] font-medium leading-snug">{link.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Collapsible Content Area - ALWAYS rendered in DOM for SEO crawlability */}
        <div 
          className={`relative transition-all duration-700 ease-in-out px-1 md:px-4 ${
            isExpanded 
              ? 'max-h-none opacity-100' 
              : 'max-h-[500px] overflow-hidden opacity-90'
          }`}
        >
          {/* Markdown Content */}
          <div className="leading-relaxed max-w-none">
            <ReactMarkdown components={markdownComponents}>
              {detailedArticleText}
            </ReactMarkdown>
          </div>

          {/* Fade Overlay & CTA button when collapsed */}
          {!isExpanded && (
            <div className="absolute bottom-0 left-0 w-full h-[250px] bg-gradient-to-t from-[#14110E] via-[#14110E]/95 to-transparent pointer-events-none flex items-end justify-center pb-8 z-20">
              <button 
                onClick={() => setIsExpanded(true)}
                className="pointer-events-auto px-8 py-3.5 rounded-xl bg-[#D4A85D] hover:bg-[#c2964e] text-[#0E0C0A] text-[13px] uppercase tracking-widest font-bold transition-all duration-300 shadow-xl hover:shadow-[#D4A85D]/20 flex items-center gap-2 active:scale-95"
              >
                Read Full Detailed Article <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Collapse Button when expanded */}
        {isExpanded && (
          <div className="mt-12 border-t border-white/5 pt-8 flex justify-center relative z-10">
            <button 
              onClick={() => {
                setIsExpanded(false);
                document.getElementById('detailed-article-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-3.5 rounded-xl border border-white/15 hover:border-white/30 text-white/80 hover:text-white text-[13px] uppercase tracking-widest font-bold transition-all duration-300 flex items-center gap-2 bg-white/5 hover:bg-white/10 active:scale-95 shadow-md"
            >
              Collapse Detailed Article <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
