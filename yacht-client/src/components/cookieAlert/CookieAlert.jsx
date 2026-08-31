import { div } from "framer-motion/client";
import { useState, useEffect } from "react";

import './CookieAlert.css';

export default function CookieAlert()
{
    const [cookie, setCookie] = useState(true);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const is_cookie_set = (localStorage.getItem(`cookie_is_approved`));

        if(!is_cookie_set)
        {
            setCookie(false);
        }
        else{
            setCookie(is_cookie_set);
        }
    }, []);

    const setLocalCookie = () => {
        localStorage.setItem(`cookie_is_approved`, true);
        setVisible(false);
    }

    if(!cookie)
    {
        return(
            <div className={`cookie-alert-conatiner ${!visible ? ("hidden") : ""}`}>
                <p>
                Используем cookie для работы сайта и аналитики. <br />
                «Принять» = ознакомление с <a href="https://vip-boat.ru/privacy-policy">Политикой конфиденциальности</a>.
                </p>
                <button onClick={setLocalCookie}>
                    Принять
                </button>
            </div>
        );
    }
}