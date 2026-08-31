import { useState, useEffect } from "react";
import "./AdminMessage.css"

export default function Toast({ message, status_code, timeout = 3000, onClose }) {
  const [visible, setVisible] = useState(false);

  const statusClass = (() => {
    if (status_code >= 200 && status_code < 300) return "success";
    if (status_code >= 400 && status_code < 500) return "warning";
    if (status_code >= 500) return "error";
    return "info";
  })();

useEffect(() => {
    if (!message) return;

    setVisible(false);

    const raf = requestAnimationFrame(() => setVisible(true));

    const timer = setTimeout(() => {
      setVisible(false);

      setTimeout(() => {
        if (onClose) onClose();
      }, 500);
    }, timeout);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [message, timeout, onClose]);

  if (!message && !visible) return null;

  return (
    <div className={`toast ${visible ? "active" : ""} ${statusClass}`}>
      {message}
    </div>
  );
}