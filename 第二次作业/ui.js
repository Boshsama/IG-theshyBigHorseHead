// 🎨 UI交互模块

// 全局Agent实例
let agent = null;

// 初始化
window.addEventListener('DOMContentLoaded', () => {
    agent = new FoodAgent();
    updateAPIStatus();
    updateFoodStats();
    
    // 回车发送消息
    document.getElementById('userInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});

// 发送消息
async function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // 检查agent是否初始化
    if (!agent) {
        console.error('Agent未初始化，正在初始化...');
        agent = new FoodAgent();
        updateAPIStatus();
        updateFoodStats();
    }
    
    // 清空输入框
    input.value = '';
    
    // 显示用户消息
    addMessage('user', message);
    
    // 显示加载状态
    showTyping();
    
    try {
        // 处理消息
        const response = await agent.processMessage(message);
        
        // 隐藏加载状态
        hideTyping();
        
        // 显示Agent回复
        addMessage('agent', response.text);
        
        // 更新UI
        updateFoodStats();
        updateMealList();
        
        // 语音播报（可选）
        // speakMessage(response.text);
        
    } catch (error) {
        hideTyping();
        addMessage('agent', `❌ 处理消息时出错：${error.message}`);
        console.error('处理消息错误:', error);
    }
}

// 添加消息到聊天区域
function addMessage(role, text) {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = role === 'user' ? '👤' : '🍔';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = text;
    
    if (role === 'user') {
        messageDiv.appendChild(content);
        messageDiv.appendChild(avatar);
    } else {
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
    }
    
    messagesDiv.appendChild(messageDiv);
    
    // 滚动到底部
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// 显示打字指示器
function showTyping() {
    const messagesDiv = document.getElementById('messages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typingIndicator';
    typingDiv.className = 'message agent';
    typingDiv.innerHTML = `
        <div class="avatar">🍔</div>
        <div class="message-content">正在思考...</div>
    `;
    messagesDiv.appendChild(typingDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// 隐藏打字指示器
function hideTyping() {
    const typingDiv = document.getElementById('typingIndicator');
    if (typingDiv) {
        typingDiv.remove();
    }
}

// 更新统计信息
function updateFoodStats() {
    if (!agent) return;
    
    // 计算今日数据
    const today = new Date().toLocaleDateString();
    const todayMeals = agent.mealRecords ? agent.mealRecords.filter(r => r.date === today) : [];
    const todayExercises = agent.exerciseRecords ? agent.exerciseRecords.filter(r => r.date === today) : [];
    
    const totalIntake = todayMeals.reduce((sum, r) => sum + (r.calories || 0), 0);
    const totalBurned = todayExercises.reduce((sum, r) => sum + (r.calories || 0), 0);
    const netCalories = totalIntake - totalBurned;
    
    // 更新显示
    const totalCalEl = document.getElementById('totalCalories');
    const burnedCalEl = document.getElementById('burnedCalories');
    const netCalEl = document.getElementById('netCalories');
    const mealCountEl = document.getElementById('mealCount');
    const convCountEl = document.getElementById('conversationCount');
    
    if (totalCalEl) totalCalEl.textContent = totalIntake + '卡';
    if (burnedCalEl) burnedCalEl.textContent = totalBurned + '卡';
    if (netCalEl) {
        netCalEl.textContent = netCalories + '卡';
        // 根据净摄入量设置颜色
        if (netCalories < 1200) {
            netCalEl.style.color = '#ffa502'; // 橙色：可能过低
        } else if (netCalories > 2500) {
            netCalEl.style.color = '#ff6348'; // 红色：可能过高
        } else {
            netCalEl.style.color = '#26de81'; // 绿色：正常
        }
    }
    if (mealCountEl) mealCountEl.textContent = todayMeals.length + '次';
    if (convCountEl) convCountEl.textContent = agent.conversationCount + '次';
}

// 更新饮食记录列表
function updateMealList() {
    if (!agent) return;
    
    const listDiv = document.getElementById('mealList');
    if (!listDiv) return;
    
    if (!agent.mealRecords || agent.mealRecords.length === 0) {
        listDiv.innerHTML = '<li class="meal-item">暂无记录，试试说"记录吃了番茄炒蛋"</li>';
        return;
    }
    
    // 显示最近5条记录
    const recent = agent.mealRecords.slice(0, 5);
    listDiv.innerHTML = recent.map(record => {
        const foodName = record.food || '未知食物';
        const calories = record.calories || 0;
        
        return `
            <li class="meal-item">
                <strong>用餐</strong>: ${foodName}
                <div class="meal-time">${record.time} · ${calories}卡</div>
            </li>
        `;
    }).join('');
}

// 更新API状态显示
function updateAPIStatus() {
    const statusDiv = document.getElementById('apiStatus');
    if (agent && agent.useAI) {
        statusDiv.className = 'api-status active';
        statusDiv.innerHTML = `🤖 AI模式: ${agent.aiProvider}<br>可进行智能问答`;
    } else {
        statusDiv.className = 'api-status';
        statusDiv.innerHTML = '💡 本地模式<br>点击下方按钮配置AI';
    }
}

// 打开设置
function openSettings() {
    document.getElementById('settingsModal').classList.add('active');
    const savedProvider = localStorage.getItem('aiProvider') || 'local';
    const savedApiKey = localStorage.getItem('apiKey_' + savedProvider) || '';
    document.getElementById('apiProvider').value = savedProvider;
    document.getElementById('apiKey').value = savedApiKey;
    updateAPIGuide();
}

// 关闭设置
function closeSettings() {
    document.getElementById('settingsModal').classList.remove('active');
}

// 更新API指南
function updateAPIGuide() {
    const provider = document.getElementById('apiProvider').value;
    const apiKeySection = document.getElementById('apiKeySection');
    const guideContent = document.getElementById('apiGuideContent');
    
    if (provider === 'local') {
        apiKeySection.style.display = 'none';
    } else {
        apiKeySection.style.display = 'block';
        const guide = API_GUIDE[provider];
        guideContent.innerHTML = `
            <strong>📖 ${guide.name} 使用指南</strong><br>
            <strong>获取地址:</strong> <a href="${guide.url}" target="_blank">${guide.url}</a><br>
            <strong>价格:</strong> ${guide.price}<br>
            <strong>说明:</strong> ${guide.note}
        `;
    }
}

// 保存设置
function saveSettings() {
    const provider = document.getElementById('apiProvider').value;
    const apiKey = document.getElementById('apiKey').value;
    
    localStorage.setItem('aiProvider', provider);
    if (provider !== 'local') {
        localStorage.setItem('apiKey_' + provider, apiKey);
        API_CONFIG.provider = provider;
        API_CONFIG[provider].apiKey = apiKey;
    } else {
        API_CONFIG.provider = 'local';
    }
    
    closeSettings();
    agent = new FoodAgent();
    updateAPIStatus();
    
    addMessage('agent', '✅ 设置已保存！' + (provider !== 'local' ? '现在我可以使用AI进行智能问答了！' : '已切换到本地模式。'));
}

// 清空所有记录（饮食+运动）
function clearAllRecords() {
    if (!agent) return;
    
    // 确认对话框
    if (!confirm('确定要清空所有记录吗？\n\n这将清空：\n• 所有饮食记录\n• 所有运动记录\n\n此操作不可恢复！')) {
        return;
    }
    
    // 清空所有记录
    agent.mealRecords = [];
    agent.exerciseRecords = [];
    agent.conversationCount = 0;
    agent.saveData();
    
    // 更新UI
    updateFoodStats();
    updateMealList();
    
    // 显示提示消息
    addMessage('agent', '✅ 已清空所有记录！\n\n• 饮食记录已清空\n• 运动记录已清空\n• 对话次数已重置');
}

// 调试API
async function debugAPI() {
    console.clear();
    console.log('%c=== API 诊断工具 ===', 'color: #f5576c; font-size: 16px; font-weight: bold');
    
    const provider = API_CONFIG.provider;
    const apiKey = localStorage.getItem('apiKey_' + provider);
    
    console.log('当前提供商:', provider);
    console.log('API Key:', apiKey ? '✅ 已设置' : '❌ 未设置');
    console.log('Agent AI模式:', agent.useAI ? '✅ 已启用' : '❌ 未启用');
    
    if (!apiKey || provider === 'local') {
        addMessage('agent', '❌ 检测到未配置API Key，请点击"⚙️ API设置"进行配置。');
        return;
    }
    
    const currentURL = window.location.href;
    console.log('当前URL:', currentURL);
    
    if (currentURL.startsWith('file:///')) {
        addMessage('agent', '⚠️ 检测到你正在直接打开HTML文件，这可能导致API调用失败。\n\n建议使用本地服务器：\n1. 打开命令行\n2. 运行: python -m http.server 8000\n3. 访问: http://localhost:8000');
        return;
    }
    
    addMessage('agent', '🔍 正在测试API连接，请稍候...');
    
    try {
        const response = await fetch(`${API_CONFIG[provider].baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: API_CONFIG[provider].model,
                messages: [{ role: 'user', content: '测试' }],
                max_tokens: 50
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            addMessage('agent', `✅ API测试成功！\n\n你现在可以正常使用AI智能对话功能了！`);
        } else {
            const error = await response.text();
            addMessage('agent', `❌ API调用失败\n状态码: ${response.status}\n请检查API Key是否正确`);
        }
    } catch (error) {
        addMessage('agent', `❌ 网络连接失败\n\n${error.message}\n\n请检查网络连接或使用本地服务器运行项目`);
    }
}

// 显示所有菜品列表
function showAllFoodsList() {
    if (!agent) {
        console.error('Agent未初始化');
        agent = new FoodAgent();
    }
    
    // 调用agent的showAllFoods方法
    const result = agent.showAllFoods();
    
    // 在聊天区域显示结果
    addMessage('agent', result.text);
}
