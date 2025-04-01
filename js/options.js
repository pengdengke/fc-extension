document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('settingsForm');

    // 加载保存的设置
    chrome.storage.local.get(['flowData'], function (result) {
        const flowData = result.flowData || {
            url: "",
            totalFlowParamName: "",
            usedFlowParamName: "",
            updateInterval: 1,
            resetDate: new Date().toISOString().split('T')[0]
        };
        document.getElementById('url').value = flowData.url || "";
        document.getElementById('totalFlowParamName').value = flowData.totalFlowParamName || "";
        document.getElementById('usedFlowParamName').value = flowData.usedFlowParamName || "";
        document.getElementById('updateInterval').value = flowData.updateInterval || 1;
    });

    // 保存设置
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const flowData = {
            url: document.getElementById('url').value,
            totalFlowParamName: document.getElementById('totalFlowParamName').value,
            usedFlowParamName: document.getElementById('usedFlowParamName').value,
            updateInterval: document.getElementById('updateInterval').value,
        };

        chrome.storage.local.set({ flowData: flowData }, function () {
            // 显示保存成功提示
            const saveBtn = document.querySelector('.save-btn');
            const originalText = saveBtn.textContent;
            saveBtn.textContent = '保存成功！';
            saveBtn.style.backgroundColor = '#45a049';

            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.style.backgroundColor = '#4CAF50';
            }, 2000);
        });
    });
}); 