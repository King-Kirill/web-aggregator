import datetime
import enum

from sqlalchemy import Numeric
from sqlalchemy.dialects.mysql import BIGINT

from database import str_256
from database import Base
from datetime import datetime, timedelta

from sqlalchemy import (
    TIMESTAMP,
    CheckConstraint,
    Column,
    Enum,
    ForeignKey,
    Index,
    Integer,
    MetaData,
    DateTime,
    String,
    Table,
    ARRAY,
    Text,
    text,
    Date, 
    func,
    UniqueConstraint,
    Float,
    Time,
    Boolean,
    JSON
)

# Определяем общую структуру и мета-объект
# ссылка на центральный объект в схеме бд
# сылка на хранилище всех таблиц (схема)
metadata_obj = Base.metadata

def default_expires():
    return datetime.utcnow() + timedelta(minutes=10)

#таблицы компонента advertisement
advertisement_groups_table = Table(
    "advertisement_groups",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("name", str_256, nullable=False, unique=True)
)

advertisements_table = Table(
    "advertisements",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("group_id", Integer, ForeignKey("advertisement_groups.id", ondelete="CASCADE")),
    Column("delta", JSON),
    Column("button_info", str_256),
    Column("ref_button_info", str_256),
    Column("ref", str_256),
    Column("image_src", str_256),
    Column("order_id", Integer)
)

#таблицы компонента catering
catering_groups_table = Table(
    "catering_groups",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("name", str_256, nullable=False, unique=True)
)

catering_table = Table(
    "catering",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("group_id", Integer, ForeignKey("catering_groups.id", ondelete="CASCADE")),
    Column("title", str_256),
    Column("text", Text),
    Column("image_src", str_256),
    Column("pdf_ref", str_256),
    Column("order_id", Integer)
)

#таблицы компонента category
category_groups_table = Table(
    "category_groups",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("name", str_256, nullable=False, unique=True)
)

categories_table = Table(
    "categories",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("group_id", Integer, ForeignKey("category_groups.id", ondelete="CASCADE")),
    Column("name", str_256, nullable=False, unique=True),
    Column("image_src", str_256),
    Column("api_adress", str_256),
    Column("order_id", Integer),
    Column("amount", Integer)
)

#таблицы компонента popular tasks
popular_task_groups_table = Table(
    "popular_task_groups",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("name", str_256, nullable=False, unique=True)
)

popular_tasks_table = Table(
    "popular_tasks",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("group_id", Integer, ForeignKey("popular_task_groups.id", ondelete="CASCADE")),
    Column("name", str_256, nullable=False, unique=True),
    Column("text", Text),
    Column("order_id", Integer),
)

#таблицы компонента products_grid
product_grid_groups_table = Table(
    "product_grid_groups",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("name", str_256, nullable=False, unique=True),
    Column("cols_amount", Integer),
    Column("max_price", Numeric),
    Column("min_price", Numeric)
)

products_table = Table(
    "products",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("group_id", Integer, ForeignKey("product_grid_groups.id", ondelete="CASCADE")),
    Column("name", str_256, nullable=False, unique=True),
    Column("description", str_256),
    Column("toilet", str_256),
    Column("popularity", Integer),
    Column("api_adress", str_256),
    Column("rating", Integer, CheckConstraint('rating BETWEEN 0 AND 5')),
    Column("capacity", Integer),
    Column("price", Numeric),
    Column("discount", Numeric),
    Column("order_id", Integer),
    Column("page_id", Integer),
    Column("reviews_id", Integer),
    Column("product_page_id", Integer),
    Column("date", Date, server_default=func.current_date())
)

tags_table = Table(
    "tags",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("name", str_256, nullable=False, unique=True),
    Column("image_src", str_256)
)

many_to_many_tags_table = Table(
    "many_to_many_tags",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("product_id", Integer, ForeignKey("products.id", ondelete="CASCADE")),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE")),
    UniqueConstraint('product_id', 'tag_id', name='uq_product_tag')
)

search_tags_table = Table(
    "search_tags",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("name", str_256, nullable=False, unique=True)
)

many_to_many_search_tags_table = Table(
    "many_to_many_search_tags",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("product_id", Integer, ForeignKey("products.id", ondelete="CASCADE")),
    Column("tag_id", Integer, ForeignKey("search_tags.id", ondelete="CASCADE")),
    UniqueConstraint('product_id', 'tag_id', name='uq_search_tag')
)

products_images_table = Table(
    "products_images",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("group_id", Integer, ForeignKey("products.id", ondelete="CASCADE")),
    Column("image_src", str_256),
    Column("order_id", Integer)
)

#таблицы компонента footer
footer_table = Table(
    "footer",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("order_id", Integer),
    Column("name", str_256, nullable=False, unique=True),
    Column("api_adress", str_256),
)

#таблицы компонента header
header_table = Table(
    "header",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("order_id", Integer),
    Column("group_id", Integer),
    Column("name", str_256, nullable=False),
    Column("api_adress", str_256),
)

