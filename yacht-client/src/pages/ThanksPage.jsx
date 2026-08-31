import React, { useEffect, useState, useRef } from "react";
// import "./styles/ErrorPage.css";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function ThanksPage() {
    const navigate = useNavigate();

    return(
      <>
        <Helmet>
          <title>спасибо</title>
          <meta name="robots" content="noindex, nofollow" />
          <meta name="description" content="страница благодарности" />
          <link rel="canonical" href={`https://vip-boat.ru/thanks`}/>
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Vip Boat" />
          <meta property="og:locale" content="ru_RU" />
          <meta property="og:url" content={`https://vip-boat.ru/thanks`}/>
          <meta property="og:title" content="спасибо" />
          <meta property="og:description" content="страница благодарности" />
          <meta property="og:image" content="https://storage.yandexcloud.net/vip-boat-images/аренда-яхты-спб2.jpg" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="спасибо" />
          <meta name="twitter:description" content="страница благодарности" />
          <meta name="twitter:image" content="https://storage.yandexcloud.net/vip-boat-images/аренда-яхты-спб2.jpg" />
        </Helmet>
        <div className="errorPage-container">
            <div className="errorPage-container-content">
                <div className="errorPage-container-content-notfound">
                <span className="errorPage-container-content-code thanks">
                    спасибо
                </span>
                <span className="errorPage-container-content-text thanks">
                    за заявку
                </span>
                </div>
                <span className="errorPage-container-content-text-desc">
                    благодарим за оставленную заявку!
                </span>
                <span className="errorPage-container-content-text-desc-2">
                   ВАША ЗАЯВКА БЫЛА УСПЕШНО ОФОРМЛЕНА, ПЕРЕЙТИ НА ГЛАВНУЮ СТРАНИЦУ?
                </span>
                <button class="mainPage-order-btn thanks" onClick={() => navigate("/")}>на главную</button>
            </div>
        </div>
      </>
    );
}