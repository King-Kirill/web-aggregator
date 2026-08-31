import './App.css'
import React, {useState, useEffect} from "react"
import { HelmetProvider } from "react-helmet-async";
import { BASE_URL } from './config';
import HeaderProvider from './components/header/contexts/HeaderContext.jsx'
import ChosenContextProvider from './components/header/contexts/ChooseContext.jsx'
import ItemsProvider from './components/header/contexts/ItemsContext.jsx'
import YandexReviewsContextProvider from './components/reviewsYa/contexts/YandexReviewsContext.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import { useToggleContext } from "./components/ToggleContext.jsx";
import { lazy, Suspense } from "react";
import FloatingMenu from './components/floatingMenu/FloatingMenu.jsx';

import {RoleProvider} from "./components/header/contexts/RoleContext.jsx";
import CookieAlert from "./components/cookieAlert/CookieAlert.jsx";
import {SearchProvider} from "./components/SearchContext.jsx";
import {StorageProvider} from "./components/StorageContext.jsx";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AnalyticsTracker from "./AnalyticsTracker.jsx"

import Header from './components/header/Header.jsx'
import Footer from './components/footer/Footer.jsx'

import 'react-quill/dist/quill.snow.css';
import "./pages/styles/ShopPage.css"
import "./pages/styles/ProductPage.css"
import "./pages/styles/NewsPage.css"
import "./pages/styles/BlogPage.css"
import "./pages/styles/RegularPage.css"
import "./pages/styles/MainPage.css"
import "./pages/styles/ErrorPage.css"
import "./pages/styles/ConfirmPage.css"

import ErrorPage from './pages/ErrorPage.jsx';
import ThanksPage from './pages/ThanksPage.jsx';

