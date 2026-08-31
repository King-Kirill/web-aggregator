import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import {Quill} from 'react-quill';
import ReactQuill from 'react-quill';
import { BASE_URL } from '../../config';
import 'react-quill/dist/quill.snow.css';
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

  ['clean']
];

const QuillRedactor = forwardRef(({ str, showSaveButton = false, comp_id=0, comp_group_id=0, comp_name="", onUpdated=null, updatePrivacy=false}, ref) => {
  const [value, setValue] = useState(str || "");
  const quillRef = useRef(null);
  const [toastMessage, setToastMessage] = useState("");
  const [statusCode, setStatusCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [visibleAuth, setVisibleAuth] = useState(false);

  useImperativeHandle(ref, () => ({
    getDelta: () => {
      const editor = quillRef.current.getEditor();
      return editor.getContents();
    },
    saveChange: () => {
      const editor = quillRef.current.getEditor();
      const newDelta = editor.getContents();
      setValue(editor.getText());
      return newDelta;
    }
  }));

  useEffect(() => { if(str) setValue(str); }, [str]);

  const saveChange = async () => { 
    const editor = quillRef.current.getEditor(); 
    const newDelta = editor.getContents(); 
    setValue(newDelta);
    
     try {
      setLoading(true);
      if(updatePrivacy)
      {
         const res = await fetch(`${BASE_URL}/update-privacy`,{
                method: "POST",
                headers: {
                "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                name: comp_name,
                delta: newDelta
                })
              });
        
              if (res.status === 200) {
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
      }
      else
      {
        const res = await fetch(`${BASE_URL}/update-redactor`,{
                method: "POST",
                headers: {
                "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                id: comp_group_id,
                name: comp_name,
                delta: newDelta
                })
              });
        
              if (res.status === 200) {
                const updatedItem = {id: comp_group_id, name: comp_name, delta: newDelta};
                onUpdated({ updatedItem });
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
        modules={{ 
          toolbar: toolbarOptions,
          }}
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
});

export default QuillRedactor;