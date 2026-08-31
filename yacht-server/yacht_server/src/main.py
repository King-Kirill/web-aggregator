from fastapi import FastAPI, Header, HTTPException, Request, Response, Depends, status, UploadFile, File, Form, Query
from fastapi.exceptions import RequestValidationError
from starlette.status import HTTP_422_UNPROCESSABLE_CONTENT
from starlette.responses import Response
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
import secrets
from dotenv import load_dotenv
import os
import aiosmtplib
import asyncio
from email.message import EmailMessage
import json
from  adminAuth import verify_token, log_user
from  storage import S3Client
from sqlalchemy import text, inspect
import re
import  schemas
from  database import Base, async_engine, sync_engine, async_session_factory, session_factory
from  database_func import ( put_in_header, put_in_footer, delete_from_footer, delete_from_header, get_from_header, get_from_footer, put_in_advertisement_groups, delete_from_advertisement_groups, put_in_advertisements, delete_from_advertisements, get_from_advertisement_groups,
                               get_from_advertisements, put_in_category_groups, delete_from_category_groups, put_in_categories, delete_from_categories, get_from_category_groups, get_from_categories, put_in_task_groups, delete_from_task_groups, put_in_tasks, delete_from_tasks, get_from_task_groups,
                               get_from_tasks, put_in_search_tags, delete_from_search_tags, get_from_search_tags, get_all_from_search_tags, get_from_tags, get_all_from_tags, delete_from_product_grid_groups, get_from_product_grid_groups, put_in_products, delete_from_products, get_from_products,
                               put_in_products_images, delete_from_products_images, get_products_images, put_in_regular_reviews_groups, delete_from_regular_reviews_groups, get_from_regular_reviews_groups, put_in_regular_reviews, delete_from_regular_reviews, get_from_regular_reviews, 
                               put_in_yandex_reviews, delete_from_yandex_reviews, get_from_yandex_reviews, put_in_simmilar_products_groups, delete_from_simmilar_products_groups, get_from_simmilar_products_groups, put_in_vista, delete_from_vista, get_from_vista, update_advertisement_groups, update_header, update_footer,
                               update_advertisements, update_category_groups, update_categories, update_task_groups, update_tasks, update_search_tags, update_product_grid_groups, update_products, update_products_images, update_regular_reviews_groups, update_regular_reviews, update_yandex_reviews, update_simmilar_products_groups, update_vista,
                               put_in_pages, delete_from_pages, get_from_pages, put_in_pages_components, delete_from_pages_components, update_from_pages_components, get_from_pages_components, put_in_shops_pages, delete_from_shops_pages, update_from_shop_pages, get_from_shops_pages,
                               put_in_redactor, delete_from_redactor, update_redactor, get_all_from_redactors, get_from_redactor, put_in_shops_pages_filters, get_from_main_pages, get_from_blog_pages, get_from_regular_pages, get_from_news_previews, get_from_products_pages_description, get_from_news_pages,
                               get_from_products_pages, get_shop_filters, update_from_main_pages, delete_from_main_pages, put_in_main_pages, update_from_blog_pages, delete_from_blog_pages, update_from_regular_pages, put_in_blog_pages, delete_from_regular_pages, update_from_news_previews, put_in_regular_pages,
                               delete_from_shops_pages_filters, update_from_shops_pages_filters, put_in_shops_pages_filters_items, delete_from_shops_pages_filters_items, update_from_shops_pages_filters_items, put_in_products_pages, delete_from_products_pages, update_from_products_pages, put_in_products_pages_description,
                               delete_from_products_pages_description, update_from_products_pages_description, put_in_news_pages, delete_from_news_pages, update_from_news_pages, delete_from_news_previews, put_in_news_previews, put_in_product_groups, put_in_tags, load_page, delete_from_many_tags, delete_from_many_search_tags,
                               check_email_in_group, put_in_regular_reviews_temp, cleanup_expired_tokens_reviews, get_review_by_token, delete_temp_review, search_products, get_from_vista_names, get_from_vista_with_name, get_from_simmilar_products_names, get_all_from_tags_names, get_all_from_search_tags_names,
                               get_from_simmilar_products_name, update_product_popularity, load_products_filtered, get_products_by_ids, get_shop_pages_groups, get_regular_pages_groups, get_news_pages_groups, get_from_news_previews_ids, update_from_pages, update_from_blog_delta, update_from_news_desc, update_products_pages_video, get_products_by_ids_all, load_products_filtered_ids, create_space, update_space, delete_space, seed_all, numbProducts, update_meta_from_pages,
                               get_privacy_policy, get_rent_policy, update_privacy_policy, update_order_main_catalog, put_in_catering_groups, delete_from_catering_groups, update_catering_groups, put_in_catering, delete_from_catering, get_from_catering, update_from_catering, get_from_catering_groups, update_from_regular_pages_image_src, get_from_pages_urls, create_in_main_swiper, update_in_main_swiper, delete_from_main_swiper, get_from_main_swiper, put_in_maps, put_in_piers, delete_from_piers, delete_from_maps, update_in_maps, add_ip_count,
                               put_in_main_swiper_mobile, put_image_in_shop_page_desktop, put_image_in_shop_page_mobile, put_in_menu_calculator, put_in_calculators, put_in_calculators_seasons, put_in_weeks, put_in_calc_stuff)
from sqlalchemy.exc import NoResultFound, IntegrityError 
from  telegram import sendMessage, sendSimpleMessage, send_review_request, sendTaskRequest
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

#cors politics - выдвеют необходимые разрешения для отправки данных на клиент
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def seed_data():
    seed_all(session_factory)
    # numbProducts(session_factory)
    
load_dotenv()

def create_tables():
    inspector = inspect(sync_engine)
    existing_tables = inspector.get_table_names()

    model_tables = Base.metadata.tables.keys()

    missing_tables = [t for t in model_tables if t not in existing_tables]

    if missing_tables:
        Base.metadata.create_all(sync_engine)

    seed_data()

create_tables()
storage_client = S3Client()

theme_is_dark = False

@app.get("/get-theme")
async def get_theme():
    return JSONResponse(
                status_code=200,
                content={"success": True, "content": theme_is_dark}
            )

@app.post("/update-theme")
async def update_theme(_: bool = Depends(verify_token)):
    global theme_is_dark
    
    if(theme_is_dark):
        theme_is_dark = False
    else:
        theme_is_dark = True
    
    return JSONResponse(
                status_code=200,
                content={"success": True}
            )

#log-in-admin
@app.post("/log-in")
async def log_in(creds:  schemas.Admin):
    try:
        token_data = await log_user(creds.name, creds.password)
        if token_data is None:
            if not token_data:
                return JSONResponse(
                    status_code=401,
                    content={"success": False, "error": "invalid credentials"}
                )

        response = JSONResponse({"success": True})
        response.set_cookie(
            key="admin_token",
            value=token_data["access_token"],
            httponly=True,
            samesite="none",
            secure=True,
            max_age=3600
        )
        return response

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(cleanup_expired_tokens_reviews(async_session_factory))

@app.post("/post-header-popular")
async def post_header_popular(creds:  schemas.HeaderCreate, _: bool = Depends(verify_token)):
    try:
        button_id = await put_in_header(async_session_factory, creds.name, creds.api_adress, creds.order_id, 1)
        if button_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": button_id}}
            )
            
    except NoResultFound:
        return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#search algorithum
@app.post("/search-product")
async def search_product(creds:  schemas.Search):
    try:
        result = await search_products(async_session_factory, creds.search_str)
        if result is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "no products found"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": result}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-header-popular")
async def update_popular_header(creds:  schemas.Header, _: bool = Depends(verify_token)):
    try:
        result = await update_header(async_session_factory, creds.id, creds.name, creds.api_adress, creds.order_id, 1)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/post-header-catalog")
async def post_header_catalog(creds:  schemas.GroupName, _: bool = Depends(verify_token)):
    try:
        button_id = await put_in_header(async_session_factory, creds.name, "", 1, 2)
        catalog_id = await put_in_category_groups(async_session_factory, creds.name)
        if button_id is None or catalog_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"button_id": catalog_id, "catalog_id": catalog_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-header-catalog")
async def update_catalog_header(creds:  schemas.Header, _: bool = Depends(verify_token)):
    try:
        result = await update_header(async_session_factory, creds.id, creds.name, creds.api_adress, creds.order_id, 2)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.post("/post-header-about")
