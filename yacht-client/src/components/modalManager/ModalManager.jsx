import React from "react";
import {useState, useEffect, useRef} from "react"
import { createPortal } from "react-dom";
import { BASE_URL } from '../../config';
import { lazy, Suspense } from 'react';
const QuillRedactor = lazy(() => import('../redactor/QuillRedactor'));
import Toast from "../adminMessage/adminMessage";
import { div, image, span } from "framer-motion/client";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { NativeAnimationWrapper } from "framer-motion";
import AuthForm from "../AuthForm/AuthForm";
import LoadingGif from "../loadingGif/LoadingGif";
import LoadingGifPage from "../LoadingGifPage/LoadingGifPage";
import { DayPicker } from "@daypicker/react";
import { addDays, format } from "date-fns";
import "@daypicker/react/style.css";
import "./ModalManager.css"

function Range({range, setRange, disabled}) {

  let footer = "Выберите даты";

  if (range?.from) {
    if (!range.to) {
      footer = format(range.from, "PPP");
    } else {
      footer = `${format(range.from, "PPP")} – ${format(range.to, "PPP")}`;
    }
  }

  return (
    <div>
      <DayPicker
        mode="range"
        selected={range}
        onSelect={setRange}
        footer={footer}
        disabled={disabled}
      />
    </div>
  );
}

function BaseModal({ title, children, onClose, isOpen=false}) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

useEffect(() => {
  if (isOpen) {
    requestAnimationFrame(() => setVisible(true));
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
    setVisible(false);
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [isOpen]);

  const handleClose = () => {
    setClosing(true);
    setVisible(false);
    setTimeout(() => {
      onClose();
    }, 500)
  };

  return (
    <div className="overlay-overlay">
      <div className={`modal-overlay ${visible ? "active" : ("")} ${closing ? "closing" : ""}`} onClick={handleClose}>
        <SimpleBar className="modal-scroll" style={{ maxHeight: 600 }}>
          <div className={`modal-content`} onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {children}
        <button className="modal-close" onClick={handleClose}>
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
      </div>
        </SimpleBar>
    </div>
    </div>
  );
}

const TagButtonDelete = ({ item, handleDeleteTag }) => {
  const [hovered, setHovered] = useState(false);
  const buttonRef = useRef(null);

  return (
    <div
      style={{ display: "inline-block", position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        ref={buttonRef}
        className="available-tags-button"
        style={{ position: "relative" }}
      >
        <img loading="lazy" src={item.image_src} alt={item.name} />
      </button>

      {hovered &&
        buttonRef.current &&
        createPortal(
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteTag(item.id);
              setHovered(false);
            }}
            className="delete-tag-button"
            style={{
              position: "fixed",
              top: buttonRef.current.getBoundingClientRect().top - 25,
              left:
                buttonRef.current.getBoundingClientRect().left +
                buttonRef.current.offsetWidth / 2,
              transform: "translateX(-50%)",
              backgroundColor: "#FFFFFF",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              fontSize: "16px",
              cursor: "pointer",
              zIndex: 99999999999,
            }}
          >
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
          </button>,
          document.body
        )}
    </div>
  );
};

const TagSearchButtonDelete = ({ item, handleDeleteTag }) => {
  const [hovered, setHovered] = useState(false);
  const buttonRef = useRef(null);

  return (
    <div
    className="TagSearchButtonDelete-container"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        ref={buttonRef}
        className="available-groups-button search"
        style={{ position: "relative" }}
      >
        <span>{item.name}</span>
      </button>

      {hovered &&
        buttonRef.current &&
        createPortal(
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteTag(item.id);
              setHovered(false);
            }}
            className="delete-tag-button"
            style={{
              position: "fixed",
              top: buttonRef.current.getBoundingClientRect().top - 25,
              left:
                buttonRef.current.getBoundingClientRect().left +
                buttonRef.current.offsetWidth / 2,
              transform: "translateX(-50%)",
              backgroundColor: "#FFFFFF",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              fontSize: "16px",
              cursor: "pointer",
              zIndex: 999999999999,
            }}
          >
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
          </button>,
          document.body
        )}
    </div>
  );
};

const TagAllButtonDelete = ({ item, handleDeleteAllTag }) => {
  const [hovered, setHovered] = useState(false);
  const buttonRef = useRef(null);

  return (
    <div
    className="TagSearchButtonDelete-container"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        ref={buttonRef}
        className="available-groups-button search"
        style={{ position: "relative" }}
      >
        <span>{item}</span>
      </button>

      {hovered &&
        buttonRef.current &&
        createPortal(
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteAllTag(item);
              setHovered(false);
            }}
            className="delete-tag-button"
            style={{
              position: "fixed",
              top: buttonRef.current.getBoundingClientRect().top - 25,
              left:
                buttonRef.current.getBoundingClientRect().left +
                buttonRef.current.offsetWidth / 2,
              transform: "translateX(-50%)",
              backgroundColor: "#FFFFFF",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              fontSize: "16px",
              cursor: "pointer",
              zIndex: 99999999999999,
            }}
          >
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
          </button>,
          document.body
        )}
    </div>
  );
};

const TagButton = ({ item, handleAddTag }) => {
  const [hovered, setHovered] = useState(false);
  const buttonRef = useRef(null);

  return (
    <>
      <button
        ref={buttonRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => handleAddTag(item)}
        className="available-tags-button"
        style={{ position: "relative", minWidth: "30px", minHeight: "30px" }}
      >
        <img loading="lazy" src={item.image_src} alt={item.name} />
      </button>

      {hovered &&
        createPortal(
          <span
            className="tooltip-text-available"
            style={{
              position: "fixed",
              top: buttonRef.current.getBoundingClientRect().top - 40,
              left: buttonRef.current.getBoundingClientRect().left + buttonRef.current.offsetWidth / 2,
              transform: "translateX(-50%)",
              backgroundColor: "#808080",
              color: "#fff",
              padding: "4px 8px",
              borderRadius: "4px",
              whiteSpace: "nowrap",
              zIndex: 9999999,
            }}
          >
            {item.name}
          </span>,
          document.body
        )}
    </>
  );
};

const TagSearchButton = ({ item, handleAddTag }) => {
  const [hovered, setHovered] = useState(false);
  const buttonRef = useRef(null);

  return (
    <>
      <button
        ref={buttonRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => handleAddTag(item)}
        className="available-groups-button"
        style={{ position: "relative", minWidth: "60px", minHeight: "30px" }}
      >
        <span>{item.name}</span>
      </button>
    </>
  );
};

export default function ModalManager({type, isOpen, onClose, onCreated, setToastMessage, setStatusCode, item_name="", item_delta="", item_id=0, item_image="", item_adress="", item_amount = 0, setType = null, component_name="", page_id=0, first_element = false, component_order_id = 0, component_group_id = 0, setHandlerType = null, item_cols = 0,
  item_capacity=null, item_desc="", item_discount=null, item_images=[], item_price=null, item_rating=null, item_tags=[], item_seacrh_tags=[], item_text="", item_ref="", item_icon="", item_search_str="", setLoading=null, loading=false, item_toilet="", item_date="", blog_page_id=0, setPages=null, item_page_id=0, pages=[], item_reviews_id=0, item_space=0, item_robots="", item_order_id=0,
  item_button_info="", item_pdf_ref="", item_ld_json="", item_ref_button_info=""
}) {
  const [name, setName] = useState("");
  const [toilet, setToilet] = useState("");
  const [adress, setAdress] = useState("");
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);
  const [existsGroups, setExistsGroups] = useState([]);
  const [group, setGroup] = useState("");
  const [groupId, setGroupId] = useState("");
  const [delta, setDelta] = useState(false);
  const [componentId, setComponentId] = useState(0);
  const deltaRef = useRef(null);
  const getDeltaRef = useRef(false);
  const [colsAmount, setColsAmount] = useState(3);
  const [desc, setDesc] = useState("");
  const [capacity, setCapacity] = useState(0);
  const [rating, setRating] = useState(0);   
  const [hoveredStar, setHoveredStar] = useState(0);
  const stars = [1, 2, 3, 4, 5];
  const [images, setImages] = useState([]);
  const [tags, setTags] = useState([]);
  const [saveTags, setSaveTags] = useState([]);
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [searchTags, setSearchTags] = useState([]);
  const [saveSearchTags, setSaveSearchTags] = useState([]);
  const [reviewsGroups, setReviewsGroups] = useState([]);
  const [productName, setProductName] = useState("");
  const [prevType, setPrevType] = useState("");
  const simpleBarRef = useRef(null);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [allTags, setAllTags] = useState([]);
  const [pdf, setPdf] = useState("");
  const [existsMenus, setExistsMenus] = useState([]);
  const [existsFurMenus, setExistsFurMenus] = useState([]);
  const [selectedMenus, setSelectedMenus] = useState([]);
 
  const [updateCapacity, setUpdateCapacity] = useState(null);
  const [updateDesc, setUpdateDesc] = useState("");
  const [updateDiscount, setUpdateDiscount] = useState(null);
  const [updateImages, setUpdateImages] = useState([]);
  const [updatePrice, setUpdatePrice] = useState(null);
  const [updateRating, setUpdateRating] = useState(null);
  const [updateTags, setUpdateTags] = useState([]);
  const [updateRef, setUpdateRef] = useState("");
  const [updateIcon, setUpdateIcon] = useState("");
  const [updateSearchTags, setUpdateSearchTags] = useState([]);
  const [updateAdress, setUpdateAdress] = useState("");
  const [deleteImages, setDeleteImages] = useState("");
  const [newUpdateImages, setNewUpdateImages] = useState([]);
  const [newUpdateUpdateImages, setNewUpdateUpdateImages] = useState([]);
  const [newTags, setNewTags] = useState([]);
  const [deleteTags, setDeleteTags] = useState([]);
  const [newSearchTags, setNewSearchTags] = useState([]);
  const [deleteSearchTags, setDeleteSearchTags] = useState([]);
  const [originalImagesUrl, setOriginalImagesUrl] = useState([]);
  const [updateName, setUpdateName] = useState("");
  const [updateOrderId, setUpdateOrderId] = useState(0);
  const [oldOrderId, setOldOrderId] = useState(0);
  const [updateRobots, setUpdateRobots] = useState("");
  const [updateToilet, setUpdateToilet] = useState("");
  const [text, setText] = useState("");
  const [updateText, setUpdateText] = useState("");
  const [updatedImage, setUpdatedImage] = useState("");
  const [ref, setRef] = useState("");
  const [searchStr, setSearchStr] = useState(""); 
  const [searchSimTags, setSearchSimTags] = useState([]);
  const [simTags, setSimTags] = useState([]);
  const [searchUpdateStr, setSearchUpdateStr] = useState("");
  const [date, setDate] = useState(null);
  const [updateDate, setUpdateDate] = useState("");
  const [space, setSpace] = useState(0);
  const [updateSpace, setUpdateSpace] = useState(0);
  const [updateLocalItemBtnInfo, setUpdateLocalItemBtnInfo] = useState("");
  const [localItemBtnInfo, setLocalItemBtnInfo] = useState("");
  const [updatePdf, setUpdatePdf] = useState("");
  const [updateButtonInfoRef, setUpdateButtonInfoRef] = useState("");
  const [updateLdJson, setUpdateLdJson] = useState("");
  const [buttonInfoRef, setButtonInfoRef] = useState("");
  const [lowRange, setLowRange] = useState();
  const [midRange, setMidRange] = useState();
  const [highRange, setHighRange] = useState();
  const [lowDateMorningBefore, setLowDateMorningBefore] = useState();
  const [lowDateMorningAfter, setLowDateMorningAfter] = useState();
  const [lowMinMorningHours, setLowMinMorningHours] = useState();
  const [lowHourMorningPrice, setLowHourMorningPrice] = useState(0);
  const [lowHourMorningPriceMn, setLowHourMorningPriceMn] = useState(0);
  const [lowHourMorningPriceTs, setLowHourMorningPriceTs] = useState(0);
  const [lowHourMorningPriceWs, setLowHourMorningPriceWs] = useState(0);
  const [lowHourMorningPriceTu, setLowHourMorningPriceTu] = useState(0);
  const [lowHourMorningPriceFr, setLowHourMorningPriceFr] = useState(0);
  const [lowHourMorningPriceSt, setLowHourMorningPriceSt] = useState(0);
  const [lowHourMorningPriceSn, setLowHourMorningPriceSn] = useState(0);
  const [lowDateEvenBefore, setLowDateEvenBefore] = useState();
  const [lowDateEvenAfter, setLowDateEvenAfter] = useState();
  const [lowMinEvenHours, setLowMinEvenHours] = useState();
  const [lowHourEvenPrice, setLowHourEvenPrice] = useState(0);
  const [lowHourEvenPriceMn, setLowHourEvenPriceMn] = useState(0);
  const [lowHourEvenPriceTs, setLowHourEvenPriceTs] = useState(0);
  const [lowHourEvenPriceWs, setLowHourEvenPriceWs] = useState(0);
  const [lowHourEvenPriceTu, setLowHourEvenPriceTu] = useState(0);
  const [lowHourEvenPriceFr, setLowHourEvenPriceFr] = useState(0);
  const [lowHourEvenPriceSt, setLowHourEvenPriceSt] = useState(0);
  const [lowHourEvenPriceSn, setLowHourEvenPriceSn] = useState(0);
  const [lowDateNightBefore, setLowDateNightBefore] = useState();
  const [lowDateNightAfter, setLowDateNightAfter] = useState();
  const [lowMinNightHours, setLowMinNightHours] = useState();
  const [lowHourNightPrice, setLowHourNightPrice] = useState(0);
  const [lowHourNightPriceMn, setLowHourNightPriceMn] = useState(0);
  const [lowHourNightPriceTs, setLowHourNightPriceTs] = useState(0);
  const [lowHourNightPriceWs, setLowHourNightPriceWs] = useState(0);
  const [lowHourNightPriceTu, setLowHourNightPriceTu] = useState(0);
  const [lowHourNightPriceFr, setLowHourNightPriceFr] = useState(0);
  const [lowHourNightPriceSt, setLowHourNightPriceSt] = useState(0);
  const [lowHourNightPriceSn, setLowHourNightPriceSn] = useState(0);

  const [midDateMorningBefore, setMidDateMorningBefore] = useState();
  const [midDateMorningAfter, setMidDateMorningAfter] = useState();
  const [midMinMorningHours, setMidMinMorningHours] = useState();
  const [midHourMorningPrice, setMidHourMorningPrice] = useState(0);
  const [midHourMorningPriceMn, setMidHourMorningPriceMn] = useState(0);
  const [midHourMorningPriceTs, setMidHourMorningPriceTs] = useState(0);
  const [midHourMorningPriceWs, setMidHourMorningPriceWs] = useState(0);
  const [midHourMorningPriceTu, setMidHourMorningPriceTu] = useState(0);
  const [midHourMorningPriceFr, setMidHourMorningPriceFr] = useState(0);
  const [midHourMorningPriceSt, setMidHourMorningPriceSt] = useState(0);
  const [midHourMorningPriceSn, setMidHourMorningPriceSn] = useState(0);
  const [midDateEvenBefore, setMidDateEvenBefore] = useState();
  const [midDateEvenAfter, setMidDateEvenAfter] = useState();
  const [midMinEvenHours, setMidMinEvenHours] = useState();
  const [midHourEvenPrice, setMidHourEvenPrice] = useState(0);
  const [midHourEvenPriceMn, setMidHourEvenPriceMn] = useState(0);
  const [midHourEvenPriceTs, setMidHourEvenPriceTs] = useState(0);
  const [midHourEvenPriceWs, setMidHourEvenPriceWs] = useState(0);
  const [midHourEvenPriceTu, setMidHourEvenPriceTu] = useState(0);
  const [midHourEvenPriceFr, setMidHourEvenPriceFr] = useState(0);
  const [midHourEvenPriceSt, setMidHourEvenPriceSt] = useState(0);
  const [midHourEvenPriceSn, setMidHourEvenPriceSn] = useState(0);
  const [midDateNightBefore, setMidDateNightBefore] = useState(0);
  const [midDateNightAfter, setMidDateNightAfter] = useState();
  const [midMinNightHours, setMidMinNightHours] = useState();
  const [midHourNightPrice, setMidHourNightPrice] = useState();
  const [midHourNightPriceMn, setMidHourNightPriceMn] = useState(0);
  const [midHourNightPriceTs, setMidHourNightPriceTs] = useState(0);
  const [midHourNightPriceWs, setMidHourNightPriceWs] = useState(0);
  const [midHourNightPriceTu, setMidHourNightPriceTu] = useState(0);
  const [midHourNightPriceFr, setMidHourNightPriceFr] = useState(0);
  const [midHourNightPriceSt, setMidHourNightPriceSt] = useState(0);
  const [midHourNightPriceSn, setMidHourNightPriceSn] = useState(0);
  const [guidePrice, setGuidePrice] = useState(0);
  const [baloonPrice, setBaloonPrice] = useState(0);
  const [flowerPrice, setFlowerPrice] = useState(0);

  const [highDateMorningBefore, setHighDateMorningBefore] = useState();
  const [highDateMorningAfter, setHighDateMorningAfter] = useState();
  const [highMinMorningHours, setHighMinMorningHours] = useState();
  const [highHourMorningPrice, setHighHourMorningPrice] = useState(0);
  const [highHourMorningPriceMn, setHighHourMorningPriceMn] = useState(0);
  const [highHourMorningPriceTs, setHighHourMorningPriceTs] = useState(0);
  const [highHourMorningPriceWs, setHighHourMorningPriceWs] = useState(0);
  const [highHourMorningPriceTu, setHighHourMorningPriceTu] = useState(0);
  const [highHourMorningPriceFr, setHighHourMorningPriceFr] = useState(0);
  const [highHourMorningPriceSt, setHighHourMorningPriceSt] = useState(0);
  const [highHourMorningPriceSn, setHighHourMorningPriceSn] = useState(0);
  const [highDateEvenBefore, setHighDateEvenBefore] = useState();
  const [highDateEvenAfter, setHighDateEvenAfter] = useState();
  const [highMinEvenHours, setHighMinEvenHours] = useState();
  const [highHourEvenPrice, setHighHourEvenPrice] = useState(0);
  const [highHourEvenPriceMn, setHighHourEvenPriceMn] = useState(0);
  const [highHourEvenPriceTs, setHighHourEvenPriceTs] = useState(0);
  const [highHourEvenPriceWs, setHighHourEvenPriceWs] = useState(0);
  const [highHourEvenPriceTu, setHighHourEvenPriceTu] = useState(0);
  const [highHourEvenPriceFr, setHighHourEvenPriceFr] = useState(0);
  const [highHourEvenPriceSt, setHighHourEvenPriceSt] = useState(0);
  const [highHourEvenPriceSn, setHighHourEvenPriceSn] = useState(0);
  const [highDateNightBefore, setHighDateNightBefore] = useState();
  const [highDateNightAfter, setHighDateNightAfter] = useState();
  const [highMinNightHours, setHighMinNightHours] = useState();
  const [highHourNightPrice, setHighHourNightPrice] = useState(0);
  const [highHourNightPriceMn, setHighHourNightPriceMn] = useState(0);
  const [highHourNightPriceTs, setHighHourNightPriceTs] = useState(0);
  const [highHourNightPriceWs, setHighHourNightPriceWs] = useState(0);
  const [highHourNightPriceTu, setHighHourNightPriceTu] = useState(0);
  const [highHourNightPriceFr, setHighHourNightPriceFr] = useState(0);
  const [highHourNightPriceSt, setHighHourNightPriceSt] = useState(0);
  const [highHourNightPriceSn, setHighHourNightPriceSn] = useState(0);
  const [modalMenuOption, setModalMenuOption] = useState("");
  const [modalMenuPrice, setModalMenuPrice] = useState(0);
  const [createdOptions, setCreatedOptions] = useState([]);
  const [minMenuPrice, setMinMenuPrice] = useState(0);
  const [selectedFurMenus, setSelectedFurMenus] = useState([]);
  const [djPrice, setDjPrice] = useState(0);
  const [weddingPrice, setWeddingPrice] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedFurIds, setSelectedFurIds] = useState([]);
  const [menuName, setMenuName] = useState("");

  const [cleaningPrice, setCleaningPrice] = useState(0);

  const [visibleAuth, setVisibleAuth] = useState(false);
 
  const handleFileChangeArr = (e) => {
  const files = Array.from(e.target.files);

  const newItems = files.map(file => ({
    id: crypto.randomUUID(),
    file: file,
    url: URL.createObjectURL(file)
  }));

  setImages(prev => [...prev, ...newItems]);
  };

    const handleUpdateFileChangeArr = (e) => {
  const files = Array.from(e.target.files);

  const newItems = files.map(file => ({
    id: crypto.randomUUID(),
    file: file,
    src: URL.createObjectURL(file)
  }));

  setUpdateImages(prev => [...prev, ...newItems]);
  setNewUpdateImages(prev => [...prev, ...newItems]);
  };

  const handleTurnBackProduct = (id) => {
    setType(prevType);
  }

  const handleDeleteImage = (id) => {
    setImages(prev => prev.filter(item => item.id !== id));
  };

    const handleDeleteUpdateImage = (id) => {
    setUpdateImages(prev => prev.filter(item => item.id !== id));
    setDeleteImages(prev => [...prev, id]);
    setOriginalImagesUrl(prev => prev.filter(item => item.id !== id));
  };

  const handleDeleteTag = async (id) => {
  setSaveTags((prev) => prev.filter(tag => tag.id !== id));
  };

  const handleChangeLowDateMorningBefore = (e) => {
    setLowDateMorningBefore(e.target.value);
  };

  const handleChangeLowDateMorningAfter = (e) => {
    setLowDateMorningAfter(e.target.value);
  };

  const handleChangeMinMenuPrice = (e) => {
    setMinMenuPrice(e.target.value);
  };

  const handleChangeLowMinMorningHours = (e) => {
    setLowMinMorningHours(e.target.value);
  };

  const handleChangeLowHourMorningPrice = (e) => {
    setLowHourMorningPrice(e.target.value);
  };

  const handleChangeLowHourMorningPriceMn = (e) => {
    setLowHourMorningPriceMn(e.target.value);
  };

  const handleChangeLowHourMorningPriceTs = (e) => {
    setLowHourMorningPriceTs(e.target.value);
  };

  const handleChangeLowHourMorningPriceWs = (e) => {
    setLowHourMorningPriceWs(e.target.value);
  };

  const handleChangeLowHourMorningPriceTu = (e) => {
    setLowHourMorningPriceTu(e.target.value);
  };

  const handleChangeLowHourMorningPriceFr = (e) => {
    setLowHourMorningPriceFr(e.target.value);
  };

  const handleChangeLowHourMorningPriceSt = (e) => {
    setLowHourMorningPriceSt(e.target.value);
  };

  const handleChangeLowHourMorningPriceSn = (e) => {
    setLowHourMorningPriceSn(e.target.value);
  };

  const handleChangeLowDateEvenBefore = (e) => {
    setLowDateEvenBefore(e.target.value);
  };

  const handleChangeLowDateEvenAfter = (e) => {
    setLowDateEvenAfter(e.target.value);
  };

  const handleChangeLowMinEvenHours = (e) => {
    setLowMinEvenHours(e.target.value);
  };

  const handleChangeLowHourEvenPrice = (e) => {
    setLowHourEvenPrice(e.target.value);
  };

  const handleChangeLowHourEvenPriceMn = (e) => {
    setLowHourEvenPriceMn(e.target.value);
  };

  const handleChangeLowHourEvenPriceTs = (e) => {
    setLowHourEvenPriceTs(e.target.value);
  };

  const handleChangeLowHourEvenPriceWs = (e) => {
    setLowHourEvenPriceWs(e.target.value);
  };

  const handleChangeLowHourEvenPriceTu = (e) => {
    setLowHourEvenPriceTu(e.target.value);
  };

  const handleChangeLowHourEvenPriceFr = (e) => {
    setLowHourEvenPriceFr(e.target.value);
  };

  const handleChangeLowHourEvenPriceSt = (e) => {
    setLowHourEvenPriceSt(e.target.value);
  };

  const handleChangeLowHourEvenPriceSn = (e) => {
    setLowHourEvenPriceSn(e.target.value);
  };

  const handleChangeLowDateNightBefore = (e) => {
    setLowDateNightBefore(e.target.value);
  };

  const handleChangeLowDateNightAfter = (e) => {
    setLowDateNightAfter(e.target.value);
  };

  const handleChangeFlowerPrice = (e) => {
    setFlowerPrice(e.target.value);
  };

  const handleChangeGuidePrice = (e) => {
    setGuidePrice(e.target.value);
  };

  const handleChangeBaloonPrice = (e) => {
    setBaloonPrice(e.target.value);
  };

  const handleChangeDjPrice = (e) => {
    setDjPrice(e.target.value);
  };

  const handleChangeWeddingPrice = (e) => {
    setWeddingPrice(e.target.value);
  };

  const handleChangeLowMinNightHours = (e) => {
    setLowMinNightHours(e.target.value);
  };

  const handleChangeLowHourNightPrice = (e) => {
    setLowHourNightPrice(e.target.value);
  };

  const handleChangeLowHourNightPriceMn = (e) => {
    setLowHourNightPriceMn(e.target.value);
  };

  const handleChangeLowHourNightPriceTs = (e) => {
    setLowHourNightPriceTs(e.target.value);
  };

  const handleChangeLowHourNightPriceWs = (e) => {
    setLowHourNightPriceWs(e.target.value);
  };

  const handleChangeLowHourNightPriceTu = (e) => {
    setLowHourNightPriceTu(e.target.value);
  };

  const handleChangeLowHourNightPriceFr = (e) => {
    setLowHourNightPriceFr(e.target.value);
  };

  const handleChangeLowHourNightPriceSn = (e) => {
    setLowHourNightPriceSn(e.target.value);
  };

  const handleChangeLowHourNightPriceSt = (e) => {
    setLowHourNightPriceSt(e.target.value);
  };

  const handleChangeMidDateMorningBefore = (e) => {
    setMidDateMorningBefore(e.target.value);
  };

  const handleChangeMidDateMorningAfter = (e) => {
    setMidDateMorningAfter(e.target.value);
  };

  const handleChangeMidMinMorningHours = (e) => {
    setMidMinMorningHours(e.target.value);
  };

  const handleChangeMidHourMorningPrice = (e) => {
    setMidHourMorningPrice(e.target.value);
  };

  const handleChangeMidHourMorningPriceMn = (e) => {
    setMidHourMorningPriceMn(e.target.value);
  };

  const handleChangeMidHourMorningPriceTs = (e) => {
    setMidHourMorningPriceTs(e.target.value);
  };

  const handleChangeMidHourMorningPriceWs = (e) => {
    setMidHourMorningPriceWs(e.target.value);
  };

  const handleChangeMidHourMorningPriceTu = (e) => {
    setMidHourMorningPriceTu(e.target.value);
  };

  const handleChangeMidHourMorningPriceFr = (e) => {
    setMidHourMorningPriceFr(e.target.value);
  };
  
  const handleChangeMidHourMorningPriceSt = (e) => {
    setMidHourMorningPriceSt(e.target.value);
  };

  const handleChangeMidHourMorningPriceSn = (e) => {
    setMidHourMorningPriceSn(e.target.value);
  };

  const handleChangeMidDateEvenBefore = (e) => {
    setMidDateEvenBefore(e.target.value);
  };

  const handleChangeMidDateEvenAfter = (e) => {
    setMidDateEvenAfter(e.target.value);
  };

  const handleChangeMidMinEvenHours = (e) => {
    setMidMinEvenHours(e.target.value);
  };

  const handleChangeMidHourEvenPrice = (e) => {
    setMidHourEvenPrice(e.target.value);
  };

  const handleChangeMidHourEvenPriceMn = (e) => {
    setMidHourEvenPriceMn(e.target.value);
  };

  const handleChangeMidHourEvenPriceTs = (e) => {
    setMidHourEvenPriceTs(e.target.value);
  };

  const handleChangeMidHourEvenPriceTu = (e) => {
    setMidHourEvenPriceTu(e.target.value);
  };

  const handleChangeMidHourEvenPriceWs = (e) => {
    setMidHourEvenPriceWs(e.target.value);
  };
  
  const handleChangeMidHourEvenPriceFr = (e) => {
    setMidHourEvenPriceFr(e.target.value);
  };

  const handleChangeMidHourEvenPriceSt = (e) => {
    setMidHourEvenPriceSt(e.target.value);
  };

  const handleChangeMidHourEvenPriceSn = (e) => {
    setMidHourEvenPriceSn(e.target.value);
  };

  const handleChangeMidDateNightBefore = (e) => {
    setMidDateNightBefore(e.target.value);
  };

  const handleChangeMidDateNightAfter = (e) => {
    setMidDateNightAfter(e.target.value);
  };

  const handleChangeMidMinNightHours = (e) => {
    setMidMinNightHours(e.target.value);
  };

  const handleChangeMidHourNightPrice = (e) => {
    setMidHourNightPrice(e.target.value);
  };

  const handleChangeMidHourNightPriceMn = (e) => {
    setMidHourNightPriceMn(e.target.value);
  };

  const handleChangeMidHourNightPriceTs = (e) => {
    setMidHourNightPriceTs(e.target.value);
  };

  const handleChangeMidHourNightPriceWs = (e) => {
    setMidHourNightPriceWs(e.target.value);
  };

  const handleChangeMidHourNightPriceTu = (e) => {
    setMidHourNightPriceTu(e.target.value);
  };

  const handleChangeMidHourNightPriceFr = (e) => {
    setMidHourNightPriceFr(e.target.value);
  };

  const handleChangeMidHourNightPriceSt = (e) => {
    setMidHourNightPriceSt(e.target.value);
  };

  const handleChangeMidHourNightPriceSn = (e) => {
    setMidHourNightPriceSn(e.target.value);
  };

  const handleChangeHighDateMorningBefore = (e) => {
    setHighDateMorningBefore(e.target.value);
  };

  const handleChangeHighDateMorningAfter = (e) => {
    setHighDateMorningAfter(e.target.value);
  };

  const handleChangeHighMinMorningHours = (e) => {
    setHighMinMorningHours(e.target.value);
  };

  const handleChangeHighHourMorningPrice = (e) => {
    setHighHourMorningPrice(e.target.value);
  };

  const handleChangeHighHourMorningPriceMn = (e) => {
    setHighHourMorningPriceMn(e.target.value);
  };

  const handleChangeHighHourMorningPriceTs = (e) => {
    setHighHourMorningPriceTs(e.target.value);
  };

  const handleChangeHighHourMorningPriceWs = (e) => {
    setHighHourMorningPriceWs(e.target.value);
  };

  const handleChangeHighHourMorningPriceTu = (e) => {
    setHighHourMorningPriceTu(e.target.value);
  };

  const handleChangeHighHourMorningPriceFr = (e) => {
    setHighHourMorningPriceFr(e.target.value);
  };

  const handleChangeHighHourMorningPriceSt = (e) => {
    setHighHourMorningPriceSt(e.target.value);
  };

  const handleChangeHighHourMorningPriceSn = (e) => {
    setHighHourMorningPriceSn(e.target.value);
  };

  const handleChangeHighDateEvenBefore = (e) => {
    setHighDateEvenBefore(e.target.value);
  };

  const handleChangeHighDateEvenAfter = (e) => {
    setHighDateEvenAfter(e.target.value);
  };

  const handleChangeHighMinEvenHours = (e) => {
    setHighMinEvenHours(e.target.value);
  };

  const handleChangeHighHourEvenPrice = (e) => {
    setHighHourEvenPrice(e.target.value);
  };

  const handleChangeHighHourEvenPriceMn = (e) => {
    setHighHourEvenPriceMn(e.target.value);
  };

  const handleChangeHighHourEvenPriceTs = (e) => {
    setHighHourEvenPriceTs(e.target.value);
  };

  const handleChangeHighHourEvenPriceWs = (e) => {
    setHighHourEvenPriceWs(e.target.value);
  };

  const handleChangeHighHourEvenPriceTu = (e) => {
    setHighHourEvenPriceTu(e.target.value);
  };

  const handleChangeHighHourEvenPriceFr = (e) => {
    setHighHourEvenPriceFr(e.target.value);
  };

  const handleChangeHighHourEvenPriceSt = (e) => {
    setHighHourEvenPriceSt(e.target.value);
  };

  const handleChangeHighHourEvenPriceSn = (e) => {
    setHighHourEvenPriceSn(e.target.value);
  };

  const handleChangeHighDateNightBefore = (e) => {
    setHighDateNightBefore(e.target.value);
  };

  const handleChangeHighDateNightAfter = (e) => {
    setHighDateNightAfter(e.target.value);
  };

  const handleChangeHighMinNightHours = (e) => {
    setHighMinNightHours(e.target.value);
  };

  const handleChangeHighHourNightPrice = (e) => {
    setHighHourNightPrice(e.target.value);
  };

  const handleChangeHighHourNightPriceMn = (e) => {
    setHighHourNightPriceMn(e.target.value);
  };

  const handleChangeHighHourNightPriceTs = (e) => {
    setHighHourNightPriceTs(e.target.value);
  };

  const handleChangeHighHourNightPriceWs = (e) => {
    setHighHourNightPriceWs(e.target.value);
  };

  const handleChangeHighHourNightPriceTu = (e) => {
    setHighHourNightPriceTu(e.target.value);
  };

  const handleChangeHighHourNightPriceFr = (e) => {
    setHighHourNightPriceFr(e.target.value);
  };

  const handleChangeHighHourNightPriceSt = (e) => {
    setHighHourNightPriceSt(e.target.value);
  };

  const handleChangeHighHourNightPriceSn = (e) => {
    setHighHourNightPriceSn(e.target.value);
  };

  const handleChangeCleaningPrice = (e) => {
    setCleaningPrice(e.target.value);
  };

    const handleDeleteUpdateTag = async (id) => {
  setUpdateTags((prev) => prev.filter(tag => tag.id !== id));
  setDeleteTags(prev => [...prev, id]);
  };

  const handleDeleteSearchTag = async (id) => {
  setSaveSearchTags((prev) => prev.filter(tag => tag.id !== id));
  };

  const handleUpdateImage = (e, id) => {
    if (!e?.target?.files?.length) return;

    const file = e.target.files[0];
    if (!file) return;

    const updatedItem = {
    id,
    file,
    src: URL.createObjectURL(file)
    };

    setImages(prev => prev.map(item => item.id === id ? updatedItem : item));
  };

  const handleUpdateUpdateImage = (e, id, order_id) => {
    if (!e?.target?.files?.length) return;

  const file = e.target.files[0];
  if (!file) return;

  const updatedItem = {
    id,
    file,
    order_id,
    src: URL.createObjectURL(file)
  };

  setUpdateImages(prev =>
    prev.map(item =>
      item.id === id ? updatedItem : item
    )
  );

  setNewUpdateUpdateImages(prev => [...prev, updatedItem]);
};

  const handleUpdateDeleteSearchTag = async (id) => {
  setUpdateSearchTags((prev) => prev.filter(tag => tag.id !== id));
  setDeleteSearchTags((prev) => [...prev, id]);
  };

  const handleDeleteAllTag = async (name) => {
    setAllTags(prev => prev.filter(tag => tag !== name));
  };

  const addToName = async (item) => {
  setAllTags(prev =>
    prev.includes(item) ? prev : [...prev, item]
    );
  };

  const handleGetTags = async () => {
    try {
    const res3 = await fetch(`${BASE_URL}/get-all-tags`);

    if (res3.status === 200) {
      setStatusCode(res3.status);
      const data2 = await res3.json();
      setTags(data2.content);
    }
   } catch (err) {
   }

   try {
    const res4 = await fetch(`${BASE_URL}/get-all-search-tags`);

    if (res4.status === 200) {
      setStatusCode(res4.status);
      const data4 = await res4.json();
      setSearchTags(data4.content);
    }
   } catch (err) {
   }
  };

  const handleGetTagsNames = async () => {
    try {
    const res3 = await fetch(`${BASE_URL}/get-all-tags-names`);

    if (res3.status === 200) {
      setStatusCode(res3.status);
      const data2 = await res3.json();
      setSimTags(data2.content);
    }
   } catch (err) {
   }

   try {
    const res4 = await fetch(`${BASE_URL}/get-all-search-tags-names`);

    if (res4.status === 200) {
      setStatusCode(res4.status);
      const data4 = await res4.json();
      setSearchSimTags(data4.content);
    }
   } catch (err) {
   }
  };
 
  useEffect(() => {
  if (isOpen) {
    handleChangeUpdateAdress({target: {value: item_adress}});
    handleChangeUpdateName({ target: {value: item_name}});
    handleChangeUpdateRobots({ target: {value: item_robots}});
    handleChangeCols({target: {value: item_cols}});
    handleChangeUpdateCapacity({target: {value: item_capacity}});
    handleChangeUpdateDesc({target: {value: item_desc}});
    handleChangeUpdateDiscount({target: {value: item_discount}});
    handleChangeUpdatePrice({target: {value: item_price}});
    handleChangeUpdateText({target: {value: item_text}});
    handleChangeUpdateRef({target: {value: item_ref}});
    handleChangeUpdateIcon({target: {value: item_icon}});
    handleChangeUpdateSearchStr({target: {value: item_search_str}});
    handleChangeUpdateToilet({target: {value: item_toilet}});
    handleChangeUpdateDate({target: {value: item_date}});
    handleChangeUpdateSpace({target: {value: item_space}});
    handleChangeUpdateBtnInfo({target: {value: item_button_info}});
    handleChangeUpdatePdf({target: {value: item_pdf_ref}});
    handleChangeUpdateButtonInfoRef({target: {value: item_ref_button_info}});
    handleChangeUpdateLdJson({target: {value: item_ld_json}});
    setUpdateImages(item_images);
    setOriginalImagesUrl(item_images);
    setUpdateTags(item_tags);
    setUpdateSearchTags(item_seacrh_tags);
    setUpdateRating(item_rating);
    setUpdatedImage(item_image);
    setUpdateOrderId(item_order_id);
    setOldOrderId(item_order_id);
    setDate("");
    setName("");
    setImages([]);
    setSearchStr("");
    setToilet("");
    setSaveTags([]);
    setRating(0);
    setAdress("");
    setPrice(null);
    setDiscount(null);
    setSaveSearchTags([]);
    setDesc("");
    setCapacity(null);
    setProductName("");
    setNewTags([]);
    setDeleteTags([]);
    setNewSearchTags([]);
    setDeleteSearchTags([]);
    setImagesLoaded(0);
    setText("");
    setFile(null);
    setExistsGroups([]);
    setRef("");
    setButtonInfoRef("");
    setLocalItemBtnInfo("");
    setAllTags([]);
    setNewUpdateUpdateImages([]);
    setNewUpdateImages([]);
  }
  if(type === "productsGrid" || type === "createProductItem" || type === "updateProductItem")
  {
    handleGetTags();
  }
  else if(type === "simmilarProducts" || type === "updateSimmilar")
  {
    handleGetTagsNames();
  }
  }, [isOpen, item_name]);

  const handleImageLoad = () => {
  setImagesLoaded(prev => prev + 1);
};

