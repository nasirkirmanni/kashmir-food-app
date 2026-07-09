import fs from 'fs';
import path from 'path';
import https from 'https';

const destinations = [
  "Achabal",
  "Aru Valley",
  "Bangus Valley",
  "Betaab Valley",
  "Daksum",
  "Doodhpathri",
  "Gurez Valley",
  "Kokernag",
  "Lolab Valley",
  "Manasbal Lake",
  "Pari Mahal",
  "Shalimar Bagh",
  "Sinthan Top",
  "Verinag",
  "Wular Lake",
  "Yusmarg"
];

const destDir = path.join(process.cwd(), 'frontend', 'public', 'images', 'Destinations');

const headers = {
  "User-Agent": "WazwanWayScript/1.0 (hello@wazwanway.com) Node.js/18.x"
};

async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filename))
           .on('error', reject)
           .once('close', () => resolve(filename));
      } else {
        res.resume();
        reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function searchWiki(query) {
  const queryUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json`;
  try {
    const res = await fetch(queryUrl, { headers });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.query && data.query.search && data.query.search.length > 0) {
      return data.query.search[0].title;
    }
  } catch (err) {
    console.error(`Error searching Wikipedia for ${query}:`, err.message);
  }
  return null;
}

async function fetchWikiImageByTitle(title) {
  const queryUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=1000`;
  try {
    const res = await fetch(queryUrl, { headers });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    
    if (pageId !== '-1' && pages[pageId].thumbnail) {
      return pages[pageId].thumbnail.source;
    }
  } catch (error) {
    console.error(`Error fetching image for ${title}:`, error.message);
  }
  return null;
}

async function fetchWikiImage(name) {
  let title = await searchWiki(`${name} Kashmir`);
  if (!title) {
    title = await searchWiki(name);
  }
  if (!title) return null;
  
  await sleep(500);
  return await fetchWikiImageByTitle(title);
}

async function run() {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  for (const name of destinations) {
    const cleanName = name.replace(/ /g, '_');
    const existingFiles = fs.readdirSync(destDir).filter(f => f.startsWith(cleanName + '.'));
    if (existingFiles.length > 0) {
      console.log(`Image already exists for ${name}`);
      continue;
    }

    console.log(`Searching for ${name}...`);
    let imageUrl = await fetchWikiImage(name);

    if (imageUrl) {
      const ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
      const filename = path.join(destDir, `${cleanName}${ext}`);
      
      try {
        await downloadImage(imageUrl, filename);
        console.log(`Successfully downloaded ${name} to ${filename}`);
      } catch (err) {
        console.error(`Failed to download ${name}:`, err.message);
      }
    } else {
      console.log(`Could not find an image for ${name} on Wikipedia.`);
    }
    await sleep(1000);
  }
}

run();
