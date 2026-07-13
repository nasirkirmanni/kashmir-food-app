"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./HowToExperience.module.css";

const wazaCategories = [
  { name: 'STREET FOOD', items: [
    { q: "Four of us, and it's pouring outside.", a: [{text: "Kahwa first, then "}, {text: "Monje", em: true}, {text: " — hot fish fritters are made for this weather."}] },
    { q: "Something quick, we only have 20 minutes.", a: [{text: "Try "}, {text: "Tsochvoru", em: true}, {text: " — skewered mutton, off the grill in minutes."}] },
    { q: "I don't eat spicy food at all.", a: [{text: "Go for "}, {text: "Modur Pulao", em: true}, {text: " — sweet saffron rice, gentle on the palate."}] },
    { q: "Anything vegetarian from a street stall?", a: [{text: "Nadru Yakhni", em: true}, {text: " — lotus stem in a mild yogurt gravy, sold by the bowl."}] }
  ]},
  { name: 'WAZWAN FEAST', items: [
    { q: "We're six people, first time trying Wazwan.", a: [{text: "Book a full trami — "}, {text: "Rista", em: true}, {text: " and "}, {text: "Rogan Josh", em: true}, {text: " open the feast."}] },
    { q: "What comes right before Gushtaba?", a: [{text: "Aab Gosht", em: true}, {text: " — milk-braised lamb, the quiet dish before the finale."}] },
    { q: "Is there a vegetarian trami option?", a: [{text: "Ask for the "}, {text: "Vegetarian Wazwan", em: true}, {text: " — built around paneer and lotus stem."}] },
    { q: "How many courses should we expect?", a: [{text: "A ceremonial Wazwan runs "}, {text: "seven courses", em: true}, {text: " , sometimes more for weddings."}] },
    { q: "What's the etiquette at the trami?", a: [{text: "Wait for the eldest guest — "}, {text: "they", em: true}, {text: " eat first, by tradition."}] }
  ]},
  { name: 'KAHWA & SWEETS', items: [
    { q: "What's a good after-dinner drink?", a: [{text: "Kahwa", em: true}, {text: " — saffron and cinnamon green tea, served from a samovar."}] },
    { q: "Anything sweet to finish the meal?", a: [{text: "Phirni", em: true}, {text: " — chilled rice pudding, traditionally set in clay bowls."}] },
    { q: "Is Kahwa served with anything?", a: [{text: "Usually with "}, {text: "Kulcha", em: true}, {text: " or "}, {text: "Bakarkhani", em: true}, {text: " bread on the side."}] }
  ]},
  { name: 'SPICE LEVEL', items: [
    { q: "I want the boldest dish on the menu.", a: [{text: "Rista", em: true}, {text: " — minced mutton balls in a fiery red Kashmiri chili gravy."}] },
    { q: "Something rich but not too spicy?", a: [{text: "Gushtaba", em: true}, {text: " — pounded meatballs in a mild yogurt curry."}] },
    { q: "What's the mildest dish available?", a: [{text: "Dahi Phulki", em: true}, {text: " — soft dumplings in cool spiced yogurt."}] },
    { q: "Can the kitchen adjust spice for me?", a: [{text: "Yes — just mention it when you "}, {text: "book", em: true}, {text: " , and they'll tone it down."}] }
  ]}
];

