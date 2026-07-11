import React, { useEffect, useRef, useState } from "react";

export default function RouteFieldNotes({ trail }) {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.2 });

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const fields = [
    { label: "Road condition", value: trail.roadCondition },
    { label: "Fuel", value: trail.fuelInfo },
    { label: "Mobile network", value: trail.networkInfo },
    { label: "Where to stop", value: trail.whereToStop },
    { label: "Avoid in", value: trail.avoidIn },
    { label: "Best time of day", value: trail.bestTimeOfDay }
  ].filter(f => f.value); // Skip any cell whose field is empty

  if (fields.length === 0) return null;

  return (
    <section 
      ref={sectionRef} 
      className={`max-w-[1240px] mx-auto px-10 pt-[150px] pb-[150px] border-t border-[var(--hair)] transition-all duration-1000 ease-[cubic-bezier(.16,1,.3,1)] ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[28px]'}`}
    >
      <div className="font-mono text-[10.5px] tracking-[0.28em] uppercase text-[var(--gold)] mb-5">
        Field notes
      </div>
      <h2 className="font-serif font-normal text-[var(--ivory)] max-w-[16ch]"
          style={{ fontSize: "clamp(30px, 3.6vw, 46px)", lineHeight: 1.1 }}>
        Everything worth knowing before you leave.
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-[var(--hair)] border border-[var(--hair)] mt-[60px]">
        {fields.map((field, idx) => (
          <div key={idx} className="bg-[var(--ink)] py-[34px] px-[40px]">
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--gold)] mb-3.5">
              {field.label}
            </div>
            <div className="text-[15px] text-[var(--ivory)] leading-[1.6] max-w-[42ch]">
              {field.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
