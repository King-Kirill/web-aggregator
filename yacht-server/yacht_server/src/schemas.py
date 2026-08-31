from datetime import datetime
from typing import Optional, Dict, List
import json
from datetime import date as dt_date, time as dt_time

from pydantic import BaseModel, ConfigDict, Field, EmailStr, validator

# === advertisement ===
class AdvertisementGroup(BaseModel):
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)

class AdvertisementGroupCreate(BaseModel):
    name: str


class Advertisement(BaseModel):
    id: int
    group_id: int
    delta: Optional[Dict]
    button_info: Optional[str]
    ref_button_info: Optional[str]
    ref: Optional[str]
    image_src: Optional[str]
    order_id: Optional[int]
    model_config = ConfigDict(from_attributes=True)

class AdvertisementCreate(BaseModel):
    group_id: int
    delta: Optional[Dict]
    button_info: Optional[str]
    ref_button_info: Optional[str]
    ref: Optional[str]
    image_src: Optional[str]
    order_id: Optional[int]


# === catering ===
class CateringGroup(BaseModel):
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)

class CateringGroupCreate(BaseModel):
    name: str

class Catering(BaseModel):
    id: int
    group_id: int
    title: Optional[str]
    text: Optional[str]
    image_src: Optional[str]
    pdf_ref: Optional[str]
    order_id: Optional[int]
    model_config = ConfigDict(from_attributes=True)

class CateringCreate(BaseModel):
    group_id: int
    title: Optional[str]
    text: Optional[str]
    image_src: Optional[str]
    pdf_ref: Optional[str]
    order_id: Optional[int]


# === categories ===
class CategoryGroup(BaseModel):
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)

class CategoryGroupCreate(BaseModel):
    name: str


class Category(BaseModel):
    id: int
    group_id: int
    name: str
    image_src: Optional[str]
    api_adress: Optional[str]
    order_id: Optional[int]
    amount: Optional[int]
    model_config = ConfigDict(from_attributes=True)

class CategoryCreate(BaseModel):
    group_id: int
    name: str
    image_src: Optional[str]
    api_adress: Optional[str]
    order_id: Optional[int]
    amount: Optional[int]


# === popular tasks ===
class PopularTaskGroup(BaseModel):
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)

class PopularTaskGroupCreate(BaseModel):
    name: str


class PopularTask(BaseModel):
    id: int
    group_id: int
    name: str
    text: Optional[str]
    order_id: Optional[int]
    model_config = ConfigDict(from_attributes=True)

class PopularTaskCreate(BaseModel):
    group_id: int
    name: str
    text: Optional[str]
    order_id: Optional[int]


# === product grid ===
class ProductGridGroup(BaseModel):
    id: int
    name: str
    cols_amount: Optional[int]
    max_price: Optional[float]
    min_price: Optional[float]
    model_config = ConfigDict(from_attributes=True)

class ProductGridGroupCreate(BaseModel):
    name: str
    cols_amount: Optional[int]
    max_price: Optional[float]
    min_price: Optional[float]


class Product(BaseModel):
    id: int
    group_id: int
    name: str
    description: Optional[str]
    api_adress: Optional[str]
    price: Optional[float]
    capacity: Optional[int]
    toilet: Optional[str]
    rating: Optional[int]
    discount: Optional[float]
    tags_list: List[int] = Field(default_factory=list)
    to_search_tags_list: List[int] = Field(default_factory=list)
    order_id: Optional[int]
    date: Optional[dt_date] = None
    model_config = ConfigDict(from_attributes=True)

class ProductCreate(BaseModel):
    group_id: int
    name: str
    description: Optional[str]
    api_adress: Optional[str]
    price: Optional[float]
    capacity: Optional[int]
    toilet: Optional[str]
    rating: Optional[int]
    discount: Optional[float]
    tags_list: List[int] = Field(default_factory=list)
    to_search_tags_list: List[int] = Field(default_factory=list)
    order_id: Optional[int]
    page_id: int
    reviews_id: int
    product_page_id: int
    date: Optional[dt_date] = None


class GroupNameProduct(BaseModel):
    name: str
    offset: int

class Tag(BaseModel):
    id: int
    name: str
    image_src: str
    model_config = ConfigDict(from_attributes=True)

class TagCreate(BaseModel):
    name: str
    image_src: str

class NewCreate(BaseModel):
    name: str
    image_src: str

class ManyToManyTag(BaseModel):
    id: int
    product_id: int
    tag_id: int
    model_config = ConfigDict(from_attributes=True)

class ManyToManyTagCreate(BaseModel):
    product_id: int
    tag_id: int


class SearchTag(BaseModel):
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)

class SearchTagCreate(BaseModel):
    name: str


class ManyToManySearchTag(BaseModel):
    id: int
    product_id: int
    tag_id: int
    model_config = ConfigDict(from_attributes=True)

class ManyToManySearchTagCreate(BaseModel):
    product_id: int
    tag_id: int


class ProductImage(BaseModel):
    id: int
    group_id: int
    image_src: Optional[str]
    order_id: Optional[int]
    model_config = ConfigDict(from_attributes=True)

