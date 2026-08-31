import React, { useEffect, useState, useRef } from "react";
import { lazy, Suspense } from "react";
const MainComponent = lazy(() => import("../components/MainComponents/MainComponent.jsx"));
import { useNavigate } from "react-router-dom";
import { BASE_URL } from '../config';
import { useLocation } from "react-router-dom";
import Toast from "../components/adminMessage/adminMessage.jsx";
const ParseDelta = React.lazy(() => import('../components/redactor/ParseDelta.jsx'));
import LoadingGif from "../components/loadingGif/LoadingGif.jsx";
import LoadingGifPage from "../components/LoadingGifPage/LoadingGifPage.jsx";
const QuillRedactorBlog = React.lazy(() => import('../components/redactor/QuillRedactorBlog'));
import MetaBtn from "./MetaBtn.jsx";
// import "./styles/BlogPage.css";
import { Helmet } from "react-helmet-async";

export default function BlogPage({ api_adress, setPages, pages, title, description, robots, ld_json, db_id }) {
    const [pageTitle, setPageTitle] = useState("");
    const [image, setImage] = useState("");
    const [toastMessage, setToastMessage] = useState("");
    const [statusCode, setStatusCode] = useState("");
    const [pageId, setPageId] = useState(0);
    const [pageObj, setPageObj] = useState(null); 
    const [loading, setLoading] = useState(false);
    const [pageComponents, setPageComponents] = useState([]);
    const [loadingPage, setLoadingPage] = useState(true);
    const [blogId, setBlogId] = useState(0);
    const [delta, setDelta] = useState("");
    const [previewId, setPreviewId] = useState(0);
    const [ready, setReady] = useState(false);
    const [quillReady, setQuillReady] = useState(false);
    const [deltaReady, setDeltaReady] = useState(false);
    const [mainReady, setMainReady] = useState(false);
    const [firstInteraction, setFirstInteraction] = useState(true);
    const [firstRender, setFirstRender] = useState(true);
    const [hasParams, setHasParams] = useState(false); 
    const [ldJsonObj, setLdJsonObj] = useState("");
    
    const navigate = useNavigate();

    const location = useLocation();
    const [width, setWidth] = useState(window.innerWidth);
  const [isAdmin, setIsAdmin] = useState(false);

  function LoaderSensor({ setLoaded }) {
    useEffect(() => {
    setLoaded(true);
  }, []);

  return null;
  };

  useEffect(() => {
      const checkReady = () => {
        if(quillReady && deltaReady && mainReady && !loadingPage)
        {
          setReady(true);
        }
      };
  
      checkReady();
    }, [quillReady, deltaReady, mainReady, loadingPage]);

    useEffect(() => {
          localStorage.setItem('page', 'blogPage');
        }, []);
  
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
                setBlogId(data.content.content.info[0].id);
                setDelta(data.content.content.info[0].delta);
                setPageTitle(data.content.content.info[0].title);
                setImage(data.content.content.info[0].image_src);
                setPreviewId(data.content.content.info[0].preview_id);
                const sortByOrderId = (arr) => arr.sort((a, b) => a.order_id - b.order_id);
                const sortedComponents = sortByOrderId(data.content.components);
                setPageComponents(sortedComponents);

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
              setFirstRender(false);
             }
           };
           
           fetchMain();
        }, [api_adress]);

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
        
        }, [pageComponents, delta]);

    return(
    <div
      className="blogPage-section">
      {loadingPage ? (
         <LoadingGifPage loading={true}/>
      ) : (
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
          <meta property="og:image" content={image} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={description} />
          <meta name="twitter:image" content={image} />
        </Helmet>
        <div className="blogPage-title-container"
        style={{
        backgroundImage: `url(${image})`
      }}>
            <div className="blogPage-title-text-container">
                <button onClick={() => navigate('/')}>
                    основная
                </button>
                <h1>
                    {pageTitle}
                </h1>
                <div className="blogPage-main-content-container-grid-item-text-container-refs-left">
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
                    <div className="blogPage-main-content-container-grid-item-text-container-refs-left-count-review-container">
                        <span>
                            {0}
                        </span>
                    </div>
                </div>
            </div>
            {isAdmin && (
            <MetaBtn title={title} description={description} robots={robots} ld_json={ld_json} id={db_id}/>
              )}
        </div>
        <div className="blogPage-section-content">
            {isAdmin ? (    <Suspense fallback={<div className="suspense-loading"><LoadingGifPage loading={true}/></div>}>
                             <LoaderSensor setLoaded={setQuillReady}/>
                             <QuillRedactorBlog str={delta} showSaveButton={true} blog_id={blogId} preview_id={previewId} setStrDelta={setDelta}/>
                            </Suspense>
                        ) : (
                            <Suspense fallback={<div className="suspense-loading"><LoadingGifPage loading={true}/></div>}>
                              <LoaderSensor setLoaded={setDeltaReady}/>
                              <ParseDelta desc={delta}/>
                            </Suspense>
                        )}
                        <Suspense fallback={<div className="suspense-loading"><LoadingGifPage loading={true}/></div>}>
                        <LoaderSensor setLoaded={setMainReady}/>
                        <MainComponent pageComponents={pageComponents} setPageComponents={setPageComponents} pageId={pageId} pages={pages} setPages={setPages}/>
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
        </div>
        {ready && <div id="page-ready"></div>}
        </>
      )}
    </div>
    );
}