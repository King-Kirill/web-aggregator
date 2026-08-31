import React, { useEffect, useState, useRef, useContext, useLayoutEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { BASE_URL } from '../../config';
import { useLocation } from "react-router-dom";
import LoadingGif from "../loadingGif/LoadingGif.jsx";
import LoadingGifPage from "../LoadingGifPage/LoadingGifPage.jsx";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { useSearchContext } from "../SearchContext";
import CallRequest from '../callRequest/CallRequest.jsx';
import "./ProductsGrid.css"
import { button, div } from 'framer-motion/client';
import { useStorageContext } from "../StorageContext.jsx";

export default function ProductsGrid({products, ids, show_admin_btns=true, onload=false, group_name="", gridCols=1, group_id=0, compId=0, onDelete=null, onUpdate=null, onDeleteFromPage=null, onUpdateFromPage=null, onCreated=null, toilet_tags=[], capacity_tags=[], other_tags=[], max_price=0, min_price=0, searchPage=false, show_other_admin_btns=true, show_favourites=false,
setGridCols=null, scrollTo=0, setScrollTo=null, groupName="", onUpdateOrder=null})
{
    const { favourites, toggleFavourite } = useStorageContext();
    const { productsIds, setProductsIds } = useSearchContext();
    const location = useLocation();
    const navigate = useNavigate();
    const [showOnLoad, setShowOnLoad] = useState(false);
    const [cols, setCols] = useState(gridCols);
    const [currentImages, setCurrentImages] = useState({});
    const [loading, setLoading] = useState(false);
    const [localIds, setLocalIds] = useState([]);
    const [localProducts, setLocalProducts] = useState(products);
    const [search, setSearch] = useState("");
    const [searchedData, setSearchedData] = useState([]);
    const delayTimer = useRef(null);
    const isSearching = useRef(false);
    const [isFocused, setIsFocused] = useState(false);
    const [width, setWidth] = useState(window.innerWidth);
    const [letLoad, setLetLoad] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [visibleRequest, setVisibleRequest] = useState(false);
    const [selectedItem, setSelectedItem] = useState("");

    const setIdxDirect = (id, i) => setImgIdx(prev => ({ ...prev, [id]: i }));

    const [imgIdx, setImgIdx] = useState({}); // { [productId]: 0 | 1 }

    const setIdx = (productId, i) => (e) => {
      e.preventDefault();
      e.stopPropagation();
      setImgIdx((prev) => ({ ...prev, [productId]: i }));
    };

    const buttonRef = useRef();

  const [isAdmin, setIsAdmin] = useState(false);

  const saveOffsetY = () => {
    const y = window.pageYOffset;
    localStorage.setItem('catalogScrollY', String(y));
  };
  
  useEffect(() => {
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }
}, []);

useEffect(() => {
  if(scrollTo != 0)
  {
    console.log(scrollTo);
    const y = Number(localStorage.getItem('catalogScrollY'));
  if (!y) return;

  const timeout = setTimeout(() => {
    window.scrollTo({ top: y, behavior: 'auto' });
    setScrollTo(0);
  }, 1200);
  
  return () => clearTimeout(timeout);
  }
}, [scrollTo]);

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

const handleDeleteProduct = (id) => {
    setLocalProducts((prev) => prev.filter((btn) => btn.id !== id));
    };

useEffect(() => {
  setLocalIds(prev => {
    if (
      Array.isArray(prev) &&
      Array.isArray(ids) &&
      prev.length === ids.length &&
      prev.every((v, i) => v === ids[i])
    ) {
      return prev;
    }
    return ids;
  });
}, [ids, products, searchPage]);

useLayoutEffect(() => {
      const updateGridCols = () => {
        if(typeof setGridCols === "function")
        {
          const width = window.innerWidth;
        if (width < 800) {
          setGridCols(2);
          setCols(2);
        } else if (width < 1250) {
          setGridCols(3);
          setCols(3);
        } else {
          setCols(gridCols);
        }}
        else{
          const width = window.innerWidth;
        if (width < 800) {
          setCols(2);
        } else if (width < 1250) {
          setCols(3);
        } else {
          setCols(gridCols);
        }}
      };
  
      updateGridCols();
    }, []);

useEffect(() => {
      const updateGridCols = () => {
        if(typeof setGridCols === "function")
        {
          const width = window.innerWidth;
        if (width < 800) {
          setGridCols(2);
          setCols(2);
        } else if (width < 1250) {
          setGridCols(3);
          setCols(3);
        } else {
          setCols(gridCols);
        }}
        else{
          const width = window.innerWidth;
        if (width < 800) {
          setCols(2);
        } else if (width < 1250) {
          setCols(3);
        } else {
          setCols(gridCols);
        }}
      };
  
      updateGridCols();
      window.addEventListener("resize", updateGridCols);
  
      return () => window.removeEventListener("resize", updateGridCols);
    }, [gridCols]);
    
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

    const changeSearch = (e) => {
      setSearch(e.target.value);
    };

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    useEffect(() => {
  const fetchData = async () => {
    if (search === "") {
      clearTimeout(delayTimer.current);
      setLoading(false);
      isSearching.current = false;
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/search-product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ search_str: search }),
      });

      if (res.status === 200) {
        const data = await res.json();
        const products = data.content?.products || [];
        const ids = data.content.ids || [];

        setSearchedData(products);
        setProductsIds(ids);
      } else if (res.status === 404) {
        setSearchedData([]);
      }
    } catch (err) {
    } finally {
      clearTimeout(delayTimer.current);
      setLoading(false);
      isSearching.current = false;
    }
  };

  fetchData();
}, [search]);

