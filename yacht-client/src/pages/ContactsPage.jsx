import React, { useEffect, useState, useRef } from "react";
import { BASE_URL } from '../config.jsx';

import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { Helmet } from "react-helmet-async";

import CallRequest from '../components/callRequest/CallRequest.jsx';

import Toast from "../components/adminMessage/adminMessage.jsx";

import ReCAPTCHA from "react-google-recaptcha";

export default function Contacts() {
    const navigate = useNavigate();

    const [visibleRequest, setVisibleRequest] = useState(false);
    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [text, setText] = useState("");

    const [toastMessage, setToastMessage] = useState("");
    const [statusCode, setStatusCode] = useState("");

    const [initCaptcha, setInitCaptcha] = useState(false);

    const [captcha, setCaptcha] = useState("");

    const [isChecked, setIsChecked] = useState(false);

    const cleanPhone = phone.replace(/\D/g, "");

    const changePhone = (e) => {
      setPhone(e.target.value);
    }

    const changeName = (e) => {
      setName(e.target.value);
    }

    const changeEmail = (e) => {
      setEmail(e.target.value);
    }

    const changeText = (e) => {
      const value = e.target.value;

      if (value.length <= 200) {
        setText(value);
      }
    }
    
    const sendRequest = async () => {
      if(name === "")
      {
        setToastMessage("Пустое имя пользователя!");
        setStatusCode(404);
        return;
      }

      if(phone === "")
      {
        setToastMessage("Не указан номер телефона!");
        setStatusCode(404);
        return;
      }

      if(cleanPhone.length !== 11)
      {
        setToastMessage("Неверный формат номера телефона!");
        setStatusCode(404);
        return;
      }

      if(!/^[78]/.test(cleanPhone))
      {
        setToastMessage("Неверный формат номера телефона!");
        setStatusCode(404);
        return;
      }

      if(email === "")
      {
        setToastMessage("Не указана почта!");
        setStatusCode(404);
        return;
      }

      if(text === "")
      {
        setToastMessage("Не указан текст вопроса!");
        setStatusCode(404);
        return;
      }

      if(!isChecked)
      {
        setToastMessage("Согласитесь с политикой конфеденциальности!");
        setStatusCode(404);
        return;
      }

      
      try{
        const res = await fetch(`${BASE_URL}/send-request-task`,
          {
              method: "POST",
              headers: {
              "Content-Type": "application/json"
              },
              body: JSON.stringify({
               name: name,
               email: email,
               phone: phone,
               text: text
            })
          }
        );
  
        if (res.status === 200) {
          setStatusCode(res.status);
          setToastMessage("Заявка успешно отправлена!");
          setVisible(false);
        } else if (res.status === 404) {
          setStatusCode(res.status);
          setToastMessage("Проверьте корректность заполнения!");
        } else if (res.status === 500) {
          setStatusCode(res.status);
          setToastMessage("Проверьте корректность заполнения!");
        } else {
          setStatusCode(res.status);
          setToastMessage("Проверьте корректность заполнения!");
        }
      }
      catch(ex)
      {
        console.log(ex);
      }
    }

    return(
      <>
      <Helmet>
        <title>Контакты и реквизиты ИП vip-boat</title>
        <meta
          name="description"
          content="Контакты Vip Boat: телефон +7 964 333-36-36, email, реквизиты ИП, Санкт-Петербург. Связь по аренде яхт и катеров."
        />
        <link rel="canonical" href="https://vip-boat.ru/contacts" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Контакты и реквизиты — Vip Boat" />
        <meta
          property="og:description"
          content="Телефон, email и реквизиты аренды яхт в Санкт-Петербурге."
        />
        <meta property="og:url" content="https://vip-boat.ru/contacts" />
        <meta property="og:image" content="https://storage.yandexcloud.net/vip-boat-images/аренда-яхты-в-Санкт-Петербурге.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Контакты и реквизиты ИП vip-boat" />
        <meta name="twitter:description" content="Контакты Vip Boat: телефон +7 964 333-36-36, email, реквизиты ИП, Санкт-Петербург. Связь по аренде яхт и катеров." />
        <meta name="twitter:image" content="https://storage.yandexcloud.net/vip-boat-images/аренда-яхты-в-Санкт-Петербурге.jpg" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "@id": "https://vip-boat.ru/contacts#webpage",
            "url": "https://vip-boat.ru/contacts",
            "name": "Контакты и реквизиты ИП Vip Boat",
            "description":
              "Контакты, реквизиты индивидуального предпринимателя и форма обратной связи.",
            "inLanguage": "ru-RU",
            "isPartOf": { "@id": "https://vip-boat.ru/#website" },
            "mainEntity": { "@id": "https://vip-boat.ru/#organization" }
          })}
        </script>
      </Helmet>
      <div className="regularPage-section" itemScope itemType="https://schema.org/ContactPage">
        <meta itemProp="name" content="Контакты и реквизиты ИП Vip Boat" />
        <link itemProp="url" href="https://vip-boat.ru/contacts" />
        <link itemProp="isPartOf" href="https://vip-boat.ru/#website" />
        <div className="regularPage-title-container">
            <div className="regularPage-title-text-container">
                <button onClick={() => navigate('/')}>
                    основная
                </button>
                <h1 itemProp="headline">
                    Контакты и реквизиты ИП
                </h1>
            </div>
        </div>
        <div
          itemScope
          itemType="https://schema.org/LocalBusiness"
          itemProp="mainEntity"
          style={{ display: "contents" }}
        >
        <div className="contacts-content-container">
          <div className="contacts-content-container-details">
            <span className="contacts-content-container-details-title">
              Реквизиты:
            </span>
            <p>
              Название организации <br />
              <span itemProp="legalName">
                ИНДИВИДУАЛЬНЫЙ ПРЕДПРИНИМАТЕЛЬ КУЗЬМЫК ПАВЕЛ ИОСИФОВИЧ
              </span>
              <meta itemProp="name" content="Vip Boat" />
              <br />
              <br />
              Юридический адрес организации <br />
              <span itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                <span itemProp="addressCountry">RU</span>,{" "}
                <span itemProp="addressLocality">Санкт-Петербург</span>
              </span>
              <br />
              <br />
              ИНН{" "}
              <span itemProp="taxID">780159592304</span>
              <br />
              ОГРН/ОГРНИП <br />
              <span itemProp="identifier">326784700085201</span>
              <br />
            </p>
          </div>
          <div className="contacts-content-container-question-container">
            <span className="contacts-content-container-question-container-title">
              Обратная связь
            </span>
            <div className="contacts-content-container-question-container-input-container">
              <span className="contacts-content-container-question-container-pre-input">Представьтесь</span>
              <input value={name} type="text" placeholder="Ваше имя" onChange={changeName}/>
            </div>
            <div className="contacts-content-container-question-container-email-phone">
              <div className="contacts-content-container-question-container-input-container">
                <span className="contacts-content-container-question-container-pre-input">Email</span>
                <input value={email} type="text" placeholder="Email" onChange={changeEmail}/>
              </div>
              <div className="contacts-content-container-question-container-input-container">
                <span className="contacts-content-container-question-container-pre-input">Телефон</span>
                <input value={phone} type="text" placeholder="Введите номер телефона" onChange={changePhone} onFocus={() => {{if (!phone.startsWith("+7 ")) {setPhone("+7 ");}}}}/>
              </div>
            </div>
            <div className="contacts-content-container-question-container-input-container">
              <span className="contacts-content-container-question-container-pre-input">Ваш запрос</span>
              <textarea value={text} placeholder="Тут вы можете написать свое предложение или запрос" onChange={changeText}/>
            </div>
            <label class="privacy-policy-confirm">
              <input type="checkbox" style={{width: 20 + 'px', height: 20 + 'px', cursor: 'pointer'}} checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)}/>
              <span>Я согласен с<a class="privacy-policy-link" href="/privacy-policy">
                политикой конфиденциальности</a>
              </span>
            </label>
            <button className="contacts-content-container-question-container-send-btn" onClick={sendRequest}>
              отправить
            </button>
          </div>
        </div>
        <div className="contacts-content-container-contacts">
          <div className="contacts-content-container-contacts-logos">
            <div className="contacts-content-container-contacts-logos-item">
              <img src="/images/icons/ring-phone-2.png" alt="" />
              <div className="contacts-content-container-contacts-logos-item-text">
                <span className="contacts-content-container-contacts-logos-item-text-title">
                  Телефон:
                </span>
                <span itemProp="telephone">+7 964 333-36-36</span>
              </div>
            </div>
            <div className="contacts-content-container-contacts-logos-item">
              <img src="/images/icons/mail.png" alt="" />
              <div className="contacts-content-container-contacts-logos-item-text">
                <span className="contacts-content-container-contacts-logos-item-text-title">
                  Email:
                </span>
                <a className="email-ref" itemProp="email" href="mailto:noreplyvipboat@yandex.ru">
                  noreplyvipboat@yandex.ru
                </a>
              </div>
            </div>
            <div className="contacts-content-container-contacts-logos-item">
              <img src="/images/icons/navigate.png" alt="" />
              <div className="contacts-content-container-contacts-logos-item-text">
                <span className="contacts-content-container-contacts-logos-item-text-title">
                  Офис:
                </span>
                <span itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                  <span itemProp="addressLocality">Санкт-Петербург</span>
                  <meta itemProp="addressCountry" content="RU" />
                </span>
              </div>
            </div>
          </div>
          <div className="contacts-content-container-contacts-task-btn">
            <span className="contacts-content-container-contacts-task-btn-title">
              Остались вопросы?
            </span>
            <span className="contacts-content-container-contacts-task-btn-desc">
              Оставьте свою заявку, мы перезвоним вам в течении 5 минут!
            </span>
            <button className="contacts-content-container-contacts-task-btn-btn" onClick={() => {setVisibleRequest(true)}}>
              заказать звонок
            </button>
          </div>
        </div>
        </div>
      </div>
      <CallRequest product_name={"заказать звонок"} visible={visibleRequest} setVisible={setVisibleRequest}/>
      <Toast
        message={toastMessage}
        status_code={statusCode}
        timeout={4000}
        onClose={() => setToastMessage("")}
      />
      </>
    );
}