useEffect(() => {
  if (imagesLoaded === updateImages.length && simpleBarRef.current) {
    simpleBarRef.current.recalculate();
  }
}, [imagesLoaded, updateImages]);

  const handleChangeUpdateCapacity = (e) => {
  setUpdateCapacity(e.target.value);
};

const handleChangeUpdateDesc = (e) => {
  setUpdateDesc(e.target.value);
};

const handleChangeUpdateToilet = (e) => {
  setUpdateToilet(e.target.value);
}

const handleChangeUpdateRef = (e) => {
  setUpdateRef(e.target.value);
}

const handleChangeUpdateIcon = (e) => {
  setUpdateIcon(e.target.value);
}

const handleChangeText = (e) => {
  setText(e.target.value);
};

const handleChangeUpdateDiscount = (e) => {
  setUpdateDiscount(e.target.value);
};

const handleChangeUpdatePrice = (e) => {
  setUpdatePrice(e.target.value);
};

const handleChangeUpdateText = (e) => {
  setUpdateText(e.target.value);
}

const handleChangeUpdateLdJson= (e) => {
  setUpdateLdJson(e.target.value);
}

const handleChangeUpdatePdf = (e) => {
    setUpdatePdf(e.target.value);
  }

const handleChangeUpdateButtonInfoRef = (e) => {
    setUpdateButtonInfoRef(e.target.value);
  }

const handleChangeButtonInfoRef = (e) => {
    setButtonInfoRef(e.target.value);
  }

    const handleChangeName = (e) => {
    setName(e.target.value);
   };

   const handleChangeMenuName = (e) => {
    setMenuName(e.target.value);
   };

   const handleChangeModalMenuOption = (e) => {
    setModalMenuOption(e.target.value);
   };

   const handleChangeModalMenuPrice = (e) => {
    setModalMenuPrice(e.target.value);
   };

   const handleChangeSearchStr = (e) => {
    setSearchStr(e.target.value);
   }

   const handleChangeUpdateSearchStr = (e) => {
    setSearchUpdateStr(e.target.value);
   }

   const handleChangeRef = (e) => {
    setRef(e.target.value);
   };
   
  const handleChangeUpdateOrderId = (e) => {
    setUpdateOrderId(e.target.value);
  };

    const handleChangeUpdateName = (e) => {
    setUpdateName(e.target.value);
  };

  const handleChangeUpdateRobots = (e) => {
    setUpdateRobots(e.target.value);
  };

  const handleChangeUpdateDate = (e) => {
    setUpdateDate(e.target.value);
  }

  const handleChangeUpdateBtnInfo = (e) => {
    setUpdateLocalItemBtnInfo(e.target.value);
  }

  const handleChangeBtnInfo = (e) => {
    setLocalItemBtnInfo(e.target.value);
  }

  const handleChangeUpdateSpace = (e) => {
    setUpdateSpace(e.target.value);
  }

   const handleChangeProductName = (e) => {
    setProductName(e.target.value);
   }

   const handleChangePrice = (e) => {
    setPrice(e.target.value);
   };

   const handleChangeDiscount = (e) => {
    setDiscount(e.target.value);
   };

   const handleChangeCols = (e) => {
    setColsAmount(e.target.value);
   };

   const handleChangeDesc = (e) => {
    setDesc(e.target.value);
   };
   
   const handleChangeToilet = (e) => {
    setToilet(e.target.value);
   }

   const handleChangeCapacity = (e) => {
    setCapacity(e.target.value);
   };

   const handleChangeAdress = (e) => {
    setAdress(e.target.value);
   };

   const handleChangeSpacing = (e) => {
    setSpace(e.target.value);
   };

   const handleChangeUpdateAdress = (e) => {
    setUpdateAdress(e.target.value);
   };

   const handleCreateAdGroup = async () => {
    if(name != ""){
      setGroup(name);
    setLoading(true);
    try {
    const res = await fetch(`${BASE_URL}/create-ad-group`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        name: name,
      })
    });

    if (res.status === 200) {
      const data = await res.json();
      setGroupId(data.content.id);

       try {
    const res2 = await fetch(`${BASE_URL}/create-page-component`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        name: component_name,
        group_id: page_id,
        group_name: name,
        order_id: component_order_id
      })
    });

    if (res2.status === 200) {
      const data2 = await res2.json();
      setComponentId(data2.content.id);
      setStatusCode(res2.status);
      setToastMessage("Элемент успешно создан!");
      setType("createAdvertisementItem");
      const item = {
        id: data2.content.id,
        name: component_name,
        component_content: [],
        order_id: component_order_id,
        group_id: data.content.id
      }
      onCreated(item);
      setHandlerType("addItemToComponentContent");
    } else if (res2.status === 404) {
      setStatusCode(res2.status);
      setToastMessage("Элемент не найден, таблица пуста!");
    } else if (res2.status === 500) {
      setStatusCode(res2.status);
      setToastMessage("Пользователь с таким ключом уже существует!");
    } else if (res2.status === 401) {
      setStatusCode(res2.status);
      setToastMessage("Неавторизованный пользователь!");
      setVisibleAuth(true);
    } else {
      setStatusCode(res2.status);
      setToastMessage("Произошла непредвиденная ошибка!");
    }
  } catch (err) {
  }
    } else if (res.status === 404) {
      setStatusCode(res.status);
      setToastMessage("Элемент не найден, таблица пуста!");
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
  } catch (err) {
  }
  finally{
    setLoading(false);
  }
    }
    else{
      setStatusCode(404);
      setToastMessage("Задайтие имя группы!");
    }
}

const handleCreateCateringGroup = async () => {
    if(name != ""){
      setGroup(name);
    setLoading(true);
    try {
    const res = await fetch(`${BASE_URL}/create-catering-group`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        name: name,
      })
    });

    if (res.status === 200) {
      const data = await res.json();
      setGroupId(data.content.id);

       try {
    const res2 = await fetch(`${BASE_URL}/create-page-component`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        name: component_name,
        group_id: page_id,
        group_name: name,
        order_id: component_order_id
      })
    });

    if (res2.status === 200) {
      const data2 = await res2.json();
      setComponentId(data2.content.id);
      setStatusCode(res2.status);
      setToastMessage("Элемент успешно создан!");
      setType("createCateringItem");
      const item = {
        id: data2.content.id,
        name: component_name,
        component_content: [],
        order_id: component_order_id,
        group_id: data.content.id
      }
      onCreated(item);
      setHandlerType("addItemToComponentContentCatering");
    } else if (res2.status === 404) {
      setStatusCode(res2.status);
      setToastMessage("Элемент не найден, таблица пуста!");
    } else if (res2.status === 500) {
      setStatusCode(res2.status);
      setToastMessage("Пользователь с таким ключом уже существует!");
    } else if (res2.status === 401) {
      setStatusCode(res2.status);
      setToastMessage("Неавторизованный пользователь!");
      setVisibleAuth(true);
    } else {
      setStatusCode(res2.status);
      setToastMessage("Произошла непредвиденная ошибка!");
    }
  } catch (err) {
  }
    } else if (res.status === 404) {
      setStatusCode(res.status);
      setToastMessage("Элемент не найден, таблица пуста!");
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
  } catch (err) {
  }
  finally{
    setLoading(false);
  }
    }
    else{
      setStatusCode(404);
      setToastMessage("Задайтие имя группы!");
    }
}

   const handleCreatePopular = async () => {
    if(name === "")
    {
      setStatusCode(422);
      setToastMessage("Задайте имя кнопки!");
      return;
    }

    if(adress === "")
    {
      setStatusCode(422);
      setToastMessage("Задайте адрес страницы!");
      return;
    }
    setLoading(true);
    try {
          const res = await fetch(`${BASE_URL}/post-header-popular`,{
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
            order_id: 1,
            name: name,
            api_adress: adress
            })
          });
    
          if (res.status === 200) {
            const data = await res.json();
            const id = data.content.id;
            const item = {id: id, order_id: 1, name: name, api_adress: adress}
            onCreated(item);
            setStatusCode(res.status);
            setToastMessage("Элемент успешно создан!");
          } else if (res.status === 404) {
            setStatusCode(res.status);
            setToastMessage("Элемент не найден, таблица пуста!");
          } else if (res.status === 500) {
            setStatusCode(res.status);
            setToastMessage("Элемент с таким ключом уже существует!");
          } else if (res.status === 401) {
            setStatusCode(res.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          } else {
            setStatusCode(res.status);
            setToastMessage("Произошла непредвиденная ошибка!");
          }
    
        } catch (err) {
        }
        finally{
          setLoading(false);
        }
   };

    const handleCreateCategory = async () => {
    if(name === "")
    {
      setStatusCode(422);
      setToastMessage("Задайте имя кнопки!");
      return;
    }
    setLoading(true);
    try {
          const res = await fetch(`${BASE_URL}/post-header-category`,{
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
            name: name
            })
          });
    
          if (res.status === 200) {
            const data = await res.json();
            const id = data.content.id;
            const item = {id: id, order_id: 1, name: name, api_adress: ""}
            onCreated(item);
            setStatusCode(res.status);
            setToastMessage("Элемент успешно создан!");
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
    
        } catch (err) {
        }
        finally{
          setLoading(false);
        }
   };

    const handleCreateAbout = async () => {
    if(name === "")
    {
      setStatusCode(422);
      setToastMessage("Задайте имя кнопки!");
      return;
    }

    if(adress === "")
    {
      setStatusCode(422);
      setToastMessage("Задайте адрес страницы!");
      return;
    }
    setLoading(true);
    try {
          const res = await fetch(`${BASE_URL}/post-header-about`,{
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
            order_id: 1,
            name: name,
            api_adress: adress
            })
          });
    
          if (res.status === 200) {
            const data = await res.json();
            const id = data.content.id;
            const item = {id: id, order_id: 1, name: name, api_adress: adress}
            onCreated(item);
            setStatusCode(res.status);
            setToastMessage("Элемент успешно создан!");
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
     
        } catch (err) {
        }
        finally{
          setLoading(false);
        }
   };

   const handleUpdateOrderId = async () => {
    if(updateOrderId <= 0)
    {
      setStatusCode(422);
      setToastMessage("Задайте порядковый номер!");
      return;
    }

    setLoading(true);
    try {
          const res = await fetch(`${BASE_URL}/update-product-order-id`,{
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
            id: item_id,
            order_id: updateOrderId,
            old_order_id: oldOrderId
            })
          });
    
          if (res.status === 200) {
            setStatusCode(res.status);
            setToastMessage("Порядок обновлен! Перезагрузите страницу!");
          } else if (res.status === 404) {
            setStatusCode(res.status);
            setToastMessage("!");
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
     
        } catch (err) {
        }
        finally{
          const api_adress = window.location.pathname;
          console.log(api_adress);
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
          setLoading(false);
        }
   };

   const handleCreateMeta = async () => {
    setLoading(true);
    try {
          const res = await fetch(`${BASE_URL}/update-meta-page`,{
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
            id: item_id,
            title: updateName,
            description: updateDesc,
            robots: updateRobots,
            script: updateLdJson
            })
          });
    
          if (res.status === 200) {
            setStatusCode(res.status);
            setToastMessage("Мета теги обновлены! Перезагрузите страницу!");
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
     
        } catch (err) {
        }
        finally{
          const api_adress = window.location.pathname;
          console.log(api_adress);
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
          setLoading(false);
        }
   };

   const handleCreateSpace = async () => {
    setLoading(true);
    try {
          const res = await fetch(`${BASE_URL}/create-space`,{
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
            space: space
            })
          });
    
          if (res.status === 200) {
            const data = await res.json();
            try {
          const res2 = await fetch(`${BASE_URL}/create-page-component-space`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              credentials: "include",
              body: JSON.stringify({
                name: component_name,
                group_id: page_id,
                group_name: "",
                space_id: data.content.id,
                order_id: component_order_id
              })
            })

            if (res2.status === 200) {
              const data2 = await res2.json();
              const comp_content = {
                id: data.content.id,
                space: space
              }

              const item ={
                "id": data2.content.id,
                "name": component_name,
                "component_content":  comp_content,
                "order_id": component_order_id,
                "group_id": 0
              }
                  onCreated(item);
                  setStatusCode(res2.status);
                  setToastMessage("Элемент успешно создан!");
              } else if (res2.status === 404) {
                  setStatusCode(res2.status);
                  setToastMessage("База пустая");
              } else if (res2.status === 500) {
                  setStatusCode(res2.status);
                  setToastMessage("Элемент с таким ключом уже сущетсвует!");
              } else if (res2.status === 401) {
                  setStatusCode(res2.status);
                  setToastMessage("Неавторизованный пользователь!");
                  setVisibleAuth(true);
              }
            }
            catch (err){
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
          } else {
            setStatusCode(res.status);
            setToastMessage("Произошла непредвиденная ошибка!");
          }
     
        } catch (err) {
        }
        finally{
          setLoading(false);
        }
   }

   const handleFooterUpdateItem = async () => {
    if(updateName === "")
    {
      setStatusCode(422);
      setToastMessage("Задайте имя кнопки!");
      return;
    }

    if(updateAdress === "")
    {
      setStatusCode(422);
      setToastMessage("Задайте адрес страницы!");
      return;
    }
    setLoading(true);
    try {
          const res = await fetch(`${BASE_URL}/update-footer`,{
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
            id: item_id,
            order_id: 1,
            name: updateName,
            api_adress: updateAdress
            })
          });
    
          if (res.status === 200) {
            const data = await res.json();
            const item = {order_id: 1, name: updateName, api_adress: updateAdress};
            const id = item_id;
            onCreated(id, item);
            setStatusCode(res.status);
            setToastMessage("Элемент успешно обновлен!");
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
     
        } catch (err) {
        }
        finally{
          setLoading(false);
        }
   };

   const handleFooterCreateItem = async () => {
    if(name === "")
    {
      setStatusCode(422);
      setToastMessage("Задайте имя кнопки!");
      return;
    }

    if(adress === "")
    {
      setStatusCode(422);
      setToastMessage("Задайте адрес страницы!");
      return;
    }
    setLoading(true);
    try {
          const res = await fetch(`${BASE_URL}/post-footer`,{
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
            order_id: 1,
            name: name,
            api_adress: adress
            })
          });
    
          if (res.status === 200) {
            const data = await res.json();
            const id = data.content.id;
            const item = {id: id, order_id: 1, name: name, api_adress: adress};
            onCreated(item);
            setStatusCode(res.status);
            setToastMessage("Элемент успешно создан!");
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
     
        } catch (err) {
        }
        finally{
          setLoading(false);
        }
   };

    const handleCreatePages = async () => {
    if(name === "")
    {
      setStatusCode(422);
      setToastMessage("Задайте имя кнопки!");
      return;
    }

    if(adress === "")
    {
      setStatusCode(422);
      setToastMessage("Задайте адрес страницы!");
      return;
    }
    setLoading(true);
    try {
          const res = await fetch(`${BASE_URL}/post-header-pages`,{
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
            order_id: 1,
            name: name,
            api_adress: adress
            })
          });
    
          if (res.status === 200) {
            const data = await res.json();
            const id = data.content.id;
            const item = {id: id, order_id: 1, name: name, api_adress: adress};
            onCreated(item);
            setStatusCode(res.status);
            setToastMessage("Элемент успешно создан!");
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
     
        } catch (err) {
        }
        finally{
          setLoading(false);
        }
   };

   const handleChangeCategory = async () => {
    if(updateName === "")
    {
      setStatusCode(422);
      setToastMessage("Задайте имя кнопке!");
      return;
    }

    if(updateAdress === "")
    {
      setStatusCode(422);
      setToastMessage("Задайте адрес страницы!");
      return;
    }
    setLoading(true);
    try{
      const res = await fetch(`${BASE_URL}/update-header-category`,{
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
            id: item_id,
            order_id: 1,
            name: updateName,
            api_adress: updateAdress
            })
          });
    
          if (res.status === 200) {
            const item = {id: item_id, order_id: 1, name: updateName, api_adress: updateAdress};
            onCreated(item);
            setStatusCode(res.status);
            setToastMessage("Элемент успешно обновлен!");
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
    } catch (err) {
        }
        finally{
          setLoading(false);
        }
   };

  const handleUpdateCategoryGroup = async () => {
  if(updateName === "")
  {
    setStatusCode(422);
    setToastMessage("Задайте имя категории!");
    return;
  }

  if(updateAdress === "")
  {
    setStatusCode(422);
    setToastMessage("Задайте адрес категории!");
    return;
  }
  setLoading(true);

  try {
    let newImageSrc;

    if (file) {
      newImageSrc = await uploadFileToS3(file);
      setFile(null);
      if (!newImageSrc) {
        setStatusCode(500);
        setToastMessage("Внутренняя ошибка сервера!");
        setLoading(false);
        return;
      }
    } else {
      newImageSrc = updatedImage;
    }

    setImage(newImageSrc);

    const res = await fetch(`${BASE_URL}/update-categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        id: item_id,
        group_id: 1,
        name: updateName,
        image_src: newImageSrc,
        api_adress: updateAdress,
        order_id: 1,
        amount: item_amount
      })
    });

    if (res.status === 200) {
      const item = {
        id: item_id,
        name: updateName,
        api_adress: updateAdress,
        amount: item_amount,
        image_src: newImageSrc
      };
      onCreated(item);
      setStatusCode(res.status);
      setToastMessage("Элемент успешно обновлен!");
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
  } catch (err) {
  }
  finally{
          setLoading(false);
        }
};

   const handleCreateCategoryGroup = async () => {
    if(name === "")
    {
      setStatusCode(422);
      setToastMessage("Задайте имя категории!");
      return;
    }

    if(adress === "")
    {
      setStatusCode(422);
      setToastMessage("Задайте адрес страницы!");
      return;
    }
    setLoading(true);
    if(file)
    {
     try{
      const image_src = await uploadFileToS3(file);
      
    if (!image_src) { 
      setStatusCode(500);
      setToastMessage("Внутренняя ошибка сервера!");
      setLoading(false);
      return;
    }
      const res = await fetch(`${BASE_URL}/create-category`,{
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
            group_id: 1,
            name: name,
            image_src: image_src,
            api_adress: adress,
            order_id: 1,
            amount: 0
            })
          });
    
          if (res.status === 200) {
            const data = await res.json();
            const item = {id: data.content.id, order_id: 1, name: name, image_src: image_src, api_adress: adress, amount: 0}
            onCreated(item);
            setStatusCode(res.status);
            setToastMessage("Элемент успешно создан!");
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
    } catch (err) {
        } 
        finally{
          setLoading(false);
        }
    }
    else
    {
      setStatusCode(422);
      setToastMessage("Задайте изображение!");
      setLoading(false);
      return;
    }
   };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handlePdfFileChange = (e) => {
    setPdf(e.target.files[0]);
  };

  const handleUpdateAbout = async () => {
    if(updateName === "")
    {
      setStatusCode(422);
      setToastMessage("Задайте имя кнопки!");
      return;
    }
    
    if(updateAdress === "")
    {
      setStatusCode(422);
      setToastMessage("Задайте адрес страницы!");
      return;
    }
    setLoading(true);
    try{
      const res = await fetch(`${BASE_URL}/update-header-about`,{
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
            id: item_id,
            order_id: 1,
            name: updateName,
            api_adress: updateAdress
            })
          });
    
          if (res.status === 200) {
            const item = {id: item_id, name: updateName, api_adress: updateAdress}
            onCreated(item);
            setStatusCode(res.status);
            setToastMessage("Элемент успешно обновлен!");
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
    } catch (err) {
        }
        finally{
          setLoading(false);
        }
   };

   const hasApiAdressUpdate = (api_adress, id) => {
  if (["/", "/404", "/confirm-email"].includes(api_adress)) {
    return true;
  }

  return pages.some(page => 
    page.api_adress === api_adress && page.id !== id
  );
};

   const hasApiAdress = (api_adress) => {
    if(api_adress === "/")
    {
      return true;
    }
    else if(api_adress === "/404")
    {
      return true;
    }
    else if(api_adress === "/confirm-email")
    {
      return true;
    }

  return pages.some(page => page.api_adress === api_adress);
  };
   const handleUpdatePages = async () => {
    if(updateName === "")
    {
      setStatusCode(422);
      setToastMessage("Задайте имя кнопки!");
      return;
    }

    if(updateAdress === "")
    {
      setStatusCode(422);
      setToastMessage("Задайте адрес страницы!");
      return;
    }
    setLoading(true);
    try{
      const res = await fetch(`${BASE_URL}/update-header-pages`,{
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
            id: item_id,
            order_id: 1,
            name: updateName,
            api_adress: updateAdress
            })
          });
    
          if (res.status === 200) {
            const item = {id: item_id, name: updateName, api_adress: updateAdress};
            onCreated(item);
            setStatusCode(res.status);
            setToastMessage("Элемент успешно обновлен!");
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
    } catch (err) {
        }
        finally{
          setLoading(false);
        }
   };

   const handleSetExistsProducts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/get-product-groups`);

      if (res.status === 200) {
        const data = await res.json();
        setExistsGroups(data.content);
      }

    } catch (err) {
    }
    setPrevType(type);
    setType("existsProductsItem");
   };

   const handleSetExistsTaskGroups = async () => {
    try {
      const res = await fetch(`${BASE_URL}/task-groups`);

      if (res.status === 200) {
        const data = await res.json();
        setExistsGroups(data.content);
      }

    } catch (err) {
    }
    setPrevType(type);
    setType("existsTaskGroupsItem");
   };

   const handleSetExistsSimmilar = async () => {
    try {
      const res = await fetch(`${BASE_URL}/get-simmilar-products-tags`);

      if (res.status === 200) {
        const data = await res.json();
        setExistsGroups(data.content);
      }

    } catch (err) {
    }
    setPrevType(type);
    setHandlerType("addComponentWithShift");
    setType("existsSimmilar");
   }

   const handleSetExistsVista = async () => {
    try {
      const res = await fetch(`${BASE_URL}/get-vista-names`);

      if (res.status === 200) {
        const data = await res.json();
        setExistsGroups(data.content);
      }

    } catch (err) {
    }
    setPrevType(type);
    setHandlerType("addComponentWithShift");
    setType("existsVista");
   }

   const handleSetExistsReviewsGroups = async () => {
    try {
      const res = await fetch(`${BASE_URL}/get-regular-reviews-groups`);

      if (res.status === 200) {
        const data = await res.json();
        setExistsGroups(data.content);
      }

    } catch (err) {
    }
    setPrevType(type);
    setHandlerType("addComponentWithShift");
    setType("existsRegularGroupsItem");
   };

   const handleConnectVista = async () => {
    if(name === ""){
      setStatusCode(422);
      setToastMessage("Задайте название ресурса!");
      return
     }
    setLoading(true);
    try {
      const res2 = await fetch(`${BASE_URL}/get-vista-with-name`,{
          method: "POST",
          headers: {
          "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: name
          })
        });

    if (res2.status === 200) {
      const data = await res2.json();
      try {
          const res = await fetch(`${BASE_URL}/create-page-component`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              credentials: "include",
              body: JSON.stringify({
                name: component_name,
                group_id: page_id,
                group_name: name,
                order_id: component_order_id
              })
      });
      if (res.status === 200) {
        const data2 = await res.json();
        const item ={
        "id": data2.content.id,
        "name": component_name,
        "component_content":  data.content,
        "order_id": component_order_id,
        "group_id": groupId
      }
      onCreated(item);
      setStatusCode(res.status);
      setToastMessage("Элемент успешно подключен!");
      } else if (res.status === 401) {
            setStatusCode(res.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          }

    } catch (err) {
    }
    } else if (res2.status === 404) {
      setStatusCode(res2.status);
      setToastMessage("Элемент не найден, таблица пуста!");
    } else if (res2.status === 500) {
      setStatusCode(res2.status);
      setToastMessage("Внутренняя ошибка сервера!");
    } else {
      setStatusCode(res2.status);
      setToastMessage("Произошла непредвиденная ошибка!");
    }
  } catch (err) {
  }
  finally{
          setLoading(false);
        }
   }

   const handleConnectReviewGroup = async () => {
     if(name === ""){
      setStatusCode(422);
      setToastMessage("Задайте имя группы!");
      return
     }
     setLoading(true);
    try {
      const res2 = await fetch(`${BASE_URL}/get-regular-reviews`,{
          method: "POST",
          headers: {
          "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: name
          })
        });

    if (res2.status === 200) {
      const data = await res2.json();
      try {
          const res = await fetch(`${BASE_URL}/create-page-component`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              credentials: "include",
              body: JSON.stringify({
                name: component_name,
                group_id: page_id,
                group_name: name,
                order_id: component_order_id
              })
      });
      if (res.status === 200) {
        const data2 = await res.json();
        const item ={
        "id": data2.content.id,
        "name": component_name,
        "component_content":  data.content,
        "order_id": component_order_id,
        "group_id": groupId
      }
      onCreated(item);
      setStatusCode(res.status);
      setToastMessage("Элемент успешно подключен!");
      } else if (res.status === 401) {
            setStatusCode(res.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          } else {
      }

    } catch (err) {
    }
    } else if (res2.status === 404) {
      setStatusCode(res2.status);
      setToastMessage("Элемент не найден, таблица пуста!");
    } else if (res2.status === 500) {
      setStatusCode(res2.status);
      setToastMessage("Внутренняя ошибка сервера!");
    } else {
      setStatusCode(res2.status);
      setToastMessage("Произошла непредвиденная ошибка!");
    }
  } catch (err) {
  }
  finally{
          setLoading(false);
        }
}

   const handleSetExistsAd = async () => {
    try {
      const res = await fetch(`${BASE_URL}/ad-groups`);

      if (res.status === 200) {
        const data = await res.json();
        setExistsGroups(data.content);
      }

    } catch (err) {
    }
    setPrevType(type);
    setType("existsAdvertisement");
   };

   const handleSetExistsCatering = async () => {
    try {
      const res = await fetch(`${BASE_URL}/catering-groups`);

      if (res.status === 200) {
        const data = await res.json();
        setExistsGroups(data.content);
      }

    } catch (err) {
    }
    setPrevType(type);
    setType("existsCatering");
   };

   const handleUpdatePopular = async () => {
    if(updateName === "")
    {
      setStatusCode(422);
      setToastMessage("Задайте имя кнопки!");
      return;
    }

    if(updateAdress === "")
    {
      setStatusCode(422);
      setToastMessage("Задайте адрес страницы!");
      return;
    }
    setLoading(true);
    try{
      const res = await fetch(`${BASE_URL}/update-header-popular`,{
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
            id: item_id,
            order_id: 1,
            name: updateName,
            api_adress: updateAdress
            })
          });
    
          if (res.status === 200) {
            const item = {id: item_id, name: updateName, api_adress: updateAdress}
            onCreated(item);
            setStatusCode(res.status);
            setToastMessage("Элемент успешно обновлен!");
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
    } catch (err) {
        }
        finally{
          setLoading(false);
        }
   };
   
