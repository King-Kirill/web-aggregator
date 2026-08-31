import React, { useEffect, useState, useRef } from "react";
// import "./styles/ErrorPage.css";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
const PageTemplates = lazy(() => import("../components/pageTemplates/PageTemplates.jsx"));
import { useFormState } from "react-dom";
import { BASE_URL } from '../config';
import { button } from "framer-motion/client";
const ModalManager = lazy(() => import("../components/modalManager/ModalManager.jsx"));
import Toast from "../components/adminMessage/adminMessage.jsx";
import LoadingGif from "../components/loadingGif/LoadingGif.jsx";
import LoadingGifPage from "../components/LoadingGifPage/LoadingGifPage.jsx";
import { Helmet } from "react-helmet-async";

export default function ErrorPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const location = useLocation();
    const adress = location.pathname;
    const [width, setWidth] = useState(window.innerWidth);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
              localStorage.setItem('page', 'errorPage');
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
  
    const [openModal, setOpenModal] = useState(false);
    const [openTemplates, setOpenTemplates] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [statusCode, setStatusCode] = useState(null);
    const [templateType, setTemplateType] = useState("");
    const [loading, setLoading] = useState(false);
    const [componentName, setComponentName] = useState("");

    const changeSearch = (e) => {
        setSearch(e.target.value);
    }

    const onSelectedTemplate = async (name) => {
    setOpenTemplates(false);
    setOpenModal(true);
    setTemplateType(name);
    setComponentName(name);
  }

  const handleCloseComponent = async () => {
    setOpenTemplates(false);
    }

    return(
      <>
        <Helmet>
          <title>404</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <section className="errorPage-container">
            <div className="errorPage-container-content">
                <div className="errorPage-container-content-notfound">
                <span className="errorPage-container-content-code">
                    404
                </span>
                <span className="errorPage-container-content-text">
                    NOT FOUND
                </span>
                </div>
                <span className="errorPage-container-content-text-desc">
                    РАЗОЧАРОВЫВАЕТ, НЕ ТАК ЛИ?
                </span>
                <span className="errorPage-container-content-text-desc-2">
                    ПО ЭТОМУ АДРЕСУ НИЧЕГО НЕ БЫЛО НАЙДЕНО, ПОПРОБУЕТЕ ПОИСК?
                </span>
                <div className="errorPage-container-input">
                    <input value={search} type="text" placeholder="Поиск товаров" onChange={changeSearch}/>
                    {search !== "" && (
                        <button className="errorPage-container-clear-button" onClick={() => {setSearch("")}}>
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
                    )}
                    {search !== "" && (
                        <div className="errorPage-container-line">
                        </div>
                    )}
                    <button className="errorPage-search-btn" onClick={() => {navigate(`/search?${search}`);}}>
                        <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                            width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
                                preserveAspectRatio="xMidYMid meet">

                                <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                                    fill="#000000" stroke="none">
                                    <path d="M1940 5079 c-493 -25 -971 -242 -1334 -605 -295 -295 -496 -674 -570
                                    -1075 -168 -910 277 -1807 1104 -2228 454 -231 994 -284 1489 -145 177 50 429
                                    163 557 252 l59 40 605 -602 c546 -545 611 -606 670 -635 305 -147 651 109
                                    591 437 -24 130 -23 129 -680 786 l-608 608 82 161 c138 272 201 499 226 802
                                    44 550 -154 1119 -535 1533 -193 211 -404 365 -661 484 -154 71 -211 92 -354
                                    128 -214 54 -401 71 -641 59z m355 -684 c555 -91 1005 -512 1133 -1060 108
                                    -461 -25 -943 -353 -1284 -270 -280 -622 -431 -1007 -431 -371 0 -721 146
                                    -987 411 -196 197 -323 433 -383 712 -31 146 -31 399 1 546 82 384 296 696
                                    621 906 166 108 344 172 570 208 66 11 323 6 405 -8z"/>
                                </g>
                           </svg>
                    </button>
                </div>
                {isAdmin && (
                    <button className="open-templates-404" onClick={() => {setOpenTemplates(true)}}>Создать страницу</button>
                )} 
            </div>
            <Suspense fallback={<div className="suspense-loading"><LoadingGifPage loading={true}/></div>}>
            <PageTemplates onSelect={onSelectedTemplate} onClose={handleCloseComponent} showTemplates={openTemplates}/>
            </Suspense>
            <Suspense fallback={<div className="suspense-loading"><LoadingGifPage loading={true}/></div>}>
            <ModalManager type={templateType} isOpen={openModal} onClose={() => {setOpenModal(false)}} setToastMessage={setToastMessage} 
                    setStatusCode={setStatusCode} setLoading={setLoading} component_name={componentName} item_adress={adress}/>
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
        </section>
      </>
    );
}