class ProductImageCreate(BaseModel):
    group_id: int
    image_src: Optional[str]
    order_id: Optional[int]


# === footer ===
class Footer(BaseModel):
    id: int
    order_id: Optional[int]
    name: str
    api_adress: Optional[str]
    model_config = ConfigDict(from_attributes=True)

class FooterCreate(BaseModel):
    order_id: Optional[int]
    name: str
    api_adress: Optional[str]


# === header ===
class Header(BaseModel):
    id: int
    order_id: Optional[int]
    name: str
    api_adress: Optional[str]
    model_config = ConfigDict(from_attributes=True)

class HeaderCreate(BaseModel):
    order_id: Optional[int]
    name: str
    api_adress: Optional[str]


# === regular reviews ===
class RegularReviewGroup(BaseModel):
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)

class RegularReviewGroupCreate(BaseModel):
    name: str


class RegularReview(BaseModel):
    id: int
    group_id: int
    text: Optional[str]
    rating: Optional[int]
    order_id: Optional[int]
    user_name: Optional[str]
    model_config = ConfigDict(from_attributes=True)

class RegularReviewCreate(BaseModel):
    ip_adress: Optional[str]
    group_id: int
    text: Optional[str]
    rating: Optional[int]
    order_id: Optional[int]
    user_name: Optional[str]
    email: str


# === yandex reviews ===
class YandexReview(BaseModel):
    id: int
    text: Optional[str]
    rating: Optional[int]
    user_name: Optional[str]
    order_id: Optional[int]
    user_icon: Optional[str]
    ref: Optional[str]
    model_config = ConfigDict(from_attributes=True)

class YandexReviewCreate(BaseModel):
    text: Optional[str]
    rating: Optional[int]
    user_name: Optional[str]
    order_id: Optional[int]
    user_icon: Optional[str]
    ref: Optional[str]


# === simmilar products ===
class SimmilarProduct(BaseModel):
    id: int
    name: str
    search_str: Optional[str]
    model_config = ConfigDict(from_attributes=True)

class SimmilarProductCreate(BaseModel):
    name: str
    search_str: Optional[str]


# === vista ===
class Vista(BaseModel):
    id: int
    vista_src: Optional[str]
    name: str
    model_config = ConfigDict(from_attributes=True)

class VistaCreate(BaseModel):
    vista_src: Optional[str]
    name: str

# === redactor ===
class Redactor(BaseModel):
    id: int
    delta: Optional[Dict]
    name: str
    model_config = ConfigDict(from_attributes=True)

class RedactorPolicy(BaseModel):
    name: str
    delta: Optional[Dict]

class RedactorCreate(BaseModel):
    delta: Optional[Dict]
    name: str

# === pages ===
class Page(BaseModel):
    id: int
    name: str
    template_type: str
    api_adress: Optional[str]
    model_config = ConfigDict(from_attributes=True)

class PageCreate(BaseModel):
    name: str
    template_type: str
    api_adress: Optional[str]

class Meta(BaseModel):
    id: int
    title: Optional[str]
    description: Optional[str]
    robots: Optional[str]
    script: Optional[str]

class PageComponent(BaseModel):
    id: int
    name: str
    group_name: str
    group_id: int
    order_id: Optional[int]
    model_config = ConfigDict(from_attributes=True)

class PageComponentCreate(BaseModel):
    name: str
    group_id: int
    group_name: str
    order_id: Optional[int]


class PageComponentCreateSpace(BaseModel):
    name: str
    group_id: int
    space_id: int
    group_name: str
    order_id: Optional[int]

# === shops pages ===
class ShopPage(BaseModel):
    id: int
    page_id: int
    products_id: int
    page_title: Optional[str]
    model_config = ConfigDict(from_attributes=True)

class ShopPageCreate(BaseModel):
    page_id: int
    products_id: int
    page_title: Optional[str]


class ShopPageFilter(BaseModel):
    id: int
    group_id: int
    name: str
    order_id: Optional[int]
    model_config = ConfigDict(from_attributes=True)

class ShopPageFilterCreate(BaseModel):
    group_id: int
    name: str
    order_id: Optional[int]


class ShopPageFilterItem(BaseModel):
    id: int
    group_id: int
    name: str
    order_id: Optional[int]
    model_config = ConfigDict(from_attributes=True)

class ShopPageFilterItemCreate(BaseModel):
    group_id: int
    name: str
    order_id: Optional[int]


# === products pages ===
class ProductPage(BaseModel):
    id: int
    group_id: int
    title: Optional[str]
    model_config = ConfigDict(from_attributes=True)

class UpdateVideo(BaseModel):
    id: int
    video: str

class ProductPageCreate(BaseModel):
    group_id: int
    title: Optional[str]
    reviews_id: Optional[int]


class ProductPageDescription(BaseModel):
    id: int
    group_id: int
    name: str
    description: str
    order_id: Optional[int]
    model_config = ConfigDict(from_attributes=True)

class ProductPageDescriptionCreate(BaseModel):
    group_id: int
    name: str
    description: str
    order_id: Optional[int]