const handleCreateAd = async () => {
    const freshDelta = deltaRef.current.getDelta();
    if (freshDelta.ops && freshDelta.ops.length < 0) {
      setStatusCode(404);
      setToastMessage("Напишите текст");
      return;
    }

    try {
    let newImageSrc = "";
    setLoading(true);
    if (file) {
      newImageSrc = await uploadFileToS3(file);
      setFile(null);
      if (!newImageSrc) {
        setStatusCode(500);
        setToastMessage("Внутренняя ошибка сервера!");
        setLoading(false);
        return;
      }
    } else {
      setStatusCode(404);
      setToastMessage("выберите изображение");
      setLoading(false);
      return;
    }

    setImage(newImageSrc);

    const res = await fetch(`${BASE_URL}/create-ad`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        group_id: first_element ? groupId : component_group_id,
        delta: freshDelta,
        button_info: localItemBtnInfo || "",
        ref_button_info: buttonInfoRef || "",
        ref: ref || "",
        image_src: newImageSrc,
        order_id: 1
      })
    });

    if (res.status === 200) {
      const data = await res.json();
      const component_inner_group_id = data.content.id;
      const arr_item ={
          id: component_inner_group_id,
          image_src: newImageSrc,
          delta: freshDelta,
          button_info: localItemBtnInfo || "",
          ref_button_info: buttonInfoRef || "",
          ref: ref || "",
          order_id: 1
        };
      onCreated({ group_id: first_element ? groupId : component_group_id, newItem: arr_item });
      setStatusCode(res.status);
      setToastMessage("Элемент успешно создан!");
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
  } catch (err) {
  }
  finally{
          setLoading(false);
        }
  };

