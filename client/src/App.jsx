import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import { Route, Routes } from "react-router-dom";
import ChatBox from "./components/ChatBox";
import Credits from "./pages/Credits";
import Community from "./pages/Community";
import { assets } from "./assets/assets";
import './assets/prism.css'

const App = () => {

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
    {!isMenuOpen && <img src={assets.menu_icon} className="absolute top-3 right-3 w-5 h-5 cursor-pointer
      not-dark:invert md:hidden" onClick={()=>setIsMenuOpen(true)} />}
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
    </>
  );
};

export default App;
