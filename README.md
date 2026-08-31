Hi, this project represents a web agreggator with custom cms aimed to rent yachts, motorboats, passenger ships.

The project itself includes two parts - client app and server app plus additional microservices. Both of them are set to work on localhost.

!!!NOTICE!!!
1. cms - admin panel is supposed to work on port "5174" so do not expect cms to work on the other ports,
otherwise you need to rewrite some client app functions.
2. client app is designed to work on 5173 port.
3. server app is designed to work on 8000 port.

How it works:

1. Server app

stack: python, FastAPI, uvicorn (as launcher), sqlalchemy (as db orm), starlette, pydantic, pydantic-settings, psycopg[binary],
asyncpg, pymysql, aiosmtplib, boto3, aiobotocore, botocore, aiogram (for tg bot), httpx, requests, sentence-transformers, python-dotenv (as secret keeper),
redis (as cache memmory), postgresql (as database), manticore (as search engine) - launching from docker.

Server is designed as MVC app, for model you can look for models.py and schemas.py, for view - main.py, and for controller - database_func.py, storage.py, telegram.py.

!!!NOTICE!!!
Some functions are not going to work in admin panel, because their work is protected with verify jwt token,
to make it work - start the client app with ssl certificate, in order to have possibility to exchange protected tokens between client and server!
Otherwise you need to rewrite some server functions.

How you start it:

1. Open project folder in your code editor.
2. Open terminal in project.
3. Select .venv interpretator.
4. type: "cd ./" and after ./ type your path to where main.py belongs currently.
5. press enter.
6. type: "uvicorn main:app --host 0.0.0.0 --port 8000 --reload".

THAT'S IT!!! YOUR SERVER WAS STARTED SUCCESSFULLY!!!


2. Client app

stack: react 18+, typescript (optional as needed), javascript, and the other react libs and packages (for more information check package.json).

!!!NOTICE!!!
Client app is using 
1. Yandex Metrica
2. Google Analytics
So that's why before launching the client app, you need to type your codes of authentification for yandex and google in yandex_verification_here.html and AnalyticsTracker.jsx.
Otherwise you need to cut these functions off.

How you start it:

1. Open project folder in your code editor.
2. Open terminal in project.
3. type: "npm run dev" or "npm run build" - to change the port of the app look for vite.config.ts.


Additional microservices:

1. yacht-backup:
The service is designed to work from docker container, it is aimed to create backup of existing database every 24 hours.

2. yacht-puppeteer:
Due to for builder we took vite, and we had a lot of dynamic, created by user content, we needed a solution to prerender existing pages and content to make a good SEO optimisation. Puppeteer was the best solution to prevent SSR problems with indexation. The service is build to work from docker container as well.

3. yacht-sitemap:
There was the same problem with dynamic content. And the only acceptable solution was - create a function which could once in a while scan the whole database table with existing pages and return back a list of them as sitemap.xml. This service also works from docker container.
