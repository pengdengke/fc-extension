document.addEventListener('DOMContentLoaded', function () {
    // 等待 DOM 完全加载
    setTimeout(() => {
        // 初始化图表
        const flowEChart = document.getElementById('flowEChart');
        if (!flowEChart) {
            console.error('找不到 flowEChart 元素');
            return;
        }

        const flowChart = echarts.init(flowEChart);

        // 默认配置
        const option = {
            series: [
                {
                    type: 'gauge',
                    radius: '100%',
                    center: ['50%', '60%'],
                    startAngle: 180,
                    endAngle: 0,
                    min: 0,
                    max: 100,
                    axisLine: {
                        lineStyle: {
                            width: 30,
                            color: [
                                [0.8, '#4CAF50'],  // 绿色
                                [0.9, '#FFA500'],  // 黄色
                                [1, '#FF0000']     // 红色
                            ]
                        }
                    },
                    pointer: {
                        itemStyle: {
                            color: '#4CAF50'  // 默认使用绿色
                        }
                    },
                    axisTick: {
                        distance: -30,
                        length: 8,
                        lineStyle: {
                            color: '#fff',
                            width: 2
                        }
                    },
                    splitLine: {
                        distance: -30,
                        length: 30,
                        lineStyle: {
                            color: '#fff',
                            width: 4
                        }
                    },
                    axisLabel: {
                        color: 'inherit',
                        distance: 35,
                        fontSize: 15
                    },
                    detail: {
                        valueAnimation: true,
                        color: 'inherit',
                        formatter: '{value|0}{unit|GB}\n{total|总流量: 0GB}',
                        rich: {
                            value: {
                                fontSize: 36,
                                fontWeight: 'bolder',
                                color: '#4CAF50'  // 默认使用绿色
                            },
                            unit: {
                                fontSize: 16,
                                color: '#999',
                                padding: [0, 0, -20, 10]
                            },
                            total: {
                                fontSize: 14,
                                color: '#999',
                                padding: [10, 0, 0, 0]
                            }
                        }
                    },
                    data: [
                        {
                            value: 0,
                            itemStyle: {
                                color: '#4CAF50'  // 默认使用绿色
                            }
                        }
                    ]
                }
            ]
        };

        // 设置初始配置
        flowChart.setOption(option);

        // 更新图表数据
        function updateChart(usedFlow, totalFlow) {
            // 转换成GB
            usedFlow = usedFlow / 1000 / 1000 / 1000;
            totalFlow = totalFlow / 1000 / 1000 / 1000;
            // 保留两位小数
            usedFlow = usedFlow.toFixed(3);
            totalFlow = totalFlow.toFixed(3);

            // 计算百分比值 (0-100)
            const percentage = (parseFloat(usedFlow) / parseFloat(totalFlow)) * 100;
            option.series[0].data[0].value = percentage;

            option.series[0].detail.formatter = function (value) {
                return '{value|' + usedFlow + '}{unit|GB}\n{total|总流量: ' + totalFlow + 'GB}';
            };

            // 根据百分比设置颜色
            let color = '#4CAF50';  // 默认绿色
            if (percentage >= 90) {
                color = '#FF0000';  // 红色
            } else if (percentage >= 80) {
                color = '#FFA500';  // 黄色
            }

            option.series[0].data[0].itemStyle.color = color;
            option.series[0].pointer.itemStyle.color = color;
            option.series[0].detail.rich.value.color = color;

            flowChart.setOption(option);
        }

        // 获取数据的函数
        function fetchFlowData() {
            chrome.storage.local.get(['flowData'], function (result) {
                if (result.flowData && result.flowData.url && result.flowData.totalFlowParamName && result.flowData.usedFlowParamName) {
                    // 通过后台脚本发送请求
                    chrome.runtime.sendMessage({
                        type: 'fetchData',
                        url: result.flowData.url
                    }, function (response) {
                        if (response && response.success) {
                            const data = response.data;
                            const totalFlow = parseFloat(data[result.flowData.totalFlowParamName]);
                            const usedFlow = parseFloat(data[result.flowData.usedFlowParamName]);

                            if (!isNaN(totalFlow) && !isNaN(usedFlow)) {
                                updateChart(usedFlow, totalFlow);
                            }
                        } else {
                            console.error('获取数据失败:', response ? response.error : '未知错误');
                            updateChart(0, 100);
                        }
                    });
                } else {
                    // 如果没有配置URL和参数名，显示0
                    updateChart(0, 100);
                }
            });
        }

        // 设置定时任务
        function setupTimer() {
            chrome.storage.local.get(['flowData'], function (result) {
                if (result.flowData && result.flowData.updateInterval) {
                    const updateInterval = parseInt(result.flowData.updateInterval);
                    if (!isNaN(updateInterval) && updateInterval > 0) {
                        // 清除之前的定时器（如果存在）
                        if (window.flowUpdateTimer) {
                            clearInterval(window.flowUpdateTimer);
                        }
                        // 设置新的定时器
                        window.flowUpdateTimer = setInterval(fetchFlowData, updateInterval * 1000);
                        console.log('已设置定时更新，间隔：', updateInterval, '秒');
                    }
                }
            });
        }

        // 监听存储变化
        chrome.storage.onChanged.addListener(function (changes, namespace) {
            if (namespace === 'local' && changes.flowData) {
                // 配置发生变化时重新设置定时器
                setupTimer();
                // 立即获取一次数据
                fetchFlowData();
            }
        });

        // 初始化：获取一次数据并设置定时器
        fetchFlowData();
        setupTimer();

        // 设置按钮点击事件
        document.getElementById('settingsBtn').addEventListener('click', function () {
            if (chrome.runtime.openOptionsPage) {
                chrome.runtime.openOptionsPage();
            } else {
                window.open(chrome.runtime.getURL('options.html'));
            }
        });

        // 监听窗口大小变化，调整图表大小
        window.addEventListener('resize', function () {
            flowChart.resize();
        });
    }, 100);
});