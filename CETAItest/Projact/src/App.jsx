import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app-container">
      <h1>React 应用示例</h1>
      <div className="counter-container">
        <p>当前计数: {count}</p>
        <button onClick={() => setCount(count + 1)}>增加</button>
        <button onClick={() => setCount(count - 1)}>减少</button>
        <button onClick={() => setCount(0)}>重置</button>
      </div>
    </div>
  );
}

export default App; 