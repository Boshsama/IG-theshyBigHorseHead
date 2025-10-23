// Food Agent Core
class FoodAgent {
    constructor() {
        this.mealRecords = [];
        this.exerciseRecords = [];
        this.conversationHistory = [];
        this.conversationCount = 0;
        this.useAI = false;
        this.aiProvider = 'local';
        this.weeklyPlan = null;
        this.userProfile = {
            goal: 'maintain',
            dailyCalorieTarget: 2000
        };
        if (typeof API_CONFIG !== 'undefined') {
            this.aiProvider = API_CONFIG.provider;
            this.checkAPIConfig();
        }
        this.loadData();
    }
    
    loadData() {
        try {
            const savedMeals = localStorage.getItem('mealRecords');
            const savedExercises = localStorage.getItem('exerciseRecords');
            if (savedMeals) this.mealRecords = JSON.parse(savedMeals);
            if (savedExercises) this.exerciseRecords = JSON.parse(savedExercises);
        } catch (e) {}
    }
    
    saveData() {
        try {
            localStorage.setItem('mealRecords', JSON.stringify(this.mealRecords));
            localStorage.setItem('exerciseRecords', JSON.stringify(this.exerciseRecords));
        } catch (e) {}
    }
    
    checkAPIConfig() {
        if (typeof API_CONFIG === 'undefined') return;
        const config = API_CONFIG[this.aiProvider];
        if (config && config.apiKey && config.apiKey.trim()) {
            this.useAI = true;
        }
    }
    
    async processMessage(msg) {
        this.conversationCount++;
        this.conversationHistory.push({role: 'user', content: msg, timestamp: new Date()});
        let response = this.useAI ? await this.processWithAI(msg) : this.processLocal(msg);
        this.conversationHistory.push({role: 'assistant', content: response.text, timestamp: new Date()});
        return response;
    }
    
    processLocal(msg) {
        const m = msg.toLowerCase();
        if (m.includes('推荐')) return this.foodRecommend(msg);
        if (m.includes('菜品列表') || m.includes('菜谱列表') || m.includes('所有菜品') || m.includes('全部菜品')) return this.showAllFoods();
        if (m.includes('怎么做') || m.includes('菜谱')) return this.recipeQuery(msg);
        if (m.includes('详细') && m.includes('营养')) return this.detailedNutrition(msg);
        if (m.includes('营养')) return this.nutritionAnalysis(msg);
        if (m.includes('一周') || m.includes('周计划') || m.includes('饮食计划')) return this.generateWeeklyPlan(msg);
        // 更灵活的运动识别：支持多种口语化表达
        if (this.isExerciseMessage(m)) return this.recordExercise(msg);
        if (m.includes('记录') || m.includes('吃了')) return this.mealRecord(msg);
        if (m.includes('计算')) return this.calorieCalculator(msg);
        if (m.includes('查看')) return this.viewRecords();
        if (m.includes('帮助')) return this.showHelp();
        return this.chat();
    }
    
    // 判断是否是运动记录消息
    isExerciseMessage(msg) {
        const exercises = ['跑步', '快走', '散步', '游泳', '骑行', '跳绳', '瑜伽', '力量训练', '篮球', '足球', '羽毛球', '爬楼梯', '跳舞', '健身操', '普拉提', '太极', '爬山', '拳击', '滑冰', '网球', '乒乓球', '徒步'];
        const timeWords = ['分钟', '小时', '半小时', '一小时', '两小时'];
        
        // 检查是否包含运动关键词和时长关键词
        const hasExercise = exercises.some(e => msg.includes(e));
        const hasTime = timeWords.some(t => msg.includes(t)) || /\d+/.test(msg);
        
        return hasExercise && hasTime;
    }
    
    foodRecommend(msg) {
        const foods = {
            breakfast: [
                {name: '豆浆油条', calories: 350}, {name: '三明治', calories: 280}, {name: '小笼包', calories: 320}, {name: '燕麦粥', calories: 150}, {name: '煎饼果子', calories: 380},
                {name: '皮蛋瘦肉粥', calories: 220}, {name: '鸡蛋灌饼', calories: 340}, {name: '牛奶麦片', calories: 180}, {name: '肠粉', calories: 260}, {name: '包子馒头', calories: 300},
                {name: '全麦面包', calories: 240}, {name: '水煮蛋', calories: 80}, {name: '豆腐脑', calories: 120}, {name: '热干面', calories: 420}, {name: '蛋挞', calories: 250},
                {name: '玉米粥', calories: 130}, {name: '生煎包', calories: 360}, {name: '牛角包', calories: 310}, {name: '南瓜粥', calories: 140}, {name: '茶叶蛋', calories: 90},
                {name: '紫薯粥', calories: 160}, {name: '手抓饼', calories: 330}, {name: '鲜奶吐司', calories: 270}, {name: '蒸饺', calories: 290}, {name: '红豆粥', calories: 170},
                {name: '培根蛋', calories: 320}, {name: '糯米鸡', calories: 380}, {name: '希腊酸奶', calories: 150}, {name: '虾饺', calories: 200}, {name: '水果燕麦杯', calories: 190}
            ],
            // 午餐主食（主菜类，适合配米饭）
            lunchMain: [
                {name: '宫保鸡丁', calories: 450}, {name: '红烧肉', calories: 550}, {name: '糖醋里脊', calories: 480}, {name: '鱼香肉丝', calories: 420}, 
                {name: '青椒肉丝', calories: 350}, {name: '回锅肉', calories: 520}, {name: '水煮肉片', calories: 480}, {name: '酸菜鱼', calories: 380},
                {name: '土豆炖牛肉', calories: 420}, {name: '西红柿牛腩', calories: 400}, {name: '香菇炖鸡', calories: 360}, {name: '东坡肉', calories: 580},
                {name: '剁椒鱼头', calories: 320}, {name: '小炒肉', calories: 440}, {name: '辣子鸡', calories: 460}, {name: '梅菜扣肉', calories: 560},
                {name: '咕咾肉', calories: 490}, {name: '盐焗鸡', calories: 380}, {name: '铁板牛柳', calories: 420}
            ],
            // 午餐配菜（蔬菜类、清淡类）
            lunchSide: [
                {name: '番茄炒蛋', calories: 200}, {name: '清蒸鱼', calories: 180}, {name: '麻婆豆腐', calories: 280}, {name: '红烧茄子', calories: 240},
                {name: '蒜蓉西兰花', calories: 120}, {name: '木须肉', calories: 380}, {name: '干煸豆角', calories: 220}, {name: '口水鸡', calories: 280},
                {name: '白灼虾', calories: 150}, {name: '蚝油生菜', calories: 100}, {name: '干锅花菜', calories: 260}
            ],
            // 晚餐主食（蛋白质为主）
            dinnerMain: [
                {name: '鸡胸肉', calories: 165}, {name: '寿司', calories: 300}, {name: '烤鸡胸肉', calories: 180}, {name: '蒸鲈鱼', calories: 150},
                {name: '煎三文鱼', calories: 280}, {name: '虾仁炒蛋', calories: 220}, {name: '清蒸虾', calories: 140}, {name: '麻辣烫', calories: 400}
            ],
            // 晚餐配菜（蔬菜类、汤类）
            dinnerSide: [
                {name: '蔬菜沙拉', calories: 120}, {name: '水煮菜心', calories: 60}, {name: '凉拌黄瓜', calories: 40}, {name: '紫菜蛋花汤', calories: 80},
                {name: '炒时蔬', calories: 100}, {name: '豆腐汤', calories: 90}, {name: '清炒芦笋', calories: 70}, {name: '蒸蛋羹', calories: 110},
                {name: '菌菇汤', calories: 50}, {name: '烤蔬菜', calories: 130}, {name: '白灼菜心', calories: 55}, {name: '冬瓜汤', calories: 45},
                {name: '蒸豆腐', calories: 95}, {name: '凉拌木耳', calories: 65}, {name: '海带汤', calories: 50}, {name: '番茄蛋汤', calories: 85},
                {name: '拌菠菜', calories: 60}, {name: '蒸南瓜', calories: 75}, {name: '白粥小菜', calories: 150}, {name: '酸辣汤', calories: 120},
                {name: '蒸鸡蛋', calories: 100}, {name: '凉拌豆芽', calories: 55}
            ]
        };
        
        // 判断是否为通用推荐（推荐美食）
        const isGeneralRecommend = !msg.includes('早餐') && !msg.includes('午餐') && !msg.includes('晚餐');
        
        if (isGeneralRecommend) {
            // 推荐美食：从所有90种食物中随机选择3种
            const allFoods = [...foods.breakfast, ...foods.lunchMain, ...foods.lunchSide, ...foods.dinnerMain, ...foods.dinnerSide];
            const selected = [];
            const usedIndexes = new Set();
            
            // 随机选择3个不重复的食物
            while (selected.length < 3) {
                const randomIndex = Math.floor(Math.random() * allFoods.length);
                if (!usedIndexes.has(randomIndex)) {
                    usedIndexes.add(randomIndex);
                    selected.push(allFoods[randomIndex]);
                }
            }
            
            const totalCalories = selected.reduce((sum, food) => sum + food.calories, 0);
            const result = `🍽️ 为你推荐3款美食：\n\n` +
                `1️⃣ ${selected[0].name}（${selected[0].calories}卡）\n` +
                `2️⃣ ${selected[1].name}（${selected[1].calories}卡）\n` +
                `3️⃣ ${selected[2].name}（${selected[2].calories}卡）\n\n` +
                `📊 总热量：${totalCalories}卡`;
            
            return {text: result, action: {type: 'foodRecommend', count: 3, foods: selected}};
        } else {
            // 推荐早餐/午餐/晚餐
            let type = 'lunch';
            const hour = new Date().getHours();
            if (hour < 10) type = 'breakfast';
            else if (hour < 14) type = 'lunch';
            else type = 'dinner';
            if (msg.includes('早餐')) type = 'breakfast';
            if (msg.includes('午餐')) type = 'lunch';
            if (msg.includes('晚餐')) type = 'dinner';
            
            // 早餐：推荐1种
            if (type === 'breakfast') {
                const food = foods.breakfast[Math.floor(Math.random() * foods.breakfast.length)];
                return {text: `推荐早餐：${food.name}（${food.calories}卡）`, action: {type: 'foodRecommend'}};
            }
            // 午餐：推荐1个主食 + 1个配菜
            else if (type === 'lunch') {
                const mainFood = foods.lunchMain[Math.floor(Math.random() * foods.lunchMain.length)];
                const sideFood = foods.lunchSide[Math.floor(Math.random() * foods.lunchSide.length)];
                const totalCalories = mainFood.calories + sideFood.calories;
                return {
                    text: `🍜 推荐午餐：\n\n🍖 主食：${mainFood.name}（${mainFood.calories}卡）\n🥗 配菜：${sideFood.name}（${sideFood.calories}卡）\n\n📊 总热量：${totalCalories}卡`,
                    action: {type: 'foodRecommend', foods: [mainFood, sideFood]}
                };
            }
            // 晚餐：推荐1个主食 + 1个配菜
            else {
                const mainFood = foods.dinnerMain[Math.floor(Math.random() * foods.dinnerMain.length)];
                const sideFood = foods.dinnerSide[Math.floor(Math.random() * foods.dinnerSide.length)];
                const totalCalories = mainFood.calories + sideFood.calories;
                return {
                    text: `🌙 推荐晚餐：\n\n🍖 主食：${mainFood.name}（${mainFood.calories}卡）\n🥗 配菜：${sideFood.name}（${sideFood.calories}卡）\n\n📊 总热量：${totalCalories}卡`,
                    action: {type: 'foodRecommend', foods: [mainFood, sideFood]}
                };
            }
        }
    }
    