#таблицы компонента regular reviews
regular_reviews_groups_table = Table(
    "regular_reviews_groups",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("name", str_256, nullable=False, unique=True)
)

regular_reviews_table = Table(
    "regular_reviews",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("group_id", Integer, ForeignKey("regular_reviews_groups.id", ondelete="CASCADE")),
    Column("rating", Integer, CheckConstraint('rating BETWEEN 0 AND 5')),
    Column("text", Text),
    Column("order_id", Integer),
    Column("user_name", str_256),
    Column("email", str_256)
)

regular_reviews_temp_table = Table(
    "regular_reviews_temp",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("ip_adress", str_256),
    Column("group_id", Integer, ForeignKey("regular_reviews_groups.id", ondelete="CASCADE")),
    Column("rating", Integer, CheckConstraint('rating BETWEEN 0 AND 5')),
    Column("text", Text),
    Column("order_id", Integer),
    Column("user_name", str_256),
    Column("email", str_256),
    Column("token", str_256),
    Column("expires_at", DateTime, default=default_expires)
)

#таблицы компонента yandex reviews
yandex_reviews_table = Table(
    "yandex_reviews",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("text", Text),
    Column("rating", Integer, CheckConstraint('rating BETWEEN 0 AND 5')),
    Column("user_name", str_256),
    Column("order_id", Integer, unique=True),
    Column("user_icon", str_256),
    Column("ref", str_256)
)

#таблицы компонента simmilarProducts
simmilar_products_table = Table(
    "simmilar_products_groups",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("name", str_256, nullable=False, unique=True),
    Column("search_str", str_256),
)

#таблицы компонента vista
vista_table = Table(
    "vista",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("name", str_256, nullable=False, unique=True),
    Column("vista_src", str_256)
)

#таблицы компонента redactor 
redactor_table = Table(
    "redactors",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("name", str_256, nullable=False, unique=True),
    Column("delta", JSON)
)
 
#таблица страниц сайта
pages_table = Table( 
    "pages",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("name", str_256, nullable=False, unique=True),
    Column("template_type", str_256, nullable=False),
    Column("api_adress", str_256),
    Column("title", Text),
    Column("description", Text),
    Column("robots", Text),
    Column("script", Text)
)

pages_components_table = Table(
    "pages_components",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("name", str_256, nullable=False), #имя таблицы НЕ ГРУППЫ
    Column("group_name", str_256, nullable=False), # имя группы к которой привязана таблица
    Column("group_id", Integer, ForeignKey("pages.id", ondelete="CASCADE")),
    Column("order_id", Integer),
    Column("space_id", Integer)
)

#таблица страниц shopPage
shops_pages_table = Table(
    "shops_pages",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("page_id", Integer, ForeignKey("pages.id", ondelete="CASCADE")),
    Column("products_id", Integer, ForeignKey("product_grid_groups.id", ondelete="CASCADE")),
    Column("page_title", str_256),
    Column("desc_image_src", str_256, default=""),
    Column("mobile_image_src", str_256, default="")
)

#таблица страниц shopPage_filters
shops_pages_filters_table = Table(
    "shops_pages_filters",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("group_id", Integer, ForeignKey("pages.id", ondelete="CASCADE")),
    Column("name", str_256, nullable=False),
    Column("order_id", Integer)
)

shops_pages_filters_items_table = Table(
    "shops_pages_filters_items",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("group_id", Integer, ForeignKey("shops_pages_filters.id", ondelete="CASCADE")),
    Column("name", str_256, nullable=False),
    Column("order_id", Integer)
)

#таблица страниц productPage
products_pages_table = Table(
    "products_pages",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("group_id", Integer, ForeignKey("pages.id", ondelete="CASCADE")),
    Column("title", str_256),
    Column("reviews_id", Integer),
    Column("video", str_256)
)

#таблица страниц описаний product pages
products_pages_description_table = Table(
    "products_pages_description",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("group_id", Integer, ForeignKey("pages.id", ondelete="CASCADE")),
    Column("name", str_256, nullable=False),
    Column("description", str_256, nullable=False),
    Column("order_id", Integer)
)

#таблица страниц news shop page
news_pages_table = Table(
    "news_pages",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("group_id", Integer, ForeignKey("pages.id", ondelete="CASCADE")),
    Column("title", str_256)
)

#таблица страниц news preview
news_previews_table = Table(
    "news_previews",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("group_id", Integer, ForeignKey("pages.id", ondelete="CASCADE")),
    Column("title", str_256),
    Column("image_src", str_256),
    Column("description", str_256),
    Column("api_adress", str_256),
    Column("order_id", Integer),
    Column("page_id", Integer),
    Column("blog_page_id", Integer),
    Column("date", Date, server_default=func.current_date())
)

#таблица страниц regular pages
regular_pages_table = Table(
    "regular_pages",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("group_id", Integer, ForeignKey("pages.id", ondelete="CASCADE")),
    Column("title", str_256),
    Column("image_src", str_256, server_default=text("''"))
)

