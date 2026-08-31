import express from 'express';
import puppeteer from 'puppeteer';
import { findChrome } from 'find-chrome-bin';
import fs from "promise-fs";
import path from 'path';
import cors from 'cors';

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));

const PORT = 3000;
const CACHE_DIR = '/var/lib/public_html/cache';
const DIST_DIR = path.resolve('/var/lib/public_html/static');
const chromePath = await findChrome();
const browser = await puppeteer.launch({executablePath: chromePath.executablePath, headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });

let VALID_ROUTES = [];

const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.vip-boat.ru'
  : 'https://api.vip-boat.ru';

function getCacheFilename(reqPath) {
  let name = reqPath.toLowerCase().replace(/\//g, '-');
  if (name === '' || name === '-') name = 'home';
  else if(name === '-sitemap.xml')
  {
    return path.join(CACHE_DIR, 'sitemap.xml');
  }
  return path.join(CACHE_DIR, `${name}.html`);
}

await fs.mkdir(CACHE_DIR, { recursive: true });

async function prerenderPage(url, waitForSelector = null, routePath) {
  console.log("creating browser page");
  const page = await browser.newPage();
  console.log("browser page created succsessfully");
  await page.setRequestInterception(true);

page.on('request', req => {
  const blockedResourceTypes = ['font'];
    if (blockedResourceTypes.includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
});
console.log("entering first try/catch");
try{
  await page.goto(url, { waitUntil: 'networkidle2' });

  if (waitForSelector) {
    try {
      await page.waitForSelector(waitForSelector, { timeout: 30000 });
      console.log("waiting 4 selector");
    } catch (err) {
      console.warn(`Selector ${waitForSelector} not found:`, err.message);
    }
  }
  console.log("selector is ready!!!");
  const html = await page.content();
  console.log("getting cache filename");
  console.log(routePath);
  const filename = getCacheFilename(routePath);
  console.log("writing");
  await fs.writeFile(filename, html, { encoding: 'utf-8', flag: 'w' });
  console.log("writing succsessfull");
  return html;
}
catch(err) {
  console.log(err);
}
finally{
  await page.close();
}
}

app.get('*all', async (req, res) => {
  const reqPath = req.path;
  const url = `${BASE_URL}${req.originalUrl}`;

  if (!VALID_ROUTES.includes(reqPath)) {
    return res.sendFile(path.join(DIST_DIR, 'index.html'));
  }
  else{
    const filename = getCacheFilename(req.path);
  console.log("trying to send exist");
  try {
    const cached = await fs.readFile(filename, 'utf-8');
    console.log(`Cache hit: ${filename}`);
    return res.send(cached);
  } catch {
    try {
      const html = await prerenderPage(url, '#page-ready', req.path);
      return res.send(html);
    } catch (err) {
      return res.status(500).send(err);
    }
  }
  }
});

app.post('/recache', express.json(), async (req, res) => {
  const url = req.query.url;
  console.log(`starting recaching with adress ${url}`);
  if (!url || !url.startsWith('http')) {
    return res.status(400).send({ error: 'Full URL required starting with http' });
  }
  console.log(`step 1`);
  const pathPart = new URL(url).pathname;

  const cacheKey = pathPart === '/' 
    ? 'home' 
    : '-' + pathPart.slice(1).replace(/\//g, '-');

  try {
    console.log(`recaching...`);
    const filename = getCacheFilename(cacheKey);
    try {
      await fs.unlink(filename);
    } catch (err) {
        if (err.code !== 'ENOENT') {
        console.log("nothing to clear");
      }
    }
    try
      {
        const res = await fetch(`https://server.vip-boat.ru/get-pages`);
                  if (res.status === 200) {
                    const data = await res.json();
                      VALID_ROUTES = data.content.map(item => item.api_adress);
                      VALID_ROUTES.push("/");
                  }
      }
      catch(err)
      {
        console.log(err);
      }
    const html = await prerenderPage(url, '#page-ready', cacheKey);
    res.send({ status: 'ok', url, cacheKey });
  } catch (err) {
    res.status(500).send({ status: 'error', url });
  }
});

async function recacheAllPages() {
  try {
    console.log('recaching...');

    const response = await fetch('https://server.vip-boat.ru/get-pages');
    if (response.status !== 200) {
      console.log('failed to fetch pages');
      return;
    }

    const data = await response.json();

    let routes = data.content.map(item => item.api_adress);
    routes.push("/");

    for (const route of routes) {
      const url = "https://vip-boat.ru" + route;

      const cacheKey = route === '/'
        ? 'home'
        : '-' + route.slice(1).replace(/\//g, '-');

      try {
        const filename = getCacheFilename(cacheKey);

        try {
          await fs.unlink(filename);
        } catch (err) {
          if (err.code !== 'ENOENT') {
            console.log("unlink error:", err);
          }
        }

        await prerenderPage(url, '#page-ready', cacheKey);

        console.log(`cached: ${url}`);

      } catch (err) {
        console.log(`error caching: ${url}`, err);
      }
    }

    console.log('recache done');

  } catch (err) {
    console.log('recache error:', err);
  }
}

// setInterval(recacheAllPages, 10 * 60 * 1000);

app.use(express.static(path.resolve('./dist')));

app.listen(PORT, '0.0.0.0', () => console.log(`Prerender server running at http://0.0.0.0:3000`));