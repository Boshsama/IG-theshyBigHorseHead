// 🎤 语音输入输出模块

class VoiceManager {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isSupported = this.checkSupport();
        
        if (this.isSupported) {
            this.initRecognition();
        }
    }
    
    // 检查浏览器支持
    checkSupport() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('浏览器不支持语音识别');
            return false;
        }
        if (!this.synthesis) {
            console.warn('浏览器不支持语音合成');
            return false;
        }
        return true;
    }
    
    // 初始化语音识别
    initRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // 配置
        this.recognition.lang = 'zh-CN'; // 中文识别
        this.recognition.continuous = false; // 单次识别
        this.recognition.interimResults = false; // 不返回中间结果
        this.recognition.maxAlternatives = 1;
        
        // 事件监听
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateVoiceButton(true);
            console.log('🎤 开始语音识别...');
        };
        
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log('识别结果:', transcript);
            this.onRecognitionResult(transcript);
        };
        
        this.recognition.onerror = (event) => {
            console.error('语音识别错误:', event.error);
            this.isListening = false;
            this.updateVoiceButton(false);
            
            let errorMsg = '语音识别失败';
            switch (event.error) {
                case 'no-speech':
                    errorMsg = '没有检测到语音，请重试';
                    break;
                case 'audio-capture':
                    errorMsg = '无法访问麦克风，请检查权限';
                    break;
                case 'not-allowed':
                    errorMsg = '麦克风权限被拒绝';
                    break;
                case 'network':
                    errorMsg = '网络错误，请检查网络连接';
                    break;
            }
            
            if (typeof addMessage === 'function') {
                addMessage('agent', `❌ ${errorMsg}`);
            }
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            this.updateVoiceButton(false);
            console.log('🎤 语音识别结束');
        };
    }
    
    // 开始识别
    startRecognition() {
        if (!this.isSupported) {
            alert('您的浏览器不支持语音识别功能\n\n建议使用：\n• Chrome浏览器\n• Edge浏览器\n• Safari浏览器');
            return;
        }
        
        if (this.isListening) {
            this.stopRecognition();
            return;
        }
        
        try {
            this.recognition.start();
            if (typeof addMessage === 'function') {
                addMessage('agent', '🎤 请说话...');
            }
        } catch (error) {
            console.error('启动语音识别失败:', error);
            alert('启动语音识别失败，请重试');
        }
    }
    
    // 停止识别
    stopRecognition() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }
    
    // 识别结果回调
    onRecognitionResult(text) {
        // 将识别的文本填入输入框
        const input = document.getElementById('userInput');
        if (input) {
            input.value = text;
        }
        
        // 自动发送消息
        if (typeof sendMessage === 'function') {
            setTimeout(() => {
                sendMessage();
            }, 500);
        }
    }
    
    // 语音播报
    speak(text) {
        if (!this.synthesis) {
            console.warn('浏览器不支持语音合成');
            return;
        }
        
        // 停止当前播报
        this.synthesis.cancel();
        
        // 创建语音
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 1.0; // 语速
        utterance.pitch = 1.0; // 音调
        utterance.volume = 1.0; // 音量
        
        // 选择中文语音
        const voices = this.synthesis.getVoices();
        const chineseVoice = voices.find(voice => 
            voice.lang.includes('zh') || voice.lang.includes('CN')
        );
        if (chineseVoice) {
            utterance.voice = chineseVoice;
        }
        
        // 事件监听
        utterance.onstart = () => {
            console.log('🔊 开始播报');
        };
        
        utterance.onend = () => {
            console.log('🔊 播报结束');
        };
        
        utterance.onerror = (event) => {
            console.error('语音播报错误:', event);
        };
        
        // 播报
        this.synthesis.speak(utterance);
    }
    
    // 停止播报
    stopSpeaking() {
        if (this.synthesis) {
            this.synthesis.cancel();
        }
    }
    
    // 更新语音按钮状态
    updateVoiceButton(isListening) {
        const btn = document.getElementById('voiceBtn');
        if (btn) {
            if (isListening) {
                btn.classList.add('listening');
                btn.innerHTML = '⏹️';
                btn.title = '点击停止录音';
            } else {
                btn.classList.remove('listening');
                btn.innerHTML = '🎤';
                btn.title = '点击开始语音输入';
            }
        }
    }
}

// 全局语音管理器
let voiceManager = null;

// 初始化语音功能
function initVoice() {
    voiceManager = new VoiceManager();
    
    // 等待语音列表加载
    if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = () => {
            console.log('语音列表已加载');
        };
    }
}

// 切换语音输入
function toggleVoice() {
    if (!voiceManager) {
        initVoice();
    }
    voiceManager.startRecognition();
}

// 语音播报消息
function speakMessage(text) {
    if (!voiceManager) {
        initVoice();
    }
    
    // 清理文本（移除emoji和特殊字符）
    const cleanText = text
        .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // 移除emoji
        .replace(/[•📌📊💡✅❌⚠️🔥⏱️📖🥘👨‍🍳🍽️🔬📝🏪]/g, '') // 移除常用符号
        .replace(/\n+/g, '，') // 换行替换为逗号
        .trim();
    
    if (cleanText) {
        voiceManager.speak(cleanText);
    }
}

// 页面加载时初始化
window.addEventListener('DOMContentLoaded', () => {
    initVoice();
    
    // 添加键盘快捷键
    document.addEventListener('keydown', (e) => {
        // Ctrl+Space 或 Cmd+Space 触发语音输入
        if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
            e.preventDefault();
            toggleVoice();
        }
    });
});