    recipeQuery(msg) {
        const recipes = {
            // 早餐类（30种）
            '豆浆油条': {ingredients: ['豆浆300ml', '油条2根'], steps: ['豆浆加热至沸腾', '油条切段', '豆浆倒碗', '油条蘸食'], time: '5分钟', calories: 350},
            '三明治': {ingredients: ['吐司2片', '鸡蛋1个', '生菜', '番茄', '火腿片'], steps: ['煎鸡蛋至半熟', '吐司烤至金黄', '依次铺生菜番茄火腿鸡蛋', '盖上吐司对角切'], time: '10分钟', calories: 280},
            '小笼包': {ingredients: ['小笼包10个', '香醋', '姜丝'], steps: ['蒸锅水烧开', '笼屉刷油防粘', '放入小笼包', '大火蒸8分钟', '配醋姜丝食用'], time: '10分钟', calories: 320},
            '燕麦粥': {ingredients: ['燕麦50g', '牛奶200ml', '蜂蜜', '坚果'], steps: ['燕麦加牛奶入锅', '小火煮5分钟搅拌', '煮至浓稠', '加蜂蜜调味', '撒坚果碎'], time: '8分钟', calories: 150},
            '煎饼果子': {ingredients: ['面糊200g', '鸡蛋2个', '油条', '葱花', '甜面酱'], steps: ['平底锅刷油', '倒面糊摊薄', '打入鸡蛋抹匀', '撒葱花放油条', '刷酱对折卷起'], time: '10分钟', calories: 380},
            '皮蛋瘦肉粥': {ingredients: ['大米100g', '皮蛋2个', '瘦肉100g', '姜丝', '葱花'], steps: ['大米洗净煮粥', '瘦肉切丝腌制', '皮蛋切块', '粥煮稠加肉丝皮蛋', '煮5分钟撒葱花'], time: '40分钟', calories: 220},
            '鸡蛋灌饼': {ingredients: ['面饼2张', '鸡蛋2个', '生菜', '甜面酱'], steps: ['面饼小火烙至鼓起', '用筷子戳洞灌蛋液', '煎至两面金黄', '刷酱卷生菜'], time: '12分钟', calories: 340},
            '牛奶麦片': {ingredients: ['即食麦片50g', '牛奶250ml', '香蕉', '坚果'], steps: ['麦片倒入碗中', '牛奶加热倒入', '放香蕉片', '撒坚果碎'], time: '5分钟', calories: 180},
            '肠粉': {ingredients: ['米浆300ml', '肉末50g', '虾仁', '葱花', '酱油'], steps: ['米浆倒盘蒸成薄皮', '撒肉末虾仁卷起', '继续蒸3分钟', '切段淋酱油葱油'], time: '15分钟', calories: 260},
            '包子馒头': {ingredients: ['包子或馒头4个'], steps: ['蒸锅水烧开', '放入包子馒头', '大火蒸8分钟', '出锅装盘'], time: '10分钟', calories: 300},
            '全麦面包': {ingredients: ['全麦面包2片', '花生酱', '香蕉1根'], steps: ['面包烤箱烤至微黄', '均匀抹花生酱', '放香蕉片', '对半切'], time: '5分钟', calories: 240},
            '水煮蛋': {ingredients: ['鸡蛋2-3个'], steps: ['鸡蛋洗净冷水下锅', '水开后煮8分钟', '捞出过冷水', '剥壳食用'], time: '10分钟', calories: 80},
            '豆腐脑': {ingredients: ['嫩豆腐1盒', '榨菜碎', '虾皮', '葱花', '酱油'], steps: ['豆腐入碗加热', '撒榨菜虾皮', '浇热酱油', '撒葱花'], time: '5分钟', calories: 120},
            '热干面': {ingredients: ['碱面200g', '芝麻酱', '辣萝卜丁', '葱花'], steps: ['面煮至断生捞出', '拌少许油防粘', '加芝麻酱拌匀', '放配菜加调料'], time: '10分钟', calories: 420},
            '蛋挞': {ingredients: ['蛋挞皮6个', '牛奶150ml', '蛋黄3个', '糖30g'], steps: ['蛋黄加糖打匀', '倒入牛奶搅拌过筛', '倒入蛋挞皮8分满', '烤箱200度烤20分钟'], time: '25分钟', calories: 250},
            '玉米粥': {ingredients: ['玉米糁50g', '水500ml', '冰糖'], steps: ['玉米糁洗净加水', '煮开转小火煮30分钟', '加冰糖调味'], time: '35分钟', calories: 130},
            '生煎包': {ingredients: ['生煎包8个', '芝麻', '葱花'], steps: ['平底锅刷油烧热', '摆放生煎包', '加水至1/3高盖盖焖', '水干撒芝麻葱花', '煎至底部金黄'], time: '15分钟', calories: 360},
            '牛角包': {ingredients: ['牛角包2个', '黄油', '果酱'], steps: ['牛角包切开不断', '烤箱烤3分钟', '涂抹黄油和果酱'], time: '5分钟', calories: 310},
            '南瓜粥': {ingredients: ['南瓜200g', '大米50g', '冰糖'], steps: ['南瓜去皮切小块', '大米煮粥加南瓜', '煮至软烂加冰糖'], time: '30分钟', calories: 140},
            '茶叶蛋': {ingredients: ['鸡蛋6个', '红茶', '八角', '酱油', '盐'], steps: ['鸡蛋煮熟敲裂纹', '加茶叶香料酱油', '煮30分钟浸泡入味'], time: '40分钟', calories: 90},
            '紫薯粥': {ingredients: ['紫薯100g', '大米50g', '冰糖'], steps: ['紫薯去皮切小块', '与大米一起煮', '煮至软烂加冰糖'], time: '30分钟', calories: 160},
            '手抓饼': {ingredients: ['手抓饼1张', '鸡蛋1个', '生菜', '火腿'], steps: ['饼煎至两面金黄', '另煎鸡蛋', '饼上放生菜火腿鸡蛋', '卷起切段'], time: '8分钟', calories: 330},
            '鲜奶吐司': {ingredients: ['吐司2片', '牛奶100ml', '鸡蛋1个', '糖'], steps: ['鸡蛋牛奶糖打匀', '吐司蘸蛋奶液', '平底锅煎至金黄'], time: '10分钟', calories: 270},
            '蒸饺': {ingredients: ['饺子10个', '香醋', '蒜泥'], steps: ['蒸锅水烧开', '笼屉刷油摆饺子', '大火蒸10-12分钟', '配蘸料食用'], time: '12分钟', calories: 290},
            '红豆粥': {ingredients: ['红豆50g', '大米50g', '冰糖'], steps: ['红豆提前泡2小时', '加大米和水煮', '煮至红豆开花', '加冰糖'], time: '50分钟', calories: 170},
            '培根蛋': {ingredients: ['培根3-4片', '鸡蛋2个', '吐司'], steps: ['培根煎至焦香', '煎鸡蛋', '吐司烤香', '摆盘组合'], time: '10分钟', calories: 320},
            '糯米鸡': {ingredients: ['糯米200g', '鸡肉100g', '香菇', '荷叶'], steps: ['糯米泡软蒸熟', '鸡肉香菇炒香拌糯米', '荷叶包好蒸20分钟'], time: '60分钟', calories: 380},
            '希腊酸奶': {ingredients: ['希腊酸奶200g', '蓝莓', '蜂蜜', '坚果'], steps: ['酸奶倒碗', '放蓝莓', '淋蜂蜜', '撒坚果碎'], time: '3分钟', calories: 150},
            '虾饺': {ingredients: ['虾饺8个', '生抽', '香醋'], steps: ['蒸锅水烧开', '笼屉刷油摆虾饺', '大火蒸8分钟', '配酱料'], time: '10分钟', calories: 200},
            '水果燕麦杯': {ingredients: ['燕麦片', '酸奶', '香蕉', '莓果'], steps: ['杯底铺燕麦倒酸奶', '放香蕉片再倒酸奶', '放莓果淋蜂蜜'], time: '5分钟', calories: 190},
            
            // 午餐类（30种）
            '宫保鸡丁': {ingredients: ['鸡胸肉200g', '花生米50g', '干辣椒', '花椒', '葱姜蒜'], steps: ['鸡肉切丁腌制15分钟', '调宫保汁', '热油炸花生米', '炒鸡丁至变色', '下干辣椒花椒爆香', '倒宫保汁加花生翻炒', '收汁出锅'], time: '25分钟', calories: 450},
            '番茄炒蛋': {ingredients: ['鸡蛋3个', '番茄2个', '葱花', '盐', '糖'], steps: ['鸡蛋打散加盐', '番茄切块', '热油炒蛋至7分熟', '炒番茄加糖', '倒入鸡蛋翻炒', '撒葱花出锅'], time: '10分钟', calories: 200},
            '红烧肉': {ingredients: ['五花肉500g', '冰糖', '酱油', '料酒', '八角'], steps: ['五花肉切块焯水', '锅中炒糖色', '下肉块翻炒上色', '加调料和水', '小火炖1小时', '大火收汁'], time: '80分钟', calories: 550},
            '清蒸鱼': {ingredients: ['鲈鱼1条', '姜片', '葱丝', '蒸鱼豉油'], steps: ['鱼洗净两面划刀', '鱼身放姜片', '水开后蒸8-10分钟', '倒掉蒸水', '铺葱丝浇热油', '淋蒸鱼豉油'], time: '15分钟', calories: 180},
            '麻婆豆腐': {ingredients: ['嫩豆腐400g', '肉末80g', '豆瓣酱', '花椒粉', '葱姜蒜'], steps: ['豆腐切块焯水', '炒肉末变色', '下豆瓣酱炒红油', '加水和豆腐煮5分钟', '勾芡撒花椒粉葱花'], time: '15分钟', calories: 280},
            '糖醋里脊': {ingredients: ['里脊肉300g', '番茄酱', '白醋', '糖', '淀粉'], steps: ['里脊切条腌制', '裹淀粉炸金黄', '调糖醋汁', '炒香番茄酱', '倒糖醋汁煮开', '放里脊翻炒均匀'], time: '25分钟', calories: 480},
            '鱼香肉丝': {ingredients: ['猪肉丝200g', '木耳', '胡萝卜', '泡椒', '葱姜蒜'], steps: ['肉丝腌制', '调鱼香汁', '炒肉丝变色', '下配菜翻炒', '倒鱼香汁', '快速翻炒收汁'], time: '20分钟', calories: 420},
            '青椒肉丝': {ingredients: ['猪肉丝200g', '青椒3个', '葱姜', '酱油'], steps: ['肉丝腌制', '青椒切丝', '炒肉丝至变色', '下青椒翻炒', '加调料炒匀出锅'], time: '12分钟', calories: 350},
            '回锅肉': {ingredients: ['五花肉300g', '青蒜', '豆瓣酱', '豆豉'], steps: ['五花肉煮熟切片', '煸炒出油', '下豆瓣酱豆豉', '炒出红油', '加青蒜翻炒均匀'], time: '20分钟', calories: 520},
            '水煮肉片': {ingredients: ['猪肉片200g', '白菜', '豆芽', '辣椒', '花椒'], steps: ['肉片腌制', '白菜豆芽焯水垫底', '煮肉片至熟', '放配菜上', '浇热油撒花椒辣椒'], time: '20分钟', calories: 480},
            '酸菜鱼': {ingredients: ['鱼片300g', '酸菜', '豆芽', '泡椒'], steps: ['鱼片腌制', '炒酸菜泡椒', '加水煮开', '下豆芽煮熟捞出', '煮鱼片倒碗浇热油'], time: '25分钟', calories: 380},
            '土豆炖牛肉': {ingredients: ['牛肉300g', '土豆2个', '胡萝卜', '葱姜'], steps: ['牛肉切块焯水', '炒香葱姜', '下牛肉翻炒', '加水炖40分钟', '加土豆胡萝卜炖软'], time: '60分钟', calories: 420},
            '红烧茄子': {ingredients: ['茄子2个', '肉末', '蒜末', '豆瓣酱'], steps: ['茄子切块炸软', '炒肉末', '下豆瓣酱蒜末', '加茄子翻炒', '加糖醋调味'], time: '15分钟', calories: 240},
            '西红柿牛腩': {ingredients: ['牛腩500g', '番茄3个', '土豆', '葱姜'], steps: ['牛腩切块焯水', '炒番茄出汁', '下牛腩翻炒', '加水炖1小时', '加土豆炖软'], time: '90分钟', calories: 400},
            '蒜蓉西兰花': {ingredients: ['西兰花1个', '蒜末', '盐', '油'], steps: ['西兰花切小朵焯水', '热油爆香蒜末', '下西兰花翻炒', '加盐炒匀出锅'], time: '8分钟', calories: 120},
            '木须肉': {ingredients: ['猪肉丝', '鸡蛋2个', '木耳', '黄瓜'], steps: ['鸡蛋炒熟盛出', '炒肉丝变色', '下木耳黄瓜', '加鸡蛋调料翻炒'], time: '15分钟', calories: 380},
            '干煸豆角': {ingredients: ['豆角300g', '肉末', '干辣椒', '蒜末'], steps: ['豆角煸至起皱', '盛出炒肉末', '下干辣椒蒜末', '加豆角翻炒调味'], time: '18分钟', calories: 220},
            '香菇炖鸡': {ingredients: ['鸡块500g', '香菇', '红枣', '姜片'], steps: ['鸡块焯水', '香菇泡发', '炒香姜片下鸡块', '加水炖40分钟', '加香菇红枣炖20分钟'], time: '70分钟', calories: 360},
            '东坡肉': {ingredients: ['五花肉500g', '冰糖', '酱油', '料酒'], steps: ['五花肉切方块焯水', '煎至金黄', '加调料', '小火炖2小时', '收汁至浓稠'], time: '150分钟', calories: 580},
            '剁椒鱼头': {ingredients: ['鱼头1个', '剁椒', '蒜末', '姜丝'], steps: ['鱼头洗净剖开', '抹盐腌制', '铺剁椒蒜末', '蒸15分钟', '淋热油撒葱花'], time: '25分钟', calories: 320},
            '小炒肉': {ingredients: ['五花肉200g', '青椒', '红椒', '蒜苗'], steps: ['五花肉切片煸炒出油', '下豆豉', '加青红椒', '下蒜苗翻炒均匀'], time: '15分钟', calories: 440},
            '辣子鸡': {ingredients: ['鸡腿肉300g', '干辣椒', '花椒', '葱姜蒜'], steps: ['鸡肉切块腌制', '油炸至金黄', '炒辣椒花椒', '下鸡块翻炒', '撒芝麻'], time: '25分钟', calories: 460},
            '口水鸡': {ingredients: ['鸡腿2个', '辣椒油', '花椒油', '蒜泥'], steps: ['鸡腿煮熟', '过冰水切块摆盘', '调红油汁', '浇在鸡肉上'], time: '30分钟', calories: 280},
            '白灼虾': {ingredients: ['鲜虾300g', '姜片', '葱段', '料酒'], steps: ['虾洗净剪须', '水烧开加姜葱料酒', '下虾煮2分钟', '虾变红捞出配蘸料'], time: '8分钟', calories: 150},
            '蚝油生菜': {ingredients: ['生菜300g', '蚝油', '蒜末', '油'], steps: ['生菜洗净', '沸水焯30秒', '捞出摆盘', '蒜末爆香加蚝油', '浇在生菜上'], time: '5分钟', calories: 100},
            '梅菜扣肉': {ingredients: ['五花肉500g', '梅干菜', '冰糖', '酱油'], steps: ['五花肉煮熟切片', '抹酱油炸上色', '梅菜泡发炒香', '肉片排碗盖梅菜', '蒸1小时倒扣'], time: '120分钟', calories: 560},
            '咕咾肉': {ingredients: ['猪肉300g', '菠萝', '青红椒', '番茄酱'], steps: ['肉切块腌制裹淀粉', '炸至金黄', '调糖醋汁', '炒番茄酱加菠萝青椒', '下肉块翻炒'], time: '25分钟', calories: 490},
            '盐焗鸡': {ingredients: ['三黄鸡1只', '粗盐2斤', '沙姜粉'], steps: ['鸡抹盐腌2小时', '用纸包好', '粗盐炒热埋鸡', '小火焗40分钟'], time: '60分钟', calories: 380},
            '干锅花菜': {ingredients: ['花菜1个', '五花肉', '干辣椒', '豆豉'], steps: ['花菜撕小朵焯水', '煸炒五花肉出油', '下豆豉辣椒', '加花菜翻炒调味'], time: '15分钟', calories: 260},
            '铁板牛柳': {ingredients: ['牛柳300g', '洋葱', '青椒', '黑胡椒'], steps: ['牛柳切条腌制', '铁板烧热刷油', '煎牛柳至7分熟', '加洋葱青椒', '撒黑胡椒翻炒'], time: '15分钟', calories: 420},
            
            // 晚餐类（30种）
            '蔬菜沙拉': {ingredients: ['生菜', '番茄', '黄瓜', '紫甘蓝', '沙拉酱', '柠檬汁'], steps: ['所有蔬菜洗净', '生菜撕片其他切块', '混合装盘', '加沙拉酱', '挤柠檬汁拌匀'], time: '5分钟', calories: 120},
            '鸡胸肉': {ingredients: ['鸡胸肉200g', '黑胡椒', '盐', '橄榄油'], steps: ['鸡胸肉用刀背拍松', '抹盐黑胡椒腌30分钟', '平底锅刷油', '中火煎5分钟', '翻面再煎5分钟', '切片装盘'], time: '15分钟', calories: 165},
            '麻辣烫': {ingredients: ['各类蔬菜', '豆制品', '肉丸', '麻辣底料'], steps: ['水烧开加底料', '先煮肉丸3分钟', '再下蔬菜豆制品', '煮熟捞出', '加芝麻香菜拌匀'], time: '15分钟', calories: 400},
            '寿司': {ingredients: ['米饭', '紫菜', '三文鱼', '黄瓜', '寿司醋'], steps: ['米饭拌寿司醋放凉', '紫菜铺竹帘', '铺米饭留边', '放食材卷紧', '切段摆盘'], time: '25分钟', calories: 300},
            '烤鸡胸肉': {ingredients: ['鸡胸肉200g', '迷迭香', '盐', '黑胡椒', '橄榄油'], steps: ['鸡胸肉腌制30分钟', '烤箱预热200度', '烤盘铺锡纸刷油', '烤15分钟翻面', '再烤10分钟'], time: '30分钟', calories: 180},
            '水煮菜心': {ingredients: ['菜心300g', '蒜末', '盐', '油'], steps: ['菜心洗净切段', '水烧开加盐油', '下菜心焯1分钟', '捞出摆盘', '蒜末热油浇上'], time: '5分钟', calories: 60},
            '蒸鲈鱼': {ingredients: ['鲈鱼1条', '姜丝', '葱丝', '蒸鱼豉油'], steps: ['鱼洗净划刀放姜片', '蒸锅蒸8分钟', '倒掉蒸水', '铺葱丝', '浇热油淋豉油'], time: '15分钟', calories: 150},
            '凉拌黄瓜': {ingredients: ['黄瓜2根', '蒜末', '醋', '香油', '盐'], steps: ['黄瓜拍碎切段', '加蒜末盐', '倒醋香油', '拌匀腌10分钟'], time: '15分钟', calories: 40},
            '紫菜蛋花汤': {ingredients: ['紫菜', '鸡蛋2个', '虾皮', '葱花', '盐'], steps: ['水烧开放紫菜虾皮', '鸡蛋打散', '边搅边倒入蛋液', '加盐撒葱花'], time: '5分钟', calories: 80},
            '煎三文鱼': {ingredients: ['三文鱼200g', '柠檬', '盐', '黑胡椒'], steps: ['三文鱼抹盐黑胡椒', '平底锅热油', '皮朝下煎5分钟', '翻面煎3分钟', '挤柠檬汁'], time: '12分钟', calories: 280},
            '炒时蔬': {ingredients: ['西兰花', '胡萝卜', '木耳', '蒜末'], steps: ['蔬菜洗净切块', '焯水断生', '热油爆蒜', '下蔬菜翻炒', '加盐调味'], time: '8分钟', calories: 100},
            '豆腐汤': {ingredients: ['嫩豆腐1盒', '香菇', '葱花', '盐'], steps: ['豆腐切块', '香菇切片', '水烧开放香菇', '加豆腐煮3分钟', '加盐撒葱花'], time: '10分钟', calories: 90},
            '虾仁炒蛋': {ingredients: ['虾仁150g', '鸡蛋3个', '葱花', '料酒'], steps: ['虾仁用料酒腌制', '鸡蛋打散', '炒蛋至7分熟盛出', '炒虾仁变色', '加鸡蛋翻炒'], time: '10分钟', calories: 220},
            '清炒芦笋': {ingredients: ['芦笋300g', '蒜末', '盐', '油'], steps: ['芦笋去老根切段', '焯水30秒', '热油爆蒜', '下芦笋翻炒', '加盐出锅'], time: '8分钟', calories: 70},
            '蒸蛋羹': {ingredients: ['鸡蛋2个', '温水', '盐', '香油', '酱油'], steps: ['鸡蛋打散加盐', '加温水1:1.5搅匀', '过筛倒碗', '盖保鲜膜蒸10分钟', '淋香油酱油'], time: '15分钟', calories: 110},
            '菌菇汤': {ingredients: ['各种菌菇', '姜片', '枸杞', '盐'], steps: ['菌菇洗净撕开', '水烧开放姜片', '加菌菇煮5分钟', '加盐枸杞'], time: '10分钟', calories: 50},
            '烤蔬菜': {ingredients: ['西葫芦', '茄子', '彩椒', '橄榄油', '盐'], steps: ['蔬菜切片', '刷橄榄油撒盐', '烤箱200度', '烤15分钟翻面', '再烤10分钟'], time: '30分钟', calories: 130},
            '白灼菜心': {ingredients: ['菜心300g', '蒜末', '生抽', '油'], steps: ['菜心洗净', '水烧开加盐油', '焯1分钟捞出', '摆盘', '蒜末热油加生抽浇上'], time: '5分钟', calories: 55},
            '冬瓜汤': {ingredients: ['冬瓜300g', '虾皮', '葱花', '盐'], steps: ['冬瓜去皮切片', '水烧开放虾皮', '加冬瓜煮5分钟', '加盐撒葱花'], time: '10分钟', calories: 45},
            '蒸豆腐': {ingredients: ['嫩豆腐1盒', '葱花', '生抽', '香油'], steps: ['豆腐切块摆盘', '蒸锅蒸5分钟', '淋生抽香油', '撒葱花'], time: '8分钟', calories: 95},
            '凉拌木耳': {ingredients: ['木耳', '黄瓜', '蒜末', '醋', '香油'], steps: ['木耳泡发焯水', '黄瓜切丝', '加蒜末醋香油', '拌匀即可'], time: '10分钟', calories: 65},
            '海带汤': {ingredients: ['海带', '豆腐', '葱花', '盐'], steps: ['海带泡发切丝', '豆腐切块', '水烧开放海带', '加豆腐煮5分钟', '加盐撒葱花'], time: '15分钟', calories: 50},
            '清蒸虾': {ingredients: ['鲜虾300g', '姜片', '葱段', '料酒'], steps: ['虾洗净剪须', '摆盘放姜葱', '淋料酒', '蒸锅蒸5分钟', '配姜醋汁'], time: '8分钟', calories: 140},
            '番茄蛋汤': {ingredients: ['番茄2个', '鸡蛋2个', '葱花', '盐'], steps: ['番茄切块', '水烧开放番茄', '煮出汁', '倒入蛋液', '加盐撒葱花'], time: '8分钟', calories: 85},
            '拌菠菜': {ingredients: ['菠菜300g', '蒜末', '香油', '盐'], steps: ['菠菜洗净焯水', '过冷水挤干', '切段加蒜末', '拌香油盐'], time: '10分钟', calories: 60},
            '蒸南瓜': {ingredients: ['南瓜300g', '枸杞', '蜂蜜'], steps: ['南瓜去皮切块', '摆盘', '蒸锅蒸15分钟', '撒枸杞淋蜂蜜'], time: '18分钟', calories: 75},
            '白粥小菜': {ingredients: ['大米50g', '榨菜', '豆腐乳', '花生米'], steps: ['大米洗净', '加水煮粥', '小火煮40分钟', '配小菜食用'], time: '45分钟', calories: 150},
            '酸辣汤': {ingredients: ['豆腐', '木耳', '鸡蛋', '醋', '胡椒粉'], steps: ['豆腐木耳切丝', '水烧开放材料', '勾芡', '倒蛋液', '加醋胡椒粉'], time: '12分钟', calories: 120},
            '蒸鸡蛋': {ingredients: ['鸡蛋2个', '温水', '盐', '酱油'], steps: ['鸡蛋打散加盐', '加温水搅匀过筛', '盖保鲜膜蒸10分钟', '淋酱油香油'], time: '15分钟', calories: 100},
            '凉拌豆芽': {ingredients: ['豆芽300g', '蒜末', '醋', '香油'], steps: ['豆芽焯水1分钟', '过冷水沥干', '加蒜末醋香油', '拌匀即可'], time: '8分钟', calories: 55}
        };
        let name = null;
        for (let key in recipes) {
            if (msg.includes(key)) { name = key; break; }
        }
        if (!name) return {text: '❌ 该菜谱暂未收录\n\n📖 目前支持查询所有90种菜品！\n\n💡 试试这些：\n• 早餐：燕麦粥、豆浆油条、小笼包、煎饼果子\n• 午餐：宫保鸡丁、番茄炒蛋、红烧肉、清蒸鱼\n• 晚餐：蔬菜沙拉、鸡胸肉、寿司、烤鸡胸肉', action: {type: 'recipeQuery'}};
        const r = recipes[name];
        return {text: `📖 ${name}的做法：\n\n⏱️ 用时：${r.time}\n🔥 热量：${r.calories}卡\n\n🥘 食材：\n${r.ingredients.map(i => '  • ' + i).join('\n')}\n\n👨‍🍳 步骤：\n${r.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`, action: {type: 'recipeQuery'}};
    }
    
