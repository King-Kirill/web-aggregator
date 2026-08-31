import React, { useEffect, useState, useRef, useContext } from 'react';
import {Autoplay, Navigation, Pagination, Thumbs } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import "./RegularReviews.css"

export default function RegularReviews({regularReviews, onDelete=null, onUpdate=null, group_id=0}){
    const location = useLocation();
    const [width, setWidth] = useState(window.innerWidth);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdmin = () => {
      const adminPort = "5174";

      setIsAdmin(window.location.port === adminPort);
    };

      checkAdmin();

    window.addEventListener("resize", checkAdmin);

    return () => {
      window.removeEventListener("resize", checkAdmin);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);


    return(
        <div className="regular-reviews-container">
            <span className="regular-reviews-container-container">Отзывы</span>
            {regularReviews.length > 0 ? (
                <Swiper
          grabCursor={true} 
          spaceBetween={30}
          slidesPerView={3}
          breakpoints={{
          0: {
           slidesPerView: 1
             },
          1250: {
            slidesPerView: 3
              },
            }}
          centeredSlides={false}
          loop={true}
          pagination={{ clickable: true }}
          modules={[Autoplay, Pagination]}
          className="regular-reviews-slider"
        >
          {regularReviews.map((item, id) => (
            <SwiperSlide key={id} className="regular-reviews-slide">
              <div className="regular-reviews-review-item">
                {isAdmin &&(
                        <button className="regular-reviews-container-on-delete" onClick={() => {
                      if (window.confirm("Вы уверены, что хотите безвозвратно удалить элемент?")) {
                      onDelete(item.id);
                      }
                      }}>
                                              <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                                              width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
                                              preserveAspectRatio="xMidYMid meet">
                
                                              <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)">
                                              <path d="M1974 4646 c-62 -27 -64 -38 -64 -278 l0 -218 45 0 45 0 2 208 3 207
                                              555 0 555 0 3 -207 2 -208 45 0 45 0 0 210 c0 237 -5 261 -65 286 -49 20
                                              -1124 20 -1171 0z"/>
                                              <path d="M1000 3865 l0 -175 1560 0 1560 0 0 175 0 175 -1560 0 -1560 0 0
                                              -175z"/>
                                              <path d="M1192 2113 l3 -1478 22 -40 c25 -47 64 -85 113 -111 34 -18 83 -19
                                              1230 -19 l1195 0 41 22 c53 28 107 91 122 142 9 28 12 420 12 1500 l0 1461
                                              -1370 0 -1370 0 2 -1477z m1406 945 c17 -17 17 -2049 0 -2066 -15 -15 -61 -15
                                              -76 0 -17 17 -17 2049 0 2066 7 7 24 12 38 12 14 0 31 -5 38 -12z m-720 -124
                                              l22 -15 0 -893 c0 -680 -3 -895 -12 -904 -15 -15 -61 -15 -76 0 -9 9 -12 224
                                              -12 904 l0 893 22 15 c12 9 25 16 28 16 3 0 16 -7 28 -16z m1420 0 l22 -15 0
                                              -893 c0 -680 -3 -895 -12 -904 -15 -15 -61 -15 -76 0 -9 9 -12 224 -12 904 l0
                                              893 22 15 c12 9 25 16 28 16 3 0 16 -7 28 -16z"/>
                                              </g>
                                            </svg>
                      </button>
                      )}
                {isAdmin && (
                        <button className="regular-reviews-container-on-change" onClick={() => onUpdate(group_id, item)}>
                                            <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                                            width="32.000000pt" height="32.000000pt" viewBox="0 0 32.000000 32.000000"
                                            preserveAspectRatio="xMidYMid meet">
                
                                            <g transform="translate(0.000000,32.000000) scale(0.100000,-0.100000)"
                                            fill="#000000" stroke="none">
                                            <path d="M148 233 c-63 -66 -76 -85 -82 -122 -4 -24 -5 -46 -2 -48 3 -3 24 -2
                                            48 2 36 6 56 20 120 83 43 42 78 80 78 85 0 5 -15 24 -34 43 -19 19 -38 34
                                            -43 34 -5 0 -43 -35 -85 -77z m132 -7 c-14 -14 -65 37 -55 54 5 8 16 3 36 -16
                                            20 -19 26 -31 19 -38z m-50 -1 l24 -25 -49 -50 -49 -50 -28 27 -28 27 47 48
                                            c26 26 50 48 53 48 4 0 17 -11 30 -25z m-119 -139 c-26 -11 -35 -4 -26 24 7
                                            21 7 21 27 3 19 -17 19 -18 -1 -27z"/>
                                            <path d="M0 20 c0 -6 60 -10 160 -10 100 0 160 4 160 10 0 6 -60 10 -160 10
                                            -100 0 -160 -4 -160 -10z"/>
                                            </g>
                                          </svg>
                        </button>
                      )}
                <div className="regular-reviews-review-item-header">
                  <div className="regular-reviews-review-item-header-tab">
                    <div className="regular-reviews-review-item-header-tab-inner">
                      <div className="regular-reviews-content">
                        <span>{item.user_name}</span>
                        <div className="regular-reviews-star-rating">
                          {Array.from({ length: item.rating }, (_, i) => (
                            <i key={i} className="regular-reviews-star-full">★</i>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="regular-reviews-review-text">
                  <p>{item.text}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
            ) : (
                <span className="regular-no-reviews-span">отзывов пока нет</span>
            )}
        </div>
    );
}