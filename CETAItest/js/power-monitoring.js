document.addEventListener('DOMContentLoaded', () => {
    console.log('Power Monitoring page loaded');
    
    // 初始化电力监控页面内容
    initPowerMonitoring();
});

/**
 * 初始化电力监控页面内容
 */
function initPowerMonitoring() {
    // 加载页面内容
    loadPowerMonitoringContent();
    
    // 初始化图表等组件
    setTimeout(() => {
        initPieChart();
        initHorizontalBarChart();
        initTimeColumnChart();
    }, 100);
}

/**
 * 加载电力监控页面内容
 */
function loadPowerMonitoringContent() {
    const container = document.querySelector('.power-monitoring-container');
    if (!container) return;
    
    // 清空内容
    container.innerHTML = '';
    
    // 生成HTML内容
    const content = `
        <!-- 数据总览区域 -->
        <section class="data-overview-section">
            <h2 class="section-title">数据总览</h2>
            <div class="stats-card-container">
                <!-- 今日报警数据卡片 -->
                <div class="stat-card-item">
                    <div class="stat-card-content">
                        <div class="stat-card-icon">
                            <img src="images/power-monitoring/alarm-icon.svg" alt="报警图标">
                        </div>
                        <div class="stat-card-info">
                            <div class="stat-card-row">
                                <div class="stat-label">今日报警(条)</div>
                            </div>
                            <div class="stat-card-row">
                                <div class="stat-value">500</div>
                            </div>
                        </div>
                    </div>
                    <div class="stat-secondary">
                        <div class="stat-secondary-item">
                            <div class="stat-label">昨日报警(条)</div>
                            <div class="stat-value medium">400</div>
                        </div>
                        <div class="stat-secondary-item">
                            <div class="stat-label">环比昨日</div>
                            <div class="trend-indicator">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6 2L10 6L6 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M2 6H10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                25.00%
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 本月报警数据卡片 -->
                <div class="stat-card-item blue">
                    <div class="stat-card-content">
                        <div class="stat-card-icon blue">
                            <img src="images/power-monitoring/alarm-icon-blue.svg" alt="报警图标">
                        </div>
                        <div class="stat-card-info">
                            <div class="stat-card-row">
                                <div class="stat-label">本月报警(条)</div>
                            </div>
                            <div class="stat-card-row">
                                <div class="stat-value">4500</div>
                            </div>
                        </div>
                    </div>
                    <div class="stat-secondary">
                        <div class="stat-secondary-item">
                            <div class="stat-label">上月报警(条)</div>
                            <div class="stat-value medium">5000</div>
                        </div>
                        <div class="stat-secondary-item">
                            <div class="stat-label">环比上月</div>
                            <div class="trend-indicator down">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6 10L2 6L6 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M10 6H2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                10.00%
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 报警总数量数据卡片 -->
                <div class="stat-card-item purple">
                    <div class="stat-card-content">
                        <div class="stat-card-icon purple">
                            <img src="images/power-monitoring/alarm-icon-purple.svg" alt="报警图标">
                        </div>
                        <div class="stat-card-info">
                            <div class="stat-card-row">
                                <div class="stat-label">报警总数量(条)</div>
                            </div>
                            <div class="stat-card-row">
                                <div class="stat-value">4500</div>
                            </div>
                        </div>
                    </div>
                    <div class="stat-secondary">
                        <div class="stat-secondary-item">
                            <div class="stat-label">已确认(条)</div>
                            <div class="stat-value medium">500</div>
                        </div>
                        <div class="stat-secondary-item">
                            <div class="stat-label">未确认(条)</div>
                            <div class="stat-value medium">4000</div>
                        </div>
                    </div>
                </div>
                
                <!-- 工单总数量数据卡片 -->
                <div class="stat-card-item blue">
                    <div class="stat-card-content">
                        <div class="stat-card-icon blue">
                            <img src="images/power-monitoring/alarm-icon-blue.svg" alt="报警图标">
                        </div>
                        <div class="stat-card-info">
                            <div class="stat-card-row">
                                <div class="stat-label">工单总数量(条)</div>
                            </div>
                            <div class="stat-card-row">
                                <div class="stat-value">2800</div>
                            </div>
                        </div>
                    </div>
                    <div class="stat-secondary">
                        <div class="stat-secondary-item">
                            <div class="stat-label">已派单(条)</div>
                            <div class="stat-value medium">800</div>
                        </div>
                        <div class="stat-secondary-item">
                            <div class="stat-label">未派单(条)</div>
                            <div class="stat-value medium">2000</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        
        <!-- 分析图表区域 -->
        <section class="analysis-section">
            <!-- 报警事件等级占比 -->
            <div class="analysis-card">
                <div class="analysis-card-header">
                    <h3 class="analysis-card-title">报警事件等级占比</h3>
                </div>
                <div class="pie-chart-container">
                    <div class="pie-chart" id="event-level-chart">
                        <div class="pie-chart-info">
                            <div class="pie-chart-total-label">总事件</div>
                            <div class="pie-chart-total-value">2824</div>
                        </div>
                    </div>
                    <div class="pie-legend">
                        <div class="legend-item">
                            <div class="legend-color red"></div>
                            <div class="legend-name">事故</div>
                            <div class="legend-percent">1.06%</div>
                            <div class="legend-count">30条</div>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color orange"></div>
                            <div class="legend-name">告警</div>
                            <div class="legend-percent">0.85%</div>
                            <div class="legend-count">24条</div>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color green"></div>
                            <div class="legend-name">一般</div>
                            <div class="legend-percent">70.82%</div>
                            <div class="legend-count">2000条</div>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color blue"></div>
                            <div class="legend-name">预警</div>
                            <div class="legend-percent">2.48%</div>
                            <div class="legend-count">70条</div>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color cyan"></div>
                            <div class="legend-name">其他</div>
                            <div class="legend-percent">24.79%</div>
                            <div class="legend-count">700条</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 报警点位分析 -->
            <div class="analysis-card">
                <div class="analysis-card-header">
                    <h3 class="analysis-card-title">报警点位分析</h3>
                    <button class="view-distribution-btn">查看点位分布</button>
                </div>
                <div class="bar-chart-container">
                    <div class="bar-chart-header">
                        <div class="bar-chart-y-axis">
                            <div class="bar-chart-y-label">120</div>
                            <div class="bar-chart-y-label">100</div>
                            <div class="bar-chart-y-label">80</div>
                            <div class="bar-chart-y-label">60</div>
                            <div class="bar-chart-y-label">40</div>
                            <div class="bar-chart-y-label">20</div>
                            <div class="bar-chart-y-label">0</div>
                        </div>
                    </div>
                    <div class="bar-chart-content">
                        <div class="bar-chart-grid">
                            <div class="bar-chart-grid-line"></div>
                            <div class="bar-chart-grid-line"></div>
                            <div class="bar-chart-grid-line"></div>
                            <div class="bar-chart-grid-line"></div>
                            <div class="bar-chart-grid-line"></div>
                            <div class="bar-chart-grid-line"></div>
                        </div>
                        
                        <!-- 柱状图数据将通过JS动态生成 -->
                    </div>
                </div>
            </div>
            
            <!-- 报警事件类型分析 -->
            <div class="analysis-card">
                <div class="analysis-card-header">
                    <h3 class="analysis-card-title">报警事件类型分析</h3>
                </div>
                <div class="bar-chart-container">
                    <div class="bar-chart-header">
                        <div class="bar-chart-y-axis">
                            <div class="bar-chart-y-label">120</div>
                            <div class="bar-chart-y-label">100</div>
                            <div class="bar-chart-y-label">80</div>
                            <div class="bar-chart-y-label">60</div>
                            <div class="bar-chart-y-label">40</div>
                            <div class="bar-chart-y-label">20</div>
                            <div class="bar-chart-y-label">0</div>
                        </div>
                    </div>
                    <div class="bar-chart-content">
                        <div class="bar-chart-grid">
                            <div class="bar-chart-grid-line"></div>
                            <div class="bar-chart-grid-line"></div>
                            <div class="bar-chart-grid-line"></div>
                            <div class="bar-chart-grid-line"></div>
                            <div class="bar-chart-grid-line"></div>
                            <div class="bar-chart-grid-line"></div>
                        </div>
                        
                        <!-- 柱状图数据将通过JS动态生成 -->
                    </div>
                </div>
            </div>
        </section>
        
        <!-- 报警事件总数统计图表 -->
        <section class="statistics-section">
            <div class="chart-header">
                <h3 class="analysis-card-title">报警事件总数统计</h3>
                <div class="time-selector">2022-03</div>
            </div>
            <div class="units-label">单位(条)</div>
            <div class="time-column-chart" id="time-column-chart">
                <div class="time-column-chart-y-axis">
                    <div class="bar-chart-y-label">500</div>
                    <div class="bar-chart-y-label">400</div>
                    <div class="bar-chart-y-label">300</div>
                    <div class="bar-chart-y-label">200</div>
                    <div class="bar-chart-y-label">100</div>
                    <div class="bar-chart-y-label">0</div>
                </div>
                <div class="time-column-chart-grid">
                    <div class="bar-chart-grid-line"></div>
                    <div class="bar-chart-grid-line"></div>
                    <div class="bar-chart-grid-line"></div>
                    <div class="bar-chart-grid-line"></div>
                    <div class="bar-chart-grid-line"></div>
                </div>
                <div class="time-column-chart-bars" id="time-column-chart-bars">
                    <!-- 动态生成的柱状图 -->
                </div>
                <div class="time-column-chart-x-axis" id="time-column-chart-x-axis">
                    <!-- 动态生成的X轴标签 -->
                </div>
            </div>
        </section>
    `;
    
    // 将内容添加到容器中
    container.innerHTML = content;
    
    // 添加事件监听器
    addEventListeners();
}

