"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dishesData from "@/data/dishes.json";
import WazaAITeaser from "@/components/WazaAITeaser";
import "./kashmiri.css";

const wazaExchanges = [
  { q: "I don't do spicy food. What's safe for me?", a: 'Try <b>Daniwal Korma</b> — mild, yoghurt-coriander. Skip the Marchwangan Korma today.' },
  { q: "Four of us, and it's pouring outside.", a: 'Kahwa first, then <b>Monje</b> — hot fish fritters are made for this weather.' },
  { q: 'What comes last in a real wazwan?', a: "<b>Gushtaba</b>, always — it's considered too rich to serve any earlier." }
];

const overrides = {
  // Wazwan
  'aab-gosht': 'Mild milk-based lamb',
  'al-hachh-mutton': 'Dried gourd mutton',
  'aloo-bukhar-korma': 'Plum-laced meatballs',
  'anardana-chetin': 'Pomegranate chutney',
  'bam-tsoonth': 'Spiced quince curry',
  'bum-tschunth-tschaman': 'Tangy paneer stew',
  'dani-phol': 'Rich mutton drumstick',
  'daniwal-korma': 'Coriander yogurt curry',
  'doon-chetin': 'Walnut–green chili chutney',
  'dum-oluv': 'Yogurt-braised potatoes',
  'gand-t-maaz': 'Slow-simmered offal',
  'gande-tsitin': 'Onion–chili chutney',
  'gogji-mutton': 'Turnip mutton curry',
  'gogji-raakh': 'Turnip greens side',
  'haak-t-tschaman': 'Greens with paneer',
  'haakh': 'Kashmiri collard greens',
  'haakh-t-maaz': 'Greens with meat',
  'kabab': 'Charcoal minced skewers',
  'marchwangan-korma': 'Fiery red chili mutton',
  'matsgand': 'Spicy red meatballs',
  'methi-maaz': 'Fenugreek tripe',
  'muji-chetin': 'Radish walnut chutney',
  'muji-gaad': 'Radish fish curry',
  'mutton-yakhni': 'Curd-based mutton',
  'nadru-gaad': 'Lotus stem fish curry',
  'palak-t-tschaman': 'Spinach paneer dish',
  'pudin-chetin': 'Mint chutney',
  'rice': 'Base of every trami',
  'rista': 'Bright red meatballs',
  'rogan-josh': 'Iconic red lamb curry',
  'ruwangan-chaman': 'Tomato-based paneer',
  'ruwangan-chetin': 'Tomato chutney',
  'ruwangan-mutton': 'Tomato mutton curry',
  'seekh-kebab': 'Traditional ground skewers',
  'syoon': 'Kashmiri Pandit lamb',
  'syun': 'Slow-cooked mutton',
  'tsaman-yakhni': 'Paneer in yogurt gravy',
  'tsoek-wangangan': 'Sour spicy eggplant',
  'veth-chaman': 'Rich paneer curry',
  'wangangan-chaman': 'Eggplant paneer curry',
  'waza-kokur': 'Whole spiced chicken',
  'waza-palak': 'Spinach with meatballs',
  'wazwaan-mushroom': 'Mushroom Wazwan prep',
  'yakhni': 'Curd-based gravy',
  'zere-chetin': 'Cumin chutney',
  'waza-paneer': 'Rich fried paneer',
  'gushtaba': 'Velvety pounded meatballs',
  'tabakh-maaz': 'Crispy fried lamb ribs',
  // Street Food & Bakery
  'bakerkhani': 'Flaky layered flatbread',
  'basrakh': 'Sweet crispy snack',
  'czochworu': 'Sesame tandoor bread',
  'girda': 'Everyday round bread',
  'kashmiri-harissa': 'Winter meat paste',
  'lavas': 'Thin soft flatbread',
  'masala-tsot': 'Spiced small bread',
  'mutton-tujji': 'Coal-grilled skewers',
  'nadur-monji': 'Lotus stem fritters',
  'suji-halwa': 'Semolina sweet dish',
  'tabak-maaz': 'Crispy fried lamb ribs',
  'kashmiri-kulcha': 'Crumbly bakery biscuits',
  'aloo-monji': 'Crispy potato fritters',
  'tujji': 'Coal-grilled meat skewers',
  'monje': 'Crispy lotus fritters',
  // Beverages
  'kahwa': 'Saffron green tea',
  'noon-chai': 'Pink salted tea',
  'harissa': 'Winter meat paste',
  'tsot': 'Small everyday bread',
  'lavasa': 'Thin blistered flatbread',
  'riste': 'Spiced meatball curry',
};

function getShortNote(dish) {
  if (dish.shortNote) return dish.shortNote;
  if (overrides[dish.slug]) return overrides[dish.slug];
  
  if (dish.description) {
    const phrase = dish.description.split('.')[0].split(',')[0];
    const words = phrase.split(' ');
    return words.slice(0, 4).join(' ');
  }
  return dish.category || "Traditional Kashmiri";
}


