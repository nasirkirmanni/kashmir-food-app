const fs = require('fs');
let js = fs.readFileSync('frontend/app/explore/ExploreClient.js', 'utf8');

const oldFetch = `const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=34.0837&longitude=74.7973&current_weather=true");
        const data = await res.json();
        if (data && data.current_weather) {
          setTemperature(Math.round(data.current_weather.temperature));
        }`;

const newFetch = `const res = await fetch("https://wttr.in/Srinagar?format=j1");
        const data = await res.json();
        if (data && data.current_condition && data.current_condition[0]) {
          setTemperature(data.current_condition[0].temp_C);
        }`;

js = js.replace(oldFetch, newFetch);
fs.writeFileSync('frontend/app/explore/ExploreClient.js', js);
console.log('API swapped successfully!');