/**
 * 初始化饼图
 */
function initPieChart() {
    const chartElement = document.getElementById('event-level-chart');
    if (!chartElement) return;
    
    // 清空现有内容，保留总事件信息
    const infoElement = chartElement.querySelector('.pie-chart-info');
    chartElement.innerHTML = '';
    if (infoElement) {
        chartElement.appendChild(infoElement);
    }
    
    // 饼图数据
    const data = [
        { name: '事故', value: 30, percent: '1.06%', color: '#FF5B5A' },
        { name: '告警', value: 24, percent: '0.85%', color: '#FFC168' },
        { name: '一般', value: 2000, percent: '70.82%', color: '#29B061' },
        { name: '预警', value: 70, percent: '2.48%', color: '#5C94FF' },
        { name: '其他', value: 700, percent: '24.79%', color: '#00A2FF' }
    ];
    
    // 创建SVG元素
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "180");
    svg.setAttribute("height", "180");
    svg.setAttribute("viewBox", "0 0 180 180");
    svg.style.position = "absolute";
    svg.style.left = "0";
    svg.style.top = "0";
    
    // 计算总和
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    // 饼图中心
    const centerX = 90;
    const centerY = 90;
    
    // 饼图半径
    const outerRadius = 80; // 进一步增大外环半径
    const innerRadius = outerRadius - 18;  // 增加环宽到18px
    
    // 绘制环形图
    let startAngle = 0;
    
    data.forEach((item) => {
        // 计算角度
        const percentage = item.value / total;
        const angle = percentage * 360;
        const endAngle = startAngle + angle;
        
        // 转换为弧度
        const startRad = (startAngle - 90) * Math.PI / 180;
        const endRad = (endAngle - 90) * Math.PI / 180;
        
        // 计算弧线路径的点
        const x1 = centerX + innerRadius * Math.cos(startRad);
        const y1 = centerY + innerRadius * Math.sin(startRad);
        const x2 = centerX + outerRadius * Math.cos(startRad);
        const y2 = centerY + outerRadius * Math.sin(startRad);
        const x3 = centerX + outerRadius * Math.cos(endRad);
        const y3 = centerY + outerRadius * Math.sin(endRad);
        const x4 = centerX + innerRadius * Math.cos(endRad);
        const y4 = centerY + innerRadius * Math.sin(endRad);
        
        // 确定是否需要大弧
        const largeArcFlag = angle > 180 ? 1 : 0;
        
        // 构建路径数据
        const path = document.createElementNS(svgNS, "path");
        const d = [
            `M ${x1} ${y1}`,
            `L ${x2} ${y2}`,
            `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}`,
            `L ${x4} ${y4}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}`,
            `Z`
        ].join(" ");
        
        path.setAttribute("d", d);
        path.setAttribute("fill", item.color);
        
        svg.appendChild(path);
        
        // 更新起始角度
        startAngle = endAngle;
    });
    
    // 将SVG添加到图表容器
    chartElement.appendChild(svg);
    
    console.log('饼图初始化完成');
}