    nutritionAnalysis(msg) {
        // 直接调用详细营养功能
        return this.detailedNutrition(msg);
    }
    
    mealRecord(msg) {
        const match = msg.match(/吃了(.+)/);
        if (!match) return {text: '请告诉我吃了什么', action: {type: 'mealRecord'}};
        const foodInput = match[1].trim();
        
        // 所有90种菜品的热量数据
        const foodCalories = {
            '豆浆油条': 350, '三明治': 280, '小笼包': 320, '燕麦粥': 150, '煎饼果子': 380, '皮蛋瘦肉粥': 220, '鸡蛋灌饼': 340, '牛奶麦片': 180, '肠粉': 260, '包子馒头': 300,
            '全麦面包': 240, '水煮蛋': 80, '豆腐脑': 120, '热干面': 420, '蛋挞': 250, '玉米粥': 130, '生煎包': 360, '牛角包': 310, '南瓜粥': 140, '茶叶蛋': 90,
            '紫薯粥': 160, '手抓饼': 330, '鲜奶吐司': 270, '蒸饺': 290, '红豆粥': 170, '培根蛋': 320, '糯米鸡': 380, '希腊酸奶': 150, '虾饺': 200, '水果燕麦杯': 190,
            '宫保鸡丁': 450, '番茄炒蛋': 200, '红烧肉': 550, '清蒸鱼': 180, '麻婆豆腐': 280, '糖醋里脊': 480, '鱼香肉丝': 420, '青椒肉丝': 350, '回锅肉': 520, '水煮肉片': 480,
            '酸菜鱼': 380, '土豆炖牛肉': 420, '红烧茄子': 240, '西红柿牛腩': 400, '蒜蓉西兰花': 120, '木须肉': 380, '干煸豆角': 220, '香菇炖鸡': 360, '东坡肉': 580, '剁椒鱼头': 320,
            '小炒肉': 440, '辣子鸡': 460, '口水鸡': 280, '白灼虾': 150, '蚝油生菜': 100, '梅菜扣肉': 560, '咕咾肉': 490, '盐焗鸡': 380, '干锅花菜': 260, '铁板牛柳': 420,
            '蔬菜沙拉': 120, '鸡胸肉': 165, '麻辣烫': 400, '寿司': 300, '烤鸡胸肉': 180, '水煮菜心': 60, '蒸鲈鱼': 150, '凉拌黄瓜': 40, '紫菜蛋花汤': 80, '煎三文鱼': 280,
            '炒时蔬': 100, '豆腐汤': 90, '虾仁炒蛋': 220, '清炒芦笋': 70, '蒸蛋羹': 110, '菌菇汤': 50, '烤蔬菜': 130, '白灼菜心': 55, '冬瓜汤': 45, '蒸豆腐': 95,
            '凉拌木耳': 65, '海带汤': 50, '清蒸虾': 140, '番茄蛋汤': 85, '拌菠菜': 60, '蒸南瓜': 75, '白粥小菜': 150, '酸辣汤': 120, '蒸鸡蛋': 100, '凉拌豆芽': 55
        };
        
        // 查找匹配的菜品
        let foodName = foodInput;
        let calories = 200; // 默认热量
        
        for (let key in foodCalories) {
            if (foodInput.includes(key)) {
                foodName = key;
                calories = foodCalories[key];
                break;
            }
        }
        
        const record = {id: Date.now(), date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString(), food: foodName, calories: calories};
        this.mealRecords.unshift(record);
        this.saveData();
        const today = this.mealRecords.filter(r => r.date === record.date);
        const total = today.reduce((sum, r) => sum + r.calories, 0);
        return {text: `✅ 已记录：${foodName}\n\n📊 本餐热量：${calories}卡\n📅 今日总计：${total}卡`, action: {type: 'mealRecord', record}};
    }
    