async def post_header_about(creds:  schemas.HeaderCreate, _: bool = Depends(verify_token)):
    try:
        button_id = await put_in_header(async_session_factory, creds.name, creds.api_adress, creds.order_id, 3)
        if button_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": button_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-header-about")
async def update_about_header(creds:  schemas.Header, _: bool = Depends(verify_token)):
    try:
        result = await update_header(async_session_factory, creds.id, creds.name, creds.api_adress, creds.order_id, 3)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.post("/post-header-category")
async def post_header_category(creds:  schemas.GroupName, _: bool = Depends(verify_token)):
    try:
        button_id = await put_in_header(async_session_factory, creds.name, "", 1, 4)
        if button_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": button_id}}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-header-category")
async def update_category_header(creds:  schemas.Header, _: bool = Depends(verify_token)):
    try:
        result = await update_header(async_session_factory, creds.id, creds.name, creds.api_adress, creds.order_id, 4)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/post-header-pages")
async def post_header_pages(creds:  schemas.HeaderCreate, _: bool = Depends(verify_token)):
    try:
        button_id = await put_in_header(async_session_factory, creds.name, creds.api_adress, creds.order_id, 5)
        if button_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": button_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-header-pages")
async def update_pages_header(creds:  schemas.Header, _: bool = Depends(verify_token)):
    try:
        result = await update_header(async_session_factory, creds.id, creds.name, creds.api_adress, creds.order_id, 5)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.delete("/header-delete/{item_id}")
async def post_header_delete(item_id: int, _: bool = Depends(verify_token)):
    try:
        result = await delete_from_header(async_session_factory, item_id)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#rent/privacy policy
@app.get("/get-privacy-policy-func")
async def get_privacy_policy_func():
    try:
        result = await get_privacy_policy(async_session_factory)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.get("/get-rent-policy-func")
async def get_rent_policy_func():
    try:
        result = await get_rent_policy(async_session_factory)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-privacy")
async def update_policy(creds:  schemas.RedactorPolicy, _: bool = Depends(verify_token)):
    try:
        result = await update_privacy_policy(async_session_factory, creds.name, creds.delta)
        if result != True:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

#footer
@app.post("/post-footer")
async def post_footer(creds:  schemas.FooterCreate, _: bool = Depends(verify_token)):
    try:
        button_id = await put_in_footer(async_session_factory, creds.name, creds.api_adress, creds.order_id)
        if button_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": button_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.delete("/footer-delete/{item_id}")
async def post_footer_delete(item_id: int, _: bool = Depends(verify_token)):
    try:
        result = await delete_from_footer(async_session_factory, item_id)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-footer")
async def update_from_footer(creds:  schemas.Footer, _: bool = Depends(verify_token)):
    try:
        result = await update_footer(async_session_factory, creds.id, creds.name, creds.api_adress, creds.order_id)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

#advertisement
@app.post("/create-ad-group")
async def create_ad_group(creds:  schemas.GroupName, _: bool = Depends(verify_token)):
    try:
        group_id = await put_in_advertisement_groups(async_session_factory, creds.name)
        if group_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.delete("/delete-ad-group/{item_id}")
async def delete_ad_groups(item_id: int, _: bool = Depends(verify_token)):
    try:
        result = await delete_from_advertisement_groups(async_session_factory, item_id)

        if result:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
        
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-ad-group")
async def update_ad_group(creds:  schemas.GroupNameUpd, _: bool = Depends(verify_token)):
    try:
        result = await update_advertisement_groups(async_session_factory, creds.id, creds.name)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.post("/create-ad")
async def create_ad(creds:  schemas.AdvertisementCreate, _: bool = Depends(verify_token)):
    try: 

        item_id = await put_in_advertisements(
            async_session_factory, 
            creds.image_src, 
            creds.delta, 
            creds.button_info,
            creds.ref_button_info,
            creds.ref,
            creds.order_id, 
            creds.group_id
        )

        if item_id is None:
            return JSONResponse(
                status_code=404,
                content={"success": False, "error": "failed to find a data"}
            )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": item_id}}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )

@app.delete("/delete-ad/{item_id}")
async def delete_ad(item_id: int, _: bool = Depends(verify_token)):
    try: 
        result = await delete_from_advertisements(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-ad")
async def update_ad(creds:  schemas.Advertisement, _: bool = Depends(verify_token)):
    try:
        result = await update_advertisements(
            async_session_factory,
            creds.id,
            creds.image_src,
            creds.delta,
            creds.button_info,
            creds.ref_button_info,
            creds.ref,
            creds.order_id,
            creds.group_id
        )

        if result is False:
            return JSONResponse(
                status_code=404,
                content={"success": False, "error": "failed to find a data"}
            )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        print(e)
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

    except Exception as e:
        print(e)
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "unexpected error"}
        )

#catering
@app.post("/create-catering-group")
async def create_catering_group(creds:  schemas.GroupName, _: bool = Depends(verify_token)):
    try:
        group_id = await put_in_catering_groups(async_session_factory, creds.name)
        if group_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.delete("/delete-catering-group/{item_id}")
async def delete_catering_groups(item_id: int, _: bool = Depends(verify_token)):
    try:
        result = await delete_from_catering_groups(async_session_factory, item_id)

        if result:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
        
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-catering-group")
async def update_catering_group(creds:  schemas.GroupNameUpd, _: bool = Depends(verify_token)):
    try:
        result = await update_catering_groups(async_session_factory, creds.id, creds.name)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.post("/create-catering")
async def create_catering(creds:  schemas.CateringCreate, _: bool = Depends(verify_token)):
    try: 

        item_id = await put_in_catering(
            async_session_factory, 
            creds.group_id,
            creds.title,
            creds.text,
            creds.image_src,
            creds.pdf_ref,
            creds.order_id
        )

        if item_id is None:
            return JSONResponse(
                status_code=404,
                content={"success": False, "error": "failed to find a data"}
            )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": item_id}}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )
    
@app.delete("/delete-catering/{item_id}")
async def delete_catering(item_id: int, _: bool = Depends(verify_token)):
    try: 
        result = await delete_from_catering(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-catering")
async def update_catering(creds:  schemas.Catering, _: bool = Depends(verify_token)):
    try:
        result = await update_from_catering(
            async_session_factory,
            creds.id,
            creds.group_id,
            creds.title,
            creds.text,
            creds.image_src,
            creds.pdf_ref,
            creds.order_id
        )

        if result is False:
            return JSONResponse(
                status_code=404,
                content={"success": False, "error": "failed to find a data"}
            )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        print(e)
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

    except Exception as e:
        print(e)
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "unexpected error"}
        )

#categories
@app.post("/create-category-group")
async def create_category_group(creds:  schemas.GroupName, _: bool = Depends(verify_token)):
    try:
        group_id = await put_in_category_groups(async_session_factory, creds.name)
        if group_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.delete("/delete-category-group/{item_id}")
async def delete_category_group(item_id: int, _: bool = Depends(verify_token)):
    try: 
        result = await delete_from_category_groups(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-category-group")
async def update_category_group(creds:  schemas.GroupNameUpd, _: bool = Depends(verify_token)):
    try:
        result = await update_category_groups(async_session_factory, creds.id, creds.name)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.post("/create-category")
async def create_category(creds:  schemas.CategoryCreate, _: bool = Depends(verify_token)):
    try:
        item_id = await put_in_categories(async_session_factory, creds.name, creds.image_src, creds.api_adress, creds.amount, creds.order_id, creds.group_id)

        if item_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": item_id}}
            )
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        ) 
    
@app.delete("/delete-category/{item_id}")
async def delete_category(item_id: int, _: bool = Depends(verify_token)):
    try: 
        result = await delete_from_categories(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-categories")
async def update_from_categories(creds:  schemas.Category, _: bool = Depends(verify_token)):
    try:
        result = await update_categories(async_session_factory, creds.id, creds.name, creds.image_src, creds.api_adress, creds.amount, creds.order_id, creds.group_id)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#tasks
@app.post("/create-task-group")
async def create_task_group(creds:  schemas.GroupName, _: bool = Depends(verify_token)):
    try: 
        group_id = await put_in_task_groups(async_session_factory, creds.name)
        if group_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.delete("/delete-task-group/{item_id}")
async def delete_task_group(item_id: int, _: bool = Depends(verify_token)):
    try:
        result = await delete_from_task_groups(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-task-group")
async def update_task_group(creds:  schemas.GroupNameUpd, _: bool = Depends(verify_token)):
    try:
        result = await update_task_groups(async_session_factory, creds.id, creds.name)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/create-task")
async def create_task(creds:  schemas.PopularTaskCreate, _: bool = Depends(verify_token)):
    try:
        item_id = await put_in_tasks(async_session_factory, creds.name, creds.text, creds.order_id, creds.group_id)

        if item_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": item_id}}
            )
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        ) 
    
