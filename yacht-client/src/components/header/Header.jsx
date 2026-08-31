import { useState, useRef, useEffect } from "react";
import { useContext } from "react";
import { HeaderContext } from './contexts/HeaderContext.jsx';
import { ChosenContext } from './contexts/ChooseContext.jsx';
import { ItemsContext } from "./contexts/ItemsContext.jsx";
import { lazy, Suspense } from "react";
const ModalManager = lazy(() => import("../modalManager/ModalManager.jsx"));
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Category from "../category/Category.jsx";
import { useToggleContext } from "../ToggleContext.jsx";
import { BASE_URL } from '../../config';
import Toast from "../adminMessage/adminMessage.jsx";
import "./Header.css";
import { button, div } from "framer-motion/client";
import { useSearchContext } from "../SearchContext";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { useStorageContext } from "../StorageContext.jsx";
import AuthForm from "../AuthForm/AuthForm.jsx";
import LoadingGif from "../loadingGif/LoadingGif.jsx";
import CallRequest from '../callRequest/CallRequest.jsx';
import LoadingGifPage from "../LoadingGifPage/LoadingGifPage.jsx";

export default function Header()
{
    const { favourites, toggleFavourite } = useStorageContext();
    const { isOn, setIsOn } = useToggleContext();
    const { productsIds, setProductsIds } = useSearchContext();
    const { items, setItems } = useContext(ItemsContext);
    const [toastMessage, setToastMessage] = useState("");
    const [statusCode, setStatusCode] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const [openModal, setOpenModal] = useState(false);
    const [modalType, setModalType] = useState("");
    const [open, setOpen] = useState(false);
    const [openMenu, setOpenMenu] = useState(null);
    const [activeTab, setActiveTab] = useState("menu");
    const [hoveredTab, setHoveredTab] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [categoryItems, setCategoryItems] = useState([]);
    const [populars, setPopulars] = useState([]);
    const [about, setAbout] = useState([]);
    const [category, setCategory] = useState([]);
    const [pages, setPages] = useState([]);
    const [search, setSearch] = useState("");
    const [searchedData, setSearchedData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [requestLoading, setRequestLoading] = useState(false);
    const delayTimer = useRef(null);
    const isSearching = useRef(false);
    const [openMenuInner, setOpenMenuInner] = useState(false);
    const [openMenuCatalog, setOpenMenuCatalog] = useState(false);
    const openTimer = useRef(null);
    const closeTimer = useRef(null);
    let close_catalog = true;
    const [openMenuInnerMiddle, setOpenMenuInnerMiddle] = useState(false);
    const [openMenuCatalogMiddle, setOpenMenuCatalogMiddle] = useState(false);
    const [openMenuMiddle, setOpenMenuMiddle] = useState(false);
    let close_catalog_middle = true;


    const [itemName, setItemName] = useState("");
    const [itemId, setItemId] = useState(null);
    const [itemAdress, setItemAdress] = useState("");
    const [itemImage, setItemImage] = useState(null);
    const [itemGroupId, setItemGroupId] = useState(null);
    const [itemAmount, setItemAmount] = useState(null);
    const [count, setCount] = useState(0);
    const [visibleMiniHeader, setVisibleMiniHeader] = useState(false);
    const [visibleMiddleHeader, setVisibleMiddleHeader] = useState(false);

    const [visibleAuth, setVisibleAuth] = useState(false);
    const [visibleRequest, setVisibleRequest] = useState(false);

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
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
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
    
    const tabs = ["menu", "categories"];
    const buttonWidth = 150;

    const checkPath = (path) => {
      if (/^https?:\/\//i.test(path)) {
        return false;
      } 
      else if (path.startsWith("/")) {
        return true;
      }
    };

    const activeIndex = tabs.indexOf(activeTab);
    const hoverIndex = hoveredTab !== null ? tabs.indexOf(hoveredTab) : activeIndex;
    const left = Math.min(activeIndex, hoverIndex) * buttonWidth;
    const width = (Math.abs(activeIndex - hoverIndex) + 1) * buttonWidth;

    const { selected, setSelected } = useContext(HeaderContext);
    const { added, setAdded } = useContext(ChosenContext);

    const searchInputRef = useRef(null);
    const dropDownRef = useRef(null);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);
    const [isFocused, setIsFocused] = useState(false);

useEffect(() => {
  function handleClickOutside(event) {
    if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
      setSearchedData([]);
    }
  }

  if (window.innerWidth > 1249) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [setSearchedData]);

    useEffect(() => {
  const fetchData = async () => {
    if (search === "") {
      clearTimeout(delayTimer.current);
      setLoading(false);
      isSearching.current = false;
      return;
    }
    
    console.log(selected);

    if(selected == "Все")
    {
      setSelected("Категории");
    }

    try {
      const res = await fetch(`${BASE_URL}/search-product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ search_str: search + " " + selected }),
      });

      if (res.status === 200) {
        const data = await res.json();
        const products = data.content?.products || [];
        const ids = data.content.ids || [];
        console.log(products);
        setSearchedData(products);
        setProductsIds(ids);
      } else if (res.status === 404) {
        setSearchedData([]);
        setProductsIds([]);
      } else if (res.status === 500) {
        setSearchedData([]);
        setProductsIds([]);
      } else {
        setSearchedData([]);
        setProductsIds([]);
      }
    } catch (err) {
      setSearchedData([]);
      setProductsIds([]);
    } finally {
      clearTimeout(delayTimer.current);
      setLoading(false);
      isSearching.current = false;
    }
  };

  fetchData();
}, [search, selected]);

    useEffect(() => {
    const fetchHeader = async () => {
    try {
      const res = await fetch(`${BASE_URL}/get-header`);

      if (res.status === 200) {
        const data = await res.json();
        
        const group1 = [];
        const group3 = [];
        const group4 = [];
        const group5 = [];

        data.content.forEach(item => {
          if(item.group_id === 1) group1.push(item);
          else if(item.group_id === 3) group3.push(item);
          else if(item.group_id === 4) group4.push(item);
          else if(item.group_id === 5) group5.push(item);
        });

        const sortByOrderId = (arr) => arr.sort((a, b) => a.id - b.id);

        sortByOrderId(group1);
        sortByOrderId(group3);
        sortByOrderId(group4);
        sortByOrderId(group5);

        const all_category = {
          id: 0,
          group_id: 0,
          api_adress: "",
          order_id: 0,
          name: "Все"
        };

        group4.push(all_category);

        setPopulars(group1);
        setAbout(group3);
        setCategory(group4);
        setPages(group5);
        
        const new_group_item = 
        {
          api_adress: "/cruises",
          group_id: 1,
          id: 0,
          name: "круизы",
          order_id: 1
        }

        const new_group_item_2 = 
        {
          api_adress: "/catering",
          group_id: 1,
          id: 1,
          name: "кейтеринг",
          order_id: 2
        }

        group1.push(new_group_item);
        group1.push(new_group_item_2);

        setCategoryItems(group1);
        setMenuItems(items);
      }
    } catch (err) {
    }
  };

  fetchHeader();
  }, []);

  useEffect(() => {
    setMenuItems(items);
  }, [items])

    useEffect(() => {
    const checkCatalog = () => {
        if(openMenuCatalog === true)
        {
          if(openTimer.current)
          {
            clearTimeout(openTimer.current);
          }
          
          openTimer.current = setTimeout(() => setOpenMenuInner(true), 50);
        }
      };
  
      checkCatalog();

  }, [openMenuCatalog])

    useEffect(() => {
    const checkCatalog = () => {
        if(openMenuInner === false)
        {
          if(closeTimer.current)
          {
            clearTimeout(closeTimer.current);
          }

          closeTimer.current = setTimeout(() => {
            if (openMenuCatalog === true && close_catalog === true) {
              setOpenMenuCatalog(false);
              }
          }, 300);
        }
      };
  
      checkCatalog();

  }, [openMenuInner])


      useEffect(() => {
    const checkCatalog = () => {
        if(openMenuCatalogMiddle === true)
        {
          if(openTimer.current)
          {
            clearTimeout(openTimer.current);
          }

          openTimer.current = setTimeout(() => setOpenMenuInnerMiddle(true), 50);
        }
      };
  
      checkCatalog();

  }, [openMenuCatalogMiddle])

    useEffect(() => {
    const checkCatalog = () => {
        if(openMenuInnerMiddle === false)
        {
          if(closeTimer.current)
          {
            clearTimeout(closeTimer.current);
          }

          closeTimer.current = setTimeout(() => {
            if (openMenuCatalogMiddle === true && close_catalog_middle === true) {
              setOpenMenuCatalogMiddle(false);
              }
          }, 300);
        }
      };
  
      checkCatalog();

  }, [openMenuInnerMiddle])

  const deleteFromCategory = async (id) => {
    try {
      setRequestLoading(true);
      const res = await fetch(`${BASE_URL}/header-delete/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      }, credentials: "include",
    });

      if (res.status === 200) {
        const data = await res.json();
        setCategory(prev => prev.filter(item => item.id !== id))
        setStatusCode(res.status);
        setToastMessage("Элемент успешно удален!");
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
          } else {
        setStatusCode(res.status);
        setToastMessage("Произошла непредвиденная ошибка!");
      }
    }
    catch (err) {
    }
    finally{
          setRequestLoading(false);
        }
  };

  const deleteFromAbout = async (id) => {
    try {
      setRequestLoading(true);
      const res = await fetch(`${BASE_URL}/header-delete/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      }, credentials: "include",
    });

      if (res.status === 200) {
        const data = await res.json();
        setAbout(prev => prev.filter(item => item.id !== id))
        setStatusCode(res.status);
        setToastMessage("Элемент успешно удален!");
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
          } else {
        setStatusCode(res.status);
        setToastMessage("Произошла непредвиденная ошибка!");
      }
    }
    catch (err) {
    }
    finally{
          setRequestLoading(false);
        }
  };

  const onChangeSearch = async (e) => {
    setSearch(e.target.value);
    if (isSearching.current) {
      return;
    }
    isSearching.current = true;
    delayTimer.current = setTimeout(() => setLoading(true), 500);
  }

  const updateFromPages = async (id, name, api_adress) => {
    setItemId(id);
    setItemName(name);
    setItemAdress(api_adress);
    setOpenModal(true);
    setModalType("updatePages");
  };

    const deleteFromPages = async (id) => {
      setRequestLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/header-delete/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json ",
      }, credentials: "include",
    });

      if (res.status === 200) {
        const data = await res.json();
        setPages(prev => prev.filter(item => item.id !== id))
        setStatusCode(res.status);
        setToastMessage("Элемент успешно удален!");
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
          } else {
        setStatusCode(res.status);
        setToastMessage("Произошла непредвиденная ошибка!");
      }
    }
    catch (err) {
    }
    finally{
          setRequestLoading(false);
        }
  };

  const deleteFromPopular = async (id) => {
    try {
      setRequestLoading(true);
      const res = await fetch(`${BASE_URL}/header-delete/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      }, credentials: "include",
    });

      if (res.status === 200) {
        const data = await res.json();
        setPopulars(prev => prev.filter(item => item.id !== id))
        setStatusCode(res.status);
        setToastMessage("Элемент успешно удален!");
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
          } else {
        setStatusCode(res.status);
        setToastMessage("Произошла непредвиденная ошибка!");
      }
    }
    catch (err) {
    }
    finally{
          setRequestLoading(false);
        }
  };

  const updateFromCategory = async (id, name) => {
    setItemId(id);
    setItemName(name);
    setOpenModal(true);
    setModalType("updateCategory");
  };

  const updateFromAbout = async (id, name, api_adress) => {
    setItemId(id);
    setItemName(name);
    setItemAdress(api_adress);
    setOpenModal(true);
    setModalType("updateAbout");
  }

    const updateFromPopular = async (id, name, api_adress) => {
    setItemId(id);
    setItemName(name);
    setItemAdress(api_adress);
    setOpenModal(true);
    setModalType("updatePopular");
  }

  useEffect(() => {
  if (open && searchInputRef.current) {
    searchInputRef.current.focus();
  }
}, [open]);

  const handleClick = () => {
    console.log(searchInputRef);
    if (searchInputRef.current) {
      setOpen(!open);
      searchInputRef.current.focus();
    }
  };

  const handleClickAddPopular = async () => {
    setOpenModal(true);
    setModalType("addPopular");
  }

  const handleClickAddAbout = async () => {
    setOpenModal(true);
    setModalType("addAbout");
  }

  const handleClickAddCategory = async () => {
    setOpenModal(true);
    setModalType("addCategory");
  }

  const handleClickAddPages = async () => {
    setOpenModal(true);
    setModalType("addPages");
  }

  const clearSearch = async () => {
    setSearch("");
  }

  const updateTheme = async () => {
    try {
      const res = await fetch(`${BASE_URL}/update-theme`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }, credentials: "include",
    });

      if (res.status === 200) {
        setStatusCode(res.status);
        setToastMessage("Тема успешна обновлена - перезагрузите страницу!");
        if(isOn)
        {
          setIsOn(false);
        }
        else{
          setIsOn(true);
        }
      } else if (res.status === 401) {
            setStatusCode(res.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          } else {
        setStatusCode(res.status);
        setToastMessage("Произошла непредвиденная ошибка!");
      }
    }
    catch (err) {
    }
  }

  const handlers = {
    addPopular: (item) => setPopulars(prev => [...prev, item]),
    addAbout: (item) => setAbout(prev => [...prev, item]),
    addPages: (item) => setPages(prev => [...prev, item]),
    addCategory: (item) => setCategory(prev => [...prev, item]),
    addCategoryGroup: (item) => setItems((prev) => [...prev, item]),
    updateCategory: (updatedItem) => setCategory(prev =>
    prev.map(item =>
    item.id === updatedItem.id
      ? { ...item, ...updatedItem }
      : item
    )),
    updateCategoryGroup: (updatedItem) => setItems(prev =>
    prev.map(item =>
    item.id === updatedItem.id
      ? { ...item, ...updatedItem }
      : item
    )),
    updateAbout: (updatedItem) => setAbout(prev =>
    prev.map(item =>
    item.id === updatedItem.id
      ? { ...item, ...updatedItem }
      : item
    )),
    updatePages: (updatedItem) => setPages(prev =>
    prev.map(item =>
    item.id === updatedItem.id
      ? { ...item, ...updatedItem }
      : item
    )),
    updatePopular: (updatedItem) => setPopulars(prev =>
    prev.map(item =>
    item.id === updatedItem.id
      ? { ...item, ...updatedItem }
      : item
    ))
  };

  useEffect(() => {
    const mainHeader = document.querySelector(".header");
    const offset = mainHeader.offsetHeight;

    const handleUpdate = () => {
      if(window.innerWidth > 1249)
      {
        setVisibleMiniHeader(false);
        setVisibleMiddleHeader(window.scrollY > offset);
      }
      else{
        setVisibleMiddleHeader(false);
        setVisibleMiniHeader(window.scrollY > offset);
      }
    };

     window.addEventListener("scroll", handleUpdate);
  window.addEventListener("resize", handleUpdate);

  handleUpdate();

  return () => {
    window.removeEventListener("scroll", handleUpdate);
    window.removeEventListener("resize", handleUpdate);
  };
  }, []);

    if(isAdmin){
      return(
        <>
        <section className ="header">
            <div className="header_section_1">
                <div className="header_section_1_container">
                    <div className="header_section_1_tab_1">
                    <Link className="header_section_1_tab_1_cruises" to='/cruises'>
                        круизы
                    </Link>
                    <div className="header-section-1-line"></div>
                    <Link className="header_section_1_tab_1_catering" to='/catering'>
                        кейтеринг
                    </Link>
                </div>
                <div className="header_section_1_tab_2">
                  <label class="switch">
                      <input type="checkbox" checked={isOn} 
                      onChange={(e) => {updateTheme()}}/>
                      <span class="slider round"></span>
                  </label>
                  <div className="header-phone-wrapper">
                    <a href="tel:+79643333636" className="header-phone-number">
                      +7 964 333-36-36
                    </a>
                  </div>
                    <div className="header_section_1_icons">
                        <a className="header_section_1_icons-1" href = "https://www.youtube.com/@vipboatspb">
                            <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                              width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
                                preserveAspectRatio="xMidYMid meet">

                                <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                                fill="#000000" stroke="none">
                                <path d="M2115 4394 c-858 -28 -1241 -56 -1440 -105 -154 -37 -279 -112 -391
                                -232 -118 -127 -171 -236 -210 -426 -99 -488 -99 -1675 0 -2164 39 -189 94
                                -301 210 -424 116 -123 257 -203 425 -238 346 -73 1536 -121 2366 -96 812 24 
                                1226 57 1410 112 246 73 441 261 525 505 128 371 150 1724 38 2294 -40 204
                                -115 349 -245 471 -114 107 -239 172 -392 204 -168 35 -532 66 -986 85 -254
                                11 -1128 20 -1310 14z m980 -404 c791 -24 1198 -59 1323 -116 101 -45 174 
                                -121 208 -216 27 -74 53 -229 71 -419 22 -235 25 -1056 5 -1304 -24 -288 -53
                                -459 -93 -537 -50 -99 -152 -175 -270 -202 -280 -65 -1478 -110 -2274 -87
                                -644 19 -1091 49 -1268 87 -183 38 -292 152 -331 349 -88 440 -88 1570 0 2010
                                21 107 57 179 118 241 96 95 184 120 508 148 538 46 1358 65 2003 46z"/>
                                <path d="M2050 2549 l0 -811 23 14 c12 8 325 189 695 403 370 214 671 393 670
                                397 -2 4 -295 176 -653 383 -357 207 -669 387 -692 401 l-43 25 0 -812z"/>
                                </g>
                            </svg>
                        </a>
                        <a className="header_section_1_icons-2" href = "https://vk.com/vipboat">
                            <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 48 48" width="96px" height="96px">
                            <path d="M45.763,35.202c-1.797-3.234-6.426-7.12-8.337-8.811c-0.523-0.463-0.579-1.264-0.103-1.776 
                            c3.647-3.919,6.564-8.422,7.568-11.143C45.334,12.27,44.417,11,43.125,11l-3.753,0c-1.237,0-1.961,0.444-2.306,1.151 
                            c-3.031,6.211-5.631,8.899-7.451,10.47c-1.019,0.88-2.608,0.151-2.608-1.188c0-2.58,0-5.915,0-8.28 
                            c0-1.147-0.938-2.075-2.095-2.075L18.056,11c-0.863,0-1.356,0.977-0.838,1.662l1.132,1.625c0.426,0.563,0.656,1.248,0.656,1.951 
                            L19,23.556c0,1.273-1.543,1.895-2.459,1.003c-3.099-3.018-5.788-9.181-6.756-12.128C9.505,11.578,8.706,11.002,7.8,11l-3.697-0.009 
                            c-1.387,0-2.401,1.315-2.024,2.639c3.378,11.857,10.309,23.137,22.661,24.36c1.217,0.12,2.267-0.86,2.267-2.073l0-3.846 
                            c0-1.103,0.865-2.051,1.977-2.079c0.039-0.001,0.078-0.001,0.117-0.001c3.267,0,6.926,4.755,8.206,6.979 
                            c0.368,0.64,1.056,1.03,1.8,1.03l4.973,0C45.531,38,46.462,36.461,45.763,35.202z"/>
                            </svg>
                        </a>
                        <a className="header_section_1_icons-3" href = "https://t.me/pavloydkzd">
                            <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                                width="866.000000pt" height="650.000000pt" viewBox="0 0 866.000000 650.000000"
                                  preserveAspectRatio="xMidYMid meet">

                                  <g transform="translate(0.000000,650.000000) scale(0.100000,-0.100000)"
                                  fill="#000000" stroke="none">
                                  <path d="M3435 6243 c-902 -23 -1354 -152 -1662 -476 -240 -253 -360 -587
                                  -408 -1146 -44 -505 -47 -2177 -5 -2691 50 -604 175 -955 434 -1213 243 -243
                                  566 -367 1094 -422 260 -27 532 -36 1227 -42 1302 -11 1847 28 2238 158 481
                                  159 770 505 882 1054 55 271 72 480 86 1065 18 729 2 1793 -32 2140 -68 707
                                  -281 1103 -714 1332 -288 151 -623 213 -1290 238 -224 8 -1558 11 -1850 3z
                                  m2120 -462 c530 -43 801 -125 979 -296 205 -198 287 -468 328 -1090 17 -263
                                  17 -2015 0 -2280 -28 -428 -73 -671 -157 -852 -144 -311 -407 -457 -935 -517
                                  -290 -33 -527 -40 -1440 -40 -947 0 -1182 7 -1480 45 -385 49 -573 122 -740
                                  289 -189 188 -267 441 -311 1015 -6 77 -13 520 -16 985 -7 1085 7 1489 62
                                  1815 30 174 65 296 115 400 176 365 502 497 1325 535 263 12 2100 5 2270 -9z"/>
                                  <path d="M5200 4619 c-267 -105 -737 -288 -1045 -409 -1812 -707 -1639 -637
                                  -1690 -685 -62 -58 -54 -113 24 -158 17 -11 214 -77 438 -148 l406 -129 461
                                  294 c254 161 664 423 911 581 248 158 469 296 493 307 47 21 82 16 82 -11 0
                                  -10 -92 -102 -217 -217 -120 -110 -458 -419 -750 -688 -388 -354 -533 -494
                                  -533 -509 0 -12 -11 -177 -25 -367 -31 -432 -31 -430 -5 -430 49 0 99 39 300
                                  236 117 115 216 209 221 209 4 0 183 -130 396 -290 213 -159 408 -300 432
                                  -312 63 -33 139 -31 179 2 17 14 40 44 51 68 11 24 82 340 165 737 80 382 200
                                  956 267 1275 132 623 142 696 106 763 -26 47 -72 72 -132 71 -40 0 -143 -37
                                  -535 -190z"/>
                                  </g>
                            </svg>
                        </a>
                    </div>
                    <button className="header_section_1_tab_2-order-btn" onClick={() => setVisibleRequest(true)}>
                        заказать звонок
                    </button>
                </div>
                </div>
            </div>
    <div className="header_section_2">
  <div className="header_section_2-container">
    {/* Бургер */}
    <button className="mobile-burger-btn" onClick={() => setOpen(!open)}>
      <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
 preserveAspectRatio="xMidYMid meet">

<g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
fill="#000000" stroke="none">
<path d="M642 4141 c-66 -23 -117 -63 -159 -125 -43 -63 -56 -116 -51 -201 8
-116 71 -211 176 -262 l57 -28 1895 0 1895 0 57 28 c62 30 115 83 150 149 19
36 23 58 23 138 0 80 -4 102 -23 138 -35 66 -88 119 -150 149 l-57 28 -1880 2
c-1801 2 -1882 2 -1933 -16z"/>
<path d="M642 2861 c-66 -23 -117 -63 -159 -125 -43 -63 -56 -116 -51 -201 8
-116 71 -211 176 -262 l57 -28 1895 0 1895 0 57 28 c62 30 115 83 150 149 19
36 23 58 23 138 0 80 -4 102 -23 138 -35 66 -88 119 -150 149 l-57 28 -1880 2
c-1801 2 -1882 2 -1933 -16z"/>
<path d="M642 1581 c-66 -23 -117 -63 -159 -125 -43 -63 -56 -116 -51 -201 8
-116 71 -211 176 -262 l57 -28 1895 0 1895 0 57 28 c62 30 115 83 150 149 19
36 23 58 23 138 0 80 -4 102 -23 138 -35 66 -88 119 -150 149 l-57 28 -1880 2
c-1801 2 -1882 2 -1933 -16z"/>
</g>
</svg>
    </button>

    {/* Сайдбар */}
    <div className={`sidebar ${open ? "active" : ""}`}>
      {/* Поиск */}
      <div className="mobile-category-sidebar-inputs">
        <div className="mobile-category-sidebar-inputs-container">
          <input type="text" placeholder="Поиск товаров" value={search} ref={searchInputRef} maxLength={20} onChange={onChangeSearch}/>
          {search != "" && (
          <button className="mobile-category-sidebar-inputs-clear-button" onClick={clearSearch}>
                        <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                        width="90.000000pt" height="90.000000pt" viewBox="0 0 90.000000 90.000000"
                        preserveAspectRatio="xMidYMid meet">

                        <g transform="translate(0.000000,90.000000) scale(0.100000,-0.100000)">
                        <path d="M205 695 c-14 -13 -25 -29 -25 -36 0 -6 44 -56 97 -110 l97 -99 -97
                            -99 c-53 -54 -97 -104 -97 -110 0 -15 46 -61 61 -61 6 0 56 44 110 97 l99 97
                            99 -97 c54 -53 104 -97 110 -97 15 0 61 46 61 61 0 6 -44 56 -97 110 l-97 99
                            97 99 c53 54 97 104 97 110 0 15 -46 61 -61 61 -6 0 -56 -44 -110 -97 l-99
                            -97 -99 97 c-54 53 -104 97 -110 97 -7 0 -23 -11 -36 -25z"/>
                        </g>
                    </svg>
                    </button>
        )}
        </div>
        <button className="header-search-btn white" onClick={() => {navigate(`/search?${search}`); setOpen(false);}}>
            {loading ? (
                <span className="loading-spinner"></span>
            ) : (
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
            )}
        </button>
      </div>

      {searchedData.length > 0 && search !== "" && (
        <SimpleBar style={{ maxHeight: '300px', width: '100%' }} autoHide={false}>
                            <div className="search-dropdown-grid-mobile">
                              {searchedData.map((item, index) => (
                              <>
                                {checkPath(item.api_adress) ? (
                                  <Link key={index} className="search-dropdown-grid-item-mobile" to={item.api_adress} onClick={() => {setSearch(""); setOpen(false);}}> 
                                  <div className="search-dropdown-grid-item-image-container-mobile">
                                <img loading="lazy" src={item.images[0].src} alt={item.name} />
                              </div>
                                <div className="search-dropdown-grid-item-desc-container-mobile">
                                  <span className="search-dropdown-grid-item-name-mobile">{item.name}</span>
                                  {item.price !== 0 && (
                                    <div className="search-dropdown-grid-item-prices-mobile">
                                      <span className="search-dropdown-grid-item-from-mobile">от:</span>
                                      {item.discount !== 0 && (
                                    <span className="search-dropdown-grid-item-discount-mobile">{item.discount} руб/час</span>
                                      )}
                                      <span className="search-dropdown-grid-item-price-mobile">{item.price} руб/час</span>
                                  </div>
                                )}
                              </div>
                                  </Link>
                                ) : (
                                  <a key={index} className="search-dropdown-grid-item-mobile" href={item.api_adress} target="_blank" rel="noopener noreferrer" onClick={() => {setSearch(""); setOpen(false);}}>
                                    <div className="search-dropdown-grid-item-image-container-mobile">
                                <img loading="lazy" src={item.images[0].src} alt={item.name} />
                              </div>
                                <div className="search-dropdown-grid-item-desc-container-mobile">
                                  <span className="search-dropdown-grid-item-name-mobile">{item.name}</span>
                                  {item.price !== 0 && (
                                    <div className="search-dropdown-grid-item-prices-mobile">
                                      <span className="search-dropdown-grid-item-from-mobile">от:</span>
                                      {item.discount !== 0 && (
                                    <span className="search-dropdown-grid-item-discount-mobile">{item.discount} руб/час</span>
                                      )}
                                      <span className="search-dropdown-grid-item-price-mobile">{item.price} руб/час</span>
                                  </div>
                                )}
                              </div>
                                  </a>
                                )}
                                </>
                            ))}
                            {searchedData.length % 2 !== 0 && (
                                    <div className="search-dropdown-grid-item-placeholder"></div>
                                )}
                          </div>
                          {productsIds.length > 8 && (
                            <button className="view-all-btn-mobile" onClick={() => {navigate(`/search?${search}`); setOpen(false);}}>ВСЕ РЕЗУЛЬТАТЫ</button>
                          )}
                          </SimpleBar>
      )}

      {/* Кнопки Меню/Категории */}
      <div className="mobile-caregory-options">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
            onMouseEnter={() => setHoveredTab(tab)}
            onMouseLeave={() => setHoveredTab(null)}
          >
            {tab === "menu" ? "Меню" : "Категории"}
          </button>
        ))}
