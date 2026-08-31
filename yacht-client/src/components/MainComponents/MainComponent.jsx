import React, { useEffect, useState, useRef, useContext } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import {Autoplay, Navigation, Pagination, Thumbs } from 'swiper/modules';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";

import Vista from "../vista/Vista.jsx";
import ProductsGrid from "../productsGrid/ProductsGrid.jsx";
import QuillRedactor from "../redactor/QuillRedactor.jsx";
import ParseDelta from "../redactor/ParseDelta.jsx";
import Toast from "../adminMessage/adminMessage.jsx";
import Category from "../category/Category.jsx";
import PopularTasks from "../popularTasks/PopularTasks.jsx";
import Advertisement from "../advertisement/Advertisement.jsx";
import Menu from "../menu/Menu.jsx";
import RegularReviews from "../regularReviews/RegularReviews.jsx";
import ReviewsInput from "../regularReviews/ReviewsInput.jsx";
import ReviewsYa from "../reviewsYa/ReviewsYa.jsx";
import SimmilarProducts from "../simmilarProducts/SimmilarProducts.jsx";
import Leaflet from "../leaflet/Leaflet.jsx";

import LoadingGif from "../loadingGif/LoadingGif.jsx";
import { ItemsContext } from "../header/contexts/ItemsContext.jsx";
import { YandexReviewsContext } from "../reviewsYa/contexts/YandexReviewsContext.jsx";
const ModalManager = lazy(() => import("../modalManager/ModalManager.jsx"));
import ComponentTemplate from "../componentTemplate/componentTemplate.jsx";
import Space from '../space/Space.jsx';
import { BASE_URL } from '../../config';
import AuthForm from "../AuthForm/AuthForm.jsx";
import LoadingGifPage from '../LoadingGifPage/LoadingGifPage.jsx';
import { div } from 'framer-motion/client';

export default function MainComponent({pageComponents, setPageComponents, pageId, pages, setPages, noAddition=false, redactorId=0})
{
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

  const [visibleAuth, setVisibleAuth] = useState(false);

  const { items, setItems } = useContext(ItemsContext);
  const { yaReviews, setYaReviews } = useContext(YandexReviewsContext);
  const [toastMessage, setToastMessage] = useState("");
  const [templateType, setTemplateType] = useState("");
  const [statusCode, setStatusCode] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openTemplates, setOpenTemplates] = useState(false);
  const [handlerType, setHandlerType] = useState("");
  const [componentName, setComponentName] = useState("");
  const [productOrderId, setProductOrderId] = useState(0);

  const [first, setFirst] = useState(false);
  const [itemOrderId, setItemOrderId] = useState(0);
  const [itemCapacity, setItemCapacity] = useState(0);
  const [itemDesc, setItemDesc] = useState("");
  const [itemDiscount, setItemDiscount] = useState(0);
  const [itemImages, setItemImages] = useState([]);
  const [itemPrice, setItemPrice] = useState(0);
  const [itemRating, setItemRating] = useState(0);
  const [itemTags, setItemTags] = useState([]);
  const [itemDate, setItemDate] = useState("");
  const [itemSearchTags, setItemSearchTags] = useState([]);

  const [itemName, setItemName] = useState("");
  const [itemId, setItemId] = useState(null);
  const [itemCols, setItemCols] = useState(null);
  const [itemDelta, setItemDelta] = useState("");
  const [itemAdress, setItemAdress] = useState(null);
  const [itemImage, setItemImage] = useState(null);
  const [itemGroupId, setItemGroupId] = useState(null);
  const [itemAmount, setItemAmount] = useState(null);
  const [itemText, setItemText] = useState("");
  const [itemRef, setItemRef] = useState("");
  const [itemButtonRef, setItemButtonInfoRef] = useState("");
  const [itemIcon, setItemIcon] = useState("");
  const [itemSearchStr, setItemSearchStr] = useState("");
  const [itemToilet, setItemToilet] = useState("");
  const [itemButtonInfo, setItemButtonInfo] = useState("");

  const [itemPageId, setItemPageId] = useState(0);
  const [itemProductPageId, setItemProductPageId] = useState(0);
  const [itemReviewsId, setItemsReviewsId] = useState(0);
  const [itemPdfRef, setItemPdfRef] = useState("");

  const [loading, setLoading] = useState(false);

  const componentMap = {
  advertisement: Advertisement,
  category: Category,
  popularTasks: PopularTasks,
  productsGrid: ProductsGrid,
  redactor: isAdmin ? QuillRedactor : ParseDelta,
  regularReviews: RegularReviews,
  reviewsYa: ReviewsYa,
  simmilarProducts: SimmilarProducts,
  vista: Vista
};

