import React, { useEffect, useState, useRef } from "react";
// import "./styles/NewsPage.css";
import { useNavigate, Link } from "react-router-dom";
import { BASE_URL } from '../config';
import { useLocation } from "react-router-dom";
import { lazy, Suspense } from 'react';
import MainComponent from "../components/MainComponents/MainComponent.jsx";
const ModalManager = lazy(() => import('../components/modalManager/ModalManager.jsx'));
import Toast from "../components/adminMessage/adminMessage.jsx";
import LoadingGif from "../components/loadingGif/LoadingGif.jsx";
import LoadingGifPage from "../components/LoadingGifPage/LoadingGifPage.jsx";
import { button } from "framer-motion/client";
import AuthForm from "../components/AuthForm/AuthForm.jsx";
import { Helmet } from "react-helmet-async";
import MetaBtn from "./MetaBtn.jsx";

export default function NewsPage({ api_adress, setPages, pages, title, description, robots, ld_json, db_id }) {
    const navigate = useNavigate();
    const itemsPerPage = 9;
    const [blogs, setBlogs] = useState([]);
    const [gridCols, setGridCols] = useState(3);
    const [showRefs, setShowRefs] = useState(false);
    const [pageTitle, setPageTitle] = useState("");
    const [pageComponents, setPageComponents] = useState([]);
    const [pageId, setPageId] = useState(0);
    const [pageObj, setPageObj] = useState(null); 
    const [pagesAmount, setPagesAmount] = useState([]);
    const [loading, setLoading] = useState(false);
    const [ids, setIds] = useState([]);
    const [currPage, setCurrPage] = useState(1);
    const [hasParams, setHasParams] = useState(false);

    const [templateType, setTemplateType] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [handlerType, setHandlerType] = useState("");
    const [toastMessage, setToastMessage] = useState("");
    const [statusCode, setStatusCode] = useState("");
    const [itemName, setItemName] = useState("");
    const [itemId, setItemId] = useState(0);
    const [itemAdress, setItemAdress] = useState("");
    const [first, setFirst] = useState(true);
    const [itemGroupId, setItemGroupId] = useState(0);
    const [itemDesc, setItemDesc] = useState("");
    const [itemImage, setItemImage] = useState("");
    const [loadingPage, setLoadingPage] = useState(true);
    const [itemDate, setItemDate] = useState("");
    const [itemBlogId, setItemBlogId] = useState(0);
    const [itemPageId, setItemPageId] = useState(0);
    const [ready, setReady] = useState(false);
    const [firstInteraction, setFirstInteraction] = useState(true);
    const [firstRender, setFirstRender] = useState(true);
    const [ldJsonObj, setLdJsonObj] = useState("");

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

    const checkPath = (path) => {
      if (/^https?:\/\//i.test(path)) {
        return false;
      } 
      else if (path.startsWith("/")) {
        return true;
      }
    };

    useEffect(() => {
                   localStorage.setItem('page', 'newsPage');
                 }, []);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

    const [visibleAuth, setVisibleAuth] = useState(false);

    const handleNavigate = (path) => {
      if (/^https?:\/\//i.test(path)) {
        window.open(path, "_blank");
      } 
      else if (path.startsWith("/")) {
        navigate(path);
      }
    };
    
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

            setPageObj(data.content.obj);
            setPageId(data.content.obj.id);
            setPageTitle(data.content.content.info[0].title);
            setItemGroupId(data.content.content.info[0].id);
            const sorted = data.content.content.items.items.sort(
              (a, b) => new Date(b.date) - new Date(a.date)
            );

            setBlogs(sorted);

            try {
              // Преобразуем строку в объект
              setLdJsonObj(JSON.parse(ld_json));
            } catch (e) {}

            if (/\?|%2B|\+/.test(location.search)) {
              setHasParams(true);
            } else {
              setHasParams(false);
            }

            if(data.content.content.items.ids.length > 0)
            {
              const pages = Math.ceil(
              data.content.content.items.ids.length / itemsPerPage
              );
              const pagination = Array.from({ length: pages }, (_, i) => i + 1);
              setPagesAmount(pagination);
            }
            setIds(data.content.content.items.ids);
            const sortByOrderId = (arr) => arr.sort((a, b) => a.order_id - b.order_id);
            const sortedComponents = sortByOrderId(data.content.components);
            setPageComponents(sortedComponents);
           } 
         } catch (err) {
         }
         finally{
          setLoadingPage(false); 
          setFirstRender(false);
         }
       };
       
       fetchMain();
    }, [api_adress]);

    useEffect(() => {
      if(!loadingPage)
      {
        loadNews();
      }
    }, [currPage]);

    useEffect(() => {
    const updateGridCols = () => {
      const width = window.innerWidth;
      if (width < 850) {
        setGridCols(1);
      } else if (width > 850) {
        setGridCols(3);
      }
    };

    updateGridCols();
    window.addEventListener("resize", updateGridCols);

    return () => window.removeEventListener("resize", updateGridCols);
  }, []);

  useEffect(() => {
        const checkReady = () => {
          if(!loadingPage)
          {
            setReady(true);
          }
        };
    
        checkReady();
      }, [loadingPage]);

  const addProductItem = async () => {
    if(api_adress == "/cruises")
    {
      setTemplateType("createCruiseItem");
    }
    else
    {
      setTemplateType("createNewsItem");
    }
    setHandlerType("addBlog");
    setFirst(false);
    setOpenModal(true);
  }

  const handlers = {
  addBlog: ({ newItem }) => {
    setBlogs(prev => [newItem, ...prev]);
  },

  updateBlog: ({ id, updatedItem }) => {

  setBlogs(prev =>
    prev.map(item => (item.id === id ? { ...item, ...updatedItem } : item))
    );
  }
};