function DishCard({ dish, index }) {
  const [imgSrc, setImgSrc] = useState(dish.image || '/placeholder-dish.jpg');
  const shortNote = getShortNote(dish);

  return (
    <Link href={`/dishes/${dish.slug || dish._id}`} className="block focus:outline-none focus:ring-2 focus:ring-[var(--gold)] rounded-md">
      <div className="dish-card">
        <Image
          src={imgSrc}
          alt={dish.name}
          fill
          quality={70}
          sizes="(max-width: 640px) 200px, 200px"
          className="object-cover -z-20"
          onError={() => setImgSrc('/placeholder-dish.jpg')}
          loading="lazy"
        />
        <div className="shade -z-10"></div>
        <div className="info z-0 w-full">
          <div className="num" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <span style={{ fontSize: '0.55rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ivory-dim)' }}>
              {dish.courseType ? (dish.courseType.charAt(0).toUpperCase() + dish.courseType.slice(1)) : (dish.foodType || "Veg")}
            </span>
          </div>
          <div className="name leading-tight">{dish.name}</div>
          <div className="note">{shortNote}</div>
        </div>
      </div>
    </Link>
  );
}

export default function KashmiriFoodClient({ initialDishes = dishesData }) {
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

  const wazwanDishes = initialDishes.filter((d) => d.categoryType === "wazwan");
  const beverageDishes = initialDishes.filter((d) => d.categoryType === "beverage");
  const bakeryDishes = initialDishes.filter((d) => d.categoryType === "bakery");
  const streetFoodDishes = initialDishes.filter((d) => d.categoryType === "kashmiri_cuisine" && d.category === "Street Food");

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

    // Chapter spy observer
    const spyObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setActiveChapter(e.target.id);
        }
      });
    }, { threshold: 0.5 });
    
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
            <span className="line"><span style={{ transform: 'translateY(110%)', opacity: 0 }}>The definitive</span></span>
            <span className="line"><span style={{ transform: 'translateY(110%)', opacity: 0 }}>guide to real</span></span>
            <span className="line"><span style={{ transform: 'translateY(110%)', opacity: 0 }}><span className="accent">Kashmiri</span> food.</span></span>
          </h1>
          <p className="sub" ref={heroSubRef}>
            From the royal 36-course Wazwan feast to the communal morning bakery runs. Discover the rules, the etiquette, and the centuries-old techniques.
          </p>
          <div className="hero-ctas" ref={heroCtasRef}>
            <button className="btn-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--gold)] focus:ring-offset-black" onClick={() => scrollToSection('wazwan')}>Begin the feast</button>
            <Link href="/dishes" className="btn-ghost focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--gold)] focus:ring-offset-black">Browse All Dishes</Link>
          </div>

          <div className="stat-card" ref={statCardRef}>
            <div className="stat-row">
              <span className="label">Traditional Dishes</span>
              <span className="val">100+</span>
            </div>
            <div className="stat-row">
              <span className="label">Wazwan Courses</span>
              <span className="val">Up to 36</span>
            </div>
            <div className="stat-row">
              <span className="label">Centuries of History</span>
              <span className="val">XV Century</span>
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
            <span className="wedge-count">20 items</span>
          </a>
          <a className="trami-wedge" href="#beverages" onClick={(e) => { e.preventDefault(); scrollToSection('beverages'); }}>
            <span className="wedge-icon">◆ WARMTH</span>
            <span className="wedge-name">Beverages</span>
            <span className="wedge-count">4 beverages</span>
          </a>
          <a className="trami-wedge" href="#bakery" onClick={(e) => { e.preventDefault(); scrollToSection('bakery'); }}>
            <span className="wedge-icon">◆ MORNING</span>
            <span className="wedge-name">Bakery</span>
            <span className="wedge-count">6 breads</span>
          </a>
          <a className="trami-wedge" href="#street" onClick={(e) => { e.preventDefault(); scrollToSection('street'); }}>
            <span className="wedge-icon">◆ STANDING</span>
            <span className="wedge-name">Street Food</span>
            <span className="wedge-count">7 eats</span>
          </a>

          <div className="trami-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--charcoal-950)" strokeWidth="1.4">
              <path d="M6 3v6a2 2 0 0 0 2 2v10M6 3v6M9 3v6M6 9h0M18 3c-1.5 2-2 4-2 6a2 2 0 0 0 2 2v10"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Wazwan Chapter */}
      <section className="chapter relative z-0" id="wazwan">
        <Image src="/images/kashmiri-food/wazwan.webp" alt="Wazwan" fill className="object-cover object-center -z-20" loading="lazy" />
        <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(100deg, rgba(12,10,8,0.93) 0%, rgba(12,10,8,0.5) 55%, rgba(12,10,8,0.88) 100%), radial-gradient(ellipse at 30% 60%, rgba(181,105,58,0.10), transparent 60%)' }}></div>
        
        <div className="chapter-inner">
          <div className="chapter-content">
            <div className="chapter-index reveal fade-right">CHAPTER 01</div>
            <h2 className="reveal fade-right" style={{ transitionDelay: '0.1s' }}>The Royal <span className="accent">Wazwan</span>.</h2>
            <div className="tagline reveal fade-right" style={{ transitionDelay: '0.15s' }}>36 courses of artistry.</div>
            <p className="desc reveal fade-right" style={{ transitionDelay: '0.2s' }}>
              Cooked over smoldering wood fires through the night by master chefs (Wazas), this is not just a meal. It is a highly choreographed social ritual where every cut of lamb has a specific purpose.
            </p>
            <div className="chapter-stats reveal fade-right" style={{ transitionDelay: '0.25s' }}>
              <div><span className="n">36</span><span className="l">Courses</span></div>
              <div><span className="n">4</span><span className="l">People per Trami</span></div>
              <div><span className="n">10+</span><span className="l">Hours to prepare</span></div>
            </div>
            <div className="chapter-cta reveal fade-right" style={{ transitionDelay: '0.3s' }}>
              <Link href="/kashmiri-food/wazwan" className="btn-ghost focus:outline-none focus:ring-2 focus:ring-[var(--gold)]">Explore the feast</Link>
            </div>
          </div>
          <div className="chapter-gallery reveal fade-left">
            <div className="dish-rail">
              {wazwanDishes.map((dish, idx) => (
                <DishCard key={dish._id || dish.slug} dish={dish} index={idx} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Beverages Chapter */}
      <section className="chapter relative z-0" id="beverages">
        <Image src="/images/kashmiri-food/beverages.webp" alt="Beverages" fill className="object-cover object-[center_30%] -z-20" loading="lazy" />
        <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(100deg, rgba(12,10,8,0.95) 0%, rgba(12,10,8,0.5) 55%, rgba(12,10,8,0.85) 100%), radial-gradient(ellipse at 70% 30%, rgba(212,162,86,0.08), transparent 60%)' }}></div>
        
        <div className="chapter-inner">
          <div className="chapter-content">
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
          </div>
          <div className="chapter-gallery reveal fade-left">
            <div className="dish-rail">
              {beverageDishes.map((dish, idx) => (
                <DishCard key={dish._id || dish.slug} dish={dish} index={idx} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bakery Chapter */}
      <section className="chapter relative z-0" id="bakery">
        <Image src="/images/kashmiri-food/bakery.webp" alt="Bakery" fill className="object-cover object-[center_38%] -z-20" loading="lazy" />
        <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(100deg, rgba(12,10,8,0.95) 0%, rgba(12,10,8,0.48) 55%, rgba(12,10,8,0.82) 100%), radial-gradient(ellipse at 30% 40%, rgba(212,162,86,0.08), transparent 60%)' }}></div>
        
        <div className="chapter-inner">
          <div className="chapter-content">
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
          </div>
          <div className="chapter-gallery reveal fade-left">
            <div className="dish-rail">
              {bakeryDishes.map((dish, idx) => (
                <DishCard key={dish._id || dish.slug} dish={dish} index={idx} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Street Food Chapter */}
      <section className="chapter relative z-0" id="street">
        <Image src="/images/kashmiri-food/street-food.webp" alt="Street Food" fill className="object-cover object-[center_40%] -z-20" loading="lazy" />
        <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(100deg, rgba(12,10,8,0.95) 0%, rgba(12,10,8,0.5) 55%, rgba(12,10,8,0.85) 100%), radial-gradient(ellipse at 65% 65%, rgba(181,105,58,0.10), transparent 60%)' }}></div>
        
        <div className="chapter-inner">
          <div className="chapter-content">
            <div className="chapter-index reveal fade-right">CHAPTER 04</div>
            <h2 className="reveal fade-right" style={{ transitionDelay: '0.1s' }}>Srinagar's <span className="accent">Streets</span>.</h2>
            <div className="tagline reveal fade-right" style={{ transitionDelay: '0.15s' }}>Smoke & spice.</div>
            <p className="desc reveal fade-right" style={{ transitionDelay: '0.2s' }}>
              Outside the formal feasts lies a bustling street food culture. Coal-grilled Tujji skewers, deep-fried lotus stems, and rich winter Harissa paste cooked overnight.
            </p>
            <div className="chapter-cta reveal fade-right" style={{ transitionDelay: '0.25s' }}>
              <Link href="/kashmiri-food/street-food" className="btn-ghost focus:outline-none focus:ring-2 focus:ring-[var(--gold)]">Explore street food</Link>
            </div>
          </div>
          <div className="chapter-gallery reveal fade-left">
            <div className="dish-rail">
              {streetFoodDishes.map((dish, idx) => (
                <DishCard key={dish._id || dish.slug} dish={dish} index={idx} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Waza AI Teaser */}
      <WazaAITeaser qaData={wazaExchanges} />
    </div>
  );
}
