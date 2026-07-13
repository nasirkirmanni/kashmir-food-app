"use client";

import { useEffect, useState, useRef } from "react";
import "./WazaAITeaser.css";

export default function WazaAITeaser({ qaData }) {
  const [inView, setInView] = useState(false);
  const [exchangeIdx, setExchangeIdx] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [showReply, setShowReply] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || !qaData || qaData.length === 0) return;

    let timeout;
    const currentExchange = qaData[exchangeIdx % qaData.length];
    
    if (reducedMotion) {
      setCurrentText(currentExchange.q);
      setShowReply(true);
      timeout = setTimeout(() => {
        setShowReply(false);
        setCurrentText("");
        setExchangeIdx(prev => prev + 1);
      }, 4500);
      return () => clearTimeout(timeout);
    }

    setShowReply(false);
    setCurrentText("");
    let i = 0;
    
    const typeNextChar = () => {
      if (i < currentExchange.q.length) {
        setCurrentText(currentExchange.q.slice(0, i + 1));
        i++;
        timeout = setTimeout(typeNextChar, 26);
      } else {
        timeout = setTimeout(() => {
          setShowReply(true);
          timeout = setTimeout(() => {
            setExchangeIdx(prev => prev + 1);
          }, 3200);
        }, 450);
      }
    };
    
    timeout = setTimeout(typeNextChar, 100);

    return () => clearTimeout(timeout);
  }, [inView, exchangeIdx, qaData, reducedMotion]);

  return (
    <section ref={sectionRef} className="waza-teaser">
      <div className="waza-inner">
        <div className="waza-copy">
          <div className="waza-badge">
            <div className="dot"></div>
            Waza AI active
          </div>
          <h3>
            Your personal <span className="accent">Waza</span>
          </h3>
          <p>
            Not sure what to order? Our Waza AI understands the weather, your spice tolerance, and the traditional course rules to guide you perfectly.
          </p>
          <div className="chapter-cta mt-6">
            <button 
              className="btn-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--gold)] focus:ring-offset-[var(--charcoal-900)]" 
              onClick={() => window.dispatchEvent(new Event('open-waza-ai-intro'))}
              aria-label="Ask Waza AI"
            >
              Ask Waza AI
            </button>
          </div>
        </div>

        <div className="waza-card">
          <div className="waza-card-header">
            <div className="waza-dots">
              <span className="rd"></span>
              <span className="yw"></span>
              <span className="gn"></span>
            </div>
            <div className="waza-title">waza_agent.exe</div>
          </div>
          <div className="waza-card-body min-h-[140px]">
            {inView && qaData && qaData.length > 0 && (
              <>
                <div className="waza-msg user show">
                  {currentText}
                  {!showReply && !reducedMotion && <span className="waza-caret"></span>}
                </div>
                {showReply && (
                  <div 
                    className="waza-msg reply show" 
                    dangerouslySetInnerHTML={{ __html: qaData[exchangeIdx % qaData.length].a }} 
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
