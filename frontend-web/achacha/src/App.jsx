import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import KakaoBridge from './components/KakaoBridge';
import KakaoShare from './components/KakaoShare';
import PresentShare from './components/PresentShare';
import PresentPage from './page/PresentPage';
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/kakao-bridge" element={<KakaoBridge />} />
        <Route path="/kakao-share" element={<KakaoShare />} />
        <Route path="/present-share" element={<PresentShare />} />
        <Route path="/present/:presentCardCode" element={<PresentPage />} />
      </Routes>
    </Router>
  );
}

export default App;