    calorieCalculator(msg) {
        const match = msg.match(/(\d+)/);
        const calories = match ? parseInt(match[0]) : 300;
        const exercises = [{name: '跑步', time: Math.round(calories / 10)}, {name: '快走', time: Math.round(calories / 5)}];
        return {text: `消耗${calories}卡需要：\n${exercises.map(e => `${e.name}：${e.time}分钟`).join('\n')}`, action: {type: 'calorieCalculator'}};
    }
    
    viewRecords() {
        if (this.mealRecords.length === 0) return {text: '暂无记录', action: {type: 'viewRecords'}};
        const recent = this.mealRecords.slice(0, 10);
        let text = '最近记录：\n';
        recent.forEach(r => { text += `${r.date} ${r.time} - ${r.food} (${r.calories}卡)\n`; });
        return {text, action: {type: 'viewRecords'}};
    }
    
    showHelp() {
        return {text: '🍔 美食智能助手功能列表：\n\n🎯 基础功能：\n1. 推荐早餐/午餐/晚餐\n2. 查询菜谱（如：番茄炒蛋怎么做）\n3. 记录饮食（如：记录吃了番茄炒蛋）\n4. 计算热量（如：计算300卡路里）\n5. 查看记录\n\n✨ 高级功能：\n6. 详细营养分析（如：宫保鸡丁有哪些营养）\n7. 一周饮食计划（如：生成一周减脂计划）\n8. 运动记录（如：记录运动跑步30分钟）\n9. 查看所有菜品（输入：菜品列表）', action: {type: 'help'}};
    }
    
