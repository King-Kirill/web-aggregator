import React, { useEffect, useState, useRef, useContext, useMemo } from 'react';
import { BASE_URL } from '../config';
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import {Zoom, Navigation, Pagination, Thumbs } from 'swiper/modules';
import QuillRedactor from "../components/redactor/QuillRedactor.jsx";
import ParseDelta from "../components/redactor/ParseDelta.jsx";
import { useParams } from "react-router-dom";
import 'react-quill/dist/quill.snow.css';
import MainComponent from "../components/MainComponents/MainComponent.jsx";
import RegularReviews from '../components/regularReviews/RegularReviews.jsx'; 
import ReviewsInput from '../components/regularReviews/ReviewsInput.jsx'; 
import Toast from "../components/adminMessage/adminMessage.jsx";
import { lazy, Suspense } from 'react';
const ModalManager = lazy(() => import('../components/modalManager/ModalManager.jsx'));
import LoadingGifPage from "../components/LoadingGifPage/LoadingGifPage.jsx";
import LoadingGif from "../components/loadingGif/LoadingGif.jsx";
import { useStorageContext } from "../components/StorageContext.jsx";
import CallRequest from '../components/callRequest/CallRequest.jsx';
import { Helmet } from "react-helmet-async";
import MetaBtn from './MetaBtn.jsx';

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import "swiper/css/zoom";
// import "./styles/ProductPage.css";
import AuthForm from "../components/AuthForm/AuthForm.jsx";
import SchemaWebPage, { schemaAbsoluteUrl } from "../components/seo/SchemaWebPage.jsx";

export default function ProductPage({ api_adress, setPages, pages, title, description, robots, ld_json, db_id })
{
  const navigate = useNavigate();
  const { favourites, toggleFavourite } = useStorageContext();
  const [selectedBtn, setSelectedBtn] = useState("left");
  const [showImageContainer, setShowImageContainer] = useState(false);
  const [openLeft, setOpenLeft] = useState(false);
  const [openRight, setOpenRight] = useState(false);
  const [openVista, setOpenVista] = useState(false);
  const [showCurrSlide, setShowCurrSlide] = useState(1);
  const currentSlide = useRef(1);
  const [shareBtnShow, setShareBtnShow] = useState(false);
  const [leftHeight, setLeftHeight] = useState("0px");
  const [rightHeight, setRightHeight] = useState("0px");
  const [vistaHeight, setVistaHeight] = useState("0px");
  const contentLeftRef = useRef(null);
  const contentRightRef = useRef(null);
  const contentVistaRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [pageName, setPageName] = useState("");
  const [pagePrice, setPagePrice] = useState(0);
  const [pageDiscount, setPageDiscount] = useState(0);
  const [pageTags, setPageTags] = useState([]);
  const [pageCapacity, setPageCapacity] = useState(0);
  const [pageDescription, setPageDescription] = useState("");
  const [pageComponents, setPageComponents] = useState([]);
  const [pageReviews, setPageReviews] = useState([]);
  const [pageImages, setPageImages] = useState([]);
  const [pageId, setPageId] = useState(0);
  const [pageVideo, setPageVideo] = useState("");
  const [reviewsGroupId, setReviewsGroupId] = useState(0);
  const [visibleRequset, setVisibleRequest] = useState(false);

  const [templateType, setTemplateType] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [handlerType, setHandlerType] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [statusCode, setStatusCode] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemId, setItemId] = useState(0);
  const [itemGroupId, setItemGroupId] = useState(0);
  const [itemDesc, setItemDesc] = useState("");
  const [productPageId, setProductPageId] = useState(0);
  const [showPause, setShowPause] = useState(true);
  const [itemRating, setItemRating] = useState(0);
  const [itemText, setItemText] = useState("");
  const [productId, setProductId] = useState(0);
  const [isFavourite, setIsFavourite] = useState(false);
  const [firstRender, setFirstRender] = useState(true);
  const [firstInteraction, setFirstInteraction] = useState(true);

  const [visibleAuth, setVisibleAuth] = useState(false);
  const [vistaComp, setVistaComp] = useState([]);
  const [hasParams, setHasParams] = useState(false);

  const location = useLocation();
  const [width, setWidth] = useState(window.innerWidth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);
  const [ldJsonObj, setLdJsonObj] = useState("");
  const [redactorComponent, setRedactorComponent] = useState(null);
  const [redactorId, setRedactorId] = useState(0);
  
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

useEffect(() => {
  if(productId !== 0)
  {
    if(favourites.includes(productId))
    {
      setIsFavourite(true);
    }
    else
    {
      setIsFavourite(false);
    }
  }
}, [api_adress, favourites, productId])

useEffect(() => {
  const fetchMain = async () => {
       setLoadingPage(true);
       try {
         const res = await fetch(`${BASE_URL}/load-page`,
           {
               method: "POST",
               headers: {
               "Content-Type": "application/json"
               },
               body: JSON.stringify({
               adress: api_adress
               })
           }
         );
   
         if (res.status === 200) {
          const data = await res.json();
          console.log(data.content);
          setPageName(data.content.content.product.name);
          setProductId(data.content.content.product.id);
          setPagePrice(data.content.content.product.price);
          setPageVideo(encodeURI(data.content.content.info[0].video));
          setReviewsGroupId(data.content.content.info[0].reviews_id);
          setProductPageId(data.content.content.info[0].id);
          setPageDiscount(data.content.content.product.discount);
          setPageTags(data.content.content.tags);
          setPageId(data.content.obj.id);
          setPageCapacity(data.content.content.product.capacity);
          setPageDescription(data.content.content.product.description);
          setPageReviews(data.content.content.reviews);
          setPageImages(data.content.content.product.images);
          const sortByOrderId = (arr) => arr.sort((a, b) => a.order_id - b.order_id);
          const sortedComponents = sortByOrderId(data.content.components);

          console.log(sortedComponents);

        // ищем индекс первого redactor
        const redactorIndex = sortedComponents.findIndex(
          item => item.name === "redactor"
        );

        let redactorComponent = null;

        if (redactorIndex !== -1) {
          // сохраняем объект
          redactorComponent = sortedComponents[redactorIndex];
          setRedactorComponent(redactorComponent);
          setRedactorId(redactorComponent.order_id);
          // удаляем из массива
          sortedComponents.splice(redactorIndex, 1); 
        }

        console.log("redactor:", redactorComponent);
        console.log("components:", sortedComponents);

          checkComponents(sortedComponents);

          try {
            // Преобразуем строку в объект
            setLdJsonObj(JSON.parse(ld_json));
          } catch (e) {}
          
          if (/\?|%2B|\+/.test(location.search)) {
            setHasParams(true);
          } else {
            setHasParams(false);
          }
         }
  
       } catch (err) {
       }
       finally{
        setLoadingPage(false);
        setTimeout(() => {
          setFirstRender(false);
        }, 2000);
       }
     };

    fetchMain();
  
}, [api_adress])

useEffect(() => {
      const checkReady = () => {
        if(!loadingPage)
        {
          setReady(true);
        }
      };
  
      checkReady();
    }, [loadingPage]);

useEffect(() => {
    const handleResize = () => {;
      setShowPause(window.innerWidth > 1249);
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1249);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 1249);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isDesktop;
}

const isDesktop = useIsDesktop();

useEffect(() => {
  if (openLeft && contentLeftRef.current) {
    setLeftHeight(`${contentLeftRef.current.scrollHeight}px`);
  } else {
    setLeftHeight("0px");
  }
}, [openLeft, loadingPage]);

useEffect(() => {
  if (openRight && contentRightRef.current) {
    setRightHeight(`${contentRightRef.current.scrollHeight}px`);
  } else {
    setRightHeight("0px");
  }
}, [openRight]);

useEffect(() => {
  if (openVista && contentVistaRef.current) {
    setVistaHeight(`${contentVistaRef.current.scrollHeight}px`);
  } else {
    setVistaHeight("0px");
  }
}, [openVista]);

useEffect(() => {
  const handleWheel = (e) => {
    if (showImageContainer && !zoom) {
      setShowImageContainer(false);
    }
  };

  window.addEventListener("wheel", handleWheel);

  return () => {
    window.removeEventListener("wheel", handleWheel);
  };
}, [showImageContainer, zoom]);

