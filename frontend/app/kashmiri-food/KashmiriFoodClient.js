"use client";

import Link from "next/link";
import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dishesData from "@/data/dishes.json";
import WazaAITeaser from "@/components/WazaAITeaser";
import "./kashmiri.css";
import { chapterDishes } from "@/lib/dishTrays";
import DishTray from "./DishTray";
import { CORE_SEVEN_HUB, CORE_SEVEN_SERIES } from "@/data/coreSevenSeries";

const wazaExchanges = [
  { q: "I don't do spicy food. What's safe for me?", a: 'Try <b>Daniwal Korma</b> — mild, yoghurt-coriander. Skip the Marchwangan Korma today.' },
  { q: "Four of us, and it's pouring outside.", a: 'Kahwa first, then <b>Monje</b> — hot fish fritters are made for this weather.' },
  { q: 'What comes last in a real wazwan?', a: "<b>Gushtaba</b>, always — it's considered too rich to serve any earlier." }
];

// A chapter: its photograph with the copy on the left and the picture open on the right, then the
// tray of its dishes underneath.
function Chapter({ id, image, glow, tray, children }) {
  return (
    <section className="chapter relative z-0" id={id}>
      <div className="chapter-stage">
        {image}
        <div className="chapter-shade" style={{ "--glow": glow }} aria-hidden="true" />
        <div className="chapter-inner">
          <div className="chapter-content">{children}</div>
        </div>
      </div>
      <DishTray id={id} {...tray} />
    </section>
  );
}

// Every food hub URL renders this page. /kashmiri-food uses the default hero;
// each category hub (wazwan, bakery, beverages, street-food) has its own
// heading, intro and buttons.
const DEFAULT_HERO = {
  lines: ["The definitive", "guide to real", <><span className="accent">Kashmiri</span> food.</>],
  sub: "From the royal Wazwan feast, which can run to 36 courses, to the communal morning bakery runs. Discover the rules, the etiquette, and the techniques handed down through generations.",
  start: { label: "Begin the feast", section: "wazwan" },
  read: { label: "Read Our Blogs", href: "/blog" },
};
const HUB_HEROES = {
  wazwan: {
    lines: [<><span className="accent">Wazwan</span>, the</>, "feast of", "Kashmir."],
    sub: "Up to 36 courses built mostly on mutton, cooked through the night by teams of wazas and shared four to a copper trami. Meet the dishes, then read how the feast works.",
    start: { label: "Begin the feast", section: "wazwan" },
    read: { label: "What is Wazwan?", href: "/dishes" },
  },
  bakery: {
    lines: [<>The <span className="accent">Kashmiri</span></>, "bakery, from", "dawn to dusk."],
    sub: "Kandurs light their tandoors before dawn: girda and lavasa for breakfast, czochworu and kulcha with afternoon tea, and sheermal for festive days.",
    start: { label: "Visit the kandur", section: "bakery" },
    read: { label: "Kashmiri breakfast", href: "/blog/kashmiri-breakfast" },
  },
  beverages: {
    lines: ["Salted pink", "tea and", <><span className="accent">saffron</span> kahwa.</>],
    sub: "Noon chai is salted and turns pink as the milk goes in; kahwa is green tea brewed with saffron, cinnamon and cardamom. Meet both, plus babribyol for iftar.",
    start: { label: "Pour the tea", section: "beverages" },
    read: { label: "Compare the teas", href: "/blog/kahwa-vs-noon-chai" },
  },
  "street-food": {
    lines: ["The real", <span className="accent">Kashmiri</span>, "street food."],
    sub: "Coal-grilled tujji skewers, crisp nadur monji, masala tsot wraps and winter harissa cooked overnight. Meet the dishes here, then read where and when Srinagar eats them.",
    start: { label: "Walk the streets", section: "street" },
    read: { label: "Where to eat", href: "/blog/kashmiri-street-food-srinagar" },
  },
};

