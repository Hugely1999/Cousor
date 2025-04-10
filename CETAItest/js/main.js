document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    
    // 初始化日历
    initCalendar();
    
    // 初始化圆形进度条
    initCircleProgress();
    
    // 初始化侧边栏展开/收起功能
    initSidebar();
    
    // 初始化常用功能
    initCommonItems();
    
    // 初始化导航项点击事件
    initNavItems();
});

/**
 * 初始化日历功能
 */
function initCalendar() {
    const daysContainer = document.querySelector('.days');
    const currentDateElement = document.querySelector('.calendar-header .date');
    const todayBtn = document.querySelector('.today-btn');
    
    if (!daysContainer || !currentDateElement || !todayBtn) return;
    
    // 获取当前日期信息
    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();
    
    // 更新日历
    function updateCalendar() {
        // 更新显示的年月
        currentDateElement.textContent = `${currentYear}/${padZero(currentMonth + 1)}/${padZero(today.getDate())}`;
        
        // 清空日历容器
        daysContainer.innerHTML = '';
        
        // 获取月份的第一天是星期几
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        
        // 获取月份的天数
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        // 添加前面的空白
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day empty';
            daysContainer.appendChild(emptyDay);
        }
        
        // 添加日期
        for (let i = 1; i <= daysInMonth; i++) {
            const day = document.createElement('div');
            day.className = 'day';
            
            // 如果是当天，添加active类
            if (i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
                day.classList.add('active');
            }
            
            day.textContent = i;
            daysContainer.appendChild(day);
        }
    }
    
    // 返回今日按钮
    todayBtn.addEventListener('click', () => {
        currentMonth = today.getMonth();
        currentYear = today.getFullYear();
        updateCalendar();
    });
    
    // 格式化数字，补零
    function padZero(num) {
        return num.toString().padStart(2, '0');
    }
    
    // 初始化日历
    updateCalendar();
}

/**
 * 初始化圆形进度条
 */
function initCircleProgress() {
    const circles = document.querySelectorAll('.circle-progress');
    
    circles.forEach(circle => {
        // 获取进度值
        const value = parseFloat(circle.getAttribute('data-value'));
        
        // 计算SVG路径
        const radius = 40; // 圆的半径
        const circumference = 2 * Math.PI * radius;
        const progress = value / 100;
        const dashoffset = circumference * (1 - progress);
        
        // 创建SVG元素
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.classList.add('circle-svg');
        
        // 创建背景圆
        const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        bgCircle.setAttribute('cx', '50');
        bgCircle.setAttribute('cy', '50');
        bgCircle.setAttribute('r', radius);
        bgCircle.setAttribute('fill', 'none');
        bgCircle.setAttribute('stroke', '#E0E4E8');
        bgCircle.setAttribute('stroke-width', '8');
        
        // 创建进度圆
        const progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        progressCircle.setAttribute('cx', '50');
        progressCircle.setAttribute('cy', '50');
        progressCircle.setAttribute('r', radius);
        progressCircle.setAttribute('fill', 'none');
        progressCircle.setAttribute('stroke', getProgressColor(value));
        progressCircle.setAttribute('stroke-width', '8');
        progressCircle.setAttribute('stroke-dasharray', circumference);
        progressCircle.setAttribute('stroke-dashoffset', dashoffset);
        progressCircle.setAttribute('transform', 'rotate(-90 50 50)');
        
        // 将圆添加到SVG
        svg.appendChild(bgCircle);
        svg.appendChild(progressCircle);
        
        // 在circle-progress前面插入SVG
        circle.insertBefore(svg, circle.firstChild);
    });
}

// 根据进度值获取颜色
function getProgressColor(value) {
    if(value < 30) return '#FF5252'; // 红色
    if(value < 60) return '#FFC107'; // 黄色
    return '#29B061'; // 绿色
}

// 补零函数
function padZero(num) {
    return num < 10 ? '0' + num : num;
}

// 添加CSS样式到HEAD
function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .days {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 4px;
        }
        
        .day {
            width: 30px;
            height: 30px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 12px;
            color: #333;
            border-radius: 4px;
            cursor: pointer;
        }
        
        .day:hover {
            background-color: #F5F7FA;
        }
        
        .day.today {
            background-color: #16A984;
            color: white;
        }
        
        .day.prev-month, .day.next-month {
            color: #C9CDD4;
        }
        
        .circle-svg {
            position: absolute;
            top: 0;
            left: 0;
        }
    `;
    document.head.appendChild(style);
}

// 页面加载后添加样式
addStyles();

/**
 * 初始化侧边栏展开/收起功能
 */
function initSidebar() {
    const navToggle = document.querySelector('.nav-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (!navToggle || !sidebar || !mainContent) return;
    
    // 从本地存储读取侧边栏状态
    const sidebarExpanded = localStorage.getItem('sidebarExpanded') === 'true';
    
    // 如果本地存储中记录了展开状态，则应用它
    if (sidebarExpanded) {
        sidebar.classList.add('expanded');
        mainContent.classList.add('expanded');
        navToggle.classList.add('active');
    }
    
    // 点击切换侧边栏展开/收起状态
    navToggle.addEventListener('click', () => {
        sidebar.classList.toggle('expanded');
        mainContent.classList.toggle('expanded');
        navToggle.classList.toggle('active');
        
        // 保存状态到本地存储
        localStorage.setItem('sidebarExpanded', sidebar.classList.contains('expanded'));
    });
}

/**
 * 初始化常用功能区
 * 常用功能作为快捷入口，点击后不保持选中状态
 */
function initCommonItems() {
    const commonItems = document.querySelectorAll('.common-item');
    
    if (!commonItems.length) return;
    
    // 确保初始状态下没有选中的常用功能项
    commonItems.forEach(item => {
        // 移除所有可能存在的active类
        item.classList.remove('active');
        
        // 添加点击事件，实现导航功能但不保持选中状态
        item.addEventListener('click', () => {
            const itemName = item.querySelector('span').textContent;
            console.log(`点击了常用功能: ${itemName}`);
            
            // 根据功能名称跳转到对应页面
            switch(itemName) {
                case '首页':
                    window.location.href = 'index.html';
                    break;
                case '工作台':
                    window.location.href = 'index.html';
                    break;
                case '电力监控':
                    window.location.href = 'power-monitoring.html';
                    break;
                default:
                    // 其他功能暂未实现
                    alert('该功能页面正在开发中');
                    break;
            }
        });
    });
}

/**
 * 初始化侧边栏导航项点击事件
 */
function initNavItems() {
    const navItems = document.querySelectorAll('.nav-item');
    
    if (!navItems.length) return;
    
    navItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        if (!link) return;
        
        link.addEventListener('click', (e) => {
            // 如果链接没有href或者是#，阻止默认行为并显示提示
            if (!link.getAttribute('href') || link.getAttribute('href') === '#') {
                e.preventDefault();
                // 显示通知
                console.log('该功能暂未实现');
                alert('该功能页面正在开发中');
            }
            // 有效链接正常跳转，不做任何操作
        });
    });
} 