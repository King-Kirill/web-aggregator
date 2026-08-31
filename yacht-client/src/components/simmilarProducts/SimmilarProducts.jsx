import React, { useEffect, useState, useRef, useContext } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { BASE_URL } from '../../config';
import { useNavigate, Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {Autoplay, Pagination } from 'swiper/modules';
import CallRequest from '../callRequest/CallRequest.jsx';
import "./SimmilarProducts.css"

export default function SimmilarProducts({onDeleteFromPage=null, onUpdated=null, search_str="", compId=0, item=null}){
    const [simmilarProducts, setSimmilarProducts] = useState([]);
    const navigate = useNavigate();
    const swiperRef = useRef(null);
    const [selectedItem, setSelectedItem] = useState("");
    const [visibleRequest, setVisibleRequest] = useState(false);
    
    const checkPath = (path) => {
      if (/^https?:\/\//i.test(path)) {
        return false;
      } 
      else if (path.startsWith("/")) {
        return true;
      }
    };
    
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

    const [currentImages, setCurrentImages] = useState({});

    useEffect(() => {
        const fetchMain = async () => {
        try {
          const res = await fetch(`${BASE_URL}/search-product`,
            {
                method: "POST",
                headers: {
                "Content-Type": "application/json"
                },
                body: JSON.stringify({
                search_str: search_str
                })
            }
          );
    
          if (res.status === 200) {
            const data = await res.json();
            setSimmilarProducts(data.content.products)
          }
    
        } catch (err) {
        }
      };
    
      fetchMain();
      }, [search_str]);
    
    function StarsRating({ rating = 0 }) {
    const totalStars = 5;
    const stars = Array.from({ length: totalStars }, (_, i) => i + 1);

    return (
    <div className="rating-container" style={{ display: "flex" }}>
          {stars.map((star) => (
            <svg
              key={star}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="40"
              height="40"
              strokeWidth="2"
              strokeLinejoin="round"
              style={{
              fill: star <= rating ? "#cb9500" : "transparent",
              stroke: star <= rating ? "#cb9500" : "#808080"
              }}
            >
              <path d="M12 2.5l3.09 6.26 6.91.99-5 4.87 
                       1.18 6.88L12 18.77l-6.18 3.23 
                       1.18-6.88-5-4.87 6.91-.99L12 2.5z"
                       />
            </svg>
          ))}
        </div>
    );
    }

    return(
        <div className="SimmilarProducts-container">
          {isAdmin &&(
                  <button className="SimmilarProducts-container-on-delete-from-page" onClick={() => onDeleteFromPage(compId)}>
                   <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                      width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
                      preserveAspectRatio="xMidYMid meet">
          
                      <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)">
                      <path d="M2371 5110 c-798 -66 -1500 -476 -1935 -1130 -289 -433 -429 -897
                      -429 -1420 0 -690 259 -1317 748 -1805 487 -488 1115 -748 1805 -748 597 0
                      1139 191 1610 567 208 166 447 444 593 690 326 551 431 1221 291 1856 -211
                      956 -979 1723 -1934 1934 -233 51 -534 74 -749 56z m929 -942 c107 -54 129
                      -188 45 -273 -19 -18 -52 -39 -72 -44 -52 -15 -1374 -15 -1426 0 -20 5 -53 26
                      -72 44 -84 85 -62 219 45 273 l44 22 696 0 696 0 44 -22z m501 -597 c25 -25
                      29 -37 29 -83 -1 -142 -159 -2476 -170 -2499 -6 -14 -24 -33 -40 -42 -26 -16
                      -115 -17 -1060 -17 -945 0 -1034 1 -1060 17 -16 9 -34 28 -40 42 -11 23 -169
                      2357 -170 2499 0 46 4 58 29 83 l29 29 1212 0 1212 0 29 -29z"/>
                      <path d="M1854 3166 c-68 -30 -64 29 -64 -901 0 -781 2 -842 18 -861 50 -62
                      150 -55 181 13 8 17 11 279 11 856 0 924 4 864 -66 893 -40 17 -41 17 -80 0z"/>
                      <path d="M2540 3173 c-8 -2 -26 -10 -38 -16 -53 -26 -52 -2 -52 -889 0 -805 1
                      -824 20 -856 36 -59 119 -67 169 -17 l26 25 3 833 c2 596 -1 840 -9 859 -17
                      41 -80 74 -119 61z"/>
                      <path d="M3184 3166 c-68 -30 -64 28 -64 -893 0 -577 3 -839 11 -856 31 -68
                      131 -75 181 -13 16 19 18 80 18 861 0 933 4 872 -66 901 -40 17 -41 17 -80 0z"/>
                     </g>
                    </svg>
                  </button>
                )}

            {isAdmin && (
                    <button className="SimmilarProducts-on-update-btn" onClick={() => onUpdated(item)}> 
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
          {simmilarProducts.length > 0 ? (
            <Swiper
                      grabCursor={true} 
                      centeredSlides={false}
                      loop={true}
                      breakpoints={{
                      0: {
                      spaceBetween: 10,
                      slidesPerView: 2,
                      },
                      900: {
                      spaceBetween: 15,
                      slidesPerView: 4,
                      },
                      600: {
                      spaceBetween: 15,
                      slidesPerView: 3,
                      },
                      }}
                      autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                      }}
                      onSwiper={(swiper) => {
                      swiperRef.current = swiper;
                      }}
                      pagination={{clickable: true}}
                      modules={[Autoplay, Pagination]}
                      className="SimmilarProducts-reviews-slider"
                    >
                      {simmilarProducts.map((item) => (
                        <SwiperSlide key={item.id} className="SimmilarProducts-reviews-slide">
                          <div className="item-4 simmilar">
                            <div className={`item-image-container-4`}>
                                              {checkPath(item.api_adress) ? (
                                                <Link className="item-ref-btn simmilar" to={item.api_adress}>
                                                  <img loading="lazy" src={item.images?.[currentImages[item.id] || 0]?.src || "/placeholder.png"} alt={item.name}/>
                                                </Link>
                                              ) : (
                                                <a href={item.api_adress} target="_blank" rel="noopener noreferrer">
                                                  <img loading="lazy" src={item.images?.[currentImages[item.id] || 0]?.src || "/placeholder.png"} alt={item.name}/>
                                                </a>
                                              )}
                                              <div className="itemHoover">
                                              {item.discount > 0 && <span className="discount">скидка</span>}
                                              {/* <button className={`orderBtn-small-4`} onClick={() => {setSelectedItem(item.name); setVisibleRequest(true);}}>заказать</button> */}
                                              </div>
                                            </div>
                                            <div className={`item-content-4 simmilar`}>
                                              <span className="item-title simmilar">{item.name}</span>
                                              {/* <button className={`orderBtn-big-4`} onClick={() => {setSelectedItem(item.name); setVisibleRequest(true);}}>заказать</button> */}
                                            </div>
                          </div>
                        </SwiperSlide>
                      ))}
                      <button className="SimmilarProducts-right-arrow" onClick={() => swiperRef.current?.slideNext()}>
                        →
                      </button>
                      <button className="SimmilarProducts-left-arrow" onClick={() => swiperRef.current?.slidePrev()}>
                        ←
                      </button>
                    </Swiper>
          ) : (<span className="failed-to-find-simmilar-products">не удалось найти продукты по вашему запросу</span>)}
           <CallRequest product_name={selectedItem} visible={visibleRequest} setVisible={setVisibleRequest}/>
        </div>
    );
}