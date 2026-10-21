"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import { endpoints, request } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import JsonLd, { buildRecipeSchema } from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { BackIcon, useGoBack } from "@/components/BackButton";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import DishNotes from "@/components/DishNotes";
import { resolveContentPhoto } from "@/lib/contentImages";
import { sanitizeDish } from "@/lib/dishContent";
import { relatedReadingForDish } from "@/data/relatedReading";
import { dishNotesFor } from "@/data/dishNotes";
import { coreSevenStoryForDish } from "@/data/coreSevenSeries";
import styles from "@/components/dish/dishPage.module.css";

// Only needed after a tap, so they load then rather than with the page.
const DishRecipeModal = dynamic(() => import("@/components/dish/DishRecipeModal"), { ssr: false });
const AuthRequiredModal = dynamic(() => import("@/components/AuthRequiredModal"), { ssr: false });

function HeartIcon({ filled }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.4 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.6 0 5.6 3.5 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

/** Highlights the chip of the section being read, without a scroll listener. */
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0] || null);
  const key = ids.join("|");
  useEffect(() => {
    if (!ids.length || !("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return active;
}

export default function DishDetailClient({ initialDish = null, entity = null }) {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [dishRecord, setDish] = useState(initialDish);
  // Seed-script boilerplate (generic history, tips, "veg dish" descriptions) is
  // removed before display; the hand-written recipe intro is used instead.
  const dish = useMemo(() => sanitizeDish(dishRecord), [dishRecord]);
  const [loading, setLoading] = useState(!initialDish);
  const [error, setError] = useState(null);

  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [authContext, setAuthContext] = useState(null);
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);

  useEffect(() => {
    if (!params.slug) return;
    if (dish && (dish.slug === params.slug || dish._id === params.slug)) {
      if (/^[0-9a-fA-F]{24}$/.test(params.slug) && dish.slug) router.replace(`/dishes/${dish.slug}`);
      return;
    }
    setLoading(true);
    setError(null);
    request(endpoints.dish(params.slug))
      .then((data) => {
        setDish(data);
        if (/^[0-9a-fA-F]{24}$/.test(params.slug) && data.slug) router.replace(`/dishes/${data.slug}`);
      })
      .catch((err) => {
        console.error("Failed to fetch dish:", err);
        setError("We couldn't load this dish. Please try again.");
        setDish(null);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug, router]);

  useEffect(() => {
    if (!user || !dish) return;
    request(endpoints.favorites)
      .then((favs) => setIsFavorite(favs.some((f) => f.item?._id === dish._id || f.item === dish._id)))
      .catch(console.error);
  }, [user, dish]);

  const goBack = useGoBack();

  const toggleFavorite = async () => {
    if (!user) {
      setAuthContext("favorite");
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      await request(endpoints.favorites, {
        method: isFavorite ? "DELETE" : "POST",
        body: JSON.stringify({ itemId: dish._id, itemType: "dish" }),
      });
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error(err);
      setSaveError("Couldn't update your saved dishes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // The sign-in prompt sits above everything, with the page held still behind it.
  useEffect(() => {
    if (!authContext) return undefined;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [authContext]);

  const requireRecipeAuth = useCallback(() => {
    setRecipeModalOpen(false);
    setAuthContext("recipe");
  }, []);

  const hasRecipe = dish?.recipe?.ingredients?.length > 0 && dish?.recipe?.instructions?.length > 0;
  const relatedReading = dish ? relatedReadingForDish(dish) : [];
  const notes = dish ? dishNotesFor(dish.slug) : null;
  const hasHistory = Boolean(dish?.history || dish?.touristTip);

  const sections = [
    hasHistory && { id: "history", label: dish?.history ? "History" : "Tip" },
    { id: "where", label: "Where to eat" },
    notes?.sections?.length && { id: "about", label: "More" },
    hasRecipe && { id: "recipe", label: "Recipe" },
    relatedReading.length && { id: "reading", label: "Read more" },
  ].filter(Boolean);
  const activeSection = useActiveSection(dish ? sections.map((s) => s.id) : []);

  // Keep the current section's chip in view as the reader moves down the page.
  const chipBarRef = useRef(null);
  useEffect(() => {
    const bar = chipBarRef.current;
    const chip = bar?.querySelector('[aria-current="true"]');
    if (!bar || !chip || bar.scrollWidth <= bar.clientWidth) return;
    const left = chip.offsetLeft - (bar.clientWidth - chip.offsetWidth) / 2;
    bar.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [activeSection]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.state} role="status">
          <div>
            <div className={styles.spinner} />
            <p className={`${styles.stateText} mt-4`}>Loading the dish…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dish) {
    return (
      <div className={styles.page}>
        <div className={styles.state}>
          <div>
            <p className={styles.stateText}>{error || "We couldn't find this dish."}</p>
            <button
              type="button"
              className={styles.stateButton}
              onClick={() => (error ? window.location.reload() : router.push("/dishes"))}
            >
              {error ? "Try again" : "See all dishes"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const photo = resolveContentPhoto(dish.image);
  const story = coreSevenStoryForDish(dish.slug);
  const recipeSchema = buildRecipeSchema(dish, { about: entity || undefined });
  const facts = [
    dish.foodType && { term: "Diet", value: dish.foodType },
    dish.spiceLevel && { term: "Spice", value: dish.spiceLevel },
    dish.priceRange && { term: "Price", value: dish.priceRange },
    dish.popularityRating && { term: "Popularity", value: `${dish.popularityRating} / 5` },
  ].filter(Boolean);
  const recipe = dish.recipe || {};
  const recipeStats = [
    recipe.prepTimeMinutes && { term: "Prep", value: `${recipe.prepTimeMinutes} min` },
    recipe.cookTimeMinutes && { term: "Cook", value: `${recipe.cookTimeMinutes} min` },
    recipe.servings && { term: "Serves", value: recipe.servings },
    recipe.difficulty && { term: "Level", value: recipe.difficulty },
    recipe.tradition && { term: "Tradition", value: recipe.tradition },
  ].filter(Boolean);
  const kashmiriName =
    recipe.kashmiriName && recipe.kashmiriName.trim().toLowerCase() !== dish.name.trim().toLowerCase() ? recipe.kashmiriName : null;
  const eyebrow = [dish.category, story?.place].filter(Boolean).join(" · ");

  const openRecipe = () => {
    if (hasRecipe) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.getElementById("recipe")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    } else {
      setRecipeModalOpen(true);
    }
  };

  return (
    <div className={styles.page}>
      {recipeSchema ? <JsonLd data={recipeSchema} /> : null}

      <header className={photo ? styles.hero : `${styles.hero} ${styles.heroPlain}`}>
        {photo ? (
          <div className={styles.media}>
            <ImageWithSkeleton
              src={photo}
              alt={dish.name}
              fill
              priority
              sizes="(min-width: 768px) 46vw, 100vw"
              className={styles.mediaImg}
            />
            <div className={styles.mediaShade} aria-hidden="true" />
          </div>
        ) : null}

        <div className={photo ? styles.heroBody : `${styles.heroBody} ${styles.heroBodyPlain}`}>
          <div className={styles.crumbs}>
            <Breadcrumbs
              items={[
                { name: "Home", href: "/" },
                { name: "Dishes", href: "/dishes" },
                { name: dish.name, href: `/dishes/${dish.slug}` },
              ]}
            />
          </div>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h1 className={styles.title}>
            {dish.name}
            {kashmiriName ? <span className={styles.kashmiri}>{kashmiriName}</span> : null}
          </h1>
          {dish.fullDescription ? <p className={styles.summary}>{dish.fullDescription}</p> : null}

          {facts.length ? (
            <dl className={styles.facts} style={{ "--fact-count": facts.length }}>
              {facts.map((fact) => (
                <div key={fact.term}>
                  <dt>{fact.term}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={openRecipe}>
              {hasRecipe ? "Go to the recipe" : "Ask Waza for a recipe"}
            </button>
            <button
              type="button"
              className={styles.secondary}
              onClick={toggleFavorite}
              disabled={isSaving}
              aria-pressed={isFavorite}
            >
              <HeartIcon filled={isFavorite} />
              {isSaving ? "Saving…" : isFavorite ? "Saved" : "Save"}
            </button>
          </div>
          {saveError ? (
            <p className={styles.saveError} role="alert">
              {saveError}
            </p>
          ) : null}
          {isFavorite ? (
            <Link href="/favorites" className={styles.savedLink}>
              See your saved dishes
            </Link>
          ) : null}

          {story ? (
            <Link href={`/blog/${story.slug}`} className={styles.story}>
              <span className={styles.eyebrow}>The full story</span>
              <span className={styles.storyTitle}>{story.title}</span>
              <span className={styles.storyCta}>
                Read it <ArrowIcon />
              </span>
            </Link>
          ) : null}
        </div>
      </header>

      {sections.length > 1 ? (
        <nav className={styles.sectionNav} aria-label="On this page" data-back-bar="">
          <div className={styles.sectionNavInner} ref={chipBarRef}>
            <button type="button" className={styles.navBack} onClick={goBack} aria-label="Back">
              <BackIcon />
            </button>
            <span className={styles.navDivider} aria-hidden="true" />
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={styles.chip}
                aria-current={activeSection === section.id ? "true" : undefined}
              >
                {section.label}
              </a>
            ))}
          </div>
        </nav>
      ) : null}

      <div className={styles.body}>
        {hasHistory ? (
          <section id="history" className={styles.section} aria-labelledby="history-heading">
            {dish.history ? (
              <>
                <p className={styles.eyebrow}>History</p>
                <h2 id="history-heading" className={styles.sectionTitle}>
                  {dish.name} in Kashmiri tradition
                </h2>
                <div className={styles.prose}>
                  {dish.history
                    .split(/\n{2,}/)
                    .filter(Boolean)
                    .map((para) => (
                      <p key={para.slice(0, 40)}>{para}</p>
                    ))}
                </div>
              </>
            ) : (
              <>
                <p className={styles.eyebrow}>Before you order</p>
                <h2 id="history-heading" className={styles.sectionTitle}>
                  Eating {dish.name}
                </h2>
              </>
            )}
            {dish.touristTip ? (
              <div className={styles.callout}>
                <p className={styles.eyebrow}>Tip</p>
                <p>{dish.touristTip}</p>
              </div>
            ) : null}
          </section>
        ) : null}

        <section id="where" className={styles.section} aria-labelledby="where-heading">
          <p className={styles.eyebrow}>Where to try it</p>
          <h2 id="where-heading" className={styles.sectionTitle}>
            Restaurants serving {dish.name}
          </h2>
          {dish.restaurants?.length ? (
            <ul className={styles.rows}>
              {dish.restaurants.map((restaurant) => (
                <li key={restaurant._id || restaurant.name}>
                  <Link href={`/restaurants/${restaurant.slug || restaurant._id}`} prefetch={false} className={styles.rowLink}>
                    <span>
                      <span className={styles.rowName}>{restaurant.name}</span>
                      {restaurant.location ? <span className={styles.rowMeta}>{restaurant.location}</span> : null}
                    </span>
                    <span className={styles.rowArrow}>
                      <ArrowIcon />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.text}>
              No restaurant on Wazwan Way lists {dish.name} yet.{" "}
              <Link href="/restaurants" prefetch={false} className="text-[#c9a063] underline underline-offset-4">
                Browse restaurants
              </Link>
            </p>
          )}
        </section>

        <DishNotes dishName={dish.name} notes={notes} id="about" />
      </div>

      {hasRecipe ? (
        <div className={`${styles.body} ${styles.recipeBody}`}>
          <section id="recipe" className={styles.section} aria-labelledby="recipe-heading">
            <p className={styles.eyebrow}>The recipe</p>
            <h2 id="recipe-heading" className={styles.sectionTitle}>
              How to make {dish.name}
            </h2>
            {recipe.intro && recipe.intro !== dish.fullDescription ? <p className={`${styles.text} ${styles.prose}`}>{recipe.intro}</p> : null}
            {recipeStats.length ? (
              <dl className={styles.stats} style={{ "--stat-count": recipeStats.length }}>
                {recipeStats.map((stat) => (
                  <div key={stat.term}>
                    <dt>{stat.term}</dt>
                    <dd>{stat.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <div className={styles.recipeGrid}>
              <div className={styles.recipeAside}>
                <h3 className={styles.subTitle}>Ingredients</h3>
                <p className={styles.checkHint}>Tap an ingredient to tick it off.</p>
                <ul className={styles.ingredients}>
                  {recipe.ingredients.map((ingredient, i) => (
                    <li key={`${i}-${ingredient}`}>
                      <label className={styles.ingredient}>
                        <input type="checkbox" className={styles.ingredientInput} />
                        <span className={styles.check} aria-hidden="true">
                          <CheckIcon />
                        </span>
                        <span className={styles.ingredientText}>{ingredient}</span>
                      </label>
                    </li>
                  ))}
                </ul>
                {recipe.wazaTips?.length ? (
                  <div className={styles.callout}>
                    <h3 className={styles.eyebrow}>Waza tips</h3>
                    <ul>
                      {recipe.wazaTips.map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              <div>
                <h3 className={styles.subTitle}>Method</h3>
                <ol className={styles.steps}>
                  {recipe.instructions.map((step, i) => (
                    <li key={`${i}-${step.slice(0, 24)}`}>
                      <span className={styles.stepNumber} aria-hidden="true">
                        {i + 1}
                      </span>
                      <p>{step}</p>
                    </li>
                  ))}
                </ol>
                {recipe.commonMistakes?.length ? (
                  <>
                    <h3 className={styles.subTitle}>Common mistakes</h3>
                    <ul className={styles.mistakes}>
                      {recipe.commonMistakes.map((mistake) => (
                        <li key={mistake}>
                          <span className={styles.mistakeMark} aria-hidden="true">
                            ×
                          </span>
                          <span>{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
                {recipe.homeAdaptation ? (
                  <>
                    <h3 className={styles.subTitle}>At home</h3>
                    <p className={styles.text}>{recipe.homeAdaptation}</p>
                  </>
                ) : null}
                {recipe.servingSuggestions ? (
                  <>
                    <h3 className={styles.subTitle}>Serving</h3>
                    <p className={styles.text}>{recipe.servingSuggestions}</p>
                  </>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {relatedReading.length ? (
        <div className={styles.body}>
          <section id="reading" className={styles.section} aria-labelledby="reading-heading">
            <p className={styles.eyebrow}>Further reading</p>
            <h2 id="reading-heading" className={styles.sectionTitle}>
              Read more about {dish.name}
            </h2>
            <ul className={styles.rows}>
              {relatedReading.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} prefetch={false} className={styles.rowLink}>
                    <span className={styles.rowName}>{link.title}</span>
                    <span className={styles.rowArrow}>
                      <ArrowIcon />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}

      {recipeModalOpen ? (
        <DishRecipeModal dishName={dish.name} onClose={() => setRecipeModalOpen(false)} onRequireAuth={requireRecipeAuth} />
      ) : null}

      {authContext
        ? createPortal(
        <AuthRequiredModal
          titleLine1={authContext === "recipe" ? "Unlock Secret" : "Save Your"}
          titleLine2={authContext === "recipe" ? "Recipes" : "Favorites"}
          message={
            authContext === "recipe"
              ? "You've explored your 2 free recipes.\nSign in or create an account to unlock unlimited authentic Kashmiri recipes."
              : "Sign in or create an account to save dishes to your favorites."
          }
          onClose={() => setAuthContext(null)}
          onSuccess={() => {
            const wasFavorite = authContext === "favorite";
            setAuthContext(null);
            if (wasFavorite && !isFavorite) toggleFavorite();
          }}
        />,
        document.body,
      )
        : null}
    </div>
  );
}