const loadNews = async () => {
  const offset = (currPage - 1) * itemsPerPage;
  const idsToSearch = ids.slice(offset, offset + itemsPerPage);
  
  try{
    setLoadingPage(true);
        const res = await fetch(`${BASE_URL}/get-blogs-with-ids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ids: idsToSearch
        })
      });
  
      if (res.status === 200) {
              const data = await res.json();
              const items_arr = data.content;
              await loadImages(items_arr);
              setBlogs(items_arr);
            }
      } catch (err) {
      }
      finally{
       setLoadingPage(false); 
      }
}

const removeProduct = (id) => {
  let removedItem;
  setBlogs(prev => {
    const updated = prev.filter(item => {
      if (item.id === id) removedItem = item;
      return item.id !== id;
    });
    return updated;
  });

  setPages(prev => {
    const updated = prev.filter(item => {
      if (item.id === id) removedItem = item;
      return item.id !== id;
    });
    return updated;
  });
}

const updateNewsItem = async (item) =>{
    setItemAdress(item.api_adress);
    setItemDesc(item.description);
    setItemPageId(item.page_id);
    setItemId(item.id);
    setItemImage(item.image_src);
    setItemName(item.title);
    setItemDate(item.date);
    setItemBlogId(item.blog_page_id);
    if(api_adress === "/cruises")
    {
      setTemplateType("updateCruisesItem");
    }
    else{
      setTemplateType("updateNewsItem");
    }
    setHandlerType("updateBlog");
    setOpenModal(true);
  }

const deleteNewsItem = async (page_id, item_id) => {
  try {
    setLoading(true);
      const res = await fetch(`${BASE_URL}/delete-page/${page_id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      }, credentials: "include",
    });

      if (res.status === 200) {
        try {
            const res2 = await fetch(`${BASE_URL}/delete-news-preview/${item_id}`, {
            method: "DELETE",
            headers: {
            "Content-Type": "application/json",
            }, credentials: "include",
          });

        if (res2.status === 200) {
            removeProduct(item_id);
            setStatusCode(res2.status);
            setToastMessage("Элемент успешно удален!");
        } else if (res2.status === 404) {
            setStatusCode(res2.status);
            setToastMessage("Элемент не найден, таблица пуста!");
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
};

const onDeletePage = async () => {
        try{
            setLoading(true);
            const res_page = await fetch(`${BASE_URL}/delete-page/${pageId}`, {
                method: "DELETE",
                headers: {
                "Content-Type": "application/json",
                }, credentials: "include",
            });

             if (res_page.status === 200) {
              setStatusCode(res_page.status);
              setToastMessage("Страница удалена успешно!");
              navigate("/");
              } else if (res_page.status === 404) {
              setStatusCode(res_page.status);
              setToastMessage("Внутренняя ошибка сервера!");
              } else if (res_page.status === 500) {
              setStatusCode(res_page.status);
              setToastMessage("Внутренняя ошибка сервера!");
              } else if (res_page.status === 401) {
            setStatusCode(res_page.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          } else {
              setStatusCode(res_page.status);
              setToastMessage("Произошла непредвиденная ошибка!");
              }
        }
        catch(err)
        {
        }
        finally{
            setLoading(false);
        }
    }

useEffect(() => {
    window.scrollTo(0, 0);
  }, [blogs]);

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

}, [pageComponents, blogs]);

function FormatDayAndMonth({ date }) {
  if (!date) return null;

  const parsedDate = typeof date === "string" ? new Date(date) : date;

  const day = parsedDate.getDate();
  const month = parsedDate.toLocaleString("ru-RU", { month: "short" });

  return (
    <>
      <span className="newsPage-main-content-container-date-span-1">
        {day}
      </span>
      <span className="newsPage-main-content-container-date-span-2">
        {month}
      </span>
    </>
  );
}
        return(
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
            <meta property="og:image" content="https://storage.yandexcloud.net/vip-boat-images/аренда-яхты-спб2.jpg" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content="https://storage.yandexcloud.net/vip-boat-images/аренда-яхты-спб2.jpg" />
          </Helmet>
          <section className="newsPage-container">
            <div className="newsPage-title-container">
                <h1 className="newsPage-title-container-title">{pageTitle}</h1>
                <div className="newsPage-title-container-routing">
                    <button onClick={() => navigate('/')}>
                        Домой
                    </button>
                    <span>
                        /
                    </span>
                    {api_adress == "/cruises" ? (
                      <span>
                        Круизы
                      </span>
                    ) : (
                      <span>
                        Блог
                      </span>
                    )}
                </div>
                {isAdmin && api_adress !== "/news" &&(
                                                          <button className="regularPage-on-delete-btn" onClick={() => {
                                                          if (window.confirm("Вы уверены, что хотите безвозвратно удалить страницу (удаление страницы не предусматривает удаление контента на ней)?")) {onDeletePage()}}}>
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
            <div className="newsPage-main-content-container">
              {loadingPage === true ? (
                 <LoadingGifPage loading={true}/>
              ): (
                <>
                <div 
                 className={`newsPage-main-content-container-grid-${gridCols}`}>
                    {isAdmin && (
                        <div className={`newsPage-main-content-container-grid-item`}>
                    <button className="newsPage-add-btn-null" onClick={() => addProductItem()}>
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
                    { blogs.map((item, id) => (
                        <div key={id} className={`newsPage-main-content-container-grid-item`}>
                 <div className="newsPage-main-content-container-grid-item-image-container">
                  {isAdmin && (
                          <button className="newsPage-main-container-on-change" onClick={() => updateNewsItem(item)}>
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
                  {isAdmin && (
                          <button className="newsPage-main-container-on-delete" onClick={() => {
                        if (window.confirm("Вы уверены, что хотите безвозвратно удалить элемент?")) {
                        deleteNewsItem(item.page_id, item.id);
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
                    {checkPath(item.api_adress) ? (
                          <Link className="show-blog-btn" to={item.api_adress}>
                          <img loading="lazy" src={item.image_src} alt={item.title || "blog image"} />
                          <div class="dots">
                          <span></span>
                          <span></span>
                          <span></span>
                          </div>
                          </Link>
                        ) : (
                          <a href={item.api_adress} target="_blank" rel="noopener noreferrer">
                            <img loading="lazy" src={item.image_src} alt={item.title || "blog image"} />
                          <div class="dots">
                          <span></span>
                          <span></span>
                          <span></span>
                          </div>
                          </a>
                        )}
                 <div className={`newsPage-main-content-container-date ${api_adress === "/cruises" ? ("hidden") : ("")}`}>
                  <FormatDayAndMonth date={item.date}/>
                 </div>
                 <button className="newsPage-main-content-container-btn" onClick={() => navigate('/')}>
                    основная
                 </button>
                 </div>
                 <div className="newsPage-main-content-container-grid-item-text-container">
                    <p className="newsPage-main-content-container-grid-item-text-container-title">{item.title}</p>
                    <div className="newsPage-main-content-container-grid-item-text-container-refs">
                        <div className={`newsPage-main-content-container-grid-item-text-container-refs-left ${api_adress === "/cruises" ? ("hidden") : ("")}`}>
                            <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 64.000000 64.000000"
                            preserveAspectRatio="xMidYMid meet">

                            <g transform="translate(0.000000,64.000000) scale(0.100000,-0.100000)">
                            <path d="M60 360 l0 -180 50 0 50 0 0 -51 0 -51 64 51 64 51 146 0 146 0 0
                            180 0 180 -260 0 -260 0 0 -180z m480 0 l0 -140 -134 0 c-129 0 -136 -1 -164
                            -25 -37 -31 -42 -31 -42 0 0 23 -3 25 -50 25 l-50 0 0 140 0 140 220 0 220 0
                            0 -140z"/>
                            </g>
                            </svg>
                            <div className="newsPage-main-content-container-grid-item-text-container-refs-left-count-review-container">
                                <span>
                                    {item.reviews_amount}
                                </span>
                            </div>
                        </div>
                        <button className="newsPage-main-content-container-grid-item-text-container-refs-right"
                            onMouseEnter={() => setShowRefs(true)}
                            onMouseLeave={() => setShowRefs(false)}
                        >
                        <div className={`newsPage-main-content-container-grid-item-text-container-refs-right-hidden-refs ${showRefs ? "active" : ""}`}>
                            <button className="refs-1"> 
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
                      <button className="refs-2">
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
                      <button className="refs-4">
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

                             <svg className="newsPage-main-content-container-grid-item-text-container-refs-right-svg" version="1.0" xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 64.000000 64.000000"
                        preserveAspectRatio="xMidYMid meet">

                        <g transform="translate(0.000000,64.000000) scale(0.100000,-0.100000)">
                        <path d="M151 606 c-87 -48 -50 -186 50 -186 25 0 76 26 81 41 2 7 27 -3 64
                        -26 l61 -38 -15 -29 c-9 -19 -12 -43 -8 -66 5 -37 5 -37 -62 -74 l-68 -37 -32
                        32 c-28 27 -39 32 -82 32 -43 0 -54 -5 -82 -33 -28 -28 -33 -39 -33 -82 0 -43
                        5 -54 33 -82 28 -28 39 -33 82 -33 40 0 54 5 79 29 17 16 34 44 37 63 5 28 16
                        38 81 74 l74 41 36 -17 c48 -23 99 -14 138 25 25 26 30 38 30 80 0 43 -5 54
                        -33 82 -30 30 -38 33 -95 33 -56 0 -71 5 -125 38 -34 21 -62 44 -62 52 0 69
                        -86 116 -149 81z m89 -46 c11 -11 20 -29 20 -40 0 -26 -34 -60 -60 -60 -26 0
                        -60 34 -60 60 0 11 9 29 20 40 11 11 29 20 40 20 11 0 29 -9 40 -20z m315
                        -185 c50 -49 15 -135 -55 -135 -41 0 -80 39 -80 80 0 19 9 40 25 55 15 16 36
                        25 55 25 19 0 40 -9 55 -25z m-360 -180 c33 -32 33 -78 0 -110 -49 -50 -135
                        -15 -135 55 0 41 39 80 80 80 19 0 40 -9 55 -25z"/>
                        </g>
                        </svg>
                        </button>
                    </div>
                    <p className="newsPage-main-content-container-grid-item-text-container-description">
                        {item.description}
                    </p>
                    <button className="newsPage-main-content-container-grid-item-text-container-btn" onClick={() => handleNavigate(item.api_adress)}>
                        показать больше
                    </button>
                 </div>
                 </div>
                    ))}
                 </div>
                 <div className="pagination-news">
                  {pagesAmount.length > 1 && (
                    <>
                    {pagesAmount.map((item) => (
                  <button className={`news-pagination-btn ${item === currPage ? "active" : ""}`} onClick={() => setCurrPage(item)}>
                    <span>{item}</span>
                  </button>
                 ))}
                    </>
                  )}
                 </div>
                </>
              )}
            </div>
            <MainComponent pageComponents={pageComponents} setPageComponents={setPageComponents} pageId={pageId} pages={pages} setPages={setPages}/>
            <Suspense fallback={<div className="suspense-loading"><LoadingGifPage loading={true}/></div>}>
            <ModalManager type={templateType} isOpen={openModal} onClose={() => {setOpenModal(false)}} onCreated={handlers[handlerType]} setToastMessage={setToastMessage} 
                                        setStatusCode={setStatusCode} item_name={itemName} item_id={itemId} item_adress={itemAdress} setType={setTemplateType}
                                        page_id={pageId} first_element={false} component_group_id={itemGroupId}
                                        item_desc={itemDesc} item_image={itemImage} setLoading={setLoading} loading={loading} item_date={itemDate} blog_page_id={itemBlogId} setPages={setPages} item_page_id={itemPageId} pages={pages}/>
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
                                  {ready && <div id="page-ready"></div>}
            {isAdmin && (
              <MetaBtn title={title} description={description} robots={robots} ld_json={ld_json} id={db_id}/>
            )}
        </section>
          </>
    );
}