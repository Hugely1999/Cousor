import React, { useEffect, useRef, useState } from 'react';
import './AIAssistant.css';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef(null);
  const panelRef = useRef(null);
  const conversationRef = useRef(null);
  const iconRef = useRef(null);
  
  useEffect(() => {
    // 加载初始欢迎消息
    setMessages([
      { 
        type: 'ai', 
        content: '您好，我是您的智能助手。我可以回答问题、提供电力数据分析，或者帮您导航到系统不同功能区。请问有什么可以帮您？'
      }
    ]);
    
    // 默认位置在右下角
    setPosition({
      x: window.innerWidth - 120,
      y: window.innerHeight - 120
    });
    
    // 添加全局点击事件监听器
    const handleClickOutside = (event) => {
      // 如果面板打开，且点击位置不在面板内且不是图标，则关闭面板
      if (
        isOpen && 
        panelRef.current && 
        !panelRef.current.contains(event.target) &&
        iconRef.current &&
        !iconRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    // 清理函数
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // 滚动到最新消息
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [messages]);
  
  const openPanel = () => {
    setIsOpen(true);
    // 聚焦输入框
    setTimeout(() => {
      const inputElement = document.querySelector('.text-input');
      if (inputElement) {
        inputElement.focus();
      }
    }, 100);
  };
  
  const closePanel = () => {
    setIsOpen(false);
  };
  
  const handleIconClick = (e) => {
    // 防止拖拽冲突
    if (!isDragging) {
      if (isOpen) {
        closePanel();
      } else {
        openPanel();
      }
    }
  };
  
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // 添加用户消息
    setMessages(prev => [...prev, { type: 'user', content: inputValue }]);
    
    // 模拟AI回复
    setTimeout(() => {
      processUserInput(inputValue);
      setInputValue('');
    }, 500);
  };
  
  const processUserInput = (input) => {
    let response = '';
    
    // 简单的关键词匹配
    if (input.includes('你好') || input.includes('hi') || input.includes('hello')) {
      response = '您好，我是您的智能助手，有什么可以帮您的吗？';
    } 
    else if (input.includes('电力') || input.includes('用电')) {
      response = '我可以为您查询电力使用情况、分析用电趋势，或者提供节能建议。请告诉我您具体需要什么信息？';
    }
    else if (input.includes('数据') || input.includes('统计')) {
      response = '我可以为您分析用电数据、生成统计报表，或者比较不同时期的用电情况。您想了解哪方面的数据？';
    }
    else if (input.includes('功能') || input.includes('帮助')) {
      response = '我可以帮助您：1. 查询和分析用电数据 2. 提供电力使用建议 3. 回答电力系统相关问题 4. 导航到系统不同功能区';
    }
    else if (input.includes('搜索')) {
      response = '请输入您要搜索的关键词，我会为您查找相关信息。';
    }
    else {
      response = '感谢您的询问。我正在学习更多知识以便更好地为您服务。有关电力监控或数据分析的问题，我很乐意为您解答。';
    }
    
    // 添加AI回复
    setMessages(prev => [...prev, { type: 'ai', content: response }]);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  // 拖拽逻辑
  const handleMouseDown = (e) => {
    // 阻止冒泡，使拖拽不触发点击事件
    e.stopPropagation();
    
    setIsDragging(true);
    
    // 使用clientX和clientY获取鼠标位置
    const startPosition = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    
    const handleMouseMove = (e) => {
      if (isDragging) {
        const newPosition = {
          x: e.clientX - startPosition.x,
          y: e.clientY - startPosition.y
        };
        
        // 设置位置限制，防止拖出屏幕
        const x = Math.max(0, Math.min(newPosition.x, window.innerWidth - 100));
        const y = Math.max(0, Math.min(newPosition.y, window.innerHeight - 100));
        
        setPosition({ x, y });
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      
      // 添加一个短暂的延迟，防止拖拽结束后立即触发点击事件
      setTimeout(() => {
        setIsDragging(false);
      }, 100);
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const toggleVoiceRecording = () => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // 开始录音逻辑
      alert('语音录制功能已开启（模拟）');
    } else {
      // 停止录音逻辑
      alert('语音录制功能已关闭（模拟）');
    }
  };
  
  return (
    <div 
      className="ai-assistant-container" 
      ref={containerRef}
    >
      {/* AI图标 */}
      <div 
        className="ai-icon" 
        ref={iconRef}
        onClick={handleIconClick}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          zIndex: 9999,
          cursor: isDragging ? 'grabbing' : 'pointer'
        }}
      >
        <div className="ai-icon-inner">AI</div>
      </div>
      
      {/* 展开状态的面板 */}
      {isOpen && (
        <div 
          className="ai-panel" 
          ref={panelRef}
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '30px'
          }}
        >
          {/* 顶部控制栏 */}
          <div className="ai-header">
            <div className="drag-handle" onMouseDown={handleMouseDown}></div>
            <div className="control-buttons">
              <button className="minimize-btn" onClick={closePanel}></button>
              <button className="close-btn" onClick={closePanel}></button>
            </div>
          </div>
          
          {/* 对话内容区 */}
          <div className="conversation-container" ref={conversationRef}>
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.type}-message`}>
                {msg.content}
              </div>
            ))}
          </div>
          
          {/* 输入区域 */}
          <div className="input-container">
            {isRecording && (
              <div className="voice-wave-container">
                <div className="wave-bars">
                  {[...Array(10)].map((_, i) => (
                    <div 
                      key={i} 
                      className="wave-bar" 
                      style={{ 
                        height: `${Math.floor(Math.random() * 20) + 3}px`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            )}
            <input 
              type="text" 
              className="text-input" 
              placeholder="输入问题或点击麦克风"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button 
              className={`voice-btn ${isRecording ? 'recording' : ''}`} 
              onClick={toggleVoiceRecording}
            ></button>
            <button className="send-btn" onClick={handleSendMessage}></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant; 