@app.delete("/delete-task/{item_id}")
async def delete_task(item_id: int, _: bool = Depends(verify_token)):
    try: 
        result = await delete_from_tasks(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-task")
async def update_task(creds:  schemas.PopularTask, _: bool = Depends(verify_token)):
    try:
        result = await update_tasks(async_session_factory, creds.id, creds.name, creds.text, creds.order_id, creds.group_id)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

#search tags
@app.post("/create-search-tag")
async def create_search_tag(creds:  schemas.GroupName, _: bool = Depends(verify_token)):
    try:
        json_obj = await put_in_search_tags(async_session_factory, creds.name)
        if json_obj is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": json_obj}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/create-tag")
async def create_tag(creds:  schemas.NewCreate, _: bool = Depends(verify_token)):
    try:
        json_obj = await put_in_tags(async_session_factory, creds.name, creds.image_src)
        if json_obj is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": json_obj}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.delete("/delete-search-tag/{item_id}")
async def delete_search_tag(item_id: int, _: bool = Depends(verify_token)):
    try: 
        result = await delete_from_search_tags(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.post("/update-search-tag")
async def update_from_search_tag(creds:  schemas.SearchTag, _: bool = Depends(verify_token)):
    try:
        result = await update_search_tags(async_session_factory, creds.id, creds.name)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.post("/update-product-order-id")
async def update_product_order_id(creds:  schemas.UpdateOrder, _: bool = Depends(verify_token)):
    try:
        result = await update_order_main_catalog(async_session_factory, creds.id, creds.order_id, creds.old_order_id)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.post("/delete-from-many-to-many-tags")
async def delete_from_many_to_many(creds:  schemas.ManyToManyTagCreate, _: bool = Depends(verify_token)):
    try: 
        result = await delete_from_many_tags(async_session_factory, creds.tag_id, creds.product_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.post("/delete-from-many-to-many-search-tags")
async def delete_from_many_to_many_search(creds:  schemas.ManyToManyTagCreate, _: bool = Depends(verify_token)):
    try: 
        result = await delete_from_many_search_tags(async_session_factory, creds.tag_id, creds.product_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

#products
@app.post("/create-product-group")
async def create_product_group(creds:  schemas.ProductGridGroupCreate, _: bool = Depends(verify_token)):
    try:
        group_id = await put_in_product_groups(async_session_factory, creds.name, creds.cols_amount, creds.max_price, creds.min_price)

        if group_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.delete("/delete-product-group/{item_id}")
async def delete_product_group(item_id: int, _: bool = Depends(verify_token)):
    try:
        result = await delete_from_product_grid_groups(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.post("/update-product-group")
async def update_product_group(creds:  schemas.ProductGridGroup, _: bool = Depends(verify_token)):
    try:
        result = await update_product_grid_groups(
            async_session_factory, 
            creds.id, 
            creds.name, 
            creds.cols_amount, 
            creds.max_price, 
            creds.min_price
        )
        if result is False:
            return JSONResponse(
                status_code=404,
                content={"success": False, "error": "failed to find a data"}
            )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        # выводим подробности ошибки для дебага
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.post("/create-product")
async def create_product(creds:  schemas.ProductCreate, _: bool = Depends(verify_token)):
    try:
        group_id = await put_in_products(
            async_session_factory,
            creds.name, creds.description, creds.discount, creds.price,
            creds.group_id, creds.api_adress, creds.capacity,
            creds.rating, creds.tags_list, creds.to_search_tags_list, creds.order_id,
            creds.toilet, creds.page_id, creds.product_page_id, creds.reviews_id, creds.date
        )

        if group_id is None:
            return JSONResponse(
                status_code=404,
                content={"success": False, "error": "failed to find a data"}
            )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "unexpected internal error"}
        )
    
@app.delete("/delete-product/{item_id}")
async def delete_product(item_id: int, _: bool = Depends(verify_token)):
    try:
        result = await delete_from_products(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-product")
async def update_product(creds:  schemas.Product, _: bool = Depends(verify_token)):
    try:
        result = await update_products(async_session_factory, creds.id, creds.name, creds.description, creds.discount, creds.price, creds.group_id, creds.api_adress, creds.capacity, creds.toilet, creds.rating, creds.tags_list, creds.to_search_tags_list, creds.date)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        # логирование ошибки
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-popularity")
async def update_popularity(creds:  schemas.ItemID):
    try:
        result = await update_product_popularity(async_session_factory, creds.id)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        # логирование ошибки
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.post("/create-product-image")
async def create_product_image(creds:  schemas.ProductImageCreate, _: bool = Depends(verify_token)):
    try:
        group_id = await put_in_products_images(async_session_factory, creds.image_src, creds.group_id, creds.order_id)

        if group_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.delete("/delete-product-image/{item_id}")
async def delete_product_image(item_id: int, _: bool = Depends(verify_token)):
    try:
        result = await delete_from_products_images(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-product-images")
async def update_product_images(creds:  schemas.ProductImage, _: bool = Depends(verify_token)):
    try:
        result = await update_products_images(async_session_factory, creds.id, creds.image_src, creds.group_id, creds.order_id)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/load-products")
async def load_products(creds:  schemas.SearchProductsByFilter):
    try:
        result = await load_products_filtered(async_session_factory, creds.capacity_tags, creds.toilet_tags, creds.other_tags, creds.max_price, creds.min_price, creds.group_id)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/load-products-search")
async def load_products_search(creds:  schemas.SearchProductsByFilterIds):
    try:
        result = await load_products_filtered_ids(async_session_factory, creds.capacity_tags, creds.toilet_tags, creds.other_tags, creds.max_price, creds.min_price, creds.ids)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

#regular reviews
@app.post("/create-regular-reviews-group")
async def create_regular_reviews_group(creds:  schemas.GroupName, _: bool = Depends(verify_token)):
    try:
        group_id = await put_in_regular_reviews_groups(async_session_factory, creds.name)

        if group_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.delete("/delete-regular-reviews-group/{item_id}")
async def delete_regular_reviews_group(item_id: int, _: bool = Depends(verify_token)):
    try:
        result = await delete_from_regular_reviews_groups(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-regular-reviews-group")
async def update_regular_reviews_group(creds:  schemas.GroupNameUpd, _: bool = Depends(verify_token)):
    try:
        result = await update_regular_reviews_groups(async_session_factory, creds.id, creds.name)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/create-regular-review-admin")
async def create_regular_review_admin(creds:  schemas.RegularReviewCreate, _: bool = Depends(verify_token)):
    EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)$"
    NAME_REGEX = r"^[A-Za-zА-Яа-яЁё\s\-]{2,50}$"

    try:
        if not re.match(NAME_REGEX, creds.user_name):
            return JSONResponse(
                status_code=422,
                content={"success": False, "error": "incorrect name"}
            )
        
        group_id = await put_in_regular_reviews(
            async_session_factory,
            creds.group_id,
            creds.text,
            creds.rating,
            creds.user_name,
            creds.order_id,
            creds.email
        )

        if group_id is None:
            return JSONResponse(
                status_code=404,
                content={"success": False, "error": "failed to find a data"}
            )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )

@app.post("/create-regular-review")
async def create_regular_review(creds:  schemas.RegularReviewCreate):
    EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)$"
    NAME_REGEX = r"^[A-Za-zА-Яа-яЁё\s\-]{2,50}$"

    try:
        if not re.match(NAME_REGEX, creds.user_name):
            return JSONResponse(
                status_code=422,
                content={"success": False, "error": "incorrect name"}
            )

        domain = re.match(EMAIL_REGEX, creds.email)
        if not domain:
            return JSONResponse(
                status_code=422,
                content={"success": False, "error": "incorrect email"}
            )

        email_exists = await check_email_in_group(async_session_factory, creds.email, creds.group_id)

        if email_exists:
            return JSONResponse(
                status_code=404,
                content={"success": False, "error": "email already exists"}
            )

        token = secrets.token_urlsafe(32)
        domain = domain.group(1)

        if domain not in ("yandex.ru", "mail.ru", "gmail.com"):
            return JSONResponse(
                status_code=422,
                content={"success": False, "error": "incorrect email"}
            )

        confirm_link = f"https://vip-boat.ru/confirm-email?token={token}"

        email_to = creds.email

        SMTP_USER = ""
        SMTP_HOST = ""
        SMTP_PORT = int(os.getenv("SMTP_PORT"))
        SMTP_PASSWORD = ""

        if domain == "yandex.ru":
            SMTP_HOST = os.getenv("SMTP_HOST_YANDEX")
            SMTP_USER = os.getenv("SMTP_USER_YANDEX")
            SMTP_PASSWORD = os.getenv("SMTP_PASSWORD_YANDEX")

        elif domain == "mail.ru":
            SMTP_HOST = os.getenv("SMTP_HOST_MAIL")
            SMTP_USER = os.getenv("SMTP_USER_MAIL")
            SMTP_PASSWORD = os.getenv("SMTP_PASSWORD_MAIL")

        elif domain == "gmail.com":
            SMTP_HOST = os.getenv("SMTP_HOST_GMAIL")
            SMTP_USER = os.getenv("SMTP_USER_GMAIL")
            SMTP_PASSWORD = os.getenv("SMTP_PASSWORD_GMAIL")

        # Формируем письмо
        html_content = f"""
            <p>Привет, {creds.user_name}!</p>
            <p>Чтобы опубликовать отзыв, нажми на кнопку ниже:</p>
            <a href="{confirm_link}" 
                style="display:inline-block;padding:10px 20px;background:#4CAF50;color:white;text-decoration:none;border-radius:5px;">
                Подтвердить email
            </a>
            <p>Ссылка действительна 10 минут.</p>
        """

        message = EmailMessage()
        message["From"] = f"{SMTP_USER}"
        message["To"] = email_to
        message["Subject"] = "Подтверждение email"
        message.set_content("Для подтверждения email нажмите на кнопку в письме.")
        message.add_alternative(html_content, subtype="html")

        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
            start_tls=True
        )

        group_id = await put_in_regular_reviews_temp(
            async_session_factory,
            creds.ip_adress,
            creds.group_id,
            creds.text,
            creds.rating,
            creds.user_name,
            creds.order_id,
            creds.email,
            token
        )

        if group_id is None:
            return JSONResponse(
                status_code=404,
                content={"success": False, "error": "failed to find a data"}
            )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        print(e)
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

    except Exception as e:
        print(e)
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )
    

