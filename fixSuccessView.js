const fs = require('fs');
let code = fs.readFileSync('frontend/app/plan/page.js', 'utf8');

const regex = /if \(confirmedBookingAgency\) \{[\s\S]*?return \([\s\S]*?<div className=\"bg-\[\#05170e\][^>]*>[\s\S]*?<div className=\"max-w-2xl[^>]*>[\s\S]*?\{\/\* Success Icon \*\/\}(?:[^<]|<(?!div className=\"w-28 h-28)|<div className=\"w-28 h-28[^>]*>(?:[^<]|<(?!svg)|<svg[^>]*>(?:[^<]|<(?!path)|<path[^>]*><\/path>|<path[^>]*\/>)*<\/svg>)*<\/div>)*\s*<\/div>\s*\)\;\s*\}/;

const replaceBlock = `if (confirmedBookingAgency) {
    return (
      <div className="bg-[#05170e] text-white min-h-screen font-body relative overflow-x-hidden pt-32 pb-16 flex flex-col items-center justify-center">
        <div className="max-w-2xl mx-auto px-6 text-center z-10 relative flex flex-col items-center">
           {/* Success Icon */}
           <div className="w-28 h-28 bg-emerald-500 text-[#05170e] rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_80px_rgba(16,185,129,0.5)]">
             <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
             </svg>
           </div>
           
           <h1 className="text-4xl md:text-6xl font-display font-medium text-white mb-6">Booking Confirmed!</h1>
           
           <div className="space-y-4 mb-12">
             <p className="text-emerald-100/90 text-xl leading-relaxed">
               Your tour arrangements have been successfully locked in with <strong className="text-emerald-400 font-bold">{confirmedBookingAgency.agencyName}</strong>. 
             </p>
             <p className="text-white/60 text-base max-w-lg mx-auto">
               Their team will review your preferences and contact you as soon as possible to finalize your incredible trip!
             </p>
           </div>

           <Link 
             href="/"
             className="inline-flex items-center gap-2 bg-white text-[#05170e] font-bold text-sm tracking-widest uppercase px-10 py-4 rounded-full hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
           >
             Return to Home
           </Link>
        </div>
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_70%)] pointer-events-none" />
      </div>
    );
  }`;

if (regex.test(code)) {
    code = code.replace(regex, replaceBlock);
    fs.writeFileSync('frontend/app/plan/page.js', code);
    console.log('Fixed with regex.');
} else {
    console.log('Regex did not match.');
}
