// import "./styles/ShopPage.css"
import React, { useEffect, useState, useRef } from "react";
import { useContext } from "react";
import { ItemsContext } from "../components/header/contexts/ItemsContext.jsx";
import ProductsGrid from "../components/productsGrid/ProductsGrid.jsx";
import ReactSlider from 'react-slider';
import { useLocation } from "react-router-dom";
import { useNavigate, Link } from "react-router-dom";
import { BASE_URL } from '../config';
import LoadingGifPage from "../components/LoadingGifPage/LoadingGifPage.jsx";
import { useSearchContext } from "../components/SearchContext.jsx";
import { Helmet } from "react-helmet-async";
import SchemaWebPage from "../components/seo/SchemaWebPage.jsx";

export default function SearchPage() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const { productsIds, setProductsIds } = useSearchContext();
  const [selectedFilters, setSelectedFilters] = useState([]);
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
  const [tempLocalMaxPrice, setTempLocalMaxPrice] = useState(0);
  const [tempLocalMinPrice, setTempLocalMinPrice] = useState(0);

  const { items } = useContext(ItemsContext);
  const [localMaxPrice, setLocalMaxPrice] = useState(0);
  const [localMinPrice, setLocalMinPrice] = useState(0);
  const [filterToilets, setFilterToilets] = useState([]);
  const [filterCapacities, setFilterCapacities] = useState([]);
  const [maxSlider, setMaxSlider] = useState(0);
  const [minSlider, setMinSlider] = useState(0);
  const [products, setProducts] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [innerLoadingPage, setInnerLoadingPage] = useState(true);
  const [pageComponents, setPageComponents] = useState([]);

  const [ids, setIds] = useState([]);

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
                           localStorage.setItem('page', 'searchPage');
                         }, []);

  useEffect(() => {
     const fetchMain = async () => {
     setLoadingPage(true);
     setInnerLoadingPage(true);
  try {
       const res = await fetch(`${BASE_URL}/get-products-with-ids-all`,
         {
             method: "POST",
             headers: {
             "Content-Type": "application/json"
             },
             body: JSON.stringify({
             ids: productsIds
             })
         }
       );
 
       if (res.status === 200) {
                  const data = await res.json();
                  setLocalMaxPrice(data.content.filters.max_price);
                  setMaxSlider(data.content.filters.max_price);
                  setTempLocalMaxPrice(data.content.filters.max_price);
                  setLocalMinPrice(data.content.filters.min_price);
                  setMinSlider(data.content.filters.min_price);
                  setTempLocalMinPrice(data.content.filters.min_price);
                  setFilterToilets(data.content.filters.toilets);
                  setFilterCapacities(data.content.filters.capacities);
                  setLoadingPage(false);
                  setProducts(data.content.products);
                  setIds(productsIds.slice(data.content.products.length));
                  console.log(productsIds.slice(data.content.products.length));
                }
          } catch (err) {
              }
     finally{
      setLoadingPage(false);
      setInnerLoadingPage(false);
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
   }, [location.search]);

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
            setTempLocalMinPrice(minSlider);
            setLocalMaxPrice(maxSlider);
            setTempLocalMaxPrice(maxSlider);
          }; {
          }}} className={currentPriceFilter === 0 ? "active-btn-filter" : ""}>
            Все
          </button>
          <button onClick={() => {{
            setCurrentPriceFilter(1);
            setLocalMinPrice(minSlider);
            setTempLocalMinPrice(minSlider);
            setLocalMaxPrice(firstPrice);
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
    setMaxSlider(prev => Math.max(prev, newItem.price));

    setLocalMinPrice(prev => Math.min(prev, newItem.price));
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

  return (
    <>
    <Helmet>
      <title>Поиск</title>
      <meta
        name="description"
        content="Поиск яхт, катеров и теплоходов в каталоге Vip Boat — фильтры по вместимости, цене и удобствам."
      />
      <link rel="canonical" href="https://vip-boat.ru/search" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="Поиск — Vip Boat" />
      <meta property="og:url" content="https://vip-boat.ru/search" />
      <meta property="og:site_name" content="Vip Boat" />
      <meta property="og:locale" content="ru_RU" />
      <meta property="og:description" content="Поиск яхт, катеров и теплоходов в каталоге Vip Boat — фильтры по вместимости, цене и удобствам." />
      <meta property="og:image" content="https://storage.yandexcloud.net/vip-boat-images/аренда-яхты-спб2.jpg" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Поиск — Vip Boat" />
      <meta name="twitter:description" content="Поиск яхт, катеров и теплоходов в каталоге Vip Boat — фильтры по вместимости, цене и удобствам." />
      <meta name="twitter:image" content="https://storage.yandexcloud.net/vip-boat-images/аренда-яхты-спб2.jpg" />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": "https://vip-boat.ru/search#webpage",
              "url": "https://vip-boat.ru/search",
              "name": "Поиск судов — Vip Boat",
              "description": "Страница поиска и подбора яхт и катеров в Санкт-Петербурге.",
              "inLanguage": "ru-RU",
              "isPartOf": { "@id": "https://vip-boat.ru/#website" }
            },
            {
              "@type": "BreadcrumbList",
              "@id": "https://vip-boat.ru/search#breadcrumb",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Главная",
                  "item": "https://vip-boat.ru/"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Поиск",
                  "item": "https://vip-boat.ru/search"
                }
              ]
            }
          ]
        })}
      </script>
    </Helmet>
    <SchemaWebPage
      component="section"
      className="shopPage-section"
      itemType="https://schema.org/SearchResultsPage"
      path="/search"
      name="Поиск судов — Vip Boat"
      description="Страница поиска и подбора яхт и катеров в Санкт-Петербурге."
    >
      {loadingPage ? (
        <LoadingGifPage loading={true}/>
      ) : (
        <>
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
                    {query}
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
                        {query}
                    </span>
                </div>
            </div>
            <div className="title-container-buttons">
                               {items.slice(0, 3).map((itemObj, index) => (
                                <>
                                {checkPath(itemObj.api_adress) ? (
                                  <Link to={itemObj.api_adress} key={index} className={`title-container-real-buttons`}>
                                    <span className="title-container-buttons-title">{itemObj.name}</span>
                                    <div className={`underLine ${itemObj.name === query ? 'active-line' : ''}`}></div>
                                    <span className="underline-amount">{itemObj.amount + " Товаров"}</span>
                                  </Link>
                                ) : (
                                  <a href={itemObj.api_adress} className={`title-container-real-buttons`} target="_blank" rel="noopener noreferrer">
                                    <span className="title-container-buttons-title">{itemObj.name}</span>
                                    <div className={`underLine ${itemObj.name === query ? 'active-line' : ''}`}></div>
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
                                  <Link to={itemObj.api_adress} key={index} className={`title-container-real-buttons`}>
                                    <span className="title-container-buttons-title">{itemObj.name}</span>
                                    <div className={`underLine`}></div>
                                    <span className="underline-amount">{itemObj.amount + " Товаров"}</span>
                                  </Link>
                                ) : (
                                  <a href={itemObj.api_adress} className={`title-container-real-buttons`} target="_blank" rel="noopener noreferrer">
                                    <span className="title-container-buttons-title">{itemObj.name}</span>
                                    <div className={`underLine`}></div>
                                    <span className="underline-amount">{itemObj.amount + " Товаров"}</span>
                                  </a>
                                )}
                                </>
                            ))}
                        </div>
        </div>
        <div className="main-container">
            <div className="filters">
              {minSlider === maxSlider ? (
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
                        <span>{query}</span>
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
                <div className="main-page-container">
                  {innerLoadingPage ? (
                    <LoadingGifPage loading={true}/>
                  ) : (
                      <ProductsGrid gridCols={gridCols} show_admin_btns={false} products={products}
                  onload={true}
                  toilet_tags={toiletTags} 
                  capacity_tags={capacityTags} 
                  other_tags={otherFilters}
                  max_price={localMaxPrice} 
                  min_price={localMinPrice}
                  ids={ids}
                  searchPage={true}
                  show_other_admin_btns={false}/>
                  )}
                </div>
            </div>
        </div>
        <div className={`hidden-filters ${openHiddenFilter ? "open" : ""}`}>
          <button 
                    className="close-btn" 
                    onClick={() => setOpenHiddenFilter(false)}
                  >
                    ✕
                  </button>
          <div className="hidden-filters-container">
            {minSlider === maxSlider ? (
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
        </>
      )}
    </SchemaWebPage>
    </>
  );
}