@app.get("/confirm_email_review")
async def confirm_email_review(token: str = Query(...)):
    review = await get_review_by_token(async_session_factory, token)
    if not review:
         return JSONResponse(
            status_code=404,
            content={"success": False, "error": "token has been expired or not exists"}
        )
    
    group_id = await put_in_regular_reviews(
        async_session_factory,
        review.group_id,
        review.text,
        review.rating,
        review.user_name,
        review.order_id,
        review.email
    )

    await delete_temp_review(async_session_factory, token)

    # жесткий вызов метода отправки в тг
    await send_review_request(
        review.ip_adress,
        review.text,
        review.rating,
        review.user_name,
        review.email
    )

    if group_id is None:
        return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
    else:
        return JSONResponse(
            status_code=200,
            content={"success": True}
        )
    

@app.delete("/delete-regular-review/{item_id}")
async def delete_regular_review(item_id: int, _: bool = Depends(verify_token)):
    try:
        result = await delete_from_regular_reviews(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-regular-review")
async def update_regular_review(creds:  schemas.RegularReview, _: bool = Depends(verify_token)):
    try:
        result = await update_regular_reviews(async_session_factory, creds.id, creds.group_id, creds.text, creds.rating, creds.user_name, creds.order_id)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

#ynadex reviews
@app.post("/create-yandex-review")
async def create_yandex_review(creds:  schemas.YandexReviewCreate, _: bool = Depends(verify_token)):
    try:
        group_id = await put_in_yandex_reviews(async_session_factory, creds.text, creds.rating, creds.user_name, creds.order_id, creds.user_icon, creds.ref)

        if group_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.delete("/delete-yandex-review/{item_id}")
async def delete_yandex_review(item_id: int, _: bool = Depends(verify_token)):
    try:
        result = await delete_from_yandex_reviews(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-yandex-review")
async def update_yandex_review(creds:  schemas.YandexReview, _: bool = Depends(verify_token)):
    try:
        result = await update_yandex_reviews(async_session_factory, creds.id, creds.text, creds.rating, creds.user_name, creds.order_id, creds.user_icon, creds.ref)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

#simmilar products
@app.post("/create-simmilar-products-group")
async def create_simmilar_products_group(creds:  schemas.SimmilarProductCreate, _: bool = Depends(verify_token)):
    try:
        group_id = await put_in_simmilar_products_groups(async_session_factory, creds.name, creds.search_str)

        if group_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.delete("/delete-simmilar-products-group/{item_id}")
async def delete_simmilar_products_group(item_id: int, _: bool = Depends(verify_token)):
    try:
        result = await delete_from_simmilar_products_groups(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.post("/update-simmilar-products")
async def update_simmilar_products(creds:  schemas.SimmilarProduct, _: bool = Depends(verify_token)):
    try:
        result = await update_simmilar_products_groups(async_session_factory, creds.id, creds.name, creds.search_str)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#vista
@app.post("/create-vista")
async def create_vista(creds:  schemas.VistaCreate, _: bool = Depends(verify_token)):
    try:
        group_id = await put_in_vista(async_session_factory, creds.vista_src, creds.name)

        if group_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.delete("/delete-vista/{item_id}")
async def delete_vista(item_id: int, _: bool = Depends(verify_token)):
    try:
        result = await delete_from_vista(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-vista")
async def update_from_vista(creds:  schemas.Vista, _: bool = Depends(verify_token)):
    try:
        result = await update_vista(async_session_factory, creds.id, creds.vista_src, creds.name)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#space
@app.post("/create-space")
async def create_space_new(creds:  schemas.SpaceCreate, _: bool = Depends(verify_token)):
    try:
        group_id = await create_space(async_session_factory, creds.space)

        if group_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-space")
async def update_space_new(creds:  schemas.Space, _: bool = Depends(verify_token)):
    try:
        result = await update_space(async_session_factory, creds.id, creds.space)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.delete("/delete-space/{item_id}")
async def delete_space_new(item_id: int, _: bool = Depends(verify_token)):
    try:
        result = await delete_space(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#redactor
@app.post("/create-redactor")
async def create_redactor(creds:  schemas.RedactorCreate, _: bool = Depends(verify_token)):
    try:
        group_id = await put_in_redactor(async_session_factory, creds.delta, creds.name)

        if group_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.delete("/delete-redactor/{item_id}")
async def delete_redactor(item_id: int, _: bool = Depends(verify_token)):
    try:
        result = await delete_from_redactor(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-redactor")
async def update_from_redactor(creds:  schemas.Redactor, _: bool = Depends(verify_token)):
    try:
        result = await update_redactor(async_session_factory, creds.id, creds.delta, creds.name)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

#страницы
@app.post("/create-page")
async def create_page(creds:  schemas.PageCreate, _: bool = Depends(verify_token)):
    try:
        group_id = await put_in_pages(async_session_factory, creds.name, creds.template_type, creds.api_adress)

        if group_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.post("/update-meta-page")
async def update_meta(creds:  schemas.Meta, _: bool = Depends(verify_token)):
    try:
        result = await update_meta_from_pages(async_session_factory, creds.id, creds.title, creds.description, creds.robots, creds.script)

        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-page")
async def update_page(creds:  schemas.Page, _: bool = Depends(verify_token)):
    try:
        result = await update_from_pages(async_session_factory, creds.id, creds.name, creds.template_type, creds.api_adress)

        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.delete("/delete-page/{item_id}")
async def delete_page(item_id: int, _: bool = Depends(verify_token)):
    try:
        result = await delete_from_pages(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/create-page-component-space")
async def create_page_component(creds:  schemas.PageComponentCreateSpace, _: bool = Depends(verify_token)):
    try:
        group_id = await put_in_pages_components(
            async_session_factory,
            creds.name,
            creds.group_id,
            creds.order_id,
            creds.group_name,
            creds.space_id
        )

        if group_id is None:
            return JSONResponse(
                status_code=404,
                content={"success": False, "error": "failed to find a data"}
            )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

    except Exception as e:
        # общий обработчик на случай других неожиданных ошибок
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

# компоненты страницы
@app.post("/create-page-component")
async def create_page_component(creds:  schemas.PageComponentCreate):
    try:
        group_id = await put_in_pages_components(
            async_session_factory,
            creds.name,
            creds.group_id,
            creds.order_id,
            creds.group_name
        )

        if group_id is None:
            return JSONResponse(
                status_code=404,
                content={"success": False, "error": "failed to find a data"}
            )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

    except Exception as e:
        # общий обработчик на случай других неожиданных ошибок
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.delete("/delete-page-component/{item_id}")
async def delete_page_component(item_id: int, _: bool = Depends(verify_token)):
    # Проверка валидности item_id
    if item_id <= 0:
        return JSONResponse(
            status_code=422,
            content={"success": False, "error": f"Invalid item_id: {item_id}"}
        )

    try:
        result = await delete_from_pages_components(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
                status_code=404,
                content={"success": False, "error": f"Failed to find data with id: {item_id}"}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "Internal server error"}
        )

    except Exception as e:
        # Общий отлов любых других исключений
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "Unexpected internal error"}
        )

@app.post("/update-page-component")
async def update_page_component(creds:  schemas.PageComponent, _: bool = Depends(verify_token)):
    try:
        result = await update_from_pages_components(async_session_factory, creds.id, creds.name, creds.group_id, creds.order_id, creds.group_name)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#страницы магазины - гриды
@app.post("/create-shop-page")
async def create_shop_page(creds:  schemas.ShopPageCreate, _: bool = Depends(verify_token)):
    try:
        group_id = await put_in_shops_pages(async_session_factory, creds.page_id, creds.products_id, creds.page_title)

        if group_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.delete("/delete-shop-page/{item_id}")
async def delete_shop_page(item_id: int, _: bool = Depends(verify_token)):
    try:
        result = await delete_from_shops_pages(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-shop-page")
async def update_shop_page(creds:  schemas.ShopPage, _: bool = Depends(verify_token)):
    try:
        result = await update_from_shop_pages(async_session_factory, creds.id, creds.page_id, creds.products_id, creds.page_title)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#фильтры 
@app.post("/create-filter-group")
async def create_filter_group(creds:  schemas.ShopPageFilterCreate, _: bool = Depends(verify_token)):
    try:
        group_id = await put_in_shops_pages_filters(async_session_factory, creds.group_id, creds.name, creds.order_id)

        if group_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.delete("/delete-filter-group/{item_id}")
async def delete_filter_group(item_id: int, _: bool = Depends(verify_token)):
    try:
        result = await delete_from_shops_pages_filters(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-filter-group")
async def update_filter_group(creds:  schemas.ShopPageFilter, _: bool = Depends(verify_token)):
    try:
        result = await update_from_shops_pages_filters(async_session_factory, creds.id, creds.group_id, creds.name, creds.order_id)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/create-filter")
async def create_filter(creds:  schemas.ShopPageFilterItemCreate, _: bool = Depends(verify_token)):
    try:
        group_id = await put_in_shops_pages_filters_items(async_session_factory, creds.group_id, creds.name, creds.order_id)

        if group_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.delete("/delete-filter/{item_id}")
async def delete_filter(item_id: int, _: bool = Depends(verify_token)):
    try:
        result = await delete_from_shops_pages_filters_items(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-filter")
async def update_filter(creds:  schemas.ShopPageFilterItem, _: bool = Depends(verify_token)):
    try:
        result = await update_from_shops_pages_filters_items(async_session_factory, creds.id, creds.group_id, creds.name, creds.order_id)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

#products pages
@app.post("/create-product-page")
async def create_product_page(creds:  schemas.ProductPageCreate, _: bool = Depends(verify_token)):
    try:
        group_id = await put_in_products_pages(async_session_factory, creds.group_id, creds.title, creds.reviews_id)

        if group_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.delete("/delete-product-page/{item_id}")
async def delete_product_page(item_id: int, _: bool = Depends(verify_token)):
    try:
        result = await delete_from_products_pages(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-product-page")
async def update_product_page(creds:  schemas.ProductPage, _: bool = Depends(verify_token)):
    try:
        result = await update_from_products_pages(async_session_factory, creds.id, creds.group_id, creds.title)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-product-video")
async def update_product_video(creds:  schemas.UpdateVideo, _: bool = Depends(verify_token)):
    try:
        result = await update_products_pages_video(async_session_factory, creds.id, creds.video)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#product pages description
@app.post("/create-product-page-description")
async def create_product_page_description(creds:  schemas.ProductPageDescriptionCreate, _: bool = Depends(verify_token)):
    try:
        group_id = await put_in_products_pages_description(async_session_factory, creds.group_id, creds.name, creds.description, creds.order_id)

        if group_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.delete("/delete-product-page-description/{item_id}")
async def delete_product_page_description(item_id: int, _: bool = Depends(verify_token)):
    try:
        result = await delete_from_products_pages_description(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-product-page-description")
async def update_product_page_description(creds:  schemas.ProductPageDescription, _: bool = Depends(verify_token)):
    try:
        result = await update_from_products_pages_description(async_session_factory, creds.id, creds.group_id, creds.name, creds.description, creds.order_id)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#news page
@app.post("/create-news-page")
async def create_news_page(creds:  schemas.NewsPageCreate, _: bool = Depends(verify_token)):
    try:
        group_id = await put_in_news_pages(async_session_factory, creds.group_id, creds.title)

        if group_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.delete("/delete-news-page/{item_id}")
async def delete_news_page(item_id: int, _: bool = Depends(verify_token)):
    try:
        result = await delete_from_news_pages(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-news-page")
async def update_news_page(creds:  schemas.NewsPage, _: bool = Depends(verify_token)):
    try:
        result = await update_from_news_pages(async_session_factory, creds.id, creds.group_id, creds.title)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

#news previews
@app.post("/create-news-preview")
async def create_news_preview(creds:  schemas.NewsPreviewCreate, _: bool = Depends(verify_token)):
    try:
        group_id = await put_in_news_previews(async_session_factory, creds.group_id, creds.title, creds.image_src, creds.api_adress, creds.order_id, creds.page_id, creds.blog_page_id, creds.date, creds.description)

        if group_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.delete("/delete-news-preview/{item_id}")
async def delete_news_preview(item_id: int, _: bool = Depends(verify_token)):
    try:
        result = await delete_from_news_previews(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-news-preview")
async def update_news_preview(creds:  schemas.NewsPreview, _: bool = Depends(verify_token)):
    try:
        result = await update_from_news_previews(async_session_factory, creds.id, creds.group_id, creds.title, creds.image_src, creds.api_adress, creds.order_id, creds.date, creds.description)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-news-preview-desc")
async def update_news_preview_desc(creds:  schemas.NewsDesc, _: bool = Depends(verify_token)):
    try:
        result = await update_from_news_desc(async_session_factory, creds.id, creds.desc)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

#regular pages
@app.post("/create-regular-page")
async def create_regular_page(creds:  schemas.RegularPageCreate, _: bool = Depends(verify_token)):
    try:
        group_id = await put_in_regular_pages(async_session_factory, creds.group_id, creds.title)

        if group_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.delete("/delete-regular-page/{item_id}")
async def delete_regular_page(item_id: int, _: bool = Depends(verify_token)):
    try:
        result = await delete_from_regular_pages(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-regular-page")
async def update_regular_preview(creds:  schemas.RegularPage, _: bool = Depends(verify_token)):
    try:
        result = await update_from_regular_pages(async_session_factory, creds.id, creds.group_id, creds.title)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#blog pages
@app.post("/create-blog-page")
async def create_blog_page(creds:  schemas.BlogPageCreate, _: bool = Depends(verify_token)):
    try:
        group_id = await put_in_blog_pages(async_session_factory, creds.group_id, creds.title, creds.image_src)

        if group_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.delete("/delete-blog-page/{item_id}")
async def delete_blog_page(item_id: int, _: bool = Depends(verify_token)):
    try:
        result = await delete_from_blog_pages(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-blog-delta")
async def update_blog_delta(creds:  schemas.Delta, _: bool = Depends(verify_token)):
    try:
        result = await update_from_blog_delta(async_session_factory, creds.id, creds.delta)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.post("/update-blog-page")
async def update_blog_page(creds:  schemas.BlogPageNoGroup, _: bool = Depends(verify_token)):
    try:
        result = await update_from_blog_pages(async_session_factory, creds.id, creds.title, creds.image_src)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#main pages
@app.post("/create-main-page")
async def create_main_page(creds:  schemas.MainPageCreate, _: bool = Depends(verify_token)):
    try:
        group_id = await put_in_main_pages(async_session_factory, creds.group_id, creds.title, creds.image_src)

        if group_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.delete("/delete-main-page/{item_id}")
async def delete_main_page(item_id: int, _: bool = Depends(verify_token)):
    try:
        result = await delete_from_main_pages(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-main-page")
async def update_main_page(creds:  schemas.MainPage, _: bool = Depends(verify_token)):
    try:
        result = await update_from_main_pages(async_session_factory, creds.id, creds.group_id, creds.title, creds.image_src)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

#get - получение данных с сервера

#header
@app.get("/get-header")
async def get_header():
    try: 
        result = await get_from_header(async_session_factory)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-regular-page-image")
async def update_regular_preview_image(creds:  schemas.RegularImage, _: bool = Depends(verify_token)):
    try:
        result = await update_from_regular_pages_image_src(async_session_factory, creds.id, creds.image_src)
        if result is False:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

#footer
@app.get("/get-footer")
async def get_footer():
    try: 
        result = await get_from_footer(async_session_factory)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#advertisements
@app.get("/ad-groups")
async def ad_groups():
    try:
        result = await get_from_advertisement_groups(async_session_factory)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/get-advertisements")
async def get_advertisements(creds:  schemas.GroupName):
    try:
        result = await get_from_advertisements(async_session_factory, creds.name)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#categories
@app.get("/category-groups")
async def category_groups():
    try:
        result = await get_from_category_groups(async_session_factory)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.get("/catering-groups")
async def catering_groups():
    try:
        result = await get_from_catering_groups(async_session_factory)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/get-catering")
async def get_catering(creds:  schemas.GroupName):
    try:
        result = await get_from_catering(async_session_factory, creds.name)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    

    
@app.post("/get-categories")
async def get_categories(creds:  schemas.GroupName):
    try:
        result = await get_from_categories(async_session_factory, creds.name)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#tasks
@app.get("/task-groups")
async def task_groups():
    try:
        result = await get_from_task_groups(async_session_factory)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/get-tasks")
async def get_tasks(creds:  schemas.GroupName):
    try:
        result = await get_from_tasks(async_session_factory, creds.name)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#search tags
@app.post("/get-certain-search-tags")
async def get_certain_search_tags(creds:  schemas.GroupName):
    try:
        result = await get_from_search_tags(async_session_factory, creds.name)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.get("/get-all-search-tags")
async def get_all_search_tags():
    try:
        result = await get_all_from_search_tags(async_session_factory)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.get("/get-all-search-tags-names")
async def get_all_search_tags():
    try:
        result = await get_all_from_search_tags_names(async_session_factory)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#tags
@app.post("/get-tags")
async def get_tags(creds:  schemas.GroupName):
    try:
        result = await get_from_tags(async_session_factory, creds.name)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.get("/get-all-tags")
async def get_all_tags():
    try:
        result = await get_all_from_tags(async_session_factory)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.get("/get-all-tags-names")
async def get_all_tags_names():
    try:
        result = await get_all_from_tags_names(async_session_factory)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#products
@app.get("/get-product-groups")
async def get_product_groups():
    try:
        result = await get_from_product_grid_groups(async_session_factory)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/get-products")
async def get_products(creds:  schemas.GroupNameProduct):
    try:
        result = await get_from_products(async_session_factory, creds.name, creds.offset)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/get-products-with-ids-all")
async def get_products_with_ids_all(creds:  schemas.IdsList):
    try:
        result = await get_products_by_ids_all(async_session_factory, creds.ids)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/get-products-with-ids-order")
async def get_products_with_ids(creds:  schemas.IdsList):
    try:
        result = await get_products_by_ids(async_session_factory, creds.ids, True)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/get-products-with-ids")
async def get_products_with_ids(creds:  schemas.IdsList):
    try:
        result = await get_products_by_ids(async_session_factory, creds.ids)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
  
@app.post("/get-blogs-with-ids")
async def get_blogs_with_ids(creds:  schemas.IdsList):
    try:
        result = await get_from_news_previews_ids(async_session_factory, creds.ids)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/get-product-images")
async def get_product_images(creds:  schemas.GroupName):
    try:
        result = await get_products_images(async_session_factory, creds.name)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#regular reviews    
@app.get("/get-regular-reviews-groups")
async def get_regular_reviews_groups():
    try:
        result = await get_from_regular_reviews_groups(async_session_factory)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/get-regular-reviews")
async def get_regular_reviews(creds:  schemas.GroupName):
    try:
        result = await get_from_regular_reviews(async_session_factory, creds.name)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#yandex reviews
@app.get("/get-yandex-reviews")
async def get_yandex_reviews():
    try:
        result = await get_from_yandex_reviews(async_session_factory)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#simmilar products
@app.get("/get-simmilar-products-tags")
async def get_simmilar_products_tags():
    try:
        result = await get_from_simmilar_products_groups(async_session_factory)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.get("/get-simmilar-products-names")
async def get_simmilar_products_names():
    try:
        result = await get_from_simmilar_products_names(async_session_factory)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/get-simmilar-products-name")
async def get_simmilar_products_name(creds:  schemas.GroupName):
    try:
        result = await get_from_simmilar_products_name(async_session_factory, creds.name)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#vista
@app.get("/get-vista")
async def get_vista():
    try:
        result = await get_from_vista(async_session_factory)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.get("/get-vista-names")
async def get_vista():
    try:
        result = await get_from_vista_names(async_session_factory)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/get-vista-with-name")
async def get_vista(creds:  schemas.GroupName):
    try:
        result = await get_from_vista_with_name(async_session_factory, creds.name)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

#redactors    
@app.get("/get-all-redactors")
async def get_all_redactors():
    try:
        result = await get_all_from_redactors(async_session_factory)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/get-redactor")
async def get_redactors(creds:  schemas.GroupName):
    try:
        result = await get_from_redactor(async_session_factory, creds.name)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

#страницы
@app.get("/get-pages")
async def get_pages():
    try:
        result = await get_from_pages(async_session_factory)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.get("/get-shop-page-groups")
async def get_shop_page_groups():
    try:
        result = await get_shop_pages_groups(async_session_factory)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#компоненты страниц
@app.post("/get-pages-components")
async def get_pages_components(creds:  schemas.GroupName):
    try:
        result = await get_from_pages_components(async_session_factory, creds.name)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#страницы магазины - гриды 
@app.post("/get-shop-pages")
async def get_shop_pages(creds:  schemas.GroupName):
    try:
        result = await get_from_shops_pages(async_session_factory, creds.name)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#фильтры
@app.post("/get-shop-filters")
async def get_from_shop_filters(creds:  schemas.GroupName):
    try:
        result = await get_shop_filters(async_session_factory, creds.name)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#product pages
@app.post("/get-product-page")
async def get_product_page(creds:  schemas.GroupName):
    try:
        result = await get_from_products_pages(async_session_factory, creds.name)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#product pages description 
@app.post("/get-product-page-description")
async def get_product_page_description(creds:  schemas.GroupName):
    try:
        result = await get_from_products_pages_description(async_session_factory, creds.name)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#news pages
@app.post("/get-news-page")
async def get_news_page(creds:  schemas.GroupName):
    try:
        result = await get_from_news_pages(async_session_factory, creds.name)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#news previews
@app.post("/get-news-preview")
async def get_news_preview(creds:  schemas.GroupName):
    try:
        result = await get_from_news_previews(async_session_factory, creds.name)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#regular pages
@app.post("/get-regular-page")
async def get_regular_page(creds:  schemas.GroupName):
    try:
        result = await get_from_regular_pages(async_session_factory, creds.name)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#blog page
@app.post("/get-blog-page")
async def get_blog_page(creds:  schemas.GroupName):
    try:
        result = await get_from_blog_pages(async_session_factory, creds.name)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#main page
@app.post("/get-main-page")
async def get_main_page(creds:  schemas.GroupName):
    try:
        result = await get_from_main_pages(async_session_factory, creds.name)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.get("/load-main-page-swiper")
async def load_main_page_swiper():
    try:
        result = await get_from_main_swiper(async_session_factory)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/create-main-page-image")
async def create_main_page_image(creds:  schemas.MainSwiperCreate, _: bool = Depends(verify_token)):
    try:
        result = await create_in_main_swiper(async_session_factory, creds.image_src)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        print(e)
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.post("/update-main-page-image")
async def update_main_page_image(creds:  schemas.MainSwiper, _: bool = Depends(verify_token)):
    try:
        result = await update_in_main_swiper(async_session_factory, creds.id, creds.image_src)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        print(e)
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.delete("/delete-in-main-swiper/{item_id}")
async def delete_in_main_swiper(item_id: int, _: bool = Depends(verify_token)):
    try:
        result = await delete_from_main_swiper(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        print(e)
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
#load page
@app.post("/load-page")
async def load_from_page(creds:  schemas.PageAdress):
    try:
        result = await load_page(async_session_factory, creds.adress)

        if result:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
                status_code=404,
                content={"success": False, "error": "database is empty"}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}  # текст ошибки клиенту
        )

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )
    
@app.post("/load-shop-page")
async def load_from_page(creds:  schemas.ShopPageAdress):
    try:
        result = await load_page(async_session_factory, creds.adress, creds.productAdress)

        if result:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
                status_code=404,
                content={"success": False, "error": "database is empty"}
            )

    except IntegrityError as e:
        print(e)
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )

    except Exception as e:
        print(e)
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )
    
@app.post("/get-presigned-url")
async def get_presigned_url(creds:  schemas.Url):
    try:
        url = await storage_client.create_presigned_url(creds.name, creds.type) 

        if url is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
            )
        else:
            return JSONResponse(
            status_code=200,
            content={"success": True, "url": url}
            )
        
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/send-request")
async def send_request(creds:  schemas.TelegramRequset, request: Request):
    forwarded = request.headers.get("x-forwarded-for")

    if forwarded:
        ip = forwarded.split(",")[0]
    else:
        ip = request.client.host

    if not add_ip_count(ip):
           return JSONResponse(
            status_code=402,
            content={"success": False, "error": "forbiden to enter for 5 minutes!"}
            )
    
    try:
        email_to = os.getenv("EMAIL_ADMIN")
        
        SMTP_HOST = os.getenv("SMTP_HOST_MAIL")
        SMTP_USER = os.getenv("SMTP_USER_MAIL")
        SMTP_PASSWORD = os.getenv("SMTP_PASSWORD_MAIL")
        SMTP_PORT = int(os.getenv("SMTP_PORT"))

        # Формируем письмо
        html_content = f"""
            <div style="font-family:Arial,sans-serif;background:#f4f6f8;padding:30px;">
            <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;
                box-shadow:0 4px 20px rgba(0,0,0,0.08);overflow:hidden;">

                <!-- Header -->
                <div style="background:linear-gradient(135deg,#4CAF50,#2E7D32);padding:20px;color:white;">
                    <h2 style="margin:0;">Новая заявка</h2>
                    <p style="margin:5px 0 0;font-size:14px;opacity:0.9;">Детали заказа услуги</p>
                </div>

                <!-- Content -->
                <div style="padding:25px;">
      
                    <table style="width:100%;border-collapse:collapse;">
                        <tr>
                            <td style="padding:10px 0;color:#888;">Услуга</td>
                            <td style="padding:10px 0;text-align:right;font-weight:bold;">{creds.product_name}</td>
                        </tr>
                        <tr>
                            <td style="padding:10px 0;color:#888;">Имя</td>
                            <td style="padding:10px 0;text-align:right;">{creds.user_name}</td>
                        </tr>
                        <tr>
                            <td style="padding:10px 0;color:#888;">Телефон</td>
                            <td style="padding:10px 0;text-align:right;">{creds.phone}</td>
                        </tr>
                    </table>

                    <!-- Divider -->
                    <div style="height:1px;background:#eee;margin:20px 0;"></div>

                    <!-- CTA -->
                    <div style="text-align:center;">
                        <a href="tel:{creds.phone}" 
                            style="display:inline-block;padding:12px 24px;background:#4CAF50;
                            color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">
                                Позвонить клиенту
                        </a>
                    </div>

                </div>

                <!-- Footer -->
                <div style="background:#fafafa;padding:15px;text-align:center;font-size:12px;color:#999;">
                    Это письмо сгенерировано автоматически
                </div>

            </div>
        </div>
        """

        message = EmailMessage()
        message["From"] = f"{SMTP_USER}"
        message["To"] = email_to
        message["Subject"] = "Получение заявки email"
        message.set_content("Новая заявка.")
        message.add_alternative(html_content, subtype="html")

        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
            start_tls=True
        )
        
        await sendMessage(creds.user_name, creds.phone, creds.product_name)
        result = True

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to send the message (ppb wrong user id)"}
            )
        
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/send-simple-request")
async def send_simple_request(creds:  schemas.SimpleTelegramRequset, request: Request):
    forwarded = request.headers.get("x-forwarded-for")

    if forwarded:
        ip = forwarded.split(",")[0]
    else:
        ip = request.client.host

    if not add_ip_count(ip):
           return JSONResponse(
            status_code=402,
            content={"success": False, "error": "forbiden to enter for 5 minutes!"}
            )
    
    try:
        email_to = os.getenv("EMAIL_ADMIN")
        
        SMTP_HOST = os.getenv("SMTP_HOST_MAIL")
        SMTP_USER = os.getenv("SMTP_USER_MAIL")
        SMTP_PASSWORD = os.getenv("SMTP_PASSWORD_MAIL")
        SMTP_PORT = int(os.getenv("SMTP_PORT"))

        html_content = f"""
            <div style="font-family:Arial,sans-serif;background:#f4f6f8;padding:30px;">
                <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;
                    box-shadow:0 4px 20px rgba(0,0,0,0.08);overflow:hidden;">

                    <!-- Header -->
                    <div style="background:linear-gradient(135deg,#4CAF50,#2E7D32);padding:20px;color:white;">
                        <h2 style="margin:0;">Новая заявка</h2>
                        <p style="margin:5px 0 0;font-size:14px;opacity:0.9;">Контактные данные клиента</p>
                    </div>

                    <!-- Content -->
                    <div style="padding:25px;">
      
                        <table style="width:100%;border-collapse:collapse;">
                            <tr>
                                <td style="padding:10px 0;color:#888;">Имя</td>
                                <td style="padding:10px 0;text-align:right;font-weight:bold;">
                                    {creds.user_name}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:10px 0;color:#888;">Телефон</td>
                                <td style="padding:10px 0;text-align:right;">
                                    {creds.phone}
                                </td>
                            </tr>
                        </table>

                    <!-- Divider -->
                    <div style="height:1px;background:#eee;margin:20px 0;"></div>

                    <!-- CTA -->
                    <div style="text-align:center;">
                        <a href="tel:{creds.phone}" 
                            style="display:inline-block;padding:12px 24px;background:#4CAF50;
                                color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">
                            Позвонить клиенту
                        </a>
                    </div>

                </div>

                <!-- Footer -->
                <div style="background:#fafafa;padding:15px;text-align:center;font-size:12px;color:#999;">
                    Это письмо сгенерировано автоматически
                </div>

            </div>
        </div>
        """

        message = EmailMessage()
        message["From"] = f"{SMTP_USER}"
        message["To"] = email_to
        message["Subject"] = "Получение заявки email"
        message.set_content("Новая заявка.")
        message.add_alternative(html_content, subtype="html")

        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
            start_tls=True
        )
        
        await sendSimpleMessage(creds.user_name, creds.phone)
        result = True

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to send the message (ppb wrong user id)"}
            )
        
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )


# @app.get("/{full_path:path}")
# async def spa_fallback(full_path: str, request: Request):
#     SPA_PATH = "/srv/app/dist/index.html"

#     # 1️ Восстанавливаем путь
#     path = "/" + full_path

#     # 2 Убираем множественные слеши
#     path = re.sub(r"/+", "/", path)

#     # 3 Приводим к lowercase
#     path = path.lower()

#     # 4 Убираем index/main/default
#     path = re.sub(
#         r"/(index|main|default)\.(html?|php)$",
#         "/",
#         path
#     )

#     # 6 Если URL отличается от оригинального → 301 редирект
#     original_path = request.url.path
#     if path != original_path:
#         return RedirectResponse(
#             url=path + (f"?{request.url.query}" if request.url.query else ""),
#             status_code=301
#         )

#     # 7 Проверяем существование страницы
#     valid_routes = await get_from_pages_urls(async_session_factory)
#     valid_routes.append("/privacy-policy")
#     valid_routes.append("/rent-policy")
#     valid_routes.append("/contacts")

#     if path.rstrip("/") in [r.rstrip("/") for r in valid_routes]:
#         return FileResponse(SPA_PATH, status_code=200)
#     elif path == "/":
#         return FileResponse(SPA_PATH, status_code=200)

#     # 8 404
#     return FileResponse(SPA_PATH, status_code=404)


@app.post("/send-request-task")
async def send_request_task(creds:  schemas.RequestTask, request: Request):
    EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)$"

    forwarded = request.headers.get("x-forwarded-for")

    if forwarded:
        ip = forwarded.split(",")[0]
    else:
        ip = request.client.host

    if not add_ip_count(ip):
           return JSONResponse(
            status_code=402,
            content={"success": False, "error": "forbiden to enter for 5 minutes!"}
            )
        
    try:
        domain = re.match(EMAIL_REGEX, creds.email)
        if not domain:
            return JSONResponse(
                status_code=422,
                content={"success": False, "error": "incorrect email"}
            )

        email_to = os.getenv("EMAIL_ADMIN")
        
        SMTP_HOST = os.getenv("SMTP_HOST_MAIL")
        SMTP_USER = os.getenv("SMTP_USER_MAIL")
        SMTP_PASSWORD = os.getenv("SMTP_PASSWORD_MAIL")
        SMTP_PORT = int(os.getenv("SMTP_PORT"))

        html_content = f"""
            <div style="font-family:Arial,sans-serif;background:#f4f6f8;padding:30px;">
                <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;
                    box-shadow:0 4px 20px rgba(0,0,0,0.08);overflow:hidden;">

                    <!-- Header -->
                    <div style="background:linear-gradient(135deg,#4CAF50,#2E7D32);padding:20px;color:white;">
                        <h2 style="margin:0;">Обратная связь</h2>
                        <p style="margin:5px 0 0;font-size:14px;opacity:0.9;">Контактные данные клиента</p>
                    </div>

                    <!-- Content -->
                    <div style="padding:25px;">
      
                        <table style="width:100%;border-collapse:collapse;">
                            <tr>
                                <td style="padding:10px 0;color:#888;">Имя</td>
                                <td style="padding:10px 0;text-align:right;font-weight:bold;">
                                    {creds.name}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:10px 0;color:#888;">Телефон</td>
                                <td style="padding:10px 0;text-align:right;">
                                    {creds.phone}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:10px 0;color:#888;">Почта</td>
                                <td style="padding:10px 0;text-align:right;">
                                    {creds.email}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:10px 0;color:#888;">Текст вопроса</td>
                                <td style="padding:10px 0;text-align:right;">
                                    {creds.text}
                                </td>
                            </tr>
                        </table>

                    <!-- Divider -->
                    <div style="height:1px;background:#eee;margin:20px 0;"></div>

                    <!-- CTA -->
                    <div style="text-align:center;">
                        <a href="tel:{creds.phone}" 
                            style="display:inline-block;padding:12px 24px;background:#4CAF50;
                                color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">
                            Позвонить клиенту
                        </a>
                    </div>

                </div>

                <!-- Footer -->
                <div style="background:#fafafa;padding:15px;text-align:center;font-size:12px;color:#999;">
                    Это письмо сгенерировано автоматически
                </div>

            </div>
        </div>
        """

        message = EmailMessage()
        message["From"] = f"{SMTP_USER}"
        message["To"] = email_to
        message["Subject"] = "Получение заявки email"
        message.set_content("Новая заявка.")
        message.add_alternative(html_content, subtype="html")

        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
            start_tls=True
        )

        await sendTaskRequest(creds.name, creds.phone, creds.email, creds.text)
        result = True

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to send the message (ppb wrong user id)"}
            )
        
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/create-leaflet")
async def create_leaflet(creds:  schemas.CreateLeaflet, _: bool = Depends(verify_token)):
    try:
        group_id = await put_in_maps(async_session_factory, creds.name, creds.desc, creds.button_info, creds.ref, creds.image_src)

        if group_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/update-leaflet")
