// import "./styles/ShopPage.css"
import React, { useEffect, useState, useRef } from "react";
import { useContext } from "react";
import { ItemsContext } from "../components/header/contexts/ItemsContext.jsx";
import ProductsGrid from "../components/productsGrid/ProductsGrid.jsx";
import ReactSlider from 'react-slider';
import { useNavigate, Link } from "react-router-dom";
import { BASE_URL } from '../config';
import Toast from "../components/adminMessage/adminMessage.jsx";
import { lazy, Suspense } from 'react';
const ModalManager = lazy(() => import('../components/modalManager/ModalManager.jsx'));
import MainComponent from "../components/MainComponents/MainComponent.jsx";
import { useLocation } from "react-router-dom";
import LoadingGif from "../components/loadingGif/LoadingGif.jsx";
import LoadingGifPage from "../components/LoadingGifPage/LoadingGifPage.jsx";
import { div } from "framer-motion/client";
import AuthForm from "../components/AuthForm/AuthForm.jsx";
import { Helmet } from "react-helmet-async";
import MetaBtn from "./MetaBtn.jsx";

export default function ShopPage({ api_adress, setPages, pages, title, description, robots, ld_json, db_id }) {
  const location = useLocation();
  const [width, setWidth] = useState(window.innerWidth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [firstRender, setFirstRender] = useState(true);
  const [hasParams, setHasParams] = useState(false);
  
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

  const [selectedFilters, setSelectedFilters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadAmount, setLoadAmount] = useState(9);
  const [gridButtons, setGridButtons] = useState([]);
  const [activeIndex, setActiveIndex] = useState(6);
  const [gridCols, setGridCols] = useState(4);
  const [openFilters, setOpenFilteres] = useState(false);
  const [currentPriceFilter, setCurrentPriceFilter] = useState(0);
  const [openHiddenCategory, setOpenHiddenCategory] = useState(false);
  const [openHiddenFilter, setOpenHiddenFilter] = useState(false);
  const [toiletTags, setToiletTags] = useState([]);
  const [capacityTags, setCapacityTags] = useState([]);
  const [otherFilters, setOtherFilters] = useState([]);
  const [itemPageId, setItemPageId] = useState(0);
  const [productPageId, setProductPageId] = useState(0);
  const [itemReviewsId, setItemReviewsId] = useState(0);
  const [tempLocalMaxPrice, setTempLocalMaxPrice] = useState(0);
  const [tempLocalMinPrice, setTempLocalMinPrice] = useState(0);
  const [scrollTo, setScrollTo] = useState(0);

  const { items } = useContext(ItemsContext);
  const [localMaxPrice, setLocalMaxPrice] = useState(0);
  const [localMinPrice, setLocalMinPrice] = useState(0);
  const [filterToilets, setFilterToilets] = useState([]);
  const [filterCapacities, setFilterCapacities] = useState([]);
  const [maxSlider, setMaxSlider] = useState(0);
  const [minSlider, setMinSlider] = useState(0);
  const [products, setProducts] = useState([]);
  const [pageObj, setPageObj] = useState(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [innerLoadingPage, setInnerLoadingPage] = useState(true);
  const [pageComponents, setPageComponents] = useState([]);
  const [pageId, setPageId] = useState(0);

  const [templateType, setTemplateType] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [handlerType, setHandlerType] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [statusCode, setStatusCode] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemId, setItemId] = useState(0);
  const [itemAdress, setItemAdress] = useState("");
  const [first, setFirst] = useState(true);
  const [itemGroupId, setItemGroupId] = useState(0);
  const [itemCapacity, setItemCapacity] = useState(0);
  const [itemDesc, setItemDesc] = useState("");
  const [itemDiscount, setItemDiscount] = useState(0);
  const [itemImages, setItemImages] = useState([]);
  const [itemPrice, setItemPrice] = useState(0);
  const [itemRating, setItemRating] = useState(0);
  const [itemTags, setItemTags] = useState([]);
  const [itemSearchTags, setItemSearchTags] = useState([]);
  const [itemToilet, setItemToilet] = useState("");
  const [mainGroupId, setMainGroupId] = useState(0);
  const [ids, setIds] = useState([]);
  const [visibleAuth, setVisibleAuth] = useState(false);
  const [ready, setReady] = useState(false);
  const [firstInteraction, setFirstInteraction] = useState(true);
  const [itemDate, setItemDate] = useState("");
  const [ldJsonObj, setLdJsonObj] = useState("");
  const [isOpenImage, setIsOpenImage] = useState(false);

  const [pageImage, setPageImage] = useState("");
  const [mobilePageImage, setMobilePageImage] = useState("");
  const [currBckgImage, setCurrBckgImage] = useState("");
  const [imageFile, setImageFile] = useState();
  const [imageMobileFile, setImageMobileFile] = useState();

  const navigate = useNavigate();

  const checkPath = (path) => {
      if (/^https?:\/\//i.test(path)) {
        return false;
      } 
      else if (path.startsWith("/")) {
        return true;
      }
    };

    useEffect(() => {
      const updateImage = () => {
        const width = window.innerWidth;
        if (width < 550) {
          if(mobilePageImage)
          {
            setCurrBckgImage(mobilePageImage);
          }
        } else {
          if(pageImage)
          {
            setCurrBckgImage(pageImage);
          }
        }
      };
  
      updateImage();
      window.addEventListener("resize", updateImage);
  
      return () => window.removeEventListener("resize", updateImage);
    }, [pageImage]);


      useEffect(() => {
      const updateGridCols = () => {
        const width = window.innerWidth;
        if (width < 800) {
          setGridCols(2);
        } else if (width < 1250) {
          setGridCols(gridCols);
        }
      };
  
      updateGridCols();
      window.addEventListener("resize", updateGridCols);
  
      return () => window.removeEventListener("resize", updateGridCols);
    }, [gridCols]);

    const getPresignedData = async (fileName, fileType) => {
          const res = await fetch(`${BASE_URL}/get-presigned-url`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              name: fileName,
              type: fileType,
            }),
          });
        
          if(res.status === 401)
          {
            setStatusCode(res.status);
                    setToastMessage("Неавторизованный пользователь!");
                    setVisibleAuth(true);
                    setLoading(false);
          }
          return await res.json();
        };
    
        const uploadFileToS3 = async (file) => {
        try {
        const presignedData = await getPresignedData(file.name, file.type);
        const formData = new FormData();
    
        Object.entries(presignedData.url.fields).forEach(([key, value]) => {
          formData.append(key, value);
        });
        formData.append("file", file);
    
        await fetch(presignedData.url.url, {
          method: "POST",
          body: formData,
        });
    
        const publicUrl = `${presignedData.url.url}/${presignedData.url.fields.key}`;
        return publicUrl;
        } catch (err) {
        return null;
        }};

  const confirmImageChanges = async () => {
  setLoading(true);
  try {
    // Desktop — только если файл выбран
    if (imageFile) {
      const url = await uploadFileToS3(imageFile);
      if (!url) throw new Error("S3 upload failed (desktop)");

      const res = await fetch(`${BASE_URL}/create-image-in-shop-page-desktop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: pageId, image_src: url }),
      });
      if (res.status === 200) {
        setStatusCode(res.status);
        setToastMessage("Изображение обновлено!");
        setPageImage(url);
      } else if (res.status === 404) {
        setStatusCode(res.status);
        setToastMessage("Ошибка обновления!");
      } else if (res.status === 500) {
        setStatusCode(res.status);
        setToastMessage("Внутренняя ошибка сервера!");
      } else if (res.status === 401) {
        setStatusCode(res.status);
        setToastMessage("Неавторизованный пользователь!");
        setVisibleAuth(true);
      } else {
        setStatusCode(res.status);
        setToastMessage("Произошла непредвиденная ошибка!");
      }
    }

    // Mobile — только если файл выбран
    if (imageMobileFile) {
      const url = await uploadFileToS3(imageMobileFile);
      if (!url) throw new Error("S3 upload failed (mobile)");

      const res = await fetch(`${BASE_URL}/create-image-in-shop-page-mobile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: pageId, image_src: url }),
      });
      if (res.status === 200) {
        setStatusCode(res.status);
        setToastMessage("Изображение обновлено!");
        setMobilePageImage(url);
      } else if (res.status === 404) {
        setStatusCode(res.status);
        setToastMessage("Ошибка обновления!");
      } else if (res.status === 500) {
        setStatusCode(res.status);
        setToastMessage("Внутренняя ошибка сервера!");
      } else if (res.status === 401) {
        setStatusCode(res.status);
        setToastMessage("Неавторизованный пользователь!");
        setVisibleAuth(true);
      } else {
        setStatusCode(res.status);
        setToastMessage("Произошла непредвиденная ошибка!");
      }
    }
  } catch (err) {
    console.error(err);
    setStatusCode(500);
    setToastMessage("Ошибка обновления");
  } finally {
    setLoading(false);
  }
};


