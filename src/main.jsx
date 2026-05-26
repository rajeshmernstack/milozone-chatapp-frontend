import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Chat from './pages/Chat.jsx';
import './index.css';
import Admin from './pages/Admin.jsx';
import 'leaflet/dist/leaflet.css';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  </BrowserRouter>
);