async def create_leaflet(creds:  schemas.UpdateLeaflet, _: bool = Depends(verify_token)):
    try:
        result = await update_in_maps(async_session_factory, creds.id, creds.desc, creds.button_info, creds.ref, creds.image_src)

        if result:
            return JSONResponse(
            status_code=200,
            content={"success": True, "content": result}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "database is empty"}
        )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.delete("/delete-leaflet/{item_id}")
async def delete_leaflet(item_id: int, _: bool = Depends(verify_token)):
    try:
        result = await delete_from_maps(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.post("/create-piers")
async def create_piers(creds:  schemas.CreatePiers, _: bool = Depends(verify_token)):
    try:
        group_id = await put_in_piers(async_session_factory, creds.lat, creds.lng, creds.map_id)

        if group_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.delete("/delete-in-piers/{item_id}")
async def delete_in_piers(item_id: int, _: bool = Depends(verify_token)):
    try:
        result = await delete_from_piers(async_session_factory, item_id)

        if result is True:
            return JSONResponse(
                status_code=200,
                content={"success": True}
            )
        else:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
            )
    
    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.post("/create-main-swiper-mobile")
async def create_main_swiper_mobile(creds:  schemas.ImageSrc, _: bool = Depends(verify_token)):
    try:
        group_id = await put_in_main_swiper_mobile(async_session_factory, creds.image_src)

        if group_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.post("/create-image-in-shop-page-desktop")
