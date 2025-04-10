document.addEventListener('DOMContentLoaded', () => {
    console.log('Power Analysis page loaded');
    
    // 初始化侧边栏导航
    initSidebar();
    
    // 初始化电能分析页面内容
    initPowerAnalysis();
});

/**
 * 初始化侧边栏导航
 */
function initSidebar() {
    // 侧边栏切换
    const navToggle = document.querySelector('.nav-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (navToggle && sidebar) {
        navToggle.addEventListener('click', () => {
            sidebar.classList.toggle('expanded');
        });
    }
    
    // 初始化导航项点击事件
    const navItems = document.querySelectorAll('.nav-item');
    
    if (navItems.length) {
        navItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            if (!link) return;
            
            link.addEventListener('click', (e) => {
                // 如果链接没有href或者是#，阻止默认行为并显示提示
                if (!link.getAttribute('href') || link.getAttribute('href') === '#') {
                    e.preventDefault();
                    console.log('该功能暂未实现');
                    alert('该功能页面正在开发中');
                }
                // 有效链接正常跳转，不做任何操作
            });
        });
    }
}

/**
 * 初始化电能分析页面内容
 */
function initPowerAnalysis() {
    // 初始化图表等组件
    setTimeout(() => {
        initDonutChart();
        initLoadCurveChart();
        initTieredElectricityChart();
        
        // 添加事件监听器
        addEventListeners();
    }, 100);
}

/**
 * 初始化环形图
 */
function initDonutChart() {
    const chartElement = document.getElementById('donut-chart');
    if (!chartElement) return;
    
    // 饼图数据
    const data = [
        { name: '照明负荷', value: 32, color: '#4CA6FF' },
        { name: '动力负荷', value: 45, color: '#29B061' },
        { name: '空调负荷', value: 18, color: '#FFC168' },
        { name: '其他负荷', value: 5, color: '#F95E5A' }
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
    
    // 饼图中心和半径
    const centerX = 90;
    const centerY = 90;
    const outerRadius = 80;
    const innerRadius = 62;
    
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
}

/**
 * 初始化负荷曲线折线图
 */
function initLoadCurveChart() {
    const ctx = document.getElementById('loadCurveChart').getContext('2d');
    if (!ctx) return;
    
    // 模拟一天24小时的数据
    const hours = Array.from({length: 24}, (_, i) => `${i}:00`);
    
    // 有功功率数据 (kW)
    const activePowerData = [
        85, 72, 65, 60, 58, 62, 90, 110, 145, 158, 
        165, 172, 168, 175, 182, 176, 168, 180, 172, 
        152, 140, 125, 108, 95
    ];
    
    // 无功功率数据 (kvar)
    const reactivePowerData = [
        28, 25, 22, 20, 19, 21, 30, 36, 48, 52, 
        54, 56, 55, 58, 60, 58, 55, 59, 56, 
        50, 46, 41, 35, 30
    ];
    
    // 设置Canvas元素
    const chartContainer = document.querySelector('.load-curve-chart-container');
    const chartCanvas = document.getElementById('loadCurveChart');
    
    if (!chartContainer || !chartCanvas) return;
    
    // 重置canvas尺寸
    const containerRect = chartContainer.getBoundingClientRect();
    chartCanvas.width = containerRect.width;
    chartCanvas.height = containerRect.height;
    
    // 创建图表
    const loadCurveChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [
                {
                    label: '有功功率',
                    data: activePowerData,
                    borderColor: '#4CA6FF',
                    backgroundColor: 'rgba(76, 166, 255, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointBackgroundColor: '#4CA6FF'
                },
                {
                    label: '无功功率',
                    data: reactivePowerData,
                    borderColor: '#FFC168',
                    backgroundColor: 'rgba(255, 193, 104, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointBackgroundColor: '#FFC168'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 10,
                    right: 20,
                    bottom: 30,
                    left: 20
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y;
                                if (context.datasetIndex === 0) {
                                    label += ' kW';
                                } else {
                                    label += ' kvar';
                                }
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 12,
                        color: '#999',
                        font: {
                            size: 11
                        },
                        padding: 8
                    },
                    border: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value;
                        },
                        color: '#999',
                        maxTicksLimit: 8,
                        font: {
                            size: 11
                        },
                        padding: 10
                    },
                    border: {
                        display: false
                    }
                }
            },
            elements: {
                line: {
                    borderJoinStyle: 'round',
                    borderWidth: 2
                }
            },
            animation: {
                duration: 1000
            }
        }
    });
    
    // 窗口大小变化时重新调整图表
    function resizeChart() {
        if (!chartContainer || !chartCanvas) return;
        
        // 获取容器实际尺寸
        const rect = chartContainer.getBoundingClientRect();
        
        // 设置canvas尺寸
        chartCanvas.style.width = '100%';
        chartCanvas.style.height = '90%'; // 调整为90%高度，避免溢出
        chartCanvas.style.position = 'relative';
        chartCanvas.style.top = '0';
        
        // 重绘图表
        loadCurveChart.resize();
        loadCurveChart.update();
    }
    
    // 添加窗口大小变化监听
    window.addEventListener('resize', debounce(resizeChart, 250));
    
    // 初次调用以确保正确尺寸
    setTimeout(resizeChart, 50);
    
    return loadCurveChart;
}

/**
 * 防抖函数，避免频繁调用
 */
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

/**
 * 添加事件监听器
 */
