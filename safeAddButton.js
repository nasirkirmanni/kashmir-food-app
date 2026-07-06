const fs = require('fs');
let code = fs.readFileSync('frontend/app/plan/page.js', 'utf8');

const targetStr = `             <p className="text-white/60 text-base max-w-lg mx-auto">
               Their team will review your preferences and contact you as soon as possible to finalize your incredible trip!
             </p>
           </div>`;

const replaceStr = `             <p className="text-white/60 text-base max-w-lg mx-auto">
               Their team will review your preferences and contact you as soon as possible to finalize your incredible trip!
             </p>
           </div>

           <Link 
             href="/"
             className="inline-flex items-center gap-2 bg-white text-[#05170e] font-bold text-sm tracking-widest uppercase px-10 py-4 rounded-full hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
           >
             Return to Home
           </Link>`;

if(code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync('frontend/app/plan/page.js', code);
  console.log('Successfully added Return to Home button safely!');
} else {
  console.log('Could not find the target string!');
}