    showAllFoods() {
        const breakfastFoods = [
            '豆浆油条', '三明治', '小笼包', '燕麦粥', '煎饼果子',
            '皮蛋瘦肉粥', '鸡蛋灌饼', '牛奶麦片', '肠粉', '包子馒头',
            '全麦面包', '水煮蛋', '豆腐脑', '热干面', '蛋挞',
            '玉米粥', '生煎包', '牛角包', '南瓜粥', '茶叶蛋',
            '紫薯粥', '手抓饼', '鲜奶吐司', '蒸饺', '红豆粥',
            '培根蛋', '糯米鸡', '希腊酸奶', '虾饺', '水果燕麦杯'
        ];
        
        const lunchFoods = [
            '宫保鸡丁', '番茄炒蛋', '红烧肉', '清蒸鱼', '麻婆豆腐',
            '糖醋里脊', '鱼香肉丝', '青椒肉丝', '回锅肉', '水煮肉片',
            '酸菜鱼', '土豆炖牛肉', '红烧茄子', '西红柿牛腩', '蒜蓉西兰花',
            '木须肉', '干煸豆角', '香菇炖鸡', '东坡肉', '剁椒鱼头',
            '小炒肉', '辣子鸡', '口水鸡', '白灼虾', '蚝油生菜',
            '梅菜扣肉', '咕咾肉', '盐焗鸡', '干锅花菜', '铁板牛柳'
        ];
        
        const dinnerFoods = [
            '蔬菜沙拉', '鸡胸肉', '麻辣烫', '寿司', '烤鸡胸肉',
            '水煮菜心', '蒸鲈鱼', '凉拌黄瓜', '紫菜蛋花汤', '煎三文鱼',
            '炒时蔬', '豆腐汤', '虾仁炒蛋', '清炒芦笋', '蒸蛋羹',
            '菌菇汤', '烤蔬菜', '白灼菜心', '冬瓜汤', '蒸豆腐',
            '凉拌木耳', '海带汤', '清蒸虾', '番茄蛋汤', '拌菠菜',
            '蒸南瓜', '白粥小菜', '酸辣汤', '蒸鸡蛋', '凉拌豆芽'
        ];
        
        let text = '📋 美食智能助手 - 已收录菜品列表\n\n';
        text += '━━━━━━━━━━━━━━━━━━━━━━\n\n';
        
        text += '🌅 早餐类（30种）：\n';
        breakfastFoods.forEach((food, index) => {
            text += `${index + 1}. ${food}`;
            if ((index + 1) % 5 === 0 || index === breakfastFoods.length - 1) {
                text += '\n';
            } else {
                text += '  ';
            }
        });
        
        text += '\n🍜 午餐类（30种）：\n';
        lunchFoods.forEach((food, index) => {
            text += `${index + 1}. ${food}`;
            if ((index + 1) % 5 === 0 || index === lunchFoods.length - 1) {
                text += '\n';
            } else {
                text += '  ';
            }
        });
        
        text += '\n🌙 晚餐类（30种）：\n';
        dinnerFoods.forEach((food, index) => {
            text += `${index + 1}. ${food}`;
            if ((index + 1) % 5 === 0 || index === dinnerFoods.length - 1) {
                text += '\n';
            } else {
                text += '  ';
            }
        });
        
        text += '\n━━━━━━━━━━━━━━━━━━━━━━\n\n';
        text += '📊 数据统计：\n';
        text += `• 总菜品数：90种\n`;
        text += `• 早餐：30种  午餐：30种  晚餐：30种\n\n`;
        
        text += '✨ 支持的功能：\n';
        text += `• 菜谱查询：输入"菜谱+菜名"或"菜名+怎么做"\n`;
        text += `• 营养分析：输入"详细营养+菜名"\n`;
        text += `• 饮食记录：输入"记录吃了+菜名"\n`;
        text += `• 美食推荐：输入"推荐美食"或"推荐早餐/午餐/晚餐"\n`;
        text += `• 一周计划：输入"生成一周减脂/增肌计划"\n\n`;
        
        text += '⚠️ 数据说明：\n';
        text += `由于数据有限，本系统目前仅支持以上90种菜品的完整功能。\n`;
        text += `包括：详细菜谱、营养分析、热量计算、饮食记录等。\n`;
        text += `如需查询其他菜品，暂时无法提供相关数据。\n\n`;
        
        text += '💡 使用示例：\n';
        text += `• "番茄炒蛋怎么做" - 查看做法\n`;
        text += `• "宫保鸡丁有哪些营养" - 查看营养成分\n`;
        text += `• "记录吃了清蒸鱼" - 记录饮食\n`;
        text += `• "推荐美食" - 随机推荐3种美食`;
        
        return {text, action: {type: 'showAllFoods'}};
    }
    