const handlers = {
  addComponentWithShift: (newComponent) => { 
    setPageComponents(prev => prev
      .map(comp => comp.order_id >= newComponent.order_id
        ? { ...comp, order_id: comp.order_id + 1 }
        : comp
      )
      .concat({ ...newComponent })
      .sort((a, b) => a.order_id - b.order_id)
    ); 
  },

  addItemToComponentContent: ({ group_id, newItem }) => {
  setPageComponents(prev => {

    return prev.map(comp => {
      if (comp.group_id === group_id && comp.name === "advertisement") {
        const oldContent = Array.isArray(comp.component_content)
          ? [...comp.component_content]
          : [];

        const updated = [...oldContent, newItem];

        return {
          ...comp,
          component_content: updated,
        };
      }
      return comp;
    });
  });
},

  addItemToYaReviews: ({item}) => {
    setYaReviews(prev => [...prev, item]);
  },

  addItemToComponentContentPopular: ({ group_id, newItem }) => {
    setPageComponents(prev => prev.map(comp => {
    if (comp.group_id === group_id && comp.name === "popularTasks") {
      return {
        ...comp,
        component_content: [
          ...(Array.isArray(comp.component_content) ? comp.component_content : []),
          { ...newItem }
        ]
      };
    } else {
      return comp;
    }
  }));
},

  addItemToComponentContentCatering: ({ group_id, newItem }) => {
    setPageComponents(prev => prev.map(comp => {
    if (comp.group_id === group_id && comp.name === "catering") {
      return {
        ...comp,
        component_content: [
          ...(Array.isArray(comp.component_content) ? comp.component_content : []),
          { ...newItem }
        ]
      };
    } else {
      return comp;
    }
  }));
},

  updateItemInComponentContent: ({ group_id, updatedItem }) => {
  setPageComponents(prev =>
    prev.map(comp =>
      String(comp.group_id) === String(group_id) && comp.name === "advertisement"
        ? {
            ...comp,
            component_content: (comp.component_content || []).map(el =>
              el.id === updatedItem.id ? { ...el, ...updatedItem } : el
            )
          }
        : comp
    )
  );
},

updateItemInComponentContentCatering: ({ group_id, updatedItem }) => {
  setPageComponents(prev =>
    prev.map(comp =>
      String(comp.group_id) === String(group_id) && comp.name === "catering"
        ? {
            ...comp,
            component_content: (comp.component_content || []).map(el =>
              el.id === updatedItem.id ? { ...el, ...updatedItem } : el
            )
          }
        : comp
    )
  );
},
  
  updateItemInComponentContentPopular: ({ group_id, updatedItem }) => {
  setPageComponents(prev =>
    prev.map(comp =>
      String(comp.group_id) === String(group_id) && comp.name === "popularTasks"
        ? {
            ...comp,
            component_content: (comp.component_content || []).map(el =>
              el.id === updatedItem.id ? { ...el, ...updatedItem } : el
            )
          }
        : comp
    )
  );
},

  addItemToComponentContentProduct: ({ group_id, newItem }) => {
  setPageComponents(prev => prev.map(comp => {
    if (String(comp.group_id) === String(group_id) && comp.name === "productsGrid") {
      return {
        ...comp,
        component_content: {
          ...comp.component_content,
          items: [
            ...(Array.isArray(comp.component_content?.items) ? comp.component_content.items : []),
            newItem
          ]
        }
      };
    } else {
      return comp;
    }
  }));
 },

 updateItemInComponentContentProduct: ({ group_id, id, updatedItem }) => {
  setPageComponents(prev =>
    prev.map(comp => {
      if (String(comp.group_id) === String(group_id) && comp.name === "productsGrid") {
        return {
          ...comp,
          component_content: {
            ...comp.component_content,
            items: (Array.isArray(comp.component_content?.items) ? comp.component_content.items : [])
              .map(item => 
                String(item.id) === String(id) ? { ...item, ...updatedItem } : item
              )
          }
        };
      }
      return comp;
    })
  );
},

 updateItemInComponentContentReview: ({ group_id, id, updatedItem }) => {
  setPageComponents(prev =>
    prev.map(comp =>
      String(comp.group_id) === String(group_id) && comp.name === "regularReviews"
        ? {
            ...comp,
            component_content: (comp.component_content || []).map(el =>
              el.id === updatedItem.id ? { ...el, ...updatedItem } : el
            )
          }
        : comp
    )
  );
},

  handleUpdateProductGrid: ({ group_id, updatedItem }) => {
  setPageComponents(prev =>
    prev.map(comp => {
      if (String(comp.group_id) === String(group_id) && comp.name === "productsGrid") {
        return {
          ...comp,
          component_content: {
            ...comp.component_content,
            obj: {
              ...comp.component_content?.obj,
              name: updatedItem.name,
              cols_amount: updatedItem.cols_amount
            }
          }
        };
      }
      return comp;
    })
  );
 },

 updateItemInVista: ({ updatedItem }) => {
  setPageComponents(prev =>
    prev.map(comp =>
      comp.name === "vista"
        ? {
            ...comp,
            component_content: comp.component_content.map(item =>
              item.id === updatedItem.id ? updatedItem : item
            ),
          }
        : comp
    )
  );
},

updateItemInSimmilar: ({ updatedItem }) => {
  setPageComponents(prev =>
    prev.map(comp =>
      comp.name === "simmilarProducts"
        ? {
            ...comp,
            component_content: comp.component_content.map(item =>
              item.id === updatedItem.id ? updatedItem : item
            ),
          }
        : comp
    )
  );
},

 updateItemInYaReview: ({updatedItem}) => {
  setYaReviews(prev => 
    prev.map(item => item.id === updatedItem.id ? updatedItem : item)
  );
 },

  addCategoryGroup: (item) => setItems((prev) => [...prev, item]),

  updateCategoryGroup: (updatedItem) => setItems(prev =>
    prev.map(item =>
    item.id === updatedItem.id
      ? { ...item, ...updatedItem }
      : item
  )),

  addRegularReviewGroup: (groupId, newItem) => {
  setPageComponents(prev =>
    prev.map(comp =>
      comp.name === "regularReviews" && comp.group_id === groupId
        ? {
            ...comp,
            component_content: [...(comp.component_content || []), newItem],
          }
        : comp
    )
  );
 },

 updateItemInLeaflet: (updatedItem) => {
  setPageComponents(prev =>
    prev.map(comp =>
      comp.name === "leaflet"
        ? {
            ...comp,
            component_content:
              comp.component_content?.[0]?.id === updatedItem.id
                ? [
                    {
                      ...comp.component_content[0],
                      ...updatedItem,
                    },
                  ]
                : comp.component_content,
          }
        : comp
    )
  );
},
};

  const addItemsToComponentContentProduct = ({ group_id, newItems }) => {
    setPageComponents(prev =>
    prev.map(comp =>
      String(comp.group_id) === String(group_id)
        ? {
            ...comp,
            component_content: {
              ...comp.component_content,
              items: [
                ...(comp.component_content?.items || []),
                ...newItems
              ]
            }
          }
        : comp
      )
    );
  };

