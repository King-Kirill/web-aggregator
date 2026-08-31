from sqlalchemy import select, update, delete, Table, MetaData, func, and_, desc
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from datetime import datetime, date, time
from sqlalchemy.dialects.postgresql import insert
from fastapi.encoders import jsonable_encoder
from collections import Counter
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import async_sessionmaker, AsyncSession
from models import (advertisement_groups, advertisements, category_groups, categories, popular_task_groups, popular_tasks,
 product_grid_groups, products, tags, many_to_many_tags, search_tags, many_to_many_search_tags, products_images, footer, header,
  regular_reviews_groups, regular_reviews, regular_reviews_temp, yandex_reviews, simmilar_products_groups, vista, pages, shops_pages_filters, shops_pages, 
  shops_pages_filters_items, pages_components, products_pages, products_pages_description, news_pages, news_previews, regular_pages, blog_pages, main_pages, redactors, spaces, catering, catering_groups, main_swiper, maps, piers, menu_calcs, menu_options, calculators, order_seasons, week_days, calc_stuff)
from datetime import datetime, timedelta
import json
import pymysql
from sentence_transformers import SentenceTransformer
import os
from dotenv import load_dotenv
import redis
import schemas

r = redis.Redis(host="redis", port=6379)

load_dotenv()

async def search_products(session_factory: async_sessionmaker, search_str: str):
    conn = pymysql.connect(
        host=os.getenv("HOST"),
        port=int(os.getenv("PORT")),
        user=os.getenv("USER"),
        db="",
    )

    with conn.cursor() as cursor:
        words = search_str.split()
        query = " | ".join(words)
        sql = "SELECT id FROM products WHERE MATCH(%s) OPTION ranker=proximity_bm25, max_matches=100;"
        cursor.execute(sql, (query,))
        results = cursor.fetchall()

    ids = [row[0] for row in results] if results else []
    ids_to_fetch = ids[:8]

    async with session_factory() as session:
        products = await get_products_by_ids_light(session, ids_to_fetch)

    final_answer = {
        "ids": ids,
        "products": products
    }
    conn.close()
    return final_answer if results else None

def numbProducts(session_factory):
    with session_factory() as session:
        with session.begin():
            stmt = (
                select(products.c.id)
                .where(products.c.group_id.in_([1, 2, 3]))
                .order_by(products.c.id)
            )

            result = session.execute(stmt)

            order_id = 1
            for (product_id,) in result:
                upd = (
                    update(products)
                    .where(products.c.id == product_id)
                    .values(order_id=order_id)
                )
                session.execute(upd)
                order_id += 1

def seed_all(session_factory):
    with session_factory() as session:
        # category_groups
        result = session.execute(
            select(category_groups).where(category_groups.c.name == "header")
        ).first()
        if not result:
            stmt = insert(category_groups).values(name="header")
            session.execute(stmt)

        # pages
        result = session.execute(
            select(pages).where(pages.c.name == "main")
        ).first()
        if not result:
            stmt = insert(pages).values(
                name="main",
                template_type="MainPage",
                api_adress="/main"
            )
            session.execute(stmt)

        # main_pages
        result = session.execute(
            select(main_pages).where(main_pages.c.group_id == 1)
        ).first()
        if not result:
            stmt = insert(main_pages).values(
                group_id=1,
                title="яхты",
                image_src="image_src"
            )
            session.execute(stmt)
        
        # news_pages
        result = session.execute(
            select(pages).where(pages.c.name == "const_news")
        ).first()
        if not result:
            stmt = insert(pages).values(
                name="const_news",
                template_type="NewsPage",
                api_adress="/news"
            ).returning(pages.c.id)
            result = session.execute(stmt)
            page_id = result.scalar()
            
            stmt_news = insert(news_pages).values(
                group_id=page_id,
                title="Новости сайта — Блог"
            )
            session.execute(stmt_news)
        
        # cruises
        result = session.execute(
            select(pages).where(pages.c.name == "const_cruises")
        ).first()
        if not result:
            stmt = insert(pages).values(
                name="const_cruises",
                template_type="NewsPage",
                api_adress="/cruises"
            ).returning(pages.c.id)
            result = session.execute(stmt)
            page_id = result.scalar()
            
            stmt_news = insert(news_pages).values(
                group_id=page_id,
                title="Круизы"
            )
            session.execute(stmt_news)

        # redactors
        result = session.execute(
            select(redactors).where(redactors.c.name == "const_privacy_policy")
        ).first()
        if not result:
            stmt = insert(redactors).values(
                name="const_privacy_policy",
                delta={"ops": []}
            )

            session.execute(stmt)

        result = session.execute(
            select(redactors).where(redactors.c.name == "const_rent_policy")
        ).first()
        if not result:
            stmt = insert(redactors).values(
                name="const_rent_policy",
                delta={"ops": []}
            )

            session.execute(stmt)

        # products_grid_groups
        result = session.execute(
            select(product_grid_groups).where(product_grid_groups.c.name == "all")
        ).first()
        if not result:
            stmt = insert(product_grid_groups).values(
                name="all",
                cols_amount=3,
                max_price=0,
                min_price=0
            )
            session.execute(stmt)

        session.commit()

async def get_privacy_policy(session_factory: async_sessionmaker):
    async with session_factory() as session:
        stmt = (
            select(
                redactors.c.delta
            )
            .where(redactors.c.name == "const_privacy_policy")
        )
        result = await session.execute(stmt)
        row = result.scalar()

    return row

async def get_rent_policy(session_factory: async_sessionmaker):
    async with session_factory() as session:
        stmt = (
            select(
                redactors.c.delta
            )
            .where(redactors.c.name == "const_rent_policy")
        )
        result = await session.execute(stmt)
        row = result.scalar()

    return row

