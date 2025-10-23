// API配置文件
const API_CONFIG = {
    // 当前使用的API提供商
    // 可选: 'openai', 'deepseek', 'zhipu', 'qwen', 'local'
    provider: 'local', // 默认使用本地模式，配置API后可切换
    
    // OpenAI配置
    openai: {
        apiKey: '', // 在这里填入你的OpenAI API Key
        baseURL: 'https://api.openai.com/v1',
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 1000
    },
    
    // DeepSeek配置 (推荐：国内可用，价格便宜)
    deepseek: {
        apiKey: '', // 在这里填入你的DeepSeek API Key
        baseURL: 'https://api.deepseek.com/v1',
        model: 'deepseek-chat',
        temperature: 0.7,
        maxTokens: 1000
    },
    
    // 智谱AI配置
    zhipu: {
        apiKey: '', // 在这里填入你的智谱AI API Key
        baseURL: 'https://open.bigmodel.cn/api/paas/v4',
        model: 'glm-4',
        temperature: 0.7,
        maxTokens: 1000
    },
    
    // 通义千问配置
    qwen: {
        apiKey: '', // 在这里填入你的通义千问 API Key
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        model: 'qwen-turbo',
        temperature: 0.7,
        maxTokens: 1000
    },
    
    // 系统提示词
    systemPrompt: `你是一个美食智能助手，名叫"小食"。
你的职责是帮助用户规划饮食、推荐美食、查询菜谱、分析营养等。

你可以调用以下工具：
1. 美食推荐：根据时间、偏好推荐美食
2. 菜谱查询：提供详细的烹饪步骤
3. 营养分析：分析食物的营养成分和热量
4. 饮食记录：记录用户的每日饮食
5. 热量计算：计算消耗热量所需的运动时间

当用户询问吃什么、怎么做、营养如何时，主动提供专业建议。
保持友好、专业的语气，关注健康饮食，用简洁的语言回复。
当用户要求计算时，请告诉我计算表达式。

请用简洁、友好的语言回复用户。`
};

// API获取指南
const API_GUIDE = {
    openai: {
        name: 'OpenAI',
        url: 'https://platform.openai.com/api-keys',
        price: '$0.002/1K tokens (GPT-3.5)',
        note: '需要国际信用卡，国内需要代理访问'
    },
    deepseek: {
        name: 'DeepSeek',
        url: 'https://platform.deepseek.com/api_keys',
        price: '¥0.001/1K tokens',
        note: '国内可直接访问，价格便宜，推荐！注册送500万tokens'
    },
    zhipu: {
        name: '智谱AI',
        url: 'https://open.bigmodel.cn/',
        price: '有免费额度',
        note: '国内大模型，注册即送tokens'
    },
    qwen: {
        name: '通义千问',
        url: 'https://dashscope.aliyun.com/',
        price: '有免费额度',
        note: '阿里云产品，需要阿里云账号'
    }
};