const updateRedactorInComponentContent = ({ updatedItem }) => {
  setPageComponents(prev =>
    prev.map(comp =>
      comp.name === "redactor"
        ? {
            ...comp,
            component_content: (comp.component_content || []).map(el =>
              el.name === updatedItem.name
                ? { ...el, delta: updatedItem.delta }
                : el
            )
          }
        : comp
    )
  );
};

const deleteItemInAdvertisementComponent = (id) => {
  const prev = pageComponents;

  let removedComponentIds = [];
  let removedGroupId = null;

  const updated = prev
    .map(comp => {
      if (comp.name !== "advertisement") return comp;

      const hasTarget = (comp.component_content || []).some(el => el.id === id);
      if (!hasTarget) return comp;

      const newContent = (comp.component_content || []).filter(el => el.id !== id);

      if (newContent.length === 0) {
        removedComponentIds.push(comp.id);
        removedGroupId = comp.group_id;
        return null;
      }
      return { ...comp, component_content: newContent };
    })
    .filter(Boolean);

  setPageComponents(updated);

  const result = removedComponentIds.length ? { componentIds: removedComponentIds, group_id: removedGroupId } : null;
  return result;
};

const deleteItemInPopularTasksComponent = (id) => {
  const strId = String(id);
  let removedComponentIds = [];
  let removedGroupId = null;

  setPageComponents(prev => {
    const updated = prev
      .map(comp => {
        if (comp.name !== "popularTasks") return comp;

        const content = Array.isArray(comp.component_content) ? comp.component_content : [];
        const hasTarget = content.some(el => String(el.id) === strId);
        if (!hasTarget) return comp;

        const newContent = content.filter(el => String(el.id) !== strId);

        if (newContent.length === 0) {
          removedComponentIds.push(comp.id);
          removedGroupId = comp.group_id;
          return null; // удаляем этот компонент из списка
        }

        return { ...comp, component_content: newContent };
      })
      .filter(Boolean);

    return updated;
  });

  const result = removedComponentIds.length
    ? { componentIds: removedComponentIds, group_id: removedGroupId }
    : null;

  return result;
};

const deleteComponentById = (id) => {
  setPageComponents(prev =>
    prev.filter(comp => comp.id !== id)
  );
};

const deleteComponentFromPageMap = async (comp_id, map_id) => {
  try {
    setLoading(true);
      const res = await fetch(`${BASE_URL}/delete-page-component/${comp_id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      }, credentials: "include",
    });

      if (res.status === 200) {
        try{
          const res_final = await fetch(`${BASE_URL}/delete-leaflet/${map_id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            }, credentials: "include",
          });

          if(res_final.status === 200)
          {
            deleteComponentById(comp_id);
            setStatusCode(res.status);
            setToastMessage("Элемент успешно удален!");
          }
          else
          {
            setStatusCode(res.status);
            setToastMessage("Произошла непредвиденная ошибка!");
          }
        }
        catch(err)
        {
        }
      } else if (res.status === 404) {
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
          }else {
        setStatusCode(res.status);
        setToastMessage("Произошла непредвиденная ошибка!");
      }
    }
    catch (err) {
    }
    finally{
          setLoading(false);
        }
}