#таблица страниц blog pages
blog_pages_table = Table(
    "blog_pages",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("group_id", Integer, ForeignKey("pages.id", ondelete="CASCADE")),
    Column("title", str_256),
    Column("image_src", str_256),
    Column("delta", JSON)
)

#таблица страниц main pages
main_pages_table = Table(
    "main_pages",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("group_id", Integer, ForeignKey("pages.id", ondelete="CASCADE")),
    Column("title", str_256),
    Column("image_src", str_256)
)

spaces_table = Table(
    "spaces",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("space", Integer)
)

#таблица изображений главного свайпера
main_swiper = Table(
    "main_swiper",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("image_src", str_256),
    Column("is_mobile", Boolean, default=False)
)

# таблица карт причалов
maps_table = Table(
    "maps",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("name", str_256, unique=True),
    Column("desc", str_256),
    Column("button_info", str_256),
    Column("ref", str_256),
    Column("image_src", str_256)
)


# таблица пирсов
piers_table = Table(
    "piers",
    metadata_obj,
    Column("id", Integer, primary_key=True),     
    Column("group_id", Integer, ForeignKey("maps.id", ondelete="CASCADE")),
    Column("lat", Float, nullable=False),         
    Column("lng", Float, nullable=False)
)

# таблица меню для калькулятора
menu_calcs = Table(
    "menu_calcs",
    metadata_obj,
    Column("id", Integer, primary_key=True),  
    Column("name", str_256),
    Column("image", str_256),
    Column("price", Numeric)
)

# таблица опций меню
menu_options = Table(
    "menu_options",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("name", str_256),
    Column("price", Numeric),
    Column("group_id", Integer, ForeignKey("menu_calcs.id", ondelete="CASCADE"))
)

# таблица калькуляторов
calculators = Table(
    "calculators",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("name", str_256, nullable=False, unique=True)
)

# таблица сезонов
order_seasons = Table(
    "order_seasons",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("from_date", Date),
    Column("to_date", Date),
    Column("type_date", str_256),
    Column("component_id", Integer, ForeignKey("calculators.id", ondelete="CASCADE"))
)

# таблица дней недели
week_days = Table(
    "week_days",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("mn", Numeric),
    Column("ts", Numeric),
    Column("ws", Numeric),
    Column("tu", Numeric),
    Column("fr", Numeric),
    Column("sn", Numeric),
    Column("st", Numeric),
    Column("from_time", Time),
    Column("to_time", Time),
    Column("hours", Integer),
    Column("season_id", Integer, ForeignKey("order_seasons.id", ondelete="CASCADE"))
)

# таблица прочих плюшек калькулятора
calc_stuff = Table(
    "calc_stuff",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("cleaning", Numeric),
    Column("catering", ARRAY(Integer)),
    Column("furshet", ARRAY(Integer)),
    Column("dj", Numeric),
    Column("wedding", Numeric),
    Column("guide", Numeric),
    Column("flowers", Numeric),
    Column("ballons", Numeric),
    Column("component_id", Integer, ForeignKey("calculators.id", ondelete="CASCADE"))
)

# Таблицы компонента advertisement
advertisement_groups = advertisement_groups_table
advertisements = advertisements_table

# Таблицы компонента category
category_groups = category_groups_table
categories = categories_table

# Таблицы компонента popular tasks
popular_task_groups = popular_task_groups_table
popular_tasks = popular_tasks_table

# Таблицы компонента products_grid
product_grid_groups = product_grid_groups_table
products = products_table
tags = tags_table
many_to_many_tags = many_to_many_tags_table
search_tags = search_tags_table
many_to_many_search_tags = many_to_many_search_tags_table
products_images = products_images_table

# Таблицы компонента footer
footer = footer_table

# Таблицы компонента header
header = header_table

# Таблицы компонента regular reviews
regular_reviews_groups = regular_reviews_groups_table
regular_reviews = regular_reviews_table
regular_reviews_temp = regular_reviews_temp_table

# Таблицы компонента yandex reviews
yandex_reviews = yandex_reviews_table

# Таблицы компонента similar products
simmilar_products_groups = simmilar_products_table

# Таблицы компонента vista
vista = vista_table

# Таблицы компонента redactor
redactors = redactor_table

# Таблицы страниц сайта
pages = pages_table
pages_components = pages_components_table

# Таблицы страниц shopPage
shops_pages = shops_pages_table
shops_pages_filters = shops_pages_filters_table
shops_pages_filters_items = shops_pages_filters_items_table

# Таблицы страниц productPage
products_pages = products_pages_table
products_pages_description = products_pages_description_table

# Таблицы страниц news
news_pages = news_pages_table
news_previews = news_previews_table

# Таблицы страниц regular pages
regular_pages = regular_pages_table

# Таблицы страниц blog pages
blog_pages = blog_pages_table

# Таблицы страниц main pages
main_pages = main_pages_table

#таблица пробелов
spaces = spaces_table

# таблицы кейтеринга
catering_groups = catering_groups_table
catering = catering_table

# таблицы карт
maps = maps_table
piers = piers_table