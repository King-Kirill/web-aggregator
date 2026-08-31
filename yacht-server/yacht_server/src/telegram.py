from datetime import date, time
from dotenv import load_dotenv
import os
import re
import httpx
import aiohttp

name_pattern = re.compile(r"^[A-Za-zА-Яа-яЁё]+([ -][A-Za-zА-Яа-яЁё]+)*$")
phone_pattern = re.compile(r"^(?:\+7|8)\s?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$")

def validate_name(name: str) -> bool:
    return bool(name_pattern.fullmatch(name))

def validate_phone(phone: str) -> bool:
    return bool(phone_pattern.fullmatch(phone))

load_dotenv()

TOKEN = os.getenv("TOKEN")
CHAT_ID = os.getenv("CHAT_ID")

async def send_max_message(text: str):
    headers = {
        "Authorization": TOKEN,
        "Content-Type": "application/json"
    }

    payload = {
        "text": text
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(
            f"https://platform-api.max.ru/messages?user_id={CHAT_ID}",
            headers=headers,
            json=payload
        ) as response:

            if response.status == 200:
                return True

            response_text = await response.text()
            print(response_text)

            return False


async def sendTaskRequest(name: str, phone: str, email: str, text: str):
    try:
        if not validate_phone(phone):
            return False

        if not validate_name(name):
            return False

        message = (
            f"📩 Обратная связь\n\n"
            f"Имя: {name}\n"
            f"Телефон: {phone}\n"
            f"Почта: {email}\n"
            f"Вопрос: {text}"
        )

        return await send_max_message(message)

    except Exception as e:
        print(e)
        return False


async def sendMessage(
    user_name: str,
    phone: str,
    product_name: str
):
    try:
        if not validate_phone(phone):
            return False

        if not validate_name(user_name):
            return False

        message = (
            f"🛒 Заказ услуги\n\n"
            f"Услуга: {product_name}\n"
            f"Имя: {user_name}\n"
            f"Телефон: {phone}\n"
        )

        return await send_max_message(message)

    except Exception as e:
        print(e)
        return False


async def sendSimpleMessage(user_name: str, phone: str):
    try:
        if not validate_phone(phone):
            return False

        if not validate_name(user_name):
            return False

        message = (
            f"📞 Заказ звонка\n\n"
            f"Имя: {user_name}\n"
            f"Телефон: {phone}"
        )

        return await send_max_message(message)

    except Exception as e:
        print(e)
        return False


async def send_review_request(
    ip_adress: str,
    text: str,
    rating: int,
    user_name: str,
    email: str
):
    try:
        message = (
            f"⭐ Новый отзыв\n\n"
            f"Пользователь: {user_name}\n"
            f"IP: {ip_adress}\n"
            f"Оценка: {rating}\n"
            f"Текст: {text}\n"
            f"Email: {email}"
        )

        return await send_max_message(message)

    except Exception as e:
        print(e)
        return False

# async def sendTaskRequest(name: str, phone: str, email: str, text: str):
#     try:
#         if not validate_phone(phone):
#             return False
        
#         if not validate_name(name):
#             return False

#         message = (
#         f"<b>Обратная связь</b>\n"
#         f"Имя: {name}\n"
#         f"Телефон: {phone}\n"
#         f"Почта: {email}\n"
#         f"Вопрос: {text}\n"
#         )

#         await bot.send_message(chat_id=CHAT_ID, text=message, parse_mode="HTML")
#         return True
#     except Exception as e:
#         return False

# async def sendMessage(user_name: str, phone: str, ppl_amount: int, date: str, time: str, product_name: str):
#     try:
#         if not validate_phone(phone):
#             return False
        
#         if not validate_name(user_name):
#             return False
        
#         message = (
#         f"<b>Заказ услуги</b>\n"
#         f"Услуга: {product_name}\n"
#         f"Имя: {user_name}\n"
#         f"Телефон: {phone}\n"
#         f"Количество человек: {ppl_amount}\n"
#         f"Дата: {date}\n"
#         f"Время: {time}"
#         )

#         await bot.send_message(chat_id=CHAT_ID, text=message, parse_mode="HTML")
#         return True
#     except Exception as e:
#         return False
    
# async def sendSimpleMessage(user_name: str, phone: str):
#     try:
#         if not validate_phone(phone):
#             return False
        
#         if not validate_name(user_name):
#             return False

#         message = (
#         f"<b>Заказ звонка</b>\n"
#         f"Имя: {user_name}\n"
#         f"Телефон: {phone}\n"
#         )

#         await bot.send_message(chat_id=CHAT_ID, text=message, parse_mode="HTML")
#         return True
#     except Exception as e:
#         return False
    
# async def send_review_request(ip_adress: str, text: str, rating: int, user_name: str, email: str):
#     try:
        
#         message = (
#         f"<b>Пользователь {user_name} оставил отзыв</b>\n"
#         f"Адрес: {ip_adress}\n"
#         f"Оценка: {rating}\n"
#         f"Текст отзыва: {text}\n"
#         f"Email: {email}\n"
#         )

#         await bot.send_message(chat_id=CHAT_ID, text=message, parse_mode="HTML")
#         return True
#     except Exception as e:
#         return False