useEffect(() => {
  setLocalProducts(products);
}, [products])

useEffect(() => {
  if(localIds != 0)
  {
    setShowOnLoad(true);
  }
}, [localIds])

useEffect(() => {
  if(!letLoad)
  {
    setLetLoad(true);
    return;
  }

  const controller = new AbortController();

  const fetchProducts = async () => {
    const newOthers = other_tags.map(filter => {
      switch (filter) {
        case "Популярность":
          return "popularity";
        case "Рейтинг":
          return "rating";
        case "Новизна":
          return "newest";
        case "Цена: от низкой до высокой":
          return "low_to_high";
        case "Цена: от высокой до низкой":
          return "high_to_low";
        default:
          return null;
      }
    }).filter(Boolean);

    try {
      setLoading(true);
      let res;
      if(searchPage)
      {
        res = await fetch(`${BASE_URL}/load-products-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toilet_tags: toilet_tags.length ? toilet_tags.map(String) : [],
          capacity_tags: capacity_tags.length ? capacity_tags.map(Number) : [],
          other_tags: newOthers.length ? newOthers : [],
          max_price,
          min_price,
          ids
        }),
        signal: controller.signal
      });
      }
      else{
        res = await fetch(`${BASE_URL}/load-products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toilet_tags: toilet_tags.length ? toilet_tags.map(String) : [],
          capacity_tags: capacity_tags.length ? capacity_tags.map(Number) : [],
          other_tags: newOthers.length ? newOthers : [],
          max_price,
          min_price,
          group_id
        }),
        signal: controller.signal
      });
      }

      if (res.status === 200) {
        const data = await res.json();
        const items_arr = data.content.items;

        setLocalProducts(items_arr);
        setLocalIds(data.content.ids)

        if (items_arr.length < 9) {
          setShowOnLoad(false);
        }
      }
      else if(res.status === 404){
        setLocalProducts([]);
        setLocalIds([]);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  if(onload)
  {
    fetchProducts();
  }

  return () => controller.abort();
}, [toilet_tags, capacity_tags, other_tags, max_price, min_price, searchPage]);

