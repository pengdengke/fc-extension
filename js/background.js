chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'fetchData') {
        fetch(request.url)
            .then(response => response.json())
            .then(data => {
                sendResponse({ success: true, data: data });
            })
            .catch(error => {
                console.error('获取数据失败:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // 保持消息通道开放
    }
}); 