const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductPage = lazy(() => import('./pages/ProductPage.jsx'));
const SearchPage = lazy(() => import('./pages/SearchPage.jsx'));
const NewsPage = lazy(() => import('./pages/NewsPage.jsx'));
const BlogPage = lazy(() => import('./pages/BlogPage.jsx'));
const RegularPage = lazy(() => import('./pages/RegularPage.jsx'));
const MainPage = lazy(() => import('./pages/MainPage.jsx'));
const ConfirmPage = lazy(() => import('./pages/ConfirmPage.jsx'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage.jsx'));
const RentPrivacyPage = lazy(() => import('./pages/RentPrivacyPage.jsx'));
const FavouritesPage = lazy(() => import('./pages/FavouritesPage.jsx'));
const ContactsPage = lazy(() => import('./pages/ContactsPage.jsx'));

import 'normalize.css';

const templatesMap: Record<string, React.FC<any>> = {
  RegularPage: RegularPage,
  ShopPage: ShopPage,
  BlogPage: BlogPage,
  MainPage: MainPage,
  NewsPage: NewsPage,
  ProductPage: ProductPage
};

window.addEventListener('popstate', () => {
  window.location.reload();
});

type Page = {
  id: number;
  name: string;
  template_type: string;
  api_adress: string;
  title: string;
  description: string;
  robots: string;
  script: string;
};

function AppRoutes({
  pages,
  setPages
}: {
  pages: Page[];
  setPages: React.Dispatch<React.SetStateAction<Page[]>>;
}) {
  const location = useLocation();

  if (!pages || pages.length === 0) {
    return null;
  }

  return (
    <Suspense fallback={<div></div>}>
    <ScrollToTop />
    <HelmetProvider>
      <Routes>
      <Route path="/404" element={<ErrorPage />} /> 
      <Route path="/confirm-email" element={<ConfirmPage />} />
      <Route path="/search" element={<SearchPage key={location.key} />} />
      <Route path="/" element={<MainPage setPages={setPages} pages={pages} />} />
      <Route path="/favourites" element={<FavouritesPage />} />
      <Route path="/privacy-policy" element={<PrivacyPage />} />
      <Route path="/rent-policy" element={<RentPrivacyPage />} />
      <Route path="/contacts" element={<ContactsPage />} />
      <Route path="/thanks" element={<ThanksPage />} />
      {pages.map((p) => {
        const Component = templatesMap[p.template_type] || (() => (
          <Navigate
            to="/404"
            replace
            state={{ from: window.location.pathname }}
          />
        ));
        return (
          <Route
            key={p.id}
            path={p.api_adress}
            element={<Component api_adress={p.api_adress} setPages={setPages} pages={pages} title={p.title} description={p.description} robots={p.robots} ld_json={p.script} db_id={p.id}/>}
          />
        );
      })}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
    </HelmetProvider>
    </Suspense>
  );
}

function App() {
  const [pages, setPages] = useState<Page[]>([]);
  const { isOn, setIsOn } = useToggleContext();

  useEffect(() => {
    let retry = 1;

    const fetchPages = async () => {
        try {
          const res = await fetch(`${BASE_URL}/get-pages`);
    
          if (res.status === 200) {
            const data = await res.json();
            
            const group: Page[] = [];

            data.content.forEach((item: Page) => {
            group.push(item);
            });

            setPages(group);
    
          }
          else
          {
            if (retry < 2) {
              retry += 1;
              setTimeout(() => fetchPages(), 500);
              }
          }
    
        } catch (err) {
          if (retry < 2) {
              retry += 1;
              setTimeout(() => fetchPages(), 500);
              }
        }
      }; 

      const fetchTheme = async () => {
        try {
          const res = await fetch(`${BASE_URL}/get-theme`);
          console.log(isOn);
          if (res.status === 200) {
            const data = await res.json();
            setIsOn(data.content);

            if(data.content)
            {
              document.documentElement.style.setProperty("--dark-color", "#151515");
              document.documentElement.style.setProperty("--semi-dark-color", "#1A1A1A");
              document.documentElement.style.setProperty("--semi-dark-color-2", "#0A0A0A");
              document.documentElement.style.setProperty("--black-color", "#000000");
              document.documentElement.style.setProperty("--semi-black", "#0F0F0F");
              document.documentElement.style.setProperty("--gold-color", "#CB9500");
              document.documentElement.style.setProperty("--gold-color-bright", "#FFA920");
              document.documentElement.style.setProperty("--border-color", "#515151");
              document.documentElement.style.setProperty("--light-border-color", "#808080");
              document.documentElement.style.setProperty("--hover-btn", "#F40045");
              document.documentElement.style.setProperty("--underline", "#cd9000");
              document.documentElement.style.setProperty("--gray-color", "#3c3c3c");
              document.documentElement.style.setProperty("--gray-text", "#484848");
              document.documentElement.style.setProperty("--failed-to-find", "#F40045");
              document.documentElement.style.setProperty("--request-bckg", "url('/images/ppl.webp')");
              document.documentElement.style.setProperty("--main-bckg-img", "url('/images/components_preview/mainPage-bckg.webp')");
            }
            else
            {
              document.documentElement.style.setProperty("--dark-color", "#002839");
              document.documentElement.style.setProperty("--semi-dark-color", "#FFFFFF");
              document.documentElement.style.setProperty("--semi-dark-color-2", "#002839");
              document.documentElement.style.setProperty("--semi-dark-color-3", "#165874");
              document.documentElement.style.setProperty("--black-color", "#000000");
              document.documentElement.style.setProperty("--semi-black", "#FFFFFF");
              document.documentElement.style.setProperty("--gold-color", "#07c4cf");
              document.documentElement.style.setProperty("--gold-color-bright", "#07c4cf");
              document.documentElement.style.setProperty("--border-color", "#002839");
              document.documentElement.style.setProperty("--light-border-color", "#002839");
              document.documentElement.style.setProperty("--hover-btn", "#000000");
              document.documentElement.style.setProperty("--underline", "#07c4cf");
              document.documentElement.style.setProperty("--gray-color", "#07c4cf");
              document.documentElement.style.setProperty("--gray-text", "#165874");
              document.documentElement.style.setProperty("--failed-to-find", "#07c4cf");
              document.documentElement.style.setProperty("--request-bckg", "url('/images/ppl-2.webp')");
              document.documentElement.style.setProperty("--main-bckg-img", "url('/images/components_preview/mainPage-bckg-2.webp')");
            }
          }
        } catch (err) {
        }
      }
    
      fetchPages();
      fetchTheme();
      }, []);

  if (pages.length === 0) {
  return null;
  }


  return (
    <BrowserRouter>
    <StorageProvider>
      <SearchProvider>
      <YandexReviewsContextProvider>
      <RoleProvider>
        <ItemsProvider>
          <HeaderProvider>
            <ChosenContextProvider>
              <header><Header /></header>
                <AppRoutes pages={pages} setPages={setPages} />
              <footer><Footer /></footer>
            <AnalyticsTracker/>
            <CookieAlert/>
            </ChosenContextProvider>
          </HeaderProvider>
        </ItemsProvider>
      </RoleProvider>
    </YandexReviewsContextProvider>
    </SearchProvider>
    </StorageProvider>
    <FloatingMenu />
</BrowserRouter>
  )
}

export default App