async def update_privacy_policy(session_factory: async_sessionmaker, name: str, delta):
    async with session_factory() as session:
        update_stmt = (
                update(redactors)
                .where(redactors.c.name == name)
                .values(
                    delta=delta
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
        
async def update_rent_policy(session_factory: async_sessionmaker, delta):
    async with session_factory() as session:
        update_stmt = (
                update(redactors)
                .where(redactors.c.name == "const_rent_policy")
                .values(
                    delta=delta
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def update_in_maps(session_factory: async_sessionmaker, id: int, desc: str, button_info: str, ref: str, image_src: str):
    async with session_factory() as session:
        update_stmt = (
                update(maps)
                .where(maps.c.id == id)
                .values(
                    desc=desc,
                    button_info=button_info,
                    ref=ref,
                    image_src=image_src
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def get_products_by_ids(session_factory: async_sessionmaker, ids: list[int], order: bool = False):
    if not ids:
        return []
    async with session_factory() as session:
        if order:
            stmt = (
            select(
                products.c.id,
                products.c.name,
                products.c.description,
                products.c.api_adress,
                products.c.price,
                products.c.discount,
                products.c.order_id,
                products.c.capacity,
                products.c.toilet,
                products.c.page_id,
                products.c.product_page_id,
                products.c.reviews_id,
                products.c.rating,
                products.c.date
            )
            .where(products.c.id.in_(ids))
            .order_by(products.c.order_id, products.c.price)
            )
        else:
            stmt = (
            select(
                products.c.id,
                products.c.name,
                products.c.description,
                products.c.api_adress,
                products.c.price,
                products.c.discount,
                products.c.order_id,
                products.c.capacity,
                products.c.toilet,
                products.c.page_id,
                products.c.product_page_id,
                products.c.reviews_id,
                products.c.rating,
                products.c.date
            )
            .where(products.c.id.in_(ids))
            .order_by(products.c.date, products.c.id)
            )

        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            images = await get_products_images_light(session, row.name)
            tags = await get_from_tags_light(session, row.name)
            search_tags = await get_from_search_tags_light(session, row.name)

            json_obj = {
                "id": row.id,
                "name": row.name,
                "description": row.description,
                "api_adress": row.api_adress,
                "rating": row.rating,
                "capacity": row.capacity,
                "toilet": row.toilet,
                "price": float(row.price) if row.price is not None else None,
                "discount": float(row.discount) if row.discount is not None else None,
                "order_id": row.order_id,
                "page_id": row.page_id,
                "product_page_id": row.product_page_id,
                "reviews_id": row.reviews_id,
                "images": images,
                "tags": tags,
                "search_tags": search_tags,
                "date": row.date.isoformat() if row.date else None
            }
            json_group.append(json_obj)

    return json_group

async def get_products_by_ids_all(session_factory: async_sessionmaker, ids: list[int]):
    if not ids:
        return []
    async with session_factory() as session:
        stmt = (
            select(
                products.c.id,
                products.c.name,
                products.c.description,
                products.c.api_adress,
                products.c.price,
                products.c.discount,
                products.c.order_id,
                products.c.capacity,
                products.c.toilet,
                products.c.rating,
                products.c.page_id,
                products.c.product_page_id,
                products.c.reviews_id,
                products.c.date
            )
            .where(products.c.id.in_(ids))
            .order_by(products.c.date, products.c.id)
            .offset(0)
            .limit(9)
            )
        
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group_toilet = []
        json_group_capacity = []
        max_price = 0
        min_price = 0

        stmt_price = (
            select(func.min(products.c.price))
                .where(products.c.id.in_(ids)) 
        )

        result_min_price = await session.execute(stmt_price)
        min_price = result_min_price.scalar()

        stmt_price_max = (
            select(func.max(products.c.price))
                .where(products.c.id.in_(ids)) 
        )

        result_max_price = await session.execute(stmt_price_max)
        max_price = result_max_price.scalar()

        stmt_toilet = (
            select(products.c.toilet)
                .where(products.c.id.in_(ids)) 
        )

        result_toilet = await session.execute(stmt_toilet)
        rows_toilet = result_toilet.fetchall()
        json_group_toilet = [row.toilet for row in rows_toilet]

        stmt_capacity = (
            select(products.c.capacity)
                .where(products.c.id.in_(ids)) 
        )

        result_capacity = await session.execute(stmt_capacity)
        rows_capacity = result_capacity.fetchall()
        json_group_capacity = [row.capacity for row in rows_capacity]

        json_group = []
        for row in rows:
            images = await get_products_images_light(session, row.name)
            tags = await get_from_tags_light(session, row.name)
            search_tags = await get_from_search_tags_light(session, row.name)

            json_obj = {
                "id": row.id,
                "name": row.name,
                "description": row.description,
                "api_adress": row.api_adress,
                "rating": row.rating,
                "capacity": row.capacity,
                "toilet": row.toilet,
                "price": float(row.price) if row.price is not None else None,
                "discount": float(row.discount) if row.discount is not None else None,
                "order_id": row.order_id,
                "page_id": row.page_id,
                "product_page_id": row.product_page_id,
                "reviews_id": row.reviews_id,
                "images": images,
                "tags": tags,
                "search_tags": search_tags,
                "date": row.date.isoformat() if row.date else None
            }
            json_group.append(json_obj)

        toilet_counts = Counter(json_group_toilet)
        capacity_counts = Counter(json_group_capacity)

        toilet_result = [{"name": name, "amount": count} for name, count in toilet_counts.items()]
        capacity_result = [{"name": name, "amount": count} for name, count in capacity_counts.items()]

        filters = {
            "min_price": float(min_price) if min_price != 0 else 0,
            "max_price": float(max_price) if max_price != 0 else 0,
            "capacities": capacity_result,
            "toilets": toilet_result
        }

        json_result = {
            "products": json_group,
            "filters": filters
        }

    return json_result

async def get_products_by_ids_light(session: AsyncSession, ids: list[int]):
    if not ids:
        return []

    stmt = (
        select(
            products.c.id,
            products.c.name,
            products.c.description,
            products.c.api_adress,
            products.c.price,
            products.c.discount,
            products.c.order_id,
            products.c.capacity,
            products.c.toilet,
            products.c.rating,
            products.c.date
        )
        .where(products.c.id.in_(ids))
        .order_by(products.c.date, products.c.id)
    )
    result = await session.execute(stmt)
    rows = result.fetchall()

    json_group = []
    for row in rows:
        images = await get_products_images_light(session, row.name)
        tags = await get_from_tags_light(session, row.name)
        search_tags = await get_from_search_tags_light(session, row.name)

        json_obj = {
            "id": row.id,
            "name": row.name,
            "description": row.description,
            "api_adress": row.api_adress,
            "rating": row.rating,
            "capacity": row.capacity,
            "toilet": row.toilet,
            "price": float(row.price) if row.price is not None else None,
            "discount": float(row.discount) if row.discount is not None else None,
            "order_id": row.order_id,
            "images": images,
            "tags": tags,
            "search_tags": search_tags,
            "date": row.date.isoformat() if row.date else None
        }
        json_group.append(json_obj)

    return json_group
    

async def update_order(session: AsyncSession, table: Table, new_order_id: int, operation: str, group_id: int = 0):
        if operation == "delete":
            if(group_id != 0):
                update_stmt = (
                update(table)
                .where(table.c.order_id >= new_order_id,
                       table.c.group_id == group_id)
                .values(order_id=table.c.order_id - 1)
                )
            else:
                update_stmt = (
                update(table)
                .where(table.c.order_id >= new_order_id)
                .values(order_id=table.c.order_id - 1)
                )
        else:
            if(group_id != 0):
                update_stmt = (
                update(table)
                .where(table.c.order_id >= new_order_id,
                       table.c.group_id == group_id)
                .values(order_id=table.c.order_id + 1)
                )
            else:
                update_stmt = (
                update(table)
                .where(table.c.order_id >= new_order_id)
                .values(order_id=table.c.order_id + 1)
                )

        await session.execute(update_stmt)
        await session.commit()

async def delete_order(session: AsyncSession, deleted_order_id: int, group_id: int):
    if group_id in (1, 2, 3):
                update_stmt = (
                update(products)
                .where(
                    products.c.group_id.in_([1, 2, 3]),
                    products.c.order_id > deleted_order_id,
                )
                .values(order_id=products.c.order_id - 1)
                )

                await session.execute(update_stmt)
                await session.commit()

# полный кастом
async def update_order_main_catalog(
    session_factory,
    id: int,
    new_order_id: int,
    old_order_id: int
):
    if new_order_id <= 0 or new_order_id == old_order_id:
        return False

    async with session_factory() as session:
        async with session.begin():

            if new_order_id < old_order_id:
                await session.execute(
                    update(products)
                    .where(
                        products.c.group_id.in_([1, 2, 3]),
                        products.c.order_id >= new_order_id,
                        products.c.order_id < old_order_id,
                        products.c.id != id
                    )
                    .values(order_id=products.c.order_id + 1)
                )

            elif old_order_id == 0:
                await session.execute(
                    update(products)
                    .where(
                        products.c.group_id.in_([1, 2, 3]),
                        products.c.order_id >= new_order_id,
                        products.c.id != id
                    )
                    .values(order_id=products.c.order_id + 1)
                )

            else:
                await session.execute(
                    update(products)
                    .where(
                        products.c.group_id.in_([1, 2, 3]),
                        products.c.order_id <= new_order_id,
                        products.c.order_id > old_order_id,
                        products.c.id != id
                    )
                    .values(order_id=products.c.order_id - 1)
                )

            await session.execute(
                update(products)
                .where(products.c.id == id)
                .values(order_id=new_order_id)
            )

        return True

# таблицы компонентов

async def cleanup_expired_tokens_reviews(session_factory: async_sessionmaker):
    async with session_factory() as session:
        stmt_delete = (
            delete(regular_reviews_temp)
            .where(regular_reviews_temp.c.expires_at < datetime.utcnow())
        )
        await session.execute(stmt_delete)
        await session.commit()

async def put_in_advertisement_groups(session_factory: async_sessionmaker, name: str):
    async with session_factory() as session:
        stmt = (insert(advertisement_groups).values(
            name=name
           )
           .returning(advertisement_groups.c.id)
        )

        result = await session.execute(stmt)
        await session.commit()
        user_id = result.scalar_one_or_none()
        return user_id
    
async def delete_from_advertisement_groups(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = (
            delete(advertisement_groups)
            .where(advertisement_groups.c.id == id)
            .returning(advertisement_groups.c.id)
        )
        result = await session.execute(stmt_delete)
        deleted_id = result.scalar_one_or_none()

        if deleted_id is None:
            return False  # ничего не удалилось
        else:
            await session.commit()
            return True
        
async def update_advertisement_groups(session_factory: async_sessionmaker, id: int, name: str):
    async with session_factory() as session:
        update_stmt = (
                update(advertisement_groups)
                .where(advertisement_groups.c.id == id)
                .values(
                    name = name
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def get_from_advertisement_groups(session_factory: async_sessionmaker):
    async with session_factory() as session:
        stmt = select(advertisement_groups)
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            json_obj = {
                  "id": row.id,
                  "name": row.name,
            }
            json_group.append(json_obj)
    
    return json_group

async def get_from_advertisement_groups_light(session: AsyncSession):
    stmt = select(advertisement_groups)
    result = await session.execute(stmt)
    rows = result.fetchall()

    json_group = []
    for row in rows:
        json_obj = {
              "id": row.id,
              "name": row.name,
        }
        json_group.append(json_obj)
    
    return json_group
    
async def put_in_advertisements(session_factory: async_sessionmaker, image_src: str, delta, button_info: str,  ref_button_info: str, ref: str, order_id: int, group_id: int):
    async with session_factory() as session:
            await update_order(session, advertisements, order_id, "add", group_id)
            stmt = (insert(advertisements).values(
               delta=delta,
               button_info=button_info,
               ref_button_info=ref_button_info,
               ref=ref,
               image_src=image_src,
               order_id=order_id,
               group_id=group_id
              ).returning(advertisements.c.id))

            result = await session.execute(stmt)
            item_id = result.scalar_one_or_none()
            await session.commit()

    return item_id

async def delete_from_advertisements(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = (delete(advertisements).where(advertisements.c.id == id)
                       .returning(advertisements.c.order_id, advertisements.c.group_id))
        result = await session.execute(stmt_delete)
        row = result.fetchone()

        if row is None:
            return False
        else:
            await update_order(session, advertisements, row.order_id, "delete", row.group_id)
            await session.commit()
            return True
    
async def update_advertisements(session_factory: async_sessionmaker, id: int, image_src: str, delta, button_info: str, ref_button_info: str, ref: str, order_id: int, group_id: int):
    async with session_factory() as session:
        update_stmt = (
                update(advertisements)
                .where(advertisements.c.id == id)
                .values(
                    image_src=image_src,
                    delta=delta,
                    button_info=button_info,
                    ref_button_info=ref_button_info,
                    ref=ref,
                    order_id=order_id,
                    group_id=group_id
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True


async def get_from_advertisements(session_factory: async_sessionmaker, name: str):
    async with session_factory() as session:
        stmt = (select(advertisements.c.id, advertisements.c.image_src, advertisements.c.delta, advertisements.c.button_info, advertisements.c.ref_button_info, advertisements.c.ref, advertisements.c.order_id).join(advertisement_groups, advertisement_groups.c.id == advertisements.c.group_id).where(advertisement_groups.c.name == name))
        result = await session.execute(stmt)
        rows = result.fetchall()
        json_group = []

        for row in rows:
            json_obj = {
                  "id": row.id,
                  "image_src": row.image_src,
                  "delta": row.delta,
                  "button_info": row.button_info,
                  "ref_button_info": row.ref_button_info,
                  "ref": row.ref,
                  "order_id": row.order_id
            }
            json_group.append(json_obj)

        return json_group

async def get_from_advertisemnts_light(session: AsyncSession, name: str):
    stmt = (select(advertisements.c.id, advertisements.c.image_src, advertisements.c.delta, advertisements.c.button_info, advertisements.c.ref_button_info, advertisements.c.ref, advertisements.c.order_id).join(advertisement_groups, advertisement_groups.c.id == advertisements.c.group_id)
    .where(advertisement_groups.c.name == name))
    result = await session.execute(stmt)
    rows = result.fetchall()
    json_group = []

    for row in rows:
        json_obj = {
              "id": row.id,
              "image_src": row.image_src,
              "delta": row.delta,
              "button_info": row.button_info,
              "ref_button_info": row.ref_button_info,
              "ref": row.ref,
              "order_id": row.order_id
        }
        json_group.append(json_obj)

    return json_group

async def put_in_catering_groups(session_factory: async_sessionmaker, name: str):
    async with session_factory() as session:
        stmt = (insert(catering_groups).values(
            name=name
           )
           .returning(catering_groups.c.id)
        )

        result = await session.execute(stmt)
        await session.commit()
        user_id = result.scalar_one_or_none()
        return user_id
    
async def delete_from_catering_groups(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = (
            delete(catering_groups)
            .where(catering_groups.c.id == id)
            .returning(catering_groups.c.id)
        )
        result = await session.execute(stmt_delete)
        deleted_id = result.scalar_one_or_none()

        if deleted_id is None:
            return False  # ничего не удалилось
        else:
            await session.commit()
            return True

async def update_catering_groups(session_factory: async_sessionmaker, id: int, name: str):
    async with session_factory() as session:
        update_stmt = (
                update(catering_groups)
                .where(catering_groups.c.id == id)
                .values(
                    name = name
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
        
async def get_from_catering_groups(session_factory: async_sessionmaker):
    async with session_factory() as session:
        stmt = select(catering_groups)
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            json_obj = {
                  "id": row.id,
                  "name": row.name,
            }
            json_group.append(json_obj)
    
    return json_group

async def get_from_catering_groups_light(session: AsyncSession):
    stmt = select(catering_groups)
    result = await session.execute(stmt)
    rows = result.fetchall()

    json_group = []
    for row in rows:
        json_obj = {
              "id": row.id,
              "name": row.name,
        }
        json_group.append(json_obj)
    
    return json_group

async def put_in_catering(session_factory: async_sessionmaker, group_id: int, title: str, text: str, image_src: str, pdf_ref: str, order_id: int):
    async with session_factory() as session:
            await update_order(session, catering, order_id, "add", group_id)
            stmt = (insert(catering).values(
               group_id=group_id,
               title=title,
               text=text,
               image_src=image_src,
               pdf_ref=pdf_ref,
               order_id=order_id
              ).returning(catering.c.id))

            result = await session.execute(stmt)
            item_id = result.scalar_one_or_none()
            await session.commit()

    return item_id

async def delete_from_catering(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = (delete(catering).where(catering.c.id == id)
                       .returning(catering.c.order_id, catering.c.group_id))
        result = await session.execute(stmt_delete)
        row = result.fetchone()

        if row is None:
            return False
        else:
            await update_order(session, catering, row.order_id, "delete", row.group_id)
            await session.commit()
            return True
    
async def update_from_catering(session_factory: async_sessionmaker, id: int, group_id: int, title: str, text: str, image_src: str, pdf_ref: str, order_id: int):
    async with session_factory() as session:
        update_stmt = (
                update(catering)
                .where(catering.c.id == id)
                .values(
                    group_id=group_id,
                    title=title,
                    text=text,
                    image_src=image_src,
                    pdf_ref=pdf_ref,
                    order_id=order_id
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
        
async def get_from_catering(session_factory: async_sessionmaker, name: str):
    async with session_factory() as session:
        stmt = (select(catering.c.id, catering.c.group_id, catering.c.title, catering.c.text, catering.c.image_src, catering.c.pdf_ref, catering.c.order_id).join(catering_groups, catering_groups.c.id == catering.c.group_id).where(catering_groups.c.name == name))
        result = await session.execute(stmt)
        rows = result.fetchall()
        json_group = []

        for row in rows:
            json_obj = {
                  "id": row.id,
                  "group_id": row.group_id,
                  "title": row.title,
                  "text": row.text,
                  "image_src": row.image_src,
                  "pdf_ref": row.pdf_ref,
                  "order_id": row.order_id
            }
            json_group.append(json_obj)

        return json_group

async def get_from_catering_light(session: AsyncSession, name: str):
    stmt = (select(catering.c.id, catering.c.group_id, catering.c.title, catering.c.text, catering.c.image_src, catering.c.pdf_ref, catering.c.order_id).join(catering_groups, catering_groups.c.id == catering.c.group_id)
    .where(catering_groups.c.name == name))
    result = await session.execute(stmt)
    rows = result.fetchall()
    json_group = []

    for row in rows:
        json_obj = {
              "id": row.id,
              "group_id": row.group_id,
              "title": row.title,
              "text": row.text,
              "image_src": row.image_src,
              "pdf_ref": row.pdf_ref,
              "order_id": row.order_id
        }
        json_group.append(json_obj)

    return json_group

async def put_in_category_groups(session_factory: async_sessionmaker, name: str):
    async with session_factory() as session:
        stmt = (insert(category_groups).values(
            name=name
           )
           .returning(category_groups.c.id)
        )

        result = await session.execute(stmt)
        await session.commit()
        group_id = result.scalar_one_or_none()
        return group_id
    
async def delete_from_category_groups(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = delete(category_groups).where(category_groups.c.id == id)
        result = await session.execute(stmt_delete)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
    
async def update_category_groups(session_factory: async_sessionmaker, id: int, name: str):
    async with session_factory() as session:
        update_stmt = (
                update(category_groups)
                .where(category_groups.c.id == id)
                .values(
                    name = name
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def get_from_category_groups(session_factory: async_sessionmaker):
    async with session_factory() as session:
        stmt = select(category_groups)
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            json_obj = {
                  "id": row.id,
                  "name": row.name,
            }
            json_group.append(json_obj)
    
    return json_group

async def get_from_category_groups_light(session: AsyncSession):
    stmt = select(category_groups)
    result = await session.execute(stmt)
    rows = result.fetchall()
    json_group = []
    for row in rows:
        json_obj = {
              "id": row.id,
              "name": row.name,
        }
        json_group.append(json_obj)
    
    return json_group
    
async def put_in_categories(session_factory: async_sessionmaker, name: str, image_src: str, api_adress: str, amount: int, order_id: int, group_id: int):
    async with session_factory() as session:
            await update_order(session, categories, order_id, "add", group_id)
            stmt = (insert(categories).values(
               group_id=group_id,
               name=name,
               image_src=image_src,
               api_adress=api_adress,
               order_id=order_id,
               amount=amount
              ).returning(categories.c.id))

            result = await session.execute(stmt)
            item_id = result.scalar_one_or_none()
            await session.commit()

    return item_id

async def delete_from_categories(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = (delete(categories).where(categories.c.id == id)
                       .returning(categories.c.order_id, categories.c.group_id))
        result = await session.execute(stmt_delete)
        row = result.fetchone()

        if row is None:
            return False
        else: 
            await update_order(session, categories, row.order_id, "delete", row.group_id)
            await session.commit()
            return True
        
async def update_categories(session_factory: async_sessionmaker, id: int, name: str, image_src: str, api_adress: str, amount: int, order_id: int, group_id: int):
    async with session_factory() as session:
        update_stmt = (
                update(categories)
                .where(categories.c.id == id)
                .values(
                    name=name,
                    image_src=image_src,
                    api_adress=api_adress,
                    amount=amount, 
                    order_id=order_id,
                    group_id=group_id
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def get_from_categories(session_factory: async_sessionmaker, name: str):
    async with session_factory() as session:
        stmt = (
            select(
                categories.c.id,
                categories.c.name,
                categories.c.image_src,
                categories.c.api_adress,
                categories.c.order_id
            )
            .join(category_groups, category_groups.c.id == categories.c.group_id)
            .where(category_groups.c.name == name)
        )
        result = await session.execute(stmt)
        rows = result.fetchall()
        json_group = []

        for row in rows:
            count_value = 0

            stmt_amount = select(
                pages.c.id, pages.c.template_type, pages.c.name
            ).where(pages.c.api_adress == row.api_adress)
            result_amount = await session.execute(stmt_amount)
            row_amount = result_amount.fetchone()

            if row_amount and row_amount.template_type == "ShopPage":
                stmt_id = (
                    select(product_grid_groups.c.id)
                    .join(shops_pages, shops_pages.c.products_id == product_grid_groups.c.id)
                    .where(shops_pages.c.page_id == row_amount.id)
                )
                result_id = await session.execute(stmt_id)
                row_id = result_id.fetchone()
                group_id = row_id.id if row_id else None

                if group_id:
                    stmt_count = select(func.count()).select_from(products).where(products.c.group_id == group_id)
                    result_count = await session.execute(stmt_count)
                    count_value = result_count.scalar() or 0

            json_obj = {
                "id": row.id,
                "name": row.name,
                "image_src": row.image_src,
                "api_adress": row.api_adress,
                "order_id": row.order_id,
                "amount": count_value
            }
            json_group.append(json_obj)

        return json_group
     
async def get_from_categories_light(session: AsyncSession, name: str):
    stmt = (select(categories.c.id, categories.c.name, categories.c.image_src, categories.c.api_adress, categories.c.order_id, categories.c.amount).join(category_groups, category_groups.c.id == categories.c.group_id)
    .where(category_groups.c.name == name))
    result = await session.execute(stmt)
    rows = result.fetchall()
    json_group = []

    for row in rows:
         json_obj = {
           "id": row.id,
           "name": row.name,
           "image_src": row.image_src,
           "api_adress": row.api_adress,
           "order_id": row.order_id,
           "amount": row.amount
         }
         json_group.append(json_obj)
        
    return json_group
     
async def put_in_task_groups(session_factory: async_sessionmaker, name: str):
     async with session_factory() as session:
        stmt = (insert(popular_task_groups).values(
            name=name
           )
           .returning(popular_task_groups.c.id)
        )

        result = await session.execute(stmt)
        await session.commit()
        group_id = result.scalar_one_or_none()
        return group_id
     
async def delete_from_task_groups(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = delete(popular_task_groups).where(popular_task_groups.c.id == id)
        result = await session.execute(stmt_delete)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
        
async def update_task_groups(session_factory: async_sessionmaker, id: int, name: str):
    async with session_factory() as session:
        update_stmt = (
                update(popular_task_groups)
                .where(popular_task_groups.c.id == id)
                .values(
                    name=name
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def get_from_task_groups(session_factory: async_sessionmaker):
    async with session_factory() as session:
        stmt = select(popular_task_groups)
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            json_obj = {
                  "id": row.id,
                  "name": row.name,
            }
            json_group.append(json_obj)
    
    return json_group

async def get_from_task_groups_light(session: AsyncSession):
    stmt = select(popular_task_groups)
    result = await session.execute(stmt)
    rows = result.fetchall()

    json_group = []
    for row in rows:
        json_obj = {
              "id": row.id,
              "name": row.name,
        }
        json_group.append(json_obj)

    return json_group
     
async def put_in_tasks(session_factory: async_sessionmaker, name: str, text: str, order_id: int, group_id: int):
    async with session_factory() as session:
            await update_order(session, popular_tasks, order_id, "add", group_id)
            stmt = (insert(popular_tasks).values(
               group_id=group_id,
               name=name,
               text=text,
               order_id=order_id
              ).returning(popular_tasks.c.id))

            result = await session.execute(stmt)
            item_id = result.scalar_one_or_none()
            await session.commit()

    return item_id

async def delete_from_tasks(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = (delete(popular_tasks).where(popular_tasks.c.id == id)
                       .returning(popular_tasks.c.order_id, popular_tasks.c.group_id))
        result = await session.execute(stmt_delete)
        row = result.fetchone()

        if row is None:
            return False
        else:
            await update_order(session, popular_tasks, row.order_id, "delete", row.group_id)
            await session.commit()
            return True
        
async def update_tasks(session_factory: async_sessionmaker, id: int, name: str, text: str, order_id: int, group_id: int):
    async with session_factory() as session:
        update_stmt = (
                update(popular_tasks)
                .where(popular_tasks.c.id == id)
                .values(
                    name=name,
                    text=text,
                    order_id=order_id,
                    group_id=group_id
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def get_from_tasks(session_factory: async_sessionmaker, name: str):
    async with session_factory() as session:
        stmt = (select(popular_tasks.c.id, popular_tasks.c.name, popular_tasks.c.text, popular_tasks.c.order_id).join(popular_task_groups, popular_task_groups.c.id == popular_tasks.c.group_id)
        .where(popular_task_groups.c.name == name))
        result = await session.execute(stmt)
        rows = result.fetchall()
        json_group = []

        for row in rows:
             json_obj = {
                  "id": row.id,
                  "name": row.name,
                  "text": row.text,
                  "order_id": row.order_id
             }
             json_group.append(json_obj)
        
        return json_group
    
async def get_from_tasks_light(session: AsyncSession, name: str):
    stmt = (select(popular_tasks.c.id, popular_tasks.c.name, popular_tasks.c.text, popular_tasks.c.order_id).join(popular_task_groups, popular_task_groups.c.id == popular_tasks.c.group_id)
    .where(popular_task_groups.c.name == name))
    result = await session.execute(stmt)
    rows = result.fetchall()
    json_group = []

    for row in rows:
         json_obj = {
              "id": row.id,
              "name": row.name,
              "text": row.text,
              "order_id": row.order_id
         }
         json_group.append(json_obj)
        
    return json_group
     
async def put_in_search_tags(session_factory: async_sessionmaker, name: str):
    async with session_factory() as session:
            stmt = (insert(search_tags).values(
               name=name,
              )
              .returning(search_tags.c.id)
            )

            result = await session.execute(stmt)
            await session.commit()
            tag_id = result.scalar_one_or_none()

            if tag_id is None:
                return None
            else:
                return tag_id
    
async def delete_from_search_tags(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = delete(search_tags).where(search_tags.c.id == id)
        result = await session.execute(stmt_delete)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
        
async def update_search_tags(session_factory: async_sessionmaker, id: int, name: str):
    async with session_factory() as session:
        update_stmt = (
                update(search_tags)
                .where(search_tags.c.id == id)
                .values(
                    name=name
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def get_from_search_tags(session_factory: async_sessionmaker, name: str):
    async with session_factory() as session:
        stmt = (select(many_to_many_search_tags.c.tag_id).join(products, products.c.id == many_to_many_search_tags.c.product_id)
        .where(products.c.name == name))
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            stmt_3 = select(search_tags.c.id, search_tags.c.name).where(search_tags.c.id == row.tag_id)
            result_2 = await session.execute(stmt_3)
            tag_row = result_2.first()

            if tag_row:
                json_obj = {
                    "id": tag_row.id,
                    "name": tag_row.name
                }
                json_group.append(json_obj)
        
    return json_group

async def get_all_from_search_tags_names(session_factory: async_sessionmaker):
    async with session_factory() as session:
        stmt = (select(search_tags.c.name))
        result = await session.execute(stmt)

        rows = result.fetchall()

        if len(rows) == 0:
            return None

        names = [row[0] for row in rows]

    return names

async def get_all_from_tags_names(session_factory: async_sessionmaker):
    async with session_factory() as session:
        stmt = (select(tags.c.name))
        result = await session.execute(stmt)

        rows = result.fetchall()

        if len(rows) == 0:
            return None

        names = [row[0] for row in rows]

    return names
    
async def get_from_search_tags_light(session: AsyncSession, name: str):
    stmt = (select(many_to_many_search_tags.c.tag_id).join(products, products.c.id == many_to_many_search_tags.c.product_id)
    .where(products.c.name == name))
    result = await session.execute(stmt)
    rows = result.fetchall()

    json_group = []
    for row in rows:
        stmt_3 = select(search_tags.c.id, search_tags.c.name).where(search_tags.c.id == row.tag_id)
        result_2 = await session.execute(stmt_3)
        tag_row = result_2.first()

        if tag_row:
            json_obj = {
                "id": tag_row.id,
                "name": tag_row.name
            }
            json_group.append(json_obj)
        
    return json_group
    
async def get_all_from_search_tags(session_factory: async_sessionmaker):
    async with session_factory() as session:
        stmt = select(search_tags)
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            json_obj = {
                    "id": row.id,
                    "name": row.name
                }
            json_group.append(json_obj)
        
        return json_group

async def put_in_tags(session_factory: async_sessionmaker, name: str, image_src: str):
    async with session_factory() as session:
            stmt = (insert(tags).values(
               name=name,
               image_src=image_src
              )
              .returning(tags.c.id)
            )

            result = await session.execute(stmt)
            await session.commit()
            tag_id = result.scalar_one_or_none()

            if tag_id is None:
                return None
            else:
                return tag_id
            
async def delete_from_many_tags(session_factory: async_sessionmaker, tag_id: int, product_id: int):
    async with session_factory() as session:
        stmt_delete = (delete(many_to_many_tags).where((many_to_many_tags.c.tag_id == tag_id) & 
        (many_to_many_tags.c.product_id == product_id)))
        result = await session.execute(stmt_delete)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
        
async def delete_from_many_search_tags(session_factory: async_sessionmaker, tag_id: int, product_id: int):
    async with session_factory() as session:
        stmt_delete = (delete(many_to_many_search_tags).where((many_to_many_search_tags.c.tag_id == tag_id) & 
        (many_to_many_search_tags.c.product_id == product_id)))
        result = await session.execute(stmt_delete)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
        
async def delete_from_tags(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = (delete(tags).where(tags.c.id == id))
        result = await session.execute(stmt_delete)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def get_from_tags(session_factory: async_sessionmaker, name: str):
    async with session_factory() as session:
        stmt = (select(many_to_many_tags.c.tag_id).join(products, products.c.id ==  many_to_many_tags.c.product_id)
                      .where(products.c.name == name))
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            stmt_3 = select(tags.c.id, tags.c.name, tags.c.image_src).where(tags.c.id == row.tag_id)
            result_2 = await session.execute(stmt_3)
            tag_row = result_2.first()

            if tag_row:
                json_obj = {
                    "id": tag_row.id,
                    "name": tag_row.name,
                    "image_src": tag_row.image_src
                }
                json_group.append(json_obj)
        
        return json_group
    
async def get_from_tags_light(session: AsyncSession, name: str):
    stmt = (select(many_to_many_tags.c.tag_id).join(products, products.c.id ==  many_to_many_tags.c.product_id)
                  .where(products.c.name == name))
    result = await session.execute(stmt)
    rows = result.fetchall()

    json_group = []
    for row in rows:
        stmt_3 = select(tags.c.id, tags.c.name, tags.c.image_src).where(tags.c.id == row.tag_id)
        result_2 = await session.execute(stmt_3)
        tag_row = result_2.first()

        if tag_row:
            json_obj = {
                "id": tag_row.id,
                "name": tag_row.name,
                "image_src": tag_row.image_src
            }
            json_group.append(json_obj)
    
    return json_group
    
async def get_all_from_tags(session_factory: async_sessionmaker):
    async with session_factory() as session:
        stmt = select(tags)
        result = await session.execute(stmt)
        rows = result.all()

        json_group = []
        for row in rows:
            json_obj = {
                    "id": row.id,
                    "name": row.name,
                    "image_src": row.image_src
                }
            json_group.append(json_obj)

    return json_group

async def put_in_product_groups(session_factory: async_sessionmaker, name: str, cols: int, max_price: float, min_price: float):
    async with session_factory() as session:
        stmt = (insert(product_grid_groups).values(
            name=name,
            cols_amount=cols,
            max_price=max_price,
            min_price=min_price
           )
           .returning(product_grid_groups.c.id)
        )

        result = await session.execute(stmt)
        await session.commit()
        group_id = result.scalar_one_or_none()
        return group_id
    
async def delete_from_product_grid_groups(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_select = select(shops_pages).where(shops_pages.c.products_id == id)
        result_select = session.execute(stmt_select)

        if result_select.rowcount != 0: 
            return False
        
        stmt_delete = delete(product_grid_groups).where(product_grid_groups.c.id == id)
        result = await session.execute(stmt_delete)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
        
async def update_product_grid_groups(session_factory: async_sessionmaker, id: int, name: str, cols: int, max_price: float, min_price: float):
    async with session_factory() as session:
        update_stmt = (
                update(product_grid_groups)
                .where(product_grid_groups.c.id == id)
                .values(
                    name=name,
                    cols_amount=cols,
                    max_price=max_price,
                    min_price=min_price
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def get_from_product_grid_groups(session_factory: async_sessionmaker):
    async with session_factory() as session:
        stmt = select(product_grid_groups)
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            json_obj = {
                  "id": row.id,
                  "name": row.name,
                  "cols_amount": row.cols_amount,
                  "max_price": float(row.max_price) if row.max_price is not None else None,
                  "min_price": float(row.min_price) if row.min_price is not None else None
            }
            json_group.append(json_obj)
    
    return json_group

async def get_from_product_grid_groups_light(session: AsyncSession):
    stmt = select(product_grid_groups)
    result = await session.execute(stmt)
    rows = result.fetchall()

    json_group = []
    for row in rows:
        json_obj = {
              "id": row.id,
              "name": row.name,
              "cols_amount": row.cols_amount,
              "max_price": float(row.max_price) if row.max_price is not None else None,
              "min_price": float(row.min_price) if row.min_price is not None else None
        }
        json_group.append(json_obj)
    
    return json_group
     
async def put_in_products(session_factory: async_sessionmaker, name: str, description: str, discount: float, price: float, group_id: int, api_adress: str, capacity: int, rating: int, tags_list, to_search_tags_list, order_id: int, toilet: str, page_id: int, product_page_id: int, reviews_id: int, date: str):
    async with session_factory() as session:
            stmt = (insert(products).values(
                 group_id=group_id,
                 name=name,
                 description=description,
                 api_adress=api_adress,
                 capacity=capacity,
                 toilet=toilet,
                 rating=rating,
                 price=price,
                 discount=discount,
                 order_id=order_id,
                 page_id=page_id,
                 product_page_id=product_page_id,
                 reviews_id=reviews_id,
                 date=date
              )
               .returning(products.c.id)
              )

            result = await session.execute(stmt)
            await session.commit()
            item_id = result.scalar_one_or_none()

            if item_id is None:
                return None 
            
            # Вставка в many_to_many_tags
            regularTags_list = []
            if tags_list:
                stmt_tags = (
                    insert(many_to_many_tags)
                    .values([{"product_id": item_id, "tag_id": tag} for tag in tags_list])
                    .on_conflict_do_nothing(index_elements=['product_id', 'tag_id'])
                )
                await session.execute(stmt_tags)

                stmt_select = select(tags.c.name).where(tags.c.id.in_(tags_list))
                result = await session.execute(stmt_select)
                regularTags_list = [row.name for row in result.fetchall()]

            # Вставка в many_to_many_search_tags
            searchTags_list = []
            if to_search_tags_list:
                stmt_search_tags = (
                    insert(many_to_many_search_tags)
                    .values([{"product_id": item_id, "tag_id": tag} for tag in to_search_tags_list])
                    .on_conflict_do_nothing(index_elements=['product_id', 'tag_id'])
                )
                await session.execute(stmt_search_tags)

                stmt_select = select(search_tags.c.name).where(search_tags.c.id.in_(to_search_tags_list))
                result = await session.execute(stmt_select)
                searchTags_list = [row.name for row in result.fetchall()]

            conn = pymysql.connect(
                host=os.getenv("HOST"),
                port=int(os.getenv("PORT")),
                user=os.getenv("USER"),
                db="",
            )
            
            with conn.cursor() as cursor:

                doc_text_parts = [
                    name or "",
                    description or "",
                    " ".join(regularTags_list) if regularTags_list else "",
                    " ".join(searchTags_list) if searchTags_list else "",
                    str(price) if price is not None else "",
                    str(discount) if discount is not None else "",
                    str(rating) if rating is not None else "",
                    str(toilet) if toilet is not None else "",
                    str(capacity) if capacity is not None else ""
                ]
                doc_text = " ".join(filter(None, doc_text_parts))

                sql_insert = """
                    INSERT INTO products (id, doc_text)
                    VALUES (%s, %s)
                """

                cursor.execute(sql_insert, (
                    item_id,
                    doc_text or ""
                ))

                conn.commit()
            conn.close()
            await session.commit()

    return item_id

async def delete_from_products(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = (delete(products).where(products.c.id == id)
                       .returning(products.c.order_id, products.c.group_id))
        result = await session.execute(stmt_delete)
        row = result.fetchone()

        if row is None:
            return False
        else:
            await delete_order(session, row.order_id, row.group_id)
            await session.commit()
            conn = pymysql.connect(
                host=os.getenv("HOST"),
                port=int(os.getenv("PORT")),
                user=os.getenv("USER"),
                db="",
            )

            with conn.cursor() as cursor:
                sql = "DELETE FROM products WHERE id = %s"
                cursor.execute(sql, (id,))
                conn.commit()
            conn.close()
            return True
        
async def update_products(session_factory: async_sessionmaker, id: int, name: str, description: str, discount: float, price: float, group_id: int, api_adress: str, capacity: int, toilet: str, rating: int, tags_list, to_search_tags_list, date: str):
    async with session_factory() as session:
        update_stmt = (
                update(products)
                .where(products.c.id == id)
                .values(
                 group_id=group_id,
                 name=name,
                 description=description,
                 api_adress=api_adress,
                 rating=rating,
                 capacity=capacity,
                 toilet=toilet,
                 price=price,
                 discount=discount,
                 date=date
                )
                .returning(products.c.id)
            )
        
        result = await session.execute(update_stmt)
        row = result.fetchone()

        if row is None:
            await session.rollback()
            return False
        else:
            item_id = row.id

            # Вставка в many_to_many_tags
            regularTags_list = []
            if tags_list:
                stmt_tags = (
                    insert(many_to_many_tags)
                    .values([{"product_id": item_id, "tag_id": tag} for tag in tags_list])
                    .on_conflict_do_nothing(index_elements=['product_id', 'tag_id'])
                )
                await session.execute(stmt_tags)

                stmt_select = select(tags.c.name).where(tags.c.id.in_(tags_list))
                result = await session.execute(stmt_select)
                regularTags_list = [row.name for row in result.fetchall()]

            # Вставка в many_to_many_search_tags
            searchTags_list = []
            if to_search_tags_list:
                stmt_search_tags = (
                    insert(many_to_many_search_tags)
                    .values([{"product_id": item_id, "tag_id": tag} for tag in to_search_tags_list])
                    .on_conflict_do_nothing(index_elements=['product_id', 'tag_id'])
                )
                await session.execute(stmt_search_tags)

                stmt_select = select(search_tags.c.name).where(search_tags.c.id.in_(to_search_tags_list))
                result = await session.execute(stmt_select)
                searchTags_list = [row.name for row in result.fetchall()]

            product_images= await get_products_images_light(session, name)

            conn = pymysql.connect(
                host=os.getenv("HOST"),
                port=int(os.getenv("PORT")),
                user=os.getenv("USER"),
                db="",
            )
            
            with conn.cursor() as cursor:

                doc_text_parts = [
                    name or "",
                    description or "",
                    " ".join(regularTags_list) if regularTags_list else "",
                    " ".join(searchTags_list) if searchTags_list else "",
                    str(price) if price is not None else "",
                    str(discount) if discount is not None else "",
                    str(rating) if rating is not None else "",
                    str(toilet) if toilet is not None else "",
                    str(capacity) if capacity is not None else ""
                ]
                doc_text = " ".join(filter(None, doc_text_parts))

                sql_replace = """
                    REPLACE INTO products (id, doc_text)
                    VALUES (%s, %s)
                    """

                cursor.execute(sql_replace, (item_id, doc_text or ""))

                conn.commit()
            conn.close()

            await session.commit()

            return True

async def get_from_products(session_factory: async_sessionmaker, name: str, offset: int = 0):
    async with session_factory() as session:
        if name == "all":
            stmt = (
            select(
                products.c.id,
                products.c.name,
                products.c.description,
                products.c.api_adress,
                products.c.price,
                products.c.discount,
                products.c.order_id,
                products.c.capacity,
                products.c.toilet,
                products.c.rating,
                products.c.page_id,
                products.c.product_page_id,
                products.c.reviews_id,
                products.c.date
            )
            .join(product_grid_groups, product_grid_groups.c.id == products.c.group_id)
            .where(
                product_grid_groups.c.name.in_([
                    "Аренда катера",
                    "Аренда теплохода",
                    "Аренда яхты"
                ])
            )
            .order_by(products.c.order_id, products.c.price)
            .offset(offset)
            .limit(9)
            )
        else:
            stmt = (
            select(
                products.c.id,
                products.c.name,
                products.c.description,
                products.c.api_adress,
                products.c.price,
                products.c.discount,
                products.c.order_id,
                products.c.capacity,
                products.c.toilet,
                products.c.rating,
                products.c.page_id,
                products.c.product_page_id,
                products.c.reviews_id,
                products.c.date
            )
            .join(product_grid_groups, product_grid_groups.c.id == products.c.group_id)
            .where(product_grid_groups.c.name == name)
            .order_by(products.c.date, products.c.id)
            .offset(offset)
            .limit(9)
            )

        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            images = await get_products_images_light(session, row.name)
            tags = await get_from_tags_light(session, row.name)
            search_tags = await get_from_search_tags_light(session, row.name)

            json_obj = {
                "id": row.id,
                "name": row.name,
                "description": row.description,
                "api_adress": row.api_adress,
                "rating": row.rating,
                "capacity": row.capacity,
                "toilet": row.toilet,
                "price": float(row.price) if row.price is not None else None,
                "discount": float(row.discount) if row.discount is not None else None,
                "order_id": row.order_id,
                "page_id": row.page_id,
                "reviews_id": row.reviews_id,
                "product_page_id": row.product_page_id,
                "images": images,
                "tags": tags,
                "search_tags": search_tags,
                "date": row.date.isoformat() if row.date else None
            }
            json_group.append(json_obj)
        
        if name == "all":
            stmt = select(product_grid_groups).where(
                product_grid_groups.c.name.in_([
                    "Аренда катера",
                    "Аренда теплохода",
                    "Аренда яхты"
                ])
            )
        else:
            stmt = select(product_grid_groups).where(product_grid_groups.c.name == name)

        result = await session.execute(stmt)
        group_row = result.mappings().first()

        if group_row is None:
            return None

        grid_obj = {
            "id": group_row.id,
            "name": group_row.name,
            "cols_amount": group_row.cols_amount,
            "max_price": float(group_row.max_price) if group_row.max_price is not None else None,
            "min_price": float(group_row.min_price) if group_row.min_price is not None else None
        }

        to_return_obj = {
            "obj": grid_obj,
            "items": json_group
        }

        return to_return_obj
    
async def get_product_with_page_id_light(session: AsyncSession, product_page_id: int):
    stmt = (
        select(
            products.c.id,
            products.c.name,
            products.c.description,
            products.c.api_adress,
            products.c.price,
            products.c.discount,
            products.c.order_id,
            products.c.capacity,
            products.c.toilet,
            products.c.rating,
            products.c.page_id,
            products.c.reviews_id,
            products.c.product_page_id,
            products.c.date
        ).where(products.c.product_page_id == product_page_id))
    
    result = await session.execute(stmt)
    rows = result.fetchall()

    json_group = []
    for row in rows:
        images = await get_products_images_light(session, row.name)
        tags = await get_from_tags_light(session, row.name)
        search_tags = await get_from_search_tags_light(session, row.name)

        json_obj = {
            "id": row.id,
            "name": row.name,
            "description": row.description,
            "api_adress": row.api_adress,
            "rating": row.rating,
            "capacity": row.capacity,
            "toilet": row.toilet,
            "price": float(row.price) if row.price is not None else None,
            "discount": float(row.discount) if row.discount is not None else None,
            "order_id": row.order_id,
            "page_id": row.page_id,
            "reviews_id": row.reviews_id,
            "product_page_id": row.product_page_id,
            "images": images,
            "tags": tags,
            "search_tags": search_tags,
            "date": row.date.isoformat() if row.date else None
        }
        json_group.append(json_obj)

    return json_group[0] if json_group else None

async def get_from_products_light_certain(session: AsyncSession, name: str, productAdress: str):
    limit = 9
    offset = 0

    rows = []
    found = False
    found_id = 0

    while not found:
        stmt = (
            select(
                products.c.id,
                products.c.name,
                products.c.description,
                products.c.api_adress,
                products.c.price,
                products.c.discount,
                products.c.order_id,
                products.c.capacity,
                products.c.toilet,
                products.c.rating,
                products.c.page_id,
                products.c.reviews_id,
                products.c.product_page_id,
                products.c.date
            )
            .join(product_grid_groups, product_grid_groups.c.id == products.c.group_id)
            .where(product_grid_groups.c.name == name)
            .order_by(products.c.date, products.c.id)
            .offset(offset)
            .limit(limit)
        )

        result = await session.execute(stmt)
        batch = result.fetchall()
        count = len(batch)

        if not batch:
            break

        for row in batch:
            rows.append(row)

            if row.api_adress == productAdress:
                found = True
                found_id = row.id

        if found:
            break
        
        if count < 9:
            rows = rows[:9]
            break

        offset += limit

    json_group = []
    for row in rows:
        images = await get_products_images_light(session, row.name)
        tags = await get_from_tags_light(session, row.name)
        search_tags = await get_from_search_tags_light(session, row.name)

        json_obj = {
            "id": row.id,
            "name": row.name,
            "description": row.description,
            "api_adress": row.api_adress,
            "rating": row.rating,
            "capacity": row.capacity,
            "toilet": row.toilet,
            "price": float(row.price) if row.price is not None else None,
            "discount": float(row.discount) if row.discount is not None else None,
            "order_id": row.order_id,
            "page_id": row.page_id,
            "reviews_id": row.reviews_id,
            "product_page_id": row.product_page_id,
            "images": images,
            "tags": tags,
            "search_tags": search_tags,
            "date": row.date.isoformat() if row.date else None
        }
        json_group.append(json_obj)

    stmt = select(product_grid_groups).where(product_grid_groups.c.name == name)
    result = await session.execute(stmt)
    group_row = result.mappings().first()

    stmt_ids = (
        select(products.c.id)
        .join(product_grid_groups, product_grid_groups.c.id == products.c.group_id)
        .where(product_grid_groups.c.name == name)
    )
    result_ids = await session.execute(stmt_ids)
    all_ids = [r.id for r in result_ids.fetchall()]

    loaded_ids = [row.id for row in rows]
    remaining_ids = [i for i in all_ids if i not in loaded_ids]

    if group_row is None:
        return None
    
    grid_obj = {
        "id": group_row.id,
        "name": group_row.name,
        "cols_amount": group_row.cols_amount,
        "max_price": float(group_row.max_price) if group_row.max_price is not None else None,
        "min_price": float(group_row.min_price) if group_row.min_price is not None else None
    }

    if found:
        to_return_obj = {
            "obj": grid_obj,
            "ids": remaining_ids,
            "items": json_group,
            "scroll_to": found_id
        }
    else:
        to_return_obj = {
            "obj": grid_obj,
            "ids": remaining_ids,
            "items": json_group
        }

    return to_return_obj

async def get_from_shops_pages_desktop_image_src(session: AsyncSession, id: int):
    stmt = (
        select(shops_pages.c.desc_image_src)
        .join(pages, pages.c.id == shops_pages.c.page_id)
        .where(pages.c.id == id)
    )

    result = await session.execute(stmt)
    value = result.scalar_one_or_none() or ""
    return value

async def get_from_shops_pages_mobile_image_src(session: AsyncSession, id: int):
    stmt = (
        select(shops_pages.c.mobile_image_src)
        .join(pages, pages.c.id == shops_pages.c.page_id)
        .where(pages.c.id == id)
    )

    result = await session.execute(stmt)
    value = result.scalar_one_or_none() or ""
    return value
    
async def get_from_products_light(session: AsyncSession, name: str):
    if name == "all":
            stmt = (
            select(
                products.c.id,
                products.c.name,
                products.c.description,
                products.c.api_adress,
                products.c.price,
                products.c.discount,
                products.c.order_id,
                products.c.capacity,
                products.c.toilet,
                products.c.rating,
                products.c.page_id,
                products.c.product_page_id,
                products.c.reviews_id,
                products.c.date
            )
            .join(product_grid_groups, product_grid_groups.c.id == products.c.group_id)
            .where(
                product_grid_groups.c.name.in_([
                    "Аренда катера",
                    "Аренда теплохода",
                    "Аренда яхты"
                ])
            )
            .order_by(products.c.order_id, products.c.price)
            .offset(0)
            .limit(9)
            )
    else:
            stmt = (
            select(
                products.c.id,
                products.c.name,
                products.c.description,
                products.c.api_adress,
                products.c.price,
                products.c.discount,
                products.c.order_id,
                products.c.capacity,
                products.c.toilet,
                products.c.rating,
                products.c.page_id,
                products.c.product_page_id,
                products.c.reviews_id,
                products.c.date
            )
            .join(product_grid_groups, product_grid_groups.c.id == products.c.group_id)
            .where(product_grid_groups.c.name == name)
            .order_by(products.c.date, products.c.id)
            .offset(0)
            .limit(9)
            )

    result = await session.execute(stmt)
    rows = result.fetchall()

    json_group = []
    for row in rows:
        images = await get_products_images_light(session, row.name)
        tags = await get_from_tags_light(session, row.name)
        search_tags = await get_from_search_tags_light(session, row.name)

        json_obj = {
            "id": row.id,
            "name": row.name,
            "description": row.description,
            "api_adress": row.api_adress,
            "rating": row.rating,
            "capacity": row.capacity,
            "toilet": row.toilet,
            "price": float(row.price) if row.price is not None else None,
            "discount": float(row.discount) if row.discount is not None else None,
            "order_id": row.order_id,
            "page_id": row.page_id,
            "reviews_id": row.reviews_id,
            "product_page_id": row.product_page_id,
            "images": images,
            "tags": tags,
            "search_tags": search_tags,
            "date": row.date.isoformat() if row.date else None
        }
        json_group.append(json_obj)

    if name == "all":
        stmt = select(product_grid_groups).where(
            product_grid_groups.c.name.in_([
                "Аренда катера",
                "Аренда теплохода",
                "Аренда яхты"
            ])
        )
    else:
        stmt = select(product_grid_groups).where(product_grid_groups.c.name == name)

    result = await session.execute(stmt)
    group_row = result.mappings().first()

    if name == "all":
        stmt_ids = (
        select(products.c.id)
        .join(product_grid_groups, product_grid_groups.c.id == products.c.group_id)
        .where(
            product_grid_groups.c.name.in_([
                "Аренда катера",
                "Аренда теплохода",
                "Аренда яхты"
            ])
        ).order_by(products.c.order_id, products.c.price)
        )
    else:
        stmt_ids = (
        select(products.c.id)
        .join(product_grid_groups, product_grid_groups.c.id == products.c.group_id)
        .where(product_grid_groups.c.name == name)
        ).order_by(products.c.date, products.c.id)

    result_ids = await session.execute(stmt_ids)
    all_ids = [r.id for r in result_ids.fetchall()]

    loaded_ids = [row.id for row in rows]
    remaining_ids = [i for i in all_ids if i not in loaded_ids]

    if group_row is None:
        return None
    
    grid_obj = {
        "id": group_row.id,
        "name": group_row.name,
        "cols_amount": group_row.cols_amount,
        "max_price": float(group_row.max_price) if group_row.max_price is not None else None,
        "min_price": float(group_row.min_price) if group_row.min_price is not None else None
    }

    to_return_obj = {
        "obj": grid_obj,
        "ids": remaining_ids,
        "items": json_group
    }

    return to_return_obj

async def put_in_products_images(session_factory: async_sessionmaker, image_src: str, group_id: int, order_id: int):
    async with session_factory() as session:
        await update_order(session, products_images, order_id, "add", group_id)
        stmt = (insert(products_images).values(
            group_id=group_id,
            image_src=image_src,
            order_id=order_id
            ).returning(products_images.c.id))
        
        result = await session.execute(stmt)
        await session.commit()
        item_id = result.scalar_one_or_none()
    
    return item_id

async def delete_from_products_images(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = (delete(products_images).where(products_images.c.id == id)
                       .returning(products_images.c.order_id, products_images.c.group_id))
        result = await session.execute(stmt_delete)
        row = result.fetchone()

        if row is None:
            return False
        else:
            await update_order(session, products_images, row.order_id, "delete", row.group_id)
            await session.commit()
            return True
        
async def update_products_images(session_factory: async_sessionmaker, id: int, image_src: str, group_id: int, order_id: int):
    async with session_factory() as session:
        update_stmt = (
                update(products_images)
                .where(products_images.c.id == id)
                .values(
                    image_src=image_src,
                    group_id=group_id,
                    order_id=order_id
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
        
async def get_spaces(session: AsyncSession, group_id: int):
    stmt=(
            select(spaces)
            .where(spaces.c.id == group_id)
        )

    result = await session.execute(stmt)
    row = result.mappings().first()

    if not row:
        return {"error": "space not found"}

    return dict(row)

async def delete_space(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = (delete(spaces).where(spaces.c.id == id)
                       .returning(spaces.c.id))
        result = await session.execute(stmt_delete)
        row = result.fetchone()

        if row is None:
            return False
        else:
            await session.commit()
            return True
        
async def update_space(session_factory: async_sessionmaker, id: int, space: int):
    async with session_factory() as session:
        update_stmt = (
                update(spaces)
                .where(spaces.c.id == id)
                .values(
                    space=space
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def create_space(session_factory: async_sessionmaker, space: int):
    async with session_factory() as session:
        stmt=(insert(spaces).values(
            space=space
            ).returning(spaces.c.id))
        
        result = await session.execute(stmt)
        await session.commit()
        item_id = result.scalar_one_or_none()
    
    return item_id
        
async def load_products_filtered_ids(session_factory: async_sessionmaker, capacity_tags, toilet_tags, other_tags, max_price: float, min_price: float, ids):
    async with session_factory() as session:
        conditions = []

        if min_price is not None:
            conditions.append(products.c.price >= min_price)

        if max_price is not None:
            conditions.append(products.c.price <= max_price)

        if toilet_tags:
            conditions.append(products.c.toilet.in_(toilet_tags))

        if capacity_tags:
            conditions.append(products.c.capacity.in_(capacity_tags))

        stmt_ids = (
        select(products.c.id)
        .where(products.c.id.in_(ids))
        )

        stmt = (
            select(
            products.c.id,
            products.c.name,
            products.c.description,
            products.c.api_adress,
            products.c.price,
            products.c.discount,
            products.c.order_id,
            products.c.capacity,
            products.c.toilet,
            products.c.rating,
            products.c.page_id,
            products.c.reviews_id,
            products.c.product_page_id,
            products.c.date
        )
        .where(products.c.id.in_(ids))
        )

        if conditions:
            stmt = stmt.where(and_(*conditions))
            stmt_ids = stmt_ids.where(and_(*conditions))

        if other_tags:
            for tag in other_tags:
                if(tag == "popularity"):
                    stmt = stmt.order_by(products.c.popularity.asc())
                    stmt_ids = stmt_ids.order_by(products.c.popularity.asc())
                elif(tag == "rating"):
                    stmt = stmt.order_by(products.c.rating.desc())
                    stmt_ids = stmt_ids.order_by(products.c.rating.desc())
                elif(tag == "newest"):
                    stmt = stmt.order_by(products.c.id.desc())
                    stmt_ids = stmt_ids.order_by(products.c.id.desc())
                elif(tag == "low_to_high"):
                    stmt = stmt.order_by(products.c.price.asc())
                    stmt_ids = stmt_ids.order_by(products.c.price.asc())
                elif(tag == "high_to_low"):
                    stmt = stmt.order_by(products.c.price.desc())
                    stmt_ids = stmt_ids.order_by(products.c.price.desc())
        else:
            stmt = stmt.order_by(products.c.date).order_by(products.c.id.asc())
            stmt_ids = stmt_ids.order_by(products.c.id.asc())
                
        stmt = stmt.offset(0).limit(9)

        result = await session.execute(stmt)
        rows = result.fetchall()

        result_ids = await session.execute(stmt_ids)
        all_ids = [r.id for r in result_ids.fetchall()]

        loaded_ids = [row.id for row in rows]
        remaining_ids = [i for i in all_ids if i not in loaded_ids]

        json_group = []
        for row in rows:
            images = await get_products_images_light(session, row.name)
            tags = await get_from_tags_light(session, row.name)
            search_tags = await get_from_search_tags_light(session, row.name)

            json_obj = {
                "id": row.id,
                "name": row.name,
                "description": row.description,
                "api_adress": row.api_adress,
                "rating": row.rating,
                "capacity": row.capacity,
                "toilet": row.toilet,
                "price": float(row.price) if row.price is not None else None,
                "discount": float(row.discount) if row.discount is not None else None,
                "order_id": row.order_id,
                "page_id": row.page_id,
                "reviews_id": row.reviews_id,
                "product_page_id": row.product_page_id,
                "images": images,
                "tags": tags,
                "search_tags": search_tags,
                "date": row.date.isoformat() if row.date else None
            }
            json_group.append(json_obj)

    to_return_obj = {
        "ids": remaining_ids,
        "items": json_group
    }

    return to_return_obj
        
async def load_products_filtered(session_factory: async_sessionmaker, capacity_tags, toilet_tags, other_tags, max_price: float, min_price: float, group_id: int):
    async with session_factory() as session:
        conditions = []

        if min_price is not None:
            conditions.append(products.c.price >= min_price)

        if max_price is not None:
            conditions.append(products.c.price <= max_price)

        if toilet_tags:
            conditions.append(products.c.toilet.in_(toilet_tags))

        if capacity_tags:
            conditions.append(products.c.capacity.in_(capacity_tags))

        stmt_ids = (
        select(products.c.id)
        .join(product_grid_groups, product_grid_groups.c.id == products.c.group_id)
        .where(product_grid_groups.c.id == group_id)
        )

        stmt = (
            select(
            products.c.id,
            products.c.name,
            products.c.description,
            products.c.api_adress,
            products.c.price,
            products.c.discount,
            products.c.order_id,
            products.c.capacity,
            products.c.toilet,
            products.c.rating,
            products.c.page_id,
            products.c.reviews_id,
            products.c.product_page_id,
            products.c.date
        )
        .join(product_grid_groups, product_grid_groups.c.id == products.c.group_id)
        ).where(product_grid_groups.c.id == group_id)

        if conditions:
            stmt = stmt.where(and_(*conditions))
            stmt_ids = stmt_ids.where(and_(*conditions))

        if other_tags:
            for tag in other_tags:
                if(tag == "popularity"):
                    stmt = stmt.order_by(products.c.popularity.asc())
                    stmt_ids = stmt_ids.order_by(products.c.popularity.asc())
                elif(tag == "rating"):
                    stmt = stmt.order_by(products.c.rating.desc())
                    stmt_ids = stmt_ids.order_by(products.c.rating.desc())
                elif(tag == "newest"):
                    stmt = stmt.order_by(products.c.id.desc())
                    stmt_ids = stmt_ids.order_by(products.c.id.desc())
                elif(tag == "low_to_high"):
                    stmt = stmt.order_by(products.c.price.asc())
                    stmt_ids = stmt_ids.order_by(products.c.price.asc())
                elif(tag == "high_to_low"):
                    stmt = stmt.order_by(products.c.price.desc())
                    stmt_ids = stmt_ids.order_by(products.c.price.desc())
        else:
            stmt = stmt.order_by(products.c.date).order_by(products.c.id.asc())
            stmt_ids = stmt_ids.order_by(products.c.id.asc())
                
        stmt = stmt.offset(0).limit(9)

        result = await session.execute(stmt)
        rows = result.fetchall()

        result_ids = await session.execute(stmt_ids)
        all_ids = [r.id for r in result_ids.fetchall()]

        loaded_ids = [row.id for row in rows]
        remaining_ids = [i for i in all_ids if i not in loaded_ids]

        json_group = []
        for row in rows:
            images = await get_products_images_light(session, row.name)
            tags = await get_from_tags_light(session, row.name)
            search_tags = await get_from_search_tags_light(session, row.name)

            json_obj = {
                "id": row.id,
                "name": row.name,
                "description": row.description,
                "api_adress": row.api_adress,
                "rating": row.rating,
                "capacity": row.capacity,
                "toilet": row.toilet,
                "price": float(row.price) if row.price is not None else None,
                "discount": float(row.discount) if row.discount is not None else None,
                "order_id": row.order_id,
                "page_id": row.page_id,
                "reviews_id": row.reviews_id,
                "product_page_id": row.product_page_id,
                "images": images,
                "tags": tags,
                "search_tags": search_tags,
                "date": row.date.isoformat() if row.date else None
            }
            json_group.append(json_obj)

    to_return_obj = {
        "ids": remaining_ids,
        "items": json_group
    }

    return to_return_obj

        
async def update_product_popularity(session_factory: async_sessionmaker, productId: int):
    async with session_factory() as session:
        stmt = (
            update(products).where(products.c.id == productId).values(popularity=func.coalesce(products.c.popularity, 0) + 1)
        )

        result = await session.execute(stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
     
async def get_products_images(session_factory: async_sessionmaker, name: str):
    async with session_factory() as session:
        stmt = (select(products_images.c.id, products_images.c.image_src, products_images.c.order_id).join(products, products.c.id == products_images.c.group_id)
                .where(products.c.name == name))
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            json_obj = {
                    "id": row.id,
                    "src": row.image_src,
                    "order_id": row.order_id
                }
            json_group.append(json_obj)
    
    return json_group

async def get_products_images_light(session: AsyncSession, name: str):
    stmt = (
        select(
            products_images.c.id,
            products_images.c.image_src,
            products_images.c.order_id
        )
        .join(products, products.c.id == products_images.c.group_id)
        .where(products.c.name == name)
        .order_by(desc(products_images.c.order_id))
    )
    result = await session.execute(stmt)
    rows = result.fetchall()

    json_group = []
    for row in rows:
        json_obj = {
                "id": row.id,
                "src": row.image_src,
                "order_id": row.order_id
            }
        json_group.append(json_obj)
    
    return json_group

async def put_in_footer(session_factory: async_sessionmaker, name: str, api_adress: str, order_id: int):
    async with session_factory() as session:
        await update_order(session, footer, order_id, "add")
        stmt = (insert(footer).values(
            order_id = order_id,
            name = name,
            api_adress = api_adress
            ).returning(footer.c.id))
        
        result = await session.execute(stmt)
        await session.commit()
        item_id = result.scalar_one_or_none()
    
    return item_id

async def delete_from_footer(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = (delete(footer).where(footer.c.id == id)
                       .returning(footer.c.order_id))
        result = await session.execute(stmt_delete)
        row = result.fetchone()

        if row is None:
            return False
        else:
            await update_order(session, footer, row.order_id, "delete")
            await session.commit()
            return True
        
async def update_footer(session_factory: async_sessionmaker, id: int, name: str, api_adress: str, order_id: int):
    async with session_factory() as session:
        update_stmt = (
                update(footer)
                .where(footer.c.id == id)
                .values(
                    name=name,
                    api_adress=api_adress,
                    order_id=order_id
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
     
async def get_from_footer(session_factory: async_sessionmaker):
    async with session_factory() as session:
        stmt = select(footer)
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            json_obj = {
                    "id": row.id,
                    "order_id": row.order_id,
                    "name": row.name,
                    "api_adress": row.api_adress
                }
            json_group.append(json_obj)

    return json_group

async def get_from_footer_light(session: AsyncSession):
    stmt = select(footer)
    result = await session.execute(stmt)
    rows = result.fetchall()

    json_group = []
    for row in rows:
        json_obj = {
                "id": row.id,
                "order_id": row.order_id,
                "name": row.name,
                "api_adress": row.api_adress
            }
        json_group.append(json_obj)

    return json_group

async def put_in_header(session_factory: async_sessionmaker, name: str, api_adress: str, order_id: int, group_id: int):
    try:
        async with session_factory() as session:
            if name == "":
                return None
            stmt = (
                insert(header)
                .values(
                    order_id=order_id,
                    name=name,
                    api_adress=api_adress,
                    group_id=group_id
                )
                .returning(header.c.id)
            )

            result = await session.execute(stmt)
            await session.commit()
            item_id = result.scalar_one_or_none()

            return item_id

    except SQLAlchemyError as e:
        raise e

    except Exception as e:
        raise e

async def delete_from_header(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = (delete(header).where(header.c.id == id)
                       .returning(header.c.id))
        result = await session.execute(stmt_delete)
        row = result.fetchone()

        if row is None:
            return False
        else:
            await session.commit()
            return True
        
async def update_header(session_factory: async_sessionmaker, id: int, name: str, api_adress: str, order_id: int, group_id: int):
    async with session_factory() as session:
        update_stmt = (
                update(header)
                .where(header.c.id == id)
                .values(
                    name=name,
                    api_adress=api_adress,
                    order_id=order_id,
                    group_id=group_id
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
     
async def get_from_header(session_factory: async_sessionmaker):
    async with session_factory() as session:
        stmt = select(header)
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            json_obj = {
                    "id": row.id,
                    "order_id": row.order_id,
                    "name": row.name,
                    "group_id": row.group_id,
                    "api_adress": row.api_adress
                }
            json_group.append(json_obj)

    return json_group

async def get_from_header_light(session: AsyncSession):
    stmt = select(header)
    result = await session.execute(stmt)
    rows = result.fetchall()

    json_group = []
    for row in rows:
        json_obj = {
                "id": row.id,
                "order_id": row.order_id,
                "name": row.name,
                "group_id": row.group_id,
                "api_adress": row.api_adress
            }
        json_group.append(json_obj)

    return json_group

async def put_in_regular_reviews_groups(session_factory: async_sessionmaker, name: str):
    async with session_factory() as session:
        stmt = (insert(regular_reviews_groups).values(
            name=name
           )
           .returning(regular_reviews_groups.c.id)
        )

        result = await session.execute(stmt)
        await session.commit()
        group_id = result.scalar_one_or_none()
        return group_id
    
async def delete_from_regular_reviews_groups(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_select = select(products_pages).where(products_pages.c.reviews_id == id)
        result_select = await session.execute(stmt_select)

        if result_select.first():
            return False
        
        stmt_delete = delete(regular_reviews_groups).where(regular_reviews_groups.c.id == id)
        result = await session.execute(stmt_delete)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
        
async def update_regular_reviews_groups(session_factory: async_sessionmaker, id: int, name: str):
    async with session_factory() as session:
        update_stmt = (
                update(regular_reviews_groups)
                .where(regular_reviews_groups.c.id == id)
                .values(
                    name=name
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def get_from_regular_reviews_groups(session_factory: async_sessionmaker):
    async with session_factory() as session:
        stmt = select(regular_reviews_groups)
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            json_obj = {
                  "id": row.id,
                  "name": row.name
            }
            json_group.append(json_obj)
    
    return json_group

async def get_from_regular_reviews_groups_light(session: AsyncSession):
    stmt = select(regular_reviews_groups)
    result = await session.execute(stmt)
    rows = result.fetchall()

    json_group = []
    for row in rows:
        json_obj = {
              "id": row.id,
              "name": row.name
        }
        json_group.append(json_obj)
    
    return json_group

async def put_in_regular_reviews(session_factory: async_sessionmaker, group_id: int, text: str, rating: int, user_name: str, order_id: int, email: str):
    async with session_factory() as session:
            await update_order(session, regular_reviews, order_id, "add", group_id)
            stmt = (insert(regular_reviews).values(
                group_id=group_id,
                text=text,
                rating=rating,
                order_id=order_id,
                user_name=user_name,
                email=email
              ).returning(regular_reviews.c.id))
            
            result = await session.execute(stmt)
            await session.commit()
            item_id = result.scalar_one_or_none()
    
    return item_id

async def get_review_by_token(session_factory: async_sessionmaker, token: str):
    async with session_factory() as session:
            stmt = (select(regular_reviews_temp).where(regular_reviews_temp.c.token == token).where(regular_reviews_temp.c.expires_at >= datetime.utcnow()))
            
            result = await session.execute(stmt)
            review = result.first()
    
    return review

async def delete_temp_review(session_factory: async_sessionmaker, token: str):
    async with session_factory() as session:
        stmt_delete = (delete(regular_reviews_temp).where(regular_reviews_temp.c.token == token)
                       .returning(regular_reviews_temp.c.order_id))
        result = await session.execute(stmt_delete)
        row = result.fetchone()

        if row is None:
            return False
        else:
            await session.commit()
            return True

async def put_in_regular_reviews_temp(session_factory: async_sessionmaker, ip_adress: str, group_id: int, text: str, rating: int, user_name: str, order_id: int, email: str, token: str):
    async with session_factory() as session:
            stmt = (insert(regular_reviews_temp).values(
                ip_adress=ip_adress,
                group_id=group_id,
                text=text,
                rating=rating,
                order_id=order_id,
                user_name=user_name,
                email=email,
                token=token
              ).returning(regular_reviews_temp.c.id))
            
            result = await session.execute(stmt)
            await session.commit()
            item_id = result.scalar_one_or_none()
    
    return item_id

async def check_email_in_group(async_session_factory, email: str, group_id: int) -> bool:
    async with async_session_factory() as session:
        result = await session.execute(
            select(regular_reviews)
            .where(regular_reviews.c.email == email)
            .where(regular_reviews.c.group_id == group_id)
        )
        return result.scalar_one_or_none() is not None

async def delete_from_regular_reviews(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = (delete(regular_reviews).where(regular_reviews.c.id == id)
                       .returning(regular_reviews.c.order_id, regular_reviews.c.group_id))
        result = await session.execute(stmt_delete)
        row = result.fetchone()

        if row is None:
            return False
        else:
            await update_order(session, regular_reviews, row.order_id, "delete", row.group_id)
            await session.commit()
            return True
        
async def update_regular_reviews(session_factory: async_sessionmaker, id: int, group_id: int, text: str, rating: int, user_name: str, order_id: int):
    async with session_factory() as session:
        update_stmt = (
                update(regular_reviews)
                .where(regular_reviews.c.id == id)
                .values(
                    group_id=group_id,
                    text=text,
                    rating=rating,
                    order_id=order_id,
                    user_name=user_name
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def get_from_regular_reviews(session_factory: async_sessionmaker, name: str):
    async with session_factory() as session:
        stmt = (select(regular_reviews.c.id, regular_reviews.c.text, regular_reviews.c.rating, regular_reviews.c.user_name, regular_reviews.c.order_id).join(regular_reviews_groups, regular_reviews_groups.c.id == regular_reviews.c.group_id)
                .where(regular_reviews_groups.c.name == name))
        
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            json_obj = {
                    "id": row.id,
                    "text": row.text,
                    "rating": row.rating,
                    "order_id": row.order_id,
                    "user_name": row.user_name
                }
            json_group.append(json_obj)

    return json_group

async def get_from_regular_reviews_light(session: AsyncSession, name: str):
    stmt = (select(regular_reviews.c.id, regular_reviews.c.text, regular_reviews.c.rating, regular_reviews.c.user_name, regular_reviews.c.order_id).join(regular_reviews_groups, regular_reviews_groups.c.id == regular_reviews.c.group_id)
            .where(regular_reviews_groups.c.name == name))
        
    result = await session.execute(stmt)
    rows = result.fetchall()

    json_group = []
    for row in rows:
        json_obj = {
                "id": row.id,
                "text": row.text,
                "rating": row.rating,
                "order_id": row.order_id,
                "user_name": row.user_name
            }
        json_group.append(json_obj)

    return json_group

async def get_from_regular_reviews_light_with_id(session: AsyncSession, id: int):
    stmt = (select(regular_reviews.c.id, regular_reviews.c.text, regular_reviews.c.rating, regular_reviews.c.user_name, regular_reviews.c.order_id).join(regular_reviews_groups, regular_reviews_groups.c.id == regular_reviews.c.group_id)
            .where(regular_reviews_groups.c.id == id))
        
    result = await session.execute(stmt)
    rows = result.fetchall()

    json_group = []
    for row in rows:
        json_obj = {
                "id": row.id,
                "text": row.text,
                "rating": row.rating,
                "order_id": row.order_id,
                "user_name": row.user_name
            }
        json_group.append(json_obj)

    return json_group

async def put_in_yandex_reviews(session_factory: async_sessionmaker, text: str, rating: int, user_name: str, order_id: int, user_icon: str, ref: str):
    async with session_factory() as session:
        await update_order(session, yandex_reviews, order_id, "add")
        stmt = (insert(yandex_reviews).values(
           text=text,
           rating=rating,
           user_name=user_name,
           order_id=order_id,
           user_icon=user_icon,
           ref=ref
        ).returning(yandex_reviews.c.id))
        
        result = await session.execute(stmt)
        await session.commit()
        item_id = result.scalar_one_or_none()
    
    return item_id

async def delete_from_yandex_reviews(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = (delete(yandex_reviews).where(yandex_reviews.c.id == id)
                       .returning(yandex_reviews.c.order_id))
        result = await session.execute(stmt_delete)
        row = result.fetchone()

        if row is None:
            return False
        else: 
            await update_order(session, yandex_reviews, row.order_id, "delete")
            await session.commit()
            return True
        
async def update_yandex_reviews(session_factory: async_sessionmaker, id: int, text: str, rating: int, user_name: str, order_id: int, user_icon: str, ref: str):
    async with session_factory() as session:
        update_stmt = (
                update(yandex_reviews)
                .where(yandex_reviews.c.id == id)
                .values(
                    user_icon=user_icon,
                    text=text,
                    rating=rating,
                    order_id=order_id,
                    user_name=user_name,
                    ref=ref
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def get_from_yandex_reviews(session_factory: async_sessionmaker):
    async with session_factory() as session:
        stmt = select(yandex_reviews)
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            json_obj = {
                "id": row.id,
                "text": row.text,
                "rating": row.rating,
                "user_name": row.user_name,
                "order_id": row.order_id,
                "user_icon": row.user_icon,
                "ref": row.ref
            }
            json_group.append(json_obj)

    return json_group

async def get_from_yandex_reviews_light(session: AsyncSession):
    stmt = select(yandex_reviews)
    result = session.execute(stmt)
    rows = result.fetchall()

    json_group = []
    for row in rows:
        json_obj = {
            "id": row.id,
            "text": row.text,
            "rating": row.rating,
            "user_name": row.user_name,
            "order_id": row.order_id,
            "user_icon": row.user_icon,
            "ref": row.ref
        }
        json_group.append(json_obj)

    return json_group

async def put_in_simmilar_products_groups(session_factory: async_sessionmaker, name: str, search_str: str):
    async with session_factory() as session:
        stmt = (insert(simmilar_products_groups).values(
            name=name,
            search_str=search_str
        ).returning(simmilar_products_groups.c.id))
        
        result = await session.execute(stmt)
        await session.commit()
        item_id = result.scalar_one_or_none()
    
    return item_id

async def delete_from_simmilar_products_groups(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = delete(simmilar_products_groups).where(simmilar_products_groups.c.id == id)
        
        result = await session.execute(stmt_delete)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
        
async def update_simmilar_products_groups(session_factory: async_sessionmaker, id: int, name: str, search_str: str):
    async with session_factory() as session:
        update_stmt = (
                update(simmilar_products_groups)
                .where(simmilar_products_groups.c.id == id)
                .values(
                    name=name,
                    search_str=search_str
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def get_from_simmilar_products_groups(session_factory: async_sessionmaker):
    async with session_factory() as session:
        stmt = select(simmilar_products_groups)
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            json_obj = {
                "id": row.id,
                "name": row.name,
                "search_str": row.search_str
            }
            json_group.append(json_obj)

    return json_group


async def get_from_simmilar_products_names(session_factory: async_sessionmaker):
    async with session_factory() as session:
        stmt = select(simmilar_products_groups.c.name)
        result = await session.execute(stmt)

        rows = result.fetchall()

        if len(rows) == 0:
            return None

        names = [row[0] for row in rows]

    return names

async def get_from_simmilar_products_name(session_factory: async_sessionmaker, name: str):
    async with session_factory() as session:
        stmt = (select(simmilar_products_groups).where(simmilar_products_groups.c.name == name))
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            json_obj = {
                "id": row.id,
                "name": row.name,
                "search_str": row.search_str
            }
            json_group.append(json_obj)

    return json_group

async def get_from_simmilar_products_groups_light(session: AsyncSession, name: str):
    print(f"name in simmilar: {name}")
    stmt = (select(simmilar_products_groups).where(simmilar_products_groups.c.name == name))
    result = await session.execute(stmt)
    rows = result.fetchall()

    json_group = []
    for row in rows:
        json_obj = {
            "id": row.id,
            "name": row.name,
            "search_str": row.search_str
        }
        json_group.append(json_obj)

    return json_group

async def put_in_vista(session_factory: async_sessionmaker, vista_src: str, name: str):
    async with session_factory() as session:
        stmt = (insert(vista).values(
            vista_src=vista_src,
            name=name
        ).returning(vista.c.id))
        
        result = await session.execute(stmt)
        await session.commit()
        item_id = result.scalar_one_or_none()
    
    return item_id

async def put_in_maps(session_factory: async_sessionmaker, name: str, desc: str, button_info: str, ref: str, image_src: str):
    async with session_factory() as session:
        stmt = (insert(maps).values(
            name=name,
            desc=desc,
            button_info=button_info,
            ref=ref,
            image_src=image_src
        ).returning(maps.c.id))
        
        result = await session.execute(stmt)
        await session.commit()
        item_id = result.scalar_one_or_none()
    
    return item_id

async def delete_from_maps(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = delete(maps).where(maps.c.id == id)
        
        result = await session.execute(stmt_delete)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def put_in_piers(session_factory: async_sessionmaker, lat: float, lng: float, map_id: int):
    async with session_factory() as session:
        stmt = (insert(piers).values(
            lat=lat,
            lng=lng,
            group_id=map_id
        ).returning(piers.c.id))
        
        result = await session.execute(stmt)
        await session.commit()
        item_id = result.scalar_one_or_none()
    
    return item_id

async def delete_from_piers(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = delete(piers).where(piers.c.id == id)
        
        result = await session.execute(stmt_delete)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def delete_from_vista(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = delete(vista).where(vista.c.id == id)
        
        result = await session.execute(stmt_delete)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
        
async def update_vista(session_factory: async_sessionmaker, id: int, vista_src: str, name: str):
    async with session_factory() as session:
        update_stmt = (
                update(vista)
                .where(vista.c.id == id)
                .values(
                    vista_src = vista_src
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def get_from_vista(session_factory: async_sessionmaker):
    async with session_factory() as session:
        stmt = select(vista)
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            json_obj = {
                "id": row.id,
                "vista_src": row.vista_src,
                "name": row.name
            }
            json_group.append(json_obj)

    return json_group

async def get_from_vista_light(session: AsyncSession, name: str):
    stmt = (select(vista).where(vista.c.name == name))
    result = await session.execute(stmt)
    rows = result.fetchall()

    json_group = []
    for row in rows:
        json_obj = {
            "id": row.id,
            "vista_src": row.vista_src,
            "name": row.name
        }
        json_group.append(json_obj)

    return json_group

async def put_in_redactor(session_factory: async_sessionmaker, delta, name: str):
    async with session_factory() as session:
        stmt = (insert(redactors).values(
            delta=delta,
            name=name
        ).returning(redactors.c.id))
        
        result = await session.execute(stmt)
        await session.commit()
        item_id = result.scalar_one_or_none()
    
    return item_id

async def delete_from_redactor(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = delete(redactors).where(redactors.c.id == id)
        
        result = await session.execute(stmt_delete)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
        
async def update_redactor(session_factory: async_sessionmaker, id: int, delta, name: str):
    async with session_factory() as session:
        update_stmt = (
                update(redactors)
                .where(redactors.c.id == id)
                .values(
                    delta=delta,
                    name=name
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
        
async def get_all_from_redactors(session_factory: async_sessionmaker):
    async with session_factory() as session:
        stmt = select(redactors)
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            json_obj = {
                "id": row.id,
                "delta": row.delta,
                "name": row.name
            }
            json_group.append(json_obj)

    return json_group

async def get_from_redactor(session_factory: async_sessionmaker, name: str):
    async with session_factory() as session:
        stmt = (select(redactors).where(redactors.c.name == name))
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            json_obj = {
                "id": row.id,
                "delta": row.delta,
                "name": row.name
            }
            json_group.append(json_obj)

    return json_group

async def get_from_redactor_light(session: AsyncSession, name: str):
    stmt = (select(redactors).where(redactors.c.name == name))
    result = await session.execute(stmt)
    rows = result.fetchall()

    json_group = []
    for row in rows:
        json_obj = {
            "id": row.id,
            "delta": row.delta,
            "name": name
        }
        json_group.append(json_obj)

    return json_group

async def get_from_vista_names(session_factory: async_sessionmaker):
    async with session_factory() as session:
        stmt = select(vista.c.name)
        result = await session.execute(stmt)

        rows = result.fetchall()

        if len(rows) == 0:
            return None

        names = [row[0] for row in rows]

    return names

async def get_from_vista_with_name(session_factory: async_sessionmaker, name: str):
    async with session_factory() as session:
        stmt = (select(vista).where(vista.c.name == name))
        result = await session.execute(stmt)

        rows = result.fetchall()

        json_group = []
        for row in rows: 
            json_obj = {
                "id": row.id,
                "name": row.name,
                "vista_src": row.vista_src
            }
            json_group.append(json_obj)
    
    return json_group

# таблицы страниц

async def put_in_pages(session_factory: async_sessionmaker, name: str, template_type: str, api_adress: str):
    async with session_factory() as session:
        stmt = (insert(pages).values(
            name=name,
            template_type=template_type,
            api_adress=api_adress,
            title="",
            description="",
            robots=""
        ).returning(pages.c.id))
        
        result = await session.execute(stmt)
        await session.commit()
        item_id = result.scalar_one_or_none()
    
    return item_id

async def update_meta_from_pages(session_factory: async_sessionmaker, id: int, title: str, description: str, robots: str, script: str):
    async with session_factory() as session:
        update_stmt = (update(pages)
                .where(pages.c.id == id).values(
            title=title,
            description=description,
            robots=robots,
            script=script
        ))
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0: 
            return False
        else:
            await session.commit()
            return True

async def update_from_pages(session_factory: async_sessionmaker, id: int, name: str, template_type: str, api_adress: str):
    async with session_factory() as session:
        update_stmt = (update(pages)
                .where(pages.c.id == id).values(
            name=name,
            template_type=template_type,
            api_adress=api_adress
        ))
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def delete_from_pages(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = delete(pages).where(pages.c.id == id)
       
        result = await session.execute(stmt_delete)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def get_from_pages(session_factory: async_sessionmaker):
    async with session_factory() as session:
        stmt = select(pages)
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            json_obj = {
                  "id": row.id,
                  "name": row.name,
                  "template_type": row.template_type,
                  "api_adress": row.api_adress,
                  "title": row.title,
                  "description": row.description,
                  "robots": row.robots,
                  "script": row.script
            }
            json_group.append(json_obj)
    
    return json_group


async def get_from_pages_urls(session_factory: async_sessionmaker):
    async with session_factory() as session:
        stmt = select(pages.c.api_adress)
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            json_group.append(row.api_adress)
    
    return json_group


async def put_in_pages_components(session_factory: async_sessionmaker, name: str, group_id: int, order_id: int, group_name: str, space_id: int = 0):
    async with session_factory() as session:
        await update_order(session, pages_components, order_id, "add", group_id)
        stmt = (insert(pages_components).values(
            name=name,
            group_id=group_id,
            order_id=order_id,
            space_id=space_id,
            group_name=group_name
        ).returning(pages_components.c.id))
        
        result = await session.execute(stmt)
        await session.commit()
        item_id = result.scalar_one_or_none()
    
    return item_id

async def delete_from_pages_components(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = (delete(pages_components).where(pages_components.c.id == id)
                    .returning(pages_components.c.order_id, pages_components.c.group_id))
        
        result = await session.execute(stmt_delete)
        row = result.fetchone()

        if row is None:
            return False
        else:
            await update_order(session, pages_components, row.order_id, "delete", row.group_id)
            await session.commit()
            return True
    
async def update_from_pages_components(session_factory: async_sessionmaker, id: int, name: str, group_id: int, order_id: int, group_name: str):
    async with session_factory() as session:
        update_stmt = (
                update(pages_components)
                .where(pages_components.c.id == id)
                .values(
                    name=name,
                    group_id=group_id,
                    order_id=order_id,
                    group_name=group_name
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def get_from_pages_components(session_factory: async_sessionmaker, name: str):
    async with session_factory() as session:
        stmt = (select(pages_components.c.id, pages_components.c.name, pages_components.c.group_name, pages_components.c.group_id, pages_components.c.order_id).join(pages, pages.c.id == pages_components.c.group_id)
                .where(pages.c.name == name))
        
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            json_obj = {
                    "id": row.id,
                    "name": row.name,
                    "group_id": row.group_id,
                    "order_id": row.order_id,
                    "group_name": row.group_name
                }
            json_group.append(json_obj)

    return json_group

async def put_in_shops_pages(session_factory: async_sessionmaker, page_id: int, products_id: int, page_title: str):
    async with session_factory() as session:
        stmt = (insert(shops_pages).values(
            page_id=page_id,
            products_id=products_id,
            page_title=page_title
        ).returning(shops_pages.c.id))
        
        result = await session.execute(stmt)
        await session.commit()
        item_id = result.scalar_one_or_none()
    
    return item_id

async def delete_from_shops_pages(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = delete(shops_pages).where(shops_pages.c.id == id)
        
        result = await session.execute(stmt_delete)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
        
async def update_from_shop_pages(session_factory: async_sessionmaker, id: int, page_id: int, products_id: int, page_title: str):
    async with session_factory() as session:
        update_stmt = (
                update(shops_pages)
                .where(shops_pages.c.id == id)
                .values(
                   page_id=page_id,
                   products_id=products_id,
                   page_title=page_title
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def get_from_shops_pages(session_factory: async_sessionmaker, name: str):
    async with session_factory() as session:
        stmt = (select(shops_pages.c.id, shops_pages.c.page_id, shops_pages.c.products_id, shops_pages.c.page_title).join(pages, pages.c.id == shops_pages.c.page_id)
                .where(pages.c.name == name))
        
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            json_obj = {
                    "id": row.id,
                    "page_id": row.page_id,
                    "products_id": row.products_id,
                    "page_title": row.page_title
                }
            json_group.append(json_obj)

    return json_group

async def put_in_shops_pages_filters(session_factory: async_sessionmaker, group_id: int, name: str, order_id: int):
    async with session_factory() as session:
        await update_order(session, shops_pages_filters, order_id, "add", group_id)
        stmt = (insert(shops_pages_filters).values(
            group_id=group_id,
            name=name,
            order_id=order_id
        ).returning(shops_pages_filters.c.id))
        
        result = await session.execute(stmt)
        await session.commit()
        item_id = result.scalar_one_or_none()
    
    return item_id

async def delete_from_shops_pages_filters(session_factory: async_sessionmaker, id: int):
        async with session_factory() as session:
            stmt_delete = (delete(shops_pages_filters).where(shops_pages_filters.c.id == id)
                    .returning(shops_pages_filters.c.order_id, shops_pages_filters.c.group_id))
        
            result = await session.execute(stmt_delete)
            row = result.fetchone()

            if row is None:
                return False
            else:
                await update_order(session, shops_pages_filters, row.order_id, "delete", row.group_id)
                await session.commit()
                return True
            
async def update_from_shops_pages_filters(session_factory: async_sessionmaker, id: int, group_id: int, name: str, order_id: int):
    async with session_factory() as session:
        update_stmt = (
                update(shops_pages_filters)
                .where(shops_pages_filters.c.id == id)
                .values(
                   group_id=group_id,
                   name=name,
                   order_id=order_id
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def put_in_shops_pages_filters_items(session_factory: async_sessionmaker, group_id: int, name: str, order_id: int):
    async with session_factory() as session:
        await update_order(session, shops_pages_filters_items, order_id, "add", group_id)
        stmt = (insert(shops_pages_filters_items).values(
            group_id=group_id,
            name=name,
            order_id=order_id
        ).returning(shops_pages_filters_items.c.id))
        
        result = await session.execute(stmt)
        await session.commit()
        item_id = result.scalar_one_or_none()
    
    return item_id

async def delete_from_shops_pages_filters_items(session_factory: async_sessionmaker, id: int):
        async with session_factory() as session:
            stmt_delete = (delete(shops_pages_filters_items).where(shops_pages_filters_items.c.id == id)
                    .returning(shops_pages_filters_items.c.order_id, shops_pages_filters_items.c.group_id))
        
            result = await session.execute(stmt_delete)
            row = result.fetchone()

            if row is None:
                return False
            else:
                await update_order(session, shops_pages_filters_items, row.order_id, "delete", row.group_id)
                await session.commit()
                return True
            
async def update_from_shops_pages_filters_items(session_factory: async_sessionmaker, id: int, group_id: int, name: str, order_id: int):
    async with session_factory() as session:
        update_stmt = (
                update(shops_pages_filters_items)
                .where(shops_pages_filters_items.c.id == id)
                .values(
                   group_id=group_id,
                   name=name,
                   order_id=order_id
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def get_shop_filters(session_factory: async_sessionmaker, name: str):
    async with session_factory() as session:

        stmt_filters = (
            select(shops_pages_filters.c.id, shops_pages_filters.c.name, shops_pages_filters.c.order_id)
            .join(pages, pages.c.id == shops_pages_filters.c.group_id)
            .where(pages.c.name == name)
            .order_by(shops_pages_filters.c.order_id)
        )
        result = await session.execute(stmt_filters)
        filters_rows = result.fetchall()

        filter_ids = [row.id for row in filters_rows]

        stmt_items = (
            select(
                shops_pages_filters_items.c.id,
                shops_pages_filters_items.c.name,
                shops_pages_filters_items.c.order_id,
                shops_pages_filters_items.c.group_id
            )
            .where(shops_pages_filters_items.c.group_id.in_(filter_ids))
            .order_by(shops_pages_filters_items.c.order_id)
        )
        result = await session.execute(stmt_items)
        items_rows = result.fetchall()

        from collections import defaultdict
        items_dict = defaultdict(list)
        for item in items_rows:
            items_dict[item.group_id].append({
                "id": item.id,
                "name": item.name,
                "order_id": item.order_id
            })

        filters = []
        for row in filters_rows:
            filters.append({
                "id": row.id,
                "name": row.name,
                "order_id": row.order_id,
                "items": items_dict.get(row.id, [])
            })

        return filters
    
async def get_shop_filters_light(session: AsyncSession, name: str):
    capacities = []
    stmt_filters_capacity = (
    select(products.c.capacity)
    .select_from(
        product_grid_groups.join(products, products.c.group_id == product_grid_groups.c.id)
    )
    .where(product_grid_groups.c.name == name)
    ) 

    result = await session.execute(stmt_filters_capacity)
    capacities_raw = result.scalars().all() or []
    capacities_filtered = [c for c in capacities_raw if c not in (None, "", 0)]

    capacities_counter = Counter(capacities_filtered)
    capacities = [{"name": k, "amount": v} for k, v in capacities_counter.items()]
    
    toilets = []
    stmt_filters_toilet = (
    select(products.c.toilet)
    .select_from(
        product_grid_groups.join(products, products.c.group_id == product_grid_groups.c.id)
    )
    .where(product_grid_groups.c.name == name)
    )

    result2 = await session.execute(stmt_filters_toilet)
    toilets_raw = result2.scalars().all() or []
    toilets_filtered = [t for t in toilets_raw if t not in (None, "")]

    toilets_counter = Counter(toilets_filtered)
    toilets = [{"name": k, "amount": v} for k, v in toilets_counter.items()]

    stmt_price_range = (
    select(
        func.min(products.c.price).label("min_price"),
        func.max(products.c.price).label("max_price"),
    )
    .select_from(
        product_grid_groups.join(products, products.c.group_id == product_grid_groups.c.id)
    )
    .where(product_grid_groups.c.name == name)
    )

    result3 = await session.execute(stmt_price_range)
    row = result3.first()

    if row is None:
        min_price = max_price = 0
    else:
        min_price = float(row.min_price or 0)
        max_price = float(row.max_price or 0)

    filters ={
        "min_price": min_price,
        "max_price": max_price,
        "capacities": capacities,
        "toilets": toilets
    }

    return filters

async def put_in_products_pages(session_factory: async_sessionmaker, group_id: int, title: str, reviews_id: int):
    async with session_factory() as session:
        stmt = (insert(products_pages).values(
            group_id=group_id,
            title=title,
            reviews_id=reviews_id
        ).returning(products_pages.c.id))
        
        result = await session.execute(stmt)
        await session.commit()
        item_id = result.scalar_one_or_none()
    
    return item_id

async def delete_from_products_pages(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = delete(products_pages).where(products_pages.c.id == id)
        
        result = await session.execute(stmt_delete)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
        
async def update_from_products_pages(session_factory: async_sessionmaker, id: int, group_id: int, title: str):
    async with session_factory() as session:
        update_stmt = (
                update(products_pages)
                .where(products_pages.c.id == id)
                .values(
                  group_id=group_id,
                  title=title
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def get_from_products_pages(session_factory: async_sessionmaker, name: str):
    async with session_factory() as session:
        stmt = (select(products_pages.c.id, products_pages.c.title, products_pages.c.reviews_id)
                .join(pages, pages.c.id == products_pages.c.group_id)
                .where(pages.c.name == name))
        
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            json_obj = {
                    "id": row.id,
                    "title": row.title,
                    "reviews_id": row.reviews_id
                }
            json_group.append(json_obj)

    return json_group

async def update_products_pages_video(session_factory: async_sessionmaker, id: int, video: str): 
    async with session_factory() as session:
        update_stmt = (update(products_pages).where(products_pages.c.id == id).values(
            video=video
        ))
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def get_from_products_pages_light(session: AsyncSession, name: str):
    stmt = (select(products_pages.c.id, products_pages.c.title, products_pages.c.reviews_id, products_pages.c.video)
            .join(pages, pages.c.id == products_pages.c.group_id)
            .where(pages.c.name == name))
    
    result = await session.execute(stmt)
    rows = result.fetchall()
    json_group = []
    for row in rows:
        json_obj = {
                "id": row.id,
                "title": row.title,
                "reviews_id": row.reviews_id,
                "video": row.video
            }
        json_group.append(json_obj)

    return json_group

async def put_in_products_pages_description(session_factory: async_sessionmaker, group_id: int, name: str, description: str, order_id: int):
    async with session_factory() as session:
        stmt = (insert(products_pages_description).values(
            group_id=group_id,
            name=name,
            description=description,
            order_id=order_id
        ).returning(products_pages_description.c.id))
        
        result = await session.execute(stmt)
        await session.commit()
        item_id = result.scalar_one_or_none()
    
    return item_id

async def delete_from_products_pages_description(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = (delete(products_pages_description).where(products_pages_description.c.id == id)
                       .returning(products_pages_description.c.order_id, products_pages_description.c.group_id))
        
        result = await session.execute(stmt_delete)
        row = result.fetchone()

        if row is None:
            return False
        else:
            await update_order(session, products_pages_description, row.order_id, "delete", row.group_id)
            await session.commit() 
            return True
        
async def update_from_products_pages_description(session_factory: async_sessionmaker, id: int, group_id: int, name: str, description: str, order_id: int):
    async with session_factory() as session:
        update_stmt = (
                update(products_pages_description)
                .where(products_pages_description.c.id == id)
                .values(
                  group_id=group_id,
                  name=name,
                  description=description
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
        
async def get_from_products_pages_description(session_factory: async_sessionmaker, name: str):
    async with session_factory() as session:
        stmt = (select(products_pages_description.c.id, products_pages_description.c.order_id, products_pages_description.c.name, products_pages_description.c.description)
                .join(pages, pages.c.id == products_pages_description.c.group_id)
                .where(pages.c.name == name))
        
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            json_obj = {
                    "id": row.id,
                    "name": row.name,
                    "description": row.description,
                    "order_id": row.order_id
                }
            json_group.append(json_obj)

    return json_group

async def get_from_products_pages_description_light(session: AsyncSession, name: str):
    stmt = (select(products_pages_description.c.id, products_pages_description.c.order_id, products_pages_description.c.name, products_pages_description.c.description)
            .join(pages, pages.c.id == products_pages_description.c.group_id)
            .where(pages.c.name == name))
        
    result = await session.execute(stmt)
    rows = result.fetchall()

    json_group = []
    for row in rows:
        json_obj = {
                "id": row.id,
                "name": row.name,
                "description": row.description,
                "order_id": row.order_id
            }
        json_group.append(json_obj)

    return json_group

async def put_in_news_pages(session_factory: async_sessionmaker, group_id: str, title: str):
    async with session_factory() as session:
        stmt = (insert(news_pages).values(
            group_id=group_id,
            title=title
        ).returning(news_pages.c.id))
        
        result = await session.execute(stmt)
        await session.commit()
        item_id = result.scalar_one_or_none()
    
    return item_id

async def delete_from_news_pages(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = delete(news_pages).where(news_pages.c.id == id)
        
        result = await session.execute(stmt_delete)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def update_from_news_pages(session_factory: async_sessionmaker, id: int, group_id: int, title: str):
    async with session_factory() as session:
        update_stmt = (
                update(news_pages)
                .where(news_pages.c.id == id)
                .values(
                   group_id=group_id,
                   title=title
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def get_from_news_pages(session_factory: async_sessionmaker, name: str):
    async with session_factory() as session:
        stmt = (select(news_pages.c.id, news_pages.c.title)
                .join(pages, pages.c.id == news_pages.c.group_id)
                .where(pages.c.name == name))
        
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            json_obj = {
                    "id": row.id,
                    "title": row.title
                }
            json_group.append(json_obj)

    return json_group

async def get_from_news_pages_light(session: AsyncSession, name: str):
    stmt = (select(news_pages.c.id, news_pages.c.title)
            .join(pages, pages.c.id == news_pages.c.group_id)
            .where(pages.c.name == name))
    
    result = await session.execute(stmt)
    rows = result.fetchall()
    json_group = []
    for row in rows:
        json_obj = {
                "id": row.id,
                "title": row.title
                }
        json_group.append(json_obj)

    return json_group

async def put_in_news_previews(session_factory: async_sessionmaker, group_id: int, title: str, image_src: str, api_adress: str, order_id: int, page_id: int, blog_page_id: int, date: date, description: str = ""):
    async with session_factory() as session:
        stmt = (insert(news_previews).values(
            group_id=group_id,
            title=title,
            image_src=image_src,
            api_adress=api_adress,
            order_id=order_id,
            page_id=page_id,
            blog_page_id=blog_page_id,
            description=description,
            date=date
        ).returning(news_previews.c.id))
        
        result = await session.execute(stmt)
        await session.commit()
        item_id = result.scalar_one_or_none()
    
    return item_id

async def get_shop_pages_groups(session_factory: async_sessionmaker):
    async with session_factory() as session:
        stmt = select(pages.c.name).where(pages.c.template_type == "ShopPage")
        result = await session.execute(stmt)
        rows = result.fetchall()

    return [row.name for row in rows]

async def get_news_pages_groups(session_factory: async_sessionmaker):
    async with session_factory() as session:
        stmt = select(pages.c.name).where(pages.c.template_type == "NewsPage")
        result = await session.execute(stmt)
        rows = result.fetchall()

    return [row.name for row in rows]

async def get_regular_pages_groups(session_factory: async_sessionmaker):
    async with session_factory() as session:
        stmt = select(pages.c.name).where(pages.c.template_type == "RegularPage")
        result = await session.execute(stmt)
        rows = result.fetchall()

    return [row.name for row in rows]

async def delete_from_news_previews(session_factory: async_sessionmaker, id: int):
        async with session_factory() as session:
            stmt_delete = (delete(news_previews).where(news_previews.c.id == id)
                    .returning(news_previews.c.order_id, news_previews.c.group_id))
        
            result = await session.execute(stmt_delete)
            row = result.fetchone()

            if row is None:
                return False
            else:
                await update_order(session, news_previews, row.order_id, "delete", row.group_id)
                await session.commit()
                return True
            
async def update_from_news_previews(session_factory: async_sessionmaker, id: int, group_id: int, title: str, image_src: str, api_adress: str, order_id: int, date: date, description: str = ""):
    async with session_factory() as session:
        update_stmt = (
                update(news_previews)
                .where(news_previews.c.id == id)
                .values(
                group_id=group_id,
                title=title,
                image_src=image_src,
                api_adress=api_adress,
                order_id=order_id,
                description=description,
                date=date
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
        
async def update_from_news_desc(session_factory: async_sessionmaker, id: int, desc: str):
    async with session_factory() as session:
        update_stmt = (
                update(news_previews)
                .where(news_previews.c.id == id)
                .values(
                description=desc
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
        
async def get_from_news_previews_ids(session_factory: async_sessionmaker, ids: list[int]):
    if not ids:
        return []
    async with session_factory() as session:
        stmt = (select(news_previews.c.id, news_previews.c.title, news_previews.c.image_src, news_previews.c.description, news_previews.c.api_adress, news_previews.c.order_id, news_previews.c.page_id, news_previews.c.blog_page_id, news_previews.c.date)
            .where(news_previews.c.id.in_(ids))
        )
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            json_obj = {
                    "id": row.id,
                    "title": row.title,
                    "image_src": row.image_src,
                    "description": row.description,
                    "api_adress": row.api_adress,
                    "order_id": row.order_id,
                    "page_id": row.page_id,
                    "blog_page_id": row.blog_page_id,
                    "date": row.date.isoformat() if row.date else None
                }
            json_group.append(json_obj)

    return json_group

async def get_from_news_previews(session_factory: async_sessionmaker, name: str):
    async with session_factory() as session:
        stmt = (select(news_previews.c.id, news_previews.c.title, news_previews.c.image_src, news_previews.c.description, news_previews.c.api_adress, news_previews.c.order_id, news_previews.c.page_id, news_previews.c.blog_page_id, news_previews.c.date)
                .join(pages, pages.c.id == news_previews.c.group_id)
                .where(pages.c.name == name).order_by(desc(news_previews.c.id)).offset(0).limit(9))
        
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            json_obj = {
                    "id": row.id,
                    "title": row.title,
                    "image_src": row.image_src,
                    "description": row.description,
                    "api_adress": row.api_adress,
                    "order_id": row.order_id,
                    "page_id": row.page_id,
                    "blog_page_id": row.blog_page_id,
                    "date": row.date.isoformat() if row.date else None
                }
            json_group.append(json_obj)

    stmt_ids = (
        select(news_previews.c.id)
        .join(pages, pages.c.id == news_previews.c.group_id)
        .where(pages.c.name == name)
    )
    result_ids = await session.execute(stmt_ids)
    all_ids = [r.id for r in result_ids.fetchall()]


    to_return_obj ={
        "items": json_group,
        "ids": all_ids
    }

    return to_return_obj

async def get_from_news_previews_light(session: AsyncSession, name: str):
    stmt = (select(news_previews.c.id, news_previews.c.title, news_previews.c.image_src, news_previews.c.description, news_previews.c.api_adress, news_previews.c.order_id, news_previews.c.page_id, news_previews.c.blog_page_id, news_previews.c.date)
            .join(pages, pages.c.id == news_previews.c.group_id)
            .where(pages.c.name == name).order_by(desc(news_previews.c.id)).offset(0).limit(9))
    
    result = await session.execute(stmt)
    rows = result.fetchall()

    json_group = []
    for row in rows:
        stmt = (select(pages_components.c.group_name).where(pages_components.c.group_id == row.page_id).where(pages_components.c.name == "regularReviews"))
        result = await session.execute(stmt)
        group_name = result.scalar()

        stmt_count = (
            select(func.count())
            .select_from(regular_reviews)
            .join(regular_reviews_groups, regular_reviews_groups.c.id == regular_reviews.c.group_id)
            .where(regular_reviews_groups.c.name == group_name)
        )

        result = await session.execute(stmt_count)
        count = result.scalar() or 0

        json_obj = {
                "id": row.id,
                "title": row.title,
                "image_src": row.image_src,
                "description": row.description,
                "api_adress": row.api_adress,
                "order_id": row.order_id,
                "page_id": row.page_id,
                "reviews_amount": count,
                "blog_page_id": row.blog_page_id,
                "date": row.date.isoformat() if row.date else None
            }
        json_group.append(json_obj)

    stmt_ids = (
        select(news_previews.c.id)
        .join(pages, pages.c.id == news_previews.c.group_id)
        .where(pages.c.name == name)
    )
    result_ids = await session.execute(stmt_ids)
    all_ids = [r.id for r in result_ids.fetchall()]

    to_return_obj ={
        "items": json_group,
        "ids": all_ids
    }

    return to_return_obj

async def update_from_regular_pages_image_src(session_factory: async_sessionmaker, id: int, image_src: str):
    async with session_factory() as session:
        update_stmt = (
                update(regular_pages)
                .where(regular_pages.c.id == id)
                .values(
                    image_src=image_src
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def put_in_regular_pages(session_factory: async_sessionmaker, group_id: int, title: str):
    async with session_factory() as session:
        stmt = (insert(regular_pages).values(
            group_id=group_id,
            title=title,
        ).returning(regular_pages.c.id))
        
        result = await session.execute(stmt)
        await session.commit()
        item_id = result.scalar_one_or_none()
    
    return item_id

async def delete_from_regular_pages(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = delete(regular_pages).where(regular_pages.c.id == id)
        
        result = await session.execute(stmt_delete)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
        
async def update_from_regular_pages(session_factory: async_sessionmaker, id: int, group_id: int, title: str):
    async with session_factory() as session:
        update_stmt = (
                update(regular_pages)
                .where(regular_pages.c.id == id)
                .values(
                    group_id=group_id,
                    title=title,
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
        
async def get_from_regular_pages(session_factory: async_sessionmaker, name: str):
    async with session_factory() as session:
        stmt = (select(regular_pages.c.id, regular_pages.c.title)
                .join(pages, pages.c.id == regular_pages.c.group_id)
                .where(pages.c.name == name))
        
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            json_obj = {
                    "id": row.id,
                    "title": row.title,
                }
            json_group.append(json_obj)

    return json_group

async def get_from_regular_pages_light(session: AsyncSession, name: str):
    stmt = (select(regular_pages.c.id, regular_pages.c.title, regular_pages.c.image_src)
            .join(pages, pages.c.id == regular_pages.c.group_id)
            .where(pages.c.name == name))
    
    result = await session.execute(stmt)
    rows = result.fetchall()

    json_group = []
    for row in rows:
        json_obj = {
                "id": row.id,
                "title": row.title,
                "image_src": row.image_src
            }
        json_group.append(json_obj)

    return json_group

async def put_in_blog_pages(session_factory: async_sessionmaker, group_id: int, title: str, image_src: str):
    async with session_factory() as session:
        stmt = (insert(blog_pages).values(
            group_id=group_id,
            title=title,
            image_src=image_src
        ).returning(blog_pages.c.id))
        
        result = await session.execute(stmt)
        await session.commit()
        item_id = result.scalar_one_or_none()
    
    return item_id

async def delete_from_blog_pages(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = delete(blog_pages).where(blog_pages.c.id == id)
        
        result = await session.execute(stmt_delete)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
        
async def update_from_blog_delta(session_factory: async_sessionmaker, id: int, delta):
    async with session_factory() as session:
        update_stmt = (
                update(blog_pages)
                .where(blog_pages.c.id == id)
                .values(
                    delta=delta
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
        
async def update_from_blog_pages(session_factory: async_sessionmaker, id: int, title: str, image_src: str):
    async with session_factory() as session:
        update_stmt = (
                update(blog_pages)
                .where(blog_pages.c.id == id)
                .values(
                    title=title,
                    image_src=image_src
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def get_from_blog_pages(session_factory: async_sessionmaker, name: str):
    async with session_factory() as session:
        stmt = (select(blog_pages.c.id, blog_pages.c.title, blog_pages.c.image_src)
                .join(pages, pages.c.id == blog_pages.c.group_id)
                .where(pages.c.name == name))
        
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            json_obj = {
                    "id": row.id,
                    "title": row.title,
                    "image_src": row.image_src
                }
            json_group.append(json_obj)

    return json_group

async def get_from_blog_pages_light(session: AsyncSession, name: str):
    stmt = (select(blog_pages.c.id, blog_pages.c.title, blog_pages.c.image_src, blog_pages.c.delta)
            .join(pages, pages.c.id == blog_pages.c.group_id)
            .where(pages.c.name == name))
        
    result = await session.execute(stmt)
    rows = result.fetchall()

    json_group = []
    for row in rows:
        stmt_id = (select(news_previews.c.id).where(news_previews.c.blog_page_id == row.id))
        result_id = await session.execute(stmt_id)
        id_row = result_id.scalar_one_or_none()
        json_obj = {
                "id": row.id,
                "title": row.title,
                "image_src": row.image_src,
                "delta": row.delta,
                "preview_id": id_row
            }
        json_group.append(json_obj)

    return json_group

async def put_in_main_pages(session_factory: async_sessionmaker, group_id: int, title: str, image_src: str):
    async with session_factory() as session:
        stmt = (insert(main_pages).values(
            group_id=group_id,
            title=title,
            image_src=image_src
        ).returning(main_pages.c.id))
        
        result = await session.execute(stmt)
        await session.commit()
        item_id = result.scalar_one_or_none()
    
    return item_id

async def delete_from_main_pages(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = delete(main_pages).where(main_pages.c.id == id)
        
        result = await session.execute(stmt_delete)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
    
async def update_from_main_pages(session_factory: async_sessionmaker, id: int, group_id: int, title: str, image_src: str):
    async with session_factory() as session:
        update_stmt = (
                update(main_pages)
                .where(main_pages.c.id == id)
                .values(
                    group_id=group_id,
                    title=title,
                    image_src=image_src
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def get_from_main_pages(session_factory: async_sessionmaker, name: str):
    async with session_factory() as session:
        stmt = (select(main_pages.c.id, main_pages.c.title, main_pages.c.image_src)
                .join(pages, pages.c.id == main_pages.c.group_id)
                .where(pages.c.name == name))
        
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        for row in rows:
            json_obj = {
                    "id": row.id,
                    "title": row.title,
                    "image_src": row.image_src
                }
            json_group.append(json_obj)

    return json_group

async def get_from_main_pages_light(session: AsyncSession, name: str):
    stmt = (select(main_pages.c.id, main_pages.c.title, main_pages.c.image_src)
            .join(pages, pages.c.id == main_pages.c.group_id)
            .where(pages.c.name == name))
    
    result = await session.execute(stmt)
    rows = result.fetchall()

    json_group = []
    for row in rows:
        json_obj = {
                "id": row.id,
                "title": row.title,
                "image_src": row.image_src
            }
        json_group.append(json_obj)

    return json_group

async def get_from_main_swiper(session_factory: async_sessionmaker):
    async with session_factory() as session:
        stmt = select(main_swiper)
        result = await session.execute(stmt)
        rows = result.fetchall()

        json_group = []
        json_group_2 = []
        json_to_return = {}

        for row in rows:
            if row.is_mobile == True:
                json_obj = {
                    "id": row.id,
                    "image_src": row.image_src
                }
                json_group_2.append(json_obj)
                continue
            json_obj = {
                "id": row.id,
                "image_src": row.image_src
            }
            json_group.append(json_obj)

        json_to_return = {
            "big": json_group,
            "small": json_group_2
        }

        return json_to_return
    
async def put_in_main_swiper_mobile(session_factory: async_sessionmaker, image_src: str):
    async with session_factory() as session:
        stmt_delete = delete(main_swiper).where(main_swiper.c.is_mobile == True)
        await session.execute(stmt_delete)
        
        stmt = (insert(main_swiper).values(
            image_src=image_src,
            is_mobile=True
        ).returning(main_swiper.c.id))
        
        result = await session.execute(stmt)
        await session.commit()
        item_id = result.scalar_one_or_none()
    
    return item_id

async def put_image_in_shop_page_desktop(session_factory: async_sessionmaker, id: int, image_src: str):
    async with session_factory() as session:
        stmt = (update(shops_pages).values(
            desc_image_src=image_src
        ).where(shops_pages.c.page_id == id))
        
        result = await session.execute(stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True

async def put_image_in_shop_page_mobile(session_factory: async_sessionmaker, id: int, image_src: str):
    async with session_factory() as session:
        stmt = (update(shops_pages).values(
            mobile_image_src=image_src
        ).where(shops_pages.c.page_id == id))
        
        result = await session.execute(stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
    
async def update_in_main_swiper(session_factory: async_sessionmaker, id: int, image_src: str):
    async with session_factory() as session:
        update_stmt = (
                update(main_swiper)
                .where(main_swiper.c.id == id)
                .values(
                    image_src=image_src
                )
            )
        
        result = await session.execute(update_stmt)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
        
async def delete_from_main_swiper(session_factory: async_sessionmaker, id: int):
    async with session_factory() as session:
        stmt_delete = delete(main_swiper).where(main_swiper.c.id == id)
        
        result = await session.execute(stmt_delete)

        if result.rowcount == 0:
            return False
        else:
            await session.commit()
            return True
        
async def create_in_main_swiper(session_factory: async_sessionmaker, image_src: str):
    async with session_factory() as session:
        stmt = (insert(main_swiper).values(
            image_src=image_src
        ).returning(main_swiper.c.id))
        
        result = await session.execute(stmt)
        await session.commit()
        item_id = result.scalar_one_or_none()
    
    return item_id

async def put_in_menu_calculator(session_factory: async_sessionmaker, options: list[schemas.MenuOption], name: str, price: float, image: str):
    async with session_factory() as session:
        stmt = (insert(menu_calcs).values(
            name=name,
            price=price,
            image=image
        ).returning(menu_calcs.c.id))
        
        result = await session.execute(stmt)
        await session.commit()
        item_id = result.scalar_one_or_none()

        for option in options:
            stmt_option = (insert(menu_options).values(
                name=option.name,
                price=option.price,
                group_id=item_id
            ))

            await session.execute(stmt_option)

        await session.commit()

    return item_id

async def put_in_calculators(session_factory: async_sessionmaker, name: str):
    async with session_factory() as session:
        stmt = (insert(calculators).values(
            name=name
        ).returning(calculators.c.id))
        
        result = await session.execute(stmt)
        await session.commit()
        item_id = result.scalar_one_or_none()

    return item_id

async def put_in_calculators_seasons(session_factory: async_sessionmaker, from_date: date, to_date: date, type_date: str, component_id: int):
    async with session_factory() as session:
        from_date = date.fromisoformat(from_date)
        to_date = date.fromisoformat(to_date)

        stmt = (insert(order_seasons).values(
            from_date=from_date,
            to_date=to_date,
            type_date=type_date,
            component_id=component_id
        ).returning(order_seasons.c.id))
        
        result = await session.execute(stmt)
        await session.commit()
        item_id = result.scalar_one_or_none()

    return item_id

async def put_in_weeks(session_factory: async_sessionmaker, mn: float, ts: float, ws: float, tu: float, fr: float, sn: float, st: float, from_time: date, to_time: date, hours: int, season_id: int):
    async with session_factory() as session:
        from_time = time.fromisoformat("23:57")
        to_time = time.fromisoformat("21:57")

        stmt = (insert(week_days).values(
            mn=mn,
            ts=ts,
            ws=ws,
            tu=tu,
            fr=fr,
            sn=sn,
            st=st,
            from_time=from_time,
            to_time=to_time,
            hours=hours,
            season_id=season_id
        ).returning(week_days.c.id))
        
        result = await session.execute(stmt)
        await session.commit()
        item_id = result.scalar_one_or_none()

    return item_id

async def put_in_calc_stuff(session_factory: async_sessionmaker, cleaning: float, catering: list[int], furshet: list[int], dj: float, wedding: float, guide: float, flowers: float, ballons: float, component_id: int):
    async with session_factory() as session:
        stmt = (insert(calc_stuff).values(
            cleaning=cleaning,
            catering=catering,
            furshet=furshet,
            dj=dj,
            wedding=wedding,
            guide=guide,
            flowers=flowers,
            ballons=ballons,
            component_id=component_id
        ).returning(calc_stuff.c.id))
        
        result = await session.execute(stmt)
        await session.commit()
        item_id = result.scalar_one_or_none()

    return item_id

async def get_leaflet_light(session: AsyncSession, name: str):
    stmt = (select(piers).join(maps, maps.c.id == piers.c.group_id).where(maps.c.name == name))
    result = await session.execute(stmt)
    rows = result.fetchall()

    json_group = []
    piers_arr = []

    for row in rows:
        json_obj = {
            "id": row.id,
            "lat": row.lat,
            "lng": row.lng
        }
        piers_arr.append(json_obj)

    stmt_id = (select(maps.c.id, maps.c.button_info, maps.c.desc, maps.c.ref, maps.c.image_src).where(maps.c.name == name))
    result_id = await session.execute(stmt_id)
    map_rows = result_id.fetchall()

    if map_rows:
        json_obj = {
            "id": map_rows[0].id,
            "button_info": map_rows[0].button_info,
            "desc": map_rows[0].desc,
            "ref": map_rows[0].ref,
            "image_src": map_rows[0].image_src,
            "piers": piers_arr
        }

        json_group.append(json_obj)

    else:
        json_obj = {
            "id": 0,
            "button_info": "",
            "desc": "",
            "ref": "",
            "image_src": "",
            "piers": piers_arr
        }

        json_group.append(json_obj)

    return json_group

# добавление ip count
def add_ip_count(ip: str):
    key = f"{ip}_enters"

    attempts = r.incr(key)

    if attempts == 1:
        r.expire(key, 5 * 60)
    if attempts > 10:
        return False
        
    return True

async def get_calculator_light(session: AsyncSession, name: str):
    try:
        # Получаем ID калькулятора
        stmt_calc_id = (
            select(calculators.c.id)
            .where(calculators.c.name == name)
        )

        result_calc_id = await session.execute(stmt_calc_id)
        calc_id = result_calc_id.scalar_one_or_none()

        if calc_id is None:
            return None

        # Получаем сезоны
        stmt_select_seasons = (
            select(order_seasons)
            .where(order_seasons.c.component_id == calc_id)
        )

        result_select_seasons = await session.execute(stmt_select_seasons)
        seasons_rows = result_select_seasons.fetchall()

        # Итоговый объект
        component_content = {}

        for season in seasons_rows:

            # Получаем недели конкретного сезона
            stmt_select_weeks = (
                select(week_days)
                .where(week_days.c.season_id == season.id)
            )

            result_select_weeks = await session.execute(stmt_select_weeks)
            week_rows = result_select_weeks.fetchall()

            weeks_arr = []

            for week_row in week_rows:

                week = {
                    "from_time": week_row.from_time,
                    "to_time": week_row.to_time,

                    "days": {
                        "mn": week_row.mn,
                        "ts": week_row.ts,
                        "ws": week_row.ws,
                        "tu": week_row.tu,
                        "fr": week_row.fr,
                        "sn": week_row.sn,
                        "st": week_row.st
                    },

                    "min_hours": week_row.hours
                }

                weeks_arr.append(week)

            # Проверяем, что для сезона есть 3 периода
            if len(weeks_arr) < 3:
                raise ValueError(
                    f"Для сезона {season.type_date} найдено "
                    f"только {len(weeks_arr)} недель вместо 3"
                )

            # Добавляем сезон
            component_content[season.type_date] = {
                "from_date": season.from_date,
                "to_date": season.to_date,

                "time": {
                    "part_1": weeks_arr[0],
                    "part_2": weeks_arr[1],
                    "part_3": weeks_arr[2]
                }
            }

        # Получаем дополнительные услуги
        stmt_select_stuff = (
            select(calc_stuff)
            .where(calc_stuff.c.component_id == calc_id)
        )

        result_select_stuff = await session.execute(stmt_select_stuff)

        select_stuff_rows = (
            result_select_stuff
            .mappings()
            .one_or_none()
        )

        if select_stuff_rows is None:

            print("calc_stuff не найден")

            component_content["stuff"] = {
                "cleaning": None,
                "catering": None,
                "furshet": None,
                "dj": None,
                "wedding": None,
                "guide": None,
                "flowers": None,
                "ballons": None
            }

        else:

            print(6)

            stuff_obj = {
                "cleaning": select_stuff_rows["cleaning"],
                "catering": select_stuff_rows["catering"],
                "furshet": select_stuff_rows["furshet"],
                "dj": select_stuff_rows["dj"],
                "wedding": select_stuff_rows["wedding"],
                "guide": select_stuff_rows["guide"],
                "flowers": select_stuff_rows["flowers"],
                "ballons": select_stuff_rows["ballons"]
            }

            component_content["stuff"] = stuff_obj

        # ==========================================
        # Преобразуем date / time / Decimal и т.д.
        # в JSON-совместимые типы
        # ==========================================

        component_content = jsonable_encoder(component_content)

        return component_content

    except IntegrityError as e:
        print(f"IntegrityError: {e}")
        raise

    except Exception as e:
        print(f"Ошибка в get_calculator_light: {e}")
        raise

async def load_page(session_factory: async_sessionmaker, adress: str, productAdress: str = ""):
    async with session_factory() as session:
        stmt = select(pages).where(pages.c.api_adress == adress)
        result = await session.execute(stmt)
        page = result.one_or_none()
        
        if not page:
            return None
        
        component_stmt = (select(pages_components).where(pages_components.c.group_id == page.id))
        result = await session.execute(component_stmt)
        components = result.fetchall()
         
        components_arr = []
        for component in components:
            component_content = []
            groups_arr = []

            # Загружаем данные компонента
            if component.name == "advertisement":
                component_content = await get_from_advertisemnts_light(session, component.group_name) or []
                groups_arr = await get_from_advertisement_groups_light(session) or []
            elif component.name == "catering":
                component_content = await get_from_catering_light(session, component.group_name) or []
                groups_arr = await get_from_catering_groups_light(session) or []
            elif component.name == "category":
                component_content = []
            elif component.name == "popularTasks":
                component_content = await get_from_tasks_light(session, component.group_name) or []
                groups_arr = await get_from_task_groups_light(session) or []
            elif component.name == "productsGrid":
                component_content = await get_from_products_light(session, component.group_name) or []
                groups_arr = await get_from_product_grid_groups_light(session) or []
            elif component.name == "redactor":
                component_content = await get_from_redactor_light(session, component.group_name) or []
            elif component.name == "regularReviews":
                component_content = await get_from_regular_reviews_light(session, component.group_name) or []
                groups_arr = await get_from_regular_reviews_groups_light(session) or []
            elif component.name == "reviewsYa":
                component_content = []
            elif component.name == "simmilarProducts":
                component_content = await get_from_simmilar_products_groups_light(session, component.group_name) or []
                groups_arr = component_content
            elif component.name == "vista":
                component_content = await get_from_vista_light(session, component.group_name) or []
                groups_arr = component_content
            elif component.name == "leaflet":
                component_content = await get_leaflet_light(session, component.group_name or "") or []
            elif component.name == "calculator":
                component_content = await get_calculator_light(session, component.group_name or "") or []
            elif component.name == "space":
                if component.space_id != 0:
                    component_content = await get_spaces(session, component.space_id) or []

            matching_group = next((group for group in groups_arr if group["name"] == component.group_name), None)

            if matching_group:
               group_id = matching_group["id"]
            else:
               group_id = None

            if component.name == "redactor" or component.name == "reviewsYa" or component.name == "space" or component.name == "leaflet":
                group_id = 0

            component_obj ={
                    "id": component.id,
                    "name": component.name,
                    "component_content": component_content,
                    "order_id": component.order_id,
                    "group_id": group_id,
                    "group_name": component.group_name
                }
            components_arr.append(component_obj)

        page_json = {
                "id": page.id,
                "name": page.name,
                "api_adress": page.api_adress,
                "template_type": page.template_type,
            }

        if page.template_type == "ShopPage":
            filters = await get_shop_filters_light(session, page.name)

            if productAdress != "":
                products = await get_from_products_light_certain(session, page.name, productAdress)
            else:
                products = await get_from_products_light(session, page.name)

            desktop_image_src = await get_from_shops_pages_desktop_image_src(session, page.id)
            mobile_image_src = await get_from_shops_pages_mobile_image_src(session, page.id)

            return {
                "obj": page_json,
                "content": {
                    "title": page.name,
                    "filters": filters,
                    "products": products,
                    "desc_image_src": desktop_image_src,
                    "mobile_image_src": mobile_image_src
                },
                "components": components_arr,
            }

        elif page.template_type == "ProductPage":
            product_page = await get_from_products_pages_light(session, page.name)
            product = await get_product_with_page_id_light(session, product_page[0]["id"])
            product_desc = await get_from_products_pages_description_light(session, page.name)
            product_reviews = await get_from_regular_reviews_light_with_id(session, product_page[0]["reviews_id"])
            
            return {
                "obj": page_json,
                "content": {
                    "info": product_page,
                    "product": product,
                    "tags": product_desc,
                    "reviews": product_reviews
                },
                "components": components_arr
            }
        elif page.template_type == "NewsPage":
            news_page = await get_from_news_pages_light(session, page.name)
            news_reviews = await get_from_news_previews_light(session, page.name)

            return {
                "obj": page_json,
                "content": {
                    "info": news_page,
                    "items": news_reviews
                },
                "components": components_arr
            }
        elif page.template_type == "RegularPage":
            regular_page = await get_from_regular_pages_light(session, page.name)

            return {
                "obj": page_json,
                "content": {
                    "info": regular_page
                },
                "components": components_arr
            }
        elif page.template_type == "BlogPage":
            blog_page = await get_from_blog_pages_light(session, page.name)

            return {
                "obj": page_json,
                "content": {
                    "info": blog_page
                },
                "components": components_arr
            }
        elif page.template_type == "MainPage":
            main_page = await get_from_main_pages_light(session, page.name)

            return {
                "obj": page_json,
                "content": {
                    "info": main_page
                },
                "components": components_arr
            }
        else:
            return None