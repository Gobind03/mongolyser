import React, { useEffect } from 'react';
import {
  Routes,
  Route,
  useLocation
} from 'react-router-dom';

import './css/style.css';

import './charts/ChartjsConfig';
// mongodb+srv://santhosh:santhosh@cluster1.j5z2f.mongodb.net/?retryWrites=true&w=majority

import Index from './pages/Index';

function App() {

  const location = useLocation();

  useEffect(() => {
    document.querySelector('html').style.scrollBehavior = 'auto'
    window.scroll({ top: 0 })
    document.querySelector('html').style.scrollBehavior = ''
  }, [location.pathname]); // triggered on route change

  return (
    <>
      <Routes>
        <Route exact path='/' element={<Index />} />\
      </Routes>
    </>
  );
}

export default App;
