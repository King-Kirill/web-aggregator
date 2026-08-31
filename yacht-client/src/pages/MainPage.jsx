import React, { useEffect, useState, useRef, useContext } from "react";
// import "./styles/MainPage.css";
import 'react-quill/dist/quill.snow.css';
import MainComponent from '../components/MainComponents/MainComponent.jsx';
import Toast from "../components/adminMessage/adminMessage.jsx";
import { useNavigate } from "react-router-dom";
import LoadingGif from "../components/loadingGif/LoadingGif.jsx";
import { BASE_URL } from '../config';
import { useLocation } from "react-router-dom";
import CallRequest from "../components/callRequest/CallRequest.jsx";
import LoadingGifPage from "../components/LoadingGifPage/LoadingGifPage.jsx";
import { useToggleContext } from "../components/ToggleContext.jsx";
import { Helmet } from "react-helmet-async";

import AuthForm from "../components/AuthForm/AuthForm.jsx";

// import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// import required modules
import { EffectFade, Pagination, Autoplay } from 'swiper/modules';

// import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function MainPage({pages, setPages}) {
  const location = useLocation();
  const { isOn, setIsOn } = useToggleContext(); 
  const [width, setWidth] = useState(window.innerWidth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [smallSwiper, setSmallSwiper] = useState([]);
  const [mobile, setMobile] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [statusCode, setStatusCode] = useState(null);

  const [pageId, setPageId] = useState(1);
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [nameError, setNameError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [ready, setReady] = useState(false);
  const [firstRender, setFirstRender] = useState(true);
  const [firstInteraction, setFirstInteraction] = useState(true);
  
  const [mainSwiper, setMainSwiper] = useState([]);
  const [isOpenImageUpdate, setIsOpenImageUpdate] = useState(false);
  const [isOpenImageCreate, setIsOpenImageCreate] = useState(false)
  const [isOpenImageUpdateMobile, setIsOpenImageUpdateMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [currentImageId, setCurrentImageId] = useState(null);
  const [pageImage, setPageImage] = useState("");
  const [visibleAuth, setVisibleAuth] = useState(false);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);

  const cleanPhone = userPhone.replace(/\D/g, "");

  /* Главная: только WebPage — Organization/WebSite заданы в index.html */
  const homeWebPageLd = JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": ["Organization", "LocalBusiness", "TravelAgency"],
            "@id": "https://vip-boat.ru/#organization",
            "name": "Vip Boat",
            "legalName": "ИНДИВИДУАЛЬНЫЙ ПРЕДПРИНИМАТЕЛЬ КУЗЬМЫК ПАВЕЛ ИОСИФОВИЧ",
            "url": "https://vip-boat.ru/",
            "logo": {
              "@type": "ImageObject",
              "url": "https://vip-boat.ru/images/icon.png",
              "contentUrl": "https://vip-boat.ru/images/icon.png"
            },
            "image": "https://vip-boat.ru/images/icon.png",
            "description": "Аренда яхт, катеров и теплоходов в Санкт-Петербурге. Подбор судна для прогулок и мероприятий.",
            "telephone": "+79643333636",
            "email": "noreplyvipboat@yandex.ru",
            "taxID": "780159592304",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "RU",
              "addressLocality": "Санкт-Петербург"
            },
            "areaServed": {
              "@type": "City",
              "name": "Санкт-Петербург"
            },
            "priceRange": "$$",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "127",
              "bestRating": "5",
              "worstRating": "1"
            }
          },
          {
            "@type": "WebSite",
            "@id": "https://vip-boat.ru/#website",
            "url": "https://vip-boat.ru/",
            "name": "Vip Boat",
            "alternateName": "VIP Boat — аренда яхт в СПб",
            "inLanguage": "ru-RU",
            "publisher": { "@id": "https://vip-boat.ru/#organization" },
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://vip-boat.ru/search?q={search_term_string}"
              }
            }
          }
        ]
  });

  useEffect(() => {
        const updateSwiper = () => {
          const width = window.innerWidth;
          if (width < 550) {
            if(smallSwiper.length > 0)
            {
              setMobile(true);
            }
          } else {
            setMobile(false);
          }
        };
    
        updateSwiper();
        window.addEventListener("resize", updateSwiper);
    
        return () => window.removeEventListener("resize", updateSwiper);
      }, [mainSwiper]);
  
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
  
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

