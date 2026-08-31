import subprocess
import os
import csv
import io
import time
import asyncio
import psycopg2
import socket
from datetime import datetime, timezone

def read_secret(path: str) -> str:
    try:
        with open(path) as f:
            return f.read().strip()
    except FileNotFoundError:
        return os.getenv(path.upper())

# переменные среды
DB_HOST: str = "db"
DB_USER: str = read_secret("/run/secrets/DB_USER")
DB_PASSWORD: str = read_secret("/run/secrets/DB_PASS")
DB_NAME: str = read_secret("/run/secrets/DB_NAME")

def wait_for_db(host, user, password, dbname, timeout=300):
    start = time.time()
    while time.time() - start < timeout:
        try:
            conn = psycopg2.connect(
                host=host,
                user=user,
                password=password,
                dbname=dbname
            )
            conn.close()
            return True
        except Exception:
            time.sleep(1)
    print(f"Database is not ready after timeout")

def wait_for_db_dns(host, port=5432, timeout=300):
    start = time.time()
    while time.time() - start < timeout:
        try:
            socket.gethostbyname(host)
            return True
        except socket.gaierror:
            time.sleep(1)
    raise RuntimeError(f"DNS for {host} not resolved after {timeout}s")

async def fill_sitemap_xml():
    # запуск суб процесса линуха с запуском команды в обход шелла линукса с прямой передачей команды с аргументами в psql
    try:
        result = subprocess.run(
            [
                "psql",
                "-h", DB_HOST,
                "-U", DB_USER,
                "-d", DB_NAME,
                "-t",
                "-A",          # без выравнивания
                "-F", "|",     # разделитель колонок
                "-c", "SELECT api_adress, template_type FROM pages;"
            ],
            check=True,
            text=True,
            capture_output=True,
            env={"PGPASSWORD": DB_PASSWORD}
        )
        # Получаем массив адресов
        urls = []
        reader = csv.reader(io.StringIO(result.stdout), delimiter='|')
        for row in reader:
            if row:
                urls.append({"api_adress": row[0], "template_type": row[1]})

        # Начинаем формировать sitemap.xml
        sitemap_lines = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'
            ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'
            ' xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"'
            ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'
            ' xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9'
            ' http://www.sitemaps.org/schemas/sitemap/0.9/siteindex.xsd">'
        ]

        for url in urls:
            segments = [s for s in url["api_adress"].split("/") if s]
            depth = len(segments)

            priority = round(max(1.0 - 0.1 * depth, 0.1), 1)

            lastmod = datetime.now(timezone.utc).isoformat(timespec="seconds")

            api_adress = url["api_adress"]

            if api_adress == "/main":
                sitemap_lines.append("  <url>")
                sitemap_lines.append(f"    <loc>https://vip-boat.ru</loc>")
                sitemap_lines.append(f"    <lastmod>{lastmod}</lastmod>")
                sitemap_lines.append(f"    <changefreq>daily</changefreq>")
                sitemap_lines.append("    <priority>1.0</priority>")
                sitemap_lines.append("  </url>")
            else:
                sitemap_lines.append("  <url>")
                sitemap_lines.append(f"    <loc>https://vip-boat.ru{api_adress}</loc>")
                sitemap_lines.append(f"    <lastmod>{lastmod}</lastmod>")
                sitemap_lines.append(f"    <changefreq>daily</changefreq>")
                sitemap_lines.append(f"    <priority>{priority}</priority>")

                if url["template_type"] == "ProductPage":
                    api_address = url["api_adress"].replace("'", "''")  # экранируем одинарные кавычки
                    query = f"""
                        SELECT image_src
                        FROM products_images
                        JOIN products ON products_images.group_id = products.id
                        WHERE products.api_adress = '{api_address}';
                    """
                    result_images = subprocess.run(
                        [
                            "psql",
                            "-h", DB_HOST,
                            "-U", DB_USER,
                            "-d", DB_NAME,
                            "-t",
                            "-A",  # без выравнивания
                            "-c", query
                        ],
                        check=True,
                        text=True,
                        capture_output=True,
                        env={"PGPASSWORD": DB_PASSWORD}
                    )

                    images = [line.strip() for line in result_images.stdout.strip().split("\n") if line.strip()]

                    for image in images:
                        sitemap_lines.append("    <image:image>")
                        sitemap_lines.append(f"      <image:loc>{image}</image:loc>")
                        sitemap_lines.append("    </image:image>")

                    query_video = f"""
                        SELECT video
                        FROM products_pages
                        JOIN products ON products_pages.group_id = products.id
                        WHERE products.api_adress = '{api_address}';
                    """

                    result_video = subprocess.run(
                        [
                            "psql",
                            "-h", DB_HOST,
                            "-U", DB_USER,
                            "-d", DB_NAME,
                            "-t",
                            "-A",
                            "-c", query_video
                        ],
                        check=True,
                        text=True,
                        capture_output=True,
                        env={"PGPASSWORD": DB_PASSWORD}
                    )

                    video = result_video.stdout.strip()

                    if video and video.lower() != "null":
                        sitemap_lines.append("    <video:video>")
                        sitemap_lines.append(f"      <video:content_loc>{video}</video:content_loc>")
                        sitemap_lines.append("    </video:video>")

                sitemap_lines.append("  </url>")

        sitemap_lines.append("  <url>")
        sitemap_lines.append(f"    <loc>https://vip-boat.ru/privacy-policy</loc>")
        sitemap_lines.append(f"    <lastmod>{lastmod}</lastmod>")
        sitemap_lines.append(f"    <changefreq>daily</changefreq>")
        sitemap_lines.append("    <priority>0.5</priority>")
        sitemap_lines.append("  </url>")

        sitemap_lines.append("  <url>")
        sitemap_lines.append(f"    <loc>https://vip-boat.ru/rent-policy</loc>")
        sitemap_lines.append(f"    <lastmod>{lastmod}</lastmod>")
        sitemap_lines.append(f"    <changefreq>daily</changefreq>")
        sitemap_lines.append("    <priority>0.5</priority>")
        sitemap_lines.append("  </url>")

        sitemap_lines.append("</urlset>")

        sitemap_content = "\n".join(sitemap_lines)

        # Записываем в файл
        with open("/srv/yacht_sitemap/sitemap.xml", "w", encoding="utf-8") as f:
            f.write(sitemap_content)

        print("sitemap.xml has been generated.")

    except Exception as e:
        print("Error running command:", e)
        print(e)

if __name__ == "__main__":
    print("running sitemap.xml container")
    wait_for_db_dns(DB_HOST)
    wait_for_db(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)
    while True:
        try:
            asyncio.run(fill_sitemap_xml())
        except Exception as e:
            print(e)
        time.sleep(86400)