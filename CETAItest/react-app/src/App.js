import React, { useState, useEffect } from 'react';
import './App.css';
import AIAssistant from './components/AIAssistant/AIAssistant';

// 引入组件
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './pages/Dashboard/Dashboard';

function App() {
  const [collapsed, setCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="app">
      <Sidebar collapsed={collapsed} />
      
      <div className={`main-content ${collapsed ? 'expanded' : ''}`}>
        <Header toggleSidebar={toggleSidebar} />
        <Dashboard />
      </div>
      
      {/* 添加AI助手组件 */}
      <AIAssistant />
    </div>
  );
}

export default App; 