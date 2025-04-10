// AI助手组件
// 注意：请将您的AI助手图标PNG图片放置在images/ai-assistant-icon.png
// 图标将显示为方形圆角(4px)的图片，无需添加任何文字
class AIAssistant {
  constructor() {
    this.isOpen = false;
    this.isDragging = false;
    this.isRecording = false;
    this.messages = [];
    this.position = { x: 0, y: 0 };
    
    // DeepSeek API配置
    this.apiKey = 'sk-930d7f953a8440d98a2c652661de05b4';
    this.apiEndpoint = 'https://api.deepseek.com/v1/chat/completions';
    this.useAI = true; // 控制是否使用真实AI API
    this.isProcessing = false; // 控制是否正在处理请求
    
    // 初始化语音识别
    this.initSpeechRecognition();

    // 初始化组件
    this.init();
  }

  init() {
    // 创建主容器
    this.container = document.createElement('div');
    this.container.className = 'ai-assistant-container';
    document.body.appendChild(this.container);

    // 创建AI图标 - 直接使用内联SVG
    this.icon = document.createElement('div');
    this.icon.className = 'ai-icon';
    
    // 直接内联SVG代码，确保总能正确显示
    this.icon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 60 60" fill="none">
        <rect width="60" height="60" rx="12" fill="url(#gradient)" />
        <text x="30" y="38" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white" text-anchor="middle">AI</text>
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#6236FF" />
            <stop offset="100%" stop-color="#3A7BD5" />
          </linearGradient>
        </defs>
      </svg>
    `;
    
    this.container.appendChild(this.icon);

    // 从localStorage恢复位置
    const savedX = localStorage.getItem('aiAssistantPositionX');
    const savedY = localStorage.getItem('aiAssistantPositionY');
    
    if (savedX !== null && savedY !== null) {
      this.container.style.position = 'fixed';
      this.container.style.left = savedX + 'px';
      this.container.style.top = savedY + 'px';
      this.container.style.right = 'auto';
      this.container.style.bottom = 'auto';
    }

    // 尝试从localStorage恢复消息记录
    const savedMessages = localStorage.getItem('aiAssistantMessages');
    if (savedMessages) {
      try {
        this.messages = JSON.parse(savedMessages);
      } catch (e) {
        console.error('恢复消息记录失败:', e);
        // 创建初始消息
        this.messages = [{
          type: 'ai',
          content: '您好，我可以回答问题、提供电力数据分析，或者帮您导航到系统不同功能区。请问有什么可以帮您？'
        }];
      }
    } else {
      // 创建初始消息
      this.messages = [{
        type: 'ai',
        content: '您好，我可以回答问题、提供电力数据分析，或者帮您导航到系统不同功能区。请问有什么可以帮您？'
      }];
    }

    // 绑定事件
    this.bindEvents();
    
    // 如果URL中包含aiopen=true参数或localStorage中有打开标记，则自动打开面板
    const urlParams = new URLSearchParams(window.location.search);
    const shouldOpen = urlParams.get('aiopen') === 'true' || localStorage.getItem('aiAssistantOpen') === 'true';
    
    if (shouldOpen) {
      // 延迟执行以确保DOM完全加载
      setTimeout(() => {
        this.openPanel();
        // 打开后清除localStorage中的标记
        localStorage.removeItem('aiAssistantOpen');
        // 从URL中移除aiopen参数
        if (urlParams.get('aiopen') === 'true') {
          urlParams.delete('aiopen');
          const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
          window.history.replaceState({}, document.title, newUrl);
        }
      }, 300);
    }
  }

  bindEvents() {
    // 图标点击事件
    this.icon.addEventListener('click', (e) => {
      if (!this.isDragging) {
        this.togglePanel();
      }
    });

    // 拖拽开始
    this.icon.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      this.startDrag(e);
    });

    // 点击外部关闭面板
    document.addEventListener('mousedown', (e) => {
      if (this.panel && this.isOpen && 
          !this.panel.contains(e.target) && 
          !this.icon.contains(e.target)) {
        this.closePanel();
      }
    });
  }

  togglePanel() {
    if (this.isOpen) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  openPanel() {
    // 创建面板
    this.panel = document.createElement('div');
    this.panel.className = 'ai-panel';
    this.panel.style.position = 'fixed';
    // 不预设位置，通过updatePanelPosition设置
    this.container.appendChild(this.panel);

    // 输入区域 - 顶部
    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container';
    inputContainer.innerHTML = `
      <input type="text" class="text-input" placeholder="输入问题或点击麦克风">
      <button class="voice-btn"></button>
      <button class="send-btn"></button>
    `;
    this.panel.appendChild(inputContainer);

    // 输入框事件
    this.input = inputContainer.querySelector('.text-input');
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });

    // 发送按钮事件
    const sendBtn = inputContainer.querySelector('.send-btn');
    sendBtn.addEventListener('click', () => this.sendMessage());

    // 语音按钮事件 - 改为点击切换录音状态
    const voiceBtn = inputContainer.querySelector('.voice-btn');
    voiceBtn.addEventListener('click', (e) => {
      e.preventDefault(); // 防止冒泡
      if (this.isRecording) {
        this.stopVoiceRecording();
      } else {
        this.startVoiceRecording();
      }
    });

    // 历史查询区域 - 放在输入框下方
    this.historyContainer = document.createElement('div');
    this.historyContainer.className = 'history-container';
    this.panel.appendChild(this.historyContainer);
    
    // 渲染历史查询
    this.renderSearchHistory();

    // 添加操作按钮容器 - 现在放在历史查询下方
    const actionContainer = document.createElement('div');
    actionContainer.className = 'action-container';
    actionContainer.innerHTML = `
      <div style="flex: 1"></div>
      <button class="download-btn" title="下载对话记录"></button>
      <button class="clear-btn" title="清空对话记录"></button>
      <button class="toggle-btn" title="隐藏对话框"></button>
    `;
    this.panel.appendChild(actionContainer);

    // 下载按钮事件
    const downloadBtn = actionContainer.querySelector('.download-btn');
    downloadBtn.addEventListener('click', () => this.downloadConversation());

    // 清空按钮事件
    const clearBtn = actionContainer.querySelector('.clear-btn');
    clearBtn.addEventListener('click', () => this.clearConversation());

    // 隐藏对话框按钮事件
    const toggleBtn = actionContainer.querySelector('.toggle-btn');
    toggleBtn.addEventListener('click', () => {
      const conversationContainer = this.panel.querySelector('.conversation-container');
      if (conversationContainer.style.display === 'none') {
        conversationContainer.style.display = 'flex';
        toggleBtn.title = '隐藏对话框';
        toggleBtn.classList.remove('toggle-collapsed');
      } else {
        conversationContainer.style.display = 'none';
        toggleBtn.title = '展开对话框';
        toggleBtn.classList.add('toggle-collapsed');
      }
    });

    // 对话内容区域 - 放在底部
    this.conversationContainer = document.createElement('div');
    this.conversationContainer.className = 'conversation-container';
    this.panel.appendChild(this.conversationContainer);

    // 渲染消息
    this.renderMessages();

    // 聚焦到输入框
    setTimeout(() => {
      this.input.focus();
    }, 100);

    this.isOpen = true;
    
    // 更新面板位置，与图标对齐
    this.updatePanelPosition();
  }

  // 更新面板位置
  updatePanelPosition() {
    if (!this.panel || !this.isOpen) return;
    
    const iconRect = this.icon.getBoundingClientRect();
    
    // 图标左侧12px固定间距，底部对齐
    this.panel.style.position = 'fixed';
    this.panel.style.right = (window.innerWidth - iconRect.left + 12) + 'px';
    this.panel.style.bottom = (window.innerHeight - iconRect.bottom) + 'px';
    this.panel.style.left = 'auto';
    this.panel.style.top = 'auto';
  }

  closePanel() {
    if (this.panel) {
      this.container.removeChild(this.panel);
      this.panel = null;
    }
    this.isOpen = false;
  }

  startDrag(e) {
    this.isDragging = true;
    const startX = e.clientX - this.container.offsetLeft;
    const startY = e.clientY - this.container.offsetTop;

    const moveHandler = (e) => {
      if (this.isDragging) {
        const x = e.clientX - startX;
        const y = e.clientY - startY;
        
        // 限制图标在窗口内
        const maxX = window.innerWidth - this.container.offsetWidth;
        const maxY = window.innerHeight - this.container.offsetHeight;
        
        const boundedX = Math.max(0, Math.min(x, maxX));
        const boundedY = Math.max(0, Math.min(y, maxY));
        
        // 应用新位置 - 确保可以在任意方向移动
        this.container.style.position = 'fixed';
        this.container.style.left = `${boundedX}px`;
        this.container.style.top = `${boundedY}px`;
        this.container.style.right = 'auto';
        this.container.style.bottom = 'auto';
        
        // 保存位置到localStorage，确保刷新页面后位置保持不变
        localStorage.setItem('aiAssistantPositionX', boundedX);
        localStorage.setItem('aiAssistantPositionY', boundedY);
        
        // 更新面板位置，跟随图标移动
        this.updatePanelPosition();
      }
    };

    const upHandler = () => {
      this.isDragging = false;
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
      
      // 防止拖拽结束后立即触发点击
      setTimeout(() => {
        this.isDragging = false;
      }, 100);
    };

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
  }

  renderMessages() {
    if (!this.conversationContainer) return;
    
    this.conversationContainer.innerHTML = '';
    
    // 直接遍历消息数组，顺序已经是反向的（最新的在前面）
    this.messages.forEach(msg => {
      const msgElement = document.createElement('div');
      msgElement.className = `message ${msg.type}-message`;
      msgElement.textContent = msg.content;
      this.conversationContainer.appendChild(msgElement);
    });
  }

  renderSearchHistory() {
    if (!this.historyContainer) return;

    // 移除标题，直接创建历史查询列表
    this.historyContainer.innerHTML = '';
    
    // 创建历史查询列表
    const historyList = document.createElement('div');
    historyList.className = 'history-list';
    
    // 获取用户查询（每两条消息中的用户消息）
    const userQueries = [];
    for (let i = 0; i < this.messages.length; i++) {
      if (this.messages[i].type === 'user') {
        // 检查是否已经包含相同查询，避免重复
        if (!userQueries.includes(this.messages[i].content)) {
          userQueries.push(this.messages[i].content);
        }
      }
    }
    
    // 限制最多显示8条
    const limitedQueries = userQueries.slice(0, 8);
    
    // 如果没有历史查询，显示提示信息
    if (limitedQueries.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'history-empty';
      emptyMsg.textContent = '暂无查询历史';
      historyList.appendChild(emptyMsg);
    } else {
      // 创建历史查询项
      limitedQueries.forEach(query => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.textContent = query;
        
        // 点击历史记录项自动填充到输入框
        historyItem.addEventListener('click', () => {
          if (this.input) {
            this.input.value = query;
            this.input.focus();
          }
        });
        
        historyList.appendChild(historyItem);
      });
    }
    
    this.historyContainer.appendChild(historyList);
  }

  sendMessage() {
    if (!this.input || !this.input.value.trim()) return;
    
    const message = this.input.value.trim();
    
    // 添加用户消息到消息数组开头，适应反向布局
    this.messages.unshift({ type: 'user', content: message });
    
    // 限制历史记录最多保留8条消息（4对对话，每对包含用户问题和AI回答）
    if (this.messages.length > 16) {
      this.messages = this.messages.slice(0, 16);
    }
    
    // 更新对话区域和历史查询区域
    this.renderMessages();
    this.renderSearchHistory();
    
    // 清空输入框
    this.input.value = '';
    
    // 模拟AI回复
    setTimeout(() => {
      this.processUserInput(message);
    }, 500);
  }

  processUserInput(input) {
    let response = '';
    let shouldNavigate = false;
    let targetPage = '';
    
    // 获取当前页面的URL
    const currentUrl = window.location.href;
    console.log('当前页面URL:', currentUrl);
    
    // 导航指令处理 - 仍然在本地处理
    if (input.match(/打开(工作台|仪表盘)/i) || input.match(/(进入|跳转到|前往|转到)(工作台|仪表盘)/i) || input.includes('工作台')) {
      response = '正在为您跳转到工作台...';
      targetPage = 'index.html';
      shouldNavigate = true;
      this.handleLocalResponse(response, shouldNavigate, targetPage);
    } 
    else if (input.match(/打开(电力监控|能源监控)/i) || input.match(/(进入|跳转到|前往|转到)(电力监控|能源监控)/i) || input.includes('电力监控')) {
      response = '正在为您跳转到电力监控页面...';
      targetPage = 'power-monitoring.html';
      shouldNavigate = true;
      this.handleLocalResponse(response, shouldNavigate, targetPage);
    }
    else if (input.match(/打开(电能分析|能源分析|用电分析)/i) || input.match(/(进入|跳转到|前往|转到)(电能分析|能源分析|用电分析)/i) || input.includes('电能分析')) {
      response = '正在为您跳转到电能分析页面...';
      targetPage = 'html/power-analysis.html';
      shouldNavigate = true;
      this.handleLocalResponse(response, shouldNavigate, targetPage);
    }
    else if (input.match(/打开(首页|主页)/i) || input.match(/(进入|跳转到|前往|转到)(首页|主页)/i) || input.includes('首页')) {
      response = '正在为您跳转到首页...';
      targetPage = 'index.html';
      shouldNavigate = true;
      this.handleLocalResponse(response, shouldNavigate, targetPage);
    }
    else if (input.match(/返回|后退|上一页/i)) {
      response = '正在返回上一页...';
      shouldNavigate = 'back';
      this.handleLocalResponse(response, shouldNavigate, targetPage);
    }
    else if (this.useAI && !this.isProcessing) {
      // 使用DeepSeek API处理其他查询
      this.callDeepSeekAPI(input);
    } 
    else {
      // 备选方案：如果AI API不可用或正在处理，使用本地逻辑
      this.handleLocalProcessing(input);
    }
  }

  // 处理本地响应，主要用于导航和API不可用的备选处理
  handleLocalResponse(response, shouldNavigate, targetPage) {
    // 添加AI回复到消息数组开头
    this.messages.unshift({ type: 'ai', content: response });
    
    // 更新对话区域和历史查询区域
    this.renderMessages();
    this.renderSearchHistory();
    
    // 处理导航
    if (shouldNavigate) {
      // 在导航前将AI助手状态保存到localStorage
      this.saveStateBeforeNavigation();
      
      // 延迟一秒执行导航，让用户有时间看到提示
      setTimeout(() => {
        const currentUrl = window.location.href;
        if (shouldNavigate === 'back') {
          window.history.back();
        } else if (targetPage) {
          // 构建正确的URL路径
          let finalUrl = '';
          
          // 如果当前在html子目录中
          if (currentUrl.includes('/html/')) {
            // 从子目录返回主目录
            if (targetPage === 'index.html' || targetPage === 'power-monitoring.html') {
              finalUrl = '../' + targetPage;
            } 
            // 在子目录内导航
            else if (targetPage === 'html/power-analysis.html') {
              finalUrl = 'power-analysis.html';
            }
          } 
          // 如果当前在根目录
          else {
            finalUrl = targetPage;
          }
          
          console.log('跳转到:', finalUrl);
          // 将目标页面信息添加到URL中
          finalUrl += (finalUrl.includes('?') ? '&' : '?') + 'aiopen=true';
          window.location.href = finalUrl;
        }
      }, 1000);
    }
  }

  // 调用DeepSeek API
  callDeepSeekAPI(input) {
    this.isProcessing = true;
    
    // 显示加载状态
    const loadingMessage = { type: 'ai', content: '正在思考中...' };
    this.messages.unshift(loadingMessage);
    this.renderMessages();

    // 构建发送给API的消息历史
    const apiMessages = [];
    
    // 系统提示消息，告诉AI它的角色和能力
    apiMessages.push({
      role: "system", 
      content: "你是一个电力系统监控平台的AI助手，你可以帮助用户查询电力数据和系统信息。你需要理解用户关于电力使用、负荷分析、节能建议等问题，并提供有用的信息。当涉及具体数据时，你可以模拟合理的数值进行回答。"
    });
    
    // 添加用户的最新消息
    apiMessages.push({
      role: "user",
      content: input
    });
    
    // 准备请求数据
    const requestData = {
      model: "deepseek-chat",  // 使用DeepSeek的聊天模型
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 800
    };
    
    // 发送API请求
    fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(requestData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // 获取AI回复
      const aiResponse = data.choices[0].message.content;
      
      // 替换加载消息
      this.messages.shift(); // 移除加载消息
      this.messages.unshift({ type: 'ai', content: aiResponse });
      
      // 更新UI
      this.renderMessages();
      this.renderSearchHistory();
    })
    .catch(error => {
      console.error('DeepSeek API调用失败:', error);
      
      // 移除加载消息
      this.messages.shift();
      
      // 显示错误消息
      this.messages.unshift({ type: 'ai', content: '抱歉，我暂时无法连接到服务器，正在切换到本地模式...' });
      this.renderMessages();
      
      // 回退到本地处理
      setTimeout(() => {
        this.handleLocalProcessing(input);
      }, 1000);
    })
    .finally(() => {
      this.isProcessing = false;
    });
  }

  // 本地处理用户输入的备选方案（当API不可用时）
  handleLocalProcessing(input) {
    let response = '';
    
    // 实时用电量/功率/负荷
    if (/当前|实时|现在|此刻|功率|负荷|用电量|电量|功耗|耗电/.test(input)) {
      // 模拟获取实时数据
      const currentPower = Math.floor(Math.random() * 100 + 350);
      const loadRate = Math.floor(Math.random() * 30 + 60);
      response = `当前实时用电功率为${currentPower}kW，负荷率${loadRate}%，处于正常运行范围。`;
    }
    // 今日用电量
    else if (/今日|今天|本日|日用电|每日|用了多少电|几度电/.test(input)) {
      // 模拟获取今日用电数据
      const currentTime = new Date();
      const hour = currentTime.getHours();
      const dailyUsage = Math.floor(hour * 20 + Math.random() * 100);
      response = `截至目前，今日总用电量为${dailyUsage}kWh，比昨日同期${Math.random() > 0.5 ? '节约了5%' : '增加了3%'}。`;
    }
    // 月度用电量
    else if (/本月|当月|月用电|每月|月耗电/.test(input)) {
      // 模拟获取本月用电数据
      const currentDate = new Date();
      const dayOfMonth = currentDate.getDate();
      const monthlyUsage = Math.floor(dayOfMonth * 150 + Math.random() * 300);
      response = `本月截至目前用电量为${monthlyUsage}kWh，比上月同期${Math.random() > 0.5 ? '减少了8%' : '增加了6%'}。预计本月总用电量约为${Math.floor(monthlyUsage * 30 / dayOfMonth)}kWh。`;
    }
    // 年度用电量
    else if (/年用电|本年|今年|年度|全年|一年/.test(input)) {
      // 模拟获取年度用电数据
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const yearlyUsage = Math.floor(month * 4500 + Math.random() * 1000);
      response = `今年至今总用电量为${yearlyUsage}kWh，比去年同期${Math.random() > 0.5 ? '减少了6%' : '增加了4%'}。预计全年用电量约为${Math.floor(yearlyUsage * 12 / month)}kWh。`;
    }
    // 峰值负荷
    else if (/峰值|最大|最高|峰时|用电高峰|负荷高峰|最大负荷|峰值功率/.test(input)) {
      // 模拟获取峰值负荷数据
      const peakHour = Math.floor(Math.random() * 4 + 13); // 13-16点范围
      const peakPower = Math.floor(Math.random() * 200 + 500);
      response = `今日峰值负荷出现在${peakHour}:00，达到${peakPower}kW，占变压器容量的${Math.floor(peakPower / 10)}%。`;
    }
    // 负荷分析
    else if (/负荷分析|负荷分布|用电分析|用电分布|负荷构成|能耗分析|能耗构成|能源构成|电力分析/.test(input)) {
      // 模拟获取负荷分析数据
      response = `当前用电负荷分析：空调系统占比42%，照明系统占比18%，动力设备占比25%，其他设备占比15%。主要耗电设备为中央空调和生产线电机。`;
    }
    // 节能建议
    else if (/节能|省电|节约用电|用电建议|降低用电|节约能源|节能措施/.test(input)) {
      // 提供节能建议
      response = `根据您的用电情况，建议：1. 优化空调温度设置，每提高1℃可节电约8%；2. 在17:00-21:00高峰时段减少大功率设备使用；3. 照明系统考虑更换为LED节能灯具；4. 下班后及时关闭不必要的设备电源。预计可节约用电约15%。`;
    }
    // 电费查询
    else if (/电费|电价|费用|花费|账单|电力成本|用电成本/.test(input)) {
      // 模拟电费数据
      const currentDate = new Date();
      const day = currentDate.getDate();
      const monthEstimate = Math.floor(day * 200 + Math.random() * 500);
      response = `本月预计电费约${monthEstimate}元，其中峰时电费占65%，谷时电费占35%。建议在电价低谷期（22:00-次日8:00）使用大功率设备，可节约电费约20%。`;
    }
    // 变压器负荷
    else if (/变压器|配电|配电室|电力设备|供电设备|供电情况/.test(input)) {
      // 模拟变压器负荷数据
      const transformerLoad = Math.floor(Math.random() * 30 + 60);
      response = `当前变压器负荷率${transformerLoad}%，运行状态良好。配电系统运行正常，所有支路电流均在额定范围内。`;
    }
    // 设备用电情况
    else if (/设备用电|什么设备|耗电设备|用电设备|主要设备|电器设备|用电器/.test(input)) {
      // 模拟设备用电情况
      response = `主要耗电设备排名：1.中央空调系统（占比38%）；2.生产线电机（占比22%）；3.照明系统（占比15%）；4.计算机设备（占比10%）；5.其他办公设备（占比15%）。`;
    }
    // 常规问答处理
    else if (input.includes('你好') || input.includes('hi') || input.includes('hello')) {
      response = '您好，有什么可以帮您的吗？您可以让我为您打开工作台、电力监控或电能分析页面，也可以查询用电数据。';
    } 
    else if (input.includes('电力') || input.includes('用电')) {
      response = '我可以为您查询电力使用情况、分析用电趋势，或者提供节能建议。您也可以让我打开电力监控页面查看详情。试试问我"当前用电量是多少"或"本月用电情况"。';
    }
    else if (input.includes('数据') || input.includes('统计')) {
      response = '我可以为您分析用电数据、生成统计报表，或者比较不同时期的用电情况。您可以让我为您打开电能分析页面查看详细数据，或直接问我"今日用电量"、"负荷分析"等问题。';
    }
    else if (input.includes('功能') || input.includes('帮助') || input.includes('指令')) {
      response = '我可以帮助您：1. 查询和分析用电数据 2. 提供电力使用建议 3. 回答电力系统相关问题 4. 使用语音导航到系统不同功能区，例如说"打开电力监控"即可跳转。您还可以询问"当前功率"、"今日用电量"或"负荷分析"等。';
    }
    else if (input.includes('搜索')) {
      response = '请输入您要搜索的关键词，例如"今日用电量"、"峰值负荷"等，我会为您查找相关信息。';
    }
    else {
      response = '感谢您的询问。我可以回答关于电力使用的各类问题，如"当前用电量"、"负荷分析"、"节能建议"等。您也可以尝试语音导航功能，例如说"打开电力监控"、"进入工作台"或"返回首页"等。';
    }
    
    // 添加AI回复到消息数组开头
    this.messages.unshift({ type: 'ai', content: response });
    
    // 更新对话区域和历史查询区域
    this.renderMessages();
    this.renderSearchHistory();
  }

  // 保存AI助手状态以便在导航后恢复
  saveStateBeforeNavigation() {
    // 保存消息记录（限制为最多8条对话）
    const messagesToSave = this.messages.length > 16 ? this.messages.slice(0, 16) : this.messages;
    localStorage.setItem('aiAssistantMessages', JSON.stringify(messagesToSave));
    // 保存助手打开状态
    localStorage.setItem('aiAssistantOpen', 'true');
  }

  // 初始化语音识别功能
  initSpeechRecognition() {
    // 检查浏览器是否支持语音识别
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // 创建语音识别对象
      this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      
      // 配置语音识别
      this.recognition.continuous = false;  // 不连续识别
      this.recognition.interimResults = true; // 获取中间结果
      this.recognition.lang = 'zh-CN';     // 设置语言为中文
      
      // 结果处理
      this.recognition.onresult = (event) => {
        let transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        
        // 移除标点符号
        transcript = this.removeAllPunctuation(transcript);
          
        // 将识别结果显示在输入框
        if (this.input) {
          this.input.value = transcript;
          
          // 如果是最终结果，更新波形文本
          if (event.results[0].isFinal && this.waveContainer) {
            const textElement = this.waveContainer.querySelector('.voice-text-inline');
            if (textElement) {
              textElement.textContent = "已识别：" + transcript;
            }
            
            // 如果是最终结果，并且有识别内容，在1秒后自动停止录音
            if (transcript.trim()) {
              setTimeout(() => {
                this.stopVoiceRecording();
              }, 1000);
            }
          }
        }
      };
      
      // 错误处理
      this.recognition.onerror = (event) => {
        console.error('语音识别错误:', event.error);
        
        // 显示错误信息
        if (this.waveContainer) {
          const textElement = this.waveContainer.querySelector('.voice-text-inline');
          if (textElement) {
            textElement.textContent = "识别错误，请重试";
          }
        }
        
        // 停止录音
        setTimeout(() => {
          this.stopVoiceRecording();
        }, 1500);
      };
      
      // 结束事件
      this.recognition.onend = () => {
        // 如果仍在录音中且没有手动停止，则继续录音
        if (this.isRecording && !this.manualStopped) {
          try {
            this.recognition.start();
          } catch(e) {
            console.error('重新启动语音识别失败:', e);
            this.stopVoiceRecording();
          }
        }
      };
    } else {
      console.warn('浏览器不支持语音识别功能');
    }
  }

  // 移除文本中的所有标点符号
  removeAllPunctuation(text) {
    // 移除中文和英文标点符号
    return text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()。，、；：？！…—·''""〝〞《》「」『』〈〉【】（）]/g, '');
  }

  // 开始语音录音
  startVoiceRecording() {
    if (this.isRecording) return; // 防止重复启动
    
    this.isRecording = true;
    this.manualStopped = false;
    
    // 更新麦克风按钮状态
    const voiceBtn = this.panel.querySelector('.voice-btn');
    voiceBtn.classList.add('recording');
    
    // 保存输入框的原始内容，以便恢复
    this.originalPlaceholder = this.input.placeholder;
    
    // 清空输入框并添加波形动画到输入框内
    this.input.value = '';
    this.input.placeholder = '';
    this.input.classList.add('recording-input');
    
    // 创建波形动画并插入到输入框中
    const waveContainer = document.createElement('div');
    waveContainer.className = 'voice-wave-container-inline';
    
    // 创建波形条
    const barsHTML = Array(5).fill(0).map(() => `<div class="wave-bar-inline"></div>`).join('');
    
    waveContainer.innerHTML = `
      <div class="wave-bars-inline">
        ${barsHTML}
      </div>
      <span class="voice-text-inline">点击麦克风按钮停止录音...</span>
    `;
    
    // 添加到输入框中
    this.input.parentNode.insertBefore(waveContainer, this.input.nextSibling);
    this.waveContainer = waveContainer;
    
    // 启动真实的语音识别
    if (this.recognition) {
      try {
        this.recognition.start();
        console.log('语音识别已启动');
      } catch (error) {
        console.error('启动语音识别失败:', error);
        // 如果启动失败，显示错误信息
        const textElement = waveContainer.querySelector('.voice-text-inline');
        if (textElement) {
          textElement.textContent = "无法启动识别，请重试";
        }
        
        // 延迟停止录音
        setTimeout(() => this.stopVoiceRecording(), 1500);
      }
    } else {
      // 浏览器不支持语音识别
      const textElement = waveContainer.querySelector('.voice-text-inline');
      if (textElement) {
        textElement.textContent = "您的浏览器不支持语音识别";
      }
      
      // 延迟停止录音
      setTimeout(() => this.stopVoiceRecording(), 2000);
    }
  }
  
  // 停止语音录音
  stopVoiceRecording() {
    if (!this.isRecording) return;
    
    this.isRecording = false;
    this.manualStopped = true;
    
    // 停止语音识别
    if (this.recognition) {
      try {
        this.recognition.stop();
        console.log('语音识别已停止');
      } catch (error) {
        console.error('停止语音识别失败:', error);
      }
    }
    
    // 获取当前输入框中的内容作为识别结果
    const recognizedText = this.input ? this.input.value.trim() : '';
    
    // 移除波形动画
    if (this.waveContainer) {
      // 添加淡出动画后移除
      this.waveContainer.style.animation = 'fadeOut 0.3s ease forwards';
      setTimeout(() => {
        if (this.waveContainer && this.waveContainer.parentElement) {
          this.waveContainer.remove();
        }
        this.waveContainer = null;
      }, 300);
    }
    
    // 更新麦克风按钮状态
    const voiceBtn = this.panel.querySelector('.voice-btn');
    if (voiceBtn) {
      voiceBtn.classList.remove('recording');
    }
    
    // 恢复输入框
    if (this.input) {
      this.input.classList.remove('recording-input');
      // 如果没有识别到内容，则恢复原始placeholder
      if (!recognizedText) {
        if (this.originalPlaceholder) {
          this.input.placeholder = this.originalPlaceholder;
        } else {
          this.input.placeholder = "输入问题或点击麦克风";
        }
        return; // 没有识别到内容，不继续处理
      }
    }
    
    // 如果有识别到内容，显示处理提示
    if (recognizedText) {
      // 显示"正在处理..."的提示
      const processingMessage = document.createElement('div');
      processingMessage.className = 'processing-message';
      
      // 根据内容判断是导航指令还是普通查询
      const isNavigationCommand = this.isNavigationCommand(recognizedText);
      processingMessage.textContent = isNavigationCommand ? 
                                     '正在准备导航...' : 
                                     '正在合成查询结果...';
      
      this.panel.appendChild(processingMessage);
      
      // 延迟发送，模拟处理时间
      setTimeout(() => {
        if (processingMessage.parentElement) {
          processingMessage.remove();
        }
        // 自动发送识别结果
        this.sendMessage();
      }, 600);
    }
  }
  
  // 判断是否是导航指令
  isNavigationCommand(text) {
    const navigationPatterns = [
      /打开(工作台|仪表盘|电力监控|能源监控|电能分析|能源分析|用电分析|首页|主页)/i,
      /(进入|跳转到|前往|转到)(工作台|仪表盘|电力监控|能源监控|电能分析|能源分析|用电分析|首页|主页)/i,
      /(工作台|电力监控|电能分析|首页)/,
      /返回|后退|上一页/i
    ];
    
    return navigationPatterns.some(pattern => pattern.test(text));
  }

  // 下载对话记录
  downloadConversation() {
    if (this.messages.length === 0) {
      alert('没有可下载的对话记录');
      return;
    }

    // 准备对话内容
    let content = '电力系统AI助手对话记录\n';
    content += `导出时间: ${new Date().toLocaleString()}\n\n`;

    // 使用正向顺序展示对话（最早的在前）
    const orderedMessages = [...this.messages].reverse();
    
    // 格式化对话内容
    orderedMessages.forEach((msg, index) => {
      const speaker = msg.type === 'user' ? '用户' : 'AI助手';
      content += `${speaker}: ${msg.content}\n`;
      
      // 每对对话之间增加换行符
      if (index < orderedMessages.length - 1 && msg.type === 'ai') {
        content += '\n';
      }
    });

    // 创建下载链接
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `电力系统AI对话记录_${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  // 清空对话记录
  clearConversation() {
    if (this.messages.length <= 1) {
      alert('对话记录已为空');
      return;
    }

    // 确认是否清空
    if (confirm('确定要清空所有对话记录吗？')) {
      // 保留一条初始欢迎消息
      this.messages = [{
        type: 'ai',
        content: '您好，我可以回答问题、提供电力数据分析，或者帮您导航到系统不同功能区。请问有什么可以帮您？'
      }];
      
      // 更新UI
      this.renderMessages();
      this.renderSearchHistory();
      
      // 清除本地存储中的对话记录
      localStorage.removeItem('aiAssistantMessages');
      
      // 提示用户
      alert('对话记录已清空');
    }
  }
}

// 页面加载完成后初始化AI助手
// 注释掉这里的自动初始化，因为每个页面末尾都有专门的初始化代码
// document.addEventListener('DOMContentLoaded', () => {
//  console.log('初始化AI助手...');
//  window.aiAssistant = new AIAssistant();
// });