const swiperRef = useRef(null);
const handleZoomToggle = () => {
  const swiper = swiperRef.current;
  if (!swiper) return;

  if (zoom) {
    swiper.zoom.out();
    swiper.allowTouchMove = true;
    setZoom(false);
  } else {
    swiper.zoom.in();
    swiper.allowTouchMove = false;
    setZoom(true);
  }
};

const createProductDesc = () => {
  setTemplateType("createProductDesc");
  setHandlerType("addTag");
  setOpenModal(true);
};

const checkComponents = (components) => {
  const index = components.findIndex(c => c.name === "vista");
  if (index !== -1)
  {
    const vista_arr = [
      components[index]
    ]
    setVistaComp(vista_arr);

    const newComponents = components.filter((_, i) => i !== index);
    setPageComponents(newComponents);
  }
  else
  {
    setPageComponents(components);
  }
};

const setProductVideo = () => {
  setTemplateType("setProductVideo");
  setHandlerType("updateVideo");
  setOpenModal(true);
};

const onDeleteVideo = async () => {
  try {
    setLoading(true);
        const res = await fetch(`${BASE_URL}/update-product-video`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                      id: productPageId,
                      video: ""
                    })
                  });
  
        if (res.status === 200) {
          setPageVideo("");
          setStatusCode(res.status);
          setToastMessage("Элемент успешно удален!");
        } else if (res.status === 404) {
          setStatusCode(res.status);
          setToastMessage("Элемент не найден, таблица пуста!");
        } else if (res.status === 500) {
          setStatusCode(res.status);
          setToastMessage("Элемент с таким ключом уже сущетсвует!");
        } else if (res.status === 401) {
            setStatusCode(res.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          } else {
          setStatusCode(res.status);
          setToastMessage("Произошла непредвиденная ошибка!");
        }
      }
      catch (err) {
      }
      finally{
          setLoading(false);
        }
}

const handlers = {
  addTag: ({ newItem }) => {
    setPageTags(prev => [...prev, newItem]);
  },

  updateTag: ({ updatedItem }) => {

  setPageTags(prev =>
    prev.map(item => (item.id === updatedItem.id ? { ...item, ...updatedItem } : item))
    );
  },

  updateReview: ({ group_id, updatedItem }) => {
  setPageComponents(prev =>
    prev.map(component => {
      if (component.group_id === group_id && component.name === "regularReviews") {
        return {
          ...component,
          component_content: component.component_content.map(item =>
            item.id === updatedItem.id
              ? { ...item, ...updatedItem }
              : item
          ),
        };
      }
      return component;
    })
  );

  setPageReviews(prev =>
    prev.map(item => {
      if (item.id === updatedItem.id) {
        return {
          ...item,
          ...updatedItem,
        };
      }
      return item;
    })
  );
},

updateVideo: ({newVideoSrc}) => {
  setPageVideo(newVideoSrc);
}
};

  const mimeMap = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogg: 'video/ogg',
    ogv: 'video/ogg',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    mkv: 'video/x-matroska'
  };

  const ext = pageVideo.split('.').pop().toLowerCase();

  const mimeType = mimeMap[ext] || 'video/mp4';

const isValidMedia = (src) => src && typeof src === "string" && src.trim() !== "" && src !== "null";

function Slider({images, refSlide}) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const swiperRef = useRef(null);
  const videoRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [showPauseBtn, setShowPauseBtn] = useState(true);
  const [showPlayBtn, setShowPlayBtn] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlayMobile = () => {
  if (!videoRef.current) return;

  if (videoRef.current.paused) {
    videoRef.current.play();
    setIsPlaying(true);
    hideBtnAfterDelay();
  } else {
    videoRef.current.pause();
    setIsPlaying(false);
    setShowPlayBtn(true);
  }
};

const hideBtnAfterDelay = () => {
  setShowPlayBtn(true);
  if(!isPlaying)
  {
    setTimeout(() => {
      if(!isPlaying)
    {setShowPlayBtn(false);}
  }, 3000);
  }
};