const deleteComponentFromPage = async (comp_id) => {
  try {
    setLoading(true);
      const res = await fetch(`${BASE_URL}/delete-page-component/${comp_id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      }, credentials: "include",
    });

      if (res.status === 200) {
        deleteComponentById(comp_id);
        setStatusCode(res.status);
        setToastMessage("Элемент успешно удален!");
      } else if (res.status === 404) {
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
          }else {
        setStatusCode(res.status);
        setToastMessage("Произошла непредвиденная ошибка!");
      }
    }
    catch (err) {
    }
    finally{
          setLoading(false);
        }
}

const deleteItemInProductsGrid = (id) => {
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

const forbiddenDelete = (id) => {
  const currentPath = window.location.pathname; 

  for (const comp of pageComponents) {
    if (comp.name !== "productsGrid") continue;
    const items = comp.component_content?.items || [];

    const match = items.some(el => el.id === id && el.api_adress === currentPath);

    if (match) return true;
  }

  return false;
};

const deleteItemInReviews = (id) => {
  const prev = [...pageComponents];

  let removedComponentIds = [];
  let removedGroupId = null;

  const updated = prev
    .map(comp => {
      if (comp.name !== "regularReviews") return comp;

      const items = comp.component_content;
      const hasTarget = items.some(el => String(el.id) === String(id));
      if (!hasTarget) return comp;

      const newItems = items.filter(el => String(el.id) !== String(id));

      if (newItems.length === 0) {
        removedComponentIds.push(comp.id);
        removedGroupId = comp.group_id;
        return null;
      }

      return {
        ...comp,
        component_content: {
          ...(comp.component_content || {}),
          items: newItems
        }
      };
    })
    .filter(Boolean);

  setPageComponents(updated);

  return removedComponentIds.length
    ? { componentIds: removedComponentIds, group_id: removedGroupId }
    : null;
};

const onDeleteFromSpace = async (comp_id, item_id) => {
  try {
    setLoading(true);
      const res = await fetch(`${BASE_URL}/delete-space/${item_id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      }, credentials: "include",
    });

      if (res.status === 200) {
       try {
              const res2 = await fetch(`${BASE_URL}/delete-page-component/${comp_id}`, {
              method: "DELETE",
              headers: {
                  "Content-Type": "application/json",
              }, credentials: "include",
             });
            
            if(res2.status === 200) {
              deleteComponentById(comp_id);
              setStatusCode(res2.status);
              setToastMessage("Элемент успешно удален!");
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
            } else if (res2.status !== 200) {
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
          setLoading(false);
        }
}

const deleteItemFromYaReviews = (id) => {
  setYaReviews(prev => prev.filter(item => item.id !== id));
};

const deleteYaReview = async (id) => {
  try {
    setLoading(true);
      const res = await fetch(`${BASE_URL}/delete-yandex-review/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      }, credentials: "include",
    });

      if (res.status === 200) {
        deleteItemFromYaReviews(id);
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
          setLoading(false);
        }
}

const onDeleteReview = async (id) => {
  try {
    setLoading(true);
      const res = await fetch(`${BASE_URL}/delete-regular-review/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      }, credentials: "include",
    });

      if (res.status === 200) {
        const result = deleteItemInReviews(id);

        if(result !== null){
          try {
                const res2 = await fetch(`${BASE_URL}/delete-regular-reviews-group/${result.group_id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
              }, credentials: "include",
              });

            if (res2.status === 404) {
            setStatusCode(res2.status);
            setToastMessage("Отзыв удален успешно! Группу отзывов нельзя удалить на данный момент!");
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
          }
        }
      }
        }
        
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
          setLoading(false);
        }
}

const deleteProductItem = async (id, page_id) => {
  try {
    setLoading(true);
    if(forbiddenDelete(id))
    {
      setStatusCode(500);
      setToastMessage("Нельзя удалить элемент, находясь на его собственной странице!");
      setLoading(false)
      return;
    }
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
  
        if (res.status === 200 && res_page.status === 200) {
        const result = deleteItemInProductsGrid(id);

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
          }
        }
      }
        }
        
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
          setLoading(false);
        }
};

const updateComponentFromPage = async (comp_id, name, cols, group_id) => {
    setItemName(name);
    setItemId(comp_id);
    setItemCols(cols);
    setItemGroupId(group_id);
    setTemplateType("updateProductsGroup");
    setHandlerType("handleUpdateProductGrid");
    setOpenModal(true);
}

const deleteFromCatering = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/delete-catering/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      }, credentials: "include",
    });

      if (res.status === 200) {
        const result = deleteItemInCateringComponent(id);

        if(result !== null){
          try {
                const res2 = await fetch(`${BASE_URL}/delete-catering-group/${result.group_id}`, {
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
          }
        }
      }
        }
        
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
          setLoading(false);
        }
  };

const deleteFromAdvertisement = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/delete-ad/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      }, credentials: "include",
    });

      if (res.status === 200) {
        const result = deleteItemInAdvertisementComponent(id);

        if(result !== null){
          try {
                const res2 = await fetch(`${BASE_URL}/delete-ad-group/${result.group_id}`, {
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
          }
        }
      }
        }
        
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
          setLoading(false);
        }
  };

  const deletePopularTaskItem = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/delete-task/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      }, credentials: "include",
    });

      if (res.status === 200) {
        const result = deleteItemInPopularTasksComponent(id);

        if(result !== null){
          try {
                const res2 = await fetch(`${BASE_URL}/delete-task-group/${result.group_id}`, {
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
          }
        }
      }
        }
        
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
          }
      else {
        setStatusCode(res.status);
        setToastMessage("Произошла непредвиденная ошибка!");
      }
    }
    catch (err) {
    }
    finally{
          setLoading(false);
        }
  };
  
  const onSelectedTemplate = async (name) => {
    setOpenTemplates(false);
    if(name == "category")
    {
      try {
        setLoading(true);
          const res = await fetch(`${BASE_URL}/create-page-component`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              name: name,
              group_id: pageId,
              group_name: "header",
              order_id: itemOrderId
            })
          });
          
          if(res.status === 200)
          {
            const data = await res.json();
            const component = {
             component_content: [],
             group_id: pageId,
             id: data.content.id,
             name: name,
             order_id: itemOrderId
            }
            handlers["addComponentWithShift"](component);
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
        } catch (err) {
        }
        finally{
          setLoading(false);
        }
    }
    else if(name == "reviewsYa")
    {
      try {
        setLoading(true);
          const res = await fetch(`${BASE_URL}/create-page-component`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              name: name,
              group_id: pageId,
              group_name: "yandex",
              order_id: itemOrderId
            })
          });
          
          if(res.status === 200)
          {
            const data = await res.json();
            const component = {
             component_content: [],
             group_id: pageId,
             id: data.content.id,
             name: name,
             order_id: itemOrderId
            }
            handlers["addComponentWithShift"](component);
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
        } catch (err) {
        } finally{
          setLoading(false);
        }
    }
    else
    {
      setOpenModal(true);
      setTemplateType(name);
      setComponentName(name);
    }
  }

  const onUpdateProductOrder = async (id, order_id) => {
    setItemId(id);
    setProductOrderId(order_id);
    setOpenModal(true);
    setTemplateType("updateProductOrder");
  };


  const handleAddComponent = async (order_id) => {
    setOpenTemplates(true);
    setItemOrderId(order_id);
    setFirst(true);
    setHandlerType("addComponentWithShift");
  }

  const handleCloseComponent = async () => {
    setOpenTemplates(false);
  }

  const addAdvertisementItem = async (group_id) => {
    setItemGroupId(group_id);
    setTemplateType("createAdvertisementItem");
    setHandlerType("addItemToComponentContent");
    setFirst(false);
    setOpenModal(true);
  }

  const addCateringItem = async (group_id) => {
    setItemGroupId(group_id);
    setTemplateType("createCateringItem");
    setHandlerType("addItemToComponentContentCatering");
    setFirst(false);
    setOpenModal(true);
  }

  const createYaReview = async () => {
    setTemplateType("createYaReview");
    setHandlerType("addItemToYaReviews");
    setFirst(false);
    setOpenModal(true);
  } 

  const addPopularTaskItem = async (group_id) => {
    setItemGroupId(group_id);
    setTemplateType("createPopularTaskItem");
    setHandlerType("addItemToComponentContentPopular");
    setFirst(false);
    setOpenModal(true);
  }

  const addProductItem = async (group_id) => {
    setItemGroupId(group_id);
    setTemplateType("createProductItem");
    setHandlerType("addItemToComponentContentProduct");
    setFirst(false);
    setOpenModal(true);
  }

  const updateAdvertisementItem = async (id, image_src, delta, button_info, ref_button_info, ref, group_id) => {
    setItemImage(image_src);
    setItemId(id);
    setItemDelta(delta);
    setItemGroupId(group_id);
    setItemButtonInfo(button_info);
    setItemButtonInfoRef(ref_button_info);
    setItemRef(ref);
    setTemplateType("updateAdvertisementItem");
    setHandlerType("updateItemInComponentContent");
    setOpenModal(true);
  }

  const updateCateringItem = async (id, pdf_ref, image_src, title, text, order_id, group_id) => {
    setItemImage(image_src);
    setItemId(id);
    setItemDesc(text);
    setItemName(title);
    setItemGroupId(group_id);
    setItemRef(pdf_ref);
    setTemplateType("updateCateringItem");
    setHandlerType("updateItemInComponentContentCatering");
    setOpenModal(true);
  }

  const updatePopularTaskItem = async (group_id, id, name, text) => {
    setItemGroupId(group_id);
    setItemId(id);
    setItemName(name);
    setItemText(text);
    setTemplateType("updatePopularTaskItem");
    setHandlerType("updateItemInComponentContentPopular");
    setOpenModal(true);
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
    setItemPageId(product.page_id);
    setItemProductPageId(product.product_page_id);
    setItemsReviewsId(product.reviews_id);
    setItemName(product.name);
    setItemPrice(product.price);
    setItemRating(product.rating);
    setItemDate(product.date);
    setItemTags(product.tags);
    setItemSearchTags(product.search_tags);
    setTemplateType("updateProductItem");
    setHandlerType("updateItemInComponentContentProduct");
    setOpenModal(true);
  }

  const onUpdateReview = async (group_id, review) => {
    setItemGroupId(group_id);
    setItemId(review.id);
    setItemName(review.user_name);
    setItemRating(review.rating);
    setItemText(review.text);
    setTemplateType("updateReviewItem");
    setHandlerType("updateItemInComponentContentReview");
    setOpenModal(true);
  }

  const updateYaReview = async (item) => {
    setItemId(item.id);
    setItemName(item.user_name);
    setItemRating(item.rating);
    setItemText(item.text);
    setItemRef(item.ref);
    setItemIcon(item.user_icon);
    setTemplateType("updateYaReview");
    setHandlerType("updateItemInYaReview");
    setOpenModal(true);
  }

  const updateVista = async (item) => {
    setItemId(item.id);
    setItemName(item.name);
    setItemRef(item.vista_src);
    setTemplateType("updateVista");
    setHandlerType("updateItemInVista");
    setOpenModal(true);
  }

  const updateSimmilar = async (item) => {
    setItemId(item.id);
    setItemName(item.name);
    setItemSearchStr(item.search_str);
    setTemplateType("updateSimmilar");
    setHandlerType("updateItemInSimmilar");
    setOpenModal(true);
  }

  const updateLefalet = async (desc, button_info, custom_ref, image_src, id) => {
    setItemId(id);
    setItemDesc(desc);
    setItemButtonInfo(button_info);
    setItemRef(custom_ref);
    setItemImage(image_src);
    setTemplateType("updateLeaflet");
    setHandlerType("updateItemInLeaflet");
    setOpenModal(true);
  };

  const createPiers = async (lat, lng, map_id) => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/create-piers`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          lat: lat,
          lng: lng,
          map_id: map_id
        })
      });
        
      if (res.status === 200) {
        setStatusCode(res.status);
        setToastMessage("Элемент успешно создан!");
        const data = await res.json();
        return data.content.id;
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

      return 0;
            
    } catch (err) {
    }
    finally{
      setLoading(false);
    }
  };

  const deletePiers = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/delete-in-piers/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      }, credentials: "include",
    });

      if (res.status === 200) {
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
      setLoading(false);
    }
  };
 
  const removeRedactorItemById = (idToRemove) => {
  setPageComponents(prev =>
    prev.filter(
      comp =>
        !(
          comp.name === "redactor" &&
          comp.component_content?.some(el => el.id === idToRemove)
        )
    )
  );
};

  const onDeleteRedactor = async (comp_id, redactor_id) => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/delete-redactor/${redactor_id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      }, credentials: "include",
    });

      if (res.status === 200) {

         try {
              const res2 = await fetch(`${BASE_URL}/delete-page-component/${comp_id}`, {
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
            setToastMessage("Внутренняя ошибка сервера!");
            } else if (res2.status !== 200) {
            setStatusCode(res2.status);
            setToastMessage("Произошла непредвиденная ошибка!");
            }

          } catch (err) {
          }
      
        removeRedactorItemById(redactor_id);
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
          setLoading(false);
        }
  }

    return(
        <div className="mainPage-main-container">
          {isAdmin && !noAddition && (
            <div className="addComponentBtn">
                  <hr />
                  <button onClick={() => handleAddComponent(redactorId !== 0 ? 1 : (redactorId + 1))}>
                  <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512.000000 512.000000"
                          preserveAspectRatio="xMidYMid meet"
                          fill="#FFFFFF">
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
                <hr />
                 </div>
          )}
          {pageComponents.map((comp) => {
               const Component = componentMap[comp.name];
               let onCreate, onUpdate, onDelete, onDeleteFromPage, onUpdateFromPage;
               switch (comp.name) {
               case "advertisement":
                onCreate = (group_id) => addAdvertisementItem(group_id);
                onUpdate = (id, image_src, delta, button_info, ref_button_info, ref, group_id) => updateAdvertisementItem(id, image_src, delta, button_info, ref_button_info, ref, group_id);
                onDelete = (id) => deleteFromAdvertisement(id);
                onDeleteFromPage = (comp_id) => deleteComponentFromPage(comp_id);
                break;

               case "catering":
                onCreate = (group_id) => addCateringItem(group_id);
                onUpdate = (id, pdf_ref, image_src, title, text, order_id, group_id) => updateCateringItem(id, pdf_ref, image_src, title, text, order_id, group_id);
                onDelete = (id) => deleteFromCatering(id);
                onDeleteFromPage = (comp_id) => deleteComponentFromPage(comp_id);
                break;

               case "productsGrid":
                onDelete = (id, page_id) => deleteProductItem(id, page_id);
                onUpdate = (group_id, product) => updateProductItem(group_id, product);
                onDeleteFromPage = (comp_id) => deleteComponentFromPage(comp_id);
                onUpdateFromPage = (comp_id, name, cols, group_id) => updateComponentFromPage(comp_id, name, cols, group_id);
                break;

               case "category":
                onDeleteFromPage = (group_id) => deleteComponentFromPage(group_id);
                break;

               case "popularTasks":
                onCreate = (group_id) => addPopularTaskItem(group_id);
                onUpdate = (group_id, id, name, text) => updatePopularTaskItem(group_id, id, name, text);
                onDelete = (id) => deletePopularTaskItem(id);
                onDeleteFromPage = (group_id) => deleteComponentFromPage(group_id);
                break;

               case "regularReviews":
                onDeleteFromPage = (group_id) => deleteComponentFromPage(group_id);
                break;

               case "reviewsYa":
                onDeleteFromPage = (group_id) => deleteComponentFromPage(group_id);
                break;

               case "simmilarProducts":
                onDeleteFromPage = (group_id) => deleteComponentFromPage(group_id);
                break;

               case "vista":
                onDeleteFromPage = (group_id) => deleteComponentFromPage(group_id);
                break;

               case "leaflet":
                onDeleteFromPage = (group_id, map_id) => deleteComponentFromPageMap(group_id, map_id);
                break;
              }
               return (
                <div className="inner-main-component-container" key={comp.id}>
               {comp.name === "productsGrid" && (
               <ProductsGrid products={comp.component_content.items} 
                  ids={comp.component_content.ids}
                  group_name={comp.component_content.obj.name} 
                  gridCols={comp.component_content.obj.cols_amount} 
                  group_id={comp.group_id} 
                  compId={comp.id}
                  onDeleteFromPage={deleteComponentFromPage}
                  onUpdateFromPage={onUpdateFromPage}
                  onUpdated={addItemsToComponentContentProduct}
                  onCreated={addProductItem}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  groupName={comp.group_name}
                  onUpdateOrder={onUpdateProductOrder}
                  />
                )}

               {comp.name === "advertisement" && (
               <Advertisement
                  data={comp.component_content}
                  onCreate={onCreate}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onDeleteFromPage={onDeleteFromPage}
                  groupId={comp.group_id}
                  compId={comp.id}
                  />
                )}

                {comp.name === "catering" && (
               <Menu
                  data={comp.component_content}
                  onCreate={onCreate}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onDeleteFromPage={onDeleteFromPage}
                  groupId={comp.group_id}
                  compId={comp.id}
                  />
                )}

               {comp.name === "popularTasks" && (
               <PopularTasks
                  tasks={comp.component_content}
                  onCreate={onCreate}
                  onDeleteFromPage={onDeleteFromPage}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  groupId={comp.group_id}
                  compId={comp.id}
                  />
                )}

                {comp.name === "category" && (
                  <div className="mainPage-admin-category">
                    <Category setOpenModal={setOpenModal} setModalType={setTemplateType} setHandlerType={setHandlerType} setStatusCode={setStatusCode} setToastMessage={setToastMessage} setCategoryId={setItemId} setCategoryName={setItemName} setCategoryImage={setItemImage} setCategoryAdress={setItemAdress} setCategoryGroupId={setItemGroupId} setCategoryAmount={setItemAmount} setLoading={setLoading} setVisibleAuth={setVisibleAuth}/>
                    {isAdmin && (
                      <button className="mainPage-admin-container-on-delete-from-page" onClick={() => deleteComponentFromPage(comp.id)}>
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
                  </div>
                )}

                {comp.name === "redactor" && (
                  <>
                  {isAdmin ? (
                    <div className="quill-redactor-main-page-container">
                  <QuillRedactor
                   str={comp.component_content?.[0]?.delta || ""}
                   showSaveButton={true}
                   comp_id={comp.id}
                   comp_group_id={comp.component_content[0].id}
                   comp_name={comp.component_content[0].name}
                   onUpdated={updateRedactorInComponentContent}
                  />
                  {isAdmin &&(
                          <button className="redactor-container-on-delete" onClick={() => {
                        if (window.confirm("Вы уверены, что хотите безвозвратно удалить элемент?")) {
                        onDeleteRedactor(comp.id, comp.component_content[0].id);
                        }
                        }}>
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
                </div>
                  ) : (
                    <ParseDelta desc={comp.component_content[0].delta}/>
                  )}
                  </>
                )}
     
                {comp.name === "regularReviews" && (
                  <div className="mainpage-regular-reviews-container-admin">
                    <RegularReviews
                  regularReviews={comp.component_content}
                  onDelete={onDeleteReview}
                  onUpdate={onUpdateReview}
                  group_id={comp.group_id}
                  />
                  <ReviewsInput 
                  reviewsAmount={comp.component_content.length}
                  group_id={comp.group_id}
                  setStatusCode={setStatusCode}
                  setToastMessage={setToastMessage}
                  />
                  {isAdmin &&(
                          <button className="mainPage-reviews-container-on-delete-from-page" onClick={() => deleteComponentFromPage(comp.id)}>
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
                  </div>
                )}

                {comp.name === "reviewsYa" && (
                  <ReviewsYa 
                  itemsData={yaReviews}
                  onCreated={createYaReview}
                  onUpdated={updateYaReview}
                  onDelete={deleteYaReview}
                  onDeleteFromPage={onDeleteFromPage}
                  compId={comp.id}
                  />
                )}

                {comp.name === "vista" && (
                  <Vista
                  url={comp.component_content[0].vista_src}
                  onDeleteFromPage={onDeleteFromPage}
                  onUpdated={updateVista}
                  item={comp.component_content[0]}
                  compId={comp.id}
                  />
                )}

                {comp.name === "space" && (
                  <Space 
                  height={comp.component_content.space}
                  item_id={comp.component_content.id}
                  comp_id={comp.id}
                  onDelete={onDeleteFromSpace}/>
                )}

                {comp.name === "simmilarProducts" && (
                  <SimmilarProducts
                  onDeleteFromPage={onDeleteFromPage}
                  onUpdated={updateSimmilar}
                  search_str={comp.component_content[0].search_str}
                  item={comp.component_content[0]}
                  compId={comp.id}
                  />
                )}

                {comp.name === "leaflet" && (
                  <Leaflet
                  onDeleteFromPage={onDeleteFromPage}
                  piers={comp.component_content[0].piers}
                  desc={comp.component_content[0].desc}
                  button_info={comp.component_content[0].button_info}
                  custom_ref={comp.component_content[0].ref}
                  image_src={comp.component_content[0].image_src}
                  compId={comp.id}
                  onCreate={createPiers} 
                  onUpdate={updateLefalet}
                  onDelete={deletePiers}
                  mapId={comp.component_content[0].id}
                  isAdmin={isAdmin}
                  />
                )}

                {isAdmin && !noAddition && (
                  <div className="addComponentBtn">
                  <hr />
                  <button onClick={() => handleAddComponent(comp.order_id + 1)}>
                  <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512.000000 512.000000"
                          preserveAspectRatio="xMidYMid meet"
                          fill="#FFFFFF">
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
                <hr />
                 </div>
                )}
               </div>
               );
              })}
          <Suspense fallback={<div></div>}>
          <ModalManager type={templateType} isOpen={openModal} onClose={() => {setOpenModal(false)}} onCreated={handlers[handlerType]} setToastMessage={setToastMessage} 
                                  setStatusCode={setStatusCode} item_name={itemName} item_delta={itemDelta} item_id={itemId} item_image={itemImage} item_adress={itemAdress} item_amount={itemAmount} setType={setTemplateType} component_name={componentName}
                                  page_id={pageId} first_element={first} component_order_id={itemOrderId} component_group_id={itemGroupId} setHandlerType={setHandlerType} item_cols={itemCols}
                                  item_capacity={itemCapacity} item_desc={itemDesc} item_discount={itemDiscount} item_images={itemImages} item_price={itemPrice} item_rating={itemRating} item_tags={itemTags} item_seacrh_tags={itemSearchTags} item_text={itemText}
                                  item_ref={itemRef} item_icon={itemIcon} item_search_str={itemSearchStr} setLoading={setLoading} loading={loading} item_toilet={itemToilet} pages={pages} setPages={setPages} item_page_id={itemPageId} blog_page_id={itemProductPageId} item_reviews_id={itemReviewsId} item_date={itemDate} item_order_id={productOrderId} item_button_info={itemButtonInfo} item_pdf_ref={itemPdfRef} item_ref_button_info={itemButtonRef}/>
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
                            <ComponentTemplate onSelect={onSelectedTemplate} onClose={handleCloseComponent} showTemplates={openTemplates}/>
                            <AuthForm visible={visibleAuth} setVisible={setVisibleAuth}/>
            </div>
    );
}