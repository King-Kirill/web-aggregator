import { BASE_URL } from '../../config';
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import React, { useEffect, useState, useRef, useContext } from 'react';
import "./Space.css"

export default function Space({ height, comp_id, item_id, onDelete=null }) {
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

  return <div className="space-div" style={{ height: `${height}px` }}>
    {isAdmin && (
        <button className="space-on-delete-btn" onClick={() => {
                                                  if (window.confirm("Вы уверены, что хотите безвозвратно удалить элемент?")) {onDelete(comp_id, item_id)}}}>
                                                  <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                                                  width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
                                                  preserveAspectRatio="xMidYMid meet">
        
                                                  <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)">
                                                  <path d="M1974 4646 c-62 -27 -64 -38 -64 -278 l0 -218 45 0 45 0 2 208 3 207
                                                  555 0 555 0 3 -207 2 -208 45 0 45 0 0 210 c0 237 -5 261 -65 286 -49 20
                                                  -1124 20 -1171 0z"/>
                                                  <path d="M1000 3865 l0 -175 1560 0 1560 0 0 175 0 175 -1560 0 -1560 0 0
                                                  -175z"/>
                                                  <path d="M1192 2113 l3 -1478 22 -40 c25 -47 64 -85 113 -111 34 -18 83 -19
                                                  1230 -19 l1195 0 41 22 c53 28 107 91 122 142 9 28 12 420 12 1500 l0 1461
                                                  -1370 0 -1370 0 2 -1477z m1406 945 c17 -17 17 -2049 0 -2066 -15 -15 -61 -15
                                                  -76 0 -17 17 -17 2049 0 2066 7 7 24 12 38 12 14 0 31 -5 38 -12z m-720 -124
                                                  l22 -15 0 -893 c0 -680 -3 -895 -12 -904 -15 -15 -61 -15 -76 0 -9 9 -12 224
                                                  -12 904 l0 893 22 15 c12 9 25 16 28 16 3 0 16 -7 28 -16z m1420 0 l22 -15 0
                                                  -893 c0 -680 -3 -895 -12 -904 -15 -15 -61 -15 -76 0 -9 9 -12 224 -12 904 l0
                                                  893 22 15 c12 9 25 16 28 16 3 0 16 -7 28 -16z"/>
                                                  </g>
                                                </svg>
                                                </button>
    )}
  </div>;
}