async def create_image_in_shop_page_desktop(creds:  schemas.RegularImage, _: bool = Depends(verify_token)):
    try:
        group_id = await put_image_in_shop_page_desktop(async_session_factory, creds.id, creds.image_src)

        if group_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
@app.post("/create-image-in-shop-page-mobile")
async def create_image_in_shop_page_mobile(creds:  schemas.RegularImage, _: bool = Depends(verify_token)):
    try:
        group_id = await put_image_in_shop_page_mobile(async_session_factory, creds.id, creds.image_src)

        if group_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": group_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.post("/create-menu-fur")
async def create_menu_fur(creds:  schemas.CreateMenu):
    try:
        menu_id = await put_in_menu_calculator(async_session_factory, creds.options, creds.name, creds.price, creds.image)

        if menu_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": menu_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.post("/create-menu")
async def create_menu(creds:  schemas.CreateMenu):
    try:
        menu_id = await put_in_menu_calculator(async_session_factory, creds.options, creds.name, creds.price, creds.image)

        if menu_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": menu_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.post("/create-calculator")
async def create_clculator(creds:  schemas.GroupName):
    try:
        calc_id = await put_in_calculators(async_session_factory, creds.name)

        if calc_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": calc_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.post("/create-calculator-season")
async def create_calculator_season(creds:  schemas.Season):
    print(creds)
    try:
        season_id = await put_in_calculators_seasons(async_session_factory, creds.from_date, creds.to_date, creds.type, creds.component_id)

        if season_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": season_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.post("/create-week")
async def create_week(creds:  schemas.Week):
    try:
        print(creds)
        week_id = await put_in_weeks(async_session_factory, creds.mn, creds.ts, creds.ws, creds.tu, creds.fr, creds.sn, creds.st, creds.from_time, creds.to_time, creds.hours, creds.season_id)

        if week_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": week_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )

@app.post("/create-calc-stuff")
async def create_calc_stuff(creds:  schemas.CalcStuff):
    try:
        week_id = await put_in_calc_stuff(async_session_factory, creds.cleaning, creds.catering, creds.furshet, creds.dj, creds.wedding, creds.guide, creds.flowers, creds.ballons, creds.component_id)

        if week_id is None:
            return JSONResponse(
            status_code=404,
            content={"success": False, "error": "failed to find a data"}
        )
        else:
            return JSONResponse(
                status_code=200,
                content={"success": True, "content": {"id": week_id}}
            )

    except IntegrityError as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "internal server error"}
        )
    
if __name__ == "__main__":
   create_tables()
   import uvicorn
   uvicorn.run("main:app", host="0.0.0.0", port=8000)