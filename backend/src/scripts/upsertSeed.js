import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import { Dish } from "../models/Dish.js";
import { Restaurant } from "../models/Restaurant.js";
import { Destination } from "../models/Destination.js";
import { User } from "../models/User.js";
import { dishes as originalDishes, restaurants as originalRestaurants, users as originalUsers } from "../data/seedData.js";

dotenv.config();

// New Dishes to reach exactly 40 authentic Kashmiri dishes
const newDishes = [
  {
    name: "Matsgand",
    description: "Minced meatballs cooked in a spicy red gravy.",
    fullDescription: "Matsgand is a beloved Kashmiri Pandit minced mutton meatball preparation cooked in a rich, red chili-forward gravy flavored with fennel, ginger, and asafoetida.",
    history: "Historically, Matsgand has been a key dish in Kashmiri Pandit feasts. It showcases the Pandit style of meat preparation, which excludes onion and garlic, relying heavily on fennel seeds (badian) and ginger powder (sonth) for its distinct aroma.",
    touristTip: "Best enjoyed with hot steamed basmati rice and a side of fresh walnut chutney.",
    category: "Wazwan",
    foodType: "Non-veg",
    image: "/images/dishes/rista.jpg",
    priceRange: "INR 400-800",
    popularityRating: 4.6,
    spiceLevel: "High",
    tags: ["meatballs", "traditional", "spicy"]
  },
  {
    name: "Kabargah",
    description: "Crispy fried mutton ribs cooked in milk and spices.",
    fullDescription: "Kabargah consists of mutton ribs cooked in milk and spices, then dipped in chickpea flour batter and shallow fried in pure ghee until crispy and golden.",
    history: "A cousin of the Muslim Wazwan's Tabak Maaz, Kabargah is the Pandit counterpart. Its preparation involves simmering tender ribs in milk infused with cardamoms and sweet fennel before a final flash-fry.",
    touristTip: "Perfect as an appetizer. Squeeze fresh lemon juice on top before eating.",
    category: "Luxury Dining",
    foodType: "Non-veg",
    image: "/images/dishes/tabak-maaz.jpg",
    priceRange: "INR 450-900",
    popularityRating: 4.8,
    spiceLevel: "Medium",
    tags: ["ribs", "crispy", "starter"]
  },
  {
    name: "Muji Gaad",
    description: "Kashmiri fish curry cooked with radish.",
    fullDescription: "Muji Gaad is a traditional winter dish combining freshwater fish with sliced radish, cooked in a spicy red gravy flavored with Kashmiri spices.",
    history: "This dish is highly celebrated during the winter months in Kashmir. It is also an essential part of the Gaad Batte festival, symbolizing local harvest and the connection between land and water.",
    touristTip: "Try this in local households or traditional local eateries during winter for the most authentic experience.",
    category: "Wazwan",
    foodType: "Non-veg",
    image: "/images/dishes/rogan-josh.webp",
    priceRange: "INR 300-600",
    popularityRating: 4.3,
    spiceLevel: "High",
    tags: ["fish", "radish", "traditional"]
  },
  {
    name: "Nadru Gaad",
    description: "Kashmiri fish curry cooked with lotus stems.",
    fullDescription: "Nadru Gaad pairs tender lake fish with fresh lotus stem slices, cooked together in a rich spice-infused red gravy.",
    history: "Lotus stems (Nadru) harvested from Dal and Anchar lakes have been eaten in Kashmir since ancient times. Pairing them with local fish represents the traditional lakeside diet of the valley.",
    touristTip: "A great local specialty. The lotus stems absorb the delicious fish gravy and become extremely flavorful.",
    category: "Wazwan",
    foodType: "Non-veg",
    image: "/images/dishes/nadru-yakhni.jpg",
    priceRange: "INR 320-650",
    popularityRating: 4.4,
    spiceLevel: "Medium",
    tags: ["fish", "lotus-stem", "traditional"]
  },
  {
    name: "Bam Tsoonth",
    description: "Quince apples cooked in a tangy, spiced curry.",
    fullDescription: "Bam Tsoonth is a unique sweet and sour Kashmiri dish featuring quince apples cooked with mutton or paneer in a spiced gravy.",
    history: "Quince apples are native to the temperate climate of Kashmir. Historically, Wazas slow-cooked this fruit during autumn to balance the savory feast menus with fruity, acidic undertones.",
    touristTip: "Try it if you want to experience the rare fruit-meat pairings of Kashmiri royal cuisine.",
    category: "Wazwan",
    foodType: "Veg",
    image: "/images/dishes/ruwangan-chaman.png",
    priceRange: "INR 250-500",
    popularityRating: 4.0,
    spiceLevel: "Medium",
    tags: ["quince", "sweet-sour", "vegetarian"]
  },
  {
    name: "Al-Hachh Mutton",
    description: "Mutton cooked with dried bottle gourd slices.",
    fullDescription: "Al-Hachh Mutton is a classic dish combining sun-dried bottle gourd slices with tender mutton in a slow-cooked spiced gravy.",
    history: "Kashmiris historically sun-dried summer vegetables like bottle gourd (Al-Hachh) to prepare for the harsh winter months when snow blocked trade routes. This dish represents the resilience and preservation traditions of Kashmir.",
    touristTip: "Perfect comfort food for chilly autumn or winter days.",
    category: "Wazwan",
    foodType: "Non-veg",
    image: "/images/dishes/rogan-josh.webp",
    priceRange: "INR 350-700",
    popularityRating: 4.2,
    spiceLevel: "Medium",
    tags: ["mutton", "dried-vegetables", "winter"]
  },
  {
    name: "Tsoek Wangangan",
    description: "Sour and spicy baby eggplants.",
    fullDescription: "Tsoek Wangangan consists of baby eggplants fried and cooked in a tangy tamarind and spice-based gravy.",
    history: "This dish is a vegetarian highlight of Kashmiri feasting. The combination of heat and sour tamarind makes it an excellent palate cleanser.",
    touristTip: "An excellent option for vegetarians who want something with a bold, punchy, and tangy flavor.",
    category: "Wazwan",
    foodType: "Veg",
    image: "/images/dishes/ruwangan-chaman.png",
    priceRange: "INR 200-400",
    popularityRating: 4.5,
    spiceLevel: "High",
    tags: ["eggplant", "tangy", "vegetarian"]
  },
  {
    name: "Shufta",
    description: "A rich sweet mixture of dry fruits, paneer, and honey.",
    fullDescription: "Shufta is a decadent dessert packed with almonds, walnuts, pistachios, cashews, raisins, dry dates, and fried paneer, all coated in a saffron-infused honey syrup.",
    history: "Shufta has historically been served at weddings and special celebrations, symbolizing wealth and luxury because of its use of premium dry fruits.",
    touristTip: "Extremely rich. Share a small bowl with friends at the end of your meal.",
    category: "Luxury Dining",
    foodType: "Veg",
    image: "/images/dishes/gushtaba.jpg",
    priceRange: "INR 400-800",
    popularityRating: 4.9,
    spiceLevel: "Mild",
    tags: ["dessert", "dry-fruits", "honey"]
  },
  {
    name: "Kashmiri Harissa",
    description: "A slow-cooked winter mutton and rice paste.",
    fullDescription: "Harissa is a rich, smooth paste of mutton slow-cooked overnight with rice, spices, and oil, served hot with local baked flatbreads.",
    history: "Brought to Kashmir from Central Asia, Harissa has been a winter breakfast staple in Downtown Srinagar for centuries. Specialized cooks (Haris-Froush) prepare it in large copper pots inside underground wood-fired ovens.",
    touristTip: "Go early in the morning (around 6 AM) to a traditional Harissa shop in Downtown Srinagar to experience it piping hot with local Lavas bread.",
    category: "Street Food",
    foodType: "Non-veg",
    image: "/images/dishes/rogan-josh.webp",
    priceRange: "INR 200-400",
    popularityRating: 4.9,
    spiceLevel: "Medium",
    tags: ["breakfast", "harissa", "mutton"]
  },
  {
    name: "Syoon",
    description: "Traditional Kashmiri Pandit lamb curry.",
    fullDescription: "Syoon is a light, thin mutton curry cooked without onion or garlic, relying on asafoetida, yogurt, ginger, and fennel powder.",
    history: "As a foundational daily meat dish of the Kashmiri Pandit community, Syoon represents a centuries-old culinary style defined by strict dietary preferences and local spices.",
    touristTip: "It has a lighter and more herbal flavor than the heavier Muslim Wazwan Rogan Josh.",
    category: "Wazwan",
    foodType: "Non-veg",
    image: "/images/dishes/rogan-josh.webp",
    priceRange: "INR 380-750",
    popularityRating: 4.4,
    spiceLevel: "Medium",
    tags: ["lamb", "pandit-style", "traditional"]
  },
  {
    name: "Gogji Mutton",
    description: "Mutton cooked simply with fresh turnips.",
    fullDescription: "Gogji Mutton is a rustic, home-style Kashmiri curry where mutton is slow-cooked with whole or halved turnips until meltingly soft.",
    history: "Turnips are a highly resilient crop in Kashmir. Cooking them with mutton is a warm home-style tradition that keeps families cozy during the winter months.",
    touristTip: "Perfect for travelers looking for a rustic, non-commercial meal that tastes like home.",
    category: "Wazwan",
    foodType: "Non-veg",
    image: "/images/dishes/rogan-josh.webp",
    priceRange: "INR 300-600",
    popularityRating: 4.1,
    spiceLevel: "Medium",
    tags: ["mutton", "turnips", "home-style"]
  },
  {
    name: "Doon Chetin",
    description: "Earthy walnut chutney with green chilies.",
    fullDescription: "Doon Chetin is a thick, textured paste of crushed walnuts, green chilies, yogurt, mint, and salt.",
    history: "Walnut trees are abundant across Kashmir. This chutney has been served as a standard accompaniment in Wazwan feasts and home meals to aid digestion of rich meats.",
    touristTip: "Take a small dab on your rice; it has a beautiful nutty richness with a punch of green chili heat.",
    category: "Wazwan",
    foodType: "Veg",
    image: "/images/dishes/gande-tsitin.png",
    priceRange: "INR 50-100",
    popularityRating: 4.7,
    spiceLevel: "High",
    tags: ["walnut", "chutney", "condiment"]
  },
  {
    name: "Kashmiri Kahwa",
    description: "Saffron-infused Kashmiri green tea with almonds.",
    fullDescription: "Kahwa is an aromatic green tea brewed with saffron strands, cinnamon bark, cardamom pods, and served with a generous garnish of crushed almonds.",
    history: "Kahwa has been drank in Kashmir for centuries. It was historically reserved for royalty and guests of honor as a warm welcome drink and digestive aid.",
    touristTip: "Always drink it hot. It is the perfect welcome drink when you arrive in the cool valleys of Kashmir.",
    category: "Cafes",
    foodType: "Veg",
    image: "/images/dishes/daniwal-korma.png",
    priceRange: "INR 60-120",
    popularityRating: 4.9,
    spiceLevel: "Mild",
    tags: ["tea", "saffron", "almonds"]
  },
  {
    name: "Noon Chai",
    description: "Traditional pink salted tea brewed with milk.",
    fullDescription: "Noon Chai (also called Sheer Chai) is a pink salted tea brewed from special green tea leaves, baking soda, milk, and salt.",
    history: "This pink tea is the daily morning and afternoon beverage for almost every Kashmiri. Its unique color comes from the chemical reaction of tea leaves with baking soda under prolonged boiling.",
    touristTip: "It is salty, not sweet! Try it with local baked breads like Girda or Bakerkhani.",
    category: "Cafes",
    foodType: "Veg",
    image: "/images/dishes/waza-haak.png",
    priceRange: "INR 40-80",
    popularityRating: 4.5,
    spiceLevel: "Mild",
    tags: ["tea", "salty", "pink"]
  },
  {
    name: "Girda",
    description: "Tandoor-baked breakfast bread.",
    fullDescription: "Girda is a round, flat bread with finger impressions pressed into the dough, baked in a traditional clay tandoor (kandur).",
    history: "Kashmir has a unique bakery culture (Kandur-wan). Girda is purchased fresh every morning by locals to eat with Noon Chai.",
    touristTip: "Eat it warm with a spread of butter, dipped in Noon Chai.",
    category: "Street Food",
    foodType: "Veg",
    image: "/images/dishes/dum-aelve.jpg",
    priceRange: "INR 10-20",
    popularityRating: 4.6,
    spiceLevel: "Mild",
    tags: ["bread", "breakfast", "street-food"]
  },
  {
    name: "Bakerkhani",
    description: "Flaky, layered baked flatbread.",
    fullDescription: "Bakerkhani is a thick, round, flaky flatbread with a golden crust, baked in a clay tandoor.",
    history: "Originating during Mughal times, the Bakerkhani has evolved in Kashmir into a popular afternoon snack, usually enjoyed with salted pink tea.",
    touristTip: "Buy it fresh from a local neighborhood kandur (baker) in the afternoon.",
    category: "Street Food",
    foodType: "Veg",
    image: "/images/dishes/dum-aelve.jpg",
    priceRange: "INR 15-30",
    popularityRating: 4.4,
    spiceLevel: "Mild",
    tags: ["bread", "flaky", "afternoon"]
  },
  {
    name: "Lavas",
    description: "Thin, soft baked unleavened flatbread.",
    fullDescription: "Lavas is a thin, puffed unleavened flatbread baked in a tandoor, commonly wrapped around barbecue or harissa.",
    history: "Lavas has deep Central Asian roots. It acts as the primary wrap for street foods (Tujji) and winter Harissa in the valley.",
    touristTip: "Use it to scoop up hot Harissa or wrapped around skewered Tujji kababs.",
    category: "Street Food",
    foodType: "Veg",
    image: "/images/dishes/waza-haak.png",
    priceRange: "INR 10-20",
    popularityRating: 4.6,
    spiceLevel: "Mild",
    tags: ["bread", "wrap", "flatbread"]
  },
  {
    name: "Czochworu",
    description: "Bagel-like tandoor-baked bread topped with sesame.",
    fullDescription: "Czochworu is a small, round, bagel-like bread with a soft interior and a hard crust topped with sesame seeds.",
    history: "Another classic kandur bread, Czochworu has been the traditional tea-time companion for students and office workers in the afternoon.",
    touristTip: "Best sliced in half with butter spread inside.",
    category: "Street Food",
    foodType: "Veg",
    image: "/images/dishes/dum-aelve.jpg",
    priceRange: "INR 10-20",
    popularityRating: 4.3,
    spiceLevel: "Mild",
    tags: ["bread", "bagel", "sesame"]
  },
  {
    name: "Kashmiri Pulao",
    description: "Sweet, fragrant saffron rice with nuts.",
    fullDescription: "Kashmiri Pulao is an aromatic rice preparation cooked with milk, ghee, saffron, and loaded with nuts like almonds, walnuts, and raisins, topped with fresh fruits.",
    history: "A celebratory sweet rice preparation developed in royal kitchens to showcase the abundance of Kashmiri saffron and local orchards.",
    touristTip: "A great option if you prefer a sweet, rich, and completely non-spicy rice dish.",
    category: "Luxury Dining",
    foodType: "Veg",
    image: "/images/dishes/rogan-josh.webp",
    priceRange: "INR 250-500",
    popularityRating: 4.5,
    spiceLevel: "Mild",
    tags: ["rice", "saffron", "sweet"]
  },
  {
    name: "Trout Fish Fry",
    description: "Fresh fried mountain trout with local spices.",
    fullDescription: "Trout Fish Fry features locally harvested mountain stream trout marinated in spices and pan-fried until crispy.",
    history: "Trout was introduced to Kashmir's cold streams during British colonial rule. It has since become a localized delicacy, especially in Pahalgam and Dachigam streams.",
    touristTip: "A must-try in Pahalgam. Freshness is guaranteed since the fish is harvested from local cold-water farms.",
    category: "Luxury Dining",
    foodType: "Non-veg",
    image: "/images/dishes/tabak-maaz.jpg",
    priceRange: "INR 350-700",
    popularityRating: 4.7,
    spiceLevel: "Medium",
    tags: ["trout", "fish", "fried"]
  }
];

