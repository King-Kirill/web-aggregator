// import "./styles/ShopPage.css"
import React, { useEffect, useState, useRef } from "react";
import { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ItemsContext } from "../components/header/contexts/ItemsContext.jsx";
import ProductsGrid from "../components/productsGrid/ProductsGrid.jsx";
import { BASE_URL } from '../config';
import LoadingGifPage from "../components/LoadingGifPage/LoadingGifPage.jsx";
import { useStorageContext } from "../components/StorageContext.jsx";
import { Helmet } from "react-helmet-async";

export default function FavouritesPage() {
    const { favourites, toggleFavourite } = useStorageContext();
    const [loadingPage, setLoadingPage] = useState(true);
    const [products, setProducts] = useState([]);
    const { items } = useContext(ItemsContext);
    const [openHiddenCategory, setOpenHiddenCategory] = useState(false);
    const [gridCols, setGridCols] = useState(4);
    
    const navigate = useNavigate();

    useEffect(() => {
                 localStorage.setItem('page', 'favouritesPage');
               }, []);

    const checkPath = (path) => {
      if (/^https?:\/\//i.test(path)) {
        return false;
      } 
      else if (path.startsWith("/")) {
        return true;
      }
    };

  useEffect(() => {
    const stored = localStorage.getItem('favourites');
    const ids = stored ? JSON.parse(stored).map(Number) : [];
     const fetchMain = async () => {
     setLoadingPage(true);
     try {
       const res = await fetch(`${BASE_URL}/get-products-with-ids`,
         {
             method: "POST",
             headers: {
             "Content-Type": "application/json"
             },
             body: JSON.stringify({
             ids: ids
             })
         }
       );
 
       if (res.status === 200) {
        const data = await res.json();

        setProducts(data.content);
       }

     } catch (err) {
     }
     finally{
        setLoadingPage(false);
     }
   };

   fetchMain();
   }, []);

  return (
    <>
    <Helmet>
        <title>Избранное</title>
        <meta
          name="description"
          content="Избранные яхты и катера в каталоге Vip Boat — вернитесь к понравившимся судам для аренды в Санкт-Петербурге."
        />
        <link rel="canonical" href="https://vip-boat.ru/favourites" />
        <meta name="robots" content="noindex, follow" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebPage",
                "@id": "https://vip-boat.ru/favourites#webpage",
                "url": "https://vip-boat.ru/favourites",
                "name": "Избранное — Vip Boat",
                "inLanguage": "ru-RU",
                "isPartOf": { "@id": "https://vip-boat.ru/#website" }
              }
            ]
          })}
        </script>
    </Helmet>
    <div className="shopPage-section">
      <div className="title-container">
            <div className="title">
                <div className="title-container-inner">
                    <button className="title-container-inner-svg-btn" onClick={() => navigate('/')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="24" viewBox="0 0 32 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                       <line x1="28" y1="12" x2="4" y2="12"/>
                       <polyline points="12 20 4 12 12 4"/>
                    </svg>
                </button>
                <span>
                    ИЗБРАННОЕ
                </span>
                </div>
                <div className="shopPage-title-container-routing">
                    <button onClick={() => navigate('/')}>
                        Домой
                    </button>
                    <span>
                        /
                    </span>
                    <span>
                        Избранное
                    </span>
                </div>
            </div>
            <div className="title-container-buttons">
                   {items.slice(0, 3).map((itemObj, index) => (
                   <>
                                {checkPath(itemObj.api_adress) ? (
                                  <Link to={itemObj.api_adress} key={index} className="title-container-real-buttons">
                                    <span className="title-container-buttons-title">{itemObj.name}</span>
                                    <div className={`underLine ${itemObj.name}`}></div>
                                    <span className="underline-amount">{itemObj.amount + " Товаров"}</span>
                                  </Link>
                                ) : (
                                  <a href={itemObj.api_adress} className="title-container-real-buttons" target="_blank" rel="noopener noreferrer">
                                    <span className="title-container-buttons-title">{itemObj.name}</span>
                                    <div className={`underLine ${itemObj.name}`}></div>
                                    <span className="underline-amount">{itemObj.amount + " Товаров"}</span>
                                  </a>
                                )}
                                </>
                ))}
            </div>
            <button className="hiddenCategory" onClick={() => 
              {openHiddenCategory ? setOpenHiddenCategory(false) : setOpenHiddenCategory(true)}
            }>
              <span>
                Категории
              </span>
              <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
             <div className={`title-container-buttons-2 ${openHiddenCategory ? "open" : ""}`}>
                   {items.slice(0, 3).map((itemObj, index) => (
                   <>
                                {checkPath(itemObj.api_adress) ? (
                                  <Link to={itemObj.api_adress} key={index} className="title-container-real-buttons">
                                    <span className="title-container-buttons-title">{itemObj.name}</span>
                                    <div className={`underLine ${itemObj.name}`}></div>
                                    <span className="underline-amount">{itemObj.amount + " Товаров"}</span>
                                  </Link>
                                ) : (
                                  <a href={itemObj.api_adress} className="title-container-real-buttons" target="_blank" rel="noopener noreferrer">
                                    <span className="title-container-buttons-title">{itemObj.name}</span>
                                    <div className={`underLine ${itemObj.name}`}></div>
                                    <span className="underline-amount">{itemObj.amount + " Товаров"}</span>
                                  </a>
                                )}
                                </>
                ))}
            </div>
        </div>
        <div className="main-container">
            <div className="content">
                <div className="main-page-container">
                  {loadingPage ? (
                    <LoadingGifPage loading={true}/>
                  ) : (
                    <>
                    <div className="horizontal-line-container">
                        <span className="horizontal-line-desc">Список ваших пожеланий</span>
                     <div className="horizontal-line">
                    </div>
                     </div>
                     <ProductsGrid gridCols={gridCols} ids={[]} show_admin_btns={false} products={products} show_other_admin_btns={false} show_favourites={true} setGridCols={setGridCols}/>
                    </>
                  )}
                </div>
            </div>
        </div>
    </div>
    </>
  );
}