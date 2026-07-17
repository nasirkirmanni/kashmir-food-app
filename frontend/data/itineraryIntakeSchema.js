// Itinerary Builder — declarative intake schema (T4)
//
// The conversational intake is DATA, not JSX. StepFlow renders any step from
// this schema, so adding/removing/reordering a question means editing this file
// only — never the flow component.
//
// Step shape:
//   {
//     id, type, key,          // key = where the answer lands in `answers`
//     title, subtitle?,       // copy
//     required?,              // blocks Continue until satisfied
//     visibleWhen?(answers),  // conditional step (skipped when false)
//     ...typeSpecific
//   }
//
// Supported types (StepFlow knows how to render each):
//   single-select   options[{value,label,desc?}]              -> string
//   multi-select    options[{value,label,desc?}], min?        -> string[]
//   counter-group   items[{key,label,min,max,default}]        -> { [key]: number }
//   duration        presets[num], min, max, unit              -> number
//   date-range      -> { startDate, endDate, flexible }
//   text-group      fields[{key,label,placeholder,required?}] -> { [key]: string }

export const itineraryIntakeSchema = [
  {
    id: "duration",
    type: "duration",
    key: "lengthDays",
    title: "How long is your trip?",
    subtitle: "You can fine-tune the exact days.",
    required: true,
    presets: [3, 5, 7, 10],
    min: 1,
    max: 20,
    unit: "days",
    default: 5,
  },
  {
    id: "dates",
    type: "date-range",
    key: "dates",
    title: "When are you travelling?",
    subtitle: "Optional — helps us match the season. Skip if you're flexible.",
    required: false,
  },
  {
    id: "season",
    type: "single-select",
    key: "season",
    title: "Which season are you planning for?",
    subtitle: "Kashmir changes completely across the year.",
    required: true,
    visibleWhen: (a) => !a?.dates?.startDate, // only ask if exact dates weren't given
    options: [
      { value: "spring", label: "Spring", desc: "Apr–May · blossoms & tulips" },
      { value: "summer", label: "Summer", desc: "Jun–Aug · green alpine meadows" },
      { value: "autumn", label: "Autumn", desc: "Sep–Nov · golden Chinars & saffron" },
      { value: "winter", label: "Winter", desc: "Dec–Mar · snow & Gulmarg skiing" },
    ],
  },
  {
    id: "travelers",
    type: "counter-group",
    key: "travelers",
    title: "Who's coming along?",
    subtitle: "We tune routes and stays to your group.",
    required: true,
    items: [
      { key: "adults", label: "Adults", desc: "13+", min: 0, max: 20, default: 2 },
      { key: "children", label: "Children", desc: "Under 13", min: 0, max: 12, default: 0 },
      { key: "seniors", label: "Seniors", desc: "65+", min: 0, max: 12, default: 0 },
    ],
    validate: (v) => (v?.adults || 0) + (v?.children || 0) + (v?.seniors || 0) > 0,
  },
  {
    id: "style",
    type: "multi-select",
    key: "style",
    title: "What's your travel style?",
    subtitle: "Pick all that fit.",
    required: true,
    min: 1,
    options: [
      { value: "luxury", label: "Luxury", desc: "High-end stays & dining" },
      { value: "budget", label: "Budget", desc: "Value-first, local" },
      { value: "family", label: "Family", desc: "Easy, safe, all-ages" },
      { value: "adventure", label: "Adventure", desc: "Treks & active days" },
      { value: "photography", label: "Photography", desc: "Chasing the light" },
      { value: "honeymoon", label: "Honeymoon", desc: "Romantic & private" },
      { value: "friends", label: "Friends", desc: "Group fun" },
      { value: "solo", label: "Solo", desc: "Independent & offbeat" },
      { value: "backpacking", label: "Backpacking", desc: "Light & spontaneous" },
    ],
  },
  {
    id: "interests",
    type: "multi-select",
    key: "interests",
    title: "What do you want to experience?",
    subtitle: "Choose as many as you like.",
    required: true,
    min: 1,
    options: [
      { value: "mountains", label: "Mountains" },
      { value: "lakes", label: "Lakes" },
      { value: "gardens", label: "Gardens" },
      { value: "hidden gems", label: "Hidden gems" },
      { value: "local villages", label: "Local villages" },
      { value: "food", label: "Food" },
      { value: "wazwan", label: "Wazwan" },
      { value: "trekking", label: "Trekking" },
      { value: "wildlife", label: "Wildlife" },
      { value: "culture", label: "Culture" },
      { value: "shopping", label: "Shopping" },
      { value: "winter sports", label: "Winter sports" },
      { value: "spiritual places", label: "Spiritual places" },
      { value: "road trips", label: "Road trips" },
    ],
  },
  {
    id: "pace",
    type: "single-select",
    key: "pace",
    title: "What pace suits you?",
    required: true,
    options: [
      { value: "relaxed", label: "Relaxed", desc: "Fewer sights, more downtime" },
      { value: "balanced", label: "Balanced", desc: "A comfortable mix" },
      { value: "packed", label: "Packed", desc: "See as much as possible" },
    ],
  },
  {
    id: "accommodation",
    type: "multi-select",
    key: "accommodation",
    title: "Where would you like to stay?",
    subtitle: "Pick your preferred styles.",
    required: false,
    options: [
      { value: "luxury hotels", label: "Luxury hotels" },
      { value: "boutique hotels", label: "Boutique hotels" },
      { value: "houseboats", label: "Houseboats" },
      { value: "resorts", label: "Resorts" },
      { value: "homestays", label: "Homestays" },
      { value: "budget hotels", label: "Budget hotels" },
    ],
  },
  {
    id: "transport",
    type: "single-select",
    key: "transport",
    title: "How will you get around?",
    required: false,
    options: [
      { value: "private cab", label: "Private cab", desc: "Comfort & flexibility" },
      { value: "self-drive", label: "Self-drive", desc: "On your own wheels" },
      { value: "shared taxi", label: "Shared taxi", desc: "Budget-friendly" },
    ],
  },
  {
    id: "food",
    type: "multi-select",
    key: "food",
    title: "How do you like to eat?",
    subtitle: "We'll match restaurants and dishes.",
    required: false,
    options: [
      { value: "vegetarian", label: "Vegetarian" },
      { value: "non-vegetarian", label: "Non-vegetarian" },
      { value: "wazwan lover", label: "Wazwan lover" },
      { value: "street food", label: "Street food" },
      { value: "fine dining", label: "Fine dining" },
    ],
  },
  {
    id: "budget",
    type: "single-select",
    key: "budget",
    title: "What's your budget level?",
    subtitle: "A rough band is fine.",
    required: true,
    options: [
      { value: "Budget", label: "Budget", desc: "~₹2k/person/day" },
      { value: "Mid-Range", label: "Mid-Range", desc: "~₹5k/person/day" },
      { value: "Premium", label: "Premium", desc: "~₹10k/person/day" },
      { value: "Luxury", label: "Luxury", desc: "₹25k+/person/day" },
    ],
  },
];

// Map collected answers -> the POST /api/itineraries/generate payload.
// Keeps the API contract decoupled from the UI/answer shape.
export function answersToPreferences(answers = {}) {
  return {
    lengthDays: answers.lengthDays,
    startDate: answers.dates?.startDate || undefined,
    endDate: answers.dates?.endDate || undefined,
    flexibleDates: answers.dates?.flexible || undefined,
    season: answers.season || undefined,
    travelers: answers.travelers || undefined,
    style: answers.style || [],
    interests: answers.interests || [],
    accommodation: answers.accommodation || [],
    transport: answers.transport || undefined,
    food: answers.food || [],
    pace: answers.pace || undefined,
    budgetTier: answers.budget || undefined,
    arrivalCity: answers.cities?.arrivalCity || undefined,
    departureCity: answers.cities?.departureCity || undefined,
    originCity: answers.cities?.originCity || undefined,
  };
}

// Sensible starting answers (so counters/duration have defaults).
export function initialAnswers() {
  return {
    lengthDays: 5,
    travelers: { adults: 2, children: 0, seniors: 0 },
    style: [],
    interests: [],
    accommodation: [],
    food: [],
  };
}