const show = (e, i) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx(i);
  };

  const loadProducts = async () => {
  setLoadingProducts(true);
  let firstNine = localIds;
  if(localIds.length > 9)
  {
    firstNine = localIds.slice(0, 9);
  }
  if(groupName == "all")
  {
    try {
       const res = await fetch(`${BASE_URL}/get-products-with-ids-order`,
         {
             method: "POST",
             headers: {
             "Content-Type": "application/json"
             },
             body: JSON.stringify({
             ids: firstNine
             })
         }
       );
 
       if (res.status === 200) {
                  const data = await res.json();
                  const items_arr = data.content;
                  setLocalProducts(prev => [
                      ...prev,
                      ...items_arr
                  ]);
                  setLocalIds(localIds.slice(items_arr.length));
                  if(items_arr.length < 9)
                  {
                    setShowOnLoad(false);
                  }
                }
          } catch (err) {
              }
              finally{
                setLoadingProducts(false);
              }
  }
  else{
    try {
       const res = await fetch(`${BASE_URL}/get-products-with-ids`,
         {
             method: "POST",
             headers: {
             "Content-Type": "application/json"
             },
             body: JSON.stringify({
             ids: firstNine
             })
         }
       );
 
       if (res.status === 200) {
                  const data = await res.json();
                  const items_arr = data.content;
                  setLocalProducts(prev => [
                      ...prev,
                      ...items_arr
                  ]);
                  setLocalIds(localIds.slice(items_arr.length));
                  if(items_arr.length < 9)
                  {
                    setShowOnLoad(false);
                  }
                }
          } catch (err) {
              }
              finally{
                setLoadingProducts(false);
              }
  }};

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting) {
          if(loadingProducts)
          {
            return;
          }
          else
          {
            loadProducts();
          }
        }
      },
      {
        threshold: 0.5,
      }
    );

    if (buttonRef.current) {
      observer.observe(buttonRef.current);
    }

    return () => {
      if (buttonRef.current) {
        observer.unobserve(buttonRef.current);
      }
    };
  }, [loadProducts]);

  const handleClick = async (id) => {
    try{
            const res = await fetch(`${BASE_URL}/update-popularity`,{
                  method: "POST",
                  headers: {
                  "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    id: id
                    })
                  })
          } catch (err) {
              }
  }

        function StarsRating({ rating = 0 }) {
  const totalStars = 5;
  const stars = Array.from({ length: totalStars }, (_, i) => i + 1);

  return (
    <div className="rating-container" style={{ display: "flex" }}>
      {stars.map((star) => (
        <svg
          key={star}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="40"
          height="40"
          strokeWidth="2"
          strokeLinejoin="round"
          style={{
          fill: star <= rating ? "#cb9500" : "transparent",
          stroke: star <= rating ? "#cb9500" : "#808080"
          }}
        >
          <path d="M12 2.5l3.09 6.26 6.91.99-5 4.87 
                   1.18 6.88L12 18.77l-6.18 3.23 
                   1.18-6.88-5-4.87 6.91-.99L12 2.5z"
                   />
        </svg>
      ))}
    </div>
  );
}

    return(
        <div className={`products-container ${localProducts.length > 0 ? "active" : ""}`}>
          {loading ? (
            <LoadingGifPage loading={loading}/>
          ): (
            <>
            <div className="items-container">
                                {localProducts.length > 0 ? (
                                    <div className={`products-grid-${cols}`}>
                                      {isAdmin && show_other_admin_btns && groupName != "all" && (
                                          <button className="productsGrid-add-btn" onClick={() => onCreated(group_id)}>
                              <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512.000000 512.000000"
                    preserveAspectRatio="xMidYMid meet">

                    <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)">
                    <path d="M2412 5100 c-109 -29 -187 -74 -272 -160 -87 -86 -131 -163 -160
                    -276 -19 -73 -20 -113 -20 -791 l0 -713 -713 0 c-678 0 -718 -1 -791 -20 -113
                    -29 -190 -73 -276 -160 -87 -86 -131 -163 -160 -276 -25 -98 -25 -190 0 -288
                    29 -113 73 -190 160 -276 86 -87 163 -131 276 -160 73 -19 113 -20 791 -20
                    l713 0 0 -713 c0 -678 1 -718 20 -791 29 -113 73 -190 160 -276 86 -87 163
                    -131 276 -160 98 -25 190 -25 288 0 113 29 190 73 276 160 87 86 131 163 160
                    276 19 73 20 113 20 791 l0 713 713 0 c678 0 718 1 791 20 113 29 190 73 276
                    160 87 86 131 163 160 276 25 98 25 190 0 288 -29 113 -73 190 -160 276 -86
                    87 -163 131 -276 160 -73 19 -113 20 -791 20 l-713 0 0 713 c0 678 -1 718 -20
                    791 -11 43 -34 105 -52 139 -42 81 -164 203 -245 245 -132 69 -291 88 -431 52z
                    m282 -314 c62 -31 109 -80 140 -145 21 -45 21 -59 26 -861 5 -755 6 -817 23
                    -847 38 -71 -9 -67 897 -73 802 -5 816 -5 861 -26 66 -31 114 -78 146 -142 23
                    -47 28 -70 28 -132 -1 -124 -56 -214 -163 -267 l-57 -28 -815 -5 c-906 -6
                    -859 -2 -897 -73 -17 -30 -18 -92 -23 -847 -5 -802 -5 -816 -26 -861 -31 -66
                    -78 -114 -142 -146 -47 -23 -70 -28 -132 -28 -125 0 -222 62 -274 174 -21 45
                    -21 59 -26 861 -6 906 -2 859 -73 897 -30 17 -92 18 -847 23 -802 5 -816 5
                    -861 26 -66 31 -114 78 -146 142 -23 47 -28 70 -28 132 1 124 56 214 163 267
                    l57 28 815 5 c915 6 860 1 900 80 20 38 20 58 20 828 0 863 -1 846 59 929 84
                    116 243 154 375 89z"/>
                  </g>
                </svg>
                            </button>
                                        )}
                                        {localProducts.map((p) => (
                                         <div key={p.id} id={`product-${p.id}`} className={`item-${cols}`}>
                                            <div className={`item-image-container-${cols}`} onMouseLeave={() => setIdxDirect(p.id, 0)}>
                                              <Link
                                                to={p.api_adress}
                                                className="item-ref-btn"
                                                onClick={() => { handleClick(p.id); saveOffsetY(); }}
                                              >
                                              {(p.images?.length ? p.images : [{ src: "/images/fallback.webp" }]).map((img, i) => (
                                              <img
                                              key={i}
                                              loading="lazy"
                                              src={img.src}
                                              alt={p.name}
                                              className={`item-image ${(imgIdx[p.id] ?? 0) === i ? "is-active" : ""}`}
                                              onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "/images/fallback.webp";
                                              }}
                                              />
                                            ))}

                                            {p.images?.length > 1 && (
                                              <div className="hover-zones">
                                                <div
                                                    className="hover-zone"
                                                    onMouseEnter={() => setIdxDirect(p.id, 1)}
                                                  />
                                              </div>
                                            )}
                                            </Link>

                                              <div className="itemHoover">
                                              {p.discount > 0 && <span className="discount">скидка</span>}
                                              {/* <button className={`orderBtn-small-${cols}`} onClick={() => {setSelectedItem(p.name); setVisibleRequest(true);}}>заказать</button> */}
                                              </div>
                                              {isAdmin && show_other_admin_btns && groupName==="all" && (
                                          <button className="productsGrid-on-update-btn-order" onClick={() => onUpdateOrder(p.id, p.order_id)}>
                                          <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                                              width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
                                              preserveAspectRatio="xMidYMid meet">

                                              <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                                              fill="#000000" stroke="none">
                                              <path d="M1963 4785 c-85 -23 -153 -63 -219 -129 -34 -34 -73 -85 -88 -114
                                              -58 -114 -56 -81 -56 -1135 l0 -969 -92 88 c-109 103 -161 138 -247 164 -78
                                              25 -196 26 -272 4 -152 -44 -279 -172 -323 -323 -20 -70 -20 -192 0 -262 36
                                              -122 44 -131 744 -826 367 -365 689 -680 715 -702 113 -93 331 -191 515 -233
                                              97 -21 127 -23 405 -23 248 0 315 3 387 18 257 52 471 164 657 343 159 152
                                              268 322 335 524 68 202 68 203 73 945 5 767 3 817 -52 931 -64 132 -192 234
                                              -333 263 -90 19 -130 15 -268 -24 -17 -5 -22 0 -32 33 -17 56 -81 151 -134
                                              197 -169 149 -398 164 -585 40 l-53 -35 -53 35 c-126 84 -286 107 -410 60 -16
                                              -7 -17 14 -17 348 0 199 -4 378 -10 408 -17 89 -63 174 -133 243 -124 125
                                              -294 174 -454 131z m205 -332 c14 -10 35 -32 46 -47 21 -27 21 -36 24 -937 l2
                                              -909 160 0 159 0 3 349 c3 335 4 351 24 377 39 53 71 69 134 69 63 0 95 -16
                                              134 -69 20 -26 21 -42 24 -377 l3 -349 159 0 159 0 3 349 c3 335 4 351 24 377
                                              39 53 71 69 134 69 63 0 95 -16 134 -69 20 -26 21 -42 24 -377 l3 -349 169 0
                                              170 0 0 186 c0 170 2 190 20 220 23 36 91 74 135 74 44 0 112 -38 135 -75 21
                                              -33 21 -39 18 -777 -3 -741 -4 -743 -26 -823 -64 -219 -199 -413 -377 -540
                                              -87 -62 -234 -130 -341 -157 -82 -21 -110 -23 -374 -23 -313 0 -343 4 -499 66
                                              -171 68 -192 86 -898 785 -361 357 -664 662 -675 679 -34 56 -19 123 39 176
                                              60 56 118 64 174 26 19 -13 191 -178 382 -368 l347 -344 0 1342 c0 926 3 1350
                                              11 1370 14 37 47 72 84 89 40 19 119 12 153 -13z"/>
                                            </g>
                                          </svg>
                                        </button>
                                        )}
                                              {isAdmin && show_other_admin_btns && groupName != "all" &&(
                                          <button className="productsGrid-on-delete-btn" onClick={() => {
                                          if (window.confirm("Вы уверены, что хотите безвозвратно удалить элемент?")) {onDelete(p.id, p.page_id, p.reviews_id)}}}>
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
                                        {isAdmin && show_other_admin_btns && groupName != "all" && ( 
                                          <button className="productsGrid-on-update-btn" onClick={() => onUpdate(group_id, p)}>
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
                                            <div className={`item-content-${cols}`}>
                                              <span className="item-title">{p.name}</span>
                                              <p className="item-description">{p.description}</p>
                                              {p.capacity > 0 && (
                                                <span className="item-copacity">{p.capacity + " Чел."}</span>
                                              )}
                                              <StarsRating rating={p.rating} />
                                              {p.price > 0 && (
                                                <div className="item-price">
                                                <div>
                                                  <span className="from">От:</span>
                                               {p.discount > 0 ? <span className="discountPrice">{p.discount + " руб/час"}</span>
                                               : <span className="price">{p.price + " руб/час"}</span>
                                               }
                                                </div>
                                                {p.discount > 0 && <span className="price">{p.price + " руб/час"}</span>} 
                                              </div>
                                              )}
                                              <div className="item-tags">
                                                {p.tags.map((tag) => (
                                                  <div className="tooltip-wrapper" key={tag.id}>
                                                    <img loading="lazy" src={tag.image_src} alt={tag.name}/>
                                                    <span className="tooltip-text">{tag.name}</span>
                                                  </div>
                                                ))}
                                              </div>
                                              {/* <button className={`orderBtn-big-${cols}`} onClick={() => {setSelectedItem(p.name); setVisibleRequest(true);}}>заказать</button> */}
                                            </div>
                                            {show_favourites && (
                                            <button className="delete-from-favourites" onClick={() => {toggleFavourite(p.id); handleDeleteProduct(p.id);}}>
                                              удалить из избранных
                                            </button>
                                          )}
                                         </div>
                                        ))}
                                    </div>
                                ) : isAdmin && show_other_admin_btns && groupName != "all" ? (
                                    <button className="productsGrid-add-btn-null" onClick={() => onCreated(group_id)}>
                              <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512.000000 512.000000"
                    preserveAspectRatio="xMidYMid meet">

                    <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)">
                    <path d="M2412 5100 c-109 -29 -187 -74 -272 -160 -87 -86 -131 -163 -160
                    -276 -19 -73 -20 -113 -20 -791 l0 -713 -713 0 c-678 0 -718 -1 -791 -20 -113
                    -29 -190 -73 -276 -160 -87 -86 -131 -163 -160 -276 -25 -98 -25 -190 0 -288
                    29 -113 73 -190 160 -276 86 -87 163 -131 276 -160 73 -19 113 -20 791 -20
                    l713 0 0 -713 c0 -678 1 -718 20 -791 29 -113 73 -190 160 -276 86 -87 163
                    -131 276 -160 98 -25 190 -25 288 0 113 29 190 73 276 160 87 86 131 163 160
                    276 19 73 20 113 20 791 l0 713 713 0 c678 0 718 1 791 20 113 29 190 73 276
                    160 87 86 131 163 160 276 25 98 25 190 0 288 -29 113 -73 190 -160 276 -86
                    87 -163 131 -276 160 -73 19 -113 20 -791 20 l-713 0 0 713 c0 678 -1 718 -20
                    791 -11 43 -34 105 -52 139 -42 81 -164 203 -245 245 -132 69 -291 88 -431 52z
                    m282 -314 c62 -31 109 -80 140 -145 21 -45 21 -59 26 -861 5 -755 6 -817 23
                    -847 38 -71 -9 -67 897 -73 802 -5 816 -5 861 -26 66 -31 114 -78 146 -142 23
                    -47 28 -70 28 -132 -1 -124 -56 -214 -163 -267 l-57 -28 -815 -5 c-906 -6
                    -859 -2 -897 -73 -17 -30 -18 -92 -23 -847 -5 -802 -5 -816 -26 -861 -31 -66
                    -78 -114 -142 -146 -47 -23 -70 -28 -132 -28 -125 0 -222 62 -274 174 -21 45
                    -21 59 -26 861 -6 906 -2 859 -73 897 -30 17 -92 18 -847 23 -802 5 -816 5
                    -861 26 -66 31 -114 78 -146 142 -23 47 -28 70 -28 132 1 124 56 214 163 267
                    l57 28 815 5 c915 6 860 1 900 80 20 38 20 58 20 828 0 863 -1 846 59 929 84
                    116 243 154 375 89z"/>
                  </g>
                </svg>
                            </button>
                            ) : (
                              <div className="failed-to-find-container">
                                <div className="failed-to-find-container-msg">
                                  <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                                  width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
                                  preserveAspectRatio="xMidYMid meet">

                                  <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                                  fill="#000000" stroke="none">
                                  <path d="M2330 5110 c-494 -48 -950 -230 -1350 -538 -195 -150 -448 -432 -594
                                  -662 -63 -99 -186 -351 -230 -471 -49 -134 -102 -340 -128 -499 -31 -195 -31
                                  -565 0 -760 45 -276 116 -498 237 -745 132 -269 269 -460 489 -681 221 -220
                                  412 -357 681 -489 247 -121 469 -192 745 -237 195 -31 565 -31 760 0 276 45
                                  498 116 745 237 269 132 460 269 681 489 220 221 357 412 489 681 88 179 132
                                  296 180 476 63 240 78 371 78 649 0 278 -15 409 -78 649 -48 180 -92 297 -180
                                  476 -132 269 -269 460 -489 681 -221 220 -412 357 -681 489 -246 121 -474 193
                                  -740 235 -147 23 -475 34 -615 20z m441 -250 c609 -59 1178 -359 1562 -823
                                  392 -474 585 -1091 527 -1688 -59 -609 -359 -1178 -823 -1562 -474 -392 -1091
                                  -585 -1688 -527 -464 45 -906 229 -1266 527 -579 479 -895 1241 -823 1984 60 
                                  621 367 1192 850 1585 125 101 267 191 431 273 379 189 817 271 1230 231z"/>
                                  <path d="M2310 4353 c-24 -9 -51 -36 -66 -65 -13 -24 -9 -189 25 -1295 22
                                  -698 42 -1293 45 -1324 9 -118 46 -139 246 -139 200 0 237 21 246 139 3 31 23
                                  626 45 1324 43 1373 43 1293 -11 1342 -21 19 -38 20 -269 22 -135 1 -253 -1
                                  -261 -4z"/>
                                  <path d="M2299 1293 c-57 -35 -59 -47 -59 -344 l0 -272 25 -33 c15 -20 40 -37
                                  63 -44 48 -13 416 -13 464 0 23 7 48 24 63 44 l25 33 0 272 c0 383 19 361
                                  -322 361 -198 0 -237 -3 -259 -17z"/>
                                  </g>
                                </svg>
                                  <span>Товаров, соответствующих вашему запросу, не обнаружено.</span>
                                </div>
                                <div className="failed-to-find-container-search">
                                  <input value={search} type="text" placeholder="Искать товары" onFocus={handleFocus} onBlur={handleBlur} onChange={changeSearch}/>
                    {search !== "" && (
                        <button className="errorPage-container-clear-button" onClick={() => {setSearch("")}}>
                        <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                        width="90.000000pt" height="90.000000pt" viewBox="0 0 90.000000 90.000000"
                        preserveAspectRatio="xMidYMid meet">

                        <g transform="translate(0.000000,90.000000) scale(0.100000,-0.100000)" fill="currentColor">
                        <path d="M205 695 c-14 -13 -25 -29 -25 -36 0 -6 44 -56 97 -110 l97 -99 -97
                            -99 c-53 -54 -97 -104 -97 -110 0 -15 46 -61 61 -61 6 0 56 44 110 97 l99 97
                            99 -97 c54 -53 104 -97 110 -97 15 0 61 46 61 61 0 6 -44 56 -97 110 l-97 99
                            97 99 c53 54 97 104 97 110 0 15 -46 61 -61 61 -6 0 -56 -44 -110 -97 l-99
                            -97 -99 97 c-54 53 -104 97 -110 97 -7 0 -23 -11 -36 -25z"/>
                        </g>
                    </svg>
                    </button>
                    )}
                    {search !== "" && (
                        <div className="errorPage-container-line">
                        </div>
                    )}
                    <button className="errorPage-search-btn" onClick={() => {navigate(`/search?${search}`);}}>
                        <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                            width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
                                preserveAspectRatio="xMidYMid meet">

                                <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                                    fill="#000000" stroke="none">
                                    <path d="M1940 5079 c-493 -25 -971 -242 -1334 -605 -295 -295 -496 -674 -570
                                    -1075 -168 -910 277 -1807 1104 -2228 454 -231 994 -284 1489 -145 177 50 429
                                    163 557 252 l59 40 605 -602 c546 -545 611 -606 670 -635 305 -147 651 109
                                    591 437 -24 130 -23 129 -680 786 l-608 608 82 161 c138 272 201 499 226 802
                                    44 550 -154 1119 -535 1533 -193 211 -404 365 -661 484 -154 71 -211 92 -354
                                    128 -214 54 -401 71 -641 59z m355 -684 c555 -91 1005 -512 1133 -1060 108
                                    -461 -25 -943 -353 -1284 -270 -280 -622 -431 -1007 -431 -371 0 -721 146
                                    -987 411 -196 197 -323 433 -383 712 -31 146 -31 399 1 546 82 384 296 696
                                    621 906 166 108 344 172 570 208 66 11 323 6 405 -8z"/>
                                </g>
                           </svg>
                    </button>
                    <div onFocus={handleFocus} onBlur={handleBlur} className={`search-dropdown ${search != "" && searchedData.length > 0 && isFocused ? "active" : ""}`}>
                      {(searchedData.length == 1) || (width < 750) ? (
                        <>
                        {searchedData.map((item, index) => (
                          <button onMouseDown={() => {navigate(item.api_adress); setOpen(false); setIsFocused(false);}} className="search-dropdown-1-item">
                          <div className="search-dropdown-1-item-image-container">
                            <img loading="lazy" src={item.images[0].src} alt={item.name} onError={(e) => {e.target.onerror = null; e.target.src = "/images/fallback.webp";}}/>
                          </div>
                          <div className="search-dropdown-1-item-desc-container">
                            <span className="search-dropdown-1-item-desc-container-name">{item.name}</span>
                            {item.price != 0 && (
                              <div className="search-dropdown-1-item-prices">
                              <span className="search-dropdown-1-item-prices-from">от:</span>
                              {item.discount != 0 && (
                                <span className="search-dropdown-1-item-prices-discount">{item.discount}{" "}руб/час</span>
                              )}
                              <span className="search-dropdown-1-item-prices-price">{item.price}{" "}руб/час</span>
                            </div>
                            )}
                          </div>
                        </button>
                        ))}
                        </>
                      ) : (
                          <div onFocus={handleFocus} onBlur={handleBlur} className="search-dropdown-wrapper">
                            <SimpleBar style={{ maxHeight: '300px', overflowY: 'auto', width: '100%' }} autoHide={false}>
                            <div className="search-dropdown-grid">
                              {searchedData.map((item, index) => (
                                <button onMouseDown={() => {navigate(item.api_adress); setOpen(false); setIsFocused(false);}} className="search-dropdown-grid-item">
                                <div className="search-dropdown-grid-item-image-container">
                                <img loading="lazy" src={item.images[0].src} alt={item.name} />
                                </div>
                                <div className="search-dropdown-grid-item-desc-container">
                                  <span className="search-dropdown-grid-item-name">{item.name}</span>
                                  {item.price !== 0 && (
                                    <div className="search-dropdown-grid-item-prices">
                                      <span className="search-dropdown-grid-item-from">от:</span>
                                      {item.discount !== 0 && (
                                    <span className="search-dropdown-grid-item-discount">{item.discount} руб/час</span>
                                      )}
                                      <span className="search-dropdown-grid-item-price">{item.price} руб/час</span>
                                  </div>
                                )}
                              </div>
                              </button>
                            ))}
                            {searchedData.length % 2 !== 0 && (
                                    <div className="search-dropdown-grid-item-placeholder"></div>
                                )}
                          </div>
                          {productsIds.length > 8 && (
                            <button className="view-all-btn" onMouseDown={() => {navigate(`/search?${search}`); setOpen(false); setIsFocused(false);}}>ВСЕ РЕЗУЛЬТАТЫ</button>
                          )}
                          </SimpleBar>
                          </div>
                      )}
                      </div>
                    <div className={`search-dropdown-no-found ${search != "" && searchedData.length === 0 && isFocused ? "show" : ""}`}>
                        <span>Товаров не найдено</span>
                      </div>
                                </div>
                                <div className="failed-to-find-container-text">
                                  <span>
                                    Аренда яхты в Санкт-Петербурге
                                  </span>
                                  <span>
                                    Прогулка на яхте по Финскому заливу и Неве — лучший отдых в Петербурге
                                  </span>
                                  <p>
                                    Это уникальная возможность насладиться величием Финского залива и историческими видами города с воды. 
                                    Прогулка на яхте откроет вам живописные уголки, где можно насладиться красотой природных пейзажей и 
                                    архитектурных памятников. Идеально подходит для романтических вечеров, 
                                    семейных прогулок или корпоративных мероприятий. Оперативное бронирование, 
                                    высококлассный сервис и комфорт на борту сделают ваше путешествие незабываемым!
                                  </p>
                                </div>
                              </div>
                            )}
                        </div>
                        {showOnLoad && Array.isArray(localIds) && localIds.length > 0 && (
                          <button ref={buttonRef} className="showMore-btn" onClick={() => loadProducts()}>
                            {loadingProducts ? (
                              <>
                              <span className="loading-spinner-products-gif"></span>
                              <span>загрузка...</span>
                              </>
                            ): (
                              <span>загрузить еще</span>
                            )}
                        </button>
                        )}
                        <div className={`admin-staff ${(isAdmin === true && show_admin_btns === true && show_other_admin_btns === true) ? "show" : ""}`}>
                          {isAdmin &&(
                                <button className="productsGrid-container-on-delete-from-page" onClick={() => onDeleteFromPage(compId)}>
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
                         {isAdmin && groupName != "all" && (
                                <button className="productsGrid-container-on-change" onClick={() => onUpdateFromPage(compId, group_name, cols, group_id)}>
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
            </>
          )}
          <CallRequest product_name={selectedItem} visible={visibleRequest} setVisible={setVisibleRequest}/>
        </div>
    );
}