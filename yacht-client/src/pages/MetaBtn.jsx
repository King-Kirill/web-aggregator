import { button } from "framer-motion/client";
import "./styles/MetaBtn.css"
import { lazy, Suspense, useState } from "react";
const ModalManager = lazy(() => import("../components/modalManager/ModalManager.jsx"));
import Toast from "../components/adminMessage/adminMessage.jsx";
import LoadingGif from "../components/loadingGif/LoadingGif.jsx";

export default function MetaBtn({title, description, robots, ld_json, id}) {
    const [openModal, setOpenModal] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [statusCode, setStatusCode] = useState("");
    const [loading, setLoading] = useState(false);
    
    return(
        <>
            <button className="change-meta-btn" onClick={() => {setOpenModal(true)}}>
                <span>&lt; meta &gt;</span>
            </button>

            <Suspense fallback={<div></div>}>
            <ModalManager type={"meta"} isOpen={openModal} onClose={() => {setOpenModal(false)}} setToastMessage={setToastMessage} 
                setStatusCode={setStatusCode} item_id={id} item_name={title} item_desc={description} item_robots={robots} item_ld_json={ld_json} setLoading={setLoading} loading={loading}/>
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
        </>
    );
}