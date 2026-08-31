import { useState, useEffect } from "react";
import "./LoadingGif.css"

export default function LoadingGif({ loading = false }) {
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    let timer; 

    if (loading) 
        { 
            timer = setTimeout(() => {
                if(loading)
                {
                    setLocalLoading(true); 
                }
            }, 500); 
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
        <span className="loading-spinner-gif"></span>
    )}
    </>
  );
}