"use client";
import React from 'react';
import { Clock, Map, ArrowUpCircle, Navigation, Mountain, Sun, Thermometer, SignalZero } from 'lucide-react';

const iconMap = {
  Clock,
  Map,
  ArrowUpCircle,
  Navigation,
  Mountain,
  Sun,
  Thermometer,
  SignalZero
};

export default function QuickFacts({ data }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 bg-[#14110E] border border-white/5 p-4 md:p-10 rounded-[24px] shadow-2xl backdrop-blur-xl">
      {data.map((fact, index) => {
        const Icon = iconMap[fact.icon];
        return (
          <div key={index} className="flex items-center md:flex-col md:items-start gap-3 p-2 md:p-4 rounded-xl hover:bg-white/5 transition-colors">
            <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-[#D4A85D]/10 flex items-center justify-center text-[#D4A85D]">
              {Icon && <Icon className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.5} />}
            </div>
            <div>
              <p className="text-[9px] md:text-[11px] uppercase tracking-widest text-white/50 font-semibold mb-0.5">
                {fact.label}
              </p>
              <p className="text-[12px] md:text-[15px] font-medium text-white leading-snug">
                {fact.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
