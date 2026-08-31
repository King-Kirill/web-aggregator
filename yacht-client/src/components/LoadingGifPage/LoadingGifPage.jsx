import { useState, useEffect } from "react";
import "./LoadingGifPage.css"

export default function LoadingGifPage(loading=false) {
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    let timer; 

    if (loading) 
        { 
            setLocalLoading(true);
        } 
    else 
        { 
            setLocalLoading(false); 
        } 
    
        return () => clearTimeout(timer);
  }, [loading])

  if (!loading) return null;

  return (
    <>
    {localLoading && (
        <span className="loading-spinner-gif-page"></span>
    )}
    </>
  );
}