const handleCreateCatering = async () => {
    try {
    if(name === "")
    {
      setStatusCode(422);
      setToastMessage("Задайте название!");
      return
    }
    
    if(desc === ""){
      setStatusCode(422);
      setToastMessage("Задайте описание!");
      return
    }

    let newImageSrc = "";
    setLoading(true);
    if (file) {
      newImageSrc = await uploadFileToS3(file);
      setFile(null);
      if (!newImageSrc) {
        setStatusCode(500);
        setToastMessage("Внутренняя ошибка сервера!");
        setLoading(false);
        return;
      }
    } else {
      setStatusCode(404);
      setToastMessage("выберите изображение");
      setLoading(false);
      return;
    }

    setImage(newImageSrc);

    if(ref === ""){
      setStatusCode(422);
      setToastMessage("Задайте ссылку!");
      return
    }

    const res = await fetch(`${BASE_URL}/create-catering`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        group_id: first_element ? groupId : component_group_id,
        title: name,
        text: desc,
        image_src: newImageSrc,
        pdf_ref: ref,
        order_id: 1
      })
    });

    if (res.status === 200) {
      const data = await res.json();
      const component_inner_group_id = data.content.id;
      const arr_item ={
          id: component_inner_group_id,
          group_id: first_element ? groupId : component_group_id,
          title: name,
          text: desc,
          image_src: newImageSrc,
          pdf_ref: ref,
          order_id: 1
        };
      onCreated({ group_id: first_element ? groupId : component_group_id, newItem: arr_item });
      setStatusCode(res.status);
      setToastMessage("Элемент успешно создан!");
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
  } catch (err) {
  }
  finally{
          setLoading(false);
        }
  };

  const handleConnectAdGroup = async () => {
    if(name != ""){
      setGroup(name);
    setLoading(true);
    try {
    const res = await fetch(`${BASE_URL}/get-advertisements`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name,
      })
    });

    if (res.status === 200) {
      const data = await res.json();
       try {
    const res2 = await fetch(`${BASE_URL}/create-page-component`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        name: component_name,
        group_id: page_id,
        group_name: name,
        order_id: component_order_id
      })
    });

    if (res2.status === 200) {
      const data2 = await res2.json();
      item_id = data2.content.id;
      const item ={
        "id": item_id,
        "name": component_name,
        "component_content": data.content,
        "order_id": component_order_id,
        "group_id": groupId
      }
      onCreated(item);
      setToastMessage("Элемент успешно подключен!");
      setType("createAdvertisementItem");
    } else if (res2.status === 404) {
      setStatusCode(res2.status);
      setToastMessage("Элемент не найден, таблица пуста!");
    } else if (res2.status === 500) {
      setStatusCode(res2.status);
      setToastMessage("Элемент с таким ключом уже сущетсвует!");
    } else if (res.status === 401) {
            setStatusCode(res.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          } else {
      setStatusCode(res2.status);
      setToastMessage("Произошла непредвиденная ошибка!");
    }
  } catch (err) {
  }
  finally{
          setLoading(false);
        }
    } else if (res.status === 404) {
      setStatusCode(res.status);
      setToastMessage("Элемент не найден, таблица пуста!");
    } else if (res.status === 500) {
      setStatusCode(res.status);
      setToastMessage("Внутренняя ошибка сервера!");
    } else {
      setStatusCode(res.status);
      setToastMessage("Произошла непредвиденная ошибка!");
    }
  } catch (err) {
  }
    }
    else{
      setStatusCode(404);
      setToastMessage("Задайтие имя группы!");
    }
  }

  const handleConnectCateringGroup = async () => {
    if(name != ""){
      setGroup(name);
    setLoading(true);
    try {
    const res = await fetch(`${BASE_URL}/get-catering`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name,
      })
    });

    if (res.status === 200) {
      const data = await res.json();
       try {
    const res2 = await fetch(`${BASE_URL}/create-page-component`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        name: component_name,
        group_id: page_id,
        group_name: name,
        order_id: component_order_id
      })
    });

    if (res2.status === 200) {
      const data2 = await res2.json();
      item_id = data2.content.id;
      const item ={
        "id": item_id,
        "name": component_name,
        "component_content": data.content,
        "order_id": component_order_id,
        "group_id": groupId
      }
      onCreated(item);
      setToastMessage("Элемент успешно подключен!");
      setType("createCateringItem");
    } else if (res2.status === 404) {
      setStatusCode(res2.status);
      setToastMessage("Элемент не найден, таблица пуста!");
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
  } catch (err) {
  }
  finally{
          setLoading(false);
        }
    } else if (res.status === 404) {
      setStatusCode(res.status);
      setToastMessage("Элемент не найден, таблица пуста!");
    } else if (res.status === 401) {
      setStatusCode(res.status);
      setToastMessage("Неавторизованный пользователь!");
      setVisibleAuth(true);
    } else if (res.status === 500) {
      setStatusCode(res.status);
      setToastMessage("Внутренняя ошибка сервера!");
    } else {
      setStatusCode(res.status);
      setToastMessage("Произошла непредвиденная ошибка!");
    }
  } catch (err) {
  }
    }
    else{
      setStatusCode(404);
      setToastMessage("Задайтие имя группы!");
    }
  }

    const handleConnectProductGroup = async () => {
    if(name != ""){
      setGroup(name);
    setLoading(true);
    try {
    const res2 = await fetch(`${BASE_URL}/get-products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name,
        offset: 0
      })
    });

    if (res2.status === 200) {
      const data = await res2.json();
       try {
    const res = await fetch(`${BASE_URL}/create-page-component`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        name: component_name,
        group_id: page_id,
        group_name: name,
        order_id: component_order_id
      })
    });

    if (res.status === 200) {
      const data2 = await res.json();
      item_id = data2.content.id;
      const item ={
        "id": item_id,
        "name": component_name,
        "component_content":  data.content,
        "order_id": component_order_id,
        "group_id": groupId
      }
      onCreated(item);
      setStatusCode(res.status);
      setToastMessage("Элемент успешно подключен!");
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
  } catch (err) {
  }
    } else if (res2.status === 404) {
      setStatusCode(res2.status);
      setToastMessage("Элемент не найден, таблица пуста!");
    } else if (res2.status === 500) {
      setStatusCode(res2.status);
      setToastMessage("Внутренняя ошибка сервера!");
    } else {
      setStatusCode(res2.status);
      setToastMessage("Произошла непредвиденная ошибка!");
    }
  } catch (err) {
  }
  finally{
          setLoading(false);
        }
    }
    else{
      setStatusCode(404);
      setToastMessage("Задайтие имя группы!");
    }
  }

  const handleConnectSimmilar = async () => {
    if(name != ""){
      setGroup(name);
    setLoading(true);
    try {
      const res2 = await fetch(`${BASE_URL}/get-simmilar-products-name`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name
      })
    });

    if (res2.status === 200) {
      const data = await res2.json();
      try{
      const res = await fetch(`${BASE_URL}/create-page-component`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        name: component_name,
        group_id: page_id,
        group_name: name,
        order_id: component_order_id
      })
    });

    if (res.status === 200) {
      const data2 = await res.json();
      item_id = data2.content.id;
      const item ={
        "id": item_id,
        "name": component_name,
        "component_content":  data.content,
        "order_id": component_order_id,
        "group_id": groupId
      }
      onCreated(item);
      setToastMessage("Элемент успешно подключен!");
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
  } catch (err) {
  }
    } else if (res2.status === 404) {
      setStatusCode(res2.status);
      setToastMessage("Элемент не найден, таблица пуста!");
    } else if (res2.status === 500) {
      setStatusCode(res2.status);
      setToastMessage("Внутренняя ошибка сервера!");
    } else {
      setStatusCode(res2.status);
      setToastMessage("Произошла непредвиденная ошибка!");
    }
  } catch (err) {
  }
  finally{
          setLoading(false);
        }
    }
    else{
      setStatusCode(404);
      setToastMessage("Задайтие имя группы!");
    }
  }

  const handleConnectPopularTaskGroup = async () => {
    if(name != ""){
      setGroup(name);
    setLoading(true);
    try {
      const res2 = await fetch(`${BASE_URL}/get-tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name
      })
    });

    if (res2.status === 200) {
      const data = await res2.json();
      try{
      const res = await fetch(`${BASE_URL}/create-page-component`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        name: component_name,
        group_id: page_id,
        group_name: name,
        order_id: component_order_id
      })
    });

    if (res.status === 200) {
      const data2 = await res.json();
      item_id = data2.content.id;
      const item ={
        "id": item_id,
        "name": component_name,
        "component_content":  data.content,
        "order_id": component_order_id,
        "group_id": groupId
      }
      onCreated(item);
      setToastMessage("Элемент успешно подключен!");
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
  } catch (err) {
  }
    } else if (res2.status === 404) {
      setStatusCode(res2.status);
      setToastMessage("Элемент не найден, таблица пуста!");
    } else if (res2.status === 500) {
      setStatusCode(res2.status);
      setToastMessage("Внутренняя ошибка сервера!");
    } else {
      setStatusCode(res2.status);
      setToastMessage("Произошла непредвиденная ошибка!");
    }
  } catch (err) {
  }
  finally{
          setLoading(false);
        }
    }
    else{
      setStatusCode(404);
      setToastMessage("Задайтие имя группы!");
    }
  }

  const handleCreateProductsGroup = async () => {
    if(name != ""){
      setGroup(name);
    setLoading(true);
    try {
    const res = await fetch(`${BASE_URL}/create-product-group`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        name: name,
        cols_amount: colsAmount > 0 ? colsAmount : 3,
        max_price: 0,
        min_price: 0
      })
    });

    if (res.status === 200) {
      const data = await res.json();
      setGroupId(data.content.id);
       try {
    const res2 = await fetch(`${BASE_URL}/create-page-component`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        name: component_name,
        group_id: page_id,
        group_name: name,
        order_id: component_order_id
      })
    });
    
    if(res2.status === 200)
    {
      const data1 = await res2.json();
      setComponentId(data1.content.id);
      const component = {
        component_content: {
          items: [],
          obj: {
            id: data.content.id,
            name: name,
            cols_amount: colsAmount > 0 ? colsAmount : 3,
            max_price: 0,
            min_price: 0
          }
        },
          group_id: data.content.id,
          id: data1.content.id,
          name: component_name,
          order_id: component_order_id
        }
      onCreated(component);
    }else if (res2.status === 401) {
            setStatusCode(res2.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          }
  } catch (err) {
  }
      setStatusCode(res.status);
      setToastMessage("Элемент успешно создан!");
      setType("createProductItem");
      setHandlerType("addItemToComponentContentProduct");

    } else if (res.status === 404) {
      setStatusCode(res.status);
      setToastMessage("Элемент не найден, таблица пуста!");
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
  } catch (err) {
  }
  finally{
          setLoading(false);
        }
    }
    else{
      setStatusCode(404);
      setToastMessage("Задайтие имя группы!");
    }
  };

  const handleCreateTasksGroup = async () => {
    if(name != ""){
      setGroup(name);
    setLoading(true);
    try {
    const res = await fetch(`${BASE_URL}/create-task-group`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        name: name
      })
    });

    if (res.status === 200) {
      const data = await res.json();
      setGroupId(data.content.id);
       try {
    const res2 = await fetch(`${BASE_URL}/create-page-component`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        name: component_name,
        group_id: page_id,
        group_name: name,
        order_id: component_order_id
      })
    });
    
    if(res2.status === 200)
    {
      const data1 = await res2.json();
      setComponentId(data1.content.id);
      const component = {
          component_content: [],
          group_id: data.content.id,
          id: data1.content.id,
          name: component_name,
          order_id: component_order_id
        }
      onCreated(component);
    }else if (res2.status === 401) {
            setStatusCode(res2.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          }

  } catch (err) {
  }
      setStatusCode(res.status);
      setToastMessage("Элемент успешно создан!");
      setType("createPopularTaskItem");
      setHandlerType("addItemToComponentContentPopular");
      setName("");

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
  } catch (err) {
  } finally{
          setLoading(false);
        }
    }
    else{
      setStatusCode(404);
      setToastMessage("Задайтие имя группы!");
    }
  };

  const handleDeleteMenuOption = async (id) => {
    setCreatedOptions(prev => prev.filter((_, i) => i !== id));
  };

  const handleCreateReviewsGroup = async () => {
    if(name != ""){
      setGroup(name);
    setLoading(true);
    try {
    const res = await fetch(`${BASE_URL}/create-regular-reviews-group`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        name: name
      })
    });

    if (res.status === 200) {
      const data = await res.json();
      setGroupId(data.content.id);
       try {
    const res2 = await fetch(`${BASE_URL}/create-page-component`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        name: component_name,
        group_id: page_id,
        group_name: name,
        order_id: component_order_id
      })
    });
    
    if(res2.status === 200)
    {
      const data1 = await res2.json();
      setComponentId(data1.content.id);
      const component = {
          component_content: [],
          group_id: data.content.id,
          id: data1.content.id,
          name: component_name,
          order_id: component_order_id
        }
      onCreated(component);
    }
    else if (res2.status === 401) {
            setStatusCode(res2.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          }
  } catch (err) {
  }
      setStatusCode(res.status);
      setToastMessage("Элемент успешно создан!");

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
  } catch (err) {
  }
  finally{
          setLoading(false);
        }
    }
    else{
      setStatusCode(404);
      setToastMessage("Задайтие имя группы!");
    }
  };

  const handleChangeProductsGroup = async () => {
    if(updateName === "")
    {
      setStatusCode(404);
      setToastMessage("Задайтие имя группы!");
      return;
    }
    setLoading(true);
    try{
      const res = await fetch(`${BASE_URL}/update-product-group`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        id: component_group_id,
        name: updateName,
        cols_amount: colsAmount > 0 ? colsAmount : 3,
        max_price: 0,
        min_price: 0
      })
    });


    if (res.status === 200) {
            const item = {name: updateName, cols_amount: colsAmount > 0 ? colsAmount : 3};
            onCreated({group_id: component_group_id, updatedItem: item});
            setStatusCode(res.status);
            setToastMessage("Элемент успешно обновлен!");
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

    } catch (err) {
    } finally{
          setLoading(false);
        }
  }

  const handleUpdateYaReview = async () => {
    if(updateName == "")
    {
      setStatusCode(422);
      setToastMessage("Задайте имя пользователя!");
      return;
    }

    if(updateRating == 0)
    {
      setStatusCode(422);
      setToastMessage("Задайте оценку отзыва!");
      return;
    }

    if(updateRef == "")
    {
      setStatusCode(422);
      setToastMessage("Задайте ссылку на отзыв!");
      return;
    }
    
    let newImageSrc = updateIcon;
    setLoading(true);
    if (file) {
      newImageSrc = await uploadFileToS3(file);
      setFile(null);
      if (!newImageSrc) {
        setStatusCode(500);
        setToastMessage("Внутренняя ошибка сервера!");
        setLoading(false);
        return;
      }
    }

    setImage(newImageSrc);

    if(updateText == "")
    {
      setStatusCode(422);
      setToastMessage("Заполните поле текст!");
      setLoading(false);
      return;
    }

    try{
      const res = await fetch(`${BASE_URL}/update-yandex-review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        id: item_id,
        text: updateText,
        rating: updateRating,
        user_name: updateName,
        order_id: 1,
        user_icon: newImageSrc,
        ref: updateRef
      })
    });


    if (res.status === 200) {
            const updatedItem = {id: item_id, text: updateText, rating: updateRating, user_name: updateName, order_id: 1, user_icon: newImageSrc, ref: updateRef}
            onCreated({updatedItem});
            setStatusCode(res.status);
            setToastMessage("Элемент успешно создан!");
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

    } catch (err) {
    }
    finally{
          setLoading(false);
        }
  }

  const handleCreateYaReview = async () => {
    if(name == "")
    {
      setStatusCode(422);
      setToastMessage("Задайте имя пользователя!");
      return;
    }

    if(rating == 0)
    {
      setStatusCode(422);
      setToastMessage("Задайте оценку отзыва!");
      return;
    }

    if(ref == "")
    {
      setStatusCode(422);
      setToastMessage("Задайте ссылку на отзыв!");
      return;
    }
    setLoading(true);
    let newImageSrc = "";
      if (file) {
      newImageSrc = await uploadFileToS3(file);
      setFile(null);
      if (!newImageSrc) {
        setStatusCode(500);
        setToastMessage("Внутренняя ошибка сервера!");
        setLoading(false);
        return;
      }
      }

    if(newImageSrc === "")
    {
      setStatusCode(422);
      setToastMessage("Задайте изображение!");
      setLoading(false);
      return;
    }

    if(text == "")
    {
      setStatusCode(422);
      setToastMessage("Заполните поле текст!");
      setLoading(false);
      return;
    }

    try{
      const res = await fetch(`${BASE_URL}/create-yandex-review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        text: text,
        rating: rating,
        user_name: name,
        order_id: 1,
        user_icon: newImageSrc,
        ref: ref
      })
    });

    if (res.status === 200) {
            const data = await res.json();
            const item = {id: data.content.id, text: text, rating: rating, user_name: name, order_id: 1, user_icon: newImageSrc, ref: ref}
            onCreated({item});
            setStatusCode(res.status);
            setToastMessage("Элемент успешно обновлен!");
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

    } catch (err) {
    }
    finally{
          setLoading(false);
        }
  }

  const handleUpdateReview = async () => {
    if(updateName == "")
    {
      setStatusCode(422);
      setToastMessage("Задайте имя пользователя!");
      return;
    }

    if(updateRating == 0)
    {
      setStatusCode(422);
      setToastMessage("Задайте оценку отзыва!");
      return;
    }

    if(updateText == "")
    {
      setStatusCode(422);
      setToastMessage("Заполните поле текст!");
      return;
    }
    setLoading(true);
    try{
      const res = await fetch(`${BASE_URL}/update-regular-review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        id: item_id,
        group_id: component_group_id,
        text: updateText,
        rating: updateRating,
        order_id: 1,
        user_name: updateName
      })
    });


    if (res.status === 200) {
            const item = {id: item_id, group_id: component_group_id, text: updateText, rating: updateRating, order_id: 1, user_name: updateName}
            onCreated({group_id: component_group_id, updatedItem: item});
            setStatusCode(res.status);
            setToastMessage("Элемент успешно обновлен!");
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

    } catch (err) {
    }
    finally{
          setLoading(false);
        }
  }

  const handleUpdateAd = async () => {
    const freshDelta = deltaRef.current.getDelta();

    if (freshDelta.ops && freshDelta.ops.length < 0) {
      setStatusCode(404);
      setToastMessage("Напишите текст");
      return;
    }
    setLoading(true);
    try{
      let newImageSrc = updatedImage;
      if (file) {
      newImageSrc = await uploadFileToS3(file);
      setFile(null);
      if (!newImageSrc) {
        setStatusCode(500);
        setToastMessage("Внутренняя ошибка сервера!");
        setLoading(false);
        return;
      }
      
      }

      const res = await fetch(`${BASE_URL}/update-ad`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        id: item_id,
        group_id: component_group_id,
        delta: freshDelta,
        button_info: updateLocalItemBtnInfo || "",
        ref_button_info: updateButtonInfoRef || "",
        ref: updateRef || "",
        image_src: newImageSrc,
        order_id: 1
      })
    });


    if (res.status === 200) {
            const item = {id: item_id, image_src: newImageSrc, delta: freshDelta, button_info: updateLocalItemBtnInfo || "", ref_button_info: updateButtonInfoRef || "", ref: updateRef || "", order_id: 1}
            onCreated({group_id: component_group_id, updatedItem: item});
            setStatusCode(res.status);
            setToastMessage("Элемент успешно обновлен!");
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

    } catch (err) {
    }
    finally{
          setLoading(false);
        }
  }

  const handleUpdateCatering = async () => {
    if(updateName === "")
    {
      setStatusCode(404);
      setToastMessage("Задайте название!");
      return;
    }
    
    if(updateDesc === "")
    {
      setStatusCode(404);
      setToastMessage("Задайте описание!");
      return;
    }

    setLoading(true);
    try{
      let newImageSrc = updatedImage;
      if (file) {
      newImageSrc = await uploadFileToS3(file);
      setFile(null);
      if (!newImageSrc) {
        setStatusCode(500);
        setToastMessage("Внутренняя ошибка сервера!");
        setLoading(false);
        return;
      }
      }

      if(updateRef === "")
      {
        setStatusCode(404);
        setToastMessage("Задайте ссылку!");
        setLoading(false);
        return;
      }


      const res = await fetch(`${BASE_URL}/update-catering`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        id: item_id,
        group_id: component_group_id,
        title: updateName,
        text: updateDesc,
        image_src: newImageSrc,
        pdf_ref: updateRef,
        order_id: 1
      })
    });

    if (res.status === 200) {
            const item = {id: item_id, group_id: component_group_id, title: updateName, text: updateDesc, image_src: newImageSrc, pdf_ref: updateRef, order_id: 1}
            onCreated({group_id: component_group_id, updatedItem: item});
            setStatusCode(res.status);
            setToastMessage("Элемент успешно обновлен!");
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

    } catch (err) {
    }
    finally{
          setLoading(false);
        }
  }

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

const handleAddTag = (item) => {
  setSaveTags((prev) => {
    if (prev.find(tag => tag.id === item.id)) return prev;
    return [...prev, item];
  });
};

const handleUpdateAddTag = (item) => {
  setUpdateTags((prev) => {
    if (prev.find(tag => tag.id === item.id)) return prev;
    return [...prev, item];
  });
  setNewTags((prev) => {
    if (prev.find(tag => tag.id === item.id)) return prev;
    return [...prev, item.id];
  });
};

const handleAddSearchTag = (item) => {
  setSaveSearchTags((prev) => {
    if (prev.find(tag => tag.id === item.id)) return prev;
    return [...prev, item];
  });
};

const handleUpdateAddSearchTag = (item) => {
  setUpdateSearchTags((prev) => {
    if (prev.find(tag => tag.id === item.id)) return prev;
    return [...prev, item];
  });
  setNewSearchTags((prev) => {
    if (prev.find(tag => tag.id === item.id)) return prev;
    return [...prev, item.id];
  })
};

const handleAddTagRegular = (item) => {
  setTags((prev) => {
    if(prev.find(tag => tag.id === item.id)) return prev;
    return [...prev, item];
  });
};

const handleAddSearchTagRegular = (item) => {
  setSearchTags((prev) => {
    if(prev.find(tag => tag.id === item.id)) return prev;
    return [...prev, item];
  });
};

const handleCreateProduct = async () => {
  try {
        if(productName === ""){
          setStatusCode(422);
          setToastMessage("Задайте имя товара!");
          return;
        }

        if(adress == ""){
          setStatusCode(422);
          setToastMessage("Задайте адрес товара!");
          return;
        }

        if(images.length === 0){
          setStatusCode(422);
          setToastMessage("Задайте хотя бы одно изображение!");
          return;
        }

        if(date == ""){
          setStatusCode(422);
          setToastMessage("Задайте дату!");
          return;
        }

        if(hasApiAdress(adress))
        {
          setStatusCode(422);
          setToastMessage("Такой адрес уже существует!");
          return;
        }
        setLoading(true);
        const res = await fetch(`${BASE_URL}/create-page`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              name: productName,
              template_type: "ProductPage",
              api_adress: adress
            })
          });

        const res_review = await fetch(`${BASE_URL}/create-regular-reviews-group`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              name: productName
            })
          });

        if(res.status === 200 && res_review.status === 200)
        {   
            const data_review = await res_review.json();
            const review_id = data_review.content.id;

            const data = await res.json();
            const newPage={
              id: data.content.id,
              name: productName,
              template_type: "ProductPage",
              api_adress: adress};
            setPages(prev => [...prev, newPage]);
            const res2 = await fetch(`${BASE_URL}/create-product-page`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              group_id: data.content.id,
              title: productName,
              reviews_id: review_id
            })
          });

             if(res2.status === 200)
            {
              const data_id = await res2.json();
              const product_page_id = data_id.content.id;
              const ids_arr = saveTags.map(item => item.id);
        const ids_search_arr = saveSearchTags.map(item => item.id);
        const res3 = await fetch(`${BASE_URL}/create-product`,{
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
            group_id: first_element ? groupId : component_group_id,
            name: productName,
            description: desc,
            api_adress: adress,
            price: price ? price : 0,
            capacity: capacity ? capacity : 0,
            toilet: toilet,
            rating: rating,
            discount: discount ? discount : 0,
            tags_list: ids_arr.length > 0 ? ids_arr.map(Number) : [],
            to_search_tags_list: ids_search_arr.length > 0 ? ids_search_arr.map(Number) : [],
            order_id: 0,
            page_id: data.content.id,
            product_page_id: product_page_id,
            reviews_id: review_id,
            date: date
            })
          });
    
          if (res3.status === 200) {
            const data2 = await res3.json();
            const id = data2.content.id;
            let imageUrlsOnly = [];
            
            if(images.length > 0){
              for (const image of images) {
              try {
                const url = await uploadFileToS3(image.file);

                  const res4 = await fetch(`${BASE_URL}/create-product-image`, {
                  method: "POST",
                  headers: {
                  "Content-Type": "application/json"
                  },
                  credentials: "include",
                  body: JSON.stringify({
                  group_id: id,
                  image_src: url,
                  order_id: 1
                  })
                });
                if (res4.status === 200) {
                const data3 = await res4.json();
                const image_item_url = {
                  id: data3.content.id,
                  src: url,
                  order_id: 1
                };
                imageUrlsOnly.push(image_item_url);
                } else if (res4.status === 401) {
            setStatusCode(res4.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          }
                } catch (err) {
                }
              }
            }
            const item = {id: id, name: productName, description: desc, api_adress: adress, rating: rating, capacity: capacity, toilet: toilet, price: price, discount: discount, order_id: 1, images: imageUrlsOnly, tags: saveTags, search_tags: saveSearchTags, page_id: data.content.id, product_page_id: product_page_id, reviews_id: review_id, date: date};
            onCreated({ group_id: first_element ? groupId : component_group_id, newItem: item });
            setStatusCode(res3.status);
            setToastMessage("Элемент успешно создан!");
          } else if (res3.status === 404) {
            setStatusCode(res3.status);
            setToastMessage("Элемент не найден, таблица пуста!");
          } else if (res3.status === 500) {
            setStatusCode(res3.status);
            setToastMessage("Элемент с таким ключом уже сущетсвует!");
          } else if (res3.status === 401) {
            setStatusCode(res3.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          } else {
            setStatusCode(res3.status);
            setToastMessage("Произошла непредвиденная ошибка!");
          }
            } else if (res2.status === 401) {
            setStatusCode(res2.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          }
        }
        else if (res.status === 404) {
            setStatusCode(res.status);
            setToastMessage("Элемент не найден, таблица пуста!");
        } else if (res.status === 500) {
            setStatusCode(res.status);
            setToastMessage("Элемент с таким ключом уже сущетсвует!");
        } 
        else if (res.status === 401) {
            setStatusCode(res.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          }
        else if (res_review.status === 404) {
            setStatusCode(res_review.status);
            setToastMessage("Элемент не найден, таблица пуста!");
        } else if (res_review.status === 500) {
            setStatusCode(res_review.status);
            setToastMessage("Элемент с таким ключом уже сущетсвует!");
        } else if (res_review.status === 401) {
            setStatusCode(res_review.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          } else {
            setStatusCode(res.status);
            setToastMessage("Произошла непредвиденная ошибка!");
        }
        } catch (err) {
        }
        finally{
          setLoading(false);
        }
};

const handleUpdateVista = async () => {
  try {
        if(updateName === ""){
          setStatusCode(422);
          setToastMessage("Задайте название элемента!");
          return;
        }

        if(updateRef === ""){
          setStatusCode(422);
          setToastMessage("Задайте ссылку на ресурс!");
          return;
        }
        setLoading(true);
        const res2 = await fetch(`${BASE_URL}/update-vista`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              id: item_id,
              vista_src: updateRef,
              name: updateName
            })
          });

        if(res2.status === 200)
        {
          const updatedItem = {id: item_id, name: updateName, vista_src: updateRef};
          onCreated({updatedItem});
            setStatusCode(res2.status);
            setToastMessage("Элемент успешно обновлен!");
        } else if (res2.status === 404) {
            setStatusCode(res2.status);
            setToastMessage("Элемент не найден, таблица пуста!");
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
    
        } catch (err) {
        }
        finally{
          setLoading(false);
        }
}

const handleUpdateSimmilar = async () => {
  try {
        if(updateName === ""){
          setStatusCode(422);
          setToastMessage("Задайте название элемента!");
          return;
        }

        if(searchUpdateStr === "" && allTags.length === 0){
          setStatusCode(422);
          setToastMessage("Задайте параметры фильтрации!");
          return;
        }
        
        let toSend_str = searchUpdateStr;
        if(allTags.length > 0)
        {
          const tagsStr = allTags.join(" ");
          const prevStr = searchUpdateStr;
          toSend_str = (prevStr + " " + tagsStr);
        }
        setLoading(true);
        const res2 = await fetch(`${BASE_URL}/update-simmilar-products`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              id: item_id,
              name: updateName,
              search_str: toSend_str
            })
          });

        if(res2.status === 200)
        {
            const data = await res2.json();
            const updatedItem = {
             id: item_id,
             name: updateName,
             search_str: toSend_str
            }
            onCreated({updatedItem})
            setStatusCode(res2.status);
            setToastMessage("Элемент успешно обновлен!");
        } else if (res2.status === 404) {
            setStatusCode(res2.status);
            setToastMessage("Элемент не найден, таблица пуста!");
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
    
        } catch (err) {
        }
        finally{
          setLoading(false);
        }
}

const handleUpdateBlogPage = async () => {
  try {
        if(updateName === ""){
          setStatusCode(422);
          setToastMessage("Задайте название страницы!");
          return;
        }

        if(updateAdress === ""){
          setStatusCode(422);
          setToastMessage("Задайте адрес страницы!");
          return;
        }

        if(updateDate === "")
        {
          setStatusCode(422);
          setToastMessage("Задайте дату создания!");
          return;
        }
        setLoading(true);
        let newImageSrc = updatedImage;

        if (file) {
            newImageSrc = await uploadFileToS3(file);
            setFile(null);
            if (!newImageSrc) {
                setStatusCode(500);
                setToastMessage("Внутренняя ошибка сервера!");
                setLoading(false);
                return;
              }
            }

        if(hasApiAdressUpdate(updateAdress, item_page_id))
        {
          setStatusCode(422);
          setToastMessage("Такой адрес уже существует!");
          setLoading(false);
          return;
        }

        const res = await fetch(`${BASE_URL}/update-page`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              id: item_page_id,
              name: updateName,
              template_type: "BlogPage",
              api_adress: updateAdress
            })
          });

        if(res.status === 200)
          {
            const res2 = await fetch(`${BASE_URL}/update-blog-page`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              id: blog_page_id,
              title: updateName,
              image_src: newImageSrc
            })
          });

          if(res2.status === 200)
          {
            const res3 = await fetch(`${BASE_URL}/update-news-preview`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              id: item_id,
              group_id: page_id, 
              title: updateName,
              image_src: newImageSrc,
              description: item_desc,
              api_adress: updateAdress,
              order_id: 1,
              date: updateDate
            })
          });
       
           if(res3.status === 200)
          {
            const newPage = {
              id: item_page_id,
              name: updateName,
              template_type: "BlogPage",
              api_adress: updateAdress
            };
            setPages(prev =>
              prev.map(page =>
                page.id === item_page_id
                ? { ...page, ...newPage }
                : page
                )
              );
             const id = item_id;
            const updatedItem = {
              id: item_id,
              group_id: page_id, 
              title: updateName,
              image_src: newImageSrc,
              description: item_desc,
              api_adress: updateAdress,
              order_id: 1,
              date: updateDate};

            onCreated({id, updatedItem});
            setStatusCode(res3.status);
            setToastMessage("Элемент успешно обновлен!");
          }
          else if(res3.status === 404)
          {
            setStatusCode(res3.status);
            setToastMessage("Элемент не найден, таблица пуста!");
          }
          else if (res3.status === 500) {
            setStatusCode(res3.status);
            setToastMessage("Элемент с таким ключом уже сущетсвует!");
          } else if (res3.status === 401) {
            setStatusCode(res3.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          } else {
            setStatusCode(res3.status);
            setToastMessage("Произошла непредвиденная ошибка!");
          }
          }
          else if(res2.status === 404)
          {
            setStatusCode(res2.status);
            setToastMessage("Элемент не найден, таблица пуста!");
          }
          else if (res2.status === 500) {
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
        else if(res.status === 404)
          {
            setStatusCode(res.status);
            setToastMessage("Элемент не найден, таблица пуста!");
          }
          else if (res.status === 500) {
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
        } catch (err) {
        }
        finally{
          setLoading(false);
        }
}

const handleUpdateCruisePage = async () => {
  try {
        if(updateName === ""){
          setStatusCode(422);
          setToastMessage("Задайте название страницы!");
          return;
        }

        if(updateAdress === ""){
          setStatusCode(422);
          setToastMessage("Задайте адрес страницы!");
          return;
        }

        if(updateDesc === ""){
          setStatusCode(422);
          setToastMessage("Задайте опсиание раздела!");
          return;
        }

         console.log(item_page_id);

        setLoading(true);
        let newImageSrc = updatedImage;

        if (file) {
            newImageSrc = await uploadFileToS3(file);
            setFile(null);
            if (!newImageSrc) {
                setStatusCode(500);
                setToastMessage("Внутренняя ошибка сервера!");
                setLoading(false);
                return;
              }
            }

        if(hasApiAdressUpdate(updateAdress, item_page_id))
        {
          setStatusCode(422);
          setToastMessage("Такой адрес уже существует!");
          setLoading(false);
          return;
        }

        const res = await fetch(`${BASE_URL}/update-page`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              id: item_page_id,
              name: updateName,
              template_type: "NewsPage",
              api_adress: updateAdress
            })
          });

        if(res.status === 200)
          {
            const res2 = await fetch(`${BASE_URL}/update-news-page`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              id: blog_page_id,
              group_id: item_page_id,
              title: updateName
            })
          });

          if(res2.status === 200)
          {
            const res3 = await fetch(`${BASE_URL}/update-news-preview`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              id: item_id,
              group_id: page_id, 
              title: updateName,
              image_src: newImageSrc,
              description: updateDesc,
              api_adress: updateAdress,
              order_id: 1,
              date: "1111-11-11"
            })
          });
       
           if(res3.status === 200)
          {
            const newPage = {
              id: item_page_id,
              name: updateName,
              template_type: "NewsPage",
              api_adress: updateAdress
            };
            setPages(prev =>
              prev.map(page =>
                page.id === item_page_id
                ? { ...page, ...newPage }
                : page
                )
              );
             const id = item_id;
            const updatedItem = {
              id: item_id,
              group_id: page_id, 
              title: updateName,
              image_src: newImageSrc,
              description: updateDesc,
              api_adress: updateAdress,
              order_id: 1,
              date: updateDate};

            onCreated({id, updatedItem});
            setStatusCode(res3.status);
            setToastMessage("Элемент успешно обновлен!");
          }
          else if(res3.status === 404)
          {
            setStatusCode(res3.status);
            setToastMessage("Элемент не найден, таблица пуста!");
          }
          else if (res3.status === 500) {
            setStatusCode(res3.status);
            setToastMessage("Элемент с таким ключом уже сущетсвует!");
          } else if (res3.status === 401) {
            setStatusCode(res3.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          } else {
            setStatusCode(res3.status);
            setToastMessage("Произошла непредвиденная ошибка!");
          }
          }
          else if(res2.status === 404)
          {
            setStatusCode(res2.status);
            setToastMessage("Элемент не найден, таблица пуста!");
          }
          else if (res2.status === 500) {
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
        else if(res.status === 404)
          {
            setStatusCode(res.status);
            setToastMessage("Элемент не найден, таблица пуста!");
          }
          else if (res.status === 500) {
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
        } catch (err) {
        }
        finally{
          setLoading(false);
        }
}

const handleSetProductVideo = async () => {
  setLoading(true);
   try {
    let newVideoSrc = "";

    if (file) {
      newVideoSrc = await uploadFileToS3(file);
      setFile(null);
      if (!newVideoSrc) {
        setStatusCode(500);
        setToastMessage("Внутренняя ошибка сервера!");
        setLoading(false);
        return;
      }
    } else {
      setStatusCode(404);
      setToastMessage("выберите изображение");
      setLoading(false);
      return;
    }

        const res = await fetch(`${BASE_URL}/update-product-video`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              id: item_page_id,
              video: newVideoSrc
            })
          });

        if(res.status === 200)
        {
            onCreated({newVideoSrc});
            setStatusCode(res.status);
            setToastMessage("Элемент успешно создан!");
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
        } catch (err) {
        }
        finally{
          setLoading(false);
        }
}

const handleUpdateProductDesc = async () => {
  try {
        if(updateName === ""){
          setStatusCode(422);
          setToastMessage("Задайте название описания!");
          return;
        }

        if(updateDesc === ""){
          setStatusCode(422);
          setToastMessage("Задайте пояснение!");
          return;
        }
        setLoading(true);
        const res = await fetch(`${BASE_URL}/update-product-page-description`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              id: item_id,
              group_id: page_id,
              name: updateName,
              description: updateDesc,
              order_id: 1
            })
          });

        if(res.status === 200)
        {
            const updatedItem = {
              id: item_id,
              group_id: page_id,
              name: updateName,
              description: updateDesc,
              order_id: 1
            };
            onCreated({updatedItem});
            setStatusCode(res.status);
            setToastMessage("Элемент успешно изменен!");
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
        } catch (err) {
        }
        finally{
          setLoading(false);
        }
}

const handleCreateProductDesc = async () => {
   try {
        if(name === ""){
          setStatusCode(422);
          setToastMessage("Задайте название описания!");
          return;
        }

        if(desc === ""){
          setStatusCode(422);
          setToastMessage("Задайте пояснение!");
          return;
        }
        setLoading(true);
        const res = await fetch(`${BASE_URL}/create-product-page-description`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              group_id: page_id,
              name: name,
              description: desc,
              order_id: 1
            })
          });

        if(res.status === 200)
        {
            const data = await res.json();
            const newItem = {id: data.content.id, name: name, group_id: page_id, description: desc, order_id: 1};
            onCreated({newItem});
            setStatusCode(res.status);
            setToastMessage("Элемент успешно создан!");
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
        } catch (err) {
        }
        finally{
          setLoading(false);
        }
}

const handleCreateBlogPage = async () => {
  try {
        if(name === ""){
          setStatusCode(422);
          setToastMessage("Задайте название страницы!");
          return;
        }

        if(adress === ""){
          setStatusCode(422);
          setToastMessage("Задайте адрес страницы!");
          return;
        }

        if(date === "")
        {
          setStatusCode(422);
          setToastMessage("Задайте дату создания!");
          return;
        }
        setLoading(true);
        let newImageSrc = "";

        if (file) {
            newImageSrc = await uploadFileToS3(file);
            setFile(null);
            if (!newImageSrc) {
                setStatusCode(500);
                setToastMessage("Внутренняя ошибка сервера!");
                setLoading(false);
                return;
              }
            } else {
                setStatusCode(422);
                setToastMessage("Задайте изображение");
                setLoading(false);
                return;
              }

            setImage(newImageSrc);

        if(hasApiAdress(adress))
        {
          setStatusCode(422);
          setToastMessage("Такой адрес уже существует!");
          setLoading(false);
          return;
        }

        const res2 = await fetch(`${BASE_URL}/create-page`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              name: name,
              template_type: "BlogPage",
              api_adress: adress
            })
          });

        if(res2.status === 200)
        {
            const data = await res2.json(); 
            const newPage={
              id: data.content.id,
              name: name,
              template_type: "BlogPage",
              api_adress: adress};
            setPages(prev => [...prev, newPage]);
            const res3 = await fetch(`${BASE_URL}/create-blog-page`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              group_id: data.content.id,
              title: name,
              image_src: newImageSrc,
            })
          });

          if(res3.status === 200)
          {
            const data2 = await res3.json();

            try{
              const res = await fetch(`${BASE_URL}/create-news-preview`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              group_id: page_id,
              title: name,
              image_src: newImageSrc,
              description: "",
              api_adress: adress,
              order_id: 1,
              page_id: data.content.id,
              blog_page_id: data2.content.id,
              date: date
            })
          });
          
          if(res.status === 200)
          {
            const data3 = await res.json();
            const newItem = {id: data3.content.id, title: name, group_id: page_id, image_src: newImageSrc, description: "", api_adress: adress, order_id: 1, page_id: data.content.id, blog_page_id: data2.content.id, date: date};
            onCreated({newItem});
            setStatusCode(res.status);
            setToastMessage("Элемент успешно создан!");
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
            catch (err)
            {
            }
          } else if (res3.status === 404) {
            setStatusCode(res3.status);
            setToastMessage("Элемент не найден, таблица пуста!");
          } else if (res3.status === 500) {
            setStatusCode(res3.status);
            setToastMessage("Элемент с таким ключом уже сущетсвует!");
          } else if (res3.status === 401) {
            setStatusCode(res3.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          } else {
            setStatusCode(res3.status);
            setToastMessage("Произошла непредвиденная ошибка!");
          }
        } else if (res2.status === 404) {
            setStatusCode(res2.status);
            setToastMessage("Элемент не найден, таблица пуста!");
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
    
        } catch (err) {
        }
        finally{
          setLoading(false);
        }
}

const handleCreateCruiseCategory = async () => {
  try {
        if(name === ""){
          setStatusCode(422);
          setToastMessage("Задайте название страницы!");
          return;
        }

        if(adress === ""){
          setStatusCode(422);
          setToastMessage("Задайте адрес страницы!");
          return;
        }

        if(text === "")
        {
          setStatusCode(422);
          setToastMessage("Задайте описание раздела!");
          return;
        }
        setLoading(true);
        let newImageSrc = "";

        if (file) {
            newImageSrc = await uploadFileToS3(file);
            setFile(null);
            if (!newImageSrc) {
                setStatusCode(500);
                setToastMessage("Внутренняя ошибка сервера!");
                setLoading(false);
                return;
              }
            } else {
                setStatusCode(422);
                setToastMessage("Задайте изображение");
                setLoading(false);
                return;
              }

            setImage(newImageSrc);

        if(hasApiAdress(adress))
        {
          setStatusCode(422);
          setToastMessage("Такой адрес уже существует!");
          setLoading(false);
          return;
        }

        const res2 = await fetch(`${BASE_URL}/create-page`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              name: name,
              template_type: "NewsPage",
              api_adress: adress
            })
          });

        
        if(res2.status === 200)
        {
          const data2 = await res2.json();

          const res3 = await fetch(`${BASE_URL}/create-news-page`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              group_id: data2.content.id,
              title: name
            })
          });

          if(res3.status === 200)
          {
            const data3 = await res3.json();

            try{
              const res = await fetch(`${BASE_URL}/create-news-preview`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              group_id: page_id,
              title: name,
              image_src: newImageSrc,
              description: text,
              api_adress: adress,
              order_id: 1,
              page_id: data2.content.id,
              blog_page_id: data3.content.id,
              date: "1111-11-11"
            })
          });
          
          if(res.status === 200)
          {
            const data3 = await res.json();
            const newItem = {id: data3.content.id, title: name, group_id: page_id, image_src: newImageSrc, description: text, api_adress: adress, order_id: 1, page_id: 0, blog_page_id: data2.content.id, date: date};
            onCreated({newItem});
            setStatusCode(res.status);
            setToastMessage("Элемент успешно создан!");
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
            catch (err)
            {
            }
          } else if (res3.status === 404) {
            setStatusCode(res3.status);
            setToastMessage("Элемент не найден, таблица пуста!");
          } else if (res3.status === 500) {
            setStatusCode(res3.status);
            setToastMessage("Элемент с таким ключом уже сущетсвует!");
          } else if (res3.status === 401) {
            setStatusCode(res3.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          } else {
            setStatusCode(res2.status);
            setToastMessage("Произошла непредвиденная ошибка!");
          }
        }
          else if (res2.status === 404) {
            setStatusCode(res2.status);
            setToastMessage("Элемент не найден, таблица пуста!");
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
    
        } catch (err) {
        }
        finally{
          setLoading(false);
        }
}

const handleCreateShopPage = async () => {
  try {
        if(name === ""){
          setStatusCode(422);
          setToastMessage("Задайте название страницы!");
          return;
        }
        setLoading(true);
        const res2 = await fetch(`${BASE_URL}/create-page`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              name: name,
              template_type: "ShopPage",
              api_adress: item_adress
            })
          });

        if(res2.status === 200)
        {
            const data = await res2.json();

            const res = await fetch(`${BASE_URL}/create-product-group`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              name: name,
              cols_amount: 3,
              max_price: 0,
              min_price: 0
            })
          });
          
          if(res.status === 200)
          {
            const data2 = await res.json();

            const res3 = await fetch(`${BASE_URL}/create-shop-page`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              page_id: data.content.id,
              products_id: data2.content.id,
              page_title: name
            })
          });
            if(res3.status === 200)
            {
              setStatusCode(res3.status);
              setToastMessage("Элемент успешно создан!");
              window.location.href = item_adress;
            }
            else if (res3.status === 404) {
            setStatusCode(res3.status);
            setToastMessage("Элемент не найден, таблица пуста!");
          } else if (res3.status === 500) {
            setStatusCode(res3.status);
            setToastMessage("Элемент с таким ключом уже сущетсвует!");
          } else if (res3.status === 401) {
            setStatusCode(res3.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          } else {
            setStatusCode(res3.status);
            setToastMessage("Произошла непредвиденная ошибка!");
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
          } else {
            setStatusCode(res.status);
            setToastMessage("Произошла непредвиденная ошибка!");
          }
        } else if (res2.status === 404) {
            setStatusCode(res2.status);
            setToastMessage("Элемент не найден, таблица пуста!");
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
    
        } catch (err) {
        }
        finally{
          setLoading(false);
        }
}

const handleCreateRegularPage = async () => {
  try {
        if(name === ""){
          setStatusCode(422);
          setToastMessage("Задайте название страницы!");
          return;
        }
        setLoading(true);
        const res2 = await fetch(`${BASE_URL}/create-page`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              name: name,
              template_type: "RegularPage",
              api_adress: item_adress
            })
          });

        if(res2.status === 200)
        {
            const data = await res2.json();

            const res = await fetch(`${BASE_URL}/create-regular-page`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              group_id: data.content.id,
              title: name
            })
          });
          
          if(res.status === 200)
          {
            setStatusCode(res.status);
            setToastMessage("Элемент успешно создан!");
            window.location.href = item_adress;
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
          } else if (res2.status === 404) {
            setStatusCode(res2.status);
            setToastMessage("Элемент не найден, таблица пуста!");
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
    
        } catch (err) {
        }
        finally{
          setLoading(false);
        }
}

const handleCreateNewsPage = async () => {
  try {
        if(name === ""){
          setStatusCode(422);
          setToastMessage("Задайте название страницы!");
          return;
        }
        setLoading(true);
        const res2 = await fetch(`${BASE_URL}/create-page`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              name: name,
              template_type: "NewsPage",
              api_adress: item_adress
            })
          });

        if(res2.status === 200)
        {
            const data = await res2.json();

            const res = await fetch(`${BASE_URL}/create-news-page`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              group_id: data.content.id,
              title: name
            })
          });
          
          if(res.status === 200)
          {
            setStatusCode(res.status);
            setToastMessage("Элемент успешно создан!");
            window.location.href = item_adress;
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
          } else if (res2.status === 404) {
            setStatusCode(res2.status);
            setToastMessage("Элемент не найден, таблица пуста!");
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
    
        } catch (err) {
        }
        finally{
          setLoading(false);
        }
}

const handleCreateSimmilar = async () => {
  try {
        if(name === ""){
          setStatusCode(422);
          setToastMessage("Задайте название элемента!");
          return;
        }

        if(searchStr === "" && allTags.length === 0){
          setStatusCode(422);
          setToastMessage("Задайте параметры фильтрации!");
          return;
        }
        
        let toSend_str = searchStr;
        if(allTags.length > 0)
        {
          const tagsStr = allTags.join(" ");
          const prevStr = searchStr;
          toSend_str = (prevStr + " " + tagsStr);
        }
        setLoading(true);
        const res2 = await fetch(`${BASE_URL}/create-simmilar-products-group`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              name: name,
              search_str: toSend_str
            })
          });

        if(res2.status === 200)
        {
            const data = await res2.json();
            const component_obj = {
             id: data.content.id,
             name: name,
             search_str: toSend_str
            }

            const res = await fetch(`${BASE_URL}/create-page-component`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              name: component_name,
              group_id: page_id,
              group_name: name,
              order_id: component_order_id
            })
          });
          
          if(res.status === 200)
          {
            const data2 = await res.json();
            const component = {
             component_content: [component_obj],
             group_id: page_id,
             id: data2.content.id,
             name: component_name,
             order_id: component_order_id
            }
            onCreated(component)
            setStatusCode(res.status);
            setToastMessage("Элемент успешно создан!");
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
        } else if (res2.status === 404) {
            setStatusCode(res2.status);
            setToastMessage("Элемент не найден, таблица пуста!");
          } else if (res2.status === 500) {
            setStatusCode(res2.status);
            setToastMessage("Внутренняя ошибка сервера!");
          } else if (res2.status === 401) {
            setStatusCode(res2.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          } else {
            setStatusCode(res2.status);
            setToastMessage("Произошла непредвиденная ошибка!");
          }
    
        } catch (err) {
        }
        finally{
          setLoading(false);
        }
}

const handleCreateVista = async () => {
  try {
        if(name === ""){
          setStatusCode(422);
          setToastMessage("Задайте название элемента!");
          return;
        }

        if(ref === ""){
          setStatusCode(422);
          setToastMessage("Задайте ссылку на ресурс!");
          return;
        }
        setLoading(true);
        const res2 = await fetch(`${BASE_URL}/create-vista`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              vista_src: ref,
              name: name
            })
          });

        if(res2.status === 200)
        {
            const data = await res2.json();
            const component_obj = {
             id: data.content.id,
             vista_src: ref,
             name: name
            }

            const res = await fetch(`${BASE_URL}/create-page-component`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              name: component_name,
              group_id: page_id,
              group_name: name,
              order_id: component_order_id
            })
          });
          
          if(res.status === 200)
          {
            const data2 = await res.json();
            const component = {
             component_content: [component_obj],
             group_id: page_id,
             id: data2.content.id,
             name: component_name,
             order_id: component_order_id
            }
            onCreated(component)
            setStatusCode(res.status);
            setToastMessage("Элемент успешно создан!");
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
        } else if (res2.status === 404) {
            setStatusCode(res2.status);
            setToastMessage("Элемент не найден, таблица пуста!");
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
    
        } catch (err) {
        }
        finally{
          setLoading(false);
        }
}

const handleCreateRedactor = async () => {
  try {
        if(name === ""){
          setStatusCode(422);
          setToastMessage("Задайте название редактора!");
          return;
        }
        setLoading(true);
        const res2 = await fetch(`${BASE_URL}/create-redactor`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              delta: { "ops": [] },
              name: name
            })
          });

        if(res2.status === 200)
        {
            const data = await res2.json();
            const component_obj = {
             id: data.content.id,
             delta: { "ops": [] },
             name: name
            }

            const res = await fetch(`${BASE_URL}/create-page-component`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              name: component_name,
              group_id: page_id,
              group_name: name,
              order_id: component_order_id
            })
          });
          
          if(res.status === 200)
          {
            const data2 = await res.json();
            const component = {
             component_content: [component_obj],
             group_id: page_id,
             id: data2.content.id,
             name: component_name,
             order_id: component_order_id
            }
            onCreated(component)
            setStatusCode(res.status);
            setToastMessage("Элемент успешно создан!");
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
        } else if (res2.status === 404) {
            setStatusCode(res2.status);
            setToastMessage("Элемент не найден, таблица пуста!");
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
    
        } catch (err) {
        }
        finally{
          setLoading(false);
        }
}

const handleCreateTask = async () => {
  try {
        if(name === ""){
          setStatusCode(422);
          setToastMessage("Задайте название вопроса!");
          return;
        }

        if(text == ""){
          setStatusCode(422);
          setToastMessage("Задайте название вопроса!");
          return;
        }
        setLoading(true);
        const res = await fetch(`${BASE_URL}/create-task`,{
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
            group_id: first_element ? groupId : component_group_id,
            name: name,
            text: text,
            order_id: 1
            })
          });
    
          if (res.status === 200) {
            const data = await res.json();
            const id = data.content.id;
            const item = {id: id, name: name, text: text, order_id: 1};
            onCreated({ group_id: first_element ? groupId : component_group_id, newItem: item });
            setStatusCode(res.status);
            setToastMessage("Элемент успешно создан!");
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
    
        } catch (err) {
        }
        finally{
          setLoading(false);
        }
};

const handleUpdateTask = async () => {
  try {
        if(updateName === ""){
          setStatusCode(422);
          setToastMessage("Задайте название вопроса!");
          return;
        }

        if(updateText == ""){
          setStatusCode(422);
          setToastMessage("Задайте название вопроса!");
          return;
        }
        setLoading(true);
        const res = await fetch(`${BASE_URL}/update-task`,{
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
            id: item_id,
            group_id: component_group_id,
            name: updateName,
            text: updateText,
            order_id: 1
            })
          });
    
          if (res.status === 200) {
            const item = {id: item_id, name: updateName, text: updateText, order_id: 1};
            onCreated({ group_id: component_group_id, updatedItem: item });
            setStatusCode(res.status);
            setToastMessage("Элемент успешно обновлен!");
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
    
        } catch (err) {
        }
        finally{
          setLoading(false);
        }
};


const handleUpdateProduct = async () => {
  try {
        if(updateName === ""){
          setStatusCode(422);
          setToastMessage("Задайте имя товара!");
          return;
        }

        if(updateAdress == ""){
          setStatusCode(422);
          setToastMessage("Задайте адрес товара!");
          return;
        }

        if(updateImages.length === 0){
          setStatusCode(422);
          setToastMessage("Задайте хотя бы одно изображение!");
          return;
        }

        if(updateDate == ""){
          setStatusCode(422);
          setToastMessage("Задайте дату!");
          return;
        }

        if(hasApiAdressUpdate(updateAdress, item_page_id))
        {
          setStatusCode(422);
          setToastMessage("Такой адрес уже существует!");
          return;
        }
        setLoading(true);
        const res = await fetch(`${BASE_URL}/update-product-page`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              id: blog_page_id,
              group_id: item_page_id,
              title: updateName,
            })
          });
          const res_review = await fetch(`${BASE_URL}/update-regular-reviews-group`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              id: item_reviews_id,
              name: updateName
            })
          });

          if(res.status === 200 && res_review.status === 200)
          {
            const res2 = await fetch(`${BASE_URL}/update-page`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              id: item_page_id,
              name: updateName,
              template_type: "ProductPage",
              api_adress: updateAdress
            })
          });

          if(res2.status === 200)
          {
            const newPage = {
              id: item_page_id,
              name: updateName,
              template_type: "ProductPage",
              api_adress: updateAdress
            };
            setPages(prev =>
              prev.map(page =>
                page.id === item_page_id
                ? { ...page, ...newPage }
                : page
                )
              );

        for(const tag of deleteTags)
        {
          try{
             const res3 = await fetch(`${BASE_URL}/delete-from-many-to-many-tags`, {
                  method: "POST",
                  headers: {
                  "Content-Type": "application/json",
                      },
                      credentials: "include",
                  body: JSON.stringify({
                    tag_id: tag,
                    product_id: item_id
                  })
                });

                if(res3.status === 401) {
            setStatusCode(res3.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          }
          }
          catch (err) {
          }
        }

        for(const tag of deleteSearchTags)
        {
          try{
             const res3 = await fetch(`${BASE_URL}/delete-from-many-to-many-search-tags`, {
                  method: "POST",
                  headers: {
                  "Content-Type": "application/json",
                      },
                      credentials: "include",
                  body: JSON.stringify({
                    tag_id: tag,
                    product_id: item_id
                  })
                });

                if(res3.status === 401) {
            setStatusCode(res3.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          }

          }
          catch (err) {
          }
        }
        const res4 = await fetch(`${BASE_URL}/update-product`,{
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
            id: item_id,
            group_id: component_group_id,
            name: updateName,
            description: updateDesc,
            api_adress: updateAdress,
            price: updatePrice ? updatePrice : 0,
            capacity: updateCapacity ? updateCapacity : 0,
            toilet: updateToilet,
            rating: updateRating,
            discount: updateDiscount ? updateDiscount : 0,
            tags_list: newTags.length > 0 ? newTags : [],
            to_search_tags_list: newSearchTags.length > 0 ? newSearchTags : [],
            order_id: 0,
            date: updateDate
            })
          });
    
          if (res4.status === 200) {
            if(deleteImages.length > 0)
            {
              console.log("delete images: " + deleteImages);

              for (const id of deleteImages) {
                try {
                  const res5 = await fetch(`${BASE_URL}/delete-product-image/${id}`, {
                  method: "DELETE",
                  headers: {
                  "Content-Type": "application/json",
                      }, credentials: "include",
                  });
                  } catch (err) {
                  }
                }
            }

            let imageUrlsOnly = [];

            for(const image of originalImagesUrl)
            {
              imageUrlsOnly.push(image);
            }
            
            if(newUpdateImages.length > 0){
              for (const image of newUpdateImages) {
              try {
                const url = await uploadFileToS3(image.file);

                console.log("created image: " + url);

                  const res6 = await fetch(`${BASE_URL}/create-product-image`, {
                  method: "POST",
                  headers: {
                  "Content-Type": "application/json"
                  },
                  credentials: "include",
                  body: JSON.stringify({
                  group_id: item_id,
                  image_src: url,
                  order_id: 1
                  })
                });
                if (res6.status === 200) {
                const data6 = await res6.json();
                const image_item_url = {
                  id: data6.content.id,
                  src: url,
                  order_id: 1
                };
                imageUrlsOnly.push(image_item_url);
                }
                } catch (err) {
                }
              }
            }

            if(newUpdateUpdateImages.length > 0){
              for (const image of newUpdateUpdateImages) {
              try {
                const url = await uploadFileToS3(image.file);

                  const res6 = await fetch(`${BASE_URL}/update-product-images`, {
                  method: "POST",
                  headers: {
                  "Content-Type": "application/json"
                  },
                  credentials: "include",
                  body: JSON.stringify({
                  id: image.id,
                  group_id: item_id,
                  image_src: url,
                  order_id: image.order_id
                  })
                });
                if (res6.status === 200) {
                const image_item_url = {
                  id: image.id,
                  src: url,
                  order_id: image.order_id
                };

                const index = imageUrlsOnly.findIndex(
                  item => item.order_id === image.order_id
                );

                if (index !== -1) {
                  imageUrlsOnly[index] = image_item_url;
                }

                }
                } catch (err) {
                }
              }
            }

            const item = {id: item_id, name: updateName, description: updateDesc, api_adress: updateAdress, rating: updateRating, capacity: updateCapacity, toilet: updateToilet, price: updatePrice, discount: updateDiscount, order_id: 1, images: imageUrlsOnly, tags: updateTags, search_tags: updateSearchTags, date: updateDate};
            onCreated({ group_id: component_group_id, id: item_id, updatedItem: item });
            setStatusCode(res4.status);
            setToastMessage("Элемент успешно обновлен!");
        
          }  else if (res4.status === 404) {
            setStatusCode(res4.status);
            setToastMessage("Элемент не найден, таблица пуста!");
          } else if (res4.status === 500) {
            setStatusCode(res4.status);
            setToastMessage("Элемент с таким ключом уже сущетсвует!");
          } else if (res4.status === 401) {
            setStatusCode(res4.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          } else {
            setStatusCode(res4.status);
            setToastMessage("Произошла непредвиденная ошибка!");
          }
        }
      else if (res2.status === 404) {
            setStatusCode(res2.status);
            setToastMessage("Элемент не найден, таблица пуста!");
      } else if (res2.status === 500) {
            setStatusCode(res2.status);
            setToastMessage("Элемент с таким ключом уже сущетсвует!");
      } else if (res2.status === 401) {
            setStatusCode(res2.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          }
 else {
            setStatusCode(res2.status);
            setToastMessage("Произошла непредвиденная ошибка!");
      }
      }
      else if (res.status === 404) {
            setStatusCode(res.status);
            setToastMessage("Элемент не найден, таблица пуста!");
      } else if (res.status === 401) {
            setStatusCode(res.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          } else if (res.status === 500) {
            setStatusCode(res.status);
            setToastMessage("Элемент с таким ключом уже сущетсвует!");
      } 
      else if (res_review.status === 404) {
            setStatusCode(res_review.status);
            setToastMessage("Элемент не найден, таблица пуста!");
      } else if (res_review.status === 500) {
            setStatusCode(res_review.status);
            setToastMessage("Элемент с таким ключом уже сущетсвует!");
      } else if (res_review.status === 401) {
            setStatusCode(res_review.status);
            setToastMessage("Неавторизованный пользователь!");
            setVisibleAuth(true);
          } else {
            setStatusCode(res.status);
            setToastMessage("Произошла непредвиденная ошибка!");
      }
        } catch (err) {
        }
        finally{
          setLoading(false);
          setNewUpdateImages([]);
          setNewUpdateUpdateImages([]);
          setDeleteImages([]);
        }
};

function formatDate(date) {
  if (!date) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const handleCreateCalculator = async () => {
  try{
    if(!name)
    {
      setStatusCode(422);
      setToastMessage("Задайте имя калькулятора!");
      return;
    }

    if(!lowRange){
      setStatusCode(422);
      setToastMessage("Задайте низкий сезон!");
      return;
    }

    if(!midRange){
      setStatusCode(422);
      setToastMessage("Задайте средний сезон!");
      return;
    }

    if(!highRange){
      setStatusCode(422);
      setToastMessage("Задайте высокий сезон!");
      return;
    }

    if(!lowDateMorningBefore)
    {
      setStatusCode(422);
      setToastMessage("Задайте утреннее время с!");
      return;
    }

    if(!lowDateMorningAfter)
    {
      setStatusCode(422);
      setToastMessage("Задайте утреннее время до!");
      return;
    }

    if(!lowMinMorningHours)
    {
      setStatusCode(422);
      setToastMessage("Задайте мин часов аренды!");
      return;
    }

    if(!lowHourMorningPriceMn)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в пн!");
      return;
    }

    if(!lowHourMorningPriceTs)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в вт!");
      return;
    }

    if(!lowHourMorningPriceWs)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в ср!");
      return;
    }

    if(!lowHourMorningPriceTu)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в чт!");
      return;
    }

    if(!lowHourMorningPriceFr)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в пт!");
      return;
    }

    if(!lowHourMorningPriceSn)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в сб!");
      return;
    }

    if(!lowHourMorningPriceSt)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в вс!");
      return;
    }

    if(!lowDateEvenBefore)
    {
      setStatusCode(422);
      setToastMessage("Задайте утреннее время с!");
      return;
    }

    if(!lowDateEvenAfter)
    {
      setStatusCode(422);
      setToastMessage("Задайте утреннее время до!");
      return;
    }

    if(!lowMinEvenHours)
    {
      setStatusCode(422);
      setToastMessage("Задайте мин часов аренды!");
      return;
    }

    if(!lowHourEvenPriceMn)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в пн!");
      return;
    }

    if(!lowHourEvenPriceTs)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в вт!");
      return;
    }

    if(!lowHourEvenPriceWs)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в ср!");
      return;
    }

    if(!lowHourEvenPriceTu)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в чт!");
      return;
    }

    if(!lowHourEvenPriceFr)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в пт!");
      return;
    }

    if(!lowHourEvenPriceSn)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в сб!");
      return;
    }

    if(!lowHourEvenPriceSt)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в вс!");
      return;
    }

    if(!lowDateNightBefore)
    {
      setStatusCode(422);
      setToastMessage("Задайте утреннее время с!");
      return;
    }

    if(!lowDateNightAfter)
    {
      setStatusCode(422);
      setToastMessage("Задайте утреннее время до!");
      return;
    }

    if(!lowMinNightHours)
    {
      setStatusCode(422);
      setToastMessage("Задайте мин часов аренды!");
      return;
    }

    if(!lowHourNightPriceMn)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в пн!");
      return;
    }

    if(!lowHourNightPriceTs)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в вт!");
      return;
    }

    if(!lowHourNightPriceWs)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в ср!");
      return;
    }

    if(!lowHourNightPriceTu)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в чт!");
      return;
    }

    if(!lowHourNightPriceFr)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в пт!");
      return;
    }

    if(!lowHourNightPriceSn)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в сб!");
      return;
    }

    if(!lowHourNightPriceSt)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в вс!");
      return;
    }

    if(!midDateMorningBefore)
    {
      setStatusCode(422);
      setToastMessage("Задайте утреннее время с!");
      return;
    }

    if(!midDateMorningAfter)
    {
      setStatusCode(422);
      setToastMessage("Задайте утреннее время до!");
      return;
    }

    if(!midMinMorningHours)
    {
      setStatusCode(422);
      setToastMessage("Задайте мин часов аренды!");
      return;
    }

    if(!midHourMorningPriceMn)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в пн!");
      return;
    }

    if(!midHourMorningPriceTs)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в вт!");
      return;
    }

    if(!midHourMorningPriceWs)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в ср!");
      return;
    }

    if(!midHourMorningPriceTu)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в чт!");
      return;
    }

    if(!midHourMorningPriceFr)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в пт!");
      return;
    }

    if(!midHourMorningPriceSn)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в сб!");
      return;
    }

    if(!midHourMorningPriceSt)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в вс!");
      return;
    }

    if(!midDateEvenBefore)
    {
      setStatusCode(422);
      setToastMessage("Задайте утреннее время с!");
      return;
    }

    if(!midDateEvenAfter)
    {
      setStatusCode(422);
      setToastMessage("Задайте утреннее время до!");
      return;
    }

    if(!midMinEvenHours)
    {
      setStatusCode(422);
      setToastMessage("Задайте мин часов аренды!");
      return;
    }

    if(!midHourEvenPriceMn)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в пн!");
      return;
    }

    if(!midHourEvenPriceTs)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в вт!");
      return;
    }

    if(!midHourEvenPriceWs)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в ср!");
      return;
    }

    if(!midHourEvenPriceTu)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в чт!");
      return;
    }

    if(!midHourEvenPriceFr)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в пт!");
      return;
    }

    if(!midHourEvenPriceSn)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в сб!");
      return;
    }

    if(!midHourEvenPriceSt)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в вс!");
      return;
    }

    if(!midDateNightBefore)
    {
      setStatusCode(422);
      setToastMessage("Задайте утреннее время с!");
      return;
    }

    if(!midDateNightAfter)
    {
      setStatusCode(422);
      setToastMessage("Задайте утреннее время до!");
      return;
    }

    if(!midMinNightHours)
    {
      setStatusCode(422);
      setToastMessage("Задайте мин часов аренды!");
      return;
    }

    if(!midHourNightPriceMn)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в пн!");
      return;
    }

    if(!midHourNightPriceTs)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в вт!");
      return;
    }

    if(!midHourNightPriceWs)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в ср!");
      return;
    }

    if(!midHourNightPriceTu)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в чт!");
      return;
    }

    if(!midHourNightPriceFr)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в пт!");
      return;
    }

    if(!midHourNightPriceSn)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в сб!");
      return;
    }

    if(!midHourNightPriceSt)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в вс!");
      return;
    }

    if(!highDateMorningBefore)
    {
      setStatusCode(422);
      setToastMessage("Задайте утреннее время с!");
      return;
    }

    if(!highDateMorningAfter)
    {
      setStatusCode(422);
      setToastMessage("Задайте утреннее время до!");
      return;
    }

    if(!highMinMorningHours)
    {
      setStatusCode(422);
      setToastMessage("Задайте мин часов аренды!");
      return;
    }

    if(!highHourMorningPriceMn)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в пн!");
      return;
    }

    if(!highHourMorningPriceTs)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в вт!");
      return;
    }

    if(!highHourMorningPriceWs)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в ср!");
      return;
    }

    if(!highHourMorningPriceTu)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в чт!");
      return;
    }

    if(!highHourMorningPriceFr)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в пт!");
      return;
    }

    if(!highHourMorningPriceSn)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в сб!");
      return;
    }

    if(!highHourMorningPriceSt)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в вс!");
      return;
    }

    if(!highDateEvenBefore)
    {
      setStatusCode(422);
      setToastMessage("Задайте утреннее время с!");
      return;
    }

    if(!highDateEvenAfter)
    {
      setStatusCode(422);
      setToastMessage("Задайте утреннее время до!");
      return;
    }

    if(!highMinEvenHours)
    {
      setStatusCode(422);
      setToastMessage("Задайте мин часов аренды!");
      return;
    }

    if(!highHourEvenPriceMn)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в пн!");
      return;
    }

    if(!highHourEvenPriceTs)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в вт!");
      return;
    }

    if(!highHourEvenPriceWs)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в ср!");
      return;
    }

    if(!highHourEvenPriceTu)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в чт!");
      return;
    }

    if(!highHourEvenPriceFr)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в пт!");
      return;
    }

    if(!highHourEvenPriceSn)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в сб!");
      return;
    }

    if(!highHourEvenPriceSt)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в вс!");
      return;
    }

    if(!highDateNightBefore)
    {
      setStatusCode(422);
      setToastMessage("Задайте утреннее время с!");
      return;
    }

    if(!highDateNightAfter)
    {
      setStatusCode(422);
      setToastMessage("Задайте утреннее время до!");
      return;
    }

    if(!highMinNightHours)
    {
      setStatusCode(422);
      setToastMessage("Задайте мин часов аренды!");
      return;
    }

    if(!highHourNightPriceMn)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в пн!");
      return;
    }

    if(!highHourNightPriceTs)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в вт!");
      return;
    }

    if(!highHourNightPriceWs)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в ср!");
      return;
    }

    if(!highHourNightPriceTu)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в чт!");
      return;
    }

    if(!highHourNightPriceFr)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в пт!");
      return;
    }

    if(!highHourNightPriceSn)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в сб!");
      return;
    }

    if(!highHourNightPriceSt)
    {
      setStatusCode(422);
      setToastMessage("Задайте стоимость аренды в вс!");
      return;
    }

    const lowRange_from = formatDate(lowRange.from);
    const lowRange_to = formatDate(lowRange.to);
    const midRange_from = formatDate(midRange.from);
    const midRange_to = formatDate(midRange.to);
    const highRange_from = formatDate(highRange.from);
    const highRange_to = formatDate(highRange.to);

    setLoading(true);

    const res_calculator = await fetch(`${BASE_URL}/create-calculator`,{
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        name: name,
      })
    });
    
    if (res_calculator.status === 200) {  
      const data = await res_calculator.json();
      const calculator_id = data.content.id;

      const res_low_season = await fetch(`${BASE_URL}/create-calculator-season`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          from_date: lowRange_from,
          to_date: lowRange_to,
          type: "low_range",
          component_id: calculator_id
        })
      });

      if(res_low_season.status === 200)
      {
        const data_low_season = await res_low_season.json();
        const low_id = data_low_season.content.id;
        
        const res_week_morning = await fetch(`${BASE_URL}/create-week`,{
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            mn: lowHourMorningPriceMn,
            ts: lowHourMorningPriceTs,
            ws: lowHourMorningPriceWs,
            tu: lowHourMorningPriceTu,
            fr: lowHourMorningPriceFr,
            sn: lowHourMorningPriceSn,
            st: lowHourMorningPriceSt,
            from_time: lowDateMorningAfter,
            to_time: lowDateMorningBefore,
            hours: lowMinMorningHours,
            season_id: low_id
          })
        });

        const res_week_midday = await fetch(`${BASE_URL}/create-week`,{
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            mn: lowHourEvenPriceMn,
            ts: lowHourEvenPriceTs,
            ws: lowHourEvenPriceWs,
            tu: lowHourEvenPriceTu,
            fr: lowHourEvenPriceFr,
            sn: lowHourEvenPriceSn,
            st: lowHourEvenPriceSt,
            from_time: lowDateEvenAfter,
            to_time: lowDateEvenBefore,
            hours: lowMinEvenHours,
            season_id: low_id
          })
        });

        const res_week_night = await fetch(`${BASE_URL}/create-week`,{
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            mn: lowHourNightPriceMn,
            ts: lowHourNightPriceTs,
            ws: lowHourNightPriceWs,
            tu: lowHourNightPriceTu,
            fr: lowHourNightPriceFr,
            sn: lowHourNightPriceSn,
            st: lowHourNightPriceSt,
            from_time: lowDateNightAfter,
            to_time: lowDateNightBefore,
            hours: lowMinNightHours,
            season_id: low_id
          })
        });

      } else if (res_low_season.status === 404) {
        setStatusCode(res_low_season.status);
        setToastMessage("Элемент не найден, таблица пуста!");
      } else if (res_low_season.status === 500) {
        setStatusCode(res_low_season.status);
        setToastMessage("Элемент с таким ключом уже сущетсвует!");
      } else if (res_low_season.status === 401) {
        setStatusCode(res_low_season.status);
        setToastMessage("Неавторизованный пользователь!");
        setVisibleAuth(true);
      } else {
        setStatusCode(res_low_season.status);
        setToastMessage("Произошла непредвиденная ошибка!");
      }

      // остальные сезоны
      const res_mid_season = await fetch(`${BASE_URL}/create-calculator-season`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          from_date: midRange_from,
          to_date: midRange_to,
          type: "mid_range",
          component_id: calculator_id
        })
      });

      if(res_mid_season.status === 200)
      {
        const data_mid_season = await res_mid_season.json();
        const mid_id = data_mid_season.content.id;
        
        const res_week_morning = await fetch(`${BASE_URL}/create-week`,{
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            mn: midHourMorningPriceMn,
            ts: midHourMorningPriceTs,
            ws: midHourMorningPriceWs,
            tu: midHourMorningPriceTu,
            fr: midHourMorningPriceFr,
            sn: midHourMorningPriceSn,
            st: midHourMorningPriceSt,
            from_time: midDateMorningAfter,
            to_time: midDateMorningBefore,
            hours: midMinMorningHours,
            season_id: mid_id
          })
        });

        const res_week_midday = await fetch(`${BASE_URL}/create-week`,{
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            mn: midHourEvenPriceMn,
            ts: midHourEvenPriceTs,
            ws: midHourEvenPriceWs,
            tu: midHourEvenPriceTu,
            fr: midHourEvenPriceFr,
            sn: midHourEvenPriceSn,
            st: midHourEvenPriceSt,
            from_time: midDateEvenAfter,
            to_time: midDateEvenBefore,
            hours: midMinEvenHours,
            season_id: mid_id
          })
        });

        const res_week_night = await fetch(`${BASE_URL}/create-week`,{
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            mn: midHourNightPriceMn,
            ts: midHourNightPriceTs,
            ws: midHourNightPriceWs,
            tu: midHourNightPriceTu,
            fr: midHourNightPriceFr,
            sn: midHourNightPriceSn,
            st: midHourNightPriceSt,
            from_time: midDateNightAfter,
            to_time: midDateNightBefore,
            hours: midMinNightHours,
            season_id: mid_id
          })
        });

      } else if (res_mid_season.status === 404) {
        setStatusCode(res_mid_season.status);
        setToastMessage("Элемент не найден, таблица пуста!");
      } else if (res_mid_season.status === 500) {
        setStatusCode(res_mid_season.status);
        setToastMessage("Элемент с таким ключом уже сущетсвует!");
      } else if (res_mid_season.status === 401) {
        setStatusCode(res_mid_season.status);
        setToastMessage("Неавторизованный пользователь!");
        setVisibleAuth(true);
      } else {
        setStatusCode(res_mid_season.status);
        setToastMessage("Произошла непредвиденная ошибка!");
      }

      const res_high_season = await fetch(`${BASE_URL}/create-calculator-season`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          from_date: highRange_from,
          to_date: highRange_to,
          type: "high_range",
          component_id: calculator_id
        })
      });

      if(res_high_season.status === 200)
      {
        const data_high_season = await res_high_season.json();
        const high_id = data_high_season.content.id;
        
        const res_week_morning = await fetch(`${BASE_URL}/create-week`,{
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            mn: highHourMorningPriceMn,
            ts: highHourMorningPriceTs,
            ws: highHourMorningPriceWs,
            tu: highHourMorningPriceTu,
            fr: highHourMorningPriceFr,
            sn: highHourMorningPriceSn,
            st: highHourMorningPriceSt,
            from_time: highDateMorningAfter,
            to_time: highDateMorningBefore,
            hours: highMinMorningHours,
            season_id: high_id
          })
        });

        const res_week_midday = await fetch(`${BASE_URL}/create-week`,{
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            mn: highHourEvenPriceMn,
            ts: highHourEvenPriceTs,
            ws: highHourEvenPriceWs,
            tu: highHourEvenPriceTu,
            fr: highHourEvenPriceFr,
            sn: highHourEvenPriceSn,
            st: highHourEvenPriceSt,
            from_time: highDateEvenAfter,
            to_time: highDateEvenBefore,
            hours: highMinEvenHours,
            season_id: high_id
          })
        });

        const res_week_night = await fetch(`${BASE_URL}/create-week`,{
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            mn: highHourNightPriceMn,
            ts: highHourNightPriceTs,
            ws: highHourNightPriceWs,
            tu: highHourNightPriceTu,
            fr: highHourNightPriceFr,
            sn: highHourNightPriceSn,
            st: highHourNightPriceSt,
            from_time: highDateNightAfter,
            to_time: highDateNightBefore,
            hours: highMinNightHours,
            season_id: high_id
          })
        });

      } else if (res_high_season.status === 404) {
        setStatusCode(res_high_season.status);
        setToastMessage("Элемент не найден, таблица пуста!");
      } else if (res_high_season.status === 500) {
        setStatusCode(res_high_season.status);
        setToastMessage("Элемент с таким ключом уже сущетсвует!");
      } else if (res_high_season.status === 401) {
        setStatusCode(res_high_season.status);
        setToastMessage("Неавторизованный пользователь!");
        setVisibleAuth(true);
      } else {
        setStatusCode(res_high_season.status);
        setToastMessage("Произошла непредвиденная ошибка!");
      }

      const res_calc_stuff = await fetch(`${BASE_URL}/create-calc-stuff`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          cleaning: cleaningPrice,
          catering: selectedIds,
          furshet: selectedFurIds,
          dj: djPrice,
          wedding: weddingPrice,
          guide: guidePrice,
          flowers: flowerPrice,
          ballons: baloonPrice,
          component_id: calculator_id
        })
      });

    } else if (res_calculator.status === 404) {
      setStatusCode(res_calculator.status);
      setToastMessage("Элемент не найден, таблица пуста!");
    } else if (res_calculator.status === 500) {
      setStatusCode(res_calculator.status);
      setToastMessage("Элемент с таким ключом уже сущетсвует!");
    } else if (res_calculator.status === 401) {
      setStatusCode(res_calculator.status);
      setToastMessage("Неавторизованный пользователь!");
      setVisibleAuth(true);
    } else {
      setStatusCode(res_calculator.status);
      setToastMessage("Произошла непредвиденная ошибка!");
    }

    const res = await fetch(`${BASE_URL}/create-page-component`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        name: component_name,
        group_id: page_id,
        group_name: name,
        order_id: component_order_id
      })
    });
          
    if(res.status === 200)
    {
      const data2 = await res.json();
      const component_content = {
        low_range: {
          from_date: lowRange_from,
          to_date: lowRange_to,
          time: {
            part_1: {
              from_time: lowDateMorningAfter,
              to_time: lowDateMorningBefore,
              days: {
                mn: lowHourMorningPriceMn,
                ts: lowHourMorningPriceTs,
                ws: lowHourMorningPriceWs,
                tu: lowHourMorningPriceTu,
                fr: lowHourMorningPriceFr,
                sn: lowHourMorningPriceSn,
                st: lowHourMorningPriceSt
              },
              min_hours: lowMinMorningHours
            },
            part_2: {
              from_time: lowDateEvenAfter,
              to_time: lowDateEvenBefore,
              days: {
                mn: lowHourEvenPriceMn,
                ts: lowHourEvenPriceTs,
                ws: lowHourEvenPriceWs,
                tu: lowHourEvenPriceTu,
                fr: lowHourEvenPriceFr,
                sn: lowHourEvenPriceSn,
                st: lowHourEvenPriceSt
              },
              min_hours: lowMinEvenHours
            },
            part_3: {
              from_time: lowDateNightAfter,
              to_time: lowDateNightBefore,
              days: {
                mn: lowHourNightPriceMn,
                ts: lowHourNightPriceTs,
                ws: lowHourNightPriceWs,
                tu: lowHourNightPriceTu,
                fr: lowHourNightPriceFr,
                sn: lowHourNightPriceSn,
                st: lowHourNightPriceSt
              },
              min_hours: lowMinNightHours
            }
          }
        },
        mid_range: {
          from_date: midRange_from,
          to_date: midRange_to,
          time: {
            part_1: {
              from_time: midDateMorningAfter,
              to_time: midDateMorningBefore,
              days: {
                mn: midHourMorningPriceMn,
                ts: midHourMorningPriceTs,
                ws: midHourMorningPriceWs,
                tu: midHourMorningPriceTu,
                fr: midHourMorningPriceFr,
                sn: midHourMorningPriceSn,
                st: midHourMorningPriceSt
              },
              min_hours: midMinMorningHours
            },
            part_2: {
              from_time: midDateEvenAfter,
              to_time: midDateEvenBefore,
              days: {
                mn: midHourEvenPriceMn,
                ts: midHourEvenPriceTs,
                ws: midHourEvenPriceWs,
                tu: midHourEvenPriceTu,
                fr: midHourEvenPriceFr,
                sn: midHourEvenPriceSn,
                st: midHourEvenPriceSt
              },
              min_hours: midMinEvenHours
            },
            part_3: {
              from_time: midDateNightAfter,
              to_time: midDateNightBefore,
              days: {
                mn: midHourNightPriceMn,
                ts: midHourNightPriceTs,
                ws: midHourNightPriceWs,
                tu: midHourNightPriceTu,
                fr: midHourNightPriceFr,
                sn: midHourNightPriceSn,
                st: midHourNightPriceSt
              },
              min_hours: midMinNightHours
            }
          }
        },
        high_range: {
          from_date: highRange_from,
          to_date: highRange_to,
          time: {
            part_1: {
              from_time: highDateMorningAfter,
              to_time: highDateMorningBefore,
              days: {
                mn: highHourMorningPriceMn,
                ts: highHourMorningPriceTs,
                ws: highHourMorningPriceWs,
                tu: highHourMorningPriceTu,
                fr: highHourMorningPriceFr,
                sn: highHourMorningPriceSn,
                st: highHourMorningPriceSt
              },
              min_hours: highMinMorningHours
            },
            part_2: {
              from_time: highDateEvenAfter,
              to_time: highDateEvenBefore,
              days: {
                mn: highHourEvenPriceMn,
                ts: highHourEvenPriceTs,
                ws: highHourEvenPriceWs,
                tu: highHourEvenPriceTu,
                fr: highHourEvenPriceFr,
                sn: highHourEvenPriceSn,
                st: highHourEvenPriceSt
              },
              min_hours: highMinEvenHours
            },
            part_3: {
              from_time: highDateNightAfter,
              to_time: highDateNightBefore,
              days: {
                mn: highHourNightPriceMn,
                ts: highHourNightPriceTs,
                ws: highHourNightPriceWs,
                tu: highHourNightPriceTu,
                fr: highHourNightPriceFr,
                sn: highHourNightPriceSn,
                st: highHourNightPriceSt
              },
              min_hours: highMinNightHours
            }
          }
        },
        stuff: {
          cleaning: cleaningPrice,
          catering: selectedIds,
          furshet: selectedFurIds,
          dj: djPrice,
          wedding: weddingPrice,
          guide: guidePrice,
          flowers: flowerPrice,
          ballons: baloonPrice
        }
      };

      const component = {
        component_content: component_content,
        group_id: page_id,
        id: data2.content.id,
        name: component_name,
        order_id: component_order_id
      }

      onCreated(component)
      setStatusCode(res.status);
      setToastMessage("Элемент успешно создан!");
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
  catch(err)
  {
  }
  finally{
    setLoading(false);
  }
}

const handleCreateSearchTag = async () => {
  try {
        if(name === ""){
          setStatusCode(422);
          setToastMessage("Задайте описание тега!");
          return;
        }
        setLoading(true);
          const res = await fetch(`${BASE_URL}/create-search-tag`,{
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
            name: name
            })
          });
    
          if (res.status === 200) {
            const data = await res.json();
            const id = data.content.id;
            const item = {id: id, name: name};
            handleAddSearchTagRegular(item);
            setStatusCode(res.status);
            setToastMessage("Элемент успешно создан!");
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
        
        } catch (err) {
        }
        finally{
          setLoading(false);
        }
        setType(prevType);
};

const handleCreateMenu = async () => {
  setPrevType("calculator");
  setType("createMenu");
};

const handleCreateFurMenu = async () => {
  setPrevType("calculator");
  setType("createFurMenu");
};

const  handleAddMenu = async () => {
  // добавить добаление в базу данных на сервер
  try{
    if(createdOptions.length === 0){
      setStatusCode(422);
      setToastMessage("Задайте опции меню!");
      return;
    }

    if(menuName === ""){
      setStatusCode(422);
      setToastMessage("Задайте имя меню!");
      return;
    }

    if(minMenuPrice === "" || minMenuPrice === 0)
    {
      setStatusCode(422);
      setToastMessage("Задайте минимальную сумму заказа!");
      return;
    }
    
    setLoading(true);
    let newImageSrc = "";

    if (file) {
      newImageSrc = await uploadFileToS3(file);
      setFile(null);
      if (!newImageSrc) {
        setStatusCode(500);
        setToastMessage("Внутренняя ошибка сервера!");
        setLoading(false);
        return;
      }
    } else {
      setStatusCode(422);
      setToastMessage("Задайте изображение");
      setLoading(false);
      return;
    }

    setImage(newImageSrc);

    const res2 = await fetch(`${BASE_URL}/create-menu`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        options: createdOptions,
        name: menuName,
        price: minMenuPrice,
        image: newImageSrc
      })
    });

        if(res2.status === 200)
        {
          const data = await res2.json();
          const id = data.content.id;

          setExistsMenus([
            ...existsMenus,
            {
              id: id,
              options: createdOptions,
              name: menuName,
              price: minMenuPrice,
              image: newImageSrc
            }
          ]);
          setStatusCode(res2.status);
          setToastMessage("Элемент успешно добавлен!");
          
        } else if (res2.status === 404) {
          setStatusCode(res2.status);
          setToastMessage("Элемент не найден, таблица пуста!");
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
  catch(err){
  }
  finally{
    setLoading(false);
  }
};

const handleAddMenuFur = async () => {
  // добавить добаление в базу данных на сервер
  try{
    if(createdOptions.length === 0){
      setStatusCode(422);
      setToastMessage("Задайте опции меню!");
      return;
    }

    if(menuName === ""){
      setStatusCode(422);
      setToastMessage("Задайте имя меню!");
      return;
    }

    if(minMenuPrice === "" || minMenuPrice === 0)
    {
      setStatusCode(422);
      setToastMessage("Задайте минимальную сумму заказа!");
      return;
    }
    
    setLoading(true);
    let newImageSrc = "";

    if (file) {
      newImageSrc = await uploadFileToS3(file);
      setFile(null);
      if (!newImageSrc) {
        setStatusCode(500);
        setToastMessage("Внутренняя ошибка сервера!");
        setLoading(false);
        return;
      }
    } else {
      setStatusCode(422);
      setToastMessage("Задайте изображение");
      setLoading(false);
      return;
    }

    setImage(newImageSrc);

    const res2 = await fetch(`${BASE_URL}/create-menu-fur`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        options: createdOptions,
        name: menuName,
        price: minMenuPrice,
        image: newImageSrc
      })
    });

        if(res2.status === 200)
        {
          const data = await res2.json();
          const id = data.content.id;

          setExistsMenus([
            ...existsMenus,
            {
              id: id,
              options: createdOptions,
              name: menuName,
              price: minMenuPrice,
              image: newImageSrc
            }
          ]);
          setStatusCode(res2.status);
          setToastMessage("Элемент успешно добавлен!");
          
        } else if (res2.status === 404) {
          setStatusCode(res2.status);
          setToastMessage("Элемент не найден, таблица пуста!");
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
  catch(err){
  }
  finally{
    setLoading(false);
  }
};

const handleAddSelectedMenu = async (id, item_id) => {
  if (selectedMenus.includes(id)) {
    setSelectedMenus(selectedMenus.filter(item => item !== id));
    setSelectedIds(selectedIds.filter(item => item !== item_id));
  } else {
    setSelectedMenus([...selectedMenus, id]);
    setSelectedIds([...selectedIds, item_id]);
  }
};

const handleAddSelectedFurMenu = async (id, item_id) => {
  if (selectedFurMenus.includes(id)) {
    setSelectedFurMenus(selectedFurMenus.filter(item => item !== id));
    setSelectedFurIds(selectedFurIds.filter(item => item !== item_id));
  } else {
    setSelectedFurMenus([...selectedFurMenus, id]);
    setSelectedFurIds([...selectedFurIds, item_id]);
  }
};

const addCreatedOption = async () => {
  setCreatedOptions([
    ...createdOptions,
    {
        name: modalMenuOption,
        price: modalMenuPrice
    }
  ]);
};

  const handleUpdateMap = async () => {
    try {
      setLoading(true);

      if(updateLocalItemBtnInfo === "")
      {
        setStatusCode(422);
        setToastMessage("Задайте имя кнопки!");
        return;
      }

      if(updateRef === "")
      {
        setStatusCode(422);
        setToastMessage("Задайте ссылку!");
        return;
      }

      let final_image_src = "";

      if(file)
      {
        try{
          final_image_src = await uploadFileToS3(file);
      
          if (!final_image_src) { 
            setStatusCode(500);
            setToastMessage("Внутренняя ошибка сервера!");
            setLoading(false);
            return;
          }
        }
        catch(err)
        {
          console.log(err);
        }
      }
      else
      {
        final_image_src = updatedImage;
      }
        
      const res2 = await fetch(`${BASE_URL}/update-leaflet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            id: item_id,
            desc: updateDesc || "",
            button_info: updateLocalItemBtnInfo || "",
            ref: updateRef || "",
            image_src: final_image_src || ""
          })
        });

        if(res2.status === 200)
        {
          const item = {
            id: item_id,
            desc: updateDesc || "",
            button_info: updateLocalItemBtnInfo || "",
            ref: updateRef || "",
            image_src: final_image_src || ""
          };
          onCreated(item);
          
          setStatusCode(res2.status);
          setToastMessage("Элемент успешно обновлен!");
          
        } else if (res2.status === 404) {
          setStatusCode(res2.status);
          setToastMessage("Элемент не найден, таблица пуста!");
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
    
      } catch (err) {
      }
      finally{
        setLoading(false);
      }
   };

  const handleCreateMap = async () => {
    try {
      setLoading(true);

      if(name === "")
      {
        setStatusCode(422);
        setToastMessage("Задайте имя карты!");
        return;
      }

      let final_image_src = "";

      if(file)
      {
        try{
          final_image_src = await uploadFileToS3(file);
      
          if (!final_image_src) { 
            setStatusCode(500);
            setToastMessage("Внутренняя ошибка сервера!");
            setLoading(false);
            return;
          }
        }
        catch(err)
        {
          console.log(err);
        }
      }
        
      const res2 = await fetch(`${BASE_URL}/create-leaflet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            name: name,
            desc: desc || "",
            button_info: buttonInfoRef || "",
            ref: ref || "",
            image_src: final_image_src || ""
          })
        });

        if(res2.status === 200)
        {
          const data = await res2.json();
          const component_obj = {
            id: data.content.id,
            desc: desc || "",
            button_info: buttonInfoRef || "",
            ref: ref || "",
            image_src: final_image_src || "",
            piers: []
          }

          const res = await fetch(`${BASE_URL}/create-page-component`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              name: component_name,
              group_id: page_id,
              group_name: name,
              order_id: component_order_id
            })
          });
          
          if(res.status === 200)
          {
            const data2 = await res.json();
            const component = {
             component_content: [component_obj],
             group_id: page_id,
             id: data2.content.id,
             name: component_name,
             order_id: component_order_id
            }
            onCreated(component)
            setStatusCode(res.status);
            setToastMessage("Элемент успешно создан!");
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
        } else if (res2.status === 404) {
          setStatusCode(res2.status);
          setToastMessage("Элемент не найден, таблица пуста!");
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
    
      } catch (err) {
      }
      finally{
        setLoading(false);
      }
   };

const handleCreateTag = async () => {
      try {
        if(name === ""){
          setStatusCode(422);
          setToastMessage("Задайте описание тега!");
          return;
        }
        setLoading(true);
        let newImageSrc;
        if (file) {
          newImageSrc = await uploadFileToS3(file);
          setFile(null);

        if (!newImageSrc) {
          setStatusCode(500);
          setToastMessage("Внутренняя ошибка сервера!");
          setLoading(false);
          return;
        }
        }
        else{
          setStatusCode(422);
          setToastMessage("Задайте изображение тега!");
          setLoading(false);
          return;
        }
          const res = await fetch(`${BASE_URL}/create-tag`,{
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
            name: name,
            image_src: newImageSrc
            })
          });
    
          if (res.status === 200) {
            const data = await res.json();
            const id = data.content.id;
            const item = {id: id, name: name, image_src: newImageSrc};
            handleAddTagRegular(item);
            setStatusCode(res.status);
            setToastMessage("Элемент успешно создан!");
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
    
        } catch (err) {
        }
        finally{
          setLoading(false);
        }

        setType(prevType);
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
  }
};
  if (!isOpen || !type) return null;

  const modals = {
    addPopular: (
      <BaseModal title="Добавление кнопки в «Популярный выбор»" onClose={onClose} isOpen={true}>
        <input value={name || ""} placeholder="Имя кнопки" onChange={handleChangeName}/>
        <input value={adress || ""} placeholder="Адрес /my-example" onChange={handleChangeAdress}/>
        <button className="create-modal-btn" onClick={handleCreatePopular} disabled={loading}>Создать</button>
      </BaseModal>
    ),
    addAbout: (
      <BaseModal title="Добавление кнопки в «О компании»" onClose={onClose} isOpen={true}>
        <input value={name || ""} placeholder="Имя кнопки" onChange={handleChangeName}/>
        <input value={adress || ""} placeholder="Адрес /my-example" onChange={handleChangeAdress}/>
        <button className="create-modal-btn" onClick={handleCreateAbout} disabled={loading}>Создать</button>
      </BaseModal>
    ),
    addPages: (
      <BaseModal title="Добавление кнопки перехода на дочернюю страницу" onClose={onClose} isOpen={true}>
        <input value={name || ""} placeholder="Имя кнопки" onChange={handleChangeName}/>
        <input value={adress || ""} placeholder="Адрес /my-example" onChange={handleChangeAdress}/>
        <button className="create-modal-btn" onClick={handleCreatePages} disabled={loading}>Создать</button>
      </BaseModal>
    ),
    addCategory: (
      <BaseModal title="Добавление категории" onClose={onClose} isOpen={true}>
        <input value={name || ""} placeholder="Имя категории" onChange={handleChangeName}/>
        <button className="create-modal-btn" onClick={handleCreateCategory} disabled={loading}>Создать</button>
      </BaseModal>
    ),
    addCategoryGroup: (
        <BaseModal title="Создание новой категории элементов" onClose={onClose} isOpen={true}>
            <input value={name || ""} placeholder="Имя категории" type="text" onChange={handleChangeName}/>
            <input value={adress || ""} placeholder="Адрес /my-example" type="text" onChange={handleChangeAdress}/>
            <div className="setImage-contaimer-modal">
              <span>Задайте изображение</span>
              <input type="file" onChange={handleFileChange}/>
            </div>
            <button className="create-modal-btn" onClick={handleCreateCategoryGroup} disabled={loading}>Создать</button>
        </BaseModal> 
    ),
    updateCategory: (
      <BaseModal title="Изменение категории" onClose={onClose} isOpen={true}>
            <input placeholder="Имя категории" value={updateName || ""} onChange={handleChangeUpdateName}/>
            <button className="create-modal-btn" onClick={handleChangeCategory} disabled={loading}>Изменить</button>
        </BaseModal>
    ),
    updateCategoryGroup: (
       <BaseModal title="Изменение категории элементов" onClose={onClose} isOpen={true}>
            <input placeholder="Имя категории"value={updateName || ""} type="text" onChange={handleChangeUpdateName}/>
            <input placeholder="Адрес /my-example" value={updateAdress || ""} type="text" onChange={handleChangeUpdateAdress}/>
            <div className="setImage-contaimer-modal">
              <span>Поменять изображение: </span>
              <a className="href" href={updatedImage}>{updatedImage}</a>
              <input type="file" onChange={handleFileChange}/>
            </div>
            <button className="create-modal-btn" onClick={handleUpdateCategoryGroup} disabled={loading}>Изменить</button>
        </BaseModal> 
    ),
    updateAbout: (
      <BaseModal title="Изменение кнопки в «О компании»" onClose={onClose} isOpen={true}>
        <input placeholder="Имя кнопки" value={updateName || ""} onChange={handleChangeUpdateName}/>
        <input placeholder="Адрес /my-example" value={updateAdress || ""} onChange={handleChangeUpdateAdress}/>
        <button className="create-modal-btn" onClick={handleUpdateAbout} disabled={loading}>Изменить</button>
      </BaseModal>
    ),
    updatePages: (
      <BaseModal title="Изменение кнопки перехода на дочернюю страницу" onClose={onClose} isOpen={true}>
        <input placeholder="Имя кнопки" value={updateName || ""} onChange={handleChangeUpdateName}/>
        <input placeholder="Адрес /my-example" value={updateAdress || ""} onChange={handleChangeUpdateAdress}/>
        <button className="create-modal-btn" onClick={handleUpdatePages} disabled={loading}>Изменить</button>
      </BaseModal>
    ),
    updatePopular: (
      <BaseModal title="Изменение кнопки в «Популярный выбор»" onClose={onClose} isOpen={true}>
        <input placeholder="Имя кнопки" value={updateName || ""} onChange={handleChangeUpdateName}/>
        <input placeholder="Адрес /my-example" value={updateAdress || ""} onChange={handleChangeUpdateAdress}/>
        <button className="create-modal-btn" onClick={handleUpdatePopular} disabled={loading}>Изменить</button>
      </BaseModal>
    ),
    advertisement: (
      <BaseModal title="Создание группы рекламы" onClose={onClose} isOpen={true}>
        <input value={name || ""} placeholder="Имя группы" onChange={handleChangeName}/>
        <div className="modal-buttons-container">
          <button className="create-modal-btn" onClick={handleSetExistsAd} disabled={loading}>Включить существующую</button>
          <button className="create-modal-btn" onClick={handleCreateAdGroup} disabled={loading}>Создать</button>
        </div>
      </BaseModal>
    ),
    catering: (
      <BaseModal title="Создание группы кейтеринга" onClose={onClose} isOpen={true}>
        <input value={name || ""} placeholder="Имя группы" onChange={handleChangeName}/>
        <div className="modal-buttons-container">
          <button className="create-modal-btn" onClick={handleSetExistsCatering} disabled={loading}>Включить существующую</button>
          <button className="create-modal-btn" onClick={handleCreateCateringGroup} disabled={loading}>Создать</button>
        </div>
      </BaseModal>
    ),
    existsAdvertisement: (
        <BaseModal title="Подключение существующей группы реклам" onClose={onClose} isOpen={true}>
        <input placeholder="Имя группы" value={name || ""} onChange={handleChangeName}/>
        <button className="turnBack" onClick={handleTurnBackProduct}>
          <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
            width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
            preserveAspectRatio="xMidYMid meet">

            <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)">
            <path d="M1295 4154 c-308 -189 -669 -410 -802 -491 -134 -82 -243 -151 -243
            -154 0 -6 1598 -989 1621 -997 5 -2 9 112 9 263 l0 266 713 -4 c789 -3 762 -1
            910 -71 195 -93 345 -273 403 -486 25 -88 25 -280 1 -370 -67 -252 -253 -445
            -512 -531 l-70 -24 -722 -3 -723 -3 0 -469 0 -470 728 0 c596 0 745 3 827 15
            726 110 1285 652 1422 1378 27 145 25 457 -5 605 -148 735 -735 1277 -1477
            1362 -53 6 -378 10 -792 10 l-703 0 0 260 c0 202 -3 260 -12 259 -7 0 -265
            -156 -573 -345z"/>
            </g>
            </svg>
        </button>
        <div className="available-groups">
          <span className="available-groups-title">Доступные группы: </span>
          <SimpleBar 
          style={{ maxWidth: '660px', whiteSpace: 'nowrap', overflowX: 'auto' }}
             autoHide={false}>
            <div className="available-groups-items">
            {existsGroups && existsGroups.length > 0 ? (
            existsGroups.map((item) => (
            <button onClick={() => {setName(item.name); setGroupId(item.id)}} className="available-groups-button" key={item.id}>
            {item.name}
            </button>
            ))
            ) : (
            <span className="no-available-groups">нет доступных групп</span>
            )}
          </div>
          </SimpleBar>
        </div>
        <div className="modal-buttons-container">
          <button className="create-modal-btn" onClick={handleConnectAdGroup} disabled={loading}>Подключить</button>
        </div>
      </BaseModal>
    ),
    existsCatering: (
        <BaseModal title="Подключение существующей группы кейтеринга" onClose={onClose} isOpen={true}>
        <input placeholder="Имя группы" value={name || ""} onChange={handleChangeName}/>
        <button className="turnBack" onClick={handleTurnBackProduct}>
          <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
            width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
            preserveAspectRatio="xMidYMid meet">

            <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)">
            <path d="M1295 4154 c-308 -189 -669 -410 -802 -491 -134 -82 -243 -151 -243
            -154 0 -6 1598 -989 1621 -997 5 -2 9 112 9 263 l0 266 713 -4 c789 -3 762 -1
            910 -71 195 -93 345 -273 403 -486 25 -88 25 -280 1 -370 -67 -252 -253 -445
            -512 -531 l-70 -24 -722 -3 -723 -3 0 -469 0 -470 728 0 c596 0 745 3 827 15
            726 110 1285 652 1422 1378 27 145 25 457 -5 605 -148 735 -735 1277 -1477
            1362 -53 6 -378 10 -792 10 l-703 0 0 260 c0 202 -3 260 -12 259 -7 0 -265
            -156 -573 -345z"/>
            </g>
            </svg>
        </button>
        <div className="available-groups">
          <span className="available-groups-title">Доступные группы: </span>
          <SimpleBar 
          style={{ maxWidth: '660px', whiteSpace: 'nowrap', overflowX: 'auto' }}
             autoHide={false}>
            <div className="available-groups-items">
            {existsGroups && existsGroups.length > 0 ? (
            existsGroups.map((item) => (
            <button onClick={() => {setName(item.name); setGroupId(item.id)}} className="available-groups-button" key={item.id}>
            {item.name}
            </button>
            ))
            ) : (
            <span className="no-available-groups">нет доступных групп</span>
            )}
          </div>
          </SimpleBar>
        </div>
        <div className="modal-buttons-container">
          <button className="create-modal-btn" onClick={handleConnectCateringGroup} disabled={loading}>Подключить</button>
        </div>
      </BaseModal>
    ),
    createAdvertisementItem: (
      <BaseModal title="Создание элемента рекламы" onClose={onClose} isOpen={true}>
        <div className="redactor-container">
          <Suspense fallback={<div className="suspense-loading"><LoadingGifPage loading={true}/></div>}>
          <QuillRedactor className="redactor" ref={deltaRef}/>
          </Suspense>
        </div>
        <input value={localItemBtnInfo || ""} placeholder="Переход для заявки" onChange={handleChangeBtnInfo}/>
        <input value={buttonInfoRef || ""} placeholder="Имя кнопки для перехода" onChange={handleChangeButtonInfoRef}/>
        <input value={ref || ""} placeholder="Ссылка для перехода по кнопке" onChange={handleChangeRef}/>
        <div className="setImage-contaimer-modal">
              <span>Задайте изображение</span>
              <input type="file" onChange={handleFileChange}/>
        </div>
        <button className="create-modal-btn" onClick={handleCreateAd} disabled={loading}>Создать</button>
      </BaseModal>
    ),
    updateAdvertisementItem: (
      <BaseModal title="Изменение элемента рекламы" onClose={onClose} isOpen={true}>
        <div className="redactor-container">
          <Suspense fallback={<div className="suspense-loading"><LoadingGifPage loading={true}/></div>}>
          <QuillRedactor className="redactor" ref={deltaRef} str={item_delta}/>
          </Suspense>
        </div>
        <input value={updateLocalItemBtnInfo || ""} placeholder="Переход для заявки" onChange={handleChangeUpdateBtnInfo}/>
        <input value={updateButtonInfoRef || ""} placeholder="Имя кнопки для перехода" onChange={handleChangeUpdateButtonInfoRef}/>
        <input value={updateRef || ""} placeholder="Ссылка для перехода по кнопке" onChange={handleChangeUpdateRef}/>
        <div className="setImage-contaimer-modal">
              <span>Поменять изображение: </span>
              <a className="href" href={updatedImage}>{updatedImage}</a>
              <input type="file" onChange={handleFileChange}/>
        </div>
        <button className="create-modal-btn" onClick={handleUpdateAd} disabled={loading}>Изменить</button>
      </BaseModal>
    ),
    createCateringItem: (
      <BaseModal title="Создание карточки кейтеринга" onClose={onClose} isOpen={true}>
        <input value={name || ""} placeholder="Название компании" key="catering-name" onChange={handleChangeName}/>
        <input value={desc || ""} key="product-desc" placeholder="Описание" onChange={handleChangeDesc}/>
        <input value={ref || ""} key="product-desc" placeholder="Ссылка для перехода" onChange={handleChangeRef}/>
        <div className="setImage-contaimer-modal">
              <span>Задайте изображение</span>
              <input type="file" onChange={handleFileChange}/>
        </div>
        <button className="create-modal-btn" onClick={handleCreateCatering} disabled={loading}>Создать</button>
      </BaseModal>
    ),
    updateCateringItem: (
      <BaseModal title="Изменение элемента кейтеринг" onClose={onClose} isOpen={true}>
        <input placeholder="Название компании" value={updateName || ""} key="catering-name" onChange={handleChangeUpdateName}/>
        <input value={updateDesc || ""} key="product-desc" placeholder="Описание" onChange={handleChangeUpdateDesc}/>
        <input value={updateRef || ""} key="product-desc" placeholder="Ссылка для перехода" onChange={handleChangeUpdateRef}/>
        <div className="setImage-contaimer-modal">
              <span>Поменять изображение: </span>
              <a className="href" href={updatedImage}>{updatedImage}</a>
              <input type="file" onChange={handleFileChange}/>
        </div>
        <button className="create-modal-btn" onClick={handleUpdateCatering} disabled={loading}>Изменить</button>
      </BaseModal>
    ),
    productsGrid: (
      <BaseModal title="Создание группы товаров" onClose={onClose} isOpen={true}>
        <input value={name || ""} placeholder="Имя группы" key="product-group" onChange={handleChangeName}/>
        <input value={colsAmount || ""} placeholder="Кол-во колонок" key="product-cols" type="number" onChange={handleChangeCols}/>
        <div className="modal-buttons-container">
          <button className="create-modal-btn" onClick={handleSetExistsProducts} disabled={loading}>Включить существующую</button>
          <button className="create-modal-btn" onClick={handleCreateProductsGroup} disabled={loading}>Создать</button>
        </div>
      </BaseModal>
    ),
    createProductItem: (
      <BaseModal title="Создание элемента товаров" onClose={onClose} isOpen={true}>
        <input value={productName || ""} key="product-name" placeholder="Имя" onChange={handleChangeProductName}/>
        <input value={desc || ""} key="product-desc" placeholder="Описание" onChange={handleChangeDesc}/>
        <input value={capacity || ""} key="product-amount-and-smth-else" type="number" placeholder="Кол-во человек" onChange={handleChangeCapacity}/>
        <input value={toilet || ""} key="product-toilet" placeholder="Наличие туалета" onChange={handleChangeToilet}/>
        <input value={adress || ""} key="product-adress" placeholder="Адрес страницы товара /my-example.ru/product-page" onChange={handleChangeAdress}/>
        <input
          type="date"
          value={date || ""}
          onChange={(e) => setDate(e.target.value)}
        />
        <div className="reviewsInput-rating-container">
                <span>Кол-во звезд<span className="reviewsInput-red-star"></span>:</span>
                <div
                className="reviewsInput-rating-container-stars"
                style={{ display: "flex", cursor: "pointer" }}
                >
                {stars.map((star) => {
                const isActive = star <= (hoveredStar || rating);

                return (
                <svg className={`reviewsInput-gold-star${isActive ? "-active" : ""}`}
                key={star}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="40"
                height="40"
                strokeWidth="2"
                strokeLinejoin="round"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setRating(star)}
                style={{ transition: "fill 0.2s, stroke 0.2s" }}
                >
                <path d="M12 2.5l3.09 6.26 6.91.99-5 4.87 
                        1.18 6.88L12 18.77l-6.18 3.23 
                        1.18-6.88-5-4.87 6.91-.99L12 2.5z"/>
                </svg>
            );
            })}
          </div>
        </div>
        <div className="setImage-contaimer-modal">
              <span>Задайте изображение</span>
          <SimpleBar 
          style={{ maxWidth: '660px', width: '660px'}}
             autoHide={false}>
              <div className="setImage-arr-container">
        <label className="setImage-contaimer-modal-add-image">
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
          <input
            type="file"
            style={{ display: "none" }}
            onChange={handleFileChangeArr}
          />
        </label>
        {images.map((image, idx) => (
          <div
            className="images-container"
            key={idx}
            style={{
              minWidth: "80px",
              height: "80px",
              borderRadius: "10px",
              overflow: "hidden",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <img
            loading="lazy"
              src={image.url}
              alt={`preview-${idx}`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {e.target.onerror = null; e.target.src = "/images/fallback.webp";}}/>
            <button className="setImage-arr-container-onDelete" onClick={() => handleDeleteImage(image.id)}>
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
          <label className="setImage-arr-container-onUpdate">
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
          <input
            type="file"
            style={{ display: "none" }}
            onChange={(e) => handleUpdateImage(e, image.id)}
          />
        </label>
          </div>
        ))}
      </div>
          </SimpleBar>
        </div>
        <div className="tags-container">
          <div className="current-tags-container">
            <span>Теги</span>
              <SimpleBar 
                style={{ maxWidth: '660px', width: '660px', overflow: 'auto'}}
             autoHide={false}>
              <div className="current-tags-container-swiper">
                {saveTags.length > 0 ? (saveTags.map((item) => (
            <TagButtonDelete item={item} handleDeleteTag={handleDeleteTag}/>
            ))) : (
              <label className="to-small-span">Выберите теги из списка доступных</label>
            )}
              </div>
             </SimpleBar>
          </div>
          <span>Доступные теги</span>
          <SimpleBar 
          style={{ maxWidth: '660px', width: '660px', overflow: 'auto'}}
             autoHide={false}>
            <div className="available-groups-items">
            <button className="contaimer-modal-add-tag-btn" onClick={() => {setPrevType(type); setType("newTag"); setName("")}}>
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
            {tags.map((item) => (
            <TagButton key={item.id} item={item} handleAddTag={handleAddTag} />
            ))}
          </div>
          </SimpleBar>
        </div>
        
        <div className="tags-container">
          <div className="current-tags-container">
            <span>Поисковые теги</span>
              <SimpleBar 
                style={{ maxWidth: '660px', width: '660px', overflow: 'auto'}}
             autoHide={false}>
              <div className="current-tags-container-swiper">
                {saveSearchTags.length > 0 ? (saveSearchTags.map((item) => (
            <TagSearchButtonDelete item={item} handleDeleteTag={handleDeleteSearchTag}/>
            ))) : (
              <label className="to-small-span">Выберите теги из списка доступных</label>
            )}
              </div>
             </SimpleBar>
          </div>
          <span>Доступные теги</span>
          <SimpleBar 
          style={{ maxWidth: '660px', width: '660px', overflow: 'auto'}}
             autoHide={false}>
            <div className="available-groups-items">
            <button className="contaimer-modal-add-tag-btn" onClick={() => {setPrevType(type); setType("newSearchTag"); setName("")}}>
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
            {searchTags.map((item) => (
            <TagSearchButton key={item.id} item={item} handleAddTag={handleAddSearchTag} />
            ))}
          </div>
          </SimpleBar>
        </div>

        <input value={price || ""} key="product-price" type="number" placeholder="Цена товара" onChange={handleChangePrice}/>
        <input value={discount || ""} key="product-discount" type="number" placeholder="Скидка" onChange={handleChangeDiscount}/>
        <button className="create-modal-btn" onClick={handleCreateProduct} disabled={loading}>Создать</button>
      </BaseModal>
    ),
    existsProductsItem: (
      <BaseModal title="Подключение существующей группы товаров" onClose={onClose} isOpen={true}>
        <input placeholder="Имя группы" value={name || ""} onChange={handleChangeName}/>
        <button className="turnBack" onClick={handleTurnBackProduct}>
          <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
            width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
            preserveAspectRatio="xMidYMid meet">

            <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)">
            <path d="M1295 4154 c-308 -189 -669 -410 -802 -491 -134 -82 -243 -151 -243
            -154 0 -6 1598 -989 1621 -997 5 -2 9 112 9 263 l0 266 713 -4 c789 -3 762 -1
            910 -71 195 -93 345 -273 403 -486 25 -88 25 -280 1 -370 -67 -252 -253 -445
            -512 -531 l-70 -24 -722 -3 -723 -3 0 -469 0 -470 728 0 c596 0 745 3 827 15
            726 110 1285 652 1422 1378 27 145 25 457 -5 605 -148 735 -735 1277 -1477
            1362 -53 6 -378 10 -792 10 l-703 0 0 260 c0 202 -3 260 -12 259 -7 0 -265
            -156 -573 -345z"/>
            </g>
            </svg>
        </button>
        <div className="available-groups">
          <span className="available-groups-title">Доступные группы: </span>
          <SimpleBar 
          style={{ maxWidth: '660px', whiteSpace: 'nowrap'}}
             autoHide={false}>
            <div className="available-groups-items">
            {existsGroups && existsGroups.length > 0 ? (
            existsGroups.map((item) => (
            <button onClick={() => {setName(item.name); setGroupId(item.id)}} className="available-groups-button" key={item.id}>
              {item.name}
            </button>
            ))
            ) : (
            <span className="no-available-groups">нет доступных групп</span>
            )}
          </div>
          </SimpleBar>
        </div>
        <div className="modal-buttons-container">
          <button className="create-modal-btn" onClick={handleConnectProductGroup} disabled={loading}>Подключить</button>
        </div>
      </BaseModal>
    ),
    newTag: (
      <BaseModal title="Создание нового тега" onClose={onClose} isOpen={true}>
        <button className="turnBack" onClick={handleTurnBackProduct}>
          <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
            width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
            preserveAspectRatio="xMidYMid meet">

            <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)">
            <path d="M1295 4154 c-308 -189 -669 -410 -802 -491 -134 -82 -243 -151 -243
            -154 0 -6 1598 -989 1621 -997 5 -2 9 112 9 263 l0 266 713 -4 c789 -3 762 -1
            910 -71 195 -93 345 -273 403 -486 25 -88 25 -280 1 -370 -67 -252 -253 -445
            -512 -531 l-70 -24 -722 -3 -723 -3 0 -469 0 -470 728 0 c596 0 745 3 827 15
            726 110 1285 652 1422 1378 27 145 25 457 -5 605 -148 735 -735 1277 -1477
            1362 -53 6 -378 10 -792 10 l-703 0 0 260 c0 202 -3 260 -12 259 -7 0 -265
            -156 -573 -345z"/>
            </g>
            </svg>
        </button>
            <input value={name || ""} placeholder="Всплывающее описание тега" type="text" onChange={handleChangeName}/>
            <div className="setImage-contaimer-modal">
              <span>Задайте изображение</span>
              <input type="file" onChange={handleFileChange}/>
            </div>
            <button className="create-modal-btn" onClick={handleCreateTag} disabled={loading}>Создать</button>
        </BaseModal> 
    ),
    newSearchTag: (
      <BaseModal title="Создание нового поискового тега" onClose={onClose} isOpen={true}>
        <button className="turnBack" onClick={handleTurnBackProduct}>
          <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
            width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
            preserveAspectRatio="xMidYMid meet">

            <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)">
            <path d="M1295 4154 c-308 -189 -669 -410 -802 -491 -134 -82 -243 -151 -243
            -154 0 -6 1598 -989 1621 -997 5 -2 9 112 9 263 l0 266 713 -4 c789 -3 762 -1
            910 -71 195 -93 345 -273 403 -486 25 -88 25 -280 1 -370 -67 -252 -253 -445
            -512 -531 l-70 -24 -722 -3 -723 -3 0 -469 0 -470 728 0 c596 0 745 3 827 15
            726 110 1285 652 1422 1378 27 145 25 457 -5 605 -148 735 -735 1277 -1477
            1362 -53 6 -378 10 -792 10 l-703 0 0 260 c0 202 -3 260 -12 259 -7 0 -265
            -156 -573 -345z"/>
            </g>
            </svg>
        </button>
            <input value={name || ""} placeholder="Имя тега" type="text" onChange={handleChangeName}/>
            <button className="create-modal-btn" onClick={handleCreateSearchTag} disabled={loading}>Создать</button>
        </BaseModal> 
    ),
    updateProductsGroup: (
      <BaseModal title="Изменение группы товаров" onClose={onClose} isOpen={true}>
        <input placeholder="Имя группы" value={updateName || ""} key="product-group" onChange={handleChangeUpdateName}/>
        <input placeholder="Кол-во колонок" value={colsAmount || ""} key="product-cols" type="number" onChange={handleChangeCols}/>
        <div className="modal-buttons-container">
          <button className="create-modal-btn" onClick={handleChangeProductsGroup} disabled={loading}>Изменить</button>
        </div>
      </BaseModal>
    ),
    updateProductItem: (
      <BaseModal title="Изменение элемента товаров" onClose={onClose} isOpen={true}>
        <input value={updateName || ""} key="product-name" placeholder="Имя" onChange={handleChangeUpdateName}/>
        <input value={updateDesc || ""} key="product-desc" placeholder="Описание" onChange={handleChangeUpdateDesc}/>
        <input value={updateCapacity || ""} key="product-amount" type="number" placeholder="Кол-во человек" onChange={handleChangeUpdateCapacity}/>
        <input value={updateToilet || ""} key="product-toilet-update" placeholder="Наличие туалета" onChange={handleChangeUpdateToilet}/>
        <input value={updateAdress || ""} key="product-adress" placeholder="Адрес страницы товара /product-page" onChange={handleChangeUpdateAdress}/>
        <input
          type="date"
          value={updateDate || ""}
          onChange={handleChangeUpdateDate}
        />
        <div className="reviewsInput-rating-container">
                <span>Кол-во звезд<span className="reviewsInput-red-star"></span>:</span>
                <div
                className="reviewsInput-rating-container-stars"
                style={{ display: "flex", cursor: "pointer" }}
                >
                {stars.map((star) => {
                const isActive = star <= (hoveredStar || updateRating);

                return (
                <svg className={`reviewsInput-gold-star${isActive ? "-active" : ""}`}
                key={star}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="40"
                height="40"
                strokeWidth="2"
                strokeLinejoin="round"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setUpdateRating(star)}
                style={{ transition: "fill 0.2s, stroke 0.2s" }}
                >
                <path d="M12 2.5l3.09 6.26 6.91.99-5 4.87 
                        1.18 6.88L12 18.77l-6.18 3.23 
                        1.18-6.88-5-4.87 6.91-.99L12 2.5z"/>
                </svg>
            );
            })}
          </div>
        </div>
        <div className="setImage-contaimer-modal">
              <span>Задайте изображение или видео</span>
          <SimpleBar 
          ref={simpleBarRef}
          style={{ maxWidth: '660px', width: '660px'}}
             autoHide={false}>
              <div className="setImage-arr-container">
        <label className="setImage-contaimer-modal-add-image">
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
          <input
            type="file"
            style={{ display: "none" }}
            onChange={handleUpdateFileChangeArr}
          />
        </label>
        {updateImages.map((image, id) => (
          <div
            className="images-container"
            key={id}
            style={{
              minWidth: "80px",
              height: "80px",
              borderRadius: "10px",
              overflow: "hidden",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <img
            loading="lazy"
              onLoad={handleImageLoad}
              src={image.src}
              alt={`preview-${id}`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {e.target.onerror = null; e.target.src = "/images/fallback.webp";}}/>
            <button className="setImage-arr-container-onDelete" onClick={() => handleDeleteUpdateImage(image.id)}>
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
          <label className="setImage-arr-container-onUpdate">
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
          <input
            type="file"
            style={{ display: "none" }}
            onChange={(e) => handleUpdateUpdateImage(e, image.id, image.order_id)}
          />
        </label>
          </div>
        ))}
      </div>
          </SimpleBar>
        </div>
        <div className="tags-container">
          <div className="current-tags-container">
            <span>Теги</span>
              <SimpleBar 
                style={{ maxWidth: '660px', width: '660px', overflow: 'auto'}}
             autoHide={false}>
              <div className="current-tags-container-swiper">
                {updateTags.length > 0 ? (updateTags.map((item) => (
            <TagButtonDelete item={item} handleDeleteTag={handleDeleteUpdateTag}/>
            ))) : (
              <label className="to-small-span">Выберите теги из списка доступных</label>
            )}
              </div>
             </SimpleBar>
          </div>
          <span>Доступные теги</span>
          <SimpleBar 
          style={{ maxWidth: '660px', width: '660px', overflow: 'auto'}}
             autoHide={false}>
            <div className="available-groups-items">
            <button className="contaimer-modal-add-tag-btn" onClick={() => {setPrevType(type); setType("newTag"); setName("")}}>
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
            {tags.map((item) => (
            <TagButton key={item.id} item={item} handleAddTag={handleUpdateAddTag} />
            ))}
          </div>
          </SimpleBar>
        </div>
        
        <div className="tags-container">
          <div className="current-tags-container">
            <span>Поисковые теги</span>
              <SimpleBar 
                style={{ maxWidth: '660px', width: '660px', overflow: 'auto'}}
             autoHide={false}>
              <div className="current-tags-container-swiper">
                {updateSearchTags.length > 0 ? (updateSearchTags.map((item) => (
            <TagSearchButtonDelete item={item} handleDeleteTag={handleUpdateDeleteSearchTag}/>
            ))) : (
              <label className="to-small-span">Выберите теги из списка доступных</label>
            )}
              </div>
             </SimpleBar>
          </div>
          <span>Доступные теги</span>
          <SimpleBar 
          style={{ maxWidth: '660px', width: '660px', overflow: 'auto'}}
             autoHide={false}>
            <div className="available-groups-items">
            <button className="contaimer-modal-add-tag-btn" onClick={() => {setPrevType(type); setType("newSearchTag"); setName("")}}>
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
            {searchTags.map((item) => (
            <TagSearchButton key={item.id} item={item} handleAddTag={handleUpdateAddSearchTag} />
            ))}
          </div>
          </SimpleBar>
        </div>

        <input value={updatePrice || ""} key="product-price" type="number" placeholder="Цена товара" onChange={handleChangeUpdatePrice}/>
        <input value={updateDiscount || ""} key="product-discount" type="number" placeholder="Скидка" onChange={handleChangeUpdateDiscount}/>
        <button className="create-modal-btn" onClick={handleUpdateProduct} disabled={loading}>Изменить</button>
      </BaseModal>
    ),

    popularTasks: (
      <BaseModal title="Создание группы популярных вопросов" onClose={onClose} isOpen={true}>
        <input value={name || ""} placeholder="Имя группы" key="popular-group" onChange={handleChangeName}/>
        <div className="modal-buttons-container">
          <button className="create-modal-btn" onClick={handleSetExistsTaskGroups} disabled={loading}>Включить существующую</button>
          <button className="create-modal-btn" onClick={handleCreateTasksGroup} disabled={loading}>Создать</button>
        </div>
      </BaseModal>
    ),

    existsTaskGroupsItem: (
      <BaseModal title="Подключение существующей группы популярных вопросов" onClose={onClose} isOpen={true}>
        <input placeholder="Имя группы" value={name || ""} onChange={handleChangeName}/>
        <button className="turnBack" onClick={handleTurnBackProduct}>
          <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
            width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
            preserveAspectRatio="xMidYMid meet">

            <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)">
            <path d="M1295 4154 c-308 -189 -669 -410 -802 -491 -134 -82 -243 -151 -243
            -154 0 -6 1598 -989 1621 -997 5 -2 9 112 9 263 l0 266 713 -4 c789 -3 762 -1
            910 -71 195 -93 345 -273 403 -486 25 -88 25 -280 1 -370 -67 -252 -253 -445
            -512 -531 l-70 -24 -722 -3 -723 -3 0 -469 0 -470 728 0 c596 0 745 3 827 15
            726 110 1285 652 1422 1378 27 145 25 457 -5 605 -148 735 -735 1277 -1477
            1362 -53 6 -378 10 -792 10 l-703 0 0 260 c0 202 -3 260 -12 259 -7 0 -265
            -156 -573 -345z"/>
            </g>
            </svg>
        </button>
        <div className="available-groups">
          <span className="available-groups-title">Доступные группы: </span>
          <SimpleBar 
          style={{ maxWidth: '660px', whiteSpace: 'nowrap'}}
             autoHide={false}>
            <div className="available-groups-items">
            {existsGroups && existsGroups.length > 0 ? (
            existsGroups.map((item) => (
            <button onClick={() => {setName(item.name); setGroupId(item.id)}} className="available-groups-button" key={item.id}>
              {item.name}
            </button>
            ))
            ) : (
            <span className="no-available-groups">нет доступных групп</span>
            )}
          </div>
          </SimpleBar>
        </div>
        <div className="modal-buttons-container">
          <button className="create-modal-btn" onClick={handleConnectPopularTaskGroup} disabled={loading}>Подключить</button>
        </div>
      </BaseModal>
    ),

    createPopularTaskItem: (
      <BaseModal title="Создание вопроса" onClose={onClose} isOpen={true}>
        <input value={name || ""} placeholder="Название вопроса" key="popular-item" onChange={handleChangeName}/>
        <textarea
        className="popularTaskArea"
        value={text || ""}
        onChange={handleChangeText}
        placeholder="Ответ на вопрос"
        rows={6}
        style={{
          width: "100%",
          resize: "vertical",
          padding: "10px",
          fontSize: "15px",
          borderRadius: "10px",
        }}
      />
        <button className="create-modal-btn" onClick={handleCreateTask} disabled={loading}>Создать</button>
      </BaseModal>
    ),

    updatePopularTaskItem: (
      <BaseModal title="Создание вопроса" onClose={onClose} isOpen={true}>
        <input placeholder="Название вопроса" value={updateName || ""} key="popular-item" onChange={handleChangeUpdateName}/>
        <textarea
        className="popularTaskArea"
        value={updateText || ""}
        onChange={handleChangeUpdateText}
        placeholder="Ответ на вопрос"
        rows={6}
        style={{
          width: "100%",
          resize: "vertical",
          padding: "10px",
          fontSize: "15px",
          borderRadius: "10px",
        }}
      />
        <button className="create-modal-btn" onClick={handleUpdateTask} disabled={loading}>Обновить</button>
      </BaseModal>
    ),

    redactor: (
      <BaseModal title="Создание текстового редактора" onClose={onClose} isOpen={true}>
        <input value={name || ""} placeholder="Название редактора" key="redactor-item" onChange={handleChangeName}/>
        <button className="create-modal-btn" onClick={handleCreateRedactor} disabled={loading}>Создать</button>
      </BaseModal>
    ),

    regularReviews: (
      <BaseModal title="Создание отзывов" onClose={onClose} isOpen={true}>
        <input value={name || ""} placeholder="Название группы отзывов" key="reviews-item" onChange={handleChangeName}/>
        <div className="modal-buttons-container">
          <button className="create-modal-btn" onClick={handleSetExistsReviewsGroups} disabled={loading}>Включить существующую</button>
          <button className="create-modal-btn" onClick={handleCreateReviewsGroup} disabled={loading}>Создать</button>
        </div>
      </BaseModal>
    ),

    existsRegularGroupsItem: (
       <BaseModal title="Подключение существующей группы отзывов" onClose={onClose} isOpen={true}>
        <input placeholder="Имя группы" value={name || ""} onChange={handleChangeName}/>
        <button className="turnBack" onClick={handleTurnBackProduct}>
          <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
            width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
            preserveAspectRatio="xMidYMid meet">

            <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)">
            <path d="M1295 4154 c-308 -189 -669 -410 -802 -491 -134 -82 -243 -151 -243
            -154 0 -6 1598 -989 1621 -997 5 -2 9 112 9 263 l0 266 713 -4 c789 -3 762 -1
            910 -71 195 -93 345 -273 403 -486 25 -88 25 -280 1 -370 -67 -252 -253 -445
            -512 -531 l-70 -24 -722 -3 -723 -3 0 -469 0 -470 728 0 c596 0 745 3 827 15
            726 110 1285 652 1422 1378 27 145 25 457 -5 605 -148 735 -735 1277 -1477
            1362 -53 6 -378 10 -792 10 l-703 0 0 260 c0 202 -3 260 -12 259 -7 0 -265
            -156 -573 -345z"/>
            </g>
            </svg>
        </button>
        <div className="available-groups">
          <span className="available-groups-title">Доступные группы: </span>
          <SimpleBar 
          style={{ maxWidth: '660px', whiteSpace: 'nowrap'}}
             autoHide={false}>
            <div className="available-groups-items">
            {existsGroups && existsGroups.length > 0 ? (
            existsGroups.map((item) => (
            <button onClick={() => {setName(item.name); setGroupId(item.id)}} className="available-groups-button" key={item.id}>
              {item.name}
            </button>
            ))
            ) : (
            <span className="no-available-groups">нет доступных групп</span>
            )}
          </div>
          </SimpleBar>
        </div>
        <div className="modal-buttons-container">
          <button className="create-modal-btn" onClick={handleConnectReviewGroup} disabled={loading}>Подключить</button>
        </div>
      </BaseModal>
    ),

    updateReviewItem: (
      <BaseModal title="Изменение отзыва" onClose={onClose} isOpen={true}>
        <input value={updateName || ""} placeholder="Имя пользователя" key="reviews-item-update" onChange={handleChangeUpdateName}/>
        <div className="reviewsInput-rating-container">
                <span>Кол-во звезд<span className="reviewsInput-red-star"></span>:</span>
                <div
                className="reviewsInput-rating-container-stars"
                style={{ display: "flex", cursor: "pointer" }}
                >
                {stars.map((star) => {
                const isActive = star <= (hoveredStar || updateRating);

                return (
                <svg className={`reviewsInput-gold-star${isActive ? "-active" : ""}`}
                key={star}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="40"
                height="40"
                strokeWidth="2"
                strokeLinejoin="round"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setUpdateRating(star)}
                style={{ transition: "fill 0.2s, stroke 0.2s" }}
                >
                <path d="M12 2.5l3.09 6.26 6.91.99-5 4.87 
                        1.18 6.88L12 18.77l-6.18 3.23 
                        1.18-6.88-5-4.87 6.91-.99L12 2.5z"/>
                </svg>
            );
            })}
          </div>
        </div>
        <textarea
        className="popularTaskArea"
            value={updateText || ""}
            onChange={handleChangeUpdateText}
            placeholder="Текст отзыва"
            rows={6}
        style={{
          width: "100%",
          resize: "vertical",
          padding: "10px",
          fontSize: "15px",
          borderRadius: "10px",
        }}
            ></textarea>
        <button className="create-modal-btn" onClick={handleUpdateReview} disabled={loading}>Изменить</button>
      </BaseModal>
    ),

    createYaReview: (
      <BaseModal title="Создание отзыва Яндекс" onClose={onClose} isOpen={true}>
        <input value={name || ""} placeholder="Имя пользователя" key="reviews-ya-item-name" onChange={handleChangeName}/>
        <div className="reviewsInput-rating-container">
                <span>Кол-во звезд<span className="reviewsInput-red-star"></span>:</span>
                <div
                className="reviewsInput-rating-container-stars"
                style={{ display: "flex", cursor: "pointer" }}
                >
                {stars.map((star) => {
                const isActive = star <= (hoveredStar || rating);

                return (
                <svg className={`reviewsInput-gold-star${isActive ? "-active" : ""}`}
                key={star}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="40"
                height="40"
                strokeWidth="2"
                strokeLinejoin="round"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setRating(star)}
                style={{ transition: "fill 0.2s, stroke 0.2s" }}
                >
                <path d="M12 2.5l3.09 6.26 6.91.99-5 4.87 
                        1.18 6.88L12 18.77l-6.18 3.23 
                        1.18-6.88-5-4.87 6.91-.99L12 2.5z"/>
                </svg>
            );
            })}
          </div>
        </div>
        <input value={ref || ""} placeholder="Ссылка на яндекс ресурс" key="reviews-ya-item-ref" onChange={handleChangeRef}/>
        <div className="setImage-contaimer-modal">
              <span>Задайте иконку пользователя</span>
              <input type="file" onChange={handleFileChange}/>
        </div>
        <textarea
            value={text || ""}
            className="popularTaskArea"
            onChange={handleChangeText}
            placeholder="Текст отзыва"
            rows={6}
        style={{
          width: "100%",
          resize: "vertical",
          padding: "10px",
          fontSize: "15px",
          borderRadius: "10px",
        }}
            ></textarea>
        <button className="create-modal-btn" onClick={handleCreateYaReview} disabled={loading}>Создать</button>
      </BaseModal>
    ),

    updateYaReview: (
      <BaseModal title="Изменение отзыва Яндекс" onClose={onClose} isOpen={true}>
        <input value={updateName || ""} placeholder="Имя пользователя" key="reviews-ya-item-name" onChange={handleChangeUpdateName}/>
        <div className="reviewsInput-rating-container">
                <span>Кол-во звезд<span className="reviewsInput-red-star"></span>:</span>
                <div
                className="reviewsInput-rating-container-stars"
                style={{ display: "flex", cursor: "pointer" }}
                >
                {stars.map((star) => {
                const isActive = star <= (hoveredStar || updateRating);

                return (
                <svg className={`reviewsInput-gold-star${isActive ? "-active" : ""}`}
                key={star}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="40"
                height="40"
                strokeWidth="2"
                strokeLinejoin="round"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setUpdateRating(star)}
                style={{ transition: "fill 0.2s, stroke 0.2s" }}
                >
                <path d="M12 2.5l3.09 6.26 6.91.99-5 4.87 
                        1.18 6.88L12 18.77l-6.18 3.23 
                        1.18-6.88-5-4.87 6.91-.99L12 2.5z"/>
                </svg>
            );
            })}
          </div>
        </div>
        <input value={updateRef || ""} placeholder="Ссылка на яндекс ресурс" key="reviews-ya-item-ref" onChange={handleChangeUpdateRef}/>
        <div className="setImage-contaimer-modal">
              <span>Изменить иконку пользователя</span>
              <a className="href" href={updateIcon}>{updateIcon}</a>
              <input type="file" onChange={handleFileChange}/>
        </div>
        <textarea
            value={updateText || ""}
            className="popularTaskArea"
            onChange={handleChangeUpdateText}
            placeholder="Текст отзыва"
            rows={6}
        style={{
          width: "100%",
          resize: "vertical",
          padding: "10px",
          fontSize: "15px",
          borderRadius: "10px",
        }}
            ></textarea>
        <button className="create-modal-btn" onClick={handleUpdateYaReview} disabled={loading}>Изменить</button>
      </BaseModal>
    ),

    vista: (
      <BaseModal title="Создание ресурса" onClose={onClose} isOpen={true}>
        <input value={name || ""} placeholder="Имя ресурса" key="vista-name-item" onChange={handleChangeName}/>
        <input value={ref || ""} placeholder="Ссылка на ресурс" key="vista-ref-item" onChange={handleChangeRef}/>
        <div className="modal-buttons-container">
          <button className="create-modal-btn" onClick={handleSetExistsVista} disabled={loading}>Подключить существующий</button>
          <button className="create-modal-btn" onClick={handleCreateVista} disabled={loading}>Создать</button>
        </div>
      </BaseModal>
    ),

    existsVista: (
      <BaseModal title="Подключение существующей группы отзывов" onClose={onClose} isOpen={true}>
        <input placeholder="Имя русурса" value={name || ""} onChange={handleChangeName}/>
         <button className="turnBack" onClick={handleTurnBackProduct}>
          <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
            width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
            preserveAspectRatio="xMidYMid meet">

            <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)">
            <path d="M1295 4154 c-308 -189 -669 -410 -802 -491 -134 -82 -243 -151 -243
            -154 0 -6 1598 -989 1621 -997 5 -2 9 112 9 263 l0 266 713 -4 c789 -3 762 -1
            910 -71 195 -93 345 -273 403 -486 25 -88 25 -280 1 -370 -67 -252 -253 -445
            -512 -531 l-70 -24 -722 -3 -723 -3 0 -469 0 -470 728 0 c596 0 745 3 827 15
            726 110 1285 652 1422 1378 27 145 25 457 -5 605 -148 735 -735 1277 -1477
            1362 -53 6 -378 10 -792 10 l-703 0 0 260 c0 202 -3 260 -12 259 -7 0 -265
            -156 -573 -345z"/>
            </g>
            </svg>
        </button>
        <div className="available-groups">
          <span className="available-groups-title">Доступные ресурсы: </span>
          <SimpleBar 
          style={{ maxWidth: '660px', whiteSpace: 'nowrap'}}
             autoHide={false}>
            <div className="available-groups-items">
            {existsGroups && existsGroups.length > 0 ? (
            existsGroups.map((item) => (
            <button onClick={() => {setName(item)}} className="available-groups-button" key={item}>
              {item}
            </button>
            ))
            ) : (
            <span className="no-available-groups">нет доступных ресурсов</span>
            )}
          </div>
          </SimpleBar>
        </div>
        <div className="modal-buttons-container">
          <button className="create-modal-btn" onClick={handleConnectVista} disabled={loading}>Подключить</button>
        </div>
      </BaseModal>
    ),

    updateVista: (
      <BaseModal title="Изменить ресурс" onClose={onClose} isOpen={true}>
        <input value={updateName || ""} placeholder="Имя ресурса" key="vista-update-name-item" onChange={handleChangeUpdateName}/>
        <input value={updateRef || ""} placeholder="Ссылка на ресурс" key="vista-update-ref-item" onChange={handleChangeUpdateRef}/>
        <button className="create-modal-btn" onClick={handleUpdateVista} disabled={loading}>Изменить</button>
      </BaseModal>
    ), 

    simmilarProducts: (
      <BaseModal title="Создать группу похожих товаров" onClose={onClose} isOpen={true}>
        <input value={name || ""} placeholder="Имя группы" key="simmilar-products-name-item-groups" onChange={handleChangeName}/>
        <input value={searchStr || ""} placeholder="Перечислите ключевые слова через пробел" key="simmilar-products-name-item" onChange={handleChangeSearchStr}/>
        <span className="span-tags">Добавленные теги</span>
          {allTags.length > 0 ? (
            <SimpleBar 
          style={{ maxWidth: '660px', width: '660px', overflow: 'auto'}}
             autoHide={false}>
            <div className="available-groups-items">
            {allTags.map((item) => (
                  <TagAllButtonDelete item={item} handleDeleteAllTag={handleDeleteAllTag} key={item}/>
                ))}
          </div>
          </SimpleBar>
          ): (
            <span className="span-tags-notfound">добавьте теги</span>
          )}
        <span className="span-tags">Доступные теги</span>
        {simTags.length > 0 ? (
          <SimpleBar 
          style={{ maxWidth: '660px', width: '660px', overflow: 'auto'}}
             autoHide={false}>
            <div className="available-groups-items">
            {simTags.map((item) => (
                  <button className="available-groups-items-simmilar-button" key={item} onClick={() => addToName(item)}>{item}</button>
                ))}
          </div>
          </SimpleBar>
        ) : (<span className="span-tags-notfound">нет доступных тегов</span>)}
        <span className="span-tags">Доступные поисковые теги</span>
        {searchSimTags.length > 0 ? (
          <SimpleBar 
          style={{ maxWidth: '660px', width: '660px', overflow: 'auto'}}
             autoHide={false}>
            <div className="available-groups-items">
            {searchSimTags.map((item) => (
                <button className="available-groups-items-simmilar-button" key={item} onClick={() => addToName(item)}>{item}</button>
            ))}
          </div>
          </SimpleBar>
        ) : (<span className="span-tags-notfound">нет доступных тегов</span>) }
        <div className="modal-buttons-container">
          <button className="create-modal-btn" onClick={handleSetExistsSimmilar} disabled={loading}>Подключить существующую</button>
          <button className="create-modal-btn" onClick={handleCreateSimmilar} disabled={loading}>Создать</button>
        </div>
      </BaseModal>
    ),

    existsSimmilar: (
      <BaseModal title="Подключение существующей группы похожих товаров" onClose={onClose} isOpen={true}>
        <input placeholder="Имя группы" value={name || ""} onChange={handleChangeName}/>
        <button className="turnBack" onClick={handleTurnBackProduct}>
          <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
            width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
            preserveAspectRatio="xMidYMid meet">

            <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)">
            <path d="M1295 4154 c-308 -189 -669 -410 -802 -491 -134 -82 -243 -151 -243
            -154 0 -6 1598 -989 1621 -997 5 -2 9 112 9 263 l0 266 713 -4 c789 -3 762 -1
            910 -71 195 -93 345 -273 403 -486 25 -88 25 -280 1 -370 -67 -252 -253 -445
            -512 -531 l-70 -24 -722 -3 -723 -3 0 -469 0 -470 728 0 c596 0 745 3 827 15
            726 110 1285 652 1422 1378 27 145 25 457 -5 605 -148 735 -735 1277 -1477
            1362 -53 6 -378 10 -792 10 l-703 0 0 260 c0 202 -3 260 -12 259 -7 0 -265
            -156 -573 -345z"/>
            </g>
            </svg>
        </button>
        <div className="available-groups">
          <span className="available-groups-title">Доступные группы: </span>
          <SimpleBar 
          style={{ maxWidth: '660px', whiteSpace: 'nowrap'}}
             autoHide={false}>
            <div className="available-groups-items">
            {existsGroups && existsGroups.length > 0 ? (
            existsGroups.map((item) => (
            <button onClick={() => {setSearchStr(item.search_str); setName(item.name)}} className="available-groups-button" key={item.id}>
              {item.name}
            </button>
            ))
            ) : (
            <span className="no-available-groups">нет доступных групп</span>
            )}
          </div>
          </SimpleBar>
        </div>
        <div className="modal-buttons-container">
          <button className="create-modal-btn" onClick={handleConnectSimmilar} disabled={loading}>Подключить</button>
        </div>
      </BaseModal>
    ),

    updateSimmilar: (
      <BaseModal title="Изменение группы похожих товаров" onClose={onClose} isOpen={true}>
        <input value={updateName || ""} placeholder="Имя группы" key="simmilar-products-name-item-groups-update" onChange={handleChangeUpdateName}/>
        <input value={searchUpdateStr || ""} placeholder="Перечислите ключевые слова через пробел" key="simmilar-products-name-item-update" onChange={handleChangeUpdateSearchStr}/>
        <span className="span-tags">Добавленные теги</span>
          {allTags.length > 0 ? (
            <SimpleBar 
          style={{ maxWidth: '660px', width: '660px', overflow: 'auto'}}
             autoHide={false}>
            <div className="available-groups-items">
            {allTags.map((item) => (
                  <TagAllButtonDelete item={item} handleDeleteAllTag={handleDeleteAllTag} key={item}/>
                ))}
          </div>
          </SimpleBar>
          ): (
            <span className="span-tags-notfound">добавьте теги</span>
          )}
        <span className="span-tags">Доступные теги</span>
        {simTags.length > 0 ? (
          <SimpleBar
          style={{ maxWidth: '660px', width: '660px', overflow: 'auto'}}
             autoHide={false}>
            <div className="available-groups-items">
            {simTags.map((item) => (
                  <button className="available-groups-items-simmilar-button" key={item} onClick={() => addToName(item)}>{item}</button>
                ))}
          </div>
          </SimpleBar>
        ) : (<span className="span-tags-notfound">нет доступных тегов</span>)}
        <span className="span-tags">Доступные поисковые теги</span>
        {searchSimTags.length > 0 ? (
          <SimpleBar 
          style={{ maxWidth: '660px', width: '660px', overflow: 'auto'}}
             autoHide={false}>
            <div className="available-groups-items">
            {searchSimTags.map((item) => (
                <button className="available-groups-items-simmilar-button" key={item} onClick={() => addToName(item)}>{item}</button>
            ))}
          </div>
          </SimpleBar>
        ) : (<span className="span-tags-notfound">нет доступных тегов</span>) }
        <button className="create-modal-btn" onClick={handleUpdateSimmilar} disabled={loading}>Изменить</button>
      </BaseModal>
    ),

    shopPage: (
      <BaseModal title="Создание страницы товаров" onClose={onClose} isOpen={true}>
        <input value={name || ""} placeholder="Имя страницы" key="shop-name-item" onChange={handleChangeName}/>
        <button className="create-modal-btn" onClick={handleCreateShopPage} disabled={loading}>Создать</button>
      </BaseModal>
    ),

    newsPage: (
      <BaseModal title="Создание страницы новостей" onClose={onClose} isOpen={true}>
        <input value={name || ""} placeholder="Имя страницы" key="news-name-item" onChange={handleChangeName}/>
        <button className="create-modal-btn" onClick={handleCreateNewsPage} disabled={loading}>Создать</button>
      </BaseModal>
    ),

    createNewsItem: (
      <BaseModal title="Создание блога" onClose={onClose} isOpen={true}>
        <input value={name || ""} placeholder="Имя блога" key="blog-name-item" onChange={handleChangeName}/>
        <input value={adress || ""} key="blog-adress" placeholder="Адрес страницы блога /blog-page" onChange={handleChangeAdress}/>
        <input
          type="date"
          value={date || ""}
          onChange={(e) => setDate(e.target.value)}
        />
        <div className="setImage-contaimer-modal">
              <span>Задайте изображение</span>
              <input type="file" onChange={handleFileChange}/>
        </div>
        <button className="create-modal-btn" onClick={handleCreateBlogPage} disabled={loading}>Создать</button>
      </BaseModal>
    ),

    createCruiseItem: (
      <BaseModal title="Создание круиза" onClose={onClose} isOpen={true}>
        <input value={name || ""} placeholder="Имя круиза" key="blog-name-item" onChange={handleChangeName}/>
        <input value={adress || ""} key="blog-adress" placeholder="Адрес страницы круиза /cruise-page" onChange={handleChangeAdress}/>
        <textarea
            value={text || ""}
            className="popularTaskArea"
            onChange={handleChangeText}
            placeholder="Описание раздела"
            rows={6}
        style={{
          width: "100%",
          resize: "vertical",
          padding: "10px",
          fontSize: "15px",
          borderRadius: "10px",
        }}
            />
        <div className="setImage-contaimer-modal">
              <span>Задайте изображение</span>
              <input type="file" onChange={handleFileChange}/>
        </div>
        <button className="create-modal-btn" onClick={handleCreateCruiseCategory} disabled={loading}>Создать</button>
      </BaseModal>
    ),

    updateNewsItem: (
      <BaseModal title="Создание блога" onClose={onClose} isOpen={true}>
        <input value={updateName || ""} placeholder="Имя блога" key="blog-name-item" onChange={handleChangeUpdateName}/>
        <input value={updateAdress || ""} key="blog-adress" placeholder="Адрес страницы блога /blog-page" onChange={handleChangeUpdateAdress}/>
        <input
          type="date"
          value={updateDate || ""}
          onChange={handleChangeUpdateDate}
        />
        <div className="setImage-contaimer-modal">
              <span>Поменять изображение: </span>
              <a className="href" href={updatedImage}>{updatedImage}</a>
              <input type="file" onChange={handleFileChange}/>
        </div>
        <button className="create-modal-btn" onClick={handleUpdateBlogPage} disabled={loading}>Изменить</button>
      </BaseModal>
    ),

    updateCruisesItem: (
      <BaseModal title="Изменение превью раздела" onClose={onClose} isOpen={true}>
        <input value={updateName || ""} placeholder="Имя блога" key="blog-name-item" onChange={handleChangeUpdateName}/>
        <input value={updateAdress || ""} key="blog-adress" placeholder="Адрес страницы блога /blog-page" onChange={handleChangeUpdateAdress}/>
        <textarea
            value={updateDesc || ""}
            className="popularTaskArea"
            onChange={handleChangeUpdateDesc}
            placeholder="Описание раздела"
            rows={6}
        style={{
          width: "100%",
          resize: "vertical",
          padding: "10px",
          fontSize: "15px",
          borderRadius: "10px",
        }}
            />
        <div className="setImage-contaimer-modal">
              <span>Поменять изображение: </span>
              <a className="href" href={updatedImage}>{updatedImage}</a>
              <input type="file" onChange={handleFileChange}/>
        </div>
        <button className="create-modal-btn" onClick={handleUpdateCruisePage} disabled={loading}>Изменить</button>
      </BaseModal>
    ),

    createProductDesc: (
      <BaseModal title="Создание элемента описания товара" onClose={onClose} isOpen={true}>
        <input value={name || ""} placeholder="Имя описания" key="desc-name-item" onChange={handleChangeName}/>
        <input value={desc || ""} key="desc-desc" placeholder="Пояснение" onChange={handleChangeDesc}/>
        <button className="create-modal-btn" onClick={handleCreateProductDesc} disabled={loading}>Создать</button>
      </BaseModal>
    ),

    setProductVideo: (
      <BaseModal title="Создание видео превью товара" onClose={onClose} isOpen={true}>
        <div className="setImage-contaimer-modal">
              <span>Задайте видео</span>
              <input type="file" onChange={handleFileChange}/>
        </div>
        <button className="create-modal-btn" onClick={handleSetProductVideo} disabled={loading}>Создать</button>
      </BaseModal>
    ),

    updateProductDesc : (
      <BaseModal title="Изменение элемента описания товара" onClose={onClose} isOpen={true}>
        <input value={updateName || ""} placeholder="Имя описания" key="desc-name-item" onChange={handleChangeUpdateName}/>
        <input value={updateDesc || ""} key="desc-desc" placeholder="Пояснение" onChange={handleChangeUpdateDesc}/>
        <button className="create-modal-btn" onClick={handleUpdateProductDesc} disabled={loading}>Изменить</button>
      </BaseModal>
    ),

    regularPage: (
      <BaseModal title="Создание обычной страницы" onClose={onClose} isOpen={true}>
        <input value={name || ""} placeholder="Имя страницы" key="regular-name-item" onChange={handleChangeName}/>
        <button className="create-modal-btn" onClick={handleCreateRegularPage} disabled={loading}>Создать</button>
      </BaseModal>
    ),

    addFooter: (
      <BaseModal title="Создание элемента футера" onClose={onClose} isOpen={true}>
        <input value={name || ""} placeholder="Имя" key="footer-name-item" onChange={handleChangeName}/>
        <input value={adress || ""} key="footer-adress" placeholder="Адрес /my-page" onChange={handleChangeAdress}/>
        <button className="create-modal-btn" onClick={handleFooterCreateItem} disabled={loading}>Создать</button>
      </BaseModal>
    ),

    updateFooter: (
      <BaseModal title="Обновление элемента футера" onClose={onClose} isOpen={true}>
        <input value={updateName || ""} placeholder="Имя" key="footer-name-item-upd" onChange={handleChangeUpdateName}/>
        <input value={updateAdress || ""} key="footer-adress-upd" placeholder="Адрес /my-page" onChange={handleChangeUpdateAdress}/>
        <button className="create-modal-btn" onClick={handleFooterUpdateItem} disabled={loading}>Создать</button>
      </BaseModal>
    ),

    space: (
      <BaseModal title="Создание отступа" onClose={onClose} isOpen={true}>
        <input value={space || ""} placeholder="Отступ" type="number" key="space-space" onChange={handleChangeSpacing}/>
        <button className="create-modal-btn" onClick={handleCreateSpace} disabled={loading}>Создать</button>
      </BaseModal>
    ),

    meta: (
      <BaseModal title="Мета теги" onClose={onClose} isOpen={true}>
        <input value={updateName || ""} placeholder="title" type="text" key="page-title" onChange={handleChangeUpdateName}/>
        <input value={updateDesc || ""} placeholder="description" type="text" key="page-description" onChange={handleChangeUpdateDesc}/>
        <input value={updateRobots || ""} placeholder="robots" type="text" key="page-robots" onChange={handleChangeUpdateRobots}/>
        <input value={updateLdJson || ""} placeholder="ld json string" type="text" key="page-ld-json" onChange={handleChangeUpdateLdJson}/>
        <button className="create-modal-btn" onClick={handleCreateMeta} disabled={loading}>Задать</button>
      </BaseModal>
    ),

    updateProductOrder: (
      <BaseModal title="Порядок элемента" onClose={onClose} isOpen={true}>
        <input value={updateOrderId || ""} placeholder="Порядковый номер" type="number" key="page-title" onChange={handleChangeUpdateOrderId}/>
        <button className="create-modal-btn" onClick={handleUpdateOrderId} disabled={loading}>Изменить</button>
      </BaseModal>
    ),

    leaflet: (
      <BaseModal title="Добавление карты причалов" onClose={onClose} isOpen={true}>
        <input value={name || ""} placeholder="Имя карты" key="map-name" onChange={handleChangeName}/>
        <input value={desc || ""} placeholder="Описание перехода" key="map-desc" onChange={handleChangeDesc}/>
        <input value={buttonInfoRef || ""} placeholder="Имя кнопки для перехода" key="button-map-name" onChange={handleChangeButtonInfoRef}/>
        <input value={ref || ""} placeholder="Ссылка перехода" key="ref-map-name" onChange={handleChangeRef}/>
        <div className="setImage-contaimer-modal">
              <span>Задайте изображение</span>
              <input type="file" onChange={handleFileChange}/>
        </div>
        <button className="create-modal-btn" onClick={handleCreateMap} disabled={loading}>Создать</button>
      </BaseModal>
    ),

    updateLeaflet: (
      <BaseModal title="Обновление блока ссылки в карте" onClose={onClose} isOpen={true}>
        <input value={updateDesc || ""} placeholder="Описание перехода" key="map-desc" onChange={handleChangeUpdateDesc}/>
        <input value={updateLocalItemBtnInfo || ""} placeholder="Имя кнопки для перехода" key="button-map-name" onChange={handleChangeUpdateBtnInfo}/>
        <input value={updateRef || ""} placeholder="Ссылка перехода" key="ref-map-name" onChange={handleChangeUpdateRef}/>
        <div className="setImage-contaimer-modal">
              <span>Поменять изображение: </span>
              <a className="href" href={updatedImage}>{updatedImage}</a>
              <input type="file" onChange={handleFileChange}/>
        </div>
        <button className="create-modal-btn" onClick={handleUpdateMap} disabled={loading}>Изменить</button>
      </BaseModal>
    ),

    calculator: (
      <BaseModal title="Создание калькулятора" onClose={onClose} isOpen={true}>
        <span className="calculator-title">Аренда судна</span>
        <input value={name || ""} placeholder="Имя калькулятора" key="calc-name" onChange={handleChangeName}/>
        <div className="range-cols">
          <div className="range-row">
            <span>
              Низкий сезон
            </span>
            <Range range={lowRange} setRange={setLowRange} disabled={[midRange, highRange]}/>
            <span className="calcilator-season-title">Утреннее время</span>
            <input type="time" value={lowDateMorningBefore || ""} onChange={handleChangeLowDateMorningBefore} placeholder="10:00"/>
            <input type="time" value={lowDateMorningAfter || ""} onChange={handleChangeLowDateMorningAfter} placeholder="12:00"/>
            <input type="number" value={lowMinMorningHours || ""} onChange={handleChangeLowMinMorningHours} placeholder="Минимальное время аренды в часах"/>
            <input type="number" value={lowHourMorningPriceMn || ""} onChange={handleChangeLowHourMorningPriceMn} placeholder="Стоимость за час - пн"/>
            <input type="number" value={lowHourMorningPriceTs || ""} onChange={handleChangeLowHourMorningPriceTs} placeholder="Стоимость за час - вт"/>
            <input type="number" value={lowHourMorningPriceWs || ""} onChange={handleChangeLowHourMorningPriceWs} placeholder="Стоимость за час - ср"/>
            <input type="number" value={lowHourMorningPriceTu || ""} onChange={handleChangeLowHourMorningPriceTu} placeholder="Стоимость за час - чт"/>
            <input type="number" value={lowHourMorningPriceFr || ""} onChange={handleChangeLowHourMorningPriceFr} placeholder="Стоимость за час - пт"/>
            <input type="number" value={lowHourMorningPriceSn || ""} onChange={handleChangeLowHourMorningPriceSn} placeholder="Стоимость за час - сб"/>
            <input type="number" value={lowHourMorningPriceSt || ""} onChange={handleChangeLowHourMorningPriceSt} placeholder="Стоимость за час - вс"/>
            <span className="calcilator-season-title">Дневное время</span>
            <input type="time" value={lowDateEvenBefore || ""} onChange={handleChangeLowDateEvenBefore} placeholder="12:00"/>
            <input type="time" value={lowDateEvenAfter || ""} onChange={handleChangeLowDateEvenAfter} placeholder="17:00"/>
            <input type="number" value={lowMinEvenHours || ""} onChange={handleChangeLowMinEvenHours} placeholder="Минимальное время аренды"/>
            <input type="number" value={lowHourEvenPriceMn || ""} onChange={handleChangeLowHourEvenPriceMn} placeholder="Стоимость за час - пн"/>
            <input type="number" value={lowHourEvenPriceTs || ""} onChange={handleChangeLowHourEvenPriceTs} placeholder="Стоимость за час - вт"/>
            <input type="number" value={lowHourEvenPriceWs || ""} onChange={handleChangeLowHourEvenPriceWs} placeholder="Стоимость за час - ср"/>
            <input type="number" value={lowHourEvenPriceTu || ""} onChange={handleChangeLowHourEvenPriceTu} placeholder="Стоимость за час - чт"/>
            <input type="number" value={lowHourEvenPriceFr || ""} onChange={handleChangeLowHourEvenPriceFr} placeholder="Стоимость за час - пт"/>
            <input type="number" value={lowHourEvenPriceSn || ""} onChange={handleChangeLowHourEvenPriceSn} placeholder="Стоимость за час - сб"/>
            <input type="number" value={lowHourEvenPriceSt || ""} onChange={handleChangeLowHourEvenPriceSt} placeholder="Стоимость за час - вс"/>
            <span className="calcilator-season-title">Вечернее время</span>
            <input type="time" value={lowDateNightBefore || ""} onChange={handleChangeLowDateNightBefore} placeholder="17:00"/>
            <input type="time" value={lowDateNightAfter || ""} onChange={handleChangeLowDateNightAfter} placeholder="23:00"/>
            <input type="number" value={lowMinNightHours || ""} onChange={handleChangeLowMinNightHours} placeholder="Минимальное время аренды"/>
            <input type="number" value={lowHourNightPriceMn || ""} onChange={handleChangeLowHourNightPriceMn} placeholder="Стоимость за час - пн"/>
            <input type="number" value={lowHourNightPriceTs || ""} onChange={handleChangeLowHourNightPriceTs} placeholder="Стоимость за час - вт"/>
            <input type="number" value={lowHourNightPriceWs || ""} onChange={handleChangeLowHourNightPriceWs} placeholder="Стоимость за час - ср"/>
            <input type="number" value={lowHourNightPriceTu || ""} onChange={handleChangeLowHourNightPriceTu} placeholder="Стоимость за час - чт"/>
            <input type="number" value={lowHourNightPriceFr || ""} onChange={handleChangeLowHourNightPriceFr} placeholder="Стоимость за час - пт"/>
            <input type="number" value={lowHourNightPriceSn || ""} onChange={handleChangeLowHourNightPriceSn} placeholder="Стоимость за час - сб"/>
            <input type="number" value={lowHourNightPriceSt || ""} onChange={handleChangeLowHourNightPriceSt} placeholder="Стоимость за час - вс"/>
          </div>
          <div className="range-row">
            <span>
              Средний сезон              
            </span>
            <Range range={midRange} setRange={setMidRange} disabled={[ lowRange, highRange]}/>
            <span className="calcilator-season-title">Утреннее время</span>
            <input type="time" value={midDateMorningBefore || ""} onChange={handleChangeMidDateMorningBefore} placeholder="10:00"/>
            <input type="time" value={midDateMorningAfter || ""} onChange={handleChangeMidDateMorningAfter} placeholder="12:00"/>
            <input type="number" value={midMinMorningHours || ""} onChange={handleChangeMidMinMorningHours} placeholder="Минимальное время аренды в часах"/>
            <input type="number" value={midHourMorningPriceMn || ""} onChange={handleChangeMidHourMorningPriceMn} placeholder="Стоимость за час - пн"/>
            <input type="number" value={midHourMorningPriceTs || ""} onChange={handleChangeMidHourMorningPriceTs} placeholder="Стоимость за час - вт"/>
            <input type="number" value={midHourMorningPriceWs || ""} onChange={handleChangeMidHourMorningPriceWs} placeholder="Стоимость за час - ср"/>
            <input type="number" value={midHourMorningPriceTu || ""} onChange={handleChangeMidHourMorningPriceTu} placeholder="Стоимость за час - чт"/>
            <input type="number" value={midHourMorningPriceFr || ""} onChange={handleChangeMidHourMorningPriceFr} placeholder="Стоимость за час - пт"/>
            <input type="number" value={midHourMorningPriceSn || ""} onChange={handleChangeMidHourMorningPriceSn} placeholder="Стоимость за час - сб"/>
            <input type="number" value={midHourMorningPriceSt || ""} onChange={handleChangeMidHourMorningPriceSt} placeholder="Стоимость за час - вс"/>
            <span className="calcilator-season-title">Дневное время</span>
            <input type="time" value={midDateEvenBefore || ""} onChange={handleChangeMidDateEvenBefore} placeholder="12:00"/>
            <input type="time" value={midDateEvenAfter || ""} onChange={handleChangeMidDateEvenAfter} placeholder="17:00"/>
            <input type="number" value={midMinEvenHours || ""} onChange={handleChangeMidMinEvenHours} placeholder="Минимальное время аренды"/>
            <input type="number" value={midHourEvenPriceMn || ""} onChange={handleChangeMidHourEvenPriceMn} placeholder="Стоимость за час - пн"/>
            <input type="number" value={midHourEvenPriceTs || ""} onChange={handleChangeMidHourEvenPriceTs} placeholder="Стоимость за час - вт"/>
            <input type="number" value={midHourEvenPriceWs || ""} onChange={handleChangeMidHourEvenPriceWs} placeholder="Стоимость за час - ср"/>
            <input type="number" value={midHourEvenPriceTu || ""} onChange={handleChangeMidHourEvenPriceTu} placeholder="Стоимость за час - чт"/>
            <input type="number" value={midHourEvenPriceFr || ""} onChange={handleChangeMidHourEvenPriceFr} placeholder="Стоимость за час - пт"/>
            <input type="number" value={midHourEvenPriceSn || ""} onChange={handleChangeMidHourEvenPriceSn} placeholder="Стоимость за час - сб"/>
            <input type="number" value={midHourEvenPriceSt || ""} onChange={handleChangeMidHourEvenPriceSt} placeholder="Стоимость за час - вс"/>
            <span className="calcilator-season-title">Вечернее время</span>
            <input type="time" value={midDateNightBefore || ""} onChange={handleChangeMidDateNightBefore} placeholder="17:00"/>
            <input type="time" value={midDateNightAfter || ""} onChange={handleChangeMidDateNightAfter} placeholder="23:00"/>
            <input type="number" value={midMinNightHours || ""} onChange={handleChangeMidMinNightHours} placeholder="Минимальное время аренды"/>
            <input type="number" value={midHourNightPriceMn || ""} onChange={handleChangeMidHourNightPriceMn} placeholder="Стоимость за час - пн"/>
            <input type="number" value={midHourNightPriceTs || ""} onChange={handleChangeMidHourNightPriceTs} placeholder="Стоимость за час - вт"/>
            <input type="number" value={midHourNightPriceWs || ""} onChange={handleChangeMidHourNightPriceWs} placeholder="Стоимость за час - ср"/>
            <input type="number" value={midHourNightPriceTu || ""} onChange={handleChangeMidHourNightPriceTu} placeholder="Стоимость за час - чт"/>
            <input type="number" value={midHourNightPriceFr || ""} onChange={handleChangeMidHourNightPriceFr} placeholder="Стоимость за час - пт"/>
            <input type="number" value={midHourNightPriceSn || ""} onChange={handleChangeMidHourNightPriceSn} placeholder="Стоимость за час - сб"/>
            <input type="number" value={midHourNightPriceSt || ""} onChange={handleChangeMidHourNightPriceSt} placeholder="Стоимость за час - вс"/>
          </div>
          <div className="range-row">
            <span>
              Высокий сезон
            </span>
            <Range range={highRange} setRange={setHighRange} disabled={[midRange, lowRange]}/>
            <span className="calcilator-season-title">Утреннее время</span>
            <input type="time" value={highDateMorningBefore || ""} onChange={handleChangeHighDateMorningBefore} placeholder="10:00"/>
            <input type="time" value={highDateMorningAfter || ""} onChange={handleChangeHighDateMorningAfter} placeholder="12:00"/>
            <input type="number" value={highMinMorningHours || ""} onChange={handleChangeHighMinMorningHours} placeholder="Минимальное время аренды в часах"/>
            <input type="number" value={highHourMorningPriceMn || ""} onChange={handleChangeHighHourMorningPriceMn} placeholder="Стоимость за час - пн"/>
            <input type="number" value={highHourMorningPriceTs || ""} onChange={handleChangeHighHourMorningPriceTs} placeholder="Стоимость за час - вт"/>
            <input type="number" value={highHourMorningPriceWs || ""} onChange={handleChangeHighHourMorningPriceWs} placeholder="Стоимость за час - ср"/>
            <input type="number" value={highHourMorningPriceTu || ""} onChange={handleChangeHighHourMorningPriceTu} placeholder="Стоимость за час - чт"/>
            <input type="number" value={highHourMorningPriceFr || ""} onChange={handleChangeHighHourMorningPriceFr} placeholder="Стоимость за час - пт"/>
            <input type="number" value={highHourMorningPriceSn || ""} onChange={handleChangeHighHourMorningPriceSn} placeholder="Стоимость за час - сб"/>
            <input type="number" value={highHourMorningPriceSt || ""} onChange={handleChangeHighHourMorningPriceSt} placeholder="Стоимость за час - вс"/>
            <span className="calcilator-season-title">Дневное время</span>
            <input type="time" value={highDateEvenBefore || ""} onChange={handleChangeHighDateEvenBefore} placeholder="12:00"/>
            <input type="time" value={highDateEvenAfter || ""} onChange={handleChangeHighDateEvenAfter} placeholder="17:00"/>
            <input type="number" value={highMinEvenHours || ""} onChange={handleChangeHighMinEvenHours} placeholder="Минимальное время аренды"/>
            <input type="number" value={highHourEvenPriceMn || ""} onChange={handleChangeHighHourEvenPriceMn} placeholder="Стоимость за час - пн"/>
            <input type="number" value={highHourEvenPriceTs || ""} onChange={handleChangeHighHourEvenPriceTs} placeholder="Стоимость за час - вт"/>
            <input type="number" value={highHourEvenPriceWs || ""} onChange={handleChangeHighHourEvenPriceWs} placeholder="Стоимость за час - ср"/>
            <input type="number" value={highHourEvenPriceTu || ""} onChange={handleChangeHighHourEvenPriceTu} placeholder="Стоимость за час - чт"/>
            <input type="number" value={highHourEvenPriceFr || ""} onChange={handleChangeHighHourEvenPriceFr} placeholder="Стоимость за час - пт"/>
            <input type="number" value={highHourEvenPriceSn || ""} onChange={handleChangeHighHourEvenPriceSn} placeholder="Стоимость за час - сб"/>
            <input type="number" value={highHourEvenPriceSt || ""} onChange={handleChangeHighHourEvenPriceSt} placeholder="Стоимость за час - вс"/>
            <span className="calcilator-season-title">Вечернее время</span>
            <input type="time" value={highDateNightBefore || ""} onChange={handleChangeHighDateNightBefore} placeholder="17:00"/>
            <input type="time" value={highDateNightAfter || ""} onChange={handleChangeHighDateNightAfter} placeholder="23:00"/>
            <input type="number" value={highMinNightHours || ""} onChange={handleChangeHighMinNightHours} placeholder="Минимальное время аренды"/>
            <input type="number" value={highHourNightPriceMn || ""} onChange={handleChangeHighHourNightPriceMn} placeholder="Стоимость за час - пн"/>
            <input type="number" value={highHourNightPriceTs || ""} onChange={handleChangeHighHourNightPriceTs} placeholder="Стоимость за час - вт"/>
            <input type="number" value={highHourNightPriceWs || ""} onChange={handleChangeHighHourNightPriceWs} placeholder="Стоимость за час - ср"/>
            <input type="number" value={highHourNightPriceTu || ""} onChange={handleChangeHighHourNightPriceTu} placeholder="Стоимость за час - чт"/>
            <input type="number" value={highHourNightPriceFr || ""} onChange={handleChangeHighHourNightPriceFr} placeholder="Стоимость за час - пт"/>
            <input type="number" value={highHourNightPriceSn || ""} onChange={handleChangeHighHourNightPriceSn} placeholder="Стоимость за час - сб"/>
            <input type="number" value={highHourNightPriceSt || ""} onChange={handleChangeHighHourNightPriceSt} placeholder="Стоимость за час - вс"/>
          </div>
        </div>
        <span className="calculator-title">Уборка судна</span>
        <input type="number" value={cleaningPrice || ""} onChange={handleChangeCleaningPrice} placeholder="Стоимость уборки"/>
        <span className="calculator-title">Кейтеринг</span>
        <button className="create-modal-btn" onClick={handleCreateMenu}>Добавить меню</button>
        <span className="available-menu-title">Доступные меню</span>
        <SimpleBar 
          style={{ maxWidth: '660px', whiteSpace: 'nowrap'}}
             autoHide={false}>
            <div className="available-menu-items">
            {existsMenus && existsMenus.length > 0 ? (
            existsMenus.map((item, index) => (
            <button onClick={() => {handleAddSelectedMenu(index, item.id);}} className={`available-menus-button ${selectedMenus.includes(item.id) ? "selected" : ""}`} style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.5)), url(${item.image})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}>
              <span className="menu-group-name">
                {item.name}
              </span>
            </button>
            ))
            ) : (
            <span className="no-available-groups">нет доступных меню</span>
            )}
          </div>
          </SimpleBar>
          <span className="calculator-title">Фуршет</span>
        <button className="create-modal-btn" onClick={handleCreateFurMenu}>Добавить меню</button>
        <span className="available-menu-title">Доступные меню</span>
        <SimpleBar 
          style={{ maxWidth: '660px', whiteSpace: 'nowrap'}}
             autoHide={false}>
            <div className="available-menu-items">
            {existsFurMenus && existsFurMenus.length > 0 ? (
            existsFurMenus.map((item, index) => (
            <button onClick={() => {handleAddSelectedFurMenu(index, item.id);}} className={`available-menus-button ${selectedFurMenus.includes(item.id) ? "selected" : ""}`} style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.5)), url(${item.image})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}>
              <span className="menu-group-name">
                {item.name}
              </span>
            </button>
            ))
            ) : (
            <span className="no-available-groups">нет доступных меню</span>
            )}
          </div>
          </SimpleBar>
          <span className="calculator-title">Диджей</span>
          <input type="number" value={djPrice || ""} onChange={handleChangeDjPrice} placeholder="Стоимость за час"/>
          <span className="calculator-title">Ведущий на свадьбу или корпоратив</span>
          <input type="number" value={weddingPrice || ""} onChange={handleChangeWeddingPrice} placeholder="Стоимость за час"/>
          <span className="calculator-title">Гид экскурсовод</span>
          <input type="number" value={guidePrice || ""} onChange={handleChangeGuidePrice} placeholder="Стоимость за час"/>
          <span className="calculator-title">Оформление флориста</span>
          <input type="number" value={flowerPrice || ""} onChange={handleChangeFlowerPrice} placeholder="Минимальная сумма от"/>
          <span className="calculator-title">Оформление шарами</span>
          <input type="number" value={baloonPrice || ""} onChange={handleChangeBaloonPrice} placeholder="Минимальная сумма от"/>
        <button className="create-modal-btn" onClick={handleCreateCalculator} disabled={loading}>Создать</button>
      </BaseModal>
    ),

    createMenu:
    (
      <BaseModal title="Добавление меню" onClose={onClose} isOpen={true}>
        <button className="turnBack" onClick={handleTurnBackProduct}>
          <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
            width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
            preserveAspectRatio="xMidYMid meet">

            <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)">
            <path d="M1295 4154 c-308 -189 -669 -410 -802 -491 -134 -82 -243 -151 -243
            -154 0 -6 1598 -989 1621 -997 5 -2 9 112 9 263 l0 266 713 -4 c789 -3 762 -1
            910 -71 195 -93 345 -273 403 -486 25 -88 25 -280 1 -370 -67 -252 -253 -445
            -512 -531 l-70 -24 -722 -3 -723 -3 0 -469 0 -470 728 0 c596 0 745 3 827 15
            726 110 1285 652 1422 1378 27 145 25 457 -5 605 -148 735 -735 1277 -1477
            1362 -53 6 -378 10 -792 10 l-703 0 0 260 c0 202 -3 260 -12 259 -7 0 -265
            -156 -573 -345z"/>
            </g>
            </svg>
        </button>
        <SimpleBar className="menu-scroll" style={{ maxHeight: 400 }}>
          <div className="available-menu-options">
            {createdOptions && createdOptions.length > 0 ? (
            createdOptions.map((item, index) => (
            <div className="menu-modal-option" key={index}>
              <div className="inner-menu-modal-option">
                <span>
                  {item.name}
                </span>
                <span> — </span>
                <span>
                  {item.price}₽
                </span>
              </div>
              <button className="delete-modal-menu-option" onClick={() => {handleDeleteMenuOption(index)}}>
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
            </div>
            ))
            ) : (
            <span className="no-available-groups">заполните меню</span>
            )}
          </div>
        </SimpleBar>
        <input value={modalMenuOption || ""} placeholder="Имя пункта меню" key="map-name" onChange={handleChangeModalMenuOption}/>
        <input value={modalMenuPrice || ""} placeholder="Цена" key="map-desc" onChange={handleChangeModalMenuPrice}/>
        <button className="create-modal-btn" onClick={addCreatedOption}>Добавить</button>
        <input value={menuName || ""} placeholder="Название меню" key="menu-name" onChange={handleChangeMenuName}/>
        <input value={minMenuPrice || ""} placeholder="Минимальная цена заказа" key="menu-price" onChange={handleChangeMinMenuPrice}/>
        <div className="setImage-contaimer-modal">
            <span>Задайте изображение</span>
            <input type="file" onChange={handleFileChange}/>
        </div>
        <button className="create-modal-btn" onClick={handleAddMenu} disabled={loading}>Создать</button>
      </BaseModal>
    ),

    createFurMenu:
    (
      <BaseModal title="Добавление меню фуршета" onClose={onClose} isOpen={true}>
        <button className="turnBack" onClick={handleTurnBackProduct}>
          <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
            width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
            preserveAspectRatio="xMidYMid meet">

            <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)">
            <path d="M1295 4154 c-308 -189 -669 -410 -802 -491 -134 -82 -243 -151 -243
            -154 0 -6 1598 -989 1621 -997 5 -2 9 112 9 263 l0 266 713 -4 c789 -3 762 -1
            910 -71 195 -93 345 -273 403 -486 25 -88 25 -280 1 -370 -67 -252 -253 -445
            -512 -531 l-70 -24 -722 -3 -723 -3 0 -469 0 -470 728 0 c596 0 745 3 827 15
            726 110 1285 652 1422 1378 27 145 25 457 -5 605 -148 735 -735 1277 -1477
            1362 -53 6 -378 10 -792 10 l-703 0 0 260 c0 202 -3 260 -12 259 -7 0 -265
            -156 -573 -345z"/>
            </g>
            </svg>
        </button>
        <SimpleBar className="menu-scroll" style={{ maxHeight: 400 }}>
          <div className="available-menu-options">
            {createdOptions && createdOptions.length > 0 ? (
            createdOptions.map((item, index) => (
            <div className="menu-modal-option" key={index}>
              <div className="inner-menu-modal-option">
                <span>
                  {item.name}
                </span>
                <span> — </span>
                <span>
                  {item.price}₽
                </span>
              </div>
              <button className="delete-modal-menu-option" onClick={() => {handleDeleteMenuOption(index)}}>
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
            </div>
            ))
            ) : (
            <span className="no-available-groups">заполните меню</span>
            )}
          </div>
        </SimpleBar>
        <input value={modalMenuOption || ""} placeholder="Имя пункта меню" key="map-name" onChange={handleChangeModalMenuOption}/>
        <input value={modalMenuPrice || ""} placeholder="Цена" key="map-desc" onChange={handleChangeModalMenuPrice}/>
        <button className="create-modal-btn" onClick={addCreatedOption}>Добавить</button>
        <input value={menuName || ""} placeholder="Название меню" key="menu-name" onChange={handleChangeMenuName}/>
        <input value={minMenuPrice || ""} placeholder="Минимальная цена заказа" key="menu-price" onChange={handleChangeMinMenuPrice}/>
        <div className="setImage-contaimer-modal">
            <span>Задайте изображение</span>
            <input type="file" onChange={handleFileChange}/>
        </div>
        <button className="create-modal-btn" onClick={handleAddMenuFur} disabled={loading}>Создать</button>
      </BaseModal>
    )
  };

  return (
    <>
      {modals[type] || null}
      <AuthForm visible={visibleAuth} setVisible={setVisibleAuth}/>
    </>
  );
}