/**
 * 初始化横向柱状图
 */
function initHorizontalBarChart() {
    // 获取两个柱状图容器
    const barContainers = document.querySelectorAll('.bar-chart-content');
    
    if (barContainers.length < 2) return;
    
    // 清空现有内容
    barContainers.forEach(container => {
        container.innerHTML = '';
    });
    
    // 设备跳闸次数数据 - 减少为5个条目
    const equipmentData = [
        { name: "XX变电站1号", value: 98 },
        { name: "YY变电站主控", value: 85 },
        { name: "ZZ变电站配电", value: 76 },
        { name: "XX变电站2号", value: 65 },
        { name: "AA发电厂变电", value: 55 }
    ];
    
    // 告警事件类型数据 - 减少为5个条目
    const alarmData = [
        { name: "开关闭合事件", value: 95 },
        { name: "开关打开事件", value: 85 },
        { name: "掉电事件", value: 75 },
        { name: "保护动作事件", value: 68 },
        { name: "线损异常事件", value: 52 }
    ];
    
    // 生成横向柱状图
    convertToHorizontalBars(barContainers[0], equipmentData, 'blue');
    convertToHorizontalBars(barContainers[1], alarmData, '');
}

function convertToHorizontalBars(container, data, colorClass) {
    // 找出最大值，用于计算宽度百分比
    const maxValue = Math.max(...data.map(item => item.value));
    
    // 对数据进行排序 - 从大到小
    const sortedData = [...data].sort((a, b) => b.value - a.value);
    
    // 创建柱状图容器
    const barItems = document.createElement('div');
    barItems.className = 'horizontal-bars-container';
    
    // 遍历数据创建横向柱状图
    sortedData.forEach((item, index) => {
        // 创建每个条目的容器
        const barItem = document.createElement('div');
        barItem.className = 'horizontal-bar-item';
        
        // 创建标签
        const label = document.createElement('div');
        label.className = 'horizontal-bar-label';
        label.textContent = item.name;
        
        // 创建柱子容器
        const barContainer = document.createElement('div');
        barContainer.className = 'horizontal-bar-container';
        
        // 创建柱子
        const bar = document.createElement('div');
        bar.className = `horizontal-bar ${colorClass}`;
        
        // 设置初始宽度为0，稍后添加动画
        bar.style.width = '0%';
        
        // 创建值标签
        const valueLabel = document.createElement('span');
        valueLabel.className = 'horizontal-bar-value';
        valueLabel.textContent = item.value;
        
        // 组装元素
        barContainer.appendChild(bar);
        barContainer.appendChild(valueLabel);
        barItem.appendChild(label);
        barItem.appendChild(barContainer);
        barItems.appendChild(barItem);
        
        // 使用setTimeout添加动画效果，延迟时间根据索引递增
        setTimeout(() => {
            // 调整为90%最大宽度，留出更多空间给数值标签
            bar.style.width = `${(item.value / maxValue) * 90}%`;
        }, 50 + index * 80); // 减少动画延迟，使图表显示更快
    });
    
    // 添加到容器
    container.appendChild(barItems);
}