// New Restaurants to reach exactly 50 restaurants in total
// Note: We have 38 original restaurants (28 from list + 10 from users)
// We need 12 new restaurants to reach 50
const newRestaurants = [
  {
    name: "Nishat Breeze Restaurant",
    location: "Near Nishat Gardens, Boulevard Road, Srinagar",
    city: "Srinagar",
    rating: 4.4,
    priceLevel: "Mid-range",
    tags: ["Trout", "Scenic View", "Near Garden"],
    image: "/images/restaurants/restaurant-art.png",
    description: "Located near Nishat Mughal Garden, Nishat Breeze is famous for serving fresh trout and Kashmiri meals with outdoor seating.",
    phoneNumber: "+91 194 246 1122",
    openingHours: "11:00 AM – 10:00 PM daily",
    website: "nishatbreeze.com",
    authentic: true,
    overpriced: false,
    touristTrapWarning: false,
    googleMapsQuery: "Nishat Breeze Restaurant Srinagar",
    linkedDishNames: ["Trout Fish Fry", "Rogan Josh", "Nadru Yakhni"]
  },
  {
    name: "Shalimar Heights Cafe",
    location: "Main Road, Near Shalimar Bagh, Srinagar",
    city: "Srinagar",
    rating: 4.2,
    priceLevel: "Mid-range",
    tags: ["Cafe", "Coffee", "Kashmiri Breads"],
    image: "/images/restaurants/restaurant-art.png",
    description: "A trendy cafe near Shalimar Bagh providing excellent Kashmiri coffee, dry fruit Kahwa, and afternoon local bakery goods.",
    phoneNumber: "+91 194 246 3344",
    openingHours: "10:00 AM – 9:00 PM daily",
    website: "shalimarheightscafe.com",
    authentic: false,
    overpriced: false,
    touristTrapWarning: false,
    googleMapsQuery: "Shalimar Heights Cafe Srinagar",
    linkedDishNames: ["Kashmiri Kahwa", "Czochworu", "Bakerkhani"]
  },
  {
    name: "Lidder Heights Restaurant",
    location: "Aru Road, Pahalgam",
    city: "Pahalgam",
    rating: 4.6,
    priceLevel: "Luxury",
    tags: ["Wazwan", "Mountain View", "Riverside"],
    image: "/images/restaurants/restaurant-art.png",
    description: "A premium dining destination in Pahalgam offering panoramic mountain views and highly polished Wazwan courses.",
    phoneNumber: "+91 1936 243 556",
    openingHours: "12:00 PM – 10:30 PM daily",
    website: "lidderheights.com",
    authentic: true,
    overpriced: false,
    touristTrapWarning: false,
    googleMapsQuery: "Lidder Heights Restaurant Pahalgam",
    linkedDishNames: ["Gushtaba", "Rista", "Kabargah"]
  },
  {
    name: "Trout Beat Pahalgam",
    location: "Laripora Fish Farm Road, Pahalgam",
    city: "Pahalgam",
    rating: 4.5,
    priceLevel: "Mid-range",
    tags: ["Trout", "Seafood", "Fresh Farm"],
    image: "/images/restaurants/restaurant-art.png",
    description: "Specialized in fresh cold-water trout, prepared either fried, grilled, or cooked in authentic Kashmiri Pandit style.",
    phoneNumber: "+91 1936 243 778",
    openingHours: "11:30 AM – 9:30 PM daily",
    website: "troutbeat.com",
    authentic: true,
    overpriced: false,
    touristTrapWarning: false,
    googleMapsQuery: "Trout Beat Laripora Pahalgam",
    linkedDishNames: ["Trout Fish Fry", "Nadru Gaad", "Muji Gaad"]
  },
  {
    name: "Snowland Restaurant",
    location: "Main Street, Sonamarg",
    city: "Sonamarg",
    rating: 4.5,
    priceLevel: "Luxury",
    tags: ["Wazwan", "Glacier View", "Cozy"],
    image: "/images/restaurants/restaurant-art.png",
    description: "A premium restaurant in Sonamarg serving hot Wazwan and traditional warming meals under the backdrop of snowy peaks.",
    phoneNumber: "+91 194 230 1122",
    openingHours: "11:00 AM – 10:00 PM daily",
    website: "snowlandsonamarg.com",
    authentic: true,
    overpriced: false,
    touristTrapWarning: false,
    googleMapsQuery: "Snowland Restaurant Sonamarg",
    linkedDishNames: ["Rogan Josh", "Aab Gosh", "Shufta"]
  },
  {
    name: "Thajiwas View Point Eatery",
    location: "Thajiwas Glacier Trail, Sonamarg",
    city: "Sonamarg",
    rating: 4.1,
    priceLevel: "Budget",
    tags: ["Local Food", "Maggie", "Noon Chai"],
    image: "/images/restaurants/restaurant-art.png",
    description: "A rustic, budget-friendly stop along the Thajiwas Glacier trail, famous for hot noon chai, local bread, and warming noodle cups.",
    phoneNumber: "",
    openingHours: "8:00 AM – 7:00 PM daily",
    website: "",
    authentic: true,
    overpriced: false,
    touristTrapWarning: false,
    googleMapsQuery: "Thajiwas Glacier Sonamarg food stalls",
    linkedDishNames: ["Noon Chai", "Girda", "Doon Chetin"]
  },
  {
    name: "Sindh Valley Retreat",
    location: "Srinagar-Leh Highway, Gagangir, Sonamarg",
    city: "Sonamarg",
    rating: 4.7,
    priceLevel: "Luxury",
    tags: ["Fine Dining", "Riverside", "Luxury"],
    image: "/images/restaurants/restaurant-art.png",
    description: "An upscale riverside restaurant at Gagangir offering standard multi-cuisine and premium Kashmiri Wazwan platters.",
    phoneNumber: "+91 194 230 4455",
    openingHours: "12:00 PM – 10:00 PM daily",
    website: "sindhvalleyretreat.com",
    authentic: true,
    overpriced: false,
    touristTrapWarning: false,
    googleMapsQuery: "Sindh Valley Retreat Gagangir",
    linkedDishNames: ["Gushtaba", "Rista", "Kashmiri Pulao"]
  },
  {
    name: "Tangmarg Treat",
    location: "Main Chowk, Tangmarg",
    city: "Gulmarg",
    rating: 4.0,
    priceLevel: "Budget",
    tags: ["Fast Food", "Tea", "Kebabs"],
    image: "/images/restaurants/restaurant-art.png",
    description: "A popular transit stop in Tangmarg before taking the mountain road up to Gulmarg, famous for hot tea and skewered Tujji.",
    phoneNumber: "",
    openingHours: "7:00 AM – 9:00 PM daily",
    website: "",
    authentic: true,
    overpriced: false,
    touristTrapWarning: false,
    googleMapsQuery: "Tangmarg Main Chowk food",
    linkedDishNames: ["Mutton Tujji", "Noon Chai", "Lavas"]
  },
  {
    name: "Gurez Alpine Dhaba",
    location: "Dawar Market, Gurez Valley",
    city: "Gurez",
    rating: 4.3,
    priceLevel: "Budget",
    tags: ["Home-style", "Gurez", "Local Fish"],
    image: "/images/restaurants/restaurant-art.png",
    description: "A local, family-run dhaba in Dawar serving fresh river trout and home-style potato turnip stews.",
    phoneNumber: "",
    openingHours: "8:00 AM – 9:30 PM daily",
    website: "",
    authentic: true,
    overpriced: false,
    touristTrapWarning: false,
    googleMapsQuery: "Dawar Gurez Valley market restaurants",
    linkedDishNames: ["Trout Fish Fry", "Gogji Mutton", "Noon Chai"]
  },
  {
    name: "Yusmarg Meadows Cafe",
    location: "Meadow Stalls, Yusmarg",
    city: "Yusmarg",
    rating: 4.2,
    priceLevel: "Budget",
    tags: ["Local Tea", "Bakerkhani", "Picnic"],
    image: "/images/restaurants/restaurant-art.png",
    description: "An open-air tea stall in the middle of Yusmarg meadow, serving fresh bakery flatbreads and hot saffron Kahwa.",
    phoneNumber: "",
    openingHours: "9:00 AM – 6:00 PM daily",
    website: "",
    authentic: true,
    overpriced: false,
    touristTrapWarning: false,
    googleMapsQuery: "Yusmarg meadows food stalls",
    linkedDishNames: ["Kashmiri Kahwa", "Bakerkhani", "Doon Chetin"]
  },
  {
    name: "Doodhpathri Pine Grill",
    location: "Pine Valley Meadows, Doodhpathri",
    city: "Doodhpathri",
    rating: 4.4,
    priceLevel: "Budget",
    tags: ["Barbecue", "Tujji", "Meadow View"],
    image: "/images/restaurants/restaurant-art.png",
    description: "A highly scenic Tujji point in Doodhpathri serving coal-grilled barbecues wrapped in fresh local tandoori lavas.",
    phoneNumber: "",
    openingHours: "10:00 AM – 7:00 PM daily",
    website: "",
    authentic: true,
    overpriced: false,
    touristTrapWarning: false,
    googleMapsQuery: "Doodhpathri meadows Tujji points",
    linkedDishNames: ["Mutton Tujji", "Lavas", "Noon Chai"]
  },
  {
    name: "Verinag Springs Restaurant",
    location: "Opposite Mughal Garden Entrance, Verinag",
    city: "Verinag",
    rating: 4.2,
    priceLevel: "Mid-range",
    tags: ["Garden Side", "Wazwan", "Spring Side"],
    image: "/images/restaurants/restaurant-art.png",
    description: "Conveniently located right outside the famous Verinag Spring garden, serving classic curry bowls and saffron tea.",
    phoneNumber: "+91 1932 255 111",
    openingHours: "10:30 AM – 9:00 PM daily",
    website: "",
    authentic: true,
    overpriced: false,
    touristTrapWarning: false,
    googleMapsQuery: "Verinag Spring garden entrance restaurants",
    linkedDishNames: ["Rogan Josh", "Nadru Yakhni", "Kashmiri Kahwa"]
  }
];

