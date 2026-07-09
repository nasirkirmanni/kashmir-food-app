export const partnersData = [
  {
    id: "tp-1",
    name: "Kashmir Port",
    rating: 4.8,
    reviews: 124,
    location: "Srinagar, J&K",
    verified: true,
    description: "Premium Kashmir experiences curated by locals. Specializing in Wazwan culinary tours and houseboat stays.",
    image: "/waza-profile.jpg", // Placeholder
    priceLabel: "Standard to Premium",
    social: {
      ig: "@kashmirport",
      igLink: "https://instagram.com/kashmirport",
      fb: "Kashmir Port Tours",
      fbLink: "https://facebook.com/kashmirport",
      phone: "+91 98765 43210"
    },
    uniqueSellingPoints: [
      "Exclusive access to multi-generational Wazwan chef homes.",
      "Private luxury houseboat stays on Dal Lake.",
      "Local artisan and craft tours unavailable to standard tourists.",
      "24/7 dedicated local concierge."
    ],
    gallery: [
      "/dal.jpg",
      "/wazwan-hero.jpg"
    ]
  }
];

export function getPartnerById(id) {
  return partnersData.find(p => p.id === id);
}
