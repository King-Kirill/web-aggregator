import React, { useEffect, useRef } from "react";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import "./ParseDelta.css";

export default function ParseDelta({ desc }) {
  const editorRef = useRef(null);

  const convertDeltaWithButtons = (ops) => {
    const htmlParts = [];
    let normalOps = [];

    const pushNormalOps = () => {
      if (normalOps.length > 0) {
        const converter = new QuillDeltaToHtmlConverter(normalOps, {
          inlineStyles: true,
        });
        htmlParts.push(converter.convert());
        normalOps = [];
      }
    };

    ops.forEach((op) => {

      if (typeof op.insert === "string" && op.insert.trim().startsWith("<")) {
        pushNormalOps();
        htmlParts.push(op.insert); // вставляем как есть
        return;
      }

      if (op.attributes?.button || op.insert?.button) {
        pushNormalOps();

        const href =
          op.insert?.button?.href || op.attributes?.href || "#";
        const label =
          op.insert?.button?.label || op.insert?.button || "Кнопка";

        htmlParts.push(
          `<a class="my-edit-custom-btn" href="${href}" target="_blank">${label}</a>`
        );
        return;
      }

      normalOps.push(op);
    });

    pushNormalOps();
    return htmlParts.join("");
  };

  const html = desc?.ops ? convertDeltaWithButtons(desc.ops) : "";

  useEffect(() => {
    if (!editorRef.current) return;

    // Дополнительная стилизация списков
    editorRef.current.querySelectorAll("li").forEach((li) => {
      const span = li.querySelector("span");
      if (!span) return;
      const cs = window.getComputedStyle(span);
      li.style.fontSize = cs.fontSize;
      li.style.color = cs.color;
    });
  }, [html]);

  return (
    <div className="ql-container ql-snow">
      <div
        ref={editorRef}
        className="ql-editor"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <style>{`
        .ql-editor li::marker {
          font-size: inherit !important;
          color: currentColor !important;
        }

        .ql-container.ql-snow {
          border: none !important;
          box-shadow: none !important;
        }

        .my-edit-custom-btn {
          display: inline-block;
          background: transparent;
          color: #fff;
          cursor: pointer;
          font-weight: bold;
          text-decoration: none;
        }

        .my-edit-custom-btn:hover {
          background: transparent;
        }
      `}</style>
    </div>
  );
}