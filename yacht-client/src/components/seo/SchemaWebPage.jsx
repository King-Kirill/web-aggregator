import React from "react";

const SITE = "https://vip-boat.ru";

/** Абсолютный URL для Microdata (изображения и т.д.) */
export function schemaAbsoluteUrl(href) {
  if (href == null || href === "") return "";
  const s = String(href).trim();
  if (/^https?:\/\//i.test(s)) return s;
  return `${SITE}${s.startsWith("/") ? s : `/${s}`}`;
}

/**
 * Microdata Schema.org на корне страницы: WebPage / CollectionPage / Product и т.д.
 * Дети рендерятся после служебных meta/link.
 */
export default function SchemaWebPage({
  component: Component = "div",
  className,
  style,
  itemType = "https://schema.org/WebPage",
  name,
  description,
  path,
  children,
  ...rest
}) {
  const url =
    path != null && String(path).trim() !== ""
      ? `${SITE}${String(path).startsWith("/") ? path : `/${path}`}`
      : SITE;

  const desc =
    description != null && String(description).trim() !== ""
      ? String(description).replace(/\s+/g, " ").trim().slice(0, 500)
      : undefined;

  const nameStr = name != null && String(name).trim() !== "" ? String(name).trim() : undefined;

  return (
    <Component className={className} style={style} itemScope itemType={itemType} {...rest}>
      {nameStr != null && <meta itemProp="name" content={nameStr} />}
      {desc != null && <meta itemProp="description" content={desc} />}
      <link itemProp="url" href={url} />
      <link itemProp="isPartOf" href={`${SITE}/#website`} />
      {children}
    </Component>
  );
}