# === news pages ===
class NewsPage(BaseModel):
    id: int
    group_id: int
    title: Optional[str]
    model_config = ConfigDict(from_attributes=True)

class NewsPageCreate(BaseModel):
    group_id: int
    title: Optional[str]


class NewsPreview(BaseModel):
    id: int
    group_id: int
    title: Optional[str]
    image_src: Optional[str]
    description: Optional[str]
    api_adress: Optional[str]
    order_id: Optional[int]
    date: Optional[dt_date] = None
    model_config = ConfigDict(from_attributes=True)

class NewsPreviewCreate(BaseModel):
    group_id: int
    title: Optional[str]
    image_src: Optional[str]
    description: Optional[str]
    api_adress: Optional[str]
    order_id: Optional[int]
    page_id: Optional[int]
    blog_page_id: Optional[int]
    date: Optional[dt_date] = None


# === regular pages ===
class RegularPage(BaseModel):
    id: int
    group_id: int
    title: Optional[str]
    model_config = ConfigDict(from_attributes=True)

class RegularPageCreate(BaseModel):
    group_id: int
    title: Optional[str]

# === blog pages ===
class BlogPage(BaseModel):
    id: int
    group_id: int
    title: Optional[str]
    image_src: Optional[str]
    model_config = ConfigDict(from_attributes=True)

class Delta(BaseModel):
    id: int
    delta: Optional[dict]

class BlogPageNoGroup(BaseModel):
    id: int
    title: Optional[str]
    image_src: Optional[str]
    model_config = ConfigDict(from_attributes=True)

class BlogPageCreate(BaseModel):
    group_id: int
    title: Optional[str]
    image_src: Optional[str]

class NewsDesc(BaseModel):
    id: int
    desc: Optional[str]

class UpdateOrder(BaseModel):
    id: int
    order_id: int
    old_order_id: int
    model_config = ConfigDict(from_attributes=True)

class RegularImage(BaseModel):
    id: int
    image_src: Optional[str]

class ImageSrc(BaseModel):
    image_src: Optional[str]

# === main pages ===
class MainPage(BaseModel):
    id: int
    group_id: int
    title: Optional[str]
    image_src: Optional[str]
    model_config = ConfigDict(from_attributes=True)

class MainPageCreate(BaseModel):
    group_id: int
    title: Optional[str]
    image_src: Optional[str]

class ItemID(BaseModel):
    id: int

class GroupName(BaseModel):
    name: str

class PageAdress(BaseModel):
    adress: str

class ShopPageAdress(BaseModel):
    adress: str
    productAdress: str

class Admin(BaseModel):
    password: str
    name: str

class TelegramRequset(BaseModel):
    user_name: str
    phone: str
    product_name: str = "пустая заявка"

class SimpleTelegramRequset(BaseModel):
    user_name: str
    phone: str

class GroupNameUpd(BaseModel):
    id: int 
    name: str

class Search(BaseModel):
    search_str: str

class Url(BaseModel):
    name: str 
    type: str

class SearchProductsByFilter(BaseModel):
    toilet_tags: List[str] = Field(default_factory=list)
    capacity_tags: List[int] = Field(default_factory=list)
    other_tags: List[str] = Field(default_factory=list)
    max_price: Optional[float]
    min_price: Optional[float]
    group_id: Optional[int]

class SearchProductsByFilterIds(BaseModel):
    toilet_tags: List[str] = Field(default_factory=list)
    capacity_tags: List[int] = Field(default_factory=list)
    other_tags: List[str] = Field(default_factory=list)
    max_price: Optional[float]
    min_price: Optional[float]
    ids: List[int]

class IdsList(BaseModel):
    ids: List[int]

class SpaceCreate(BaseModel):
    space: int

class Space(BaseModel):
    id: int
    space: int

class MainSwiper(BaseModel):
    id: int
    image_src: str

class MainSwiperCreate(BaseModel):
    image_src: str

class RequestTask(BaseModel):
    name: str
    email: str
    phone: str
    text: str

class CreatePiers(BaseModel):
    lat: float
    lng: float
    map_id: int

class CreateLeaflet(BaseModel):
    name: str
    desc: str
    button_info: str
    ref: str
    image_src: str

class UpdateLeaflet(BaseModel):
    id: int
    desc: str
    button_info: str
    ref: str
    image_src: str

class MenuOption(BaseModel):
    name: str
    price: float

class CreateMenu(BaseModel):
    options: List[MenuOption] = []
    name: str
    price: Optional[float]
    image: Optional[str]

class Season(BaseModel):
    from_date: str
    to_date: str
    type: str
    component_id: int

class Week(BaseModel):
    mn: float
    ts: float
    ws: float
    tu: float
    fr: float
    sn: float
    st: float
    from_time: str
    to_time: str
    hours: int
    season_id: int

class CalcStuff(BaseModel):
    cleaning: float
    catering: List[int]
    furshet: List[int]
    dj: float
    wedding: float
    guide: float
    flowers: float
    ballons: float
    component_id: int