import { useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import {Zoom, Autoplay, Navigation, Pagination, Thumbs } from 'swiper/modules';
import "swiper/css";
import { div } from "framer-motion/client";
import "./componentTemplate.css"
import "swiper/css/navigation"
import "swiper/css/pagination";

export default function ComponentTemplate({ onSelect, onClose, showTemplates }){
    const swiperRef = useRef(null);

    const templates = [
  {
    template_type: "advertisement",
    name: "Реклама",
    description: "компонент рекламных баннеров",
    image_src: "/images/components_preview/advertisement_component.webp",
  },
  {
    template_type: "catering",
    name: "Кейтеринг",
    description: "компонент блоков кейтеринга",
    image_src: "/images/components_preview/catering.webp",
  },
  {
    template_type: "category",
    name: "Категория",
    description: "компонент категорий представленных на сайте товаров",
    image_src: "/images/components_preview/category_component.webp",
  },
  {
    template_type: "popularTasks",
    name: "Популярные вопросы",
    description: "компонент популярных вопросов и ответов на них",
    image_src: "/images/components_preview/popular_tasks_component.webp",
  },
  {
    template_type: "productsGrid",
    name: "Сетка товаров",
    description: "компонент с сеткой товаров",
    image_src: "/images/components_preview/grid_component.webp",
  },
  {
    template_type: "redactor",
    name: "Редактор текста",
    description: "компонент для вставки/редактирования текста",
    image_src: "/images/components_preview/redactor_component.webp",
  },
  {
    template_type: "regularReviews",
    name: "Отзывы",
    description: "компонент отзывов",
    image_src: "/images/components_preview/reviews_component.webp",
  },
  {
    template_type: "reviewsYa",
    name: "Отзывы Яндекс",
    description: "компонент отзывов яндекса",
    image_src: "/images/components_preview/yandex_reviews_component.webp",
  },
  {
    template_type: "simmilarProducts",
    name: "Похожие товары",
    description: "компонент похожих товаров, соответствующих указанным тегам",
    image_src: "/images/components_preview/simmilar_products_component.webp",
  },
  {
    template_type: "vista",
    name: "3D Vista",
    description: "компонент ресурса 3d vista",
    image_src: "/images/components_preview/vista_component.webp",
  },
  {
    template_type: "leaflet",
    name: "Карта причалов",
    description: "отмечайте причалы на карте!",
    image_src: "/images/components_preview/leaflet.png",
  },
  {
    template_type: "calculator",
    name: "Калькулятор стоимости",
    description: "расчет стоимости аренды",
    image_src: "/images/components_preview/calculator.png",
  },
  {
    template_type: "space",
    name: "Space",
    description: "Задавайте расстояние между компонентами!",
    image_src: "/images/components_preview/space.png",
  }
];

useEffect(() => {
  if (showTemplates) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [showTemplates]);

    const handleSelect = (name) => {
    onSelect(name);
    onClose();
    };

    return (
      <div className={`${showTemplates ? ("overlay-overlay") : ""}`}>
        <div className={`templates-container ${showTemplates ? ("active") : ""}`}>
        <button className="templates-container-close" onClick={onClose}>
            <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
            width="90.000000pt" height="90.000000pt" viewBox="0 0 90.000000 90.000000"
            preserveAspectRatio="xMidYMid meet">

            <g transform="translate(0.000000,90.000000) scale(0.100000,-0.100000)" fill="currentColor">
            <path d="M205 695 c-14 -13 -25 -29 -25 -36 0 -6 44 -56 97 -110 l97 -99 -97
                   -99 c-53 -54 -97 -104 -97 -110 0 -15 46 -61 61 -61 6 0 56 44 110 97 l99 97
                    99 -97 c54 -53 104 -97 110 -97 15 0 61 46 61 61 0 6 -44 56 -97 110 l-97 99
                    97 99 c53 54 97 104 97 110 0 15 -46 61 -61 61 -6 0 -56 -44 -110 -97 l-99
                    -97 -99 97 c-54 53 -104 97 -110 97 -7 0 -23 -11 -36 -25z"/>
                </g>
            </svg>
        </button>
        <div className="swiper-templates-container-main">
            <button className="swiper-templates-container-main-left-btn" onClick={() => {
              swiperRef.current?.slidePrev();}}>
            ←
          </button>
          <Swiper modules={[Pagination]} slidesPerView={1} spaceBetween={10} onSwiper={(swiper) => (swiperRef.current = swiper)}>
          {templates.map((tpl) => (
            <SwiperSlide key={tpl.template_type} className="templates-container-swiper-slider">
              <div className="templates-container-swiper">
                <img
                loading="lazy"
                  src={tpl.image_src}
                  alt={tpl.name}
                  className="templates-container-image"
                />
                <span className="template-name">{tpl.name}</span>
                <span className="template-description">{tpl.description}</span>
                <button
                  className="template-choose-button"
                  onClick={() => onSelect(tpl.template_type)}
                >
                  Выбрать
                </button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
         <button className="swiper-templates-container-main-right-btn" onClick={() => {
          swiperRef.current?.slideNext();}}>
            →
          </button>
        </div>
        </div>
      </div>
    );
}