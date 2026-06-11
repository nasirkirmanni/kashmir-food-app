"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

const itinerariesData = [
  {
    id: "srinagar-heritage",
    title: "3-Day Srinagar Food & Heritage Tour",
    duration: "3 Days",
    focus: "Kandur Bakeries, Street-side Tujji, & Classic Wazwan Institutions",
    summary: "Immerse yourself in the culinary core of Srinagar. Walk the ancient lanes of the Old City, sip Noon Chai fresh from neighborhood tandoors, and feast on multi-course Wazwan dinners at legendary heritage dining halls.",
    days: [
      {
        day: 1,
        title: "Kandur Breads & Historic Wazwan",
        description: "Begin your journey in Old City Srinagar (Shehr-e-Khas). Watch the Kandur bakers throw flatbreads into underground clay tandoors, visit Jamia Masjid, and end with a royal Wazwan feast.",
        activities: [
          "Morning walk through the spice markets near Maharaj Gunj.",
          "Stop at a traditional Kandur-wan for hot Girda bread paired with salted Noon Chai.",
          "Visit the grand 14th-century Jamia Masjid."
        ],
        culinaryHighlights: "Girda bread, Noon Chai, Rogan Josh, Rista",
        recommendedStops: "Ahdoos Restaurant (Residency Road) & local Kandur-wans in Lal Bazar."
      },
      {
        day: 2,
        title: "Dal Lake Shikara Ride & Tujji Grills",
        description: "Spend your day on the water. Glide past floating vegetable markets, explore Mughal Gardens, and dine on coal-grilled street skewers along the lake banks.",
        activities: [
          "Early morning Shikara ride to the floating vegetable gardens on Dal Lake.",
          "Explore the terraced Shalimar Bagh and Nishat Bagh.",
          "Evening walk near Khayam Chowk for local street barbecue."
        ],
        culinaryHighlights: "Mutton Tujji wrapped in hot Lavas bread, Nadru Monji (lotus root fritters)",
        recommendedStops: "Khayam Chowk Barbecue Street & Imran Cafeteria."
      },
      {
        day: 3,
        title: "Harissa Tradition & Houseboat Dinner",
        description: "Taste Kashmir's ultimate slow-cooked winter breakfast, explore the Hazratbal Shrine, and experience a candlelit dinner on a wooden Dal Lake houseboat.",
        activities: [
          "Dawn visit to a Harissa shop in Ali Kadal to watch the slow-churned meat paste being served with local Czochworu bread.",
          "Visit the white marble Hazratbal Shrine overlooking Dal Lake.",
          "Relaxing evening dinner on a historic wooden houseboat."
        ],
        culinaryHighlights: "Kashmiri Harissa, Kashmiri Pulao, Saffron Kahwa",
        recommendedStops: "Hazratbal local stalls & Mughal Darbar Restaurant."
      }
    ]
  },
  {
    id: "alpine-trout",
    title: "5-Day Alpine Meadows & River Trout Trail",
    duration: "5 Days",
    focus: "Mountain Stream Trout, Forest Yakhni, & High-altitude Tea Stalls",
    summary: "Escape into the valleys of Pahalgam and Gulmarg. Dine beside rushing mountain streams, taste fresh trout caught directly from the Lidder River, and experience warming spice-heavy stews in local wooden cottages.",
    days: [
      {
        day: 1,
        title: "Srinagar to Gulmarg: High Altitude Saffron Kahwa",
        description: "Drive to the high meadows of Gulmarg. Experience spectacular cable-car views of the Apharwat peaks and warm up with cardamom-scented tea.",
        activities: [
          "Scenic drive through the willow and pine forests up to Gulmarg.",
          "Take the Gulmarg Gondola ride to Apharwat peak for snow views.",
          "Warm up at a high-altitude tea shop."
        ],
        culinaryHighlights: "Saffron Kahwa with crushed almonds, Dum Aelve (spiced baby potatoes)",
        recommendedStops: "Alpine Resort Dining & local market dhabas."
      },
      {
        day: 2,
        title: "Gulmarg Alpine Eats & Pine Barbecues",
        description: "Spend the day hiking around Gulmarg's meadows and enjoy comforting Kashmiri vegetarian delicacies designed for cool mountain climates.",
        activities: [
          "Horseback ride across the Gulmarg Golf Course meadows.",
          "Visit the historic St. Mary's Church and Baba Reshi Shrine.",
          "Cozy log-fire dinner in a forest resort cottage."
        ],
        culinaryHighlights: "Ruwangan Chaman (paneer in spiced tomato gravy), Gogji Raakh (turnip stew)",
        recommendedStops: "Nedou's Dining Hall."
      },
      {
        day: 3,
        title: "Gulmarg to Pahalgam: Apple Orchards & Trout Springs",
        description: "Travel to the valley of shepherds, Pahalgam. Pass through saffron fields in Pampore and apple orchards in Anantnag, stopping to dine along the Lidder River.",
        activities: [
          "Walk through the saffron fields of Pampore (seasonal).",
          "Scenic drive along the Lidder River to Pahalgam.",
          "Dinner beside the rushing mountain streams."
        ],
        culinaryHighlights: "Pan-fried mountain stream Lidder Trout, Nadru Yakhni",
        recommendedStops: "Verinag Springs Restaurant & Trout Beat Restaurant."
      },
      {
        day: 4,
        title: "Pahalgam Alpine Meadows & Sheepfold Stews",
        description: "Explore the beautiful Aru and Betaab valleys. Discover the traditional nomadic shepherd routes and dine on slow-cooked mutton stews in the evening.",
        activities: [
          "Explore the quiet meadows of Aru Valley.",
          "Walk through the pine forests of Betaab Valley.",
          "Evening bonfire dinner with traditional local music."
        ],
        culinaryHighlights: "Al-Hachh Mutton (lamb cooked with sun-dried bottle gourd), Haak Saag",
        recommendedStops: "Pahalgam Pine Resort & Lidder View Restaurant."
      },
      {
        day: 5,
        title: "Pahalgam Springs & Local Farm Cheese",
        description: "Visit the cascading springs of Kokernag, see Asia's largest trout fishery, and try the local shepherd cheese before returning to Srinagar.",
        activities: [
          "Visit the beautiful botanical gardens and springs of Kokernag.",
          "Walk through the trout hatchery ponds of Kokernag.",
          "Sample local fresh cheese (Kalari) at local markets."
        ],
        culinaryHighlights: "Grilled Kalari Cheese, Kokernag Trout Fry, Noon Chai",
        recommendedStops: "Kokernag Garden Cafe."
      }
    ]
  },
  {
    id: "wilderness-frontier",
    title: "7-Day Wilderness Culture & Frontier Valley Explorer",
    duration: "7 Days",
    focus: "Gurez Border Cuisine, Sonamarg Glacier Rivers, & Old Srinagar Food Walks",
    summary: "The ultimate expedition for the adventurous traveler. Traverse high-altitude passes to the border valley of Gurez, dine on smoke-infused mountain barbecues, and explore the ancient food trails of Srinagar's historical bazaars.",
    days: [
      {
        day: 1,
        title: "Srinagar to Sonamarg: Glacier River Trout",
        description: "Ascend to the meadow of gold, Sonamarg. Hike to Thajiwas Glacier and enjoy fresh river trout cooked over open firewood stoves.",
        activities: [
          "Drive along the Sindh River valley to Sonamarg.",
          "Hike or take a pony ride to the foot of Thajiwas Glacier.",
          "Evening tea beside the Sindh River rapids."
        ],
        culinaryHighlights: "Sonamarg Trout Fish Fry, Shala-Kanti",
        recommendedStops: "Glacier Heights Restaurant & roadside trout shacks."
      },
      {
        day: 2,
        title: "Sonamarg Mountain Meadows & Alpine Broths",
        description: "Walk the meadow trails of Sonamarg and warm up with local slow-cooked lentil and turnip broths prepared by mountain nomads.",
        activities: [
          "Hike to the scenic Baltal valley viewpoints.",
          "Interact with local shepherds and watch traditional butter churning.",
          "Dinner featuring warming ginger-cardamom infusions."
        ],
        culinaryHighlights: "Muji Gaad (fish with radish), Gogji Mutton",
        recommendedStops: "Sonamarg Main Market Dhabas."
      },
      {
        day: 3,
        title: "Sonamarg to Gurez: Crossing the Razdan Pass",
        description: "Embark on the dramatic drive to the remote frontier valley of Gurez, climbing over the spectacular Razdan Pass at 11,672 feet.",
        activities: [
          "Drive over Razdan Pass for views of Harmukh peak.",
          "Descend into Gurez Valley along the turquoise Kishanganga River.",
          "Walk through the wood-and-mud hamlet of Dawar."
        ],
        culinaryHighlights: "Black Cumin Chai, Local Buckwheat Roti",
        recommendedStops: "Dawar local mess halls & Gurez Tourist Lodge."
      },
      {
        day: 4,
        title: "Gurez Valley Frontier Exploration",
        description: "Explore the ancient wooden villages under the massive peak of Habba Khatoon and try the local frontier food influenced by Dardic mountain cultures.",
        activities: [
          "Hike to the slopes of Habba Khatoon peak.",
          "Visit the wooden huts of the ancient Dard-Shina community.",
          "Fireside storytelling with local elders."
        ],
        culinaryHighlights: "Kishanganga river fish, local organic turnip stews",
        recommendedStops: "Local homestays in Dawar."
      },
      {
        day: 5,
        title: "Gurez to Srinagar: Return through the High Passes",
        description: "Return from the borderlands back to Srinagar. Stop at lakeside dhabas near Wular Lake for waterchestnut street-side delicacies.",
        activities: [
          "Scenic return drive across Razdan Pass.",
          "Stop at viewpoints overlooking Wular Lake, Asia's largest freshwater lake.",
          "Arrive back in Srinagar for a relaxing evening."
        ],
        culinaryHighlights: "Nadru Monji (lotus fritters), Fried Wular Lake Fish",
        recommendedStops: "Wular Lake View Restaurant."
      },
      {
        day: 6,
        title: "Old City Srinagar Culinary Deep Dive",
        description: "Dedicate your day entirely to the ancient food walks of historical Srinagar, exploring century-old spice traders and traditional dessert shops.",
        activities: [
          "Guided street walk through Zaina Kadal bazaar.",
          "Explore the spice warehouse cellars of Maharaj Gunj.",
          "Visit a traditional copper workshop to see Samovars being hammered."
        ],
        culinaryHighlights: "Shufta (honey, nut, and cheese dessert), Kabargah, Rista",
        recommendedStops: "Mughal Darbar (Lal Chowk) & Old City Halwai stalls."
      },
      {
        day: 7,
        title: "Celebration Wazwan Feast",
        description: "Conclude your epic journey with the ultimate 36-course Kashmiri Wazwan feast, learning the intricate etiquette of dining from the shared copper Trami.",
        activities: [
          "Visit a local waza (chef) kitchen to see the wood-fire cooking process.",
          "Experience a formal Wazwan lunch, eating with your hands from a Trami.",
          "Final evening walk along Boulevard Road, Dal Lake."
        ],
        culinaryHighlights: "Gushtaba, Tabak Maaz, Marchwangan Korma, Aab Gosh",
        recommendedStops: "Ahdoos Restaurant & Lhasa Restaurant."
      }
    ]
  }
];

