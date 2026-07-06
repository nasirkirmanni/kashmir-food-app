const fs = require('fs');
let code = fs.readFileSync('frontend/app/plan/page.js', 'utf8');

// 1. Import ReviewList
if(!code.includes('ReviewList')) {
  code = code.replace(/import \{ TravelInfoGrid.*?;/, '$&\nimport ReviewList from "@/components/ReviewList";');
}

// 2. Add state
if(!code.includes('agencyReviews')) {
  code = code.replace('const [viewingAgency, setViewingAgency] = useState(null);', 'const [viewingAgency, setViewingAgency] = useState(null);\n  const [agencyReviews, setAgencyReviews] = useState([]);');
}

// 3. Add useEffect to fetch reviews
if(!code.includes('fetchAgencyReviews')) {
  const effect = `
  useEffect(() => {
    if (viewingAgency) {
      request(\`/reviews/agency/\${viewingAgency._id}\`)
        .then(data => setAgencyReviews(data))
        .catch(err => console.error("Failed to load agency reviews", err));
    } else {
      setAgencyReviews([]);
    }
  }, [viewingAgency]);
`;
  code = code.replace('// Fetch collections on mount', effect + '\n\n  // Fetch collections on mount');
}

// 4. Render ReviewList in agency modal
const reviewSection = `
                    {/* Custom Reviews */}
                    <section className="mt-12">
                      <h4 className="text-[var(--saffron)] text-sm font-bold uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                        Traveler Reviews
                        <div className="h-px flex-1 bg-gradient-to-r from-[var(--saffron)]/20 to-transparent"></div>
                      </h4>
                      <ReviewList reviews={agencyReviews} />
                    </section>
`;

if (!code.includes('Traveler Reviews')) {
  code = code.replace(/<\/section>\s*(?=\s*<\/div>\s*\{\/\* Sidebar \*\/})/, '</section>\n' + reviewSection);
}

fs.writeFileSync('frontend/app/plan/page.js', code);
