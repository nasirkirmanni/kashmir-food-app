const fs = require('fs');
let file = fs.readFileSync('frontend/components/HomePageClient.js', 'utf8');

// Replace wazwan-hero.jpg
file = file.replace(
  '<img src="/wazwan-hero.jpg" alt="Kashmiri Wazwan feast" className="h-full w-full object-cover object-right lg:object-center" />',
  '<Image priority fill src="/wazwan-hero.jpg" alt="Kashmiri Wazwan feast" className="object-cover object-right lg:object-center" />'
);

// Replace dish list card image
file = file.replace(
  '<img\n                  src={dishImageOverrides[dish.name] || dish.image}\n                  alt={dish.name}\n                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"\n                />',
  '<Image\n                  fill\n                  src={dishImageOverrides[dish.name] || dish.image}\n                  alt={dish.name}\n                  className="object-cover transition duration-700 group-hover:scale-110"\n                />'
);

// Replace dish modal image
file = file.replace(
  '<img\n                    src={dishImageOverrides[selectedDish.name] || selectedDish.image}\n                    alt={selectedDish.name}\n                    className="h-full w-full object-cover"\n                  />',
  '<Image\n                    fill\n                    src={dishImageOverrides[selectedDish.name] || selectedDish.image}\n                    alt={selectedDish.name}\n                    className="object-cover"\n                  />'
);

fs.writeFileSync('frontend/components/HomePageClient.js', file);
console.log('Images replaced!');