function addEventListeners() {
    // 选择器点击事件
    const selectors = document.querySelectorAll('.selector');
    selectors.forEach(selector => {
        selector.addEventListener('click', function() {
            console.log('选择器被点击:', this.id);
            // 这里可以添加弹出选择菜单的逻辑
        });
    });
    
    // 单选项处理
    const radioItems = document.querySelectorAll('.radio-item');
    radioItems.forEach(item => {
        item.addEventListener('click', function() {
            const radioGroup = this.closest('.radio-group');
            
            // 移除所有单选按钮的活动状态
            radioGroup.querySelectorAll('.radio-item').forEach(ri => {
                ri.querySelector('.radio-circle').classList.remove('active');
                const label = ri.querySelector('.radio-label');
                if (label) label.classList.remove('active');
            });
            
            // 设置当前单选按钮的活动状态
            const circle = this.querySelector('.radio-circle');
            if (circle) circle.classList.add('active');
            
            const label = this.querySelector('.radio-label');
            if (label) label.classList.add('active');
        });
    });
}

// 初始化其他图表
function initOtherCharts() {
    // 其他图表初始化代码可以根据需要添加
}

// 初始化页面交互
function initInteractions() {
    // 侧边栏交互等
    const navToggle = document.querySelector('.nav-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (navToggle && sidebar) {
        navToggle.addEventListener('click', function() {
            sidebar.classList.toggle('expanded');
        });
    }
}

/**
 * 初始化分时电量统计图表
 */
function initTieredElectricityChart() {
    const ctx = document.getElementById('tieredElectricityChart');
    if (!ctx) return;
    
    // 生成当月日期标签（假设当月有30天）
    const days = Array.from({length: 30}, (_, i) => `${i + 1}日`);
    
    // 模拟各时段每天的用电量数据（保持一定的趋势和相关性）
    const peakData = generateTrendData(30, 80, 150, 0.7); // 尖时段
    const highData = generateTrendData(30, 150, 250, 0.6); // 峰时段
    const normalData = generateTrendData(30, 200, 320, 0.8); // 平时段
    const valleyData = generateTrendData(30, 50, 120, 0.5); // 谷时段
    
    // 创建堆叠柱状图
    const tieredElectricityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [
                {
                    label: '尖时段',
                    data: peakData,
                    backgroundColor: 'rgba(255, 107, 107, 0.85)',
                    borderColor: 'rgba(255, 107, 107, 1)',
                    borderWidth: 1
                },
                {
                    label: '峰时段',
                    data: highData,
                    backgroundColor: 'rgba(255, 159, 64, 0.85)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 1
                },
                {
                    label: '平时段',
                    data: normalData,
                    backgroundColor: 'rgba(76, 166, 255, 0.85)',
                    borderColor: 'rgba(76, 166, 255, 1)',
                    borderWidth: 1
                },
                {
                    label: '谷时段',
                    data: valleyData,
                    backgroundColor: 'rgba(41, 176, 97, 0.85)',
                    borderColor: 'rgba(41, 176, 97, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 20,
                    right: 20,
                    bottom: 10,
                    left: 20
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 10,
                        color: '#999',
                        font: {
                            size: 11
                        }
                    },
                    border: {
                        display: false
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '电量 (kWh)',
                        color: '#666',
                        font: {
                            size: 12,
                            weight: 'normal'
                        },
                        padding: {
                            bottom: 10
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#999',
                        font: {
                            size: 11
                        },
                        padding: 8,
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    },
                    border: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#333',
                    bodyColor: '#666',
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1,
                    titleFont: {
                        size: 13,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 12
                    },
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toLocaleString() + ' kWh';
                            }
                            return label;
                        },
                        footer: function(tooltipItems) {
                            let sum = 0;
                            tooltipItems.forEach(function(tooltipItem) {
                                sum += tooltipItem.parsed.y;
                            });
                            return '总计: ' + sum.toLocaleString() + ' kWh';
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            barPercentage: 0.8,
            categoryPercentage: 0.9
        }
    });
    
    // 窗口大小变化时重新调整图表
    window.addEventListener('resize', debounce(function() {
        tieredElectricityChart.resize();
    }, 250));
    
    return tieredElectricityChart;
}

/**
 * 生成带有趋势的随机数据
 * @param {number} count - 数据点数量
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @param {number} smoothing - 平滑程度（0-1），值越高趋势越明显
 * @returns {Array} - 带有趋势的随机数据数组
 */
function generateTrendData(count, min, max, smoothing = 0.5) {
    const range = max - min;
    let value = min + Math.random() * range;
    const data = [];
    
    // 生成周期性趋势的随机数据
    for (let i = 0; i < count; i++) {
        // 添加周期性变化（工作日用电量上升，周末下降）
        const dayOfWeek = i % 7;
        let trend = 0;
        
        if (dayOfWeek >= 0 && dayOfWeek <= 4) {
            // 工作日：逐渐增加
            trend = Math.sin((dayOfWeek / 4) * Math.PI) * range * 0.2;
        } else {
            // 周末：下降
            trend = -Math.cos((dayOfWeek - 5) * Math.PI) * range * 0.15;
        }
        
        // 随机波动
        const random = (Math.random() * 2 - 1) * range * (1 - smoothing);
        
        // 更新值（平滑过渡）
        value = value * smoothing + (min + range / 2 + trend + random) * (1 - smoothing);
        
        // 确保值在范围内
        value = Math.max(min, Math.min(max, value));
        
        // 添加到数组
        data.push(Math.round(value));
    }
    
    return data;
} 