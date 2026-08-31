import './Leaflet.css'
import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import L from 'leaflet';
import 'leaflet-control-geocoder';

export default function Leaflet({
  onDeleteFromPage,
  piers,
  desc,
  button_info,
  custom_ref,
  image_src,
  compId,
  onCreate,
  onUpdate,
  onDelete,
  mapId,
  isAdmin
}) {

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markersRef = useRef({});
  const [mapReady, setMapReady] = useState(false);

  const isAdminRef = useRef(isAdmin);

  useEffect(() => {
    isAdminRef.current = isAdmin;
  }, [isAdmin]);

  useEffect(() => {

    console.log(piers);

  const defaultLat = 59.939095;
  const defaultLng = 30.315868;

  const startLat = piers.length ? piers[0].lat : defaultLat;
  const startLng = piers.length ? piers[0].lng : defaultLng;

  window.ymaps.ready(() => {

    // сброс состояния
    setMapReady(false);

    // чистим старые маркеры
    markersRef.current = {};

    // создаём новую карту
    mapRef.current = new window.ymaps.Map(mapContainerRef.current, {
      center: [startLat, startLng],
      zoom: 12,
      controls: ["zoomControl", "searchControl"]
    });

    // теперь карта готова
    setMapReady(true);

    mapRef.current.events.add("click", async (e) => {

      if (!isAdminRef.current) return;

      const coords = e.get("coords");
      const lat = coords[0];
      const lng = coords[1];

      const id = await onCreate(lat, lng, mapId);

      if (id !== 0) {

        const marker = new window.ymaps.Placemark(
          [lat, lng],
          {},
          { draggable: true }
        );

        marker.events.add("click", () => {
          mapRef.current.geoObjects.remove(marker);
          onDelete(id);
        });

        mapRef.current.geoObjects.add(marker);
        markersRef.current[id] = marker;
      }

    });

  });

  return () => {
    if (mapRef.current) mapRef.current.destroy();
  };

}, []);

  useEffect(() => {

    if (!mapReady) return;

    // удаляем старые
    Object.keys(markersRef.current).forEach((id) => {

      if (!piers.find(p => p.id === Number(id))) {

        mapRef.current.geoObjects.remove(markersRef.current[id]);
        delete markersRef.current[id];

      }

    });

    // добавляем новые
    piers.forEach((pier) => {

      if (!markersRef.current[pier.id]) {

        const marker = new window.ymaps.Placemark(
          [pier.lat, pier.lng],
          {},
          { draggable: false }
        );

        marker.events.add("click", () => {

          if (isAdmin) {

            mapRef.current.geoObjects.remove(marker);
            onDelete(pier.id);

          } else {

            const url = `https://yandex.ru/maps/?rtext=~${pier.lat},${pier.lng}&rtt=auto`;
            window.open(url, "_blank");

          }

        });

        mapRef.current.geoObjects.add(marker);
        markersRef.current[pier.id] = marker;

      }

    });

  }, [piers, mapReady, isAdmin]);

  return (
    <div className="map-container">
      <div
      ref={mapContainerRef}
      className="map"
      style={{ height: "450px", width: "100%" }}
    >
    </div>
    {button_info && (
      <div className="map-ref-container">
      <img src={image_src} alt="ref image alt" />
      <div className="map-ref-container-desc">
        <span>
          {desc}
        </span>
        <button className="map-ref-button" onClick={() => window.location.href = custom_ref}>
          {button_info}
        </button>
      </div>
      </div>
    )}
    {isAdmin &&(
        <button className="map-container-on-delete-from-page" onClick={() => onDeleteFromPage(compId, mapId)}>
            <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
                preserveAspectRatio="xMidYMid meet">
          
                <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)">
                <path d="M2371 5110 c-798 -66 -1500 -476 -1935 -1130 -289 -433 -429 -897
                -429 -1420 0 -690 259 -1317 748 -1805 487 -488 1115 -748 1805 -748 597 0
                1139 191 1610 567 208 166 447 444 593 690 326 551 431 1221 291 1856 -211
                956 -979 1723 -1934 1934 -233 51 -534 74 -749 56z m929 -942 c107 -54 129
                -188 45 -273 -19 -18 -52 -39 -72 -44 -52 -15 -1374 -15 -1426 0 -20 5 -53 26
                -72 44 -84 85 -62 219 45 273 l44 22 696 0 696 0 44 -22z m501 -597 c25 -25
                29 -37 29 -83 -1 -142 -159 -2476 -170 -2499 -6 -14 -24 -33 -40 -42 -26 -16
                -115 -17 -1060 -17 -945 0 -1034 1 -1060 17 -16 9 -34 28 -40 42 -11 23 -169
                2357 -170 2499 0 46 4 58 29 83 l29 29 1212 0 1212 0 29 -29z"/>
                <path d="M1854 3166 c-68 -30 -64 29 -64 -901 0 -781 2 -842 18 -861 50 -62
                150 -55 181 13 8 17 11 279 11 856 0 924 4 864 -66 893 -40 17 -41 17 -80 0z"/>
                <path d="M2540 3173 c-8 -2 -26 -10 -38 -16 -53 -26 -52 -2 -52 -889 0 -805 1
                -824 20 -856 36 -59 119 -67 169 -17 l26 25 3 833 c2 596 -1 840 -9 859 -17
                41 -80 74 -119 61z"/>
                <path d="M3184 3166 c-68 -30 -64 28 -64 -893 0 -577 3 -839 11 -856 31 -68
                131 -75 181 -13 16 19 18 80 18 861 0 933 4 872 -66 901 -40 17 -41 17 -80 0z"/>
                </g>
            </svg>
        </button>
    )}
    {isAdmin && (
      <button className="map-container-on-change" onClick={() => onUpdate(desc, button_info, custom_ref, image_src, mapId)}>
          <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
            width="32.000000pt" height="32.000000pt" viewBox="0 0 32.000000 32.000000"
            preserveAspectRatio="xMidYMid meet">
      
            <g transform="translate(0.000000,32.000000) scale(0.100000,-0.100000)"
            fill="#000000" stroke="none">
            <path d="M148 233 c-63 -66 -76 -85 -82 -122 -4 -24 -5 -46 -2 -48 3 -3 24 -2
            48 2 36 6 56 20 120 83 43 42 78 80 78 85 0 5 -15 24 -34 43 -19 19 -38 34
            -43 34 -5 0 -43 -35 -85 -77z m132 -7 c-14 -14 -65 37 -55 54 5 8 16 3 36 -16
            20 -19 26 -31 19 -38z m-50 -1 l24 -25 -49 -50 -49 -50 -28 27 -28 27 47 48
            c26 26 50 48 53 48 4 0 17 -11 30 -25z m-119 -139 c-26 -11 -35 -4 -26 24 7
            21 7 21 27 3 19 -17 19 -18 -1 -27z"/>
            <path d="M0 20 c0 -6 60 -10 160 -10 100 0 160 4 160 10 0 6 -60 10 -160 10
            -100 0 -160 -4 -160 -10z"/>
            </g>
          </svg>
      </button>
    )}
    </div>
  );
}