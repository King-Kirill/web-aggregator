import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import {Quill} from 'react-quill';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { BASE_URL } from '../../config';
import './QuillStyles.css'
import Toast from '../adminMessage/adminMessage';
import LoadingGif from "../loadingGif/LoadingGif.jsx";
import { div } from 'framer-motion/client';
import AuthForm from "../AuthForm/AuthForm.jsx";

const fonts = ["GraphikLCG-thin", "Sans Serif"];

const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  ['link', 'image', 'video', 'formula'],

  [{ header: 1 }, { header: 2 }],
  [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ direction: 'rtl' }],

  [{ size: ['small', false, 'large', 'huge'] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }],
  [{ font: fonts }],
  [{ align: [] }],

  ['clean'], ['addBtn']
];

export default function QuillRedactorBlog({ str, showSaveButton=true, blog_id=0, preview_id=0, setStrDelta=null})
{
  const [value, setValue] = useState(str || "");
  const quillRef = useRef(null);
  const [toastMessage, setToastMessage] = useState("");
  const [statusCode, setStatusCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [visibleAuth, setVisibleAuth] = useState(false);

  useEffect(() => { if(str) setValue(str); }, [str]);

  const saveChange = async () => { 
    const editor = quillRef.current.getEditor(); 
    const newDelta = editor.getContents(); 
    setValue(newDelta);
    
     try {
      setLoading(true);
            const res = await fetch(`${BASE_URL}/update-blog-delta`,{
                method: "POST",
                headers: {
                "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                id: blog_id,
                delta: newDelta
                })
              });
        
              if (res.status === 200) {
                const plainText = editor.getText();
                const maxLength = 250;
                const shortText = plainText.length > maxLength
                ? plainText.slice(0, maxLength - 3) + "..."
                : plainText;

                const res2 = await fetch(`${BASE_URL}/update-news-preview-desc`,{
                method: "POST",
                headers: {
                "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                id: preview_id,
                desc: shortText
                })
              });
               
              if (res2.status === 200)
              {
                if(typeof setStrDelta === "function")
                {
                  setStrDelta(newDelta);
                }
                setStatusCode(res.status);
                setToastMessage("Элемент успешно обновлен!");
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

  return (
    <>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={setValue}
        modules={{ toolbar: toolbarOptions }}
        className="quill-redactor-container"
      />
      {showSaveButton===true &&
      <div className="redactor-btn-wrapper">
      <button onClick={() => (saveChange())}>
       сохранить
      </button>
    </div>
    }
    <Toast
                                                  message={toastMessage}
                                                  status_code={statusCode}
                                                  timeout={4000}
                                                  onClose={() => setToastMessage("")}
                                                />
    {loading && (
                                                <LoadingGif loading={loading}/>
                                              )}
                                              <AuthForm visible={visibleAuth} setVisible={setVisibleAuth}/>
    </>
  );
};