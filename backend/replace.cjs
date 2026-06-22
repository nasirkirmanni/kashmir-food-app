const fs = require('fs');
const file = fs.readFileSync('src/data/seedData.js', 'utf8');
const start = file.indexOf('export const restaurants = [');
const end = file.indexOf('];', start) + 2;

const newData = [
  {
    "name": "Ahdoos",
    "location": "Ahdoo's Hotel, Residency Road, Regal Chowk, Srinagar, Jammu and Kashmir 190001",
    "city": "Srinagar",
    "rating": 4.3,
    "priceLevel": "Mid-range",
    "tags": [
      "Wazwan",
      "Iconic",
      "Historic",
      "Fine Dining"
    ],
    "linkedDishNames": [
      "Rogan Josh",
      "Rista",
      "Gushtaba",
      "Tabak Maaz",
      "Kashmiri Kahwa"
    ],
    "image": "/images/restaurants/ahdoos.png",
    "description": "Established in 1918, Ahdoos is Srinagar's legendary culinary pioneer. It was the first commercial restaurant in Kashmir to serve traditional Wazwan, earning it the reputation of the ultimate gold standard for authentic Kashmiri flavors in an elegant, heritage setting.",
    "phoneNumber": "+91 70515 10634",
    "openingHours": "12:00 PM – 10:00 PM daily",
    "website": "ahdooshotel.com",
    "authentic": true,
    "overpriced": false,
    "touristTrapWarning": false,
    "googleMapsQuery": "Ahdoos Restaurant Residency Road Srinagar",
    "authenticityScore": 4.8,
    "touristFriendlinessScore": 4.5,
    "luxuryScore": 4.0
  },
  {
    "name": "Mughal Darbar",
    "location": "ground floor, Residency Road, near gpo, Munshi Bagh, Srinagar, Jammu and Kashmir 190001",
    "city": "Srinagar",
    "rating": 4.5,
    "priceLevel": "Mid-range",
    "tags": [
      "Wazwan",
      "Mughlai",
      "Authentic",
      "Srinagar"
    ],
    "image": "/images/restaurants/mughal-darbar.png",
    "description": "Mughal Darbar is renowned for its authentic Kashmiri Wazwan and Mughlai cuisine, offering a rich dining experience in the heart of Srinagar.",
    "phoneNumber": "070065 90221",
    "openingHours": "11:00 AM – 11:00 PM daily",
    "website": "Mughaldarbar.in",
    "authentic": true,
    "overpriced": false,
    "touristTrapWarning": false,
    "googleMapsQuery": "ground floor, Residency Road, near gpo, Munshi Bagh, Srinagar, Jammu and Kashmir 190001",
    "linkedDishNames": [
      "Rogan Josh",
      "Rista",
      "Gushtaba"
    ],
    "authenticityScore": 4.5,
    "touristFriendlinessScore": 4.2,
    "luxuryScore": 3.5
  }
];

const newText = 'export const restaurants = ' + JSON.stringify(newData, null, 2) + ';\n';
fs.writeFileSync('src/data/seedData.js', file.slice(0, start) + newText + file.slice(end));