/**
 * 初始化时间柱状图
 */
function initTimeColumnChart() {
    const bars = document.getElementById('time-column-chart-bars');
    const xAxis = document.getElementById('time-column-chart-x-axis');
    
    if (!bars || !xAxis) return;
    
    // 模拟数据
    const daysInMonth = 31;
    const data = [];
    
    for (let i = 1; i <= daysInMonth; i++) {
        // 生成随机高度 (20-180)
        const height = Math.floor(Math.random() * 160) + 20;
        data.push({
            day: i,
            value: height
        });
    }
    
    // 生成柱状图
    let barsHtml = '';
    let xAxisHtml = '';
    
    data.forEach(item => {
        barsHtml += `<div class="time-column-bar" style="height: ${item.value}px;"></div>`;
        xAxisHtml += `<div class="bar-chart-x-label">${item.day}</div>`;
    });
    
    bars.innerHTML = barsHtml;
    xAxis.innerHTML = xAxisHtml;
    
    console.log('时间柱状图初始化完成');
}

/**
 * 添加事件监听器
 */
function addEventListeners() {
    // 获取查看点位分布按钮
    const viewDistributionBtn = document.querySelector('.view-distribution-btn');
    
    if (viewDistributionBtn) {
        viewDistributionBtn.addEventListener('click', () => {
            alert('查看点位分布功能将在后续版本中实现');
        });
    }
} 