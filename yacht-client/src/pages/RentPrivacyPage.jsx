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


export default function RentPrivacyPage({api_adress="", setPages=null, pages=[],  title="", description="", robots="", ld_json="", db_id=0})
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

    useEffect(() => {
                           localStorage.setItem('page', 'rentPrivacyPage');
                         }, []);

    function LoaderSensor({ setLoaded }) {
        useEffect(() => {
        setLoaded(true);
      }, []);
    
      return null;
    };

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
            const res = await fetch(`${BASE_URL}/get-rent-policy-func`);
             
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
            <title>Условия заказа</title>
            <link rel="canonical" href={`https://vip-boat.ru/rent-policy`}/>
            <meta name="description" content="Условия заказа vip-boat.ru" />
            <meta name="robots" content="index, follow"/>
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="Vip Boat" />
            <meta property="og:locale" content="ru_RU" />
            <meta property="og:url" content={`https://vip-boat.ru/rent-policy`}/>
            <meta property="og:title" content="Условия заказа" />
            <meta property="og:description" content="Условия заказа vip-boat.ru" />
            <meta property="og:image" content="https://storage.yandexcloud.net/vip-boat-images/аренда-яхты-спб2.jpg" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Условия заказа" />
            <meta name="twitter:description" content="Условия заказа vip-boat.ru" />
            <meta name="twitter:image" content="https://storage.yandexcloud.net/vip-boat-images/аренда-яхты-спб2.jpg" />
        </Helmet>
        <div className="regularPage-section">
             <div className="regularPage-title-container">
            <div className="regularPage-title-text-container">
                <button onClick={() => navigate('/')}>
                    основная
                </button>
                <h1>
                    Условия заказа
                </h1>
            </div>
        </div>
        <div className="privacyPage-main-content">
           {isAdmin ? (    <Suspense fallback={<div className="suspense-loading"><LoadingGifPage loading={true}/></div>}>
                                        <LoaderSensor setLoaded={setQuillReady}/>
                                        <QuillRedactor str={delta} showSaveButton={true} updatePrivacy={true} comp_name={"const_rent_policy"}/>
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