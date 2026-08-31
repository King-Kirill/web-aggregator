import { useState } from "react";
import "./FloatingMenu.css";

export default function FloatingMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fab-container">

      <div className={`fab-actions ${open ? "open" : ""}`}>

        <div className="fab-item">
          <span className="fab-label">Позвонить</span>
          <a className="fab-action phone" href="tel:+79643333636">
            <img src="/images/icons/phone.png" alt="" />
          </a>
        </div>

        <div className="fab-item">
          <span className="fab-label">Написать в Max</span>
          <a href="https://max.ru/u/f9LHodD0cOJJXn0liBUBkrcezBiVuZtDiRrOeQKELc3ZOubaH-NRQf-wENw" className="fab-action max">
            <img src="/images/icons/max.png" alt="" />
          </a>
        </div>

        <div className="fab-item">
          <span className="fab-label">Написать в Telegram</span>
          <a href="https://t.me/pavloydkzd" className="fab-action telegram">
            <img src="/images/icons/tg.png" alt="" />
          </a>
        </div>

      </div>

      <button className="fab-main" onClick={() => setOpen(!open)}>
        {open ? "✖" : <img src="/images/icons/phone.png"/>}
      </button>

    </div>
  );
}