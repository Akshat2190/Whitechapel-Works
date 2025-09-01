import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import { Route, Routes, useLocation } from "react-router-dom";
import ChatBox from "./components/ChatBox";
import Credits from "./pages/Credits";
import Community from "./pages/Community";
import { assets } from "./assets/assets";
import './assets/prism.css'
import Loading from "./pages/Loading";
import { useAppContext } from "./context/AppContext";
import Login from "./pages/Login";

const App = () => {

  const {user} = useAppContext();

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const {pathname} = useLocation();

  if(pathname === '/loading'){
    return <Loading />;
  }

  return (
    <>
    {!isMenuOpen && <img src={assets.menu_icon} className="absolute top-3 right-3 w-5 h-5 cursor-pointer
      not-dark:invert md:hidden" onClick={()=>setIsMenuOpen(true)} />}

      {user ? (
        <div className="bg-white dark:bg-gradient-to-b from-[#242124] to-[#000000] dark:text-white transition-colors duration-300">
          <div className="flex h-screen w-screen">
            <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen}/>
            <Routes>
              <Route path="/" element={<ChatBox />} />
              <Route path="/credits" element={<Credits />} />
              <Route path="/community" element={<Community />} />
            </Routes>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-b from-[#242124] to-[#000000] h-screen w-screen flex items-center justify-center">
          <Login />
        </div>
      )}
    </>
  );
};

export default App;