const handleContainerClick = () => {
  hideBtnAfterDelay();
};

  return (
    <div className="productPage-slider-wrapper">
      {(isDesktop && !isAdmin && !isValidMedia(pageVideo) && pageImages.length > 1) && (
          <div className="productPage-thumbs-swiper-vertical-container">
        <Swiper
        direction="vertical"
        modules={[Thumbs]}
        onSwiper={(swiper) => {
          setThumbsSwiper(swiper);
          swiperRef.current = swiper;
        }}
        watchSlidesProgress
        spaceBetween={7}
        slidesPerView={4}
        slideToClickedSlide={true}
        className="productPage-thumbs-swiper-vertical"
      >
        {images.map((image, id) => (
          <SwiperSlide key={id}>
            <img loading="lazy" src={image.src} alt={`${pageName + " image-"} ${id + 1}`} onError={(e) => {e.target.onerror = null; e.target.src = "/images/fallback.webp";}}/>
          </SwiperSlide>
        ))}
      </Swiper>
       <div className="productPage-swiper-btn-container">
          <button onClick={() => swiperRef.current?.slidePrev()}>↑</button>
          <button onClick={() => swiperRef.current?.slideNext()}>↓</button>
        </div>
      </div>
      )}

      {(isDesktop && !isAdmin && isValidMedia(pageVideo)) && (
          <div className="productPage-thumbs-swiper-vertical-container">
        <Swiper
        direction="vertical"
        modules={[Thumbs]}
        onSwiper={(swiper) => {
          setThumbsSwiper(swiper);
          swiperRef.current = swiper;
        }}
        watchSlidesProgress
        spaceBetween={7}
        slidesPerView={4}
        slideToClickedSlide={true}
        className="productPage-thumbs-swiper-vertical"
      >
        {isValidMedia(pageVideo) && (
          <SwiperSlide>
            <div className="video-wrapper">
              <video playsInline muted>
              <source src={pageVideo} type={mimeType} />
              </video>
              <button className="play-btn-small">
                  <svg className="play_svg" xmlns="http://www.w3.org/2000/svg"
                    width="512pt" height="512pt" viewBox="0 0 512 512"
                    preserveAspectRatio="xMidYMid meet"
                    overflow="visible">

                  <g transform="translate(0,512) scale(0.1,-0.1)"
                  fill="#000000" stroke="#000000" strokeWidth="200">
                  <path d="M490 5111 c-69 -21 -121 -65 -156 -131 -18 -34 -19 -112 -19 -2420
                  l0 -2385 22 -40 c56 -105 184 -160 288 -123 61 22 4065 2336 4103 2372 54 50
                  76 101 76 176 0 75 -22 126 -76 176 -38 36 -4040 2348 -4101 2370 -43 15 -97
                  17 -137 5z m2050 -1470 c1020 -589 1855 -1076 1855 -1081 0 -7 -3612 -2101
                  -3737 -2166 l-28 -15 0 2181 0 2181 28 -15 c15 -8 862 -496 1882 -1085z"/>
                  </g>
                </svg>
              </button>
            </div>
        </SwiperSlide>
        )}
        {images.map((image, id) => (
          <SwiperSlide key={id}>
            <img loading="lazy" src={image.src} alt={`${pageName + " image-"} ${id + 1}`} />
          </SwiperSlide>
        ))}
      </Swiper>
       <div className="productPage-swiper-btn-container">
          <button onClick={() => swiperRef.current?.slidePrev()}>↑</button>
          <button onClick={() => swiperRef.current?.slideNext()}>↓</button>
        </div>
      </div>
      )}

      {(isDesktop && isAdmin) && (
          <div className="productPage-thumbs-swiper-vertical-container">
        <Swiper
        direction="vertical"
        modules={[Thumbs]}
        onSwiper={(swiper) => {
          setThumbsSwiper(swiper);
          swiperRef.current = swiper;
        }}
        watchSlidesProgress
        spaceBetween={7}
        slidesPerView={4}
        slideToClickedSlide={true}
        className="productPage-thumbs-swiper-vertical"
      >
        {isAdmin && !isValidMedia(pageVideo) ? (
          <SwiperSlide>
          <button className="productsGrid-add-btn" onClick={() => setProductVideo()}>
                              <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512.000000 512.000000"
                    preserveAspectRatio="xMidYMid meet">

                    <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)">
                    <path d="M2412 5100 c-109 -29 -187 -74 -272 -160 -87 -86 -131 -163 -160
                    -276 -19 -73 -20 -113 -20 -791 l0 -713 -713 0 c-678 0 -718 -1 -791 -20 -113
                    -29 -190 -73 -276 -160 -87 -86 -131 -163 -160 -276 -25 -98 -25 -190 0 -288
                    29 -113 73 -190 160 -276 86 -87 163 -131 276 -160 73 -19 113 -20 791 -20
                    l713 0 0 -713 c0 -678 1 -718 20 -791 29 -113 73 -190 160 -276 86 -87 163
                    -131 276 -160 98 -25 190 -25 288 0 113 29 190 73 276 160 87 86 131 163 160
                    276 19 73 20 113 20 791 l0 713 713 0 c678 0 718 1 791 20 113 29 190 73 276
                    160 87 86 131 163 160 276 25 98 25 190 0 288 -29 113 -73 190 -160 276 -86
                    87 -163 131 -276 160 -73 19 -113 20 -791 20 l-713 0 0 713 c0 678 -1 718 -20
                    791 -11 43 -34 105 -52 139 -42 81 -164 203 -245 245 -132 69 -291 88 -431 52z
                    m282 -314 c62 -31 109 -80 140 -145 21 -45 21 -59 26 -861 5 -755 6 -817 23
                    -847 38 -71 -9 -67 897 -73 802 -5 816 -5 861 -26 66 -31 114 -78 146 -142 23
                    -47 28 -70 28 -132 -1 -124 -56 -214 -163 -267 l-57 -28 -815 -5 c-906 -6
                    -859 -2 -897 -73 -17 -30 -18 -92 -23 -847 -5 -802 -5 -816 -26 -861 -31 -66
                    -78 -114 -142 -146 -47 -23 -70 -28 -132 -28 -125 0 -222 62 -274 174 -21 45
                    -21 59 -26 861 -6 906 -2 859 -73 897 -30 17 -92 18 -847 23 -802 5 -816 5
                    -861 26 -66 31 -114 78 -146 142 -23 47 -28 70 -28 132 1 124 56 214 163 267
                    l57 28 815 5 c915 6 860 1 900 80 20 38 20 58 20 828 0 863 -1 846 59 929 84
                    116 243 154 375 89z"/>
                  </g>
                </svg>
                            </button>
        </SwiperSlide>
        ): (
          <SwiperSlide>
            <div className="video-wrapper">
              {isAdmin && (
                                          <button className="video-wrapper-on-delete-btn" onClick={() => {
                                          if (window.confirm("Вы уверены, что хотите безвозвратно удалить элемент?")) {onDeleteVideo()}}}>
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
              <video playsInline muted>
              <source src={pageVideo} type={mimeType} />
              </video>
              <button className="play-btn-small">
                  <svg className="play_svg" xmlns="http://www.w3.org/2000/svg"
                    width="512pt" height="512pt" viewBox="0 0 512 512"
                    preserveAspectRatio="xMidYMid meet"
                    overflow="visible">

                  <g transform="translate(0,512) scale(0.1,-0.1)"
                  fill="#000000" stroke="#000000" strokeWidth="200">
                  <path d="M490 5111 c-69 -21 -121 -65 -156 -131 -18 -34 -19 -112 -19 -2420
                  l0 -2385 22 -40 c56 -105 184 -160 288 -123 61 22 4065 2336 4103 2372 54 50
                  76 101 76 176 0 75 -22 126 -76 176 -38 36 -4040 2348 -4101 2370 -43 15 -97
                  17 -137 5z m2050 -1470 c1020 -589 1855 -1076 1855 -1081 0 -7 -3612 -2101
                  -3737 -2166 l-28 -15 0 2181 0 2181 28 -15 c15 -8 862 -496 1882 -1085z"/>
                  </g>
                </svg>
              </button>
            </div>
        </SwiperSlide>
        )}
        {images.map((image, id) => (
          <SwiperSlide key={id}>
            <img loading="lazy" src={image.src} alt={`${pageName + " image-"} ${id + 1}`} onError={(e) => {e.target.onerror = null; e.target.src = "/images/fallback.webp";}}/>
          </SwiperSlide>
        ))}
      </Swiper>
       <div className="productPage-swiper-btn-container">
          <button onClick={() => swiperRef.current?.slidePrev()}>↑</button>
          <button onClick={() => swiperRef.current?.slideNext()}>↓</button>
        </div>
      </div>
      )}
      <div className="productPage-main-swiper-container">
        <Swiper
        modules={[Navigation, Pagination, Thumbs]}
        spaceBetween={10}
        navigation
        initialSlide={refSlide.current - 1}
        onSlideChange={(swiper) => refSlide.current=(swiper.activeIndex + 1)}
        pagination={{ clickable: true }}
        thumbs={{ swiper: thumbsSwiper }}
        
        className="productPage-main-swiper"
      >
        {isValidMedia(pageVideo) && (
          <SwiperSlide>
            <div className="video-wrapper" onClick={handleContainerClick}>
              <video ref={videoRef} playsInline muted={false}>
              <source src={pageVideo} type={mimeType} />
              </video>
              {showPause ? (
                <button className={`play-btn ${isPlaying ? ("playing") : ("")}`} onClick={togglePlay}>
                {isPlaying ? (
                  <svg className="pause_svg" version="1.0" xmlns="http://www.w3.org/2000/svg"
                    width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
                    preserveAspectRatio="xMidYMid meet">

                    <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                    fill="#000000" stroke="none">
                    <path d="M1350 4238 c-143 -55 -240 -167 -270 -313 -7 -34 -9 -493 -8 -1395
                    l3 -1345 23 -58 c47 -114 141 -205 257 -246 59 -21 75 -22 371 -19 l309 3 68
                    33 c86 43 156 113 199 199 l33 68 0 1395 0 1395 -33 68 c-43 86 -113 156 -199
                    199 l-68 33 -315 2 c-300 2 -318 1 -370 -19z m665 -209 c62 -31 102 -86 115
                    -158 14 -73 14 -2549 0 -2622 -13 -72 -53 -127 -115 -158 -49 -26 -50 -26
                    -310 -26 -247 0 -262 1 -300 22 -51 27 -90 68 -109 115 -14 33 -16 187 -16
                    1358 0 1447 -4 1359 58 1423 66 69 101 76 392 74 231 -2 236 -2 285 -28z"/>
                    <path d="M3068 4244 c-76 -23 -167 -92 -215 -162 -79 -115 -74 -4 -71 -1543
                    l3 -1374 33 -68 c42 -85 115 -157 201 -200 l66 -32 308 -3 c291 -3 312 -2 370
                    18 114 38 212 132 259 247 l23 58 0 1380 0 1380 -32 67 c-53 113 -138 190
                    -251 229 -49 17 -85 19 -351 18 -229 0 -307 -4 -343 -15z m648 -211 c53 -28
                    100 -82 113 -130 15 -53 15 -2633 0 -2686 -13 -47 -60 -102 -113 -130 -39 -21
                    -53 -22 -301 -22 -260 0 -261 0 -310 26 -62 32 -102 87 -115 160 -7 37 -10
                    497 -8 1345 l3 1290 26 49 c30 59 86 101 149 114 25 6 151 9 280 8 220 -2 238
                    -4 276 -24z"/>
                    </g>
                </svg>
                ) : (
                <svg className="play_svg" xmlns="http://www.w3.org/2000/svg"
                    width="512pt" height="512pt" viewBox="0 0 512 512"
                    preserveAspectRatio="xMidYMid meet"
                    overflow="visible">

                  <g transform="translate(0,512) scale(0.1,-0.1)"
                  fill="#000000" stroke="#000000" strokeWidth="200">
                  <path d="M490 5111 c-69 -21 -121 -65 -156 -131 -18 -34 -19 -112 -19 -2420
                  l0 -2385 22 -40 c56 -105 184 -160 288 -123 61 22 4065 2336 4103 2372 54 50
                  76 101 76 176 0 75 -22 126 -76 176 -38 36 -4040 2348 -4101 2370 -43 15 -97
                  17 -137 5z m2050 -1470 c1020 -589 1855 -1076 1855 -1081 0 -7 -3612 -2101
                  -3737 -2166 l-28 -15 0 2181 0 2181 28 -15 c15 -8 862 -496 1882 -1085z"/>
                  </g>
                </svg>
                )}
              </button>
              ) : (
                <button className={`play-btn-mobile ${showPlayBtn ? "visible" : "hidden"}`} onClick={togglePlayMobile}>
                {isPlaying ? (
                  <svg className="pause_svg_mobile" version="1.0" xmlns="http://www.w3.org/2000/svg"
                    width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
                    preserveAspectRatio="xMidYMid meet">

                    <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                    fill="#000000" stroke="none">
                    <path d="M1350 4238 c-143 -55 -240 -167 -270 -313 -7 -34 -9 -493 -8 -1395
                    l3 -1345 23 -58 c47 -114 141 -205 257 -246 59 -21 75 -22 371 -19 l309 3 68
                    33 c86 43 156 113 199 199 l33 68 0 1395 0 1395 -33 68 c-43 86 -113 156 -199
                    199 l-68 33 -315 2 c-300 2 -318 1 -370 -19z m665 -209 c62 -31 102 -86 115
                    -158 14 -73 14 -2549 0 -2622 -13 -72 -53 -127 -115 -158 -49 -26 -50 -26
                    -310 -26 -247 0 -262 1 -300 22 -51 27 -90 68 -109 115 -14 33 -16 187 -16
                    1358 0 1447 -4 1359 58 1423 66 69 101 76 392 74 231 -2 236 -2 285 -28z"/>
                    <path d="M3068 4244 c-76 -23 -167 -92 -215 -162 -79 -115 -74 -4 -71 -1543
                    l3 -1374 33 -68 c42 -85 115 -157 201 -200 l66 -32 308 -3 c291 -3 312 -2 370
                    18 114 38 212 132 259 247 l23 58 0 1380 0 1380 -32 67 c-53 113 -138 190
                    -251 229 -49 17 -85 19 -351 18 -229 0 -307 -4 -343 -15z m648 -211 c53 -28
                    100 -82 113 -130 15 -53 15 -2633 0 -2686 -13 -47 -60 -102 -113 -130 -39 -21
                    -53 -22 -301 -22 -260 0 -261 0 -310 26 -62 32 -102 87 -115 160 -7 37 -10
                    497 -8 1345 l3 1290 26 49 c30 59 86 101 149 114 25 6 151 9 280 8 220 -2 238
                    -4 276 -24z"/>
                    </g>
                </svg>
                ) : (
                <svg className="play_svg_mobile" xmlns="http://www.w3.org/2000/svg"
                    width="512pt" height="512pt" viewBox="0 0 512 512"
                    preserveAspectRatio="xMidYMid meet"
                    overflow="visible">

                  <g transform="translate(0,512) scale(0.1,-0.1)"
                  fill="#000000" stroke="#000000" strokeWidth="200">
                  <path d="M490 5111 c-69 -21 -121 -65 -156 -131 -18 -34 -19 -112 -19 -2420
                  l0 -2385 22 -40 c56 -105 184 -160 288 -123 61 22 4065 2336 4103 2372 54 50
                  76 101 76 176 0 75 -22 126 -76 176 -38 36 -4040 2348 -4101 2370 -43 15 -97
                  17 -137 5z m2050 -1470 c1020 -589 1855 -1076 1855 -1081 0 -7 -3612 -2101
                  -3737 -2166 l-28 -15 0 2181 0 2181 28 -15 c15 -8 862 -496 1882 -1085z"/>
                  </g>
                </svg>
                )}
              </button>
              )}
            </div>
          </SwiperSlide>
        )}
        {images.map((image, id) => (
          <SwiperSlide key={id}>
            <div className="swiper-slide-wrapper-main">
              <img className="swiper-wrapper-main-img" loading="lazy" src={image.src} alt={`${pageName + " image-"} ${id + 1}`} onError={(e) => {e.target.onerror = null; e.target.src = "/images/fallback.webp";}}/>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <button className="productPage-swiper-showMore-btn" onClick={() => (setShowImageContainer(true))}>
        <svg className="productPage-swiper-showMore-btn-svg" version="1.0" xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 640.000000 640.000000"
         preserveAspectRatio="xMidYMid meet">
         <g transform="translate(0.000000,640.000000) scale(0.100000,-0.100000)">
         <path stroke="#808080" d="M580 4835 l0 -985 325 0 325 0 0 427 0 428 752 -753 753 -752 -753
         -752 -752 -753 0 423 0 422 -325 0 -325 0 0 -980 0 -980 980 0 980 0 0 325 0
         325 -422 0 -423 0 753 752 752 753 752 -753 753 -752 -428 0 -427 0 0 -325 1
         -325 985 0 984 0 0 986 c0 895 -1 986 -16 980 -9 -3 -157 -6 -330 -6 l-314 0
         3 -420 2 -420 -750 750 -750 750 750 750 750 750 0 -422 0 -423 328 -3 327 -2
         0 985 0 985 -985 0 -985 0 2 -327 3 -328 418 0 c229 0 417 -2 417 -5 0 -3
         -335 -340 -745 -750 l-745 -745 -748 745 c-412 410 -749 747 -750 750 -1 3
          187 4 418 2 l420 -3 0 331 0 330 -980 0 -980 0 0 -985z"/>
         </g>
         </svg>
         <span className="productPage-swiper-showMore-btn-span">Нажмите, чтобы увеличить</span>
      </button>
      {pageDiscount > 0 &&
      <span className="productPage-discount-tab">скидка</span>
      }
      </div>
      {(!isDesktop && pageImages.length > 1) && (
        <div className="productPage-thumbs-swiper-horizontal-container">
        <Swiper
        direction="horizontal"
        breakpoints={{
      0: {     
      spaceBetween: 4,
      slidesPerView: 3,
      },
      800: {    
      spaceBetween: 7,
      slidesPerView: 4,
      },
      }}
        modules={[Thumbs]}
        onSwiper={(swiper) => {
          setThumbsSwiper(swiper);
          swiperRef.current = swiper;
        }}
        watchSlidesProgress
        spaceBetween={7}
        slidesPerView={4}
        className="productPage-thumbs-swiper-vertical"
      >
        {isValidMedia(pageVideo) && (
          <SwiperSlide>
            <div className="video-wrapper">
              <video playsInline muted>
              <source src={pageVideo} type={mimeType} controlsList="nodownload" oncontextmenu="return false;"/>
              </video>
              <button className="play-btn-small">
                  <svg className="play_svg" xmlns="http://www.w3.org/2000/svg"
                    width="512pt" height="512pt" viewBox="0 0 512 512"
                    preserveAspectRatio="xMidYMid meet"
                    overflow="visible">

                  <g transform="translate(0,512) scale(0.1,-0.1)"
                  fill="#000000" stroke="#000000" strokeWidth="200">
                  <path d="M490 5111 c-69 -21 -121 -65 -156 -131 -18 -34 -19 -112 -19 -2420
                  l0 -2385 22 -40 c56 -105 184 -160 288 -123 61 22 4065 2336 4103 2372 54 50
                  76 101 76 176 0 75 -22 126 -76 176 -38 36 -4040 2348 -4101 2370 -43 15 -97
                  17 -137 5z m2050 -1470 c1020 -589 1855 -1076 1855 -1081 0 -7 -3612 -2101
                  -3737 -2166 l-28 -15 0 2181 0 2181 28 -15 c15 -8 862 -496 1882 -1085z"/>
                  </g>
                </svg>
              </button>
            </div>
          </SwiperSlide>
        )}
        {images.map((image, id) => (
          <SwiperSlide key={id}>
            <img loading="lazy" src={image.src} alt={`${pageName + " image-"} ${id + 1}`} />
          </SwiperSlide>
        ))}
      </Swiper>
       <div className="productPage-swiper-btn-container-horizontal">
          <button onClick={() => swiperRef.current?.slidePrev()}></button>
          <button onClick={() => swiperRef.current?.slideNext()}></button>
        </div>
      </div>
      )}
    </div>
  );
}

const updateRedactorInComponentContent = ({ updatedItem }) => {
  setPageComponents(prev =>
    prev.map(comp =>
      comp.name === "redactor"
        ? {
            ...comp,
            component_content: (comp.component_content || []).map(el =>
              el.name === updatedItem.name
                ? { ...el, delta: updatedItem.delta }
                : el
            )
          }
        : comp
    )
  );
};

const deleteItemInReviews = (id) => {
  const prev = [...pageComponents];

  let removedComponentIds = [];
  let removedGroupId = null;

  const updated = prev
    .map(comp => {
      if (comp.name !== "regularReviews") return comp;

      const items = comp.component_content;
      const hasTarget = items.some(el => String(el.id) === String(id));
      if (!hasTarget) return comp;

      const newItems = items.filter(el => String(el.id) !== String(id));

      if (newItems.length === 0) {
        removedComponentIds.push(comp.id);
        removedGroupId = comp.group_id;
        return null;
      }

      return {
        ...comp,
        component_content: {
          ...(comp.component_content || {}),
          items: newItems
        }
      };
    })
    .filter(Boolean);

  setPageComponents(updated);
  setPageReviews(prev =>
  prev.filter(item => item.id !== id)
  );

  return removedComponentIds.length
    ? { componentIds: removedComponentIds, group_id: removedGroupId }
    : null;
};

const onUpdateReview = async (group_id, review) => {
    setItemGroupId(group_id);
    setItemId(review.id);
    setItemName(review.user_name);
    setItemRating(review.rating);
    setItemText(review.text);
    setTemplateType("updateReviewItem");
    setHandlerType("updateReview");
    setOpenModal(true);
  }

const onDeleteReview = async (id) => {
  try {
    setLoading(true);
      const res = await fetch(`${BASE_URL}/delete-regular-review/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      }, credentials: "include",
    });

      if (res.status === 200) {
        const result = deleteItemInReviews(id);

        if(result !== null){
          try {
                const res2 = await fetch(`${BASE_URL}/delete-regular-reviews-group/${result.group_id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
              }, credentials: "include",
              });

            if (res2.status === 404) {
            setStatusCode(res2.status);
            setToastMessage("Отзыв удален успешно! Группу отзывов нельзя удалить на данный момент!");
            } else if (res2.status === 500) {
            setStatusCode(res2.status);
            setToastMessage("Элемент с таким ключом уже сущетсвует!");
            } else if (res2.status === 401) {
            setStatusCode(res2.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          } else {
            setStatusCode(res2.status);
            setToastMessage("Произошла непредвиденная ошибка!");
            }
        }
        catch (err) {
        }

        if (result.componentIds.length > 0) {
          for (const compId of result.componentIds) {
            try {
              const res2 = await fetch(`${BASE_URL}/delete-page-component/${compId}`, {
              method: "DELETE",
              headers: {
                  "Content-Type": "application/json",
              }, credentials: "include",
             });

            if (res2.status === 404) {
            setStatusCode(res2.status);
            setToastMessage("Элемент не найден, таблица пуста!");
            } else if (res2.status === 500) {
            setStatusCode(res2.status);
            setToastMessage("Элемент с таким ключом уже сущетсвует!");
            } else if (res2.status === 401) {
            setStatusCode(res2.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          } else if (res2.status !== 200) {
            setStatusCode(res2.status);
            setToastMessage("Произошла непредвиденная ошибка!");
            }

          } catch (err) {
          }
        }
      }
        }
        
        setStatusCode(res.status);
        setToastMessage("Элемент успешно удален!");
      } else if (res.status === 404) {
        setStatusCode(res.status);
        setToastMessage("Элемент не найден, таблица пуста!");
      } else if (res.status === 500) {
        setStatusCode(res.status);
        setToastMessage("Элемент с таким ключом уже сущетсвует!");
      } else if (res.status === 401) {
            setStatusCode(res.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          }
 else {
        setStatusCode(res.status);
        setToastMessage("Произошла непредвиденная ошибка!");
      }
    }
    catch (err) {
    }
    finally{
          setLoading(false);
        }
}

useEffect(() => {
  console.log("useEffect triggered:");
  console.log("isAdmin:", isAdmin);
  console.log("firstRender:", firstRender);
  console.log("pageComponents:", pageComponents);

  if (isAdmin && !firstRender) {
    if(!firstInteraction)
    {
    const fullUrl = `https://vip-boat.ru${api_adress}`;
    fetch(`https://prerender.vip-boat.ru/recache?url=${encodeURIComponent(fullUrl)}`, {
      method: 'POST'
    })
    .then(res => {
      console.log("Response status:", res.status);
      return res.json().catch(() => {
        console.log("Failed to parse JSON");
        return null;
      });
    })
    .then(data => {
      console.log("Server response JSON:", data);
    })
    .catch(err => {
      console.error("Fetch error:", err);
    });
    }
    else
    {
      setFirstInteraction(false);
    }
  } else {
    console.log("Recache skipped: condition not met");
  }

}, [pageComponents, pageTags]);

function ReviewsConatiner() {
  return(
    <div className="productPage-reviews-container">
      {pageReviews ? (
        <>
        <RegularReviews 
        regularReviews={pageReviews}
        onDelete={onDeleteReview}
        onUpdate={onUpdateReview}
        group_id={reviewsGroupId}
        />
        <ReviewsInput reviewsAmount={pageReviews.length} group_id={reviewsGroupId} setStatusCode={setStatusCode} setToastMessage={setToastMessage}/>
        </>
      ) : (
        <>
        <RegularReviews 
        regularReviews={[]}
        onDelete={onDeleteReview}
        onUpdate={onUpdateReview}
        group_id={reviewsGroupId}
        />
        <ReviewsInput reviewsAmount={0} group_id={reviewsGroupId} setStatusCode={setStatusCode} setToastMessage={setToastMessage}/>
        </>
      )}
    </div>
  );
}

const removeProduct = (id) => {
  let removedItem;
  setPageTags(prev => {
    const updated = prev.filter(item => {
      if (item.id === id) removedItem = item;
      return item.id !== id;
    });
    return updated;
  });
};

useEffect(() => {
      localStorage.setItem('page', 'productPage');
      localStorage.setItem('productAdress', api_adress);
    }, []);

const onDeleteDesc = async (id) => {
  setLoading(true);
  try {
      const res = await fetch(`${BASE_URL}/delete-product-page-description/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      }, credentials: "include",
    });

      if (res.status === 200) {
        removeProduct(id);
        setStatusCode(res.status);
        setToastMessage("Элемент успешно удален!");
      } else if (res.status === 404) {
        setStatusCode(res.status);
        setToastMessage("Элемент не найден, таблица пуста!");
      } else if (res.status === 401) {
            setStatusCode(res.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
      } else if (res.status === 500) {
        setStatusCode(res.status);
        setToastMessage("Элемент с таким ключом уже сущетсвует!");
      } else {
        setStatusCode(res.status);
        setToastMessage("Произошла непредвиденная ошибка!");
      }
    }
    catch (err) {
    }
    finally{
          setLoading(false);
        }
}

const onUpdateDesc = (item) => {
  setItemId(item.id);
  setItemGroupId(item.group_id);
  setItemName(item.name);
  setItemDesc(item.description);
  setTemplateType("updateProductDesc");
  setHandlerType("updateTag");
  setOpenModal(true);
};

const onDeleteRedactor = async (comp_id, redactor_id) => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/delete-redactor/${redactor_id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      }, credentials: "include",
    });

      if (res.status === 200) {

         try {
              const res2 = await fetch(`${BASE_URL}/delete-page-component/${comp_id}`, {
              method: "DELETE",
              headers: {
                  "Content-Type": "application/json",
              }, credentials: "include",
             });

            if (res2.status === 404) {
            setStatusCode(res2.status);
            setToastMessage("Элемент не найден, таблица пуста!");
            } else if (res2.status === 500) {
            setStatusCode(res2.status);
            setToastMessage("Внутренняя ошибка сервера!");
            } else if (res2.status !== 200) {
            setStatusCode(res2.status);
            setToastMessage("Произошла непредвиденная ошибка!");
            }

          } catch (err) {
          }
      
        removeRedactorItemById(redactor_id);
        setStatusCode(res.status);
        setToastMessage("Элемент успешно удален!");
      } else if (res.status === 404) {
        setStatusCode(res.status);
        setToastMessage("Элемент не найден, таблица пуста!");
      } else if (res.status === 500) {
        setStatusCode(res.status);
        setToastMessage("Элемент с таким ключом уже сущетсвует!");
      } else if (res.status === 401) {
            setStatusCode(res.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          } else {
        setStatusCode(res.status);
        setToastMessage("Произошла непредвиденная ошибка!");
      }
    }
    catch (err) {  
    }
    finally{
          setLoading(false);
        }
  }

    return (
      <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        {hasParams ? (
            <meta name="robots" content="noindex, follow"/>
          ) : (
            <meta name="robots" content={robots || "index, follow"} />
          )}
        <link rel="canonical" href={`https://vip-boat.ru${api_adress}`}/>
        <script type="application/ld+json">
            {ldJsonObj}
        </script>
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Vip Boat" />
        <meta property="og:locale" content="ru_RU" />
        <meta property="og:url" content={`https://vip-boat.ru${api_adress}`}/>
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={pageImages[0]?.src} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={pageImages[0]?.src} />
      </Helmet>
      <section className="productPage">
        {!loadingPage && pageImages.length > 0 && pageImages[0]?.src && (
          <link itemProp="image" href={schemaAbsoluteUrl(pageImages[0].src)} />
        )}
        {!loadingPage && pagePrice > 0 && (
          <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
            <meta itemProp="priceCurrency" content="RUB" />
            <meta itemProp="price" content={String(pagePrice)} />
            <link itemProp="availability" href="https://schema.org/InStock" />
          </div>
        )}
      {loadingPage ? (
            <LoadingGifPage loading={true}/>
          ): (
            <>
            <div className="productPage-container">
            <div className="productPage-main-content-container">
              <div className="productPage-main-content">
                <div className="productPage-slider-container">
                  <Slider images={pageImages} refSlide={currentSlide}/>
                </div>
                <div className="productPage-main-content-description">
                  <div className="productPage-main-content-description-part-1">
                    <div className="productPage-productPage-routing">
                        <button onClick={() => navigate('/')}>Главная /</button>
                        <span>{pageName}</span>
                    </div>
                    {pageCapacity > 0 && (
                      <span className="productPage-main-content-description-ppl-amount">{pageCapacity + " Чел."}</span>
                    )}
                    <h1 className="productPage-main-content-description-name">{pageName}</h1>
                    {pagePrice > 0 && (
                      <div className="productPage-price-container">
                      <span className="productPage-product-from">ОТ:</span>
                      {pageDiscount > 0 &&
                      <span className="productPage-product-discount">{pageDiscount + " руб./час"}</span>
                      }
                      <span className="productPage-product-price">{pagePrice}</span>
                      <span>руб./час</span>
                    </div>
                    )}
                  </div>
                      <div className="productPage-item-tags">
                      <div className="floating-hint">
                       <p>
                        нажмите, чтобы увидеть больше информации
                       </p>
                      </div>
                      {isAdmin && (
                        <div className="productPage-product-tag-container">
                        <button className="productsPage-add-btn-desc" onClick={() => createProductDesc()}>
                              <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512.000000 512.000000"
                    preserveAspectRatio="xMidYMid meet">

                    <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)">
                    <path d="M2412 5100 c-109 -29 -187 -74 -272 -160 -87 -86 -131 -163 -160
                    -276 -19 -73 -20 -113 -20 -791 l0 -713 -713 0 c-678 0 -718 -1 -791 -20 -113
                    -29 -190 -73 -276 -160 -87 -86 -131 -163 -160 -276 -25 -98 -25 -190 0 -288
                    29 -113 73 -190 160 -276 86 -87 163 -131 276 -160 73 -19 113 -20 791 -20
                    l713 0 0 -713 c0 -678 1 -718 20 -791 29 -113 73 -190 160 -276 86 -87 163
                    -131 276 -160 98 -25 190 -25 288 0 113 29 190 73 276 160 87 86 131 163 160
                    276 19 73 20 113 20 791 l0 713 713 0 c678 0 718 1 791 20 113 29 190 73 276
                    160 87 86 131 163 160 276 25 98 25 190 0 288 -29 113 -73 190 -160 276 -86
                    87 -163 131 -276 160 -73 19 -113 20 -791 20 l-713 0 0 713 c0 678 -1 718 -20
                    791 -11 43 -34 105 -52 139 -42 81 -164 203 -245 245 -132 69 -291 88 -431 52z
                    m282 -314 c62 -31 109 -80 140 -145 21 -45 21 -59 26 -861 5 -755 6 -817 23
                    -847 38 -71 -9 -67 897 -73 802 -5 816 -5 861 -26 66 -31 114 -78 146 -142 23
                    -47 28 -70 28 -132 -1 -124 -56 -214 -163 -267 l-57 -28 -815 -5 c-906 -6
                    -859 -2 -897 -73 -17 -30 -18 -92 -23 -847 -5 -802 -5 -816 -26 -861 -31 -66
                    -78 -114 -142 -146 -47 -23 -70 -28 -132 -28 -125 0 -222 62 -274 174 -21 45
                    -21 59 -26 861 -6 906 -2 859 -73 897 -30 17 -92 18 -847 23 -802 5 -816 5
                    -861 26 -66 31 -114 78 -146 142 -23 47 -28 70 -28 132 1 124 56 214 163 267
                    l57 28 815 5 c915 6 860 1 900 80 20 38 20 58 20 828 0 863 -1 846 59 929 84
                    116 243 154 375 89z"/>
                  </g>
                </svg>
                            </button>
                        </div>                  
                        )}
                      {pageTags.map((item, id) => (
                        <div className="productPage-product-tag-container" key={id}>
                          <span className="productPage-product-tag-container-1">{item.name}</span>
                          <span className="productPage-product-tag-container-2">{item.description}</span>
                          {isAdmin && (
                                          <button className="productPage-desc-on-delete-btn" onClick={() => {
                                          if (window.confirm("Вы уверены, что хотите безвозвратно удалить элемент?")) {onDeleteDesc(item.id)}}}>
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
                                          <button className="productPage-desc-on-update-btn" onClick={() => onUpdateDesc(item)}>
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
                        </div>
                      ))}
                    </div>
                    <div className="productPage-item-tags-container-inner">
                    <button className="productPage-product-book-btn" onClick={() => setVisibleRequest(true)}>
                      Оставить заявку
                    </button>
                    <button className="productPage-product-add-to-favourites" onClick={() => {toggleFavourite(productId);}}>
                    {isFavourite ? (
                      <>
                       <svg className="productPage-product-delete-from-favourites"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="40px"
                      height="40px"
                      fill="#ffffff"
                      >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                      2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09
                      C13.09 3.81 14.76 3 16.5 3
                      19.58 3 22 5.42 22 8.5
                      c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    <span>Исключить из избраных</span>
                      </>
                    ) : (
                      <>
                      <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="40px"
                      height="40px"
                      fill="none"
                      >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                      2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09
                      C13.09 3.81 14.76 3 16.5 3
                      19.58 3 22 5.42 22 8.5
                      c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    <span>Добавить в избранные</span>
                      </>
                    )}          
                    </button>
                    <div className="productPage-product-order-refs">
                      <span>Поделиться: </span>
                      <button className="productPage-product-order-refs-1" onClick={() => {
                      const url = `mailto:?subject=Check%20this%20https://vip-boat.ru/${api_adress}/`;
                      window.open(url, "_blank");
                      }}> 
                      <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                      width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
                      preserveAspectRatio="xMidYMid meet">

                      <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)">
                      <path d="M692 4145 c-57 -13 -132 -44 -132 -54 0 -3 439 -298 975 -655 972
                      -648 974 -648 1025 -648 51 0 53 0 1025 648 536 357 975 652 975 655 0 9 -90
                      47 -141 58 -71 17 -3659 13 -3727 -4z"/>
                      <path d="M338 3807 c-17 -43 -25 -2381 -7 -2465 36 -174 178 -321 356 -367 86
                      -23 3660 -23 3746 0 178 46 320 193 356 367 18 84 10 2422 -7 2465 l-14 32
                      -996 -663 c-548 -365 -1016 -671 -1039 -680 -118 -44 -255 -40 -368 13 -33 15
                      -500 321 -1037 679 l-976 651 -14 -32z"/>
                      </g>
                      </svg>
                      </button>
                      <button className="productPage-product-order-refs-2" onClick={() => {
                      const url = `https://connect.ok.ru/offer?url=https://vip-boat.ru/${api_adress}/`;
                      window.open(url, "_blank");
                      }}>
                        <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                        width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
                        preserveAspectRatio="xMidYMid meet">

                        <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)">
                        <path d="M2410 5113 c-302 -32 -604 -177 -819 -392 -189 -190 -306 -408 -358
                        -669 -27 -137 -23 -357 10 -498 57 -248 172 -453 357 -635 186 -183 422 -306
                        701 -366 131 -28 401 -25 538 5 280 63 503 183 691 372 188 189 307 411 356
                        668 21 107 24 326 5 432 -89 505 -477 916 -986 1045 -152 39 -348 54 -495 38z
                        m316 -671 c286 -76 475 -302 491 -587 7 -121 -9 -193 -68 -314 -71 -144 -214
                        -266 -379 -321 -90 -31 -268 -38 -365 -16 -139 33 -284 124 -369 232 -253 323
                        -142 781 233 960 41 19 99 41 130 49 84 20 244 19 327 -3z"/>
                        <path d="M1194 2529 c-49 -14 -125 -69 -161 -117 -18 -24 -42 -75 -54 -114
                        -26 -85 -21 -150 15 -212 72 -123 369 -326 615 -421 156 -61 450 -127 654
                        -147 15 -2 28 -7 28 -11 0 -4 -232 -231 -515 -503 -573 -551 -566 -543 -566
                        -664 0 -85 39 -167 111 -235 74 -69 146 -99 239 -99 123 -1 140 12 600 457
                        l401 389 72 -68 c40 -38 225 -217 412 -397 228 -221 356 -338 390 -355 42 -22
                        63 -27 130 -27 71 0 88 4 147 33 174 85 253 270 178 418 -25 51 -95 122 -544
                        553 -284 271 -513 497 -510 502 3 5 20 9 37 9 107 0 459 78 615 136 208 78
                        435 216 563 344 114 113 132 190 79 332 -43 117 -149 197 -271 206 -98 7 -180
                        -21 -304 -104 -587 -391 -1400 -391 -1989 0 -141 94 -266 126 -372 95z"/>
                        </g>
                      </svg>
                      </button>
                      <button className="productPage-product-order-refs-4" onClick={() => {
                      const url = `https://vk.com/share.php?url=https://vip-boat.ru/${api_adress}/&image=${pageImages[currentSlide.current - 1].src}&title=${pageName}/`;
                      window.open(url, "_blank");
                      }}>
                        <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 48 48" width="96px" 
                        height="96px"><path d="M45.763,35.202c-1.797-3.234-6.426-7.12-8.337-8.811c-0.523
                        -0.463-0.579-1.264-0.103-1.776 c3.647-3.919,6.564-8.422,7.568-11.143C45.334,12.27,
                        44.417,11,43.125,11l-3.753,0c-1.237,0-1.961,0.444-2.306,1.151 c-3.031,6.211-5.631,
                        8.899-7.451,10.47c-1.019,0.88-2.608,0.151-2.608-1.188c0-2.58,0-5.915,0-8.28 c0-1.147
                        -0.938-2.075-2.095-2.075L18.056,11c-0.863,0-1.356,0.977-0.838,1.662l1.132,1.625c0.426,0.563,0.656,
                        1.248,0.656,1.951 L19,23.556c0,1.273-1.543,1.895-2.459,1.003c-3.099-3.018-5.788-9.181-6.756-12.128C9.505,11.578,8.706,11.002,
                        7.8,11l-3.697-0.009 c-1.387,0-2.401,1.315-2.024,2.639c3.378,11.857,10.309,23.137,22.661,24.36c1.217,0.12,2.267-0.86,2.267-2.073l0-3.846 c0-1.103,0.865-2.051,
                        1.977-2.079c0.039-0.001,0.078-0.001,0.117-0.001c3.267,0,6.926,4.755,8.206,6.979 c0.368,0.64,
                        1.056,1.03,1.8,1.03l4.973,0C45.531,38,46.462,36.461,45.763,35.202z"/>
                        </svg>
                      </button>
                    </div>
                    </div>   
                    {isAdmin && (
                  <MetaBtn title={title} description={description} robots={robots} ld_json={ld_json} id={db_id}/>
                  )} 
              </div>
            </div>
            <div className="productPage-showing-options">
  <div
    className={`productPage-showing-options-left${selectedBtn === "left" ? "-active" : ""}`}
  >
    <button onClick={() => setSelectedBtn("left")}>
      описание
    </button>
  </div>

  <div className={`productPage-showing-options-right${selectedBtn === "right" ? "-active" : ""}`}>
              <button onClick={() => setSelectedBtn("right")}>
              <span>отзывы</span>
              {pageReviews ? (
                <span>{"(" + pageReviews.length + ")"}</span>
              ) : (
                <span>{"(" + 0 + ")"}</span>
              )}
              </button>
              </div>
              </div>
            </div>
            <div className="productPage-description-container">
              <div className="productPage-description">
              {selectedBtn === "left" && (
                <div className="productPage-description_inner_container">
                      {vistaComp.length > 0 && (
                        <MainComponent pageComponents={vistaComp} setPageComponents={setVistaComp} pageId={pageId} pages={pages} setPages={setPages} noAddition={true} redactorId={redactorId}/>
                      )}
                      {redactorComponent !== null && (
                  <>
                  {isAdmin ? (
                    <div className="quill-redactor-main-page-container">
                  <QuillRedactor
                   str={redactorComponent.component_content?.[0]?.delta || ""}
                   showSaveButton={true}
                   comp_id={redactorComponent.id}
                   comp_group_id={redactorComponent.component_content[0].id}
                   comp_name={redactorComponent.component_content[0].name}
                   onUpdated={updateRedactorInComponentContent}
                  />
                  {isAdmin &&(
                          <button className="redactor-container-on-delete" onClick={() => {
                        if (window.confirm("Вы уверены, что хотите безвозвратно удалить элемент?")) {
                        onDeleteRedactor(redactorComponent.id, redactorComponent.component_content[0].id);
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
                </div>
                  ) : (
                    <ParseDelta desc={redactorComponent.component_content[0].delta}/>
                  )}
                  </>
                )}
                </div>
              )}
              {selectedBtn === "right" && <ReviewsConatiner/>}
              <MainComponent pageComponents={pageComponents} setPageComponents={setPageComponents} pageId={pageId} pages={pages} setPages={setPages} redactorId={redactorId}/>
            </div>
            <div className="productPage-description-container-horizontal">
              {vistaComp.length ? (
                <div className="productPage-description-container-horizontal-vista">
                <button onClick={() => (openVista ? setOpenVista(false) : setOpenVista(true))} className={`productPage-description-container-horizontal-vista-btn-container${openVista === true ? " active" : ""}`}>
                  <span className="productPage-description-container-horizontal-vista-btn-container-span">3D тур</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div className={`productPage-description-container-horizontal-vista-container${openVista === true ? " active" : ""}`}>
                   <div className="productPage-description_inner_container">
                      <MainComponent pageComponents={vistaComp} setPageComponents={setVistaComp} pageId={pageId} pages={pages} setPages={setPages} noAddition={true} redactorId={redactorId}/>
                  </div>
                </div>
              </div>
              ) : <></>}
              <div className="productPage-description-container-horizontal-left">
                <button onClick={() => (openLeft ? setOpenLeft(false) : setOpenLeft(true))} className={`productPage-description-container-horizontal-left-btn-container${openLeft === true ? " active" : ""}`}>
                  <span className="productPage-description-container-horizontal-left-btn-container-span">Описание</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div className={`productPage-description-container-horizontal-left-container${openLeft === true ? " active" : ""}`}>
                   <div className="productPage-description_inner_container">
                    {redactorComponent !== null && (
                  <>
                  {isAdmin ? (
                    <div className="quill-redactor-main-page-container">
                  <QuillRedactor
                   str={redactorComponent.component_content?.[0]?.delta || ""}
                   showSaveButton={true}
                   comp_id={redactorComponent.id}
                   comp_group_id={redactorComponent.component_content[0].id}
                   comp_name={redactorComponent.component_content[0].name}
                   onUpdated={updateRedactorInComponentContent}
                  />
                  {isAdmin &&(
                          <button className="redactor-container-on-delete" onClick={() => {
                        if (window.confirm("Вы уверены, что хотите безвозвратно удалить элемент?")) {
                        onDeleteRedactor(redactorComponent.id, redactorComponent.component_content[0].id);
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
                </div>
                  ) : (
                    <ParseDelta desc={redactorComponent.component_content[0].delta}/>
                  )}
                  </>
                )}
                  </div>
                </div>
              </div>
              <div className="productPage-description-container-horizontal-right">
                <button onClick={() => (openRight ? setOpenRight(false) : setOpenRight(true))} className={`productPage-description-container-horizontal-right-btn-container${openRight === true ? " active" : ""}`}>
                  <span className="productPage-description-container-horizontal-right-btn-container-span">Отзывы {pageReviews ? (
                <span>{"(" + pageReviews.length + ")"}</span>
              ) : (
                <span>{"(" + 0 + ")"}</span>
              )}</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div className={`productPage-description-container-horizontal-right-container${openRight === true ? " active" : ""}`}>
                  <ReviewsConatiner/>
                </div>
              </div>
              <MainComponent pageComponents={pageComponents} setPageComponents={setPageComponents} pageId={pageId} pages={pages} setPages={setPages} redactorId={redactorId}/>
            </div>
            </div>
        </div>
        {showImageContainer && (
          <div className="productPage-show-image-container">
          <div className="productPage-show-image-container-tab-bar">
            <div className="productPage-show-image-container-tab-bar-left">
              <div className="productPage-show-image-container-tab-bar-image-counter">
                {showCurrSlide}/{pageImages.length + (isValidMedia(pageVideo) ? 1 : 0)}
              </div>
            </div>
            <div className="productPage-show-image-container-tab-bar-right">
              <button className="zoom-btn" onClick={handleZoomToggle}>
                {zoom ? (
                <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                  width="100.000000pt" height="100.000000pt" viewBox="0 0 100.000000 100.000000"
                  preserveAspectRatio="xMidYMid meet">

                  <g transform="translate(0.000000,100.000000) scale(0.100000,-0.100000)">
                  <path d="M474 922 c-211 -75 -299 -323 -179 -504 l27 -41 -128 -128 -129 -129
                  28 -27 27 -28 129 129 129 129 58 -29 c51 -25 71 -29 144 -29 73 0 93 4 142
                  28 72 35 130 93 165 165 24 49 28 69 28 142 0 71 -4 94 -26 140 -73 155 -261
                  237 -415 182z m240 -56 c105 -51 161 -144 161 -266 0 -85 -21 -142 -74 -203
                  -82 -92 -237 -121 -353 -64 -160 79 -215 278 -118 430 80 126 246 170 384 103z"/>
                  <path d="M420 600 c0 -19 7 -20 160 -20 153 0 160 1 160 20 0 19 -7 20 -160
                  20 -153 0 -160 -1 -160 -20z"/>
                  </g>
                  </svg>
                ) : (
                <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                width="100.000000pt" height="100.000000pt" viewBox="0 0 100.000000 100.000000"
                preserveAspectRatio="xMidYMid meet">

                <g transform="translate(0.000000,100.000000) scale(0.100000,-0.100000)">
                <path d="M474 922 c-211 -75 -299 -323 -179 -504 l27 -41 -128 -128 -129 -129
                28 -27 27 -28 129 129 129 129 58 -29 c51 -25 71 -29 144 -29 73 0 93 4 142
                28 72 35 130 93 165 165 24 49 28 69 28 142 0 71 -4 94 -26 140 -73 155 -261
                237 -415 182z m240 -56 c105 -51 161 -144 161 -266 0 -85 -21 -142 -74 -203
                -82 -92 -237 -121 -353 -64 -160 79 -215 278 -118 430 80 126 246 170 384 103z"/>
                <path d="M560 690 l0 -70 -70 0 c-63 0 -70 -2 -70 -20 0 -18 7 -20 70 -20 l70
                0 0 -70 c0 -63 2 -70 20 -70 18 0 20 7 20 70 l0 70 70 0 c63 0 70 2 70 20 0
                18 -7 20 -70 20 l-70 0 0 70 c0 63 -2 70 -20 70 -18 0 -20 -7 -20 -70z"/>
                </g>
                </svg>
                )}
              </button>
              <button 
              className="fullscreen-btn" 
              onClick={() => {
              const container = document.querySelector(".productPage-show-image-container");
              if (!document.fullscreenElement) {
              container?.requestFullscreen();
              } else {
              document.exitFullscreen();
              }
              }}>
              <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
              width="90.000000pt" height="90.000000pt" viewBox="0 0 90.000000 90.000000"
              preserveAspectRatio="xMidYMid meet">

              <g transform="translate(0.000000,90.000000) scale(0.100000,-0.100000)">
              <path d="M140 760 c-18 -18 -20 -31 -18 -103 3 -80 4 -82 28 -82 24 0 25 3 28
              72 l3 72 72 3 c69 3 72 4 72 28 0 24 -2 25 -82 28 -72 2 -85 0 -103 -18z"/>
              <path d="M574 765 c-14 -35 3 -45 75 -45 l70 0 3 -72 c3 -70 4 -73 28 -73 24
              0 25 2 28 82 4 112 -7 123 -118 123 -62 0 -82 -3 -86 -15z"/>
              <path d="M127 324 c-4 -4 -7 -43 -7 -86 0 -109 12 -120 123 -116 80 3 82 4 82
              28 0 24 -3 25 -72 28 l-72 3 -3 72 c-3 64 -5 72 -23 75 -12 2 -24 0 -28 -4z"/>
              <path d="M727 324 c-4 -4 -7 -38 -7 -75 l0 -68 -72 -3 c-70 -3 -73 -4 -73 -28
              0 -24 2 -25 82 -28 72 -2 85 0 103 18 18 18 20 31 18 103 -3 74 -5 82 -23 85
              -12 2 -24 0 -28 -4z"/>
              </g>
              </svg>
              </button>
              <button className="productPage-show-close" onClick={() => {
                setShowImageContainer(false);
                if(shareBtnShow)
                {
                  setShareBtnShow(false);
                }
                }}>
                <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 50 50" width="100px" height="100px"><path d="M 9.15625 6.3125 L 6.3125 9.15625 L 22.15625 25 L 6.21875 40.96875 L 9.03125 43.78125 L 25 27.84375 L 40.9375 43.78125 L 43.78125 40.9375 L 27.84375 25 L 43.6875 9.15625 L 40.84375 6.3125 L 25 22.15625 Z"/></svg>
              </button>
            </div>
          </div>
          <div className="productPage-show-image-swiper-inner-container">
            <button className="productPage-show-image-swiper-btn-container-left-btn" onClick={() => {
              swiperRef.current?.slidePrev();
              if(zoom)
              {
                setZoom(false);
              }
            }}>
            ←
          </button>
           <Swiper
          modules={[Zoom, Pagination]}
          zoom={{ maxRatio: 2, minRatio: 1 }}
          spaceBetween={10}
          onSlideChange={(swiper) => (currentSlide.current = (swiper.activeIndex + 1), setShowCurrSlide(swiper.activeIndex + 1))}
          initialSlide={currentSlide.current - 1}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          className="productPage-show-image-swiper"
          >
          {isValidMedia(pageVideo) && (
            <SwiperSlide>
            <div className="video-wrapper-big">
              <video playsInline controls controlsList="nodownload" oncontextmenu="return false;">
              <source src={pageVideo} type={mimeType} />
              </video>
            </div>
          </SwiperSlide>
          )}
          {pageImages.map((image, id) => (
          <SwiperSlide key={id}>
            <div className="swiper-zoom-container">
                <img loading="lazy" className="productPage-show-image-swiper-image" src={image.src} alt={`${pageName + " image-"} ${id + 1}`} />
            </div>
          </SwiperSlide>
          ))}
        </Swiper> 
          <button className="productPage-show-image-swiper-btn-container-right-btn" onClick={() => {
          swiperRef.current?.slideNext();
          if (zoom) {
          setZoom(false);
          }
          }}>
            →
          </button>
          </div>
        </div>
        )}
            </>
          )}
          <Suspense fallback={<div className="suspense-loading"><LoadingGifPage loading={true}/></div>}>
          <ModalManager type={templateType} isOpen={openModal} onClose={() => {setOpenModal(false)}} onCreated={handlers[handlerType]} setToastMessage={setToastMessage} 
                                    setStatusCode={setStatusCode} item_name={itemName} item_id={itemId} setType={setTemplateType}
                                    page_id={pageId} component_group_id={itemGroupId} item_desc={itemDesc} setLoading={setLoading} loading={loading}
                                    pages={pages} setPages={setPages} item_page_id={productPageId} item_rating={itemRating} item_text={itemText}/>
          </Suspense>
                                    {toastMessage && (
                                <Toast
                                  message={toastMessage}
                                  status_code={statusCode}
                                  timeout={4000}
                                  onClose={() => setToastMessage("")}
                                />
                              )}
                              {loading && (
                                <LoadingGif loading={loading}/>
                              )}
                              <AuthForm visible={visibleAuth} setVisible={setVisibleAuth}/>
                              <CallRequest product_name={pageName} visible={visibleRequset} setVisible={setVisibleRequest}/>
                              {ready && <div id="page-ready"></div>}
    </section>
      </>
    );
}