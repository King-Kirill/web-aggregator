import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '@fontsource/rubik/400.css';
import '@fontsource/rubik/700.css';
import "../callRequest/CallRequest.css"
import LoadingGif from "../loadingGif/LoadingGif.jsx";
import { BASE_URL } from '../../config';
import Toast from "../adminMessage/adminMessage.jsx";

export default function AuthForm({visible=false, setVisible=null}) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const [nameError, setNameError] = useState(false);
  const [passError, setPassError] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [statusCode, setStatusCode] = useState(0);

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

  const handleChangePass = (e) => {
    setPass(e.target.value);
  }

  const sendForm = async () => {
    if(name === "")
    {
      setNameError(true);
      return;
    }
  
    if(pass === "")
    {
      setPassError(true);
      return;
    }

    try {
      setLoading(true);
        const res = await fetch(`${BASE_URL}/log-in`,
          {
              method: "POST",
              headers: {
              "Content-Type": "application/json"
              },
              credentials: "include",
              body: JSON.stringify({
               password: pass,
               name: name
          })
          }
        );
  
        if (res.status === 200) {
          setStatusCode(res.status);
          setToastMessage("Вы успешно авторизованы!");
          setVisible(false);
        } else if (res.status === 404) {
          setStatusCode(res.status);
          setToastMessage("Не удалось установить подключение!");
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
    <div className={`requset-container-auth ${visible ? "active" : ""}`}>
        <button 
                    className="close-btn-request-auth" 
                    onClick={() => setVisible(false)}
                  >
                    ✕
                  </button>
        <div className="requset-container-content">
            <div className="requset-container-text">
        <span className="title-request-auth">Авторизация</span>
      </div>
      <div className="requset-container-inputs">
        <div className="mainPage-name-wrapper-request">
                    <input className="input-auth" value={name} type="text" placeholder="Имя" onChange={handleChangeName} onFocus={() => setNameError(false)}/>
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
                    <input className="input-auth" value={pass} type="password" placeholder="Пароль" onChange={handleChangePass} onFocus={() => setPassError(false)}/>
                    <div className={`mainPage-name-wrapper-error-request ${passError ? "active" : ""}`}>
                      <svg xmlns="http://www.w3.org/2000/svg"
                      width="40" height="40" viewBox="0 0 24 24" role="img" aria-label="Warning">
                      <rect className="svg-back" x="1" y="1" width="22" height="22" rx="2" ry="2" fill="#FFA920"/>
                      <rect className="svg-sign" x="10" y="4.5" width="4" height="10" rx="0.3" fill="#FFFFFF"/>
                      <circle className="svg-dot" cx="12" cy="17.5" r="1.4" fill="#FFFFFF"/>
                      </svg>
                      <span>Заполните это поле.</span>
                    </div>
                  </div>
      </div>
    <button className="callrequest-send-btn" onClick={() => sendForm()}>Отправить</button>
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