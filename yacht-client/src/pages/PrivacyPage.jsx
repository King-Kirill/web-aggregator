import React, { useEffect, useState, useRef } from "react";
import { lazy, Suspense } from "react";
import { BASE_URL } from '../config';
import LoadingGifPage from "../components/LoadingGifPage/LoadingGifPage.jsx";
import { useLocation } from "react-router-dom";
import Toast from "../components/adminMessage/adminMessage.jsx";
import { useNavigate } from "react-router-dom";
import LoadingGif from "../components/loadingGif/LoadingGif.jsx";
import AuthForm from "../components/AuthForm/AuthForm.jsx";
import { Helmet } from "react-helmet-async";

const ParseDelta = React.lazy(() => import('../components/redactor/ParseDelta.jsx'));
const QuillRedactor = React.lazy(() => import('../components/redactor/QuillRedactor'));


export default function PrivacyPage({api_adress="", setPages=null, pages=[],  title="", description="", robots="", ld_json="", db_id=0})
{
    const navigate = useNavigate();
    const [statusCode, setStatusCode] = useState(0);
    const [toastMessage, setToastMessage] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [delta, setDelta] = useState("");
    const [loadingPage, setLoadingPage] = useState(false);
    const [quillReady, setQuillReady] = useState(false);
    const [deltaReady, setDeltaReady] = useState(false);

    const location = useLocation();

    function LoaderSensor({ setLoaded }) {
        useEffect(() => {
        setLoaded(true);
      }, []);
    
      return null;
    };

    useEffect(() => {
                     localStorage.setItem('page', 'privacyPage');
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
        const fetchMain = async () => {
            try {
            setLoadingPage(true); 
            const res = await fetch(`${BASE_URL}/get-privacy-policy-func`);
             
            if (res.status === 200) {
                const data = await res.json();
        
                setDelta(data.content);
            }
        } catch (err) {
        }
        finally{
            setLoadingPage(false); 
        }
        }
               
        fetchMain();
        }, [api_adress]);

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
            <title>Политика конфиденциальности</title>
            <link rel="canonical" href={`https://vip-boat.ru/privacy-policy`}/>
            <meta name="description" content="Политика конфиденциальности vip-boat.ru" />
            <meta name="robots" content="index, follow"/>
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="Vip Boat" />
            <meta property="og:locale" content="ru_RU" />
            <meta property="og:url" content={`https://vip-boat.ru/privacy-policy`}/>
            <meta property="og:title" content="Политика конфиденциальности" />
            <meta property="og:description" content="Политика конфиденциальности vip-boat.ru" />
            <meta property="og:image" content="https://storage.yandexcloud.net/vip-boat-images/аренда-яхты-в-Санкт-Петербурге.jpg" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Политика конфиденциальности" />
            <meta name="twitter:description" content="Политика конфиденциальности vip-boat.ru" />
            <meta name="twitter:image" content="https://storage.yandexcloud.net/vip-boat-images/аренда-яхты-в-Санкт-Петербурге.jpg" />
        </Helmet>
        <div className="regularPage-section">
             <div className="regularPage-title-container">
            <div className="regularPage-title-text-container">
                <button onClick={() => navigate('/')}>
                    основная
                </button>
                <h1>
                    Политика конфиденциальности
                </h1>
            </div>
        </div>
        <div className="privacyPage-main-content">
           {isAdmin ? (    <Suspense fallback={<div className="suspense-loading"><LoadingGifPage loading={true}/></div>}>
                                        <LoaderSensor setLoaded={setQuillReady}/>
                                        <QuillRedactor str={delta} showSaveButton={true} updatePrivacy={true} comp_name={"const_privacy_policy"}/>
                                       </Suspense>
                                   ) : (
                                       <Suspense fallback={<div className="suspense-loading"><LoadingGifPage loading={true}/></div>}>
                                         <LoaderSensor setLoaded={setDeltaReady}/>
                                         <ParseDelta desc={delta}/>
                                       </Suspense>
                                   )}
        </div>
        </div>
        </>
    );
}