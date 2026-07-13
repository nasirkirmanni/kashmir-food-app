"use client";

export default function AgencyPitchPanel({ 
  currentStep, 
  agencyName, 
  ownerName, 
  city, 
  yearsInBusiness, 
  logoDataUrl 
}) {
  const showPreview = currentStep >= 2;

  const displayAgencyName = agencyName || 'Your Agency Name';
  const displayOwnerName = ownerName ? `Owned by ${ownerName}` : 'Owner name appears here';
  const displayCity = city || 'City';
  const displayYears = yearsInBusiness ? `${yearsInBusiness} yrs` : '— yrs';
  
  const defaultInitial = displayAgencyName.charAt(0).toUpperCase();

  return (
    <div className="pitch-panel">
      <svg className="mini-seal" viewBox="0 0 46 46" fill="none">
        <circle cx="23" cy="23" r="21" stroke="var(--gold-soft)" strokeWidth="1" />
        <circle cx="23" cy="23" r="21" stroke="var(--saffron)" strokeWidth="1" />
        <text x="23" y="28" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="14" fontWeight="600" fill="#12100d">WW</text>
        <defs>
          <radialGradient id="miniSealGrad" cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#e6bd7a" />
            <stop offset="55%" stopColor="var(--saffron)" />
            <stop offset="100%" stopColor="#b5693a" />
          </radialGradient>
        </defs>
      </svg>

      <div className="pitch-eyebrow">For Travel Partners</div>
      <h1 className="pitch-headline">Your next booking is already <span className="accent">searching</span> for you.</h1>
      <p className="pitch-sub">Every day, travelers use Wazwan Way and Waza AI to plan their Kashmir trip. Agencies who list here are the ones they find first.</p>

      <div className="founding-panel">
        <div className="founding-badge-row"><span className="dot"></span><span>Now Onboarding — Founding Partners</span></div>
        <h4>Be one of the first.</h4>
        <p>We're building our travel partner network from the ground up, starting with a small founding cohort. List now and your agency keeps <b>Founding Partner</b> status permanently — priority placement in Waza AI's recommendations and on the homepage, locked in before it's ever a paid tier.</p>
      </div>

      <div className={`preview-block ${showPreview ? 'show' : ''}`}>
        <div className="preview-label"><span className="dot"></span> How travelers will see you</div>
        <div className="preview-card">
          <div className="preview-top">
            <div className="preview-avatar" id="previewAvatar">
              {logoDataUrl ? (
                <img src={logoDataUrl} alt="Agency logo" />
              ) : (
                defaultInitial
              )}
            </div>
            <div>
              <div className="preview-name">{displayAgencyName}</div>
              <div className="preview-owner">{displayOwnerName}</div>
            </div>
            <div className="preview-badge">Founding Partner</div>
          </div>
          <div className="preview-meta">
            <div>📍 <b>{displayCity}</b></div>
            <div>🏛 <b>{displayYears}</b></div>
          </div>
        </div>
      </div>

      <div className={`testimonial-note ${showPreview ? 'show' : ''}`}>
        <b>Note:</b> A real partner testimonial and photo will go here once you have one on file. We don't publish placeholder quotes as if they were real — it's the fastest way to lose a travel partner's trust before they've even signed up.
      </div>
    </div>
  );
}