export default function KashmiriFoodClient({ initialDishes = dishesData, category = null }) {
  const hero = HUB_HEROES[category] || DEFAULT_HERO;
  const [activeChapter, setActiveChapter] = useState('wazwan');
  const [dialVisible, setDialVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  
  const heroSubRef = useRef(null);
  const heroCtasRef = useRef(null);
  const statCardRef = useRef(null);
  const railFillRef = useRef(null);
  const dialRef = useRef(null);
  const wheelRef = useRef(null);

  const chapters = [
    { id: 'wazwan', label: 'Wazwan' },
    { id: 'beverages', label: 'Beverages' },
    { id: 'bakery', label: 'Bakery' },
    { id: 'street', label: 'Street Food' },
  ];

  const trays = chapterDishes(initialDishes);

  useEffect(() => {
    setPortalReady(true);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);

    // Initial load animations
    if (!mq.matches) {
      const spans = document.querySelectorAll('.hero h1 span.line span');
      spans.forEach((span, i) => {
        setTimeout(() => {
          span.style.transition = 'transform .8s cubic-bezier(.16,1,.3,1), opacity .8s ease';
          span.style.transform = 'translateY(0)';
          span.style.opacity = 1;
        }, 100 + i * 150);
      });

      setTimeout(() => {
        if (heroSubRef.current) {
          heroSubRef.current.style.transition = 'opacity .8s ease, transform .8s ease';
          heroSubRef.current.style.opacity = 1;
          heroSubRef.current.style.transform = 'translateY(0)';
        }
      }, 500);
      setTimeout(() => {
        if (statCardRef.current) {
          statCardRef.current.style.transition = 'opacity .9s ease, transform .9s ease';
          statCardRef.current.style.opacity = 1;
          statCardRef.current.style.transform = 'translateX(0)';
        }
      }, 550);
      setTimeout(() => {
        if (heroCtasRef.current) {
          heroCtasRef.current.style.transition = 'opacity .8s ease, transform .8s ease';
          heroCtasRef.current.style.opacity = 1;
          heroCtasRef.current.style.transform = 'translateY(0)';
        }
      }, 650);
    } else {
      const spans = document.querySelectorAll('.hero h1 span.line span');
      spans.forEach(span => {
        span.style.transform = 'translateY(0)';
        span.style.opacity = 1;
      });
      if (heroSubRef.current) { heroSubRef.current.style.opacity = 1; heroSubRef.current.style.transform = 'translateY(0)'; }
      if (statCardRef.current) { statCardRef.current.style.opacity = 1; statCardRef.current.style.transform = 'translateX(0)'; }
      if (heroCtasRef.current) { heroCtasRef.current.style.opacity = 1; heroCtasRef.current.style.transform = 'translateY(0)'; }
    }

    // Progress rail
    const handleScroll = () => {
      const h = document.documentElement;
      const pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
      if (railFillRef.current) {
        railFillRef.current.style.height = Math.min(100, Math.max(0, pct)) + '%';
      }

      // Dial visibility
      setDialVisible(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Scroll reveal observer
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          revealObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // Chapter spy observer: a chapter is current while it crosses the middle of the screen (each
    // chapter, with its tray, is taller than the screen, so half of one is never in view).
    const spyObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setActiveChapter(e.target.id);
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    
    chapters.forEach(c => {
      const el = document.getElementById(c.id);
      if (el) spyObserver.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      revealObserver.disconnect();
      spyObserver.disconnect();
    };
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  const activeIdx = chapters.findIndex(c => c.id === activeChapter);
  const offset = 264 - ((activeIdx + 1) / chapters.length) * 264;

  return (
    <div className="kashmiri-page-wrapper">
      {/* Progress Rail & Chapter Dial — portaled to body to escape ancestor filter:blur */}
      {portalReady && createPortal(
        <>
          <div className="progress-rail">
            <div className="progress-rail-fill" ref={railFillRef}></div>
          </div>

          <div className={`chapter-dial ${dialVisible ? 'visible' : ''}`} ref={dialRef}>
            <svg className="dial-ring" viewBox="0 0 100 100">
              <circle className="dial-ring-bg" cx="50" cy="50" r="42" />
              <circle 
                className="dial-ring-fill" 
                cx="50" cy="50" r="42" 
                style={{ strokeDashoffset: offset }}
              />
            </svg>
            <div className="dial-face">
              <div className="dial-name" style={{ opacity: 1, animation: 'fadeIn 0.15s ease' }}>
                {chapters.find(c => c.id === activeChapter)?.label}
              </div>
              <div className="dial-count">{(activeIdx + 1)} / {chapters.length}</div>
            </div>
            
            {chapters.map((c, i) => {
              const angle = (i * 360) / chapters.length;
              return (
                <button
                  key={c.id}
                  className={`dial-stop ${activeChapter === c.id ? 'active' : ''} focus:outline-none focus:ring-2 focus:ring-[var(--gold)]`}
                  style={{ '--angle': `${angle}deg` }}
                  onClick={() => scrollToSection(c.id)}
                  aria-label={`Scroll to ${c.label}`}
                ></button>
              );
            })}
          </div>
        </>,
        document.body
      )}

      {/* Hero Section */}
      <section className="hero relative z-0">
        <Image src="/images/kashmiri-food/hero.webp" alt="Hero background" fill className="object-cover object-[center_35%] -z-20" priority />
        <div className="absolute inset-0 -z-10" style={{ background: 'radial-gradient(ellipse at 75% 20%, rgba(212,162,86,0.10), transparent 55%), linear-gradient(180deg, rgba(12,10,8,0.62) 0%, rgba(12,10,8,0.42) 45%, rgba(12,10,8,0.94) 100%)' }}></div>
        <div className="hero-inner">
          <h1>
            {/* The space after each line keeps the words apart in the heading text that search engines and screen readers get. */}
            {hero.lines.map((line, i) => (
              <span className="line" key={i}><span style={{ transform: 'translateY(110%)', opacity: 0 }}>{line}</span>{" "}</span>
            ))}
          </h1>
          <p className="sub" ref={heroSubRef}>
            {hero.sub}
          </p>
          <div className="hero-ctas" ref={heroCtasRef}>
            <button className="btn-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--gold)] focus:ring-offset-black" onClick={() => scrollToSection(hero.start.section)}>{hero.start.label}</button>
            <Link href="/dishes" className="btn-ghost focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--gold)] focus:ring-offset-black">Browse All Dishes</Link>
            <Link href={hero.read.href} className="btn-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--gold)] focus:ring-offset-black" style={{ backgroundColor: 'var(--gold)', color: 'black', borderColor: 'var(--gold)' }}>{hero.read.label}</Link>
          </div>

          <div className="stat-card" ref={statCardRef}>
            <div className="stat-row">
              <span className="label">Dishes to Explore</span>
              <span className="val">{initialDishes.length}</span>
            </div>
            <div className="stat-row">
              <span className="label">Wazwan Courses</span>
              <span className="val">Up to 36</span>
            </div>
            <div className="stat-row">
              <span className="label">Diners per Trami</span>
              <span className="val">4</span>
            </div>
            <p className="stat-quote">"To understand Kashmir, one must first eat with a Waza."</p>
          </div>
          
          <div className="scroll-cue">Scroll to explore</div>
        </div>
      </section>

      {/* Trami Wheel Section */}
      <section className="wheel-section relative z-0" id="wheel" ref={wheelRef}>
        <Image src="/images/kashmiri-food/trami-wheel.webp" alt="Wheel background" fill className="object-cover object-[center_30%] -z-20" loading="lazy" />
        <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(180deg, rgba(12,10,8,0.93), rgba(12,10,8,0.97) 40%, rgba(12,10,8,0.93))' }}></div>
        
        <div className="eyebrow reveal fade-up text-center w-full justify-center">THE TRAMI, MAPPED</div>
        <h2 className="reveal fade-up" style={{ transitionDelay: '0.1s' }}>One plate. <span className="accent">Four</span> ways in.</h2>
        <p className="lead reveal fade-up" style={{ transitionDelay: '0.2s' }}>
          A wazwan trami is shared four to a plate. Consider this its digital twin — every category of Kashmiri food, arranged the way the real thing is served. Tap a quarter to go there.
        </p>
        
        <div className="trami reveal scale-up">
          <div className="trami-rim"></div>
          
          <a className="trami-wedge" href="#wazwan" onClick={(e) => { e.preventDefault(); scrollToSection('wazwan'); }}>
            <span className="wedge-icon">◆ FEAST</span>
            <span className="wedge-name">Wazwan</span>
            <span className="wedge-count">{trays.wazwanAll.length} items</span>
          </a>
          <a className="trami-wedge" href="#beverages" onClick={(e) => { e.preventDefault(); scrollToSection('beverages'); }}>
            <span className="wedge-icon">◆ WARMTH</span>
            <span className="wedge-name">Beverages</span>
            <span className="wedge-count">{trays.beverages.length} beverages</span>
          </a>
          <a className="trami-wedge" href="#bakery" onClick={(e) => { e.preventDefault(); scrollToSection('bakery'); }}>
            <span className="wedge-icon">◆ MORNING</span>
            <span className="wedge-name">Bakery</span>
            <span className="wedge-count">{trays.bakery.length} breads</span>
          </a>
          <a className="trami-wedge" href="#street" onClick={(e) => { e.preventDefault(); scrollToSection('street'); }}>
            <span className="wedge-icon">◆ STANDING</span>
            <span className="wedge-name">Street Food</span>
            <span className="wedge-count">{trays.street.length} eats</span>
          </a>

          <div className="trami-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--charcoal-950)" strokeWidth="1.4">
              <path d="M6 3v6a2 2 0 0 0 2 2v10M6 3v6M9 3v6M6 9h0M18 3c-1.5 2-2 4-2 6a2 2 0 0 0 2 2v10"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Wazwan Chapter */}
      <Chapter
        id="wazwan"
        image={<Image src="/images/kashmiri-food/wazwan.webp" alt="Wazwan" fill className="object-cover object-center -z-20" loading="lazy" />}
        glow="radial-gradient(ellipse at 30% 60%, rgba(181,105,58,0.10), transparent 60%)"
        tray={{
          title: "The seven essentials",
          sub: "The dishes every Wazwan must have, in the order they are served.",
          dishes: trays.wazwan,
          more: { href: "/dishes", title: "The full feast", sub: `All ${trays.wazwanAll.length} Wazwan dishes, in serving order` },
        }}
      >
        <div className="chapter-index reveal fade-right">CHAPTER 01</div>
        <h2 className="reveal fade-right" style={{ transitionDelay: '0.1s' }}>The Royal <span className="accent">Wazwan</span>.</h2>
        <div className="tagline reveal fade-right" style={{ transitionDelay: '0.15s' }}>Seven dishes at its heart.</div>
        <p className="desc reveal fade-right" style={{ transitionDelay: '0.2s' }}>
          Seven dishes are a must at a Wazwan: tabak maaz, rista, rogan josh, aab gosht, daniwal korma, marchwangan korma and gushtaba. The feast is said to have begun as a seven-dish meal, and it has grown since: a wedding Wazwan today usually runs to 12 to 24 dishes.
        </p>
        <p className="desc reveal fade-right" style={{ transitionDelay: '0.22s' }}>
          Everything beyond the seven is added around them, and it changes from feast to feast. Vegetarian dishes such as Wazwan Mushroom and Waza Palak have joined in recent years.{" "}
          <Link href="/dishes#how-many-dishes" className="underline decoration-[var(--gold)] underline-offset-4 hover:text-[var(--gold)]">
            How the feast grew, with sources
          </Link>
        </p>
        <p className="desc reveal fade-right" style={{ transitionDelay: '0.24s' }}>
          Each of the seven has its own long story in the Journal:{" "}
          {CORE_SEVEN_SERIES.map((story, i) => (
            <Fragment key={story.slug}>
              {i === CORE_SEVEN_SERIES.length - 1 ? "and " : ""}
              <Link href={story.href} className="underline decoration-[var(--gold)]/60 underline-offset-4 hover:text-[var(--gold)]">
                {story.linkText}
              </Link>
              {i < CORE_SEVEN_SERIES.length - 1 ? ", " : "."}
            </Fragment>
          ))}
        </p>
        <div className="chapter-stats reveal fade-right" style={{ transitionDelay: '0.25s' }}>
          <div><span className="n">7</span><span className="l">Essential dishes</span></div>
          <div><span className="n">12–24</span><span className="l">At a wedding today</span></div>
          <div><span className="n">4</span><span className="l">People per Trami</span></div>
        </div>
        <div className="chapter-cta reveal fade-right" style={{ transitionDelay: '0.3s' }}>
          <Link href="/dishes" className="btn-ghost focus:outline-none focus:ring-2 focus:ring-[var(--gold)]">Explore the feast</Link>
          <Link href={CORE_SEVEN_HUB} className="btn-ghost focus:outline-none focus:ring-2 focus:ring-[var(--gold)]">Read the seven stories</Link>
        </div>
      </Chapter>

      {/* Beverages Chapter */}
      <Chapter
        id="beverages"
        image={<Image src="/images/kashmiri-food/beverages.webp" alt="Beverages" fill className="object-cover object-[center_30%] -z-20" loading="lazy" />}
        glow="radial-gradient(ellipse at 70% 30%, rgba(212,162,86,0.08), transparent 60%)"
        tray={{
          title: "Teas and drinks",
          sub: "Salted pink noon chai, saffron kahwa, and babribyol for iftar.",
          dishes: trays.beverages,
        }}
      >
        <div className="chapter-index reveal fade-right">CHAPTER 02</div>
        <h2 className="reveal fade-right" style={{ transitionDelay: '0.1s' }}>Pink tea & <span className="accent">Saffron</span>.</h2>
        <div className="tagline reveal fade-right" style={{ transitionDelay: '0.15s' }}>A culture of warmth.</div>
        <p className="desc reveal fade-right" style={{ transitionDelay: '0.2s' }}>
          From the savory, blush-pink Noon Chai brewed with baking soda and salt, to the aromatic Kahwa steeped with saffron, almonds, and cardamom. Beverages here are about hospitality.
        </p>
        <div className="chapter-stats reveal fade-right" style={{ transitionDelay: '0.25s' }}>
          <div><span className="n">Salt</span><span className="l">In daily tea</span></div>
          <div><span className="n">Samovar</span><span className="l">Copper brewing pot</span></div>
        </div>
        <div className="chapter-cta reveal fade-right" style={{ transitionDelay: '0.3s' }}>
          <Link href="/kashmiri-food/beverages" className="btn-ghost focus:outline-none focus:ring-2 focus:ring-[var(--gold)]">Explore beverages</Link>
        </div>
      </Chapter>

      {/* Bakery Chapter */}
      <Chapter
        id="bakery"
        image={<Image src="/images/kashmiri-food/bakery.webp" alt="Bakery" fill className="object-cover object-[center_38%] -z-20" loading="lazy" />}
        glow="radial-gradient(ellipse at 30% 40%, rgba(212,162,86,0.08), transparent 60%)"
        tray={{
          title: "Bakery breads",
          sub: "Traditional breads from Kashmir's kandurs, each with its own texture, flavor and time.",
          dishes: trays.bakery,
        }}
      >
        <div className="chapter-index reveal fade-right">CHAPTER 03</div>
        <h2 className="reveal fade-right" style={{ transitionDelay: '0.1s' }}>The local <span className="accent">Kandur</span>.</h2>
        <div className="tagline reveal fade-right" style={{ transitionDelay: '0.15s' }}>Fresh bread on the hour.</div>
        <p className="desc reveal fade-right" style={{ transitionDelay: '0.2s' }}>
          No Kashmiri bakes bread at home. Every neighborhood has a Kandur (baker) who fires up the tandoor at dawn. Different breads are baked at specific hours of the day.
        </p>
        <div className="chapter-stats reveal fade-right" style={{ transitionDelay: '0.25s' }}>
          <div><span className="n">Girda</span><span className="l">Morning staple</span></div>
          <div><span className="n">Lavasa</span><span className="l">Afternoon wrap</span></div>
        </div>
        <div className="chapter-cta reveal fade-right" style={{ transitionDelay: '0.3s' }}>
          <Link href="/kashmiri-food/bakery" className="btn-ghost focus:outline-none focus:ring-2 focus:ring-[var(--gold)]">Explore bakery</Link>
        </div>
      </Chapter>

      {/* Street Food Chapter */}
      <Chapter
        id="street"
        image={<Image src="/images/kashmiri-food/street-food.webp" alt="Street Food" fill className="object-cover object-[center_40%] -z-20" loading="lazy" />}
        glow="radial-gradient(ellipse at 65% 65%, rgba(181,105,58,0.10), transparent 60%)"
        tray={{
          title: "Street food and sweets",
          sub: "Coal-grilled tujji, crisp nadur monji, masala tsot wraps and winter harissa.",
          dishes: trays.street,
        }}
      >
        <div className="chapter-index reveal fade-right">CHAPTER 04</div>
        <h2 className="reveal fade-right" style={{ transitionDelay: '0.1s' }}>Srinagar's <span className="accent">Streets</span>.</h2>
        <div className="tagline reveal fade-right" style={{ transitionDelay: '0.15s' }}>Smoke & spice.</div>
        <p className="desc reveal fade-right" style={{ transitionDelay: '0.2s' }}>
          Outside the formal feasts lies a bustling street food culture. Coal-grilled Tujji skewers, deep-fried lotus stems, and rich winter Harissa paste cooked overnight.
        </p>
        <div className="chapter-cta reveal fade-right" style={{ transitionDelay: '0.25s' }}>
          <Link href="/kashmiri-food/street-food" className="btn-ghost focus:outline-none focus:ring-2 focus:ring-[var(--gold)]">Explore street food</Link>
        </div>
      </Chapter>

      {/* Waza AI Teaser */}
      <WazaAITeaser qaData={wazaExchanges} />
    </div>
  );
}