const onDeletePage = async () => {
        try{
            setLoading(true);
            const res_page = await fetch(`${BASE_URL}/delete-page/${pageId}`, {
                method: "DELETE",
                headers: {
                "Content-Type": "application/json",
                }, credentials: "include",
            });

             if (res_page.status === 200) {
              setStatusCode(res_page.status);
              setToastMessage("Страница удалена успешно!");
              navigate("/");
              } else if (res_page.status === 404) {
              setStatusCode(res_page.status);
              setToastMessage("Внутренняя ошибка сервера!");
              } else if (res_page.status === 500) {
              setStatusCode(res_page.status);
              setToastMessage("Элемент с таким ключом уже сущетсвует!");
              } else if (res_page.status === 401) {
            setStatusCode(res_page.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          }
 else {
              setStatusCode(res_page.status);
              setToastMessage("Произошла непредвиденная ошибка!");
              }
        }
        catch(err)
        {
        }
        finally{
            setLoading(false);
        }
    }

  useEffect(() => {
     const fetchMain = async () => {
      const page = localStorage.getItem('page');
      
      setLoadingPage(true);
      setInnerLoadingPage(true);

      if(page === "productPage")
      {
        const product_adress = localStorage.getItem('productAdress');

        try {
       const res = await fetch(`${BASE_URL}/load-shop-page`,
         {
             method: "POST",
             headers: {
             "Content-Type": "application/json"
             },
             body: JSON.stringify({
             adress: api_adress,
             productAdress: product_adress
             })
         }
       );
 
       if (res.status === 200) {
        const data = await res.json();
        setLocalMaxPrice(data.content.content.filters.max_price);
        setMaxSlider(data.content.content.filters.max_price);
        setTempLocalMaxPrice(data.content.content.filters.max_price);
        setLocalMinPrice(data.content.content.filters.min_price);
        setMinSlider(data.content.content.filters.min_price);
        setTempLocalMinPrice(data.content.content.filters.min_price);
        setFilterToilets(data.content.content.filters.toilets);
        setFilterCapacities(data.content.content.filters.capacities);
        setMainGroupId(data.content.content.products.obj.id);
        setPageObj(data.content.obj);
        setPageId(data.content.obj.id);
        setProducts(data.content.content.products.items);
        setIds(data.content.content.products.ids);
        const hasScrollTo = data.content.content.products?.scroll_to;
        if(hasScrollTo) setScrollTo(data.content.content.products.scroll_to);
        setLoadingPage(false);
        const sortByOrderId = (arr) => arr.sort((a, b) => a.order_id - b.order_id);
        const sortedComponents = sortByOrderId(data.content.components);
        setPageComponents(sortedComponents);
        setPageImage(data.content.content.desc_image_src);
        setMobilePageImage(data.content.content.mobile_image_src);
       }

     } catch (err) {
     }
     finally{
      setInnerLoadingPage(false);
      setTimeout(() => {
          setFirstRender(false);
        }, 2000);
     }
      }
      else
      {
        try {
       const res = await fetch(`${BASE_URL}/load-page`,
         {
             method: "POST",
             headers: {
             "Content-Type": "application/json"
             },
             body: JSON.stringify({
             adress: api_adress
             })
         }
       );
 
       if (res.status === 200) {
        const data = await res.json();
        setLocalMaxPrice(data.content.content.filters.max_price);
        setMaxSlider(data.content.content.filters.max_price);
        setTempLocalMaxPrice(data.content.content.filters.max_price);
        setLocalMinPrice(data.content.content.filters.min_price);
        setMinSlider(data.content.content.filters.min_price);
        setTempLocalMinPrice(data.content.content.filters.min_price);
        setFilterToilets(data.content.content.filters.toilets);
        setFilterCapacities(data.content.content.filters.capacities);
        setMainGroupId(data.content.content.products.obj.id);
        setPageObj(data.content.obj);
        setPageId(data.content.obj.id);
        setPageImage(data.content.content.desc_image_src);
        setMobilePageImage(data.content.content.mobile_image_src);

        console.log(data.content.content);

        setProducts(data.content.content.products.items);
        setIds(data.content.content.products.ids);
        setLoadingPage(false);
        const sortByOrderId = (arr) => arr.sort((a, b) => a.order_id - b.order_id);
        const sortedComponents = sortByOrderId(data.content.components);
        setPageComponents(sortedComponents);

        try {
          // Преобразуем строку в объект
          setLdJsonObj(JSON.parse(ld_json));
        } catch (e) {}

        if (/\?|%2B|\+/.test(location.search)) {
          setHasParams(true);
        } else {
          setHasParams(false);
        }

       }

     } catch (err) {
     }
     finally{
      setInnerLoadingPage(false);
      setTimeout(() => {
          setFirstRender(false);
        }, 2000);
     }
      }
   };

   fetchMain();

   const buttons = [
      {
        id: 1,
        cols: 0,
        svg: 
        (
          <svg className="first-svg" width="50px" height="50px" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                            <g strokeWidth="2" strokeLinecap="round">
                            <line x1="0" y1="1" x2="18" y2="1"/>
                            <line x1="0" y1="9" x2="18" y2="9"/>
                            <line x1="0" y1="17" x2="18" y2="17"/>
                            </g>
                            </svg>
        )
      },
      {
        id: 2,
        cols: 1,
        svg: 
        (
          <svg className="second-svg" width="50px" height="50px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0" y="1" width="24" height="8" strokeWidth="2" strokeLinecap="round"/>

                            <rect x="0" y="15" width="24" height="8" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
        )
      },
      {
        id: 3,
        cols: 2,
        svg: 
        (
          <svg className="third-svg" width="50px" height="50px" viewBox="0 0 7.2 7.2" xmlns="http://www.w3.org/2000/svg">
	                            <g strokeWidth="0.4" strokeLinejoin="miter">
		                        <rect x="0.2" y="0.2" width="3" height="3"/>
		                        <rect x="3.8" y="0.2" width="3" height="3"/>

		                        <rect x="0.2" y="3.8" width="3" height="3"/>
		                        <rect x="3.8" y="3.8" width="3" height="3"/>
	                            </g>
                            </svg>
        )
      },
      {
        id: 4,
        cols: 5,
        svg: 
        (
          <svg className="others-svg" width="63px" height="50px" viewBox="0 0 17.4 13.8" xmlns="http://www.w3.org/2000/svg">
	                        <g>
		                    <rect x="0" y="0" width="3" height="3"/>
		                    <rect x="3.6" y="0" width="3" height="3"/>
		                    <rect x="7.2" y="0" width="3" height="3"/>
		                    <rect x="10.8" y="0" width="3" height="3"/>
		                    <rect x="14.4" y="0" width="3" height="3"/>

		                    <rect x="0" y="3.6" width="3" height="3"/>
		                    <rect x="3.6" y="3.6" width="3" height="3"/>
		                    <rect x="7.2" y="3.6" width="3" height="3"/>
		                    <rect x="10.8" y="3.6" width="3" height="3"/>
		                    <rect x="14.4" y="3.6" width="3" height="3"/>

		                    <rect x="0" y="7.2" width="3" height="3"/>
		                    <rect x="3.6" y="7.2" width="3" height="3"/>
		                    <rect x="7.2" y="7.2" width="3" height="3"/>
		                    <rect x="10.8" y="7.2" width="3" height="3"/>
		                    <rect x="14.4" y="7.2" width="3" height="3"/>

		                    <rect x="0" y="10.8" width="3" height="3"/>
		                    <rect x="3.6" y="10.8" width="3" height="3"/>
		                    <rect x="7.2" y="10.8" width="3" height="3"/>
		                    <rect x="10.8" y="10.8" width="3" height="3"/>
		                    <rect x="14.4" y="10.8" width="3" height="3"/>
	                        </g>
                            </svg>
        )
      },
      {
        id: 5,
        cols: 6,
        svg: 
        (
          <svg className="others-svg" width="75px" height="50px" viewBox="0 0 21 13.8" xmlns="http://www.w3.org/2000/svg">
	                        <g>
		                    <rect x="0" y="0" width="3" height="3"/>
		                    <rect x="3.6" y="0" width="3" height="3"/>
	                        <rect x="7.2" y="0" width="3" height="3"/>
		                    <rect x="10.8" y="0" width="3" height="3"/>
		                    <rect x="14.4" y="0" width="3" height="3"/>
		                    <rect x="18.0" y="0" width="3" height="3"/>

		                    <rect x="0" y="3.6" width="3" height="3"/>
		                    <rect x="3.6" y="3.6" width="3" height="3"/>
		                    <rect x="7.2" y="3.6" width="3" height="3"/>
		                    <rect x="10.8" y="3.6" width="3" height="3"/>
		                    <rect x="14.4" y="3.6" width="3" height="3"/>
		                    <rect x="18.0" y="3.6" width="3" height="3"/>

		                    <rect x="0" y="7.2" width="3" height="3"/>
		                    <rect x="3.6" y="7.2" width="3" height="3"/>
		                    <rect x="7.2" y="7.2" width="3" height="3"/>
		                    <rect x="10.8" y="7.2" width="3" height="3"/>
		                    <rect x="14.4" y="7.2" width="3" height="3"/>
		                    <rect x="18.0" y="7.2" width="3" height="3"/>

		                    <rect x="0" y="10.8" width="3" height="3"/>
		                    <rect x="3.6" y="10.8" width="3" height="3"/>
		                    <rect x="7.2" y="10.8" width="3" height="3"/>
		                    <rect x="10.8" y="10.8" width="3" height="3"/>
		                    <rect x="14.4" y="10.8" width="3" height="3"/>
		                    <rect x="18.0" y="10.8" width="3" height="3"/>
	                        </g>
                            </svg>
        )
      },
      {
        id: 6,
        cols: 3,
        svg: 
        (
                            <svg className="others-svg" width="50px" height="50px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="#8b8e87">

                            <rect x="0"   y="0"   width="9" height="9"/>
                            <rect x="11"  y="0"   width="9" height="9"/>
                            <rect x="22"  y="0"   width="9" height="9"/>

                            <rect x="0"   y="11"  width="9" height="9"/>
                            <rect x="11"  y="11"  width="9" height="9"/>
                            <rect x="22"  y="11"  width="9" height="9"/>

                            <rect x="0"   y="22"  width="9" height="9"/>
                            <rect x="11"  y="22"  width="9" height="9"/>
                            <rect x="22"  y="22"  width="9" height="9"/>
                            </svg>
        )
      },
      {
        id: 7,
        cols: 4,
        svg: 
        (
                            <svg className="others-svg" width="50px" height="50px" viewBox="0 0 13.8 13.8" xmlns="http://www.w3.org/2000/svg">
	                        <g>
		                    <rect x="0" y="0" width="3" height="3"/>
		                    <rect x="3.6" y="0" width="3" height="3"/>
		                    <rect x="7.2" y="0" width="3" height="3"/>
		                    <rect x="10.8" y="0" width="3" height="3"/>

		                    <rect x="0" y="3.6" width="3" height="3"/>
		                    <rect x="3.6" y="3.6" width="3" height="3"/>
		                    <rect x="7.2" y="3.6" width="3" height="3"/>
		                    <rect x="10.8" y="3.6" width="3" height="3"/>

		                    <rect x="0" y="7.2" width="3" height="3"/>
		                    <rect x="3.6" y="7.2" width="3" height="3"/>
		                    <rect x="7.2" y="7.2" width="3" height="3"/>
		                    <rect x="10.8" y="7.2" width="3" height="3"/>

		                    <rect x="0" y="10.8" width="3" height="3"/>
		                    <rect x="3.6" y="10.8" width="3" height="3"/>
		                    <rect x="7.2" y="10.8" width="3" height="3"/>
		                    <rect x="10.8" y="10.8" width="3" height="3"/>
	                        </g>
                            </svg>
        )
      }
    ];

  setGridButtons(buttons);
  setCurrBckgImage("");
   }, [api_adress]);

function toggleBtn(name, setTags){
  if(name === "Цена: от высокой до низкой" && selectedFilters.includes("Цена: от низкой до высокой"))
  {
    setSelectedFilters(prev => prev.filter(item => item !== "Цена: от низкой до высокой"));
    setTags(prev => prev.filter(item => item !== "Цена: от низкой до высокой"));

    setSelectedFilters(prev => [...prev, name]);
    setTags(prev => [...prev, name]);

    return;
  }
  else if(name === "Цена: от низкой до высокой" && selectedFilters.includes("Цена: от высокой до низкой"))
  {
    setSelectedFilters(prev => prev.filter(item => item !== "Цена: от высокой до низкой"));
    setTags(prev => prev.filter(item => item !== "Цена: от высокой до низкой"));

    setSelectedFilters(prev => [...prev, name]);
    setTags(prev => [...prev, name]);

    return;
  }

  if(selectedFilters.includes(name))
  {
      setSelectedFilters(prev => prev.filter(item => item !== name));
      setTags(prev => prev.filter(item => item !== name));
  }   
  else{
      setSelectedFilters(prev => [...prev, name]);
      setTags(prev => [...prev, name]);
  }
}

function addFilters(filterName, filterArray, setTags) {
  return (
    <div className="filters-wrapper" key={filterName}>
      <div className="filters-horizontal-line"></div>
      <span className="filters-wrapper-title">{filterName}</span>
      {filterArray.map((item) => (
        <div className="btn-tag-wrapper">
            <button
            className={`tag-btn ${selectedFilters.includes(item.name) ? "active" : ""}`}
            onClick={() => {
            toggleBtn(item.name, setTags);
            }}
            >
            <span className="checkbox-square">
              {selectedFilters.includes(item.name) && (
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
	            <path d="M1 6l3 3 7-7"/>
              </svg>
            )}
            </span>
            </button>
            <div className="tag-description">
              {filterName == "Вместимость" ? (
                <span>{item.name + " чел."}</span>
              ) : (
                <span>{item.name}</span>
              )}
            <span>{"(" + item.amount + ")"}</span>
            </div>
            </div>
         ))}
        </div>
  );
}

function showFilters()
{
  let firstPrice = maxSlider / 4;
  let secondPrice = firstPrice * 2;
  let thirdPrice = firstPrice * 3;
  let fourthPrice = maxSlider;

  return(
    <div className="filtersDialog">
      <div className="filtersDialog-content">
        <div className="filtersDialog-left">
          <span className="filtersDialog-title">
            Сортировать по
          </span>
          <button onClick={() => {
            toggleBtn("Популярность", setOtherFilters);}}>
            Популярность
          </button>
          <button onClick={() =>{
            toggleBtn("Рейтинг", setOtherFilters);}}>
            Рейтинг
          </button>
           <button onClick={() => {
            toggleBtn("Новизна", setOtherFilters);}}>
            Новизна
          </button>
          <button onClick={() => {
            toggleBtn("Цена: от низкой до высокой", setOtherFilters);}}>
            Цена: от низкой до высокой
          </button>
          <button onClick={() => {
            toggleBtn("Цена: от высокой до низкой", setOtherFilters);}}>
            Цена: от высокой до низкой
          </button>
        </div>
        {minSlider !== maxSlider && products.length !== 1 && (
           <div className="filtersDialog-right">
          <span className="filtersDialog-title">
            По цене
          </span>
          <button onClick={() => {{
            setCurrentPriceFilter(0);
            setLocalMinPrice(minSlider);
            setLocalMaxPrice(maxSlider);
            setTempLocalMinPrice(minSlider);
            setTempLocalMaxPrice(maxSlider);
          }; {
          }}} className={currentPriceFilter === 0 ? "active-btn-filter" : ""}>
            Все
          </button>
          <button onClick={() => {{
            setCurrentPriceFilter(1);
            setLocalMinPrice(minSlider);
            setLocalMaxPrice(firstPrice);
            setTempLocalMinPrice(minSlider);
            setTempLocalMaxPrice(firstPrice);
          }; {
          }}} className={currentPriceFilter === 1 ? "active-btn-filter" : ""}>
            {"0 руб./час - " + firstPrice + " руб./час"}
          </button>
          <button onClick={() => {{
            setCurrentPriceFilter(2);
            setLocalMinPrice(firstPrice);
            setLocalMaxPrice(secondPrice);
            setTempLocalMinPrice(firstPrice);
            setTempLocalMaxPrice(secondPrice);
          }; {
          }}} className={currentPriceFilter === 2 ? "active-btn-filter" : ""}>
            {firstPrice + " руб./час - " + secondPrice + " руб./час"}
          </button>
          <button onClick={() => {{
            setCurrentPriceFilter(3);
            setLocalMinPrice(secondPrice);
            setLocalMaxPrice(thirdPrice);
            setTempLocalMinPrice(secondPrice);
            setTempLocalMaxPrice(thirdPrice);
          }; {
          }}} className={currentPriceFilter === 3 ? "active-btn-filter" : ""}>
             {secondPrice + " руб./час - " + thirdPrice + " руб./час"}
          </button>
          <button onClick={() => {{
            setCurrentPriceFilter(4);
            setLocalMinPrice(thirdPrice);
            setLocalMaxPrice(fourthPrice);
            setTempLocalMinPrice(thirdPrice);
            setTempLocalMaxPrice(fourthPrice);
          }; {
          }}} className={currentPriceFilter === 4 ? "active-btn-filter" : ""}>
            {thirdPrice + " руб./час - " + fourthPrice + " руб./час"}
          </button>
        </div>
        )}
      </div>
    </div>
  )
}

const updateProductItem = async (group_id, product) =>{
    setItemAdress(product.api_adress);
    setItemCapacity(product.capacity);
    setItemDesc(product.description);
    setItemDiscount(product.discount);
    setItemGroupId(group_id);
    setItemId(product.id);
    setItemToilet(product.toilet);
    setItemImages(product.images);
    setItemName(product.name);
    setItemPrice(product.price);
    setItemRating(product.rating);
    setItemTags(product.tags);
    setItemSearchTags(product.search_tags);
    setTemplateType("updateProductItem");
    setHandlerType("updateProduct");
    setProductPageId(product.product_page_id);
    setItemDate(product.date);
    setItemPageId(product.page_id);
    setItemReviewsId(product.reviews_id);
    setOpenModal(true);
  }

const removeProduct = (id) => {
  let removedItem;
  setProducts(prev => {
    const updated = prev.filter(item => {
      if (item.id === id) removedItem = item;
      return item.id !== id;
    });
    return updated;
  });

  if (!removedItem) return;

  setFilterToilets(prev => {
    if (!removedItem.toilet) return prev;

    const updated = prev.map(f =>
      f.name === removedItem.toilet ? { ...f, amount: f.amount - 1 } : f
    ).filter(f => f.amount > 0);

    return updated;
  });

  setFilterCapacities(prev => {
    if (!removedItem.capacity) return prev;

    const updated = prev.map(f =>
      String(f.name) === String(removedItem.capacity)
        ? { ...f, amount: f.amount - 1 }
        : f
    ).filter(f => f.amount > 0);

    return updated;
  });

  const prev = pageComponents;

  let removedComponentIds = [];
  let removedGroupId = null;

  const updated = prev
    .map(comp => {
      if (comp.name !== "productsGrid") return comp;

      const items = comp.component_content?.items || [];
      const hasTarget = items.some(el => el.id === id);
      if (!hasTarget) return comp;

      const newItems = items.filter(el => el.id !== id);

      if (newItems.length === 0) {
        removedComponentIds.push(comp.id);
        removedGroupId = comp.group_id;
        return null;
      }

      return {
        ...comp,
        component_content: {
          ...comp.component_content,
          items: newItems
        }
      };
    })
    .filter(Boolean);

  setPageComponents(updated);

  const result = removedComponentIds.length
    ? { componentIds: removedComponentIds, group_id: removedGroupId }
    : null;

  return result;
};

const updateImage = async (e) => {
  setImageFile(e.target.files[0]);
}

const updateImageMobile = async (e) => {
  setImageMobileFile(e.target.files[0]);
}

const deleteProductItem = async (id, page_id, reviews_id) => {
  try {
    setLoading(true);
        const res = await fetch(`${BASE_URL}/delete-product/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        }, credentials: "include",
      });

      const res_page = await fetch(`${BASE_URL}/delete-page/${page_id}`, {
      method: "DELETE",
      headers: {
           "Content-Type": "application/json",
        }, credentials: "include",
      });

      const res_reviews = await fetch(`${BASE_URL}/delete-regular-reviews-group/${reviews_id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        }, credentials: "include",
      });
  
        if (res.status === 200 && res_page.status === 200 && res_reviews.status === 200) {
          const result = removeProduct(id);

          setStatusCode(res.status);
          setToastMessage("Элемент успешно удален!");
          
          if(result !== null){
            try {
                  const res2 = await fetch(`${BASE_URL}/delete-product-group/${result.group_id}`, {
                  method: "DELETE",
                  headers: {
                      "Content-Type": "application/json",
                }, credentials: "include",
                });
  
              if (res2.status === 404) {
              setStatusCode(res2.status);
              setToastMessage("Продукт удален успешно! Группу отзывов нельзя удалить на данный момент!");
              } else if (res2.status === 500) {
              setStatusCode(res2.status);
              setToastMessage("Элемент с таким ключом уже сущетсвует!");
              } else if (res2.status === 401) {
            setStatusCode(res2.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          } else {
              setStatusCode(res2.status);
              setToastMessage("Произошла непредвиденная ошибка!");
              }
          }
          catch (err) {
          }
  
          if (result.componentIds.length > 0) {
            for (const compId of result.componentIds) {
              try {
                const res2 = await fetch(`${BASE_URL}/delete-page-component/${compId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                }, credentials: "include",
               });
  
              if (res2.status === 404) {
              setStatusCode(res2.status);
              setToastMessage("Элемент не найден, таблица пуста!");
              } else if (res2.status === 500) {
              setStatusCode(res2.status);
              setToastMessage("Элемент с таким ключом уже сущетсвует!");
              } else if (res2.status === 401) {
            setStatusCode(res2.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          } else if (res2.status !== 200) {
              setStatusCode(res2.status);
              setToastMessage("Произошла непредвиденная ошибка!");
              }
  
            } catch (err) {
              console.log(err);
            }
          }
        }
          }
        } else if (res.status === 404) {
          setStatusCode(res.status);
          setToastMessage("Элемент не найден, таблица пуста!");
        } else if (res.status === 500) {
          setStatusCode(res.status);
          setToastMessage("Элемент с таким ключом уже сущетсвует!");
        } else if (res.status === 401) {
            setStatusCode(res.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          } else if (res_page.status === 404) {
          setStatusCode(res_page.status);
          setToastMessage("Элемент не найден, таблица пуста!");
        } else if (res_page.status === 401) {
            setStatusCode(res_page.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          } else if (res_page.status === 500) {
          setStatusCode(res_page.status);
          setToastMessage("Внутренняя ошибка сервера!");
        } else {
          setStatusCode(500);
          setToastMessage("Произошла непредвиденная ошибка!");
        }
      }
      catch (err) {
        console.log(err);
      }
      finally{
          setLoading(false);
        }
};

const updateTags = (updateToilet, updateCapacity, id) =>
{
  const oldToiletName = products.find(p => p.id === id)?.toilet;
  const sameToiletName = filterToilets.find(item => item.name === updateToilet);

  if(oldToiletName !== updateToilet)
  {
    if(sameToiletName)
    {
    setFilterToilets(prev =>
    prev.map(item =>
    item.name === updateToilet
      ? { ...item, amount: item.amount + 1 }
      : item
    )
    );


  setFilterToilets(prev =>
  prev
    .map(item =>
      item.name === oldToiletName
        ? { ...item, amount: item.amount - 1 }
        : item
    )
    .filter(item => item.amount > 0)
);
    }
    else{
     setFilterToilets(prev =>
  prev
    .map(item =>
      item.name === oldToiletName
        ? { ...item, amount: item.amount - 1 }
        : item
    )
    .filter(item => item.amount > 0)
);
   
  const newToilet = {
    name: updateToilet,
    amount: 1
  }

  setFilterToilets(prev => [...prev, newToilet]);
  }
  }

  const oldCapacityName = Number(products.find(p => p.id === id)?.capacity);
  const sameCapacityName = filterCapacities.find(item => item.name === Number(updateCapacity));
  updateCapacity = Number(updateCapacity);

  if(oldCapacityName !== updateCapacity)
  {
    if(sameCapacityName)
    {
    setFilterCapacities(prev =>
    prev.map(item =>
    item.name === updateCapacity
      ? { ...item, amount: item.amount + 1 }
      : item
    )
    ); 

  setFilterCapacities(prev =>
  prev
    .map(item =>
      item.name === oldCapacityName
        ? { ...item, amount: item.amount - 1 }
        : item
    )
    .filter(item => item.amount > 0)
);
    }
    else{
     setFilterCapacities(prev =>
  prev
    .map(item =>
      item.name === oldCapacityName
        ? { ...item, amount: item.amount - 1 }
        : item
    )
    .filter(item => item.amount > 0)
);
   
  const newCapacity = {
    name: updateCapacity,
    amount: 1
  }

  setFilterCapacities(prev => [...prev, newCapacity]);
  }
  }
}

const addProductItem = async (group_id) => {
    setItemGroupId(group_id);
    setTemplateType("createProductItem");
    setHandlerType("addProduct");
    setFirst(false);
    setOpenModal(true);
  }

const handlers = {
  addProduct: ({ group_id, newItem }) => {
    setProducts(prev => [...prev, newItem]);

    setFilterToilets(prev => {
      if (!newItem.toilet) return prev;

      let found = false;
      const updated = prev.map(f => {
        if (f.name === newItem.toilet) {
          found = true;
          return { ...f, amount: f.amount + 1 };
        }
        return f;
      });

      if (!found) {
        return [...updated, { name: newItem.toilet, amount: 1 }];
      }

      return updated;
    });

    setFilterCapacities(prev => {
      if (!newItem.capacity) return prev;

      let found = false;
      const updated = prev.map(f => {
        if (String(f.name) === String(newItem.capacity)) {
          found = true;
          return { ...f, amount: f.amount + 1 };
        }
        return f;
      });

      if (!found) {
        return [...updated, { name: newItem.capacity, amount: 1 }];
      }

      return updated;
    });

    if (!newItem.price) newItem.price = 0;

    setLocalMaxPrice(prev => Math.max(prev, newItem.price));
    setTempLocalMaxPrice(prev => Math.max(prev, newItem.price));
    setMaxSlider(prev => Math.max(prev, newItem.price));

    setLocalMinPrice(prev => Math.min(prev, newItem.price));
    setTempLocalMinPrice(prev => Math.min(prev, newItem.price));
    setMinSlider(prev => Math.min(prev, newItem.price));
  },

  updateProduct: ({ group_id, id, updatedItem }) => {
  updateTags(updatedItem.toilet, updatedItem.capacity, id);

  setProducts(prev =>
    prev.map(item => (item.id === id ? { ...item, ...updatedItem } : item))
  );

  if (!updatedItem.price) updatedItem.price = 0;

  setLocalMaxPrice(prev => Math.max(prev, updatedItem.price));
  setTempLocalMaxPrice(prev => Math.max(prev, updatedItem.price));
  setMaxSlider(prev => Math.max(prev, updatedItem.price));

  setLocalMinPrice(prev => Math.min(prev, updatedItem.price));
  setTempLocalMinPrice(prev => Math.min(prev, updatedItem.price));
  setMinSlider(prev => Math.min(prev, updatedItem.price));

  setPageComponents(prev =>
  prev.map(component => {
    if (component.group_id === group_id && component.name === "productsGrid") {
      const contentArray = Array.isArray(component.component_content?.items)
        ? component.component_content.items
        : [];

      return {
        ...component,
        component_content: {
          ...component.component_content,
          items: contentArray.map(item =>
            item.id === updatedItem.id ? { ...item, ...updatedItem } : item
          ),
        },
      };
    }
    return component;
  })
);
}
};

useEffect(() => {
  console.log("useEffect triggered:");
  console.log("isAdmin:", isAdmin);
  console.log("firstRender:", firstRender);
  console.log("pageComponents:", pageComponents);
  console.log("products:", products);

  if (isAdmin && !firstRender) {
    if(!firstInteraction)
    {
    const fullUrl = `https://vip-boat.ru${api_adress}`;
    fetch(`https://prerender.vip-boat.ru/recache?url=${encodeURIComponent(fullUrl)}`, {
      method: 'POST'
    })
    .then(res => {
      console.log("Response status:", res.status);
      return res.json().catch(() => {
        console.log("Failed to parse JSON");
        return null;
      });
    })
    .then(data => {
      console.log("Server response JSON:", data);
    })
    .catch(err => {
      console.error("Fetch error:", err);
    });
    }
    else
    {
      setFirstInteraction(false);
    }
  } else {
    console.log("Recache skipped: condition not met");
  }

}, [pageComponents, products]);

    useEffect(() => {
          const checkReady = () => {
            if(!innerLoadingPage)
            {
              setReady(true);
            }
          };
      
          checkReady();
        }, [innerLoadingPage]);

  return (
    <section className="shopPage-section">
      {loadingPage ? (
        <LoadingGifPage loading={true}/>
      ) : (
        <>
        <Helmet>
          <title>{title}</title>
          <meta name="description" content={description} />
          {hasParams ? (
            <meta name="robots" content="noindex, follow"/>
          ) : (
            <meta name="robots" content={robots || "index, follow"} />
          )}
          <link rel="canonical" href={`https://vip-boat.ru${api_adress}`}/>
          <script type="application/ld+json">
            {ldJsonObj}
          </script>
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Vip Boat" />
          <meta property="og:locale" content="ru_RU" />
          <meta property="og:url" content={`https://vip-boat.ru${api_adress}`}/>
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta property="og:image" content="https://storage.yandexcloud.net/vip-boat-images/аренда-яхты-спб2.jpg" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={description} />
          <meta name="twitter:image" content="https://storage.yandexcloud.net/vip-boat-images/аренда-яхты-спб2.jpg" />
        </Helmet>
        <div className="title-container" style={{
                background: `
                    linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),
                    url(${currBckgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
              }}>
            <div className="title">
              <div className="title-container-inner"> 
              <button className="title-container-inner-svg-btn" onClick={() => navigate("/")}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="24" viewBox="0 0 32 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                       <line x1="28" y1="12" x2="4" y2="12"/>
                       <polyline points="12 20 4 12 12 4"/>
                    </svg>
                </button>
                <h1 className="title-span">
                    {pageObj.name}
                </h1>
              </div>
                <div className="shopPage-title-container-routing">
                    <button onClick={() => navigate("/")}>
                        Домой
                    </button>
                    <span>
                        /
                    </span>
                    <span>
                        {pageObj.name}
                    </span>
                </div>
            </div>
            <div className="title-container-buttons">
                   {items.slice(0, 3).map((itemObj, index) => (
                    <>
                    {checkPath(itemObj.api_adress) ? (
                      <Link to={itemObj.api_adress} key={index} className={`title-container-real-buttons ${itemObj.name === pageObj.name ? "active-btn" : ""}`}>
                        <span className="title-container-buttons-title">{itemObj.name}</span>
                        <div className={`underLine ${itemObj.name === pageObj.name ? 'active-line' : ''}`}></div>
                        <span className="underline-amount">{itemObj.amount + " Товаров"}</span>
                      </Link>
                    ) : (
                      <a href={itemObj.api_adress} className={`title-container-real-buttons ${itemObj.name === pageObj.name ? "active-btn" : ""}`} target="_blank" rel="noopener noreferrer">
                        <span className="title-container-buttons-title">{itemObj.name}</span>
                        <div className={`underLine ${itemObj.name === pageObj.name ? 'active-line' : ''}`}></div>
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
              <path d="M6 9L12 15L18 9" stroke="transparent" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
             <div className={`title-container-buttons-2 ${openHiddenCategory ? "open" : ""}`}>
                   {items.slice(0, 3).map((itemObj, index) => (
                    <>
                    {checkPath(itemObj.api_adress) ? (
                      <Link to={itemObj.api_adress} key={index} className={`title-container-real-buttons ${itemObj.name === pageObj.name ? "active-btn" : ""}`}>
                        <span className="title-container-buttons-title">{itemObj.name}</span>
                        <div className={`underLine ${itemObj.name === pageObj.name ? 'active-line' : ''}`}></div>
                        <span className="underline-amount">{itemObj.amount + " Товаров"}</span>
                      </Link>
                    ) : (
                      <a href={itemObj.api_adress} className={`title-container-real-buttons ${itemObj.name === pageObj.name ? "active-btn" : ""}`} target="_blank" rel="noopener noreferrer">
                        <span className="title-container-buttons-title">{itemObj.name}</span>
                        <div className={`underLine ${itemObj.name === pageObj.name ? 'active-line' : ''}`}></div>
                        <span className="underline-amount">{itemObj.amount + " Товаров"}</span>
                      </a>
                    )}
                    </>
                ))}
            </div>
            {isAdmin &&(
                  <button className="regularPage-on-change-image-btn shop" onClick={() => {isOpenImage ? setIsOpenImage(false) : setIsOpenImage(true)}}>
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
            {isAdmin &&(
                                                          <button className="regularPage-on-delete-btn shop" onClick={() => {
                                                          if (window.confirm("Вы уверены, что хотите безвозвратно удалить страницу (удаление страницы не предусматривает удаление контента на ней)?")) {onDeletePage()}}}>
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
          {isAdmin && (
                    <MetaBtn title={title} description={description} robots={robots} ld_json={ld_json} id={db_id}/>
                  )}
        </div>
        <div className="main-container">
            <div className="filters">
              {(Number(minSlider) === Number(maxSlider)) || (products.length === 1) ? (
                <></>
              ): (
                <div className="filters-noChange">
                    <span className="filters-noChange-title">Сортировка по цене</span>
                    <ReactSlider
                    className="horizontal-slider"
                    thumbClassName="example-thumb"
                    trackClassName="example-track"
                    min={minSlider}
                    max={maxSlider}
                    value={[tempLocalMinPrice, tempLocalMaxPrice]}
                    ariaLabel={['Lower thumb', 'Upper thumb']}
                    ariaValuetext={state => `Thumb value ${state.valueNow}`}
                    renderThumb={(props, state) => {
                      const { key, ...rest } = props;
                      return <div key={key} {...rest}></div>;
                      }}
                    pearling
                    minDistance={1}
                    renderTrack={(props, state) => {
                    const { key, ...rest } = props;
                    const className = state.index === 1 ? 'example-track example-track-active' : 'example-track';
                    return <div key={key} {...rest} className={className} />;
                    }}
                    onChange={(values) => {
                        setTempLocalMinPrice(values[0]);
                        setTempLocalMaxPrice(values[1]);
                    }}
                    />
                    <div className="priceRange">
                      <span className="filters-description-price"><span className="toBold"><span className="notToBold">Цена: </span>{tempLocalMinPrice + " руб./час"}</span>
                      <span className="toBold">{" - " + tempLocalMaxPrice + " руб./час"}</span></span>
                    </div>
                    <button onClick={() => {setLocalMaxPrice(tempLocalMaxPrice); setLocalMinPrice(tempLocalMinPrice);}}>фильтрация</button>
                </div>
              )}
                <div className="filters-dynamic">
                    {filterCapacities.length > 0 && (
                      addFilters("Вместимость", filterCapacities, setCapacityTags)
                    )}
                    {filterToilets.length > 0 && (
                      addFilters("Туалет", filterToilets, setToiletTags)
                    )}
                </div>
            </div>
            <div className="content">
                <div className="filters-in-content">
                    <div className="routing">
                        <button onClick={() => navigate('/')}>Главная /</button>
                        <span>{pageObj.name}</span>
                    </div>
                    <div className="filters-in-content-main">
                    <div className="showing-grid-style">
                      {gridButtons.map((item, id) => (
                        <button key={id}
                        className={activeIndex === id ? "active" : ""}
                        onClick={() => {
                          setActiveIndex(id);
                          setGridCols(item.cols);
                          }}>
                          {item.svg}
                        </button>
                      ))}
                    </div>
                    <div className="more-filters">
                      <button onClick={() => {
                        openFilters ? setOpenFilteres(false) : setOpenFilteres(true);}}>
                        <svg width="50px" height="50px" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                        <g strokeWidth="2" strokeLinecap="round">
                        <circle cx="10" cy="12" r="3" fill="none"/>
                        <line x1="13" y1="12" x2="40" y2="12"/>
    
                        <line x1="10" y1="24" x2="22" y2="24"/>
                        <circle cx="25" cy="24" r="3" fill="none"/>
                        <line x1="28" y1="24" x2="40" y2="24"/>
    
                        <line x1="10" y1="36" x2="37" y2="36"/>
                        <circle cx="40" cy="36" r="3" fill="none"/>
                        </g>
                        </svg>
                        <span>Фильтры</span>
                      </button>
                    </div>
                  </div>
                </div>
                {selectedFilters.length > 0 && (
                    <div className="currentTags">
                        <button className="clean-all-tags" onClick={() => {
                            setSelectedFilters([]);
                            setCapacityTags([]);
                            setToiletTags([]);
                            setOtherFilters([]);
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round"/>
                            <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            <span>Очистить</span>
                        </button>
                        <div className="vertical-line">
                        </div>
                        <div className="tag-to-clear-container">
                          {capacityTags.map((item) => (
                                <button onClick={() => {
                                    toggleBtn(item, setCapacityTags);}}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round"/>
                                    <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                    <span key={item} className="tag-container">{item}</span>
                                </button>
                        ))}
                        {toiletTags.map((item) => (
                                <button onClick={() => {
                                    toggleBtn(item, setToiletTags);}}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round"/>
                                    <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                    <span key={item} className="tag-container">{item}</span>
                                </button>
                        ))}
                        {otherFilters.map((item) => (
                                <button onClick={() => {
                                    toggleBtn(item, setOtherFilters);}}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round"/>
                                    <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                    <span key={item} className="tag-container">{item}</span>
                                </button>
                          ))}
                        </div>
                    </div>
                )}
                <div className="mobile-filters">
                  <div className="mobile-category">
                    <button onClick={() => 
                      {openHiddenFilter ? setOpenHiddenFilter(false) : setOpenHiddenFilter(true)}
                    }>
                     <span>
                      ☰
                     </span>
                     <span>
                      Дополнительно
                     </span>
                    </button>
                  </div>
                  <div className="more-filters">
                  <button onClick={() => {
                        openFilters ? setOpenFilteres(false) : setOpenFilteres(true);}}>
                        <svg width="50px" height="50px" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                        <g strokeWidth="2" strokeLinecap="round">
                        <circle cx="10" cy="12" r="3" fill="none"/>
                        <line x1="13" y1="12" x2="40" y2="12"/>
    
                        <line x1="10" y1="24" x2="22" y2="24"/>
                        <circle cx="25" cy="24" r="3" fill="none"/>
                        <line x1="28" y1="24" x2="40" y2="24"/>
    
                        <line x1="10" y1="36" x2="37" y2="36"/>
                        <circle cx="40" cy="36" r="3" fill="none"/>
                        </g>
                        </svg>
                        <span>Фильтры</span>
                      </button>
                </div>
                </div>
                <div 
                  className={`more-filters-container ${openFilters ? "open" : "closed"}`}
                >
                  {showFilters()}
                </div>
                <div className={`main-page-container ${products.length > 0 ? "active" : ""}`}>
                  {innerLoadingPage ? (
                    <LoadingGifPage loading={true}/>
                  ) : (
                      <ProductsGrid gridCols={gridCols} show_admin_btns={false} products={products} onCreated={addProductItem}
                  onUpdate={updateProductItem}
                  onDelete={deleteProductItem}
                  onload={true}
                  group_name={pageObj.name}
                  group_id={mainGroupId}
                  toilet_tags={toiletTags} 
                  capacity_tags={capacityTags} 
                  other_tags={otherFilters}
                  max_price={localMaxPrice} 
                  min_price={localMinPrice}
                  ids={ids}
                  setGridCols={setGridCols}
                  scrollTo={scrollTo}
                  setScrollTo={setScrollTo}/>
                  )}
                </div>
            </div>
        </div>
        <MainComponent pageComponents={pageComponents} setPageComponents={setPageComponents} pageId={pageId} pages={pages} setPages={setPages}/>
        <div className={`hidden-filters ${openHiddenFilter ? "open" : ""}`}>
          <button 
                    className="close-btn" 
                    onClick={() => setOpenHiddenFilter(false)}
                  >
                    ✕
                  </button>
          <div className="hidden-filters-container">
            {(Number(minSlider) === Number(maxSlider)) || (products.length === 1) ? (
                <></>
              ): ( <div className="filters-noChange">
                    <span className="filters-noChange-title">Сортировка по цене</span>
                    <ReactSlider
                    className="horizontal-slider"
                    thumbClassName="example-thumb"
                    trackClassName="example-track"
                    min={minSlider}
                    max={maxSlider}
                    value={[tempLocalMinPrice, tempLocalMaxPrice]}
                    ariaLabel={['Lower thumb', 'Upper thumb']}
                    ariaValuetext={state => `Thumb value ${state.valueNow}`}
                    renderThumb={(props, state) => {
                      const { key, ...rest } = props;
                      return <div key={key} {...rest}></div>;
                      }}
                    pearling
                    minDistance={1}
                    renderTrack={(props, state) => {
                    const { key, ...rest } = props;
                    const className = state.index === 1 ? 'example-track example-track-active' : 'example-track';
                    return <div key={key} {...rest} className={className} />;
                    }}
                    onChange={(values) => {
                        setTempLocalMinPrice(values[0]);
                        setTempLocalMaxPrice(values[1]);
                    }}
                    />
                    <div className="priceRange">
                      <span className="filters-description-price">Цена: <span className="toBold">{tempLocalMinPrice + " руб./час"}</span>
                      <span className="toBold">{" - " + tempLocalMaxPrice + " руб./час"}</span></span>
                    </div>
                    <button onClick={() => {setLocalMaxPrice(tempLocalMaxPrice); setLocalMinPrice(tempLocalMinPrice);}}>фильтрация</button>
                </div>)}
                <div className="filters-dynamic">
                    {filterCapacities.length > 0 && (
                      addFilters("Вместимость", filterCapacities, setCapacityTags)
                    )}
                    {filterToilets.length > 0 && (
                      addFilters("Туалет", filterToilets, setToiletTags)
                    )}
                </div>
          </div>
        </div>
        <Suspense fallback={<div className="suspense-loading"><LoadingGifPage loading={true}/></div>}>
        <ModalManager type={templateType} isOpen={openModal} onClose={() => {setOpenModal(false)}} onCreated={handlers[handlerType]} setToastMessage={setToastMessage} 
                            setStatusCode={setStatusCode} item_name={itemName} item_id={itemId} item_adress={itemAdress} setType={setTemplateType} component_name={"productsGrid"}
                            page_id={pageId} first_element={false} component_group_id={itemGroupId}
                            item_capacity={itemCapacity} item_desc={itemDesc} item_discount={itemDiscount} item_images={itemImages} item_price={itemPrice} item_rating={itemRating} item_tags={itemTags} item_seacrh_tags={itemSearchTags} setLoading={setLoading} loading={loading} item_toilet={itemToilet}
                            pages={pages} setPages={setPages} item_page_id={itemPageId} blog_page_id={productPageId} item_reviews_id={itemReviewsId} item_date={itemDate}/>
        </Suspense>
                            {toastMessage && (
                        <Toast
                          message={toastMessage}
                          status_code={statusCode}
                          timeout={4000}
                          onClose={() => setToastMessage("")}
                        />
                      )}
                      {loading && (
                        <LoadingGif loading={loading}/>
                      )}
                      <AuthForm visible={visibleAuth} setVisible={setVisibleAuth}/>
        </>
      )}
      <div className={`regularPage-on-change-image-container ${isOpenImage ? "active" : "closing"}`}>
            <button className="modal-close" onClick={() => setIsOpenImage(false)}>
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
               <div className="setImage-contaimer-modal">
                  <span>Поменять изображение desktop: </span>
                  <a className="href" href={pageImage}>{pageImage}</a>
                  <input type="file" onChange={(e) => updateImage(e)}/>
                </div>
                <div className="space-shop"></div>
                <div className="setImage-contaimer-modal">
                  <span>Поменять изображение mobile: </span>
                  <a className="href" href={mobilePageImage}>{mobilePageImage}</a>
                  <input type="file" onChange={(e) => updateImageMobile(e)}/>
                </div>
                <div className="space-shop"></div>
                <button className="create-modal-btn" onClick={confirmImageChanges} disabled={loading}>Изменить</button>
          </div>
      {ready && <div id="page-ready"></div>}
    </section>
  );
}