    chat() {
        return {text: '你好！我可以帮你推荐美食、查询菜谱、记录饮食。试试说"推荐早餐"或"帮助"', action: {type: 'chat'}};
    }
    
    async processWithAI(msg) {
        try {
            if (typeof API_CONFIG === 'undefined') throw new Error('No API config');
            const config = API_CONFIG[this.aiProvider];
            const messages = [{role: 'system', content: '你是美食助手'}, {role: 'user', content: msg}];
            const res = await fetch(`${config.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}`},
                body: JSON.stringify({model: config.model, messages: messages, max_tokens: 500})
            });
            if (!res.ok) throw new Error('API error');
            const data = await res.json();
            return {text: data.choices[0].message.content, action: {type: 'ai_chat'}};
        } catch (e) {
            return this.processLocal(msg);
        }
    }
    
    detailedNutrition(msg) {
        const nutritionDB = {
            // 早餐类
            '豆浆油条': {calories: 350, protein: 10, fat: 18, carbs: 40, fiber: 2},
            '三明治': {calories: 280, protein: 12, fat: 12, carbs: 32, fiber: 3},
            '小笼包': {calories: 320, protein: 11, fat: 15, carbs: 38, fiber: 2},
            '燕麦粥': {calories: 150, protein: 6, fat: 3, carbs: 27, fiber: 4},
            '煎饼果子': {calories: 380, protein: 11, fat: 16, carbs: 48, fiber: 2},
            '皮蛋瘦肉粥': {calories: 220, protein: 13, fat: 8, carbs: 28, fiber: 1},
            '鸡蛋灌饼': {calories: 340, protein: 12, fat: 15, carbs: 40, fiber: 2},
            '牛奶麦片': {calories: 180, protein: 8, fat: 4, carbs: 30, fiber: 3},
            '肠粉': {calories: 260, protein: 8, fat: 10, carbs: 36, fiber: 1},
            '包子馒头': {calories: 300, protein: 9, fat: 8, carbs: 50, fiber: 2},
            '全麦面包': {calories: 240, protein: 9, fat: 3, carbs: 45, fiber: 5},
            '水煮蛋': {calories: 80, protein: 7, fat: 5, carbs: 1, fiber: 0},
            '豆腐脑': {calories: 120, protein: 8, fat: 6, carbs: 10, fiber: 2},
            '热干面': {calories: 420, protein: 12, fat: 18, carbs: 55, fiber: 3},
            '蛋挞': {calories: 250, protein: 5, fat: 14, carbs: 28, fiber: 1},
            '玉米粥': {calories: 130, protein: 4, fat: 2, carbs: 26, fiber: 3},
            '生煎包': {calories: 360, protein: 12, fat: 16, carbs: 42, fiber: 2},
            '牛角包': {calories: 310, protein: 6, fat: 16, carbs: 36, fiber: 2},
            '南瓜粥': {calories: 140, protein: 3, fat: 1, carbs: 30, fiber: 3},
            '茶叶蛋': {calories: 90, protein: 7, fat: 6, carbs: 1, fiber: 0},
            '紫薯粥': {calories: 160, protein: 3, fat: 1, carbs: 36, fiber: 4},
            '手抓饼': {calories: 330, protein: 8, fat: 15, carbs: 42, fiber: 2},
            '鲜奶吐司': {calories: 270, protein: 8, fat: 8, carbs: 42, fiber: 2},
            '蒸饺': {calories: 290, protein: 11, fat: 12, carbs: 36, fiber: 2},
            '红豆粥': {calories: 170, protein: 5, fat: 1, carbs: 36, fiber: 4},
            '培根蛋': {calories: 320, protein: 18, fat: 22, carbs: 12, fiber: 1},
            '糯米鸡': {calories: 380, protein: 14, fat: 16, carbs: 45, fiber: 2},
            '希腊酸奶': {calories: 150, protein: 12, fat: 6, carbs: 15, fiber: 0},
            '虾饺': {calories: 200, protein: 10, fat: 6, carbs: 28, fiber: 1},
            '水果燕麦杯': {calories: 190, protein: 6, fat: 4, carbs: 35, fiber: 5},
            
            // 午餐类
            '宫保鸡丁': {calories: 450, protein: 28, fat: 22, carbs: 35, fiber: 3},
            '番茄炒蛋': {calories: 200, protein: 12, fat: 14, carbs: 8, fiber: 2},
            '红烧肉': {calories: 550, protein: 20, fat: 45, carbs: 15, fiber: 1},
            '清蒸鱼': {calories: 180, protein: 25, fat: 8, carbs: 2, fiber: 0},
            '麻婆豆腐': {calories: 280, protein: 15, fat: 18, carbs: 12, fiber: 3},
            '糖醋里脊': {calories: 480, protein: 22, fat: 24, carbs: 42, fiber: 2},
            '鱼香肉丝': {calories: 420, protein: 24, fat: 22, carbs: 32, fiber: 3},
            '青椒肉丝': {calories: 350, protein: 22, fat: 18, carbs: 25, fiber: 3},
            '回锅肉': {calories: 520, protein: 22, fat: 38, carbs: 22, fiber: 2},
            '水煮肉片': {calories: 480, protein: 26, fat: 32, carbs: 20, fiber: 3},
            '酸菜鱼': {calories: 380, protein: 28, fat: 20, carbs: 18, fiber: 2},
            '土豆炖牛肉': {calories: 420, protein: 24, fat: 22, carbs: 32, fiber: 3},
            '红烧茄子': {calories: 240, protein: 4, fat: 16, carbs: 22, fiber: 4},
            '西红柿牛腩': {calories: 400, protein: 26, fat: 20, carbs: 28, fiber: 3},
            '蒜蓉西兰花': {calories: 120, protein: 5, fat: 6, carbs: 12, fiber: 4},
            '木须肉': {calories: 380, protein: 22, fat: 20, carbs: 28, fiber: 3},
            '干煸豆角': {calories: 220, protein: 6, fat: 14, carbs: 18, fiber: 4},
            '香菇炖鸡': {calories: 360, protein: 28, fat: 18, carbs: 20, fiber: 3},
            '东坡肉': {calories: 580, protein: 18, fat: 48, carbs: 18, fiber: 1},
            '剁椒鱼头': {calories: 320, protein: 24, fat: 18, carbs: 15, fiber: 2},
            '小炒肉': {calories: 440, protein: 24, fat: 26, carbs: 28, fiber: 2},
            '辣子鸡': {calories: 460, protein: 26, fat: 28, carbs: 26, fiber: 2},
            '口水鸡': {calories: 280, protein: 26, fat: 14, carbs: 12, fiber: 2},
            '白灼虾': {calories: 150, protein: 28, fat: 3, carbs: 2, fiber: 0},
            '蚝油生菜': {calories: 100, protein: 3, fat: 6, carbs: 8, fiber: 3},
            '梅菜扣肉': {calories: 560, protein: 20, fat: 46, carbs: 16, fiber: 2},
            '咕咾肉': {calories: 490, protein: 20, fat: 28, carbs: 42, fiber: 2},
            '盐焗鸡': {calories: 380, protein: 32, fat: 22, carbs: 12, fiber: 1},
            '干锅花菜': {calories: 260, protein: 8, fat: 16, carbs: 22, fiber: 4},
            '铁板牛柳': {calories: 420, protein: 28, fat: 24, carbs: 22, fiber: 2},
            
            // 晚餐类
            '蔬菜沙拉': {calories: 120, protein: 3, fat: 8, carbs: 10, fiber: 4},
            '鸡胸肉': {calories: 165, protein: 31, fat: 3.6, carbs: 0, fiber: 0},
            '麻辣烫': {calories: 400, protein: 18, fat: 20, carbs: 35, fiber: 4},
            '寿司': {calories: 300, protein: 12, fat: 5, carbs: 55, fiber: 2},
            '烤鸡胸肉': {calories: 180, protein: 32, fat: 4, carbs: 2, fiber: 0},
            '水煮菜心': {calories: 60, protein: 2, fat: 3, carbs: 6, fiber: 2},
            '蒸鲈鱼': {calories: 150, protein: 26, fat: 5, carbs: 1, fiber: 0},
            '凉拌黄瓜': {calories: 40, protein: 1, fat: 2, carbs: 5, fiber: 2},
            '紫菜蛋花汤': {calories: 80, protein: 6, fat: 4, carbs: 6, fiber: 1},
            '煎三文鱼': {calories: 280, protein: 28, fat: 18, carbs: 0, fiber: 0},
            '炒时蔬': {calories: 100, protein: 3, fat: 5, carbs: 10, fiber: 3},
            '豆腐汤': {calories: 90, protein: 8, fat: 5, carbs: 6, fiber: 2},
            '虾仁炒蛋': {calories: 220, protein: 20, fat: 12, carbs: 8, fiber: 1},
            '清炒芦笋': {calories: 70, protein: 3, fat: 4, carbs: 6, fiber: 3},
            '蒸蛋羹': {calories: 110, protein: 8, fat: 7, carbs: 4, fiber: 0},
            '菌菇汤': {calories: 50, protein: 3, fat: 2, carbs: 6, fiber: 2},
            '烤蔬菜': {calories: 130, protein: 4, fat: 6, carbs: 15, fiber: 4},
            '白灼菜心': {calories: 55, protein: 2, fat: 3, carbs: 5, fiber: 2},
            '冬瓜汤': {calories: 45, protein: 2, fat: 1, carbs: 8, fiber: 2},
            '蒸豆腐': {calories: 95, protein: 9, fat: 5, carbs: 4, fiber: 2},
            '凉拌木耳': {calories: 65, protein: 2, fat: 3, carbs: 8, fiber: 3},
            '海带汤': {calories: 50, protein: 2, fat: 1, carbs: 9, fiber: 3},
            '清蒸虾': {calories: 140, protein: 26, fat: 3, carbs: 2, fiber: 0},
            '番茄蛋汤': {calories: 85, protein: 6, fat: 5, carbs: 6, fiber: 1},
            '拌菠菜': {calories: 60, protein: 3, fat: 3, carbs: 6, fiber: 3},
            '蒸南瓜': {calories: 75, protein: 2, fat: 0.5, carbs: 17, fiber: 3},
            '白粥小菜': {calories: 150, protein: 4, fat: 2, carbs: 32, fiber: 1},
            '酸辣汤': {calories: 120, protein: 6, fat: 5, carbs: 14, fiber: 2},
            '蒸鸡蛋': {calories: 100, protein: 8, fat: 7, carbs: 2, fiber: 0},
            '凉拌豆芽': {calories: 55, protein: 3, fat: 2, carbs: 7, fiber: 3}
        };
        
        let foodName = null;
        for (let key in nutritionDB) {
            if (msg.includes(key)) {
                foodName = key;
                break;
            }
        }
        
        if (!foodName) {
            return {text: '❌ 该菜品暂无详细营养数据\n\n💡 目前支持查询所有90种菜品！\n\n📝 试试这些：\n• 早餐：燕麦粥、豆浆油条、全麦面包\n• 午餐：宫保鸡丁、清蒸鱼、番茄炒蛋\n• 晚餐：鸡胸肉、蔬菜沙拉、清蒸虾', action: {type: 'detailedNutrition'}};
        }
        
        const n = nutritionDB[foodName];
        
        // 计算健康评分
        let score = 0;
        if (n.protein >= 20) score += 25;
        else if (n.protein >= 15) score += 20;
        else if (n.protein >= 10) score += 15;
        else score += 10;
        
        if (n.fiber >= 3) score += 25;
        else if (n.fiber >= 2) score += 20;
        else if (n.fiber >= 1) score += 15;
        else score += 10;
        
        if (n.calories <= 200) score += 25;
        else if (n.calories <= 350) score += 20;
        else if (n.calories <= 500) score += 15;
        else score += 10;
        
        if (n.fat <= 10) score += 25;
        else if (n.fat <= 20) score += 20;
        else if (n.fat <= 30) score += 15;
        else score += 10;
        
        let text = `📊 ${foodName} - 详细营养分析\n\n`;
        text += `🔥 热量：${n.calories}卡\n`;
        text += `🥩 蛋白质：${n.protein}g\n`;
        text += `🧈 脂肪：${n.fat}g\n`;
        text += `🍚 碳水化合物：${n.carbs}g\n`;
        text += `🌾 膳食纤维：${n.fiber}g\n\n`;
        text += `⭐ 健康评分：${score}/100分\n\n`;
        text += `💡 营养建议：\n`;
        
        if (n.protein >= 20) text += `✅ 蛋白质含量优秀，有助于肌肉生长\n`;
        else if (n.protein < 10) text += `⚠️ 蛋白质偏低，建议搭配高蛋白食物\n`;
        
        if (n.fiber >= 3) text += `✅ 膳食纤维丰富，促进消化\n`;
        else if (n.fiber < 2) text += `⚠️ 纤维含量较低，建议多吃蔬菜\n`;
        
        if (n.fat > 30) text += `⚠️ 脂肪含量较高，减脂期慎食\n`;
        else if (n.fat < 10) text += `✅ 低脂食物，适合减脂\n`;
        
        if (n.carbs > 50) text += `⚠️ 碳水较高，糖尿病患者慎食\n`;
        
        return {text, action: {type: 'detailedNutrition', nutrition: n, score}};
    }
    
    generateWeeklyPlan(msg) {
        // 识别目标
        let goal = 'maintain';
        let targetCalories = 2000;
        
        if (msg.includes('减脂') || msg.includes('减肥') || msg.includes('瘦身')) {
            goal = 'lose';
            targetCalories = 1500;
        } else if (msg.includes('增肌') || msg.includes('增重') || msg.includes('增加')) {
            goal = 'gain';
            targetCalories = 2500;
        }
        
        this.userProfile.goal = goal;
        this.userProfile.dailyCalorieTarget = targetCalories;
        
        // 食物数据库（扩展版，每类15种）
        const breakfastFoods = [
            {name: '燕麦粥', calories: 150}, {name: '全麦面包', calories: 240}, {name: '水煮蛋', calories: 80},
            {name: '豆浆油条', calories: 350}, {name: '三明治', calories: 280}, {name: '牛奶麦片', calories: 180},
            {name: '皮蛋瘦肉粥', calories: 220}, {name: '希腊酸奶', calories: 150}, {name: '水果燕麦杯', calories: 190},
            {name: '小笼包', calories: 320}, {name: '煎饼果子', calories: 380}, {name: '鸡蛋灌饼', calories: 340},
            {name: '豆腐脑', calories: 120}, {name: '玉米粥', calories: 130}, {name: '南瓜粥', calories: 140}
        ];
        
        const lunchFoods = [
            {name: '清蒸鱼', calories: 180}, {name: '番茄炒蛋', calories: 200}, {name: '宫保鸡丁', calories: 450},
            {name: '麻婆豆腐', calories: 280}, {name: '蒜蓉西兰花', calories: 120}, {name: '白灼虾', calories: 150},
            {name: '青椒肉丝', calories: 350}, {name: '香菇炖鸡', calories: 360}, {name: '蚝油生菜', calories: 100},
            {name: '鱼香肉丝', calories: 420}, {name: '糖醋里脊', calories: 480}, {name: '土豆炖牛肉', calories: 420},
            {name: '红烧茄子', calories: 240}, {name: '西红柿牛腩', calories: 400}, {name: '木须肉', calories: 380}
        ];
        
        const dinnerFoods = [
            {name: '蔬菜沙拉', calories: 120}, {name: '鸡胸肉', calories: 165}, {name: '蒸鲈鱼', calories: 150},
            {name: '豆腐汤', calories: 90}, {name: '清炒芦笋', calories: 70}, {name: '蒸蛋羹', calories: 110},
            {name: '菌菇汤', calories: 50}, {name: '烤蔬菜', calories: 130}, {name: '紫菜蛋花汤', calories: 80},
            {name: '烤鸡胸肉', calories: 180}, {name: '水煮菜心', calories: 60}, {name: '凉拌黄瓜', calories: 40},
            {name: '煎三文鱼', calories: 280}, {name: '炒时蔬', calories: 100}, {name: '虾仁炒蛋', calories: 220}
        ];
        
        // 生成7天计划（根据目标热量智能选择）
        const plan = [];
        const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        
        for (let i = 0; i < 7; i++) {
            let breakfast, lunch, dinner, total;
            let attempts = 0;
            const maxAttempts = 20;
            
            // 尝试多次，找到接近目标热量的组合
            do {
                breakfast = breakfastFoods[Math.floor(Math.random() * breakfastFoods.length)];
                lunch = lunchFoods[Math.floor(Math.random() * lunchFoods.length)];
                dinner = dinnerFoods[Math.floor(Math.random() * dinnerFoods.length)];
                total = breakfast.calories + lunch.calories + dinner.calories;
                attempts++;
                
                // 检查是否接近目标热量（允许±200卡的误差）
                const difference = Math.abs(total - targetCalories);
                if (difference <= 200 || attempts >= maxAttempts) {
                    break;
                }
            } while (true);
            
            plan.push({
                day: days[i],
                breakfast: breakfast,
                lunch: lunch,
                dinner: dinner,
                total: total
            });
        }
        
        this.weeklyPlan = plan;
        
        // 生成文本
        let text = `📅 一周饮食计划（${goal === 'lose' ? '减脂' : goal === 'gain' ? '增肌' : '维持'}）\n`;
        text += `🎯 每日目标：${targetCalories}卡\n\n`;
        
        plan.forEach(day => {
            text += `${day.day}：\n`;
            text += `  早餐：${day.breakfast.name}（${day.breakfast.calories}卡）\n`;
            text += `  午餐：${day.lunch.name}（${day.lunch.calories}卡）\n`;
            text += `  晚餐：${day.dinner.name}（${day.dinner.calories}卡）\n`;
            text += `  合计：${day.total}卡\n\n`;
        });
        
        text += `💡 提示：计划已生成，坚持执行可达成目标！`;
        
        return {text, action: {type: 'weeklyPlan', plan}};
    }
    
    recordExercise(msg) {
        // 运动数据库
        const exerciseDB = {
            '跑步': {caloriesPerMin: 10, type: '有氧'},
            '快走': {caloriesPerMin: 5, type: '有氧'},
            '散步': {caloriesPerMin: 3, type: '有氧'},
            '游泳': {caloriesPerMin: 12, type: '有氧'},
            '骑行': {caloriesPerMin: 8, type: '有氧'},
            '跳绳': {caloriesPerMin: 13, type: '有氧'},
            '瑜伽': {caloriesPerMin: 3, type: '柔韧'},
            '普拉提': {caloriesPerMin: 4, type: '柔韧'},
            '太极': {caloriesPerMin: 2.5, type: '柔韧'},
            '力量训练': {caloriesPerMin: 6, type: '力量'},
            '篮球': {caloriesPerMin: 9, type: '球类'},
            '足球': {caloriesPerMin: 10, type: '球类'},
            '羽毛球': {caloriesPerMin: 7, type: '球类'},
            '网球': {caloriesPerMin: 8, type: '球类'},
            '乒乓球': {caloriesPerMin: 5, type: '球类'},
            '爬楼梯': {caloriesPerMin: 8, type: '有氧'},
            '跳舞': {caloriesPerMin: 6, type: '有氧'},
            '健身操': {caloriesPerMin: 7, type: '有氧'},
            '爬山': {caloriesPerMin: 9, type: '有氧'},
            '徒步': {caloriesPerMin: 4.5, type: '有氧'},
            '拳击': {caloriesPerMin: 11, type: '力量'},
            '滑冰': {caloriesPerMin: 7, type: '有氧'}
        };
        
        // 识别运动类型和时长
        let exerciseName = null;
        let duration = 0;
        
        for (let key in exerciseDB) {
            if (msg.includes(key)) {
                exerciseName = key;
                break;
            }
        }
        
        // 识别时长：支持多种表达方式
        // 1. 直接数字+分钟：30分钟、40分钟
        let match = msg.match(/(\d+)\s*分钟/);
        if (match) {
            duration = parseInt(match[1]);
        }
        
        // 2. 小时：1小时、2小时
        if (duration === 0) {
            match = msg.match(/(\d+)\s*小时/);
            if (match) {
                duration = parseInt(match[1]) * 60;
            }
        }
        
        // 3. 半小时
        if (duration === 0 && msg.includes('半小时')) {
            duration = 30;
        }
        
        // 4. 一小时、两小时（中文数字）
        if (duration === 0) {
            const chineseNumbers = {'一': 1, '二': 2, '两': 2, '三': 3, '四': 4, '五': 5};
            for (let chinese in chineseNumbers) {
                if (msg.includes(chinese + '小时')) {
                    duration = chineseNumbers[chinese] * 60;
                    break;
                }
            }
        }
        
        if (!exerciseName || duration === 0) {
            return {text: '❌ 没识别到运动信息哦～\n\n💡 试试这样说：\n• "跑步30分钟"\n• "我游泳了1小时"\n• "刚打篮球40分钟"\n• "今天跳绳半小时"\n• "散步45分钟"\n• "打太极1小时"\n\n💪 支持的运动（共22种）：\n🏃 有氧运动：跑步、快走、散步、游泳、骑行、跳绳、爬楼梯、跳舞、健身操、爬山、徒步、滑冰\n🧘 柔韧运动：瑜伽、普拉提、太极\n💪 力量运动：力量训练、拳击\n⚽ 球类运动：篮球、足球、羽毛球、网球、乒乓球', action: {type: 'exerciseRecord'}};
        }
        
        const exercise = exerciseDB[exerciseName];
        const caloriesBurned = exercise.caloriesPerMin * duration;
        
        // 记录运动
        const record = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            exercise: exerciseName,
            duration: duration,
            calories: caloriesBurned,
            type: exercise.type
        };
        
        this.exerciseRecords.unshift(record);
        this.saveData();
        
        // 计算今日数据
        const today = new Date().toLocaleDateString();
        const todayMeals = this.mealRecords.filter(r => r.date === today);
        const todayExercises = this.exerciseRecords.filter(r => r.date === today);
        
        const totalIntake = todayMeals.reduce((sum, r) => sum + r.calories, 0);
        const totalBurned = todayExercises.reduce((sum, r) => sum + r.calories, 0);
        const netCalories = totalIntake - totalBurned;
        
        let text = `✅ 运动记录成功！\n\n`;
        text += `🏃 运动项目：${exerciseName}（${exercise.type}）\n`;
        text += `⏱️ 运动时长：${duration}分钟\n`;
        text += `🔥 消耗热量：${caloriesBurned}卡\n\n`;
        text += `📊 今日数据：\n`;
        text += `  摄入：${totalIntake}卡\n`;
        text += `  消耗：${totalBurned}卡\n`;
        text += `  净摄入：${netCalories}卡\n\n`;
        
        // 智能建议
        if (this.userProfile.goal === 'lose' && netCalories > 1500) {
            text += `⚠️ 净摄入偏高，建议增加运动或减少饮食`;
        } else if (this.userProfile.goal === 'gain' && netCalories < 2500) {
            text += `💡 净摄入偏低，建议增加饮食`;
        } else if (netCalories < 1200) {
            text += `⚠️ 热量摄入过低，注意营养均衡`;
        } else {
            text += `✅ 热量控制良好，继续保持！`;
        }
        
        return {text, action: {type: 'exerciseRecord', record, todayData: {totalIntake, totalBurned, netCalories}}};
    }
}