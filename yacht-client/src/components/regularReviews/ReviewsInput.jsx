import React, { useEffect, useState, useRef, useContext } from 'react';
import "./reviewsInput.css"
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { BASE_URL } from '../../config';
import AuthForm from "../AuthForm/AuthForm.jsx";
import LoadingGif from '../loadingGif/LoadingGif.jsx';

export default function ReviewsInput({reviewsAmount, group_id=0, setStatusCode=null, setToastMessage=null}){
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

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

    const [text, setText] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [rating, setRating] = useState(0);   
    const [hoveredStar, setHoveredStar] = useState(0);
    const [loading, setLoading] = useState(0);
    const stars = [1, 2, 3, 4, 5];
    const [visibleAuth, setVisibleAuth] = useState(false);

    const handleCreateReviewAdmin = async () => {
      try {
            if(rating === 0){
              setStatusCode(422);
              setToastMessage("Задайте оценку!");
              return;
            }

            if(text === ""){
              setStatusCode(422);
              setToastMessage("Заполните поле текст!");
              return;
            }

            if(name === ""){
              setStatusCode(422);
              setToastMessage("Заполните поле имя!");
              return;
            }
  
            setLoading(true);
            const res = await fetch(`${BASE_URL}/create-regular-review-admin`,{
                method: "POST",
                headers: {
                "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                ip_adress: "",
                group_id: group_id,
                text: text,
                rating: rating,
                order_id: 1,
                user_name: name,
                email: email
                })
              });
        
              if (res.status === 200) {
                setStatusCode(res.status);
                setToastMessage("Отзыв успешно добавлен, можете перзагрузить страницу!");
              } else if (res.status === 404) {
                setStatusCode(res.status);
                setToastMessage("Таблица пуста!");
              } else if (res.status === 422) {
                setStatusCode(res.status);
                setToastMessage("Ошибка ввода! Обратите внимание: в поле имя не должно быть цифр и специальных символов. Разрешенные почтовые домены: mail.ru, yandex.ru, gmail.com");
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
        
            } catch (err) {
            }
            finally{
          setLoading(false);
        }
    }

    const handleCreateReview = async () => {
      try {
        const url = window.location.href; 
        
            if(rating === 0){
              setStatusCode(422);
              setToastMessage("Задайте оценку!");
              return;
            }

            if(text === ""){
              setStatusCode(422);
              setToastMessage("Заполните поле текст!");
              return;
            }

            if(name === ""){
              setStatusCode(422);
              setToastMessage("Заполните поле имя!");
              return;
            }
    
            if(email === ""){
              setStatusCode(422);
              setToastMessage("Оставьте вашу почту!");
              return;
            }
            setLoading(true);
            const res = await fetch(`${BASE_URL}/create-regular-review`,{
                method: "POST",
                headers: {
                "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                ip_adress: url,
                group_id: group_id,
                text: text,
                rating: rating,
                order_id: 1,
                user_name: name,
                email: email
                })
              });
        
              if (res.status === 200) {
                setStatusCode(res.status);
                setToastMessage("Проверьте почту!");
              } else if (res.status === 404) {
                setStatusCode(res.status);
                setToastMessage("Вы уже оставляли отзыв на этой странице!");
              } else if (res.status === 422) {
                setStatusCode(res.status);
                setToastMessage("Ошибка ввода! Обратите внимание: в поле имя не должно быть цифр и специальных символов. Разрешенные почтовые домены: mail.ru, yandex.ru, gmail.com");
              } else if (res.status === 500) {
                setStatusCode(res.status);
                setToastMessage("Элемент с таким ключом уже сущетсвует!");
              } else {
                setStatusCode(res.status);
                setToastMessage("Произошла непредвиденная ошибка!");
              }
        
            } catch (err) {
            }
            finally{
          setLoading(false);
        }
    };

    return(
        <div className="reviewsInput-container">
            {reviewsAmount === 0 &&
            <span className="ReviewsInput-noreviews-span">Будьте первым, кто оставил отзыв на этой странице</span>
            }
            <span className="reviewsInput-first-label">
                Ваш адрес email не будет опубликован. Обязательные поля помечены <span className="reviewsInput-red-star">*</span>
            </span>
            <div className="reviewsInput-rating-container">
                <span>Ваша оценка <span className="reviewsInput-red-star">*</span>:</span>
                <div
                className="reviewsInput-rating-container-stars"
                style={{ display: "flex", cursor: "pointer" }}
                >
                {stars.map((star) => {
                const isActive = star <= (hoveredStar || rating);

                return (
                <svg className={`reviewsInput-gold-star${isActive ? "-active" : ""}`}
                key={star}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="40"
                height="40"
                strokeWidth="2"
                strokeLinejoin="round"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setRating(star)}
                style={{ transition: "fill 0.2s, stroke 0.2s" }}
                >
                <path d="M12 2.5l3.09 6.26 6.91.99-5 4.87 
                        1.18 6.88L12 18.77l-6.18 3.23 
                        1.18-6.88-5-4.87 6.91-.99L12 2.5z"/>
                </svg>
            );
            })}
            </div>
            </div>
            <div className="reviewsInput-container-main">
                <span>Ваш отзыв <span className="reviewsInput-red-star">*</span></span>
                <textarea type="text" value={text} onChange={(e) => setText(e.target.value)}/>
            </div>
            <div className="reviewsInput-container-name">
                <span>Имя <span className="reviewsInput-red-star">*</span></span>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}/>
            </div>
            <div className="reviewsInput-container-email">
                <span>Email <span className="reviewsInput-red-star">*</span></span>
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)}/>
            </div>
            {isAdmin ? (
                <button className="reviewsInput-container-send-btn" onClick={() => handleCreateReviewAdmin()}>
                добавить
            </button>
            ) : (
                <button className="reviewsInput-container-send-btn" onClick={() => handleCreateReview()}>
                отправить
            </button>
            )}
            {loading ? (
                                                            <LoadingGif loading={loading}/>
                                                          ) : (<></>)}
            <AuthForm visible={visibleAuth} setVisible={setVisibleAuth}/>
        </div>
    );
}