export default function ItinerariesPage() {
  const [activeTrailId, setActiveTrailId] = useState(itinerariesData[0].id);

  const activeTrail = itinerariesData.find((t) => t.id === activeTrailId);

  return (
    <div className="wazwan-shell relative min-h-screen pb-24">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.06),transparent_60%)] pointer-events-none" />

      {/* Hero */}
      <section className="place-hero !grid-cols-1 md:!grid-cols-[1fr_auto] gap-8 items-center border-b border-white/5 pb-12">
        <div>
          <span className="place-eyebrow">Hand-Crafted Food Trails</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tight mb-4">
            Culinary Itineraries
          </h1>
          <p className="text-white/70 max-w-2xl text-base md:text-lg leading-relaxed">
            Follow the curated trails mapped by Waza AI. From historic Wazwan dining rooms in Srinagar to alpine trout catches in mountain streams, explore Kashmir's culinary geography.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/" className="wazwan-btn-ghost text-xs uppercase tracking-widest font-bold border border-white/10 px-6 py-3 rounded-full hover:border-white/30">
            &larr; Back
          </Link>
          <Link href="/plan" className="wazwan-btn-primary rounded-full px-6 py-3 text-xs uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:scale-105 transition-transform">
            Custom Planner
          </Link>
        </div>
      </section>

      {/* Itinerary Selection Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col md:flex-row gap-4 p-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
          {itinerariesData.map((trail) => (
            <button
              key={trail.id}
              onClick={() => setActiveTrailId(trail.id)}
              className={`flex-1 text-center md:text-left p-4 rounded-xl transition-all border ${
                activeTrailId === trail.id
                  ? "bg-[var(--saffron)] border-[var(--saffron)] text-black shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                  : "bg-transparent border-transparent text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="text-[0.62rem] font-bold uppercase tracking-wider mb-1 opacity-80">
                {trail.duration}
              </div>
              <div className="font-display text-base font-semibold leading-snug">
                {trail.title}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Itinerary Details */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {activeTrail && (
          <div>
            {/* Trail Intro Card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-md mb-12">
              <span className="text-[var(--saffron)] text-[0.65rem] font-bold tracking-[0.25em] uppercase block mb-3">
                Selected Itinerary
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-medium text-white mb-4">
                {activeTrail.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4 border-t border-b border-white/10 py-5 my-6 text-sm">
                <div>
                  <span className="text-white/40 block text-xs uppercase tracking-wider">Focus Area:</span>
                </div>
                <div>
                  <span className="text-white/80 font-medium">{activeTrail.focus}</span>
                </div>
              </div>
              <p className="text-white/70 leading-relaxed text-sm md:text-base">
                {activeTrail.summary}
              </p>
            </div>

            {/* Timeline Layout */}
            <div className="relative border-l border-white/10 pl-6 md:pl-10 ml-4 md:ml-6 space-y-12">
              {activeTrail.days.map((dayPlan, idx) => (
                <div key={dayPlan.day} className="relative">
                  {/* Bubble marker */}
                  <div className="absolute -left-[39px] md:-left-[55px] top-0 flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-[var(--saffron)] text-black font-bold font-display text-xs md:text-sm shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                    {dayPlan.day}
                  </div>

                  {/* Day Content */}
                  <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-6 md:p-8 shadow-xl hover:border-white/10 transition-all">
                    <span className="text-white/40 text-[0.6rem] font-bold uppercase tracking-wider block mb-1">
                      Day 0{dayPlan.day} Plan
                    </span>
                    <h3 className="text-xl md:text-2xl font-display font-medium text-white mb-4">
                      {dayPlan.title}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed mb-6">
                      {dayPlan.description}
                    </p>

                    {/* Activities check list */}
                    <div className="mb-6">
                      <h4 className="text-[0.62rem] font-bold uppercase tracking-wider text-[var(--saffron)] mb-3">
                        Suggested Activities
                      </h4>
                      <ul className="space-y-2">
                        {dayPlan.activities.map((act, actIdx) => (
                          <li key={actIdx} className="flex gap-2 items-start text-xs text-white/80">
                            <svg className="w-4 h-4 text-[var(--saffron)] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Culinary highlight panel */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-5 mt-5 text-xs">
                      <div>
                        <span className="text-white/40 block mb-1">Culinary Highlights</span>
                        <span className="text-white/90 font-medium">{dayPlan.culinaryHighlights}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block mb-1">Recommended Stops</span>
                        <span className="text-white/90 font-medium">{dayPlan.recommendedStops}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer buttons */}
            <div className="mt-16 text-center bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
              <h3 className="text-xl font-display text-white mb-2">Want to customize this trail?</h3>
              <p className="text-white/60 text-sm max-w-md mx-auto mb-6">
                Tell Waza AI about your flight times, hotel location, or dietary preferences to build a tailored journey.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/plan" className="wazwan-btn-primary rounded-full px-6 py-3 text-xs uppercase tracking-widest font-bold">
                  Use Trip Planner
                </Link>
                <Link href="/waza-ai" className="wazwan-btn-ghost rounded-full px-6 py-3 text-xs uppercase tracking-widest font-bold border border-white/10 hover:border-white/20">
                  Ask Waza AI &rarr;
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