// 20 Kashmir Destinations
const destinations = [
  { name: "Srinagar", location: "Central Kashmir", bestTimeToVisit: "April to October" },
  { name: "Gulmarg", location: "North Kashmir, Baramulla", bestTimeToVisit: "December to March (Snow), April to June (Meadows)" },
  { name: "Pahalgam", location: "South Kashmir, Anantnag", bestTimeToVisit: "March to November" },
  { name: "Sonamarg", location: "Central Kashmir, Ganderbal", bestTimeToVisit: "April to October" },
  { name: "Yusmarg", location: "Budgam District", bestTimeToVisit: "May to September" },
  { name: "Gurez Valley", location: "North Kashmir, Bandipora", bestTimeToVisit: "June to September" },
  { name: "Lolab Valley", location: "North Kashmir, Kupwara", bestTimeToVisit: "April to October" },
  { name: "Aru Valley", location: "Pahalgam, Anantnag", bestTimeToVisit: "March to November" },
  { name: "Betaab Valley", location: "Pahalgam, Anantnag", bestTimeToVisit: "March to October" },
  { name: "Doodhpathri", location: "Budgam District", bestTimeToVisit: "May to October" },
  { name: "Kokernag", location: "South Kashmir, Anantnag", bestTimeToVisit: "April to October" },
  { name: "Verinag", location: "South Kashmir, Anantnag", bestTimeToVisit: "April to October" },
  { name: "Achabal", location: "South Kashmir, Anantnag", bestTimeToVisit: "April to September" },
  { name: "Sinthan Top", location: "Kishtwar-Anantnag Border", bestTimeToVisit: "April to September" },
  { name: "Daksum", location: "Anantnag District", bestTimeToVisit: "April to October" },
  { name: "Bangus Valley", location: "North Kashmir, Kupwara", bestTimeToVisit: "May to September" },
  { name: "Wular Lake", location: "Bandipora District", bestTimeToVisit: "April to October" },
  { name: "Manasbal Lake", location: "Ganderbal District", bestTimeToVisit: "May to October" },
  { name: "Pari Mahal", location: "Zabarwan Range, Srinagar", bestTimeToVisit: "April to October" },
  { name: "Shalimar Bagh", location: "Dal Lake front, Srinagar", bestTimeToVisit: "April to October" }
].map((d, index) => {
  let charSum = 0;
  for (let i = 0; i < d.name.length; i++) {
    charSum += d.name.charCodeAt(i);
  }
  const factor = (charSum + 303) % 10;
  const authenticityScore = Number((3.8 + (factor % 5) * 0.3).toFixed(1));
  const touristFriendlinessScore = Number((3.5 + ((factor + 3) % 6) * 0.3).toFixed(1));
  const luxuryScore = Number((2.5 + ((factor + 7) % 6) * 0.5).toFixed(1));

  const tags = ["kashmir", d.location.toLowerCase().replace(/[^a-z0-9]+/g, "-")];
  if (luxuryScore >= 4.5) tags.push("luxury-resort");
  if (touristFriendlinessScore >= 4.5) tags.push("highly-accessible");

  return {
    name: d.name,
    description: `A breathtaking destination in ${d.location} famous for its natural landscapes and local hospitality.`,
    fullDescription: `${d.name} stands as a premier tourist attraction in the Kashmir valley. Located in ${d.location}, it offers visitors spectacular panoramic views, rich cultural landmarks, and a serene getaway. Renowned for its unique atmosphere, it continues to welcome travelers from around the world looking to explore the natural wonder and traditional Kashmiri lifestyle.`,
    image: "/wazwan-hero.jpg",
    location: d.location,
    bestTimeToVisit: d.bestTimeToVisit,
    attractions: [
      `${d.name} Scenic Point`,
      `Historic Local Market in ${d.name}`,
      `Traditional Food Street of ${d.name}`
    ],
    tags,
    authenticityScore,
    touristFriendlinessScore,
    luxuryScore
  };
});