const changeName = (e) => {
  setUserName(e.target.value);
}

const changePhone = (e) => {
  setUserPhone(e.target.value);
}

const onChangeFile = (e) => {
  setFile(e.target.files[0]);
}

const onUpdateMainImage = async (id, image_src) => {
  setCurrentImageId(id);
  setPageImage(image_src);
  setIsOpenImageUpdate(true);
}

const onCreateMainImage = async () => {
  setIsOpenImageCreate(true);
}

const sendForm = async () => {
  if(userName === "")
  {
    setNameError(true);
    return;
  }

  if(userPhone === "" || cleanPhone.length !== 11 || !/^[78]/.test(cleanPhone))
  {
    setPhoneError(true);
    return;
  }

  if(!privacy)
  {
    alert("Согласитесь с политикой конфиденциальности");
    return;
  }

  try {
    setLoading(true);
      const res = await fetch(`${BASE_URL}/send-simple-request`,
        {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify({
            user_name: userName,
            phone: userPhone
            })
        }
      );

      if (res.status === 200) {
        const data = await res.json();
        setStatusCode(res.status);
        setToastMessage("Заявка успешно отправлена!");
        navigate("/thanks");
      } else if (res.status === 404) {
        setStatusCode(res.status);
        setToastMessage("Проверьте корректность заполнения данных!");
      } else if (res.status === 500) {
        setStatusCode(res.status);
        setToastMessage("Ошибка сервера!");
      } else {
        setStatusCode(res.status);
        setToastMessage("Непредвиденная ошибка!");
      }

    } catch (err) {
    }
    finally{
      setLoading(false);
    }
}
    const [pageTitle, setPageTitle] = useState([]);
    const [pageComponents, setPageComponents] = useState([]);

    const getPresignedData = async (fileName, fileType) => {
          const res = await fetch(`${BASE_URL}/get-presigned-url`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              name: fileName,
              type: fileType,
            }),
          });
        
          if(res.status === 401)
          {
            setStatusCode(res.status);
                    setToastMessage("Неавторизованный пользователь!");
                    setVisibleAuth(true);
                    setLoading(false);
          }
          return await res.json();
        };
    
        const uploadFileToS3 = async (file) => {
        try {
        const presignedData = await getPresignedData(file.name, file.type);
        const formData = new FormData();
    
        Object.entries(presignedData.url.fields).forEach(([key, value]) => {
          formData.append(key, value);
        });
        formData.append("file", file);
    
        await fetch(presignedData.url.url, {
          method: "POST",
          body: formData,
        });
    
        const publicUrl = `${presignedData.url.url}/${presignedData.url.fields.key}`;
        return publicUrl;
        } catch (err) {
        return null;
        }};

    useEffect(() => {
    const fetchMain = async () => {

    try {
      const res = await fetch(`${BASE_URL}/load-main-page-swiper`);

      if (res.status === 200) {
        const data = await res.json();

        setMainSwiper(data.content.big);
        setSmallSwiper(data.content.small);
      }

    } catch (err) {
    }

    try {
      const res = await fetch(`${BASE_URL}/load-page`,
        {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify({
            adress: "/main"
            })
        }
      );

      if (res.status === 200) {
        const data = await res.json();
         
        setPageTitle(data.content.content.info[0].title);
        setPageId(data.content.obj.id);
        
        const sortByOrderId = (arr) => arr.sort((a, b) => a.order_id - b.order_id);
        const sortedComponents = sortByOrderId(data.content.components);
        setPageComponents(sortedComponents);
      }

    } catch (err) {
    }
    finally{
      setReady(true);
      setFirstRender(false);
    }
  };

  fetchMain();
  }, []);

  const onDeleteMainImage = async (item_id) => {
    try{
      setLoading(true);

      const res = await fetch(`${BASE_URL}/delete-in-main-swiper/${item_id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        }, credentials: "include",
      });

      if(res.status === 200)
      {
        setStatusCode(200);
        setToastMessage("Элемент успешно удален!");

        setMainSwiper(prev => prev.filter(item => item.id !== item_id));
      }
      else if(res.status === 401)
      {
        setStatusCode(401);
        setToastMessage("Неавторизорванный пользователь!");
        setVisibleAuth(true);
      }
      else if(res.status === 404)
      {
        setStatusCode(404);
        setToastMessage("Такой элемент не найден!");
        setVisibleAuth(true);
      }
      else if(res.status === 500)
      {
        setStatusCode(500);
        setToastMessage("Внутреняя ошибка сервера!");
      }
    }
    catch(ex)
    {
      console.log(ex);
    }
    finally{
      setLoading(false);
    }
  }

  const createMainPageImage = async () => {
      setLoading(true);
          try {
            let newImageSrc;

            if (file) {
              newImageSrc = await uploadFileToS3(file);
              if (!newImageSrc) {
                setStatusCode(500);
                setToastMessage("Внутренняя ошибка сервера!");
                setLoading(false);
                return;
              }
            } else {
              setStatusCode(404);
              setToastMessage("Задайте изображение!");
              setLoading(false);
              return;
            }

                const res = await fetch(`${BASE_URL}/create-main-page-image`,{
                  method: "POST",
                  headers: {
                  "Content-Type": "application/json"
                  },
                  credentials: "include",
                  body: JSON.stringify({
                  image_src: newImageSrc
                  })
                });
          
                if (res.status === 200) {
                  setStatusCode(res.status);
                  setToastMessage("Изображение добавлено!");

                  const item_id = data.content;
                  const new_obj = {
                    id: item_id,
                    image_src: newImageSrc
                  }
                  setMainSwiper(prev => [...prev, new_obj]);

                } else if (res.status === 404) {
                  setStatusCode(res.status);
                  setToastMessage("Ошибка добавления!");
                } else if (res.status === 500) {
                  setStatusCode(res.status);
                  setToastMessage("Внутренняя ошибка сервера!");
                } else if (res.status === 401) {
                  setStatusCode(res.status);
                  setToastMessage("Неавторизованный пользователь!");
                  setVisibleAuth(true);
                } else {
                  setStatusCode(res.status);
                  setToastMessage("Произошла непредвиденная ошибка!");
                }
          
              } catch (err) {
              }
              finally{
                setLoading(false);
                setCurrentImageId(null);
                setPageImage("");
                setIsOpenImageCreate(false);
                setFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = null;
                }
              }
  }

  const updateMainPageImageMobile = async () => {
    setLoading(true);
          try {
            let newImageSrc;

            if (file) {
              newImageSrc = await uploadFileToS3(file);
              if (!newImageSrc) {
                setStatusCode(500);
                setToastMessage("Внутренняя ошибка сервера!");
                setLoading(false);
                return;
              }
            } else {
              setStatusCode(404);
              setToastMessage("Задайте изображение!");
              setLoading(false);
              return;
            }

                const res = await fetch(`${BASE_URL}/create-main-swiper-mobile`,{
                  method: "POST",
                  headers: {
                  "Content-Type": "application/json"
                  },
                  credentials: "include",
                  body: JSON.stringify({
                  image_src: newImageSrc
                  })
                });
          
                if (res.status === 200) {
                  setStatusCode(res.status);
                  setToastMessage("Изображение обновлено!");

                  setSmallSwiper(prev => [
                    { ...prev[0], image_src: newImageSrc },
                      ...prev.slice(1)
                    ]);

                } else if (res.status === 404) {
                  setStatusCode(res.status);
                  setToastMessage("Ошибка обновления!");
                } else if (res.status === 500) {
                  setStatusCode(res.status);
                  setToastMessage("Внутренняя ошибка сервера!");
                } else if (res.status === 401) {
                  setStatusCode(res.status);
                  setToastMessage("Неавторизованный пользователь!");
                  setVisibleAuth(true);
                } else {
                  setStatusCode(res.status);
                  setToastMessage("Произошла непредвиденная ошибка!");
                }
          
              } catch (err) {
              }
              finally{
                setLoading(false);
                setCurrentImageId(null);
                setPageImage("");
                setIsOpenImageUpdate(false);
                setFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = null;
                }
              }
  }

  const updateMainPageImage = async () => {
      setLoading(true);
          try {
            let newImageSrc;

            if (file) {
              newImageSrc = await uploadFileToS3(file);
              if (!newImageSrc) {
                setStatusCode(500);
                setToastMessage("Внутренняя ошибка сервера!");
                setLoading(false);
                return;
              }
            } else {
              setStatusCode(404);
              setToastMessage("Задайте изображение!");
              setLoading(false);
              return;
            }

                const res = await fetch(`${BASE_URL}/update-main-page-image`,{
                  method: "POST",
                  headers: {
                  "Content-Type": "application/json"
                  },
                  credentials: "include",
                  body: JSON.stringify({
                  id: currentImageId,
                  image_src: newImageSrc
                  })
                });
          
                if (res.status === 200) {
                  setStatusCode(res.status);
                  setToastMessage("Изображение обновлено!");

                  setMainSwiper(prev =>
                    prev.map(item =>
                      item.id === currentImageId
                      ? { ...item, image_src: newImageSrc }
                      : item
                    )
                  );
                } else if (res.status === 404) {
                  setStatusCode(res.status);
                  setToastMessage("Ошибка обновления!");
                } else if (res.status === 500) {
                  setStatusCode(res.status);
                  setToastMessage("Внутренняя ошибка сервера!");
                } else if (res.status === 401) {
                  setStatusCode(res.status);
                  setToastMessage("Неавторизованный пользователь!");
                  setVisibleAuth(true);
                } else {
                  setStatusCode(res.status);
                  setToastMessage("Произошла непредвиденная ошибка!");
                }
          
              } catch (err) {
              }
              finally{
                setLoading(false);
                setCurrentImageId(null);
                setPageImage("");
                setIsOpenImageUpdate(false);
                setFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = null;
                }
              }
    }

  useEffect(() => {
                   localStorage.setItem('page', 'mainPage');
                 }, []);

useEffect(() => {
  console.log("useEffect triggered:");
  console.log("isAdmin:", isAdmin);
  console.log("firstRender:", firstRender);
  console.log("pageComponents:", pageComponents);

  if (isAdmin && !firstRender) {
    if(!firstInteraction)
    {
    const fullUrl = `https://vip-boat.ru/`;
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

}, [pageComponents, mainSwiper]);

return(
  <>
  <Helmet>
    <title>Аренда яхты в СПБ с капитаном, моторная яхта на прокат</title>
    <meta name="description" content={"Аренда моторной яхты в Санкт-Петербурге с капитаном ⚓️ для комфортных прогулок, праздников и отдыха на воде. ⭐️ Звоните и бронируйте удобную дату"} />
    <script type="application/ld+json">
      {homeWebPageLd}
    </script>
    <link rel="canonical" href={`https://vip-boat.ru`}/>

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Vip Boat" />
    <meta property="og:locale" content="ru_RU" />
    <meta property="og:url" content="https://vip-boat.ru/" />
    <meta property="og:title" content="Vip Boat — аренда яхт, катеров и теплоходов в Санкт-Петербурге" />
    <meta property="og:description" content="Аренда яхт, катеров и теплоходов в Санкт-Петербурге. Подбор судна для прогулок и мероприятий." />
    <meta property="og:image" content="https://storage.yandexcloud.net/vip-boat-images/аренда-яхты-в-Санкт-Петербурге.jpg" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Vip Boat — аренда яхт в Санкт-Петербурге" />
    <meta name="twitter:description" content="Аренда яхт, катеров и теплоходов в Санкт-Петербурге." />
    <meta name="twitter:image" content="https://storage.yandexcloud.net/vip-boat-images/аренда-яхты-в-Санкт-Петербурге.jpg" />
  </Helmet>
  <div className="mainPage-section">
    <Swiper spaceBetween={20} 
      effect={'fade'}
      loop={true} 
      autoplay={{
        delay: 10000,
        disableOnInteraction: false,
      }}
      onSlideChange={(swiper) => {
        setActiveIndex(swiper.realIndex)
      }}
      pagination={isAdmin ? { clickable: true } : false}
      modules={[EffectFade, Pagination, Autoplay]} 
      className="mainPage-images-swiper">
        {isAdmin && (
                <SwiperSlide className="mainPage-images-swiper-slide">
                    <div className="mainPage-images-swiper-slide-add-btn-container">
                        <button className="mainPage-images-swiper-slide-add-btn" onClick={() => {onCreateMainImage()}}>
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
                </SwiperSlide>
            )}
        {mobile ? (
          <>
          {smallSwiper.map((item, id) => (
            <SwiperSlide key={id}>
              <div className="mainPage-images-swiper-slide-image-container" style={{
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${item.image_src})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat"}}>
                    </div>
            </SwiperSlide>
        ))}
          </>
        ) : (
          <>
          {mainSwiper.map((item, id) => (
            <SwiperSlide key={id}>
              <div className="mainPage-images-swiper-slide-image-container" style={{
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${item.image_src})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat"}}>
                    </div>
                    {isAdmin && activeIndex !== 0 && (
                        <button className="mainPage-images-swiper-edit-btn" onClick={() => {onUpdateMainImage(item.id, item.image_src)}}>
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
                    {isAdmin && activeIndex !== 0 && (
                        <button className="mainPage-images-swiper-delete-btn" onClick={() => {
                          if (window.confirm("Вы уверены, что хотите безвозвратно удалить страницу (удаление страницы не предусматривает удаление контента на ней)?")){onDeleteMainImage(item.id)}}}>
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
                      <button className="mainPage-images-swiper-add-mobile-btn" onClick={() => {setIsOpenImageUpdateMobile(true)}}>
                                <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                                  width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
                                  preserveAspectRatio="xMidYMid meet">

                                  <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                                  fill="#000000" stroke="none">
                                  <path d="M1521 5105 c-178 -39 -349 -172 -428 -335 -79 -160 -74 -2 -71 -2245
                                  l3 -2000 27 -81 c67 -195 217 -345 412 -412 l81 -27 987 -3 c1108 -3 1065 -5
                                  1217 70 120 59 220 160 278 278 78 159 73 5 73 2210 0 2205 5 2051 -73 2210
                                  -80 165 -250 296 -433 335 -100 21 -1975 21 -2073 0z m2289 -2325 l0 -1480
                                  -1250 0 -1250 0 0 1480 0 1480 1250 0 1250 0 0 -1480z m-1130 -1811 c103 -46
                                  161 -133 168 -250 4 -66 1 -84 -20 -130 -98 -214 -396 -234 -513 -35 -92 158
                                  -19 363 150 424 52 18 165 14 215 -9z"/>
                                  </g>
                                </svg>
                        </button>
                    )}
            </SwiperSlide>
        ))}
          </>
        )}
        <div className={`mainPage-title-container
              ${isAdmin && activeIndex === 0 ? "not-visible" : ""}`}>
                <div className="mainPage-title-container-content">
                    <h1 className="mainPage-title-container-title">
                    АРЕНДА - <br />
                    ЯХТЫ, КАТЕРА ИЛИ ТЕПЛОХОДА
                </h1>
                <p className="mainPage-title-container-text">
                    <span>
                        Мечтаете о незабываемом отдыхе на воде?
                    </span>
                    <br />
                    Арендуйте катер или яхту для прогулки, праздника или уикенда — всё уже готово для вашего идеального дня. Выбирайте судно и услуги под любой повод.
                </p>
                <div className="mainPage-inputs">
                  <div className="mainPage-name-wrapper">
                    <input value={userName} type="text" placeholder="Имя" onChange={changeName} onFocus={() => setNameError(false)}/>
                    <div className={`mainPage-name-wrapper-error ${nameError ? "active" : ""}`}>
                      <svg xmlns="http://www.w3.org/2000/svg"
                      width="40" height="40" viewBox="0 0 24 24" role="img" aria-label="Warning">
                      <rect className="svg-back" x="1" y="1" width="22" height="22" rx="2" ry="2" fill="#FFA920"/>
                      <rect className="svg-sign" x="10" y="4.5" width="4" height="10" rx="0.3" fill="#FFFFFF"/>
                      <circle className="svg-dot" cx="12" cy="17.5" r="1.4" fill="#FFFFFF"/>
                      </svg>
                      <span>Заполните это поле.</span>
                    </div>
                  </div>
                  <div className="mainPage-phone-wrapper">
                    <input value={userPhone} type="text" placeholder="+7 (___) ___ __ __" onChange={changePhone} onFocus={() => {setPhoneError(false); {if (!userPhone.startsWith("+7 ")) {setUserPhone("+7 ");}}}} maxLength={13}/>
                    <div className={`mainPage-name-wrapper-error ${phoneError ? "active" : ""}`}>
                      <svg xmlns="http://www.w3.org/2000/svg"
                      width="40" height="40" viewBox="0 0 24 24" role="img" aria-label="Warning">
                      <rect className="svg-back" x="1" y="1" width="22" height="22" rx="2" ry="2" fill="#FFA920"/>
                      <rect className="svg-sign" x="10" y="4.5" width="4" height="10" rx="0.3" fill="#FFFFFF"/>
                      <circle className="svg-dot" cx="12" cy="17.5" r="1.4" fill="#FFFFFF"/>
                      </svg>
                      {userPhone === "" ? (
                        <span>Заполните это поле.</span>
                      ) : (
                        <span>Неверный формат.</span>
                      )}
                    </div>
                  </div>
                </div>
                <button className="mainPage-order-btn" onClick={() => {sendForm()}}>
                    заказать звонок
                </button>
                <div className="mainPage-show-politics">
  <input
    type="checkbox"
    checked={privacy}
    onChange={() => setPrivacy(!privacy)}
  />

  <span>
    Я согласен с{" "}
    <a onClick={() => navigate("/privacy-policy")}>
      Политикой персональных данных
    </a>{" "}
    и{" "}
    <a onClick={() => navigate("/rent-policy")}>
      Условиями заказа
    </a>
  </span>
</div>
                </div>
            </div>
    </Swiper>
            <MainComponent pageComponents={pageComponents} setPageComponents={setPageComponents} pageId={pageId} pages={pages} setPages={setPages}/>
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
              {ready && <div id="page-ready"></div>}
        </div>
        <div className={`mainPage-on-change-image-container ${isOpenImageUpdate ? "active" : "closing"}`}>
            <button className="modal-close" onClick={() => {setIsOpenImageUpdate(false);
              if (fileInputRef.current) {
                fileInputRef.current.value = null;
              }
            }}>
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
               <div className="setImage-contaimer-modal">
                  <span>Поменять изображение мобильного: </span>
                  <a className="href" href={pageImage}>{pageImage}</a>
                  <input ref={fileInputRef} type="file" onChange={(e) => onChangeFile(e)}/>
                </div>
              <button className="create-modal-btn" onClick={updateMainPageImage} disabled={loading}>Изменить</button>
          </div>
          <div className={`mainPage-on-change-image-container ${isOpenImageUpdateMobile ? "active" : "closing"}`}>
            <button className="modal-close" onClick={() => {setIsOpenImageUpdateMobile(false);
              if (fileInputRef.current) {
                fileInputRef.current.value = null;
              }
            }}>
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
               <div className="setImage-contaimer-modal">
                  <span>Поменять изображение: </span>
                  <a className="href" href={smallSwiper?.[0]?.image_src}>
                    {smallSwiper?.[0]?.image_src}
                  </a>
                  <input ref={fileInputRef} type="file" onChange={(e) => onChangeFile(e)}/>
                </div>
              <button className="create-modal-btn" onClick={updateMainPageImageMobile} disabled={loading}>Изменить</button>
          </div>
          <div className={`mainPage-on-change-image-container ${isOpenImageCreate ? "active" : "closing"}`}>
            <button className="modal-close" onClick={() => {setIsOpenImageCreate(false); 
              if (fileInputRef.current) {
                fileInputRef.current.value = null;
              }
            }}>
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
                <div className="setImage-contaimer-modal">
                  <span>Добавить изображение: </span>
                  <input ref={fileInputRef} type="file" onChange={(e) => onChangeFile(e)}/>
                </div>
            <button className="create-modal-btn" onClick={createMainPageImage} disabled={loading}>Создать</button>
          </div>
          <AuthForm visible={visibleAuth} setVisible={setVisibleAuth}/>
      </>
        );
}