const timelineSteps = [
  { badge: "01", side: "l", icon: <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>, title: "Book in Advance", desc: "A full Wazwan is often prepared overnight, so call ahead if you want the ceremonial feast experience rather than a standard menu order.", why: "Most kitchens need a headcount, not a card number — booking is really about giving the kitchen lead time." },
  { badge: "02", side: "r", icon: <svg viewBox="0 0 24 24"><circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M2 21c0-4 3-6 6-6s6 2 6 6M14 21c.5-3 2-5 5-5.2"/></svg>, title: "Come Hungry, Come Many", desc: "Wazwan is best enjoyed in a group. The shared trami experience makes the meal feel cultural, social, and complete.", why: "Four to a trami is traditional — fewer guests means more courses go untouched." },
  { badge: "03", side: "l", icon: <svg viewBox="0 0 24 24"><path d="M12 2l2.6 6.6L21 9.3l-5 4.5 1.4 6.8L12 17.4l-5.4 3.2L8 13.8l-5-4.5 6.4-.7z"/></svg>, title: "Start with the Classics", desc: "If you are new to Kashmiri food, begin with Rogan Josh, Gushtaba, Rista, and Tabak Maaz before branching into rarer specialties.", why: "These four give you the full range of Wazwan's textures before anything more adventurous." },
  { badge: "04", side: "r", icon: <svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0z"/><path d="M4 12h16"/></svg>, title: "Respect the Finale", desc: "Dishes like Gushtaba are traditionally served at the end of a Wazwan, so knowing the order makes the experience far more immersive.", why: "Save room — Gushtaba closing the feast is, quite literally, the whole point." },
  { badge: "05", side: "l", icon: <svg viewBox="0 0 24 24"><circle cx="10" cy="10" r="6.5"/><path d="M15 15l6 6"/></svg>, title: "Ask About Authenticity", desc: "Some restaurants are polished for tourists, while others preserve older cooking styles. Use the authenticity notes in the app.", why: "A place proud of its history will usually tell you, unprompted — it's worth asking if it doesn't." },
  { badge: "06", side: "r", icon: <svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 12 2a7 7 0 0 1 7 7.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.2"/></svg>, title: "Pair Food with the Place", desc: "A Dal Lake setting, an old city dining hall, and a heritage restaurant each create a very different mood around the same dish.", why: "Same recipe, different room — the setting changes what the dish means." }
];

export default function HowToExperiencePage() {
  const [openCards, setOpenCards] = useState({});
  const [revealedCards, setRevealedCards] = useState({});
  
  // Waza AI State
  const [wazaCatIdx, setWazaCatIdx] = useState(0);
  const [wazaItemIdx, setWazaItemIdx] = useState(0);
  const [wazaQuestion, setWazaQuestion] = useState("");
  const [wazaAnswerChars, setWazaAnswerChars] = useState(0);
  const [catRingOpacity, setCatRingOpacity] = useState(0);
  const [showAiResponse, setShowAiResponse] = useState(false);
  
  const timelineRef = useRef(null);
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const badgeRefs = useRef([]);
  const cardRefs = useRef([]);
  const wazaSectionRef = useRef(null);
  
  const runningRef = useRef(false);
  const timerRef = useRef(null);
  const resolveSleepRef = useRef(null);
  const catIdxRef = useRef(0);
  const itemIdxRef = useRef(0);

  // --- Scroll & Stitch Line ---
  useEffect(() => {
    let pathLength = 0;
    
    const buildPath = () => {
      if (!svgRef.current || !pathRef.current || !timelineRef.current || badgeRefs.current.length === 0) return;
      
      const timeline = timelineRef.current;
      const rect = timeline.getBoundingClientRect();
      svgRef.current.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
      
      const isMobile = window.innerWidth <= 900;
      let d = '';
      let prevX = null, prevY = null;
      
      badgeRefs.current.forEach((b, i) => {
        if (!b) return;
        const br = b.getBoundingClientRect();
        const x = br.left + br.width / 2 - rect.left;
        const y = br.top + br.height / 2 - rect.top;
        
        if (i === 0) {
          d += `M ${x} ${y}`;
        } else if (isMobile) {
          const midY = (prevY + y) / 2;
          d += ` C ${prevX} ${midY}, ${x} ${midY}, ${x} ${y}`;
        } else {
          d += ` Q ${rect.width / 2} ${y - 60} ${x} ${y}`;
        }
        prevX = x; prevY = y;
      });
      
      pathRef.current.setAttribute('d', d);
      pathLength = pathRef.current.getTotalLength ? pathRef.current.getTotalLength() : 0;
      pathRef.current.style.strokeDasharray = pathLength;
      onScroll();
    };

    const onScroll = () => {
      if (!timelineRef.current || !pathRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const viewH = window.innerHeight;
      const progressed = Math.min(1, Math.max(0, (viewH - rect.top) / rect.height));
      
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        pathRef.current.style.strokeDashoffset = 0;
      } else {
        pathRef.current.style.strokeDashoffset = pathLength * (1 - progressed);
      }
    };

    buildPath();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', buildPath);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', buildPath);
    };
  }, [revealedCards]); // Re-measure when cards pop in (which shifts layout)

  // --- Card Reveal Observer ---
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const idx = e.target.dataset.idx;
          setRevealedCards(prev => ({ ...prev, [idx]: true }));
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.25 });

    cardRefs.current.forEach(c => {
      if (c) io.observe(c);
    });

    return () => io.disconnect();
  }, []);

  // --- Waza AI Typewriter ---
  useEffect(() => {
    const sleep = (ms) => new Promise(res => {
      resolveSleepRef.current = res;
      timerRef.current = setTimeout(res, ms);
    });

    const wazaLoop = async () => {
      while (runningRef.current) {
        const cat = wazaCategories[catIdxRef.current];
        const item = cat.items[itemIdxRef.current];

        // Reset
        setCatRingOpacity(0);
        await sleep(160);
        if (!runningRef.current) break;
        
        setWazaCatIdx(catIdxRef.current);
        setWazaItemIdx(itemIdxRef.current);
        setCatRingOpacity(1);

        setShowAiResponse(false);
        setWazaAnswerChars(0);
        setWazaQuestion(item.q);
        
        await sleep(600);
        if (!runningRef.current) break;

        setShowAiResponse(true);
        
        // Calculate total characters in the rich text answer
        const plainTextTotal = item.a.reduce((acc, seg) => acc + seg.text.length, 0);
        
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (reduceMotion) {
          setWazaAnswerChars(plainTextTotal);
        } else {
          for (let i = 0; i <= plainTextTotal; i++) {
            setWazaAnswerChars(i);
            await sleep(14 + Math.random() * 22);
            if (!runningRef.current) break;
          }
        }

        await sleep(2800);
        if (!runningRef.current) break;

        // Rollover
        itemIdxRef.current++;
        if (itemIdxRef.current >= cat.items.length) {
          itemIdxRef.current = 0;
          catIdxRef.current = (catIdxRef.current + 1) % wazaCategories.length;
        }
      }
    };

    const wazaObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          if (!runningRef.current) {
            runningRef.current = true;
            wazaLoop();
          }
        } else {
          runningRef.current = false;
          clearTimeout(timerRef.current);
          if (resolveSleepRef.current) resolveSleepRef.current();
        }
      });
    }, { threshold: 0.2 });

    if (wazaSectionRef.current) {
      wazaObserver.observe(wazaSectionRef.current);
    }

    return () => {
      runningRef.current = false;
      clearTimeout(timerRef.current);
      if (resolveSleepRef.current) resolveSleepRef.current();
      wazaObserver.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Render Rich Text Segment safely
  const renderRichText = (segments, visibleCharsCount) => {
    let charsCounted = 0;
    
    return segments.map((seg, i) => {
      if (charsCounted >= visibleCharsCount) return null;
      
      const remainingChars = visibleCharsCount - charsCounted;
      const textToRender = seg.text.substring(0, remainingChars);
      charsCounted += seg.text.length;
      
      if (seg.em) {
        return <em key={i}>{textToRender}</em>;
      }
      return <span key={i}>{textToRender}</span>;
    });
  };

  const toggleCard = (idx) => {
    setOpenCards(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.grain}></div>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.ghostPlate}></div>
        <div className={styles.eyebrow}>Visitor Guide</div>
        <h1>How to Experience<br />Wazwan</h1>
        <p className={styles.sub}>Everything you should know before you sit at the trami.</p>
        <div className={styles.scrollCue}>
          <span>SIX THINGS TO KNOW</span>
          <div className={styles.line}></div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className={styles.timeline} ref={timelineRef}>
        <svg className={styles.stitchSvg} ref={svgRef} preserveAspectRatio="none">
          <path className={styles.stitchPath} ref={pathRef} d=""></path>
        </svg>

        {timelineSteps.map((step, idx) => {
          const isL = step.side === 'l';
          const isRevealed = revealedCards[idx];
          const isOpen = openCards[idx];
          
          return (
            <div key={idx} className={styles.step} style={{ justifyContent: isL ? "flex-end" : "flex-start" }}>
              <div 
                className={`${styles.card} ${isRevealed ? styles.in : ""} ${isOpen ? styles.open : ""}`}
                data-idx={idx}
                ref={el => cardRefs.current[idx] = el}
                onClick={() => toggleCard(idx)}
              >
                <div className={styles.badge} ref={el => badgeRefs.current[idx] = el}>{step.badge}</div>
                <div className={styles.icon}>{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                <div className={styles.expandCue}>
                  <span className={styles.plus}>+</span> Why it matters
                </div>
                <div className={styles.flip}>
                  <div className={styles.flipInner}>{step.why}</div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Waza AI Section */}
      <section className={styles.wazaAi} id="waza-ai" ref={wazaSectionRef}>
        <div className={styles.wazaGrid}>
          <div>
            <div className={styles.aiStatus}>
              <span className={styles.aiStatusDot}></span>WAZA AI ACTIVE
            </div>
            <h2 className={styles.wazaHeading}>
              Your personal<br /><span className={styles.wazaName}>Waza</span>
            </h2>
            <p className={styles.wazaSub}>
              Not sure what to order? Our Waza AI understands the weather, your spice tolerance, and the traditional course rules to guide you perfectly.
            </p>
            <Link href="/waza-ai" className={`${styles.btnPrimary} ${styles.wazaBtn}`}>
              Ask Waza AI
            </Link>
          </div>

          <div className={styles.wazaDemo}>
            <div className={styles.catRing}>
              <div className={styles.catRingOrbit}>
                <span className={`${styles.catDot} ${styles.catDotTop}`}></span>
                <span className={`${styles.catDot} ${styles.catDotRight}`}></span>
                <span className={`${styles.catDot} ${styles.catDotBottom}`}></span>
                <span className={`${styles.catDot} ${styles.catDotLeft}`}></span>
              </div>
              <div className={styles.catRingCenter} style={{ opacity: catRingOpacity, transition: 'opacity 0.3s' }}>
                <span className={styles.catName}>{wazaCategories[wazaCatIdx].name}</span>
                <span className={styles.catCount}>{wazaItemIdx + 1} / {wazaCategories[wazaCatIdx].items.length}</span>
              </div>
            </div>

            <div className={styles.terminal}>
              <div className={styles.terminalBar}>
                <div className={styles.tdots}>
                  <span className={`${styles.td} ${styles.red}`}></span>
                  <span className={`${styles.td} ${styles.amber}`}></span>
                  <span className={`${styles.td} ${styles.green}`}></span>
                </div>
                <span className={styles.terminalLabel}>waza_agent.exe</span>
              </div>
              <div className={styles.terminalBody}>
                {wazaQuestion && (
                  <div key={`q-${wazaCatIdx}-${wazaItemIdx}`} className={`${styles.msg} ${styles.user}`}>
                    {wazaQuestion}
                  </div>
                )}
                {showAiResponse && (
                  <div key={`a-${wazaCatIdx}-${wazaItemIdx}`} className={`${styles.msg} ${styles.ai}`}>
                    {renderRichText(wazaCategories[wazaCatIdx].items[wazaItemIdx].a, wazaAnswerChars)}
                    <span className={styles.cursor}></span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.rule}></div>
        <h2>Ready to experience the royal feast?</h2>
        <Link href="/restaurants" className={styles.btnPrimary}>
          Plan Your Visit →
        </Link>
      </section>

      {/* Floating AI FAB */}
      <a href="#waza-ai" className={styles.aiFab}>
        <svg className={styles.fabIcon} viewBox="0 0 24 24">
          <path d="M12 3c-2 0-3.6 1.4-3.9 3.2C6.3 6.7 5 8.3 5 10.2 5 12 6.3 13.5 8 14v5a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-5c1.7-.5 3-2 3-3.8 0-1.9-1.3-3.5-3.1-4C15.6 4.4 14 3 12 3z"/>
          <path d="M8 19h8"/>
        </svg>
        <span>AI</span>
      </a>
    </div>
  );
}
