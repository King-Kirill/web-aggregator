import React, { useEffect, useState, useRef } from "react";
// import "./styles/ConfirmPage.css";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { BASE_URL } from '../config';
import { div } from "framer-motion/client";
import { Helmet } from "react-helmet-async";

export default function ConfirmPage() {
    const { search } = useLocation();
    const query = new URLSearchParams(search);

    const token = query.get("token");
    const [confirmed, setConfirmed] = useState(false);

     useEffect(() => {
    const fetchConfirm = async () => {
    try {
      const res = await fetch(`${BASE_URL}/confirm_email_review?token=${encodeURIComponent(token)}`);

      if (res.status === 200) {
        setConfirmed(true);
      }
    } catch (err) {
    }
  };

  fetchConfirm();
  }, []);

    return(
        <>
        <Helmet>
            <title>Подтверждение личности</title>
            <meta name="robots" content="noindex, nofollow"/>
        </Helmet>
        <section className="confirmPage-container">
            {confirmed ? (
                <div className="confirmPage-container-content">
                    <span className="confirmPage-container-content-first">Ваш Email успешно подвержден, спасибо за ваш отзыв!</span>
                    <span className="confirmPage-container-content-second">Можете закрыть эту страницу</span>
                </div>
            ) : (
                <div className="confirmPage-container-content">
                    <span className="confirmPage-container-content-first">Такого токена не существует, попробуйте отправить отзыв повторно!</span>
                    <span className="confirmPage-container-content-second">Можете закрыть эту страницу</span>
                </div>
            )}
        </section>
        </>
    );
}