<div
  className="underline"
  style={{
    left: `${left}px`,
    width: `${width}px`
  }}
/>
</div>
      {/* Список */}
      <ul>
        {(activeTab === "menu" ? menuItems : categoryItems).map((item) => (
            <li key={item.id}>
              {checkPath(item.api_adress) ? (
                <Link className="mobile-options-buttons" onClick={() => {setSearch(""); setActiveTab; setOpen(false)}} to={item.api_adress}>
                {item.name}
                </Link>
              ) : (
                <a className="mobile-options-buttons" onClick={() => {setSearch(""); setActiveTab; setOpen(false)}} href={item.api_adress} target="_blank" rel="noopener noreferrer">
                {item.name}
                </a>
              )}
            </li>
        ))}
      </ul>
    </div>

    {/* Overlay */}
    {open && <div className="overlay" onClick={() => setOpen(false)} />}

    {/* Логотип */}
    <img loading="lazy" className="logo-img" src="/images/logo.png" alt="logo" onClick={() => navigate('/')}/>

    {/* Дополнительно: кнопки поиска и избранного можно сюда добавить */}
    <div className="header-inputs-container">
                    <div className="header-inputs-container-container-in">
                      <input type="text" placeholder="Поиск товаров" onFocus={handleFocus} maxLength={20} onBlur={handleBlur} value={search} onChange={onChangeSearch}/>
                      {search != "" && (
                      <button className="header-inputs-container-clear" onClick={clearSearch}>
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
                    </div>
                    <div className="category-header-dropDown">
                    <div className="dropdown-wrapper">
                        <button onClick={() => setOpen(!open)} className="category-header-btn">
                    <span className="category-header-btn-description">{selected}</span>
                    <span className="category-arrow">▾</span>
                    </button>
                    <div className={`dropdown-header-menu ${open ? "active" : ""}`}>
                          {category.map((item) => (
                          <div className="dropdown-header-menu-btn-container-admin" key={item.id}>
                            <button className="dropdown-header-menu-btn-container-on-delete" onClick={() => {
                      if (window.confirm("Вы уверены, что хотите безвозвратно удалить элемент?")) {
                      deleteFromCategory(item.id); setSelected("категории");}}}>
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
                            <button
                          className="dropdown-header-menu-btn admin"
                          onClick={() => {
                          setSelected(item.name);
                          setOpen(false);
                          }}
                          >
                          {item.name}
                          </button>
                          <button className="dropdown-header-menu-btn-container-on-change" onClick={() => updateFromCategory(item.id, item.name)}>
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
                          </div>
                          ))}
                          <button className="addCategoryFilterOption" onClick={handleClickAddCategory}>
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
                    </div>
                    </div>
                    </div>
                    <button className="header-search-btn" onClick={() => {navigate(`/search?${search}`)}}>
                      {loading ? (
                        <span className="loading-spinner"></span>
                      ) : (
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
                      )}
                    </button>
                    <div onFocus={handleFocus} onBlur={handleBlur} ref={dropDownRef} className={`search-dropdown ${search != "" && searchedData.length > 0 && isFocused ? "active" : ""}`}>
                      {searchedData.length == 1 ? (
                        <button onMouseDown={() => {navigate(searchedData[0].api_adress); setOpen(false); setIsFocused(false); setSearch('');}} className="search-dropdown-1-item">
                        <div className="search-dropdown-1-item-image-container">
                            <img loading="lazy" src={searchedData[0].images[0].src} alt={searchedData[0].name} />
                          </div>
                          <div className="search-dropdown-1-item-desc-container">
                            <span className="search-dropdown-1-item-desc-container-name">{searchedData[0].name}</span>
                            {searchedData[0].price != 0 && (
                              <div className="search-dropdown-1-item-prices">
                              <span className="search-dropdown-1-item-prices-from">от:</span>
                              {searchedData[0].discount != 0 && (
                                <span className="search-dropdown-1-item-prices-discount">{searchedData[0].discount}{" "}руб/час</span>
                              )}
                              <span className="search-dropdown-1-item-prices-price">{searchedData[0].price}{" "}руб/час</span>
                            </div>
                            )}
                          </div>
                        </button>
                      ) : (
                          <div className="search-dropdown-wrapper">
                            <SimpleBar style={{ maxHeight: '300px', overflowY: 'auto', width: '100%' }} autoHide={false}>
                            <div className="search-dropdown-grid">
                              {searchedData.map((item, index) => (
                                <button onMouseDown={() => {navigate(item.api_adress); setOpen(false); setIsFocused(false); setSearch('');}} className="search-dropdown-grid-item">
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
                            <button className="view-all-btn" onMouseDown={() => {navigate(`/search?${search}`); setOpen(false); setIsFocused(false); setSearch('');}}>ВСЕ РЕЗУЛЬТАТЫ</button>
                          )}
                          </SimpleBar>
                          </div>
                      )}
                      </div>
                      <div className={`search-dropdown-no-found ${search != "" && searchedData.length === 0 && isFocused ? "show" : ""}`}>
                        <span>Товаров не найдено</span>
                      </div>
                </div>
                <button className="header-add-to-favourite-btn" onClick={() => {navigate(`/favourites`);}}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="40px"
                      height="40px"
                      strokeWidth="2" 
                      fill="none"
                      >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                      2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09
                      C13.09 3.81 14.76 3 16.5 3
                      19.58 3 22 5.42 22 8.5
                      c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    <span>{favourites.length}</span>
                </button>
                <button className="header-add-review-btn" onClick={() => window.location.href ="https://yandex.ru/profile/192123962816?lang=ru&utm_source=telegram&utm_medium=social&utm_campaign=share"}>
                    <img loading="lazy" src="/images/review.webp" alt="yandex reviews preview" />
                </button>
                <div className="mobile-container">
                    <button className="mobile-header-search-btn" onClick={handleClick}>
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
                    <button className="mobile-header-add-to-favourite-btn" onClick={() => {navigate(`/favourites`)}}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="40px"
                      height="40px"
                      strokeWidth="2" 
                      fill="none"
                      >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                      2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09
                      C13.09 3.81 14.76 3 16.5 3
                      19.58 3 22 5.42 22 8.5
                      c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    <span>{favourites.length}</span>
                    </button>
                </div>
                </div>
            </div>
            <div className="header_section_3">
                <div className="header_section_3-container">
                    <div className="header_section_3-tab-1">
                    <div className="dropdown-wrapper"
                        onMouseEnter={() => setOpenMenu("popular")}
                        onMouseLeave={() => setOpenMenu(null)}
                    >
                   <button className="header_section_3-popular-choice">
                   <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
 preserveAspectRatio="xMidYMid meet">

<g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
fill="#000000" stroke="none">
<path d="M642 4141 c-66 -23 -117 -63 -159 -125 -43 -63 -56 -116 -51 -201 8
-116 71 -211 176 -262 l57 -28 1895 0 1895 0 57 28 c62 30 115 83 150 149 19
36 23 58 23 138 0 80 -4 102 -23 138 -35 66 -88 119 -150 149 l-57 28 -1880 2
c-1801 2 -1882 2 -1933 -16z"/>
<path d="M642 2861 c-66 -23 -117 -63 -159 -125 -43 -63 -56 -116 -51 -201 8
-116 71 -211 176 -262 l57 -28 1895 0 1895 0 57 28 c62 30 115 83 150 149 19
36 23 58 23 138 0 80 -4 102 -23 138 -35 66 -88 119 -150 149 l-57 28 -1880 2
c-1801 2 -1882 2 -1933 -16z"/>
<path d="M642 1581 c-66 -23 -117 -63 -159 -125 -43 -63 -56 -116 -51 -201 8
-116 71 -211 176 -262 l57 -28 1895 0 1895 0 57 28 c62 30 115 83 150 149 19
36 23 58 23 138 0 80 -4 102 -23 138 -35 66 -88 119 -150 149 l-57 28 -1880 2
c-1801 2 -1882 2 -1933 -16z"/>
</g>
</svg>
                   <span>популярный выбор</span>
                   <span className="category-arrow">▾</span>
                   </button>
                   <div className={`dropdown-popular-menu ${openMenu === "popular" ? "active" : ""}`}>
                   {populars.map((item, index) => (
                    <div key={item.id} className="dropdown-popular-menu-container-admin">
                      <button className="dropdown-popular-menu-container-admin-on-delete" onClick={() => {
                      if (window.confirm("Вы уверены, что хотите безвозвратно удалить элемент?")) {
                      deleteFromPopular(item.id);}}}>
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
                      {checkPath(item.api_adress) ? (
                              <Link to={item.api_adress} onClick={() => setSearch("")} className={`dropdown-popular-menu-btn${index === populars.length - 1 ? " last" : ""}`}>
                                {item.name}
                              </Link>
                            ) : (
                              <a className={`dropdown-popular-menu-btn${index === populars.length - 1 ? " last" : ""}`} href={item.api_adress} target="_blank" rel="noopener noreferrer" onClick={() => setSearch("")}>
                                {item.name}
                              </a>
                            )}
                   <button className="dropdown-popular-menu-container-admin-on-change" onClick={() => updateFromPopular(item.id, item.name, item.api_adress)}>
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
                    </div>
                   ))}
                    <button className="addCategoryOption" onClick={handleClickAddPopular}>
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
                   </div>
                </div>
                <div className="dropdown-wrapper" onMouseEnter={() => {setOpenMenuCatalog(true); close_catalog = false}}
                       onMouseLeave={() => {setOpenMenuInner(false); close_catalog = true}}>
                        <button className="header_section_3-btn">
                    <span>каталог услуг</span>
                    <span className="category-arrow">▾</span>
                </button>
                </div >
                <div className="dropdown-wrapper"
                        onMouseEnter={() => setOpenMenu("about")}
                        onMouseLeave={() => setOpenMenu(null)}>
                        <button className="header_section_3-btn">
                    <span>о компании</span>
                    <span className="category-arrow">▾</span>
                </button>
                <div className={`dropdown-about-menu ${openMenu === "about" && !openMenuMiddle ? "active" : ""}`}>
                          {about.map((item, index) => (
                          <div className={`dropdown-about-menu-container ${isAdmin? "admin" : ""}`} key={item.id}>
                            <button className="dropdown-about-menu-container-on-delete" onClick={() => {
                      if (window.confirm("Вы уверены, что хотите безвозвратно удалить элемент?")) {
                      deleteFromAbout(item.id);}}}>
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
                            {checkPath(item.api_adress) ? (
                              <Link to={item.api_adress} onClick={() => setSearch("")} className={`dropdown-about-menu-btn${index === about.length - 1 ? " last" : ""}`}>
                                {item.name}
                              </Link>
                            ) : (
                              <a className={`dropdown-about-menu-btn${index === about.length - 1 ? " last" : ""}`} href={item.api_adress} target="_blank" rel="noopener noreferrer" onClick={() => setSearch("")}>
                                {item.name}
                              </a>
                            )}
                          <button className="dropdown-about-menu-container-on-change" onClick={() => updateFromAbout(item.id, item.name, item.api_adress)}>
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
                          </div>
                          ))}
                          <button className="addAboutOption" onClick={handleClickAddAbout}>
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
                    </div>
                </div>
                <button className="header_section_3-btn" onClick={() => navigate('/news')}>
                    новости
                </button>
                </div>
                <div className="header_section_3-tab-2">
                     {pages.map((item, index) => (
                      <div className="header_section_3-tab-2-container-admin" key={item.id}>
                        <button className="header_section_3-tab-2-container-admin-on-delete" onClick={() => {
                      if (window.confirm("Вы уверены, что хотите безвозвратно удалить элемент?")) {
                      deleteFromPages(item.id);}}}>
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
                        {checkPath(item.api_adress) ? (
                              <Link to={item.api_adress} onClick={() => setSearch("")} className={`header_section_3-btn${index === pages.length - 1 ? " last" : ""}`}>
                                {item.name}
                              </Link>
                            ) : (
                              <a className={`header_section_3-btn${index === pages.length - 1 ? " last" : ""}`} href={item.api_adress} target="_blank" rel="noopener noreferrer" onClick={() => setSearch("")}>
                                {item.name}
                              </a>
                            )}
                        <button className="header_section_3-tab-2-container-admin-on-change" onClick={() => updateFromPages(item.id, item.name, item.api_adress)}>
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
                      </div>
                    ))}
                    <button className="addPageOption" onClick={handleClickAddPages}>
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
                </div>

                  <button className="header_section_1_tab_2-order-btn-2" onClick={() => setVisibleRequest(true)}>
                        заказать звонок
                    </button>
                </div>
                <div className={`dropdown-wrapper-catalog-back ${openMenuInner === true ? "active" : ""}`}>
                  <div
      className={`dropdown-wrapper-catalog ${openMenuCatalog === true ? "active" : ""}`}
      onMouseEnter={() => {setOpenMenuCatalog(true); close_catalog = false; setOpenMenuInner(true);}}
      onMouseLeave={() => { setTimeout(() => {
            if (close_catalog === true) {
              setOpenMenuInner(false);
              }
          }, 25); close_catalog = true; }}
    >
    <div className={`dropdown-catalog-menu ${openMenuInner === true ? "active" : ""}`}>
        <Category setOpenModal={setOpenModal} setModalType={setModalType} setStatusCode={setStatusCode} setToastMessage={setToastMessage} setCategoryId={setItemId} setCategoryName={setItemName} setCategoryImage={setItemImage} setCategoryAdress={setItemAdress} setCategoryAmount={setItemAmount} setLoading={setRequestLoading} setOpenMenu={setOpenMenuInner} setVisibleAuth={setVisibleAuth}/>
    </div>
    </div>
                </div>
            </div>
            <Suspense fallback={<div className="suspense-loading"></div>}>
             <ModalManager type={modalType} isOpen={openModal} onClose={() => {setOpenModal(false); setToastMessage("")}} onCreated={handlers[modalType]} setToastMessage={setToastMessage} 
        setStatusCode={setStatusCode} item_name={itemName} item_id={itemId} item_image={itemImage} item_adress={itemAdress} item_amount={itemAmount} loading={requestLoading} setLoading={setRequestLoading}/>            
            </Suspense>
        {toastMessage && (
                <Toast
                  message={toastMessage}
                  status_code={statusCode}
                  timeout={4000}
                  onClose={() => setToastMessage("")}
                />
              )}
              {requestLoading && (
                                      <LoadingGif loading={true}/>
                                    )}
              <AuthForm visible={visibleAuth} setVisible={setVisibleAuth}/>
              <CallRequest product_name={"заказать звонок"} visible={visibleRequest} setVisible={setVisibleRequest}/>
        </section>
        <div className={`middle-header ${visibleMiddleHeader ? "active" : ""}`}>
          <div className="mini-header-inner">
    <img loading="lazy" className="logo-img-mini" src="/images/logo-small.png" alt="logo" onClick={() => navigate('/')}/>
    <div className="header_section_3-tab-1 middle">
                <div className="dropdown-wrapper" onMouseEnter={() => {setOpenMenuCatalogMiddle(true); close_catalog_middle = false}}
                       onMouseLeave={() => {setOpenMenuInnerMiddle(false); close_catalog_middle = true}}>
                        <button className="header_section_3-btn">
                    <span>каталог услуг</span>
                    <span className="category-arrow">▾</span>
                </button>
                </div >
                <div className="dropdown-wrapper"
                        onMouseEnter={() => {setOpenMenu("about"); setOpenMenuMiddle(true);}}
                        onMouseLeave={() => {setOpenMenu(null); setOpenMenuMiddle(false);}}>
                        <button className="header_section_3-btn">
                    <span>о компании</span>
                    <span className="category-arrow">▾</span>
                </button>
                <div className={`dropdown-about-menu ${openMenu === "about" && openMenuMiddle ? "active" : ""}`}>
                          {about.map((item, index) => (
                          <>
                          {checkPath(item.api_adress) ? (
                              <Link key={item.id} to={item.api_adress} onClick={() => setSearch("")} className={`dropdown-about-menu-btn${index === about.length - 1 ? " last" : ""}`}>
                                {item.name}
                              </Link>
                            ) : (
                              <a key={item.id} className={`dropdown-about-menu-btn${index === about.length - 1 ? " last" : ""}`} href={item.api_adress} target="_blank" rel="noopener noreferrer" onClick={() => setSearch("")}>
                                {item.name}
                              </a>
                            )}
                          </>
                          ))}
                    </div>
                </div>
                <Link className="header_section_3-btn" to="/news">
                    новости
                </Link>
                </div>
                <div className="header_section_1_tab_2 inner">
                  <div className="header-phone-wrapper">
                    <a href="tel:+79643333636" className="header-phone-number">
                      +7 964 333-36-36
                    </a>
                  </div>
                    <div className="header_section_1_icons">
                        <a className="header_section_1_icons-1" href = "https://www.youtube.com/@vipboatspb">
                            <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                              width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
                                preserveAspectRatio="xMidYMid meet">

                                <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                                fill="#000000" stroke="none">
                                <path d="M2115 4394 c-858 -28 -1241 -56 -1440 -105 -154 -37 -279 -112 -391
                                -232 -118 -127 -171 -236 -210 -426 -99 -488 -99 -1675 0 -2164 39 -189 94
                                -301 210 -424 116 -123 257 -203 425 -238 346 -73 1536 -121 2366 -96 812 24 
                                1226 57 1410 112 246 73 441 261 525 505 128 371 150 1724 38 2294 -40 204
                                -115 349 -245 471 -114 107 -239 172 -392 204 -168 35 -532 66 -986 85 -254
                                11 -1128 20 -1310 14z m980 -404 c791 -24 1198 -59 1323 -116 101 -45 174 
                                -121 208 -216 27 -74 53 -229 71 -419 22 -235 25 -1056 5 -1304 -24 -288 -53
                                -459 -93 -537 -50 -99 -152 -175 -270 -202 -280 -65 -1478 -110 -2274 -87
                                -644 19 -1091 49 -1268 87 -183 38 -292 152 -331 349 -88 440 -88 1570 0 2010
                                21 107 57 179 118 241 96 95 184 120 508 148 538 46 1358 65 2003 46z"/>
                                <path d="M2050 2549 l0 -811 23 14 c12 8 325 189 695 403 370 214 671 393 670
                                397 -2 4 -295 176 -653 383 -357 207 -669 387 -692 401 l-43 25 0 -812z"/>
                                </g>
                            </svg>
                        </a>
                        <a className="header_section_1_icons-2" href = "https://vk.com/vipboat">
                            <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 48 48" width="96px" height="96px">
                            <path d="M45.763,35.202c-1.797-3.234-6.426-7.12-8.337-8.811c-0.523-0.463-0.579-1.264-0.103-1.776 
                            c3.647-3.919,6.564-8.422,7.568-11.143C45.334,12.27,44.417,11,43.125,11l-3.753,0c-1.237,0-1.961,0.444-2.306,1.151 
                            c-3.031,6.211-5.631,8.899-7.451,10.47c-1.019,0.88-2.608,0.151-2.608-1.188c0-2.58,0-5.915,0-8.28 
                            c0-1.147-0.938-2.075-2.095-2.075L18.056,11c-0.863,0-1.356,0.977-0.838,1.662l1.132,1.625c0.426,0.563,0.656,1.248,0.656,1.951 
                            L19,23.556c0,1.273-1.543,1.895-2.459,1.003c-3.099-3.018-5.788-9.181-6.756-12.128C9.505,11.578,8.706,11.002,7.8,11l-3.697-0.009 
                            c-1.387,0-2.401,1.315-2.024,2.639c3.378,11.857,10.309,23.137,22.661,24.36c1.217,0.12,2.267-0.86,2.267-2.073l0-3.846 
                            c0-1.103,0.865-2.051,1.977-2.079c0.039-0.001,0.078-0.001,0.117-0.001c3.267,0,6.926,4.755,8.206,6.979 
                            c0.368,0.64,1.056,1.03,1.8,1.03l4.973,0C45.531,38,46.462,36.461,45.763,35.202z"/>
                            </svg>
                        </a>
                        <a className="header_section_1_icons-3" href = "https://t.me/pavloydkzd">
                            <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                                width="866.000000pt" height="650.000000pt" viewBox="0 0 866.000000 650.000000"
                                  preserveAspectRatio="xMidYMid meet">

                                  <g transform="translate(0.000000,650.000000) scale(0.100000,-0.100000)"
                                  fill="#000000" stroke="none">
                                  <path d="M3435 6243 c-902 -23 -1354 -152 -1662 -476 -240 -253 -360 -587
                                  -408 -1146 -44 -505 -47 -2177 -5 -2691 50 -604 175 -955 434 -1213 243 -243
                                  566 -367 1094 -422 260 -27 532 -36 1227 -42 1302 -11 1847 28 2238 158 481
                                  159 770 505 882 1054 55 271 72 480 86 1065 18 729 2 1793 -32 2140 -68 707
                                  -281 1103 -714 1332 -288 151 -623 213 -1290 238 -224 8 -1558 11 -1850 3z
                                  m2120 -462 c530 -43 801 -125 979 -296 205 -198 287 -468 328 -1090 17 -263
                                  17 -2015 0 -2280 -28 -428 -73 -671 -157 -852 -144 -311 -407 -457 -935 -517
                                  -290 -33 -527 -40 -1440 -40 -947 0 -1182 7 -1480 45 -385 49 -573 122 -740
                                  289 -189 188 -267 441 -311 1015 -6 77 -13 520 -16 985 -7 1085 7 1489 62
                                  1815 30 174 65 296 115 400 176 365 502 497 1325 535 263 12 2100 5 2270 -9z"/>
                                  <path d="M5200 4619 c-267 -105 -737 -288 -1045 -409 -1812 -707 -1639 -637
                                  -1690 -685 -62 -58 -54 -113 24 -158 17 -11 214 -77 438 -148 l406 -129 461
                                  294 c254 161 664 423 911 581 248 158 469 296 493 307 47 21 82 16 82 -11 0
                                  -10 -92 -102 -217 -217 -120 -110 -458 -419 -750 -688 -388 -354 -533 -494
                                  -533 -509 0 -12 -11 -177 -25 -367 -31 -432 -31 -430 -5 -430 49 0 99 39 300
                                  236 117 115 216 209 221 209 4 0 183 -130 396 -290 213 -159 408 -300 432
                                  -312 63 -33 139 -31 179 2 17 14 40 44 51 68 11 24 82 340 165 737 80 382 200
                                  956 267 1275 132 623 142 696 106 763 -26 47 -72 72 -132 71 -40 0 -143 -37
                                  -535 -190z"/>
                                  </g>
                            </svg>
                        </a>
                    </div>
                    <div className="mobile-container-small-header">
                    <button className="mobile-header-add-to-favourite-btn" onClick={() => {navigate(`/favourites`)}}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="40px"
                      height="40px"
                      strokeWidth="2" 
                      fill="none"
                      >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                      2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09
                      C13.09 3.81 14.76 3 16.5 3
                      19.58 3 22 5.42 22 8.5
                      c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    <span>{favourites.length}</span>
                    </button>
                </div>
                </div>
          </div>
          <div className={`dropdown-wrapper-catalog-back-middle ${openMenuInnerMiddle === true ? "active" : ""}`}>
            <div
      className={`dropdown-wrapper-catalog-middle ${openMenuCatalogMiddle === true ? "active" : ""}`}
      onMouseEnter={() => {setOpenMenuCatalogMiddle(true); close_catalog_middle = false; setOpenMenuInnerMiddle(true);}}
      onMouseLeave={() => { setTimeout(() => {
            if (close_catalog_middle === true) {
              setOpenMenuInnerMiddle(false);
              }
          }, 25); close_catalog_middle = true; }}
    >
    <div className={`dropdown-catalog-menu-middle ${openMenuInnerMiddle === true ? "active" : ""}`}>
        <Category setOpenModal={setOpenModal} setModalType={setModalType} setStatusCode={setStatusCode} setToastMessage={setToastMessage} setCategoryId={setItemId} setCategoryName={setItemName} setCategoryImage={setItemImage} setCategoryAdress={setItemAdress} setCategoryAmount={setItemAmount} setLoading={setRequestLoading} setOpenMenu={setOpenMenuInnerMiddle} setVisibleAuth={setVisibleAuth}/>
    </div>
    </div>
          </div>
        </div>
        <div className={`mini-header ${visibleMiniHeader ? "active" : ""}`}>
          <div className="mini-header-inner">
            <button className="mobile-burger-btn-small-header" onClick={() => setOpen(!open)}>
      <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
 preserveAspectRatio="xMidYMid meet">

<g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
fill="#000000" stroke="none">
<path d="M642 4141 c-66 -23 -117 -63 -159 -125 -43 -63 -56 -116 -51 -201 8
-116 71 -211 176 -262 l57 -28 1895 0 1895 0 57 28 c62 30 115 83 150 149 19
36 23 58 23 138 0 80 -4 102 -23 138 -35 66 -88 119 -150 149 l-57 28 -1880 2
c-1801 2 -1882 2 -1933 -16z"/>
<path d="M642 2861 c-66 -23 -117 -63 -159 -125 -43 -63 -56 -116 -51 -201 8
-116 71 -211 176 -262 l57 -28 1895 0 1895 0 57 28 c62 30 115 83 150 149 19
36 23 58 23 138 0 80 -4 102 -23 138 -35 66 -88 119 -150 149 l-57 28 -1880 2
c-1801 2 -1882 2 -1933 -16z"/>
<path d="M642 1581 c-66 -23 -117 -63 -159 -125 -43 -63 -56 -116 -51 -201 8
-116 71 -211 176 -262 l57 -28 1895 0 1895 0 57 28 c62 30 115 83 150 149 19
36 23 58 23 138 0 80 -4 102 -23 138 -35 66 -88 119 -150 149 l-57 28 -1880 2
c-1801 2 -1882 2 -1933 -16z"/>
</g>
</svg>
    </button>

    <img loading="lazy" className="logo-img-mini" src="/images/logo-small.png" alt="logo" onClick={() => navigate('/')}/>

    <div className="mobile-container-small-header">
                    <button className="mobile-header-search-btn" onClick={handleClick}>
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
                    <button className="mobile-header-add-to-favourite-btn" onClick={() => {navigate(`/favourites`)}}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="40px"
                      height="40px"
                      strokeWidth="2" 
                      fill="none"
                      >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                      2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09
                      C13.09 3.81 14.76 3 16.5 3
                      19.58 3 22 5.42 22 8.5
                      c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    <span>{favourites.length}</span>
                    </button>
                </div>
          </div>
        </div>
        </>
      )
    }
    else{
      return (
        <>
        <section className ="header">
            <div className="header_section_1">
                <div className="header_section_1_container">
                    <div className="header_section_1_tab_1">
                    <Link className="header_section_1_tab_1_cruises" to='/cruises'>
                        круизы
                    </Link>
                    <div className="header-section-1-line"></div>
                    <Link className="header_section_1_tab_1_catering" to='/catering'>
                        кейтеринг
                    </Link>
                </div>
                <div className="header_section_1_tab_2">
                  <div className="header-phone-wrapper">
                    <a href="tel:+79643333636" className="header-phone-number">
                      +7 964 333-36-36
                    </a>
                  </div>
                    <div className="header_section_1_icons">
                        <a className="header_section_1_icons-1"  href = "https://www.youtube.com/@vipboatspb">
                            <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                              width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
                                preserveAspectRatio="xMidYMid meet">

                                <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                                fill="#000000" stroke="none">
                                <path d="M2115 4394 c-858 -28 -1241 -56 -1440 -105 -154 -37 -279 -112 -391
                                -232 -118 -127 -171 -236 -210 -426 -99 -488 -99 -1675 0 -2164 39 -189 94
                                -301 210 -424 116 -123 257 -203 425 -238 346 -73 1536 -121 2366 -96 812 24 
                                1226 57 1410 112 246 73 441 261 525 505 128 371 150 1724 38 2294 -40 204
                                -115 349 -245 471 -114 107 -239 172 -392 204 -168 35 -532 66 -986 85 -254
                                11 -1128 20 -1310 14z m980 -404 c791 -24 1198 -59 1323 -116 101 -45 174 
                                -121 208 -216 27 -74 53 -229 71 -419 22 -235 25 -1056 5 -1304 -24 -288 -53
                                -459 -93 -537 -50 -99 -152 -175 -270 -202 -280 -65 -1478 -110 -2274 -87
                                -644 19 -1091 49 -1268 87 -183 38 -292 152 -331 349 -88 440 -88 1570 0 2010
                                21 107 57 179 118 241 96 95 184 120 508 148 538 46 1358 65 2003 46z"/>
                                <path d="M2050 2549 l0 -811 23 14 c12 8 325 189 695 403 370 214 671 393 670
                                397 -2 4 -295 176 -653 383 -357 207 -669 387 -692 401 l-43 25 0 -812z"/>
                                </g>
                            </svg>
                        </a>
                        <a className="header_section_1_icons-2" href = "https://vk.com/vipboat">
                            <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 48 48" width="96px" height="96px">
                            <path d="M45.763,35.202c-1.797-3.234-6.426-7.12-8.337-8.811c-0.523-0.463-0.579-1.264-0.103-1.776 
                            c3.647-3.919,6.564-8.422,7.568-11.143C45.334,12.27,44.417,11,43.125,11l-3.753,0c-1.237,0-1.961,0.444-2.306,1.151 
                            c-3.031,6.211-5.631,8.899-7.451,10.47c-1.019,0.88-2.608,0.151-2.608-1.188c0-2.58,0-5.915,0-8.28 
                            c0-1.147-0.938-2.075-2.095-2.075L18.056,11c-0.863,0-1.356,0.977-0.838,1.662l1.132,1.625c0.426,0.563,0.656,1.248,0.656,1.951 
                            L19,23.556c0,1.273-1.543,1.895-2.459,1.003c-3.099-3.018-5.788-9.181-6.756-12.128C9.505,11.578,8.706,11.002,7.8,11l-3.697-0.009 
                            c-1.387,0-2.401,1.315-2.024,2.639c3.378,11.857,10.309,23.137,22.661,24.36c1.217,0.12,2.267-0.86,2.267-2.073l0-3.846 
                            c0-1.103,0.865-2.051,1.977-2.079c0.039-0.001,0.078-0.001,0.117-0.001c3.267,0,6.926,4.755,8.206,6.979 
                            c0.368,0.64,1.056,1.03,1.8,1.03l4.973,0C45.531,38,46.462,36.461,45.763,35.202z"/>
                            </svg>
                        </a>
                        <a className="header_section_1_icons-3" href = "https://t.me/pavloydkzd">
                            <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                                width="866.000000pt" height="650.000000pt" viewBox="0 0 866.000000 650.000000"
                                  preserveAspectRatio="xMidYMid meet">

                                  <g transform="translate(0.000000,650.000000) scale(0.100000,-0.100000)"
                                  fill="#000000" stroke="none">
                                  <path d="M3435 6243 c-902 -23 -1354 -152 -1662 -476 -240 -253 -360 -587
                                  -408 -1146 -44 -505 -47 -2177 -5 -2691 50 -604 175 -955 434 -1213 243 -243
                                  566 -367 1094 -422 260 -27 532 -36 1227 -42 1302 -11 1847 28 2238 158 481
                                  159 770 505 882 1054 55 271 72 480 86 1065 18 729 2 1793 -32 2140 -68 707
                                  -281 1103 -714 1332 -288 151 -623 213 -1290 238 -224 8 -1558 11 -1850 3z
                                  m2120 -462 c530 -43 801 -125 979 -296 205 -198 287 -468 328 -1090 17 -263
                                  17 -2015 0 -2280 -28 -428 -73 -671 -157 -852 -144 -311 -407 -457 -935 -517
                                  -290 -33 -527 -40 -1440 -40 -947 0 -1182 7 -1480 45 -385 49 -573 122 -740
                                  289 -189 188 -267 441 -311 1015 -6 77 -13 520 -16 985 -7 1085 7 1489 62
                                  1815 30 174 65 296 115 400 176 365 502 497 1325 535 263 12 2100 5 2270 -9z"/>
                                  <path d="M5200 4619 c-267 -105 -737 -288 -1045 -409 -1812 -707 -1639 -637
                                  -1690 -685 -62 -58 -54 -113 24 -158 17 -11 214 -77 438 -148 l406 -129 461
                                  294 c254 161 664 423 911 581 248 158 469 296 493 307 47 21 82 16 82 -11 0
                                  -10 -92 -102 -217 -217 -120 -110 -458 -419 -750 -688 -388 -354 -533 -494
                                  -533 -509 0 -12 -11 -177 -25 -367 -31 -432 -31 -430 -5 -430 49 0 99 39 300
                                  236 117 115 216 209 221 209 4 0 183 -130 396 -290 213 -159 408 -300 432
                                  -312 63 -33 139 -31 179 2 17 14 40 44 51 68 11 24 82 340 165 737 80 382 200
                                  956 267 1275 132 623 142 696 106 763 -26 47 -72 72 -132 71 -40 0 -143 -37
                                  -535 -190z"/>
                                  </g>
                            </svg>
                        </a>
                    </div>
                    <button className="header_section_1_tab_2-order-btn" onClick={() => setVisibleRequest(true)}>
                        заказать звонок
                    </button>
                </div>
                </div>
            </div>
    <div className="header_section_2">
  <div className="header_section_2-container">
    {/* Бургер */}
    <button className="mobile-burger-btn" onClick={() => setOpen(!open)}>
      <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
 preserveAspectRatio="xMidYMid meet">

<g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
fill="#000000" stroke="none">
<path d="M642 4141 c-66 -23 -117 -63 -159 -125 -43 -63 -56 -116 -51 -201 8
-116 71 -211 176 -262 l57 -28 1895 0 1895 0 57 28 c62 30 115 83 150 149 19
36 23 58 23 138 0 80 -4 102 -23 138 -35 66 -88 119 -150 149 l-57 28 -1880 2
c-1801 2 -1882 2 -1933 -16z"/>
<path d="M642 2861 c-66 -23 -117 -63 -159 -125 -43 -63 -56 -116 -51 -201 8
-116 71 -211 176 -262 l57 -28 1895 0 1895 0 57 28 c62 30 115 83 150 149 19
36 23 58 23 138 0 80 -4 102 -23 138 -35 66 -88 119 -150 149 l-57 28 -1880 2
c-1801 2 -1882 2 -1933 -16z"/>
<path d="M642 1581 c-66 -23 -117 -63 -159 -125 -43 -63 -56 -116 -51 -201 8
-116 71 -211 176 -262 l57 -28 1895 0 1895 0 57 28 c62 30 115 83 150 149 19
36 23 58 23 138 0 80 -4 102 -23 138 -35 66 -88 119 -150 149 l-57 28 -1880 2
c-1801 2 -1882 2 -1933 -16z"/>
</g>
</svg>
    </button>

    {/* Сайдбар */}
    <div className={`sidebar ${open ? "active" : ""}`}>
      {/* Поиск */}
      <div className="mobile-category-sidebar-inputs">
        <div className="mobile-category-sidebar-inputs-container">
          <input type="text" placeholder="Поиск товаров" value={search} ref={searchInputRef} maxLength={20} onChange={onChangeSearch}/>
          {search != "" && (
          <button className="mobile-category-sidebar-inputs-clear-button" onClick={clearSearch}>
                        <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                        width="90.000000pt" height="90.000000pt" viewBox="0 0 90.000000 90.000000"
                        preserveAspectRatio="xMidYMid meet">

                        <g transform="translate(0.000000,90.000000) scale(0.100000,-0.100000)">
                        <path d="M205 695 c-14 -13 -25 -29 -25 -36 0 -6 44 -56 97 -110 l97 -99 -97
                            -99 c-53 -54 -97 -104 -97 -110 0 -15 46 -61 61 -61 6 0 56 44 110 97 l99 97
                            99 -97 c54 -53 104 -97 110 -97 15 0 61 46 61 61 0 6 -44 56 -97 110 l-97 99
                            97 99 c53 54 97 104 97 110 0 15 -46 61 -61 61 -6 0 -56 -44 -110 -97 l-99
                            -97 -99 97 c-54 53 -104 97 -110 97 -7 0 -23 -11 -36 -25z"/>
                        </g>
                    </svg>
                    </button>
        )}
        </div>
        <button className="header-search-btn white" onClick={() => {navigate(`/search?${search}`); setOpen(false);}}>
            {loading ? (
                <span className="loading-spinner"></span>
            ) : (
                 <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                            width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
                                preserveAspectRatio="xMidYMid meet">

                                <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)">
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
            )}
        </button>
      </div>

      {searchedData.length > 0 && search !== "" && (
        <SimpleBar style={{ maxHeight: '300px', width: '100%' }} autoHide={false}>
                            <div className="search-dropdown-grid-mobile">
                              {searchedData.map((item, index) => (
                                <button key={index} className="search-dropdown-grid-item-mobile" onClick={() => {navigate(item.api_adress); setOpen(false);}}>
                              <div className="search-dropdown-grid-item-image-container-mobile">
                                <img loading="lazy" src={item.images[0].src} alt={item.name} />
                              </div>
                                <div className="search-dropdown-grid-item-desc-container-mobile">
                                  <span className="search-dropdown-grid-item-name-mobile">{item.name}</span>
                                  {item.price !== 0 && (
                                    <div className="search-dropdown-grid-item-prices-mobile">
                                      <span className="search-dropdown-grid-item-from-mobile">от:</span>
                                      {item.discount !== 0 && (
                                    <span className="search-dropdown-grid-item-discount-mobile">{item.discount} руб/час</span>
                                      )}
                                      <span className="search-dropdown-grid-item-price-mobile">{item.price} руб/час</span>
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
                            <button className="view-all-btn-mobile" onClick={() => {navigate(`/search?${search}`); setOpen(false);}}>ВСЕ РЕЗУЛЬТАТЫ</button>
                          )}
                          </SimpleBar>
      )}

      {/* Кнопки Меню/Категории */}
      <div className="mobile-caregory-options">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
            onMouseEnter={() => setHoveredTab(tab)}
            onMouseLeave={() => setHoveredTab(null)}
          >
            {tab === "menu" ? "Меню" : "Категории"}
          </button>
        ))}
        {/* Линия под кнопками */}
<div
  className="underline"
  style={{
    left: `${left}px`,
    width: `${width}px`
  }}
/>
</div>

      {/* Список */}
      <ul>
        {(activeTab === "menu" ? menuItems : categoryItems).map((item) => (
            <li key={item.id}>
              {checkPath(item.api_adress) ? (
                <Link className="mobile-options-buttons" onClick={() => {setSearch(""); setActiveTab; setOpen(false)}} to={item.api_adress}>
                {item.name}
                </Link>
              ) : (
                <a className="mobile-options-buttons" onClick={() => {setSearch(""); setActiveTab; setOpen(false)}} href={item.api_adress} target="_blank" rel="noopener noreferrer">
                {item.name}
                </a>
              )}
            </li>
        ))}
      </ul>
    </div>

    {/* Overlay */}
    {open && <div className="overlay" onClick={() => setOpen(false)} />}

    {/* Логотип */}
    <img loading="lazy" className="logo-img" src="/images/logo.png" alt="logo" onClick={() => navigate('/')}/>

    {/* Дополнительно: кнопки поиска и избранного можно сюда добавить */}
    <div className="header-inputs-container">
                    <div className="header-inputs-container-container-in">
                      <input type="text" placeholder="Поиск товаров" onFocus={handleFocus} onBlur={handleBlur} value={search} maxLength={20} onChange={onChangeSearch}/>
                      {search != "" && (
                      <button className="header-inputs-container-clear" onClick={clearSearch}>
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
                    </div>
                    <div className="category-header-dropDown">
                    <div className="dropdown-wrapper">
                        <button onClick={() => setOpen(!open)} className="category-header-btn">
                    <span className="category-header-btn-description">{selected}</span>
                    <span className="category-arrow">▾</span>
                    </button>
                    <div className={`dropdown-header-menu ${open ? "active" : ""}`}>
                          {category.map((item) => (
                          <div className="dropdown-header-menu-btn-container-admin" key={item.id}>
                            <button
                          className="dropdown-header-menu-btn admin"
                          onClick={() => {
                          setSelected(item.name);
                          setOpen(false);
                          }}
                          >
                          {item.name}
                          </button>
                          </div>
                          ))}
                    </div>
                    </div>
                    </div>
                    <button className="header-search-btn" onClick={() => {navigate(`/search?${search}`)}}>
                      {loading ? (
                        <span className="loading-spinner"></span>
                      ) : (
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
                      )}
                    </button>
                    <div onFocus={handleFocus} onBlur={handleBlur} ref={dropDownRef} className={`search-dropdown ${search != "" && searchedData.length > 0 && isFocused ? "active" : ""}`}>
                      {searchedData.length == 1 ? (
                        <button onMouseDown={() => {navigate(searchedData[0].api_adress); setOpen(false); setIsFocused(false); setSearch('');}} className="search-dropdown-1-item">
                        <div className="search-dropdown-1-item-image-container">
                            <img loading="lazy" src={searchedData[0].images[0].src} alt={searchedData[0].name} />
                          </div>
                          <div className="search-dropdown-1-item-desc-container">
                            <span className="search-dropdown-1-item-desc-container-name">{searchedData[0].name}</span>
                            {searchedData[0].price != 0 && (
                              <div className="search-dropdown-1-item-prices">
                              <span className="search-dropdown-1-item-prices-from">от:</span>
                              {searchedData[0].discount != 0 && (
                                <span className="search-dropdown-1-item-prices-discount">{searchedData[0].discount}{" "}руб/час</span>
                              )}
                              <span className="search-dropdown-1-item-prices-price">{searchedData[0].price}{" "}руб/час</span>
                            </div>
                            )}
                          </div>
                        </button>
                      ) : (
                          <div className="search-dropdown-wrapper">
                            <SimpleBar style={{ maxHeight: '300px', overflowY: 'auto', width: '100%' }} autoHide={false}>
                            <div className="search-dropdown-grid">
                              {searchedData.map((item, index) => (
                                <button onMouseDown={() => {navigate(item.api_adress); setOpen(false); setIsFocused(false); setSearch('');}} className="search-dropdown-grid-item">
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
                            <button className="view-all-btn" onMouseDown={() => {navigate(`/search?${search}`); setOpen(false); setIsFocused(false); setSearch('');}}>ВСЕ РЕЗУЛЬТАТЫ</button>
                          )}
                          </SimpleBar>
                          </div>
                      )}
                      </div>
                    <div className={`search-dropdown-no-found ${search != "" && searchedData.length === 0 && isFocused ? "show" : ""}`}>
                        <span>Товаров не найдено</span>
                      </div>
                </div>
                <button className="header-add-to-favourite-btn" onClick={() => {navigate(`/favourites`);}}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="40px"
                      height="40px"
                      strokeWidth="2" 
                      fill="none"
                      >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                      2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09
                      C13.09 3.81 14.76 3 16.5 3
                      19.58 3 22 5.42 22 8.5
                      c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    <span>{favourites.length}</span>
                </button>
                <button className="header-add-review-btn" onClick={() => window.location.href ="https://yandex.ru/profile/192123962816?lang=ru&utm_source=telegram&utm_medium=social&utm_campaign=share"}>
                    <img loading="lazy" src="/images/review.webp" alt="yandex reviews preview" />
                </button>
                <div className="mobile-container">
                    <button className="mobile-header-search-btn" onClick={handleClick}>
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
                    <button className="mobile-header-add-to-favourite-btn" onClick={() => {navigate(`/favourites`)}}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="40px"
                      height="40px"
                      strokeWidth="2" 
                      fill="none"
                      >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                      2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09
                      C13.09 3.81 14.76 3 16.5 3
                      19.58 3 22 5.42 22 8.5
                      c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    <span>{favourites.length}</span>
                    </button>
                </div>
                </div>
            </div>
            <div className="header_section_3">
                <div className="header_section_3-container">
                    <div className="header_section_3-tab-1">
                    <div className="dropdown-wrapper"
                        onMouseEnter={() => setOpenMenu("popular")}
                        onMouseLeave={() => setOpenMenu(null)}
                    >
                   <button className="header_section_3-popular-choice">
                   <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
 preserveAspectRatio="xMidYMid meet">

<g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
fill="#000000" stroke="none">
<path d="M642 4141 c-66 -23 -117 -63 -159 -125 -43 -63 -56 -116 -51 -201 8
-116 71 -211 176 -262 l57 -28 1895 0 1895 0 57 28 c62 30 115 83 150 149 19
36 23 58 23 138 0 80 -4 102 -23 138 -35 66 -88 119 -150 149 l-57 28 -1880 2
c-1801 2 -1882 2 -1933 -16z"/>
<path d="M642 2861 c-66 -23 -117 -63 -159 -125 -43 -63 -56 -116 -51 -201 8
-116 71 -211 176 -262 l57 -28 1895 0 1895 0 57 28 c62 30 115 83 150 149 19
36 23 58 23 138 0 80 -4 102 -23 138 -35 66 -88 119 -150 149 l-57 28 -1880 2
c-1801 2 -1882 2 -1933 -16z"/>
<path d="M642 1581 c-66 -23 -117 -63 -159 -125 -43 -63 -56 -116 -51 -201 8
-116 71 -211 176 -262 l57 -28 1895 0 1895 0 57 28 c62 30 115 83 150 149 19
36 23 58 23 138 0 80 -4 102 -23 138 -35 66 -88 119 -150 149 l-57 28 -1880 2
c-1801 2 -1882 2 -1933 -16z"/>
</g>
</svg>
                   <span>популярный выбор</span>
                   <span className="category-arrow">▾</span>
                   </button>
                   <div className={`dropdown-popular-menu ${openMenu === "popular" ? "active" : ""}`}>
                   {populars.map((item, index) => (
                   <>
                   {checkPath(item.api_adress) ? (
                              <Link to={item.api_adress} onClick={() => setSearch("")} className={`dropdown-popular-menu-btn${index === populars.length - 1 ? " last" : ""}`}>
                                {item.name}
                              </Link>
                            ) : (
                              <a className={`dropdown-popular-menu-btn${index === populars.length - 1 ? " last" : ""}`} href={item.api_adress} target="_blank" rel="noopener noreferrer" onClick={() => setSearch("")}>
                                {item.name}
                              </a>
                            )}
                   </>
                   ))}
                   </div>
                </div>
                <div className="dropdown-wrapper" onMouseEnter={() => {setOpenMenuCatalog(true); close_catalog = false}}
                       onMouseLeave={() => {setOpenMenuInner(false); close_catalog = true}}>
                        <button className="header_section_3-btn">
                    <span>каталог услуг</span>
                    <span className="category-arrow">▾</span>
                </button>
                </div >
                <div className="dropdown-wrapper"
                        onMouseEnter={() => setOpenMenu("about")}
                        onMouseLeave={() => setOpenMenu(null)}>
                        <button className="header_section_3-btn">
                    <span>о компании</span>
                    <span className="category-arrow">▾</span>
                </button>
                <div className={`dropdown-about-menu ${openMenu === "about" && !openMenuMiddle ? "active" : ""}`}>
                          {about.map((item, index) => (
                          <>
                          {checkPath(item.api_adress) ? (
                              <Link key={item.id} to={item.api_adress} onClick={() => setSearch("")} className={`dropdown-about-menu-btn${index === about.length - 1 ? " last" : ""}`}>
                                {item.name}
                              </Link>
                            ) : (
                              <a key={item.id} className={`dropdown-about-menu-btn${index === about.length - 1 ? " last" : ""}`} href={item.api_adress} target="_blank" rel="noopener noreferrer" onClick={() => setSearch("")}>
                                {item.name}
                              </a>
                            )}
                          </>
                          ))}
                    </div>
                </div>
                <Link className="header_section_3-btn" to="/news">
                    новости
                </Link>
                </div>
                <div className="header_section_3-tab-2">
                     {pages.map((item, index) => (
                    <>
                    {checkPath(item.api_adress) ? (
                              <Link to={item.api_adress} onClick={() => setSearch("")} className={`header_section_3-btn${index === pages.length - 1 ? " last" : ""}`}>
                                {item.name}
                              </Link>
                            ) : (
                              <a className={`header_section_3-btn${index === pages.length - 1 ? " last" : ""}`} href={item.api_adress} target="_blank" rel="noopener noreferrer" onClick={() => setSearch("")}>
                                {item.name}
                              </a>
                            )}
                    </>
                    ))}
                </div>

                  <button className="header_section_1_tab_2-order-btn-2" onClick={() => setVisibleRequest(true)}>
                        заказать звонок
                    </button>
                </div>
                <div className={`dropdown-wrapper-catalog-back ${openMenuInner === true ? "active" : ""}`}>
                  <div
      className={`dropdown-wrapper-catalog ${openMenuCatalog === true ? "active" : ""}`}
      onMouseEnter={() => {setOpenMenuCatalog(true); close_catalog = false; setOpenMenuInner(true);}}
      onMouseLeave={() => { setTimeout(() => {
            if (close_catalog === true) {
              setOpenMenuInner(false);
              }
          }, 25); close_catalog = true; }}
    >
    <div className={`dropdown-catalog-menu ${openMenuInner === true ? "active" : ""}`}>
        <Category setOpenModal={setOpenModal} setModalType={setModalType} setStatusCode={setStatusCode} setToastMessage={setToastMessage} setCategoryId={setItemId} setCategoryName={setItemName} setCategoryImage={setItemImage} setCategoryAdress={setItemAdress} setCategoryAmount={setItemAmount} setLoading={setRequestLoading} setOpenMenu={setOpenMenuInner} setVisibleAuth={setVisibleAuth}/>
    </div>
    </div>
                </div>
            </div>
            {requestLoading && (
              <LoadingGif loading={true}/>
            )}
            <CallRequest product_name={"заказать звонок"} visible={visibleRequest} setVisible={setVisibleRequest}/>
        </section>
        <div className={`middle-header ${visibleMiddleHeader ? "active" : ""}`}>
          <div className="mini-header-inner">
    <img loading="lazy" className="logo-img-mini" src="/images/logo-small.png" alt="logo" onClick={() => navigate('/')}/>
    <div className="header_section_3-tab-1 middle">
                <div className="dropdown-wrapper" onMouseEnter={() => {setOpenMenuCatalogMiddle(true); close_catalog_middle = false}}
                       onMouseLeave={() => {setOpenMenuInnerMiddle(false); close_catalog_middle = true}}>
                        <button className="header_section_3-btn">
                    <span>каталог услуг</span>
                    <span className="category-arrow">▾</span>
                </button>
                </div >
                <div className="dropdown-wrapper"
                        onMouseEnter={() => {setOpenMenu("about"); setOpenMenuMiddle(true);}}
                        onMouseLeave={() => {setOpenMenu(null); setOpenMenuMiddle(false);}}>
                        <button className="header_section_3-btn">
                    <span>о компании</span>
                    <span className="category-arrow">▾</span>
                </button>
                <div className={`dropdown-about-menu ${openMenu === "about" && openMenuMiddle ? "active" : ""}`}>
                          {about.map((item, index) => (
                          <>
                          {checkPath(item.api_adress) ? (
                              <Link key={item.id} to={item.api_adress} onClick={() => setSearch("")} className={`dropdown-about-menu-btn${index === about.length - 1 ? " last" : ""}`}>
                                {item.name}
                              </Link>
                            ) : (
                              <a key={item.id} className={`dropdown-about-menu-btn${index === about.length - 1 ? " last" : ""}`} href={item.api_adress} target="_blank" rel="noopener noreferrer" onClick={() => setSearch("")}>
                                {item.name}
                              </a>
                            )}
                          </>
                          ))}
                    </div>
                </div>
                <Link className="header_section_3-btn" to="/news">
                    новости
                </Link>
                </div>
                <div className="header_section_1_tab_2 inner">
                  <div className="header-phone-wrapper">
                    <a href="tel:+79643333636" className="header-phone-number">
                      +7 964 333-36-36
                    </a>
                  </div>
                    <div className="header_section_1_icons">
                        <a className="header_section_1_icons-1" href = "https://www.youtube.com/@vipboatspb">
                            <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                              width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
                                preserveAspectRatio="xMidYMid meet">

                                <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                                fill="#000000" stroke="none">
                                <path d="M2115 4394 c-858 -28 -1241 -56 -1440 -105 -154 -37 -279 -112 -391
                                -232 -118 -127 -171 -236 -210 -426 -99 -488 -99 -1675 0 -2164 39 -189 94
                                -301 210 -424 116 -123 257 -203 425 -238 346 -73 1536 -121 2366 -96 812 24 
                                1226 57 1410 112 246 73 441 261 525 505 128 371 150 1724 38 2294 -40 204
                                -115 349 -245 471 -114 107 -239 172 -392 204 -168 35 -532 66 -986 85 -254
                                11 -1128 20 -1310 14z m980 -404 c791 -24 1198 -59 1323 -116 101 -45 174 
                                -121 208 -216 27 -74 53 -229 71 -419 22 -235 25 -1056 5 -1304 -24 -288 -53
                                -459 -93 -537 -50 -99 -152 -175 -270 -202 -280 -65 -1478 -110 -2274 -87
                                -644 19 -1091 49 -1268 87 -183 38 -292 152 -331 349 -88 440 -88 1570 0 2010
                                21 107 57 179 118 241 96 95 184 120 508 148 538 46 1358 65 2003 46z"/>
                                <path d="M2050 2549 l0 -811 23 14 c12 8 325 189 695 403 370 214 671 393 670
                                397 -2 4 -295 176 -653 383 -357 207 -669 387 -692 401 l-43 25 0 -812z"/>
                                </g>
                            </svg>
                        </a>
                        <a className="header_section_1_icons-2" href = "https://vk.com/vipboat">
                            <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 48 48" width="96px" height="96px">
                            <path d="M45.763,35.202c-1.797-3.234-6.426-7.12-8.337-8.811c-0.523-0.463-0.579-1.264-0.103-1.776 
                            c3.647-3.919,6.564-8.422,7.568-11.143C45.334,12.27,44.417,11,43.125,11l-3.753,0c-1.237,0-1.961,0.444-2.306,1.151 
                            c-3.031,6.211-5.631,8.899-7.451,10.47c-1.019,0.88-2.608,0.151-2.608-1.188c0-2.58,0-5.915,0-8.28 
                            c0-1.147-0.938-2.075-2.095-2.075L18.056,11c-0.863,0-1.356,0.977-0.838,1.662l1.132,1.625c0.426,0.563,0.656,1.248,0.656,1.951 
                            L19,23.556c0,1.273-1.543,1.895-2.459,1.003c-3.099-3.018-5.788-9.181-6.756-12.128C9.505,11.578,8.706,11.002,7.8,11l-3.697-0.009 
                            c-1.387,0-2.401,1.315-2.024,2.639c3.378,11.857,10.309,23.137,22.661,24.36c1.217,0.12,2.267-0.86,2.267-2.073l0-3.846 
                            c0-1.103,0.865-2.051,1.977-2.079c0.039-0.001,0.078-0.001,0.117-0.001c3.267,0,6.926,4.755,8.206,6.979 
                            c0.368,0.64,1.056,1.03,1.8,1.03l4.973,0C45.531,38,46.462,36.461,45.763,35.202z"/>
                            </svg>
                        </a>
                        <a className="header_section_1_icons-3" href = "https://t.me/pavloydkzd">
                            <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                                width="866.000000pt" height="650.000000pt" viewBox="0 0 866.000000 650.000000"
                                  preserveAspectRatio="xMidYMid meet">

                                  <g transform="translate(0.000000,650.000000) scale(0.100000,-0.100000)"
                                  fill="#000000" stroke="none">
                                  <path d="M3435 6243 c-902 -23 -1354 -152 -1662 -476 -240 -253 -360 -587
                                  -408 -1146 -44 -505 -47 -2177 -5 -2691 50 -604 175 -955 434 -1213 243 -243
                                  566 -367 1094 -422 260 -27 532 -36 1227 -42 1302 -11 1847 28 2238 158 481
                                  159 770 505 882 1054 55 271 72 480 86 1065 18 729 2 1793 -32 2140 -68 707
                                  -281 1103 -714 1332 -288 151 -623 213 -1290 238 -224 8 -1558 11 -1850 3z
                                  m2120 -462 c530 -43 801 -125 979 -296 205 -198 287 -468 328 -1090 17 -263
                                  17 -2015 0 -2280 -28 -428 -73 -671 -157 -852 -144 -311 -407 -457 -935 -517
                                  -290 -33 -527 -40 -1440 -40 -947 0 -1182 7 -1480 45 -385 49 -573 122 -740
                                  289 -189 188 -267 441 -311 1015 -6 77 -13 520 -16 985 -7 1085 7 1489 62
                                  1815 30 174 65 296 115 400 176 365 502 497 1325 535 263 12 2100 5 2270 -9z"/>
                                  <path d="M5200 4619 c-267 -105 -737 -288 -1045 -409 -1812 -707 -1639 -637
                                  -1690 -685 -62 -58 -54 -113 24 -158 17 -11 214 -77 438 -148 l406 -129 461
                                  294 c254 161 664 423 911 581 248 158 469 296 493 307 47 21 82 16 82 -11 0
                                  -10 -92 -102 -217 -217 -120 -110 -458 -419 -750 -688 -388 -354 -533 -494
                                  -533 -509 0 -12 -11 -177 -25 -367 -31 -432 -31 -430 -5 -430 49 0 99 39 300
                                  236 117 115 216 209 221 209 4 0 183 -130 396 -290 213 -159 408 -300 432
                                  -312 63 -33 139 -31 179 2 17 14 40 44 51 68 11 24 82 340 165 737 80 382 200
                                  956 267 1275 132 623 142 696 106 763 -26 47 -72 72 -132 71 -40 0 -143 -37
                                  -535 -190z"/>
                                  </g>
                            </svg>
                        </a>
                    </div>
                    <div className="mobile-container-small-header">
                    <button className="mobile-header-add-to-favourite-btn" onClick={() => {navigate(`/favourites`)}}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="40px"
                      height="40px"
                      strokeWidth="2" 
                      fill="none"
                      >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                      2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09
                      C13.09 3.81 14.76 3 16.5 3
                      19.58 3 22 5.42 22 8.5
                      c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    <span>{favourites.length}</span>
                    </button>
                </div>
                </div>
          </div>
          <div className={`dropdown-wrapper-catalog-back-middle ${openMenuInnerMiddle === true ? "active" : ""}`}>
            <div
      className={`dropdown-wrapper-catalog-middle ${openMenuCatalogMiddle === true ? "active" : ""}`}
      onMouseEnter={() => {setOpenMenuCatalogMiddle(true); close_catalog_middle = false; setOpenMenuInnerMiddle(true);}}
      onMouseLeave={() => { setTimeout(() => {
            if (close_catalog_middle === true) {
              setOpenMenuInnerMiddle(false);
              }
          }, 25); close_catalog_middle = true; }}
    >
    <div className={`dropdown-catalog-menu-middle ${openMenuInnerMiddle === true ? "active" : ""}`}>
        <Category setOpenModal={setOpenModal} setModalType={setModalType} setStatusCode={setStatusCode} setToastMessage={setToastMessage} setCategoryId={setItemId} setCategoryName={setItemName} setCategoryImage={setItemImage} setCategoryAdress={setItemAdress} setCategoryAmount={setItemAmount} setLoading={setRequestLoading} setOpenMenu={setOpenMenuInnerMiddle} setVisibleAuth={setVisibleAuth}/>
    </div>
    </div>
          </div>
        </div>
        <div className={`mini-header ${visibleMiniHeader ? "active" : ""}`}>
          <div className="mini-header-inner">
            <button className="mobile-burger-btn-small-header" onClick={() => setOpen(!open)}>
      <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
 preserveAspectRatio="xMidYMid meet">

<g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
fill="#000000" stroke="none">
<path d="M642 4141 c-66 -23 -117 -63 -159 -125 -43 -63 -56 -116 -51 -201 8
-116 71 -211 176 -262 l57 -28 1895 0 1895 0 57 28 c62 30 115 83 150 149 19
36 23 58 23 138 0 80 -4 102 -23 138 -35 66 -88 119 -150 149 l-57 28 -1880 2
c-1801 2 -1882 2 -1933 -16z"/>
<path d="M642 2861 c-66 -23 -117 -63 -159 -125 -43 -63 -56 -116 -51 -201 8
-116 71 -211 176 -262 l57 -28 1895 0 1895 0 57 28 c62 30 115 83 150 149 19
36 23 58 23 138 0 80 -4 102 -23 138 -35 66 -88 119 -150 149 l-57 28 -1880 2
c-1801 2 -1882 2 -1933 -16z"/>
<path d="M642 1581 c-66 -23 -117 -63 -159 -125 -43 -63 -56 -116 -51 -201 8
-116 71 -211 176 -262 l57 -28 1895 0 1895 0 57 28 c62 30 115 83 150 149 19
36 23 58 23 138 0 80 -4 102 -23 138 -35 66 -88 119 -150 149 l-57 28 -1880 2
c-1801 2 -1882 2 -1933 -16z"/>
</g>
</svg>
    </button>

    <img loading="lazy" className="logo-img-mini" src="/images/logo-small.png" alt="logo" onClick={() => navigate('/')}/>

    <div className="mobile-container-small-header">
                    <button className="mobile-header-search-btn" onClick={handleClick}>
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
                    <button className="mobile-header-add-to-favourite-btn" onClick={() => {navigate(`/favourites`)}}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="40px"
                      height="40px"
                      strokeWidth="2" 
                      fill="none"
                      >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                      2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09
                      C13.09 3.81 14.76 3 16.5 3
                      19.58 3 22 5.42 22 8.5
                      c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    <span>{favourites.length}</span>
                    </button>
                </div>
          </div>
        </div>
        </>
    )
  }
}