// Deterministic score generator for original items
function getDeterministicScores(name, seedNum) {
  let charSum = 0;
  for (let i = 0; i < name.length; i++) {
    charSum += name.charCodeAt(i);
  }
  const factor = (charSum + seedNum) % 10;
  const authenticityScore = Number((3.8 + (factor % 5) * 0.3).toFixed(1));
  const touristFriendlinessScore = Number((3.5 + ((factor + 3) % 6) * 0.3).toFixed(1));
  const luxuryScore = Number((2.5 + ((factor + 7) % 6) * 0.5).toFixed(1));
  return { authenticityScore, touristFriendlinessScore, luxuryScore };
}

async function run() {
  await connectDB();
  console.log("Upserting database collections...");

  // 1. Upsert Dishes
  const dishesToUpsert = [];
  
  // Original dishes
  originalDishes.forEach(d => {
    const scores = getDeterministicScores(d.name, 101);
    dishesToUpsert.push({
      ...d,
      authenticityScore: scores.authenticityScore,
      touristFriendlinessScore: scores.touristFriendlinessScore,
      luxuryScore: scores.luxuryScore
    });
  });

  // New dishes
  newDishes.forEach(d => {
    const scores = getDeterministicScores(d.name, 101);
    dishesToUpsert.push({
      ...d,
      authenticityScore: scores.authenticityScore,
      touristFriendlinessScore: scores.touristFriendlinessScore,
      luxuryScore: scores.luxuryScore
    });
  });

  console.log(`Upserting ${dishesToUpsert.length} dishes...`);
  const dishMap = new Map();
  for (const dish of dishesToUpsert) {
    const updated = await Dish.findOneAndUpdate(
      { name: dish.name },
      dish,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    dishMap.set(updated.name, updated._id);
  }
  console.log("Dishes upsert complete.");

  // 2. Upsert Restaurants
  const restaurantsToUpsert = [];

  // Original list
  originalRestaurants.forEach(r => {
    const scores = getDeterministicScores(r.name, 202);
    restaurantsToUpsert.push({
      ...r,
      authenticityScore: scores.authenticityScore,
      touristFriendlinessScore: scores.touristFriendlinessScore,
      luxuryScore: scores.luxuryScore
    });
  });

  // Original restaurants nested in the users array
  originalUsers.forEach(item => {
    if (item.name && item.name !== "Admin User" && item.name !== "Travel Explorer") {
      const scores = getDeterministicScores(item.name, 202);
      restaurantsToUpsert.push({
        ...item,
        authenticityScore: scores.authenticityScore,
        touristFriendlinessScore: scores.touristFriendlinessScore,
        luxuryScore: scores.luxuryScore
      });
    }
  });

  // New restaurants
  newRestaurants.forEach(r => {
    const scores = getDeterministicScores(r.name, 202);
    restaurantsToUpsert.push({
      ...r,
      authenticityScore: scores.authenticityScore,
      touristFriendlinessScore: scores.touristFriendlinessScore,
      luxuryScore: scores.luxuryScore
    });
  });

  console.log(`Upserting ${restaurantsToUpsert.length} restaurants...`);
  for (const rest of restaurantsToUpsert) {
    const dishIds = (rest.linkedDishNames || []).map(dname => dishMap.get(dname)).filter(Boolean);
    const updateData = {
      ...rest,
      linkedDishes: dishIds
    };
    delete updateData.linkedDishNames;

    await Restaurant.findOneAndUpdate(
      { name: rest.name, city: rest.city },
      updateData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log("Restaurants upsert complete.");

  // 3. Upsert Destinations
  console.log(`Upserting ${destinations.length} destinations...`);
  for (const dest of destinations) {
    await Destination.findOneAndUpdate(
      { name: dest.name },
      dest,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log("Destinations upsert complete.");

  // 4. Upsert Users (Admin User & Travel Explorer)
  const cleanUsers = originalUsers.filter(u => u.name === "Admin User" || u.name === "Travel Explorer");
  console.log(`Upserting ${cleanUsers.length} users...`);
  for (const user of cleanUsers) {
    // Check if user already exists in db to prevent re-hashing password
    const existingUser = await User.findOne({ email: user.email });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await User.create({
        ...user,
        password: hashedPassword,
        phoneNumber: user.name === "Admin User" ? "+91 99999 99999" : "+91 88888 88888",
        isVerified: true
      });
    } else {
      // Just update non-password fields
      await User.findOneAndUpdate(
        { email: user.email },
        { 
          name: user.name, 
          isAdmin: user.isAdmin,
          phoneNumber: existingUser.phoneNumber || (user.name === "Admin User" ? "+91 99999 99999" : "+91 88888 88888"),
          isVerified: true 
        }
      );
    }
  }
  console.log("Users upsert complete.");

  // Write clean data to seedData.js
  try {
    const fs = await import("fs");
    const path = await import("path");
    const outputFilePath = path.join("src", "data", "seedData.js");
    const content = `// Seed Data for Dishes, Restaurants, Destinations, and Users
// Generated programmatically for comprehensive Waza AI coverage

export const dishes = ${JSON.stringify(dishesToUpsert, null, 2)};

export const restaurants = ${JSON.stringify(restaurantsToUpsert, null, 2)};

export const destinations = ${JSON.stringify(destinations, null, 2)};

export const users = ${JSON.stringify(cleanUsers, null, 2)};
`;
    fs.writeFileSync(outputFilePath, content);
    console.log("Successfully wrote clean, merged seed data back to " + outputFilePath);
  } catch (err) {
    console.error("Failed to write clean seedData.js file:", err);
  }

  console.log("Database upsert process finished successfully!");
  process.exit(0);
}

run().catch(error => {
  console.error("Upsert seeding failed:", error);
  process.exit(1);
});
