import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import '@fontsource/rubik/400.css';
import '@fontsource/rubik/700.css';
import "./CallRequest.css"
import { BASE_URL } from '../../config';
import LoadingGif from "../loadingGif/LoadingGif.jsx";
import Toast from "../adminMessage/adminMessage.jsx";
import LoadingGifPage from "../LoadingGifPage/LoadingGifPage.jsx";
import ReCAPTCHA from "react-google-recaptcha";

export default function CallRequest({product_name, visible=false, setVisible=null}) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [count, setCount] = useState("");
  const [time, setTime] = useState("00:00");
  const [date, setDate] = useState("");
  const [capctha, setCaptcha] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const [nameError, setNameError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [timeError, setTimeError] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [countError, setCountError] = useState(false);
  const [initCaptcha, setInitCaptcha] = useState(false);

  const cleanPhone = phone.replace(/\D/g, "");

  const [toastMessage, setToastMessage] = useState("");
  const [statusCode, setStatusCode] = useState(0);

    const [open, setOpen] = useState(false);

  const intervals = Array.from({ length: 24 * 4 }, (_, i) => {
    const hours = String(Math.floor(i / 4)).padStart(2, "0");
    const minutes = String((i % 4) * 15).padStart(2, "0");
    return `${hours}:${minutes}`;
  });

  useEffect(() => {
  if (visible) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [visible]);

  const handleChangeName = (e) => {
    setName(e.target.value);
  }

  const handleChangePhone = (e) => {
    setPhone(e.target.value);
  }

  const handleChangeCount = (e) => {
    setCount(e.target.value);
  }

  const handleChangeTime = (e) => {
    setTime(e.target.value);
  }

  const handleChangeDate = (e) => {
    setDate(e.target.value);
  }

  const sendForm = async () => {
    if(name === "")
    {
      setNameError(true);
      return;
    }
  
    if(phone === "" || cleanPhone.length !== 11 || !/^[78]/.test(cleanPhone))
    {
      setPhoneError(true);
      return;
    }

    if(!agreed)
    {
        alert("Согласитесь с политикой конфиденциальности!");
        return;
    }
  
    try {
      const item = {
        user_name: name,
               phone: phone,
               ppl_amount: count,
               date: date,
               time: time,
               product_name: product_name
      };

      setLoading(true);
        const res = await fetch(`${BASE_URL}/send-request`,
          {
              method: "POST",
              headers: {
              "Content-Type": "application/json"
              },
              body: JSON.stringify({
               user_name: name,
               phone: phone,
               product_name: product_name
            })
          }
        );
  
        if (res.status === 200) {
          setStatusCode(res.status);
          setToastMessage("Заявка успешно отправлена!");
          setVisible(false);
          navigate("/thanks");
        } else if (res.status === 404) {
          setStatusCode(res.status);
          setToastMessage("Проверьте корректность заполнения данных!");
        } else if (res.status === 500) {
          setStatusCode(res.status);
          setToastMessage("Ошибка сервера!");
        } else {
          setStatusCode(res.status);
          setToastMessage("Непредвиденная ошибка!");
        }
  
      } catch (err) {
      }
      finally{
        setLoading(false);
      }
  }

  return (
    <>
    {visible && <div className="modal-overlay-request"></div>}
    <div className={`requset-container ${visible ? "active" : ""}`}>
        <button 
                    className="close-btn-request" 
                    onClick={() => setVisible(false)}
                  >
                    ✕
                  </button>
        <div className="requset-container-content">
            <div className="requset-container-text">
        <span className="title-request">Сделать заказ</span>
        <p>
            Заполните форму заказа, наш менеджер свяжется с Вами в течении <span>5-и минут!</span>
        </p>
      </div>
      <div className="requset-container-inputs">
        <div className="mainPage-name-wrapper-request">
                    <input className="input" value={name} type="text" placeholder="Имя" onChange={handleChangeName} onFocus={() => setNameError(false)}/>
                    <div className={`mainPage-name-wrapper-error-request ${nameError ? "active" : ""}`}>
                      <svg xmlns="http://www.w3.org/2000/svg"
                      width="40" height="40" viewBox="0 0 24 24" role="img" aria-label="Warning">
                      <rect className="svg-back" x="1" y="1" width="22" height="22" rx="2" ry="2" fill="#FFA920"/>
                      <rect className="svg-sign" x="10" y="4.5" width="4" height="10" rx="0.3" fill="#FFFFFF"/>
                      <circle className="svg-dot" cx="12" cy="17.5" r="1.4" fill="#FFFFFF"/>
                      </svg>
                      <span>Заполните это поле.</span>
                    </div>
                  </div>
        <div className="mainPage-name-wrapper-request">
                    <input className="input" value={phone} type="phone" placeholder="+7 (___) ___ __ __" onChange={handleChangePhone} onFocus={() => {setPhoneError(false); {if (!phone.startsWith("+7 ")) {setPhone("+7 ");}}}}/>
                    <div className={`mainPage-name-wrapper-error-request ${phoneError ? "active" : ""}`}>
                      <svg xmlns="http://www.w3.org/2000/svg"
                      width="40" height="40" viewBox="0 0 24 24" role="img" aria-label="Warning">
                      <rect className="svg-back" x="1" y="1" width="22" height="22" rx="2" ry="2" fill="#FFA920"/>
                      <rect className="svg-sign" x="10" y="4.5" width="4" height="10" rx="0.3" fill="#FFFFFF"/>
                      <circle className="svg-dot" cx="12" cy="17.5" r="1.4" fill="#FFFFFF"/>
                      </svg>
                      {phone === "" ? (
                        <span>Заполните это поле.</span>
                      ) : (
                        <span>Неверный формат.</span>
                      )}
                    </div>
                  </div>
        {/* <div className="mainPage-name-wrapper-request">
                    <input value={count} type="number" placeholder="К-во человек" className="input ppl-amount" onChange={handleChangeCount} onFocus={() => setCountError(false)}/>
                    <div className={`mainPage-name-wrapper-error-request ${countError ? "active" : ""}`}>
                      <svg xmlns="http://www.w3.org/2000/svg"
                      width="40" height="40" viewBox="0 0 24 24" role="img" aria-label="Warning">
                      <rect className="svg-back" x="1" y="1" width="22" height="22" rx="2" ry="2" fill="#FFA920"/>
                      <rect className="svg-sign" x="10" y="4.5" width="4" height="10" rx="0.3" fill="#FFFFFF"/>
                      <circle className="svg-dot" cx="12" cy="17.5" r="1.4" fill="#FFFFFF"/>
                      </svg>
                      <span>Заполните это поле.</span>
                    </div>
                  </div>
        <div className="requset-container-inputs-inner">
            <div className="mainPage-name-wrapper-request">
                    <div className="custom-select">
                    <span className="info-span-request">Начало прогулки</span>
      <div className="input-like" onClick={() => setOpen(!open)}>
        {time}
      </div>
      {open && (
        <ul className="dropdown">
          {intervals.map((t) => (
            <li key={t} onClick={() => { setTime(t); setOpen(false); }}>
              {t}
            </li>
          ))}
        </ul>
      )}
    </div>
                    <div className={`mainPage-name-wrapper-error-request ${timeError ? "active" : ""}`}>
                      <svg xmlns="http://www.w3.org/2000/svg"
                      width="40" height="40" viewBox="0 0 24 24" role="img" aria-label="Warning">
                      <rect className="svg-back" x="1" y="1" width="22" height="22" rx="2" ry="2" fill="#FFA920"/>
                      <rect className="svg-sign" x="10" y="4.5" width="4" height="10" rx="0.3" fill="#FFFFFF"/>
                      <circle className="svg-dot" cx="12" cy="17.5" r="1.4" fill="#FFFFFF"/>
                      </svg>
                      <span>Заполните это поле.</span>
                    </div>
                  </div>
            <div className="mainPage-name-wrapper-request">
                    <span className="info-span-request">Дата прогулки</span>
                    <input className="input-inner" value={date} type="date" onChange={handleChangeDate} onFocus={() => setDateError(false)}/>
                    <div className={`mainPage-name-wrapper-error-request ${dateError ? "active" : ""}`}>
                      <svg xmlns="http://www.w3.org/2000/svg"
                      width="40" height="40" viewBox="0 0 24 24" role="img" aria-label="Warning">
                      <rect className="svg-back" x="1" y="1" width="22" height="22" rx="2" ry="2" fill="#FFA920"/>
                      <rect className="svg-sign" x="10" y="4.5" width="4" height="10" rx="0.3" fill="#FFFFFF"/>
                      <circle className="svg-dot" cx="12" cy="17.5" r="1.4" fill="#FFFFFF"/>
                      </svg>
                      <span>Заполните это поле.</span>
                    </div>
                  </div> */}
        {/* </div> */}
      </div>
      <label className="privacy-policy-confirm">
      <input
        type="checkbox"
        checked={agreed}
        onChange={(e) => setAgreed(e.target.checked)}
        style={{ width: "20px", height: "20px", cursor: "pointer" }}
      />
      <span>
        Я согласен с
        <Link className="privacy-policy-link" to="/privacy-policy" onClick={() => {setVisible(false);}}>
          политикой конфиденциальности
        </Link>
      </span>
    </label>
    <button className="callrequest-send-btn" onClick={() => {sendForm();}}>Отправить</button>
        </div>
    </div>
    {toastMessage && (
                                <Toast
                                  message={toastMessage}
                                  status_code={statusCode}
                                  timeout={4000}
                                  onClose={() => setToastMessage("")}
                                />)}
    {loading && (
                    <LoadingGif loading={loading}/>
                  )}
    </>
  );
}

