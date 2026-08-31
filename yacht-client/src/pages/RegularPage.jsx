import React, { useEffect, useState, useRef } from "react";
import { BASE_URL } from '../config';
import LoadingGifPage from "../components/LoadingGifPage/LoadingGifPage.jsx";
import { useLocation } from "react-router-dom";
import Toast from "../components/adminMessage/adminMessage.jsx";
import MainComponent from "../components/MainComponents/MainComponent.jsx";
import { useNavigate } from "react-router-dom";
import LoadingGif from "../components/loadingGif/LoadingGif.jsx";
import AuthForm from "../components/AuthForm/AuthForm.jsx";
import { Helmet } from "react-helmet-async";
import MetaBtn from "./MetaBtn.jsx";

export default function RegularPage({api_adress="", setPages=null, pages=[], title="", description="", robots="", ld_json="", db_id=0}) {
    const navigate = useNavigate();
    const [pageName, setPageName] = useState("");
    const [pageId, setPageId] = useState(0);
    const [pageComponents, setPageComponents] = useState([]);
    const [loadingPage, setLoadingPage] = useState(false);
    const [loading, setLoading] = useState(false);
    const [statusCode, setStatusCode] = useState(0);
    const [toastMessage, setToastMessage] = useState("");
    const [firstRender, setFirstRender] = useState(true);
    const [firstInteraction, setFirstInteraction] = useState(true);
    const [pageImage, setPageImage] = useState("");
    const [isOpenImage, setIsOpenImage] = useState(false);
    const [regularPageId, setRegularPageId] = useState(0);
    const [hasParams, setHasParams] = useState(false);

    const location = useLocation();
    const [width, setWidth] = useState(window.innerWidth);
    const [isAdmin, setIsAdmin] = useState(false);
    const [ready, setReady] = useState(false); 
    const [ldJsonObj, setLdJsonObj] = useState("");

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

    const updateRegularPageImage = async (e) => {
      const file = e.target.files[0];
      
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
              newImageSrc = pageImage;
            }

                const res = await fetch(`${BASE_URL}/update-regular-page-image`,{
                  method: "POST",
                  headers: {
                  "Content-Type": "application/json"
                  },
                  credentials: "include",
                  body: JSON.stringify({
                  id: regularPageId,
                  image_src: newImageSrc
                  })
                });
          
                if (res.status === 200) {
                  setStatusCode(res.status);
                  setToastMessage("Изображение обновлено!");
                  setPageImage(newImageSrc);
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
              }
    }
  
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

    const [visibleAuth, setVisibleAuth] = useState(false);

    useEffect(() => {
          const checkReady = () => {
            if(!loadingPage)
            {
              setReady(true);
            }
          };
      
          checkReady();
        }, [loadingPage]);

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
              setToastMessage("Элемент с таким ключом уже сущетсвует!");
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
              setPageName(data.content.content.info[0].title);
              setPageImage(data.content.content.info[0].image_src);
              setRegularPageId(data.content.content.info[0].id);
              setPageId(data.content.obj.id);

              try {
                // Преобразуем строку в объект
                setLdJsonObj(JSON.parse(ld_json));
              } catch (e) {}

              if (/\?|%2B|\+/.test(location.search)) {
                setHasParams(true);
              } else {
                setHasParams(false);
              }
    
              const sortByOrderId = (arr) => arr.sort((a, b) => a.order_id - b.order_id);
              const sortedComponents = sortByOrderId(data.content.components);

              console.log(sortedComponents);

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
                         localStorage.setItem('page', 'regularPage');
                       }, []);

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
    
    }, [pageComponents]);

    if(loadingPage)
    {
        return(
            <div className="regularPage-loading-container">
                <LoadingGifPage loading={true}/>
            </div>
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
        <script type="application/ld+json">
            {ldJsonObj}
        </script>
        <link rel="canonical" href={`https://vip-boat.ru${api_adress}`}/>
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Vip Boat" />
        <meta property="og:locale" content="ru_RU" />
        <meta property="og:url" content={`https://vip-boat.ru${api_adress}`}/>
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={pageImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={pageImage} />
      </Helmet>
      <div className="regularPage-section">
             <div className="regularPage-title-container" style={{
                background: `
                    linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)),
                    url(${pageImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
              }}>
                {isAdmin &&(
                  <button className="regularPage-on-change-image-btn" onClick={() => {isOpenImage ? setIsOpenImage(false) : setIsOpenImage(true)}}>
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
                {isAdmin &&(
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
            <div className="regularPage-title-text-container">
                <button onClick={() => navigate('/')}>
                    основная
                </button>
                <h1>
                    {pageName}
                </h1>
            </div>
            {isAdmin && (
                                <MetaBtn title={title} description={description} robots={robots} ld_json={ld_json} id={db_id}/>
                              )}
        </div>
        <div className="regularPage-main-content">
            <MainComponent pageComponents={pageComponents} setPageComponents={setPageComponents} pageId={pageId} pages={pages} setPages={setPages}/>
        </div>
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
            <div className={`regularPage-on-change-image-container ${isOpenImage ? "active" : "closing"}`}>
            <button className="modal-close" onClick={() => setIsOpenImage(false)}>
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
                  <a className="href" href={pageImage}>{pageImage}</a>
                  <input type="file" onChange={(e) => updateRegularPageImage(e)}/>
                </div>
          </div>
        </div>
      </>
    );
}