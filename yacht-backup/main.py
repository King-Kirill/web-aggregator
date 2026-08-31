import subprocess
import os
from storage import S3Client
import time
import asyncio
import psycopg2
import socket

storage_client = S3Client()

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

MAX_BACKUPS = 5
COUNTER_FILE = "counter.txt"

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

# метод сохранения индекса и считывания его
def get_next_index():
    # Если файла нет, начинаем с 1
    if not os.path.exists(COUNTER_FILE):
        next_index = 1
    else:
        with open(COUNTER_FILE, "r") as f:
            try:
                current = int(f.read().strip())
            except ValueError:
                current = 0
        next_index = (current % MAX_BACKUPS) + 1

    # Сохраняем новый индекс
    with open(COUNTER_FILE, "w") as f:
        f.write(str(next_index))

    return next_index

async def backup():
    # задаем имя файлу дампа и добавляем сжатие
    print("trying to send the backup")

    index = get_next_index()
    filename = f"/tmp/backup_{index}.sql.gz"
    
    # команда для запуска в shell линуха
    cmd = (
        f"pg_dump -h {DB_HOST} -U {DB_USER} {DB_NAME} "
        f"| gzip > {filename}"
    )

    # запуск суб процесса линуха с запуском команды
    try:
        subprocess.run(
            cmd,
            shell=True,
            check=True,
            env={"PGPASSWORD": DB_PASSWORD}
        )
    except Exception as e:
        print(e)


    # пуш в backet storage
    try:
       await storage_client.upload_file(filename)
    except Exception as e:
        print(e)

    # удаление локальной копии образа бд
    os.remove(filename)

if __name__ == "__main__":
    print("running backup container")
    wait_for_db_dns(DB_HOST)
    wait_for_db(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)
    while True:
        try:
            asyncio.run(backup())
        except Exception as e:
            with open("/srv/yacht_backup/backup.log", "a") as f:
                f.write(f"Error: {e}\n")
        time.sleep(86400)