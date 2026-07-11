const fs = require('fs');
let js = fs.readFileSync('frontend/app/explore/ExploreClient.js', 'utf8');

const newFooter = `<footer className="site-footer section-ambient">
  <div className="amb-bg"><img src="/images/hillside-village.jpg" alt="" /><div className="amb-scrim"></div></div>

  <div className="container relative z-10 pt-20 pb-10 text-center">
    <div className="mb-8">
      <a href="/" className="font-display text-[2.5rem] font-semibold uppercase leading-[0.9] tracking-[0.15em] text-[#F5F5F0]">
        <span className="block" style={{fontFamily: 'Fraunces', letterSpacing: '0.15em'}}>Wazwan</span>
        <span className="block text-[#C8A46A]" style={{fontFamily: 'Fraunces', letterSpacing: '0.15em'}}>Way</span>
      </a>
    </div>
    <p className="mx-auto max-w-md font-display text-xl font-light italic text-[#F5F5F0]/70" style={{fontFamily: 'Fraunces'}}>
      The definitive guide to Kashmir's greatest culinary heritage.
    </p>
    <div className="mt-16 mb-16 flex flex-wrap justify-center gap-x-8 gap-y-6 text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-[#F5F5F0]/80 max-w-4xl mx-auto leading-loose" style={{fontFamily: 'Inter'}}>
      <a href="/how-to-experience" className="transition-colors duration-300 hover:text-[#C8A46A]">Experience</a>
      <a href="/kashmiri-food" className="transition-colors duration-300 hover:text-[#C8A46A]">Kashmiri Food</a>
      <a href="/dishes" className="transition-colors duration-300 hover:text-[#C8A46A]">Dishes</a>
      <a href="/restaurants" className="transition-colors duration-300 hover:text-[#C8A46A]">Restaurants</a>
      <a href="/recipes" className="transition-colors duration-300 hover:text-[#C8A46A]">Recipes</a>
      <a href="/plan" className="transition-colors duration-300 hover:text-[#C8A46A]">Visit Kashmir</a>
      <a href="/blog" className="transition-colors duration-300 hover:text-[#C8A46A]">Blog</a>
      <a href="/about" className="transition-colors duration-300 hover:text-[#C8A46A]">About</a>
      <a href="/contact" className="transition-colors duration-300 hover:text-[#C8A46A]">Contact</a>
      <a href="/privacy" className="transition-colors duration-300 hover:text-[#C8A46A]">Privacy Policy</a>
      <a href="/login" className="transition-colors duration-300 hover:text-[#C8A46A]">Login</a>
    </div>
    <div className="border-t border-[#F5F5F0]/10 pt-8 flex flex-col items-center justify-between gap-4 sm:flex-row text-[0.7rem] uppercase tracking-widest text-[#F5F5F0]/70" style={{fontFamily: 'Inter'}}>
      <p>© 2026 Wazwan Way. All rights reserved.</p>
      <div className="flex gap-4">
        <a href="https://www.facebook.com/profile.php?id=61590712421415" target="_blank" rel="noreferrer" className="transition-colors duration-300 hover:text-[#C8A46A]">Facebook</a>
        <a href="https://x.com/wazwanway" target="_blank" rel="noreferrer" className="transition-colors duration-300 hover:text-[#C8A46A]">X</a>
      </div>
      <p>Designed for the culture.</p>
    </div>
  </div>
</footer>`;

const regex = /<footer className="site-footer section-ambient">[\s\S]*?<\/footer>/;
js = js.replace(regex, newFooter);
fs.writeFileSync('frontend/app/explore/ExploreClient.js', js);
console.log('Footer replaced successfully!');
