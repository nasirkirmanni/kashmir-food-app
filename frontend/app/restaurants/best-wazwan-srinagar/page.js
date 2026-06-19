import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { restaurantGuides } from "@/data/restaurantGuides";

export const metadata = {
  title: "Best Kashmiri Food in Srinagar: Wazwan, Bakery, Tea, and Street Food",
  description: "Where to eat Wazwan, which bakery to visit, the best spot for Noon Chai and Kahwa, and where Srinagar's street food actually lives — a locally grounded guide.",
  alternates: {
    canonical: "https://wazwanway.com/restaurants/best-wazwan-srinagar",
  },
};

export default function BestWazwanSrinagarPage() {
  const article = restaurantGuides[0]; // best-wazwan-srinagar is the first guide

  return (
    <div className="min-h-screen pt-28 pb-32 px-4 sm:px-6 flex flex-col items-center page-shell relative">
      <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 via-transparent to-transparent pointer-events-none z-0" />
      
      <article className="w-full max-w-3xl relative z-10">
        <Link 
          href="/restaurants" 
          className="inline-flex items-center gap-2 text-white/50 hover:text-[var(--saffron)] transition-colors mb-10 text-xs sm:text-sm uppercase tracking-wider font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Restaurants
        </Link>
        
        {/* Metadata headers */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6">
          <span className="text-[var(--saffron)] font-bold tracking-[0.15em] uppercase text-[0.65rem] bg-[var(--saffron)]/10 px-3 py-1.5 rounded-full border border-[var(--saffron)]/20">
            Srinagar Food Guide
          </span>
          <span className="flex items-center gap-1.5 text-white/50 text-[0.7rem] uppercase tracking-wider font-semibold">
            <Clock className="w-3.5 h-3.5" /> {article.readTime}
          </span>
        </div>

        <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl text-white mb-8 leading-[1.1] tracking-tight">
          {article.title}
        </h1>
        
        <div className="flex items-center gap-6 text-[0.7rem] uppercase tracking-wider font-bold text-white/60 mb-12 pb-8 border-b border-white/10">
          <span className="flex items-center gap-2">
            <User className="w-4 h-4 text-[var(--saffron)]" /> {article.author}
          </span>
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4" /> {article.date}
          </span>
        </div>
        
        {/* Main article content rendered as markdown */}
        <div className="max-w-none text-white/70 leading-relaxed font-body pb-16 wazwan-article-body">
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="font-display text-3xl sm:text-4xl text-[var(--saffron)] mt-14 mb-6" {...props} />,
              h2: ({node, ...props}) => <h2 className="font-display text-2xl sm:text-3xl text-[var(--saffron)] mt-12 mb-6" {...props} />,
              h3: ({node, ...props}) => <h3 className="font-display text-xl sm:text-2xl text-white mt-10 mb-4" {...props} />,
              p: ({node, ...props}) => <p className="mb-6 text-sm sm:text-base md:text-lg leading-relaxed text-white/70" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-2 text-sm sm:text-base" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 space-y-2 text-sm sm:text-base" {...props} />,
              li: ({node, ...props}) => <li className="marker:text-[var(--saffron)] text-white/75" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
              a: ({node, ...props}) => <a className="text-[var(--saffron)] hover:text-amber-400 underline decoration-white/20 underline-offset-4 font-semibold" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[var(--saffron)] pl-6 italic my-8 text-white/60 text-lg sm:text-xl" {...props} />
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
