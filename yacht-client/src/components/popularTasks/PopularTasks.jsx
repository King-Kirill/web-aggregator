import { createContext, useContext, useState, useEffect, useRef } from "react";
import "./PopularTasks.css"
import { useLocation } from "react-router-dom";

export default function PopularTasks({tasks, onCreate=null, onDeleteFromPage=null, groupId=0, compId=0, onUpdate=null, onDelete=null}){
    const [openTask, setOpenTask] = useState(false);
    const contentRefs = useRef([]);

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

  const toggleTask = (id) => {
    setOpenTask(openTask === id ? null : id);
  };
      return (
    <div className="PopularTasks-container">
      <div className="PopularTasks-container-title">
        <div className="PopularTasks-container-title-left-line"></div>
        <span className="PopularTasks-container-title-span">ответы на популярные вопросы</span>
        <div className="PopularTasks-container-title-right-line"></div>
      </div>
      {tasks.length > 0 ? (tasks.map((task, id) => (
        <div key={id} className="PopularTasks-container-item">
          <button
            className="PopularTasks-container-item-title"
            onClick={() => toggleTask(id)}
          >
            <span>{task.name}</span>
            {openTask === id ? ( <svg xmlns="http://www.w3.org/2000/svg" id="a" width="43" height="6" viewBox="0 0 43 6"><rect width="43" height="6"></rect></svg> ): ( <svg xmlns="http://www.w3.org/2000/svg" id="a" width="43.104" height="45.888" viewBox="0 0 43.104 45.888"><polygon points="24.096 20.16 24.096 0 19.008 0 19.008 20.16 0 20.16 0 25.248 19.008 25.248 19.008 45.888 24.096 45.888 24.096 25.248 43.104 25.248 43.104 20.16 24.096 20.16"></polygon></svg> )}
          </button>

          <div
            ref={(el) => (contentRefs.current[id] = el)}
            className="PopularTasks-container-main"
            style={{
              maxHeight:
                openTask === id
                  ? contentRefs.current[id]?.scrollHeight + "px"
                  : "0px",
              transition: "max-height 0.5s ease",
            }}
          >
            <p>{task.text}</p>
          </div>
          {isAdmin &&(
                  <button className="PopularTasks-on-delete" onClick={() => {
                if (window.confirm("Вы уверены, что хотите безвозвратно удалить элемент?")) {
                onDelete(task.id);
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
                {isAdmin &&(
                  <button className="PopularTasks-on-change" onClick={() => onUpdate(groupId, task.id, task.name, task.text)}>
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
                )}
        </div>
      ))) : <></>}
      {isAdmin && (
        <button className="popularTask-add-btn" onClick={() => onCreate(groupId)}>
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
      )}
      {isAdmin &&(
              <button className="popularTask-container-on-delete-from-page" onClick={() => onDeleteFromPage(compId)}>
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
  );
}