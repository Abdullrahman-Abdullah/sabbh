// بيانات التطبيق
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let appState = {
    goals: [],
    communityGoals: [],
    stats: {
        totalGoals: 0,
        activeUsers: 0,
        prayersCount: 0,
        duasCount: 0
    }
};

// تهيئة التطبيق
function initApp() {
    checkAuth();
    updateUIForAuth();
    setupEventListeners();
    loadInitialData();
}

// التحقق من حالة المصادقة
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token && !window.location.pathname.includes('login.html')) {
        // إذا لم يكن مسجل دخول ويحاول الوصول لصفحة محمية
        if (window.location.pathname.includes('dashboard.html') || 
            window.location.pathname.includes('profile.html')) {
            window.location.href = 'login.html';
        }
    }
}

// تحديث واجهة المستخدم بناءً على حالة المصادقة
function updateUIForAuth() {
    const userAvatar = document.getElementById('userAvatar');
    const authButtons = document.getElementById('authButtons');
    
    if (currentUser) {
        if (userAvatar) {
            const userInitial = currentUser.name ? currentUser.name.charAt(0) : 'م';
            userAvatar.innerHTML = `<span>${userInitial}</span>`;
            userAvatar.title = currentUser.name || 'مستخدم';
        }
        if (authButtons) {
            authButtons.style.display = 'none';
        }
    } else {
        if (userAvatar) {
            userAvatar.innerHTML = '<i class="fas fa-user"></i>';
        }
        if (authButtons) {
            authButtons.style.display = 'flex';
        }
    }
}

// إعداد المستمعين للأحداث
function setupEventListeners() {
    // القائمة المتحركة للجوال
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('show');
        });
    }
    
    // القائمة المنسدلة للمستخدم
    const userAvatar = document.getElementById('userAvatar');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userAvatar && userDropdown) {
        userAvatar.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
        
        // إغلاق القائمة عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });
    }
    
    // تسجيل الخروج
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
    
    // نماذج إنشاء الأهداف
    const goalForm = document.getElementById('goalForm');
    if (goalForm) {
        goalForm.addEventListener('submit', handleCreateGoal);
        
        // التحكم في ظهور/اختفاء الحقول
        const goalType = document.getElementById('goalType');
        const forPersonGroup = document.getElementById('forPersonGroup');
        
        if (goalType && forPersonGroup) {
            goalType.addEventListener('change', (e) => {
                forPersonGroup.style.display = e.target.value === 'dua' ? 'block' : 'none';
            });
        }
    }
}

// تحميل البيانات الأولية
function loadInitialData() {
    updateStats();
    
    // تحميل أهداف المجتمع إذا كانت الصفحة تحتوي على العنصر
    if (document.getElementById('communityGoals')) {
        loadCommunityGoals();
    }
    
    // تحميل أهداف المستخدم إذا كان مسجلاً
    if (currentUser && document.getElementById('userGoals')) {
        loadUserGoals();
    }
}

// تحديث الإحصائيات
async function updateStats() {
    try {
        // محاكاة بيانات (سيتم استبدالها بـ API حقيقي)
        appState.stats = {
            totalGoals: 1254,
            activeUsers: 342,
            prayersCount: 1256789,
            duasCount: 45678
        };
        
        // تحديث واجهة المستخدم
        document.getElementById('totalGoals').textContent = 
            formatNumber(appState.stats.totalGoals);
        document.getElementById('activeUsers').textContent = 
            formatNumber(appState.stats.activeUsers);
        document.getElementById('prayersCount').textContent = 
            formatNumber(appState.stats.prayersCount);
        document.getElementById('duasCount').textContent = 
            formatNumber(appState.stats.duasCount);
            
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// تحميل أهداف المجتمع
async function loadCommunityGoals() {
    try {
        const container = document.getElementById('communityGoals');
        if (!container) return;
        
        // محاكاة بيانات (ستستبدل بـ API)
        const mockGoals = [
            {
                id: 1,
                type: 'tasbeeh',
                title: 'تسبيح 1000 مرة يومياً',
                user: { name: 'أحمد', avatar: 'أ' },
                target: 1000,
                current: 750,
                progress: 75,
                likes: 24,
                prayers: 12,
                createdAt: 'قبل ساعتين'
            },
            {
                id: 2,
                type: 'istighfar',
                title: 'استغفار 100 مرة بعد كل صلاة',
                user: { name: 'محمد', avatar: 'م' },
                target: 700,
                current: 450,
                progress: 64,
                likes: 18,
                prayers: 8,
                createdAt: 'قبل 5 ساعات'
            },
            {
                id: 3,
                type: 'dua',
                title: 'دعاء لوالدتي بالشفاء',
                user: { name: 'فاطمة', avatar: 'ف' },
                target: 100,
                current: 65,
                progress: 65,
                likes: 42,
                prayers: 35,
                createdAt: 'قبل يوم'
            },
            {
                id: 4,
                type: 'tasbeeh',
                title: 'تسبيح الأذكار المسائية',
                user: { name: 'خالد', avatar: 'خ' },
                target: 500,
                current: 320,
                progress: 64,
                likes: 15,
                prayers: 9,
                createdAt: 'قبل يومين'
            }
        ];
        
        appState.communityGoals = mockGoals;
        renderCommunityGoals();
        
    } catch (error) {
        console.error('Error loading community goals:', error);
        showError('حدث خطأ في تحميل الأهداف');
    }
}

// عرض أهداف المجتمع
function renderCommunityGoals() {
    const container = document.getElementById('communityGoals');
    if (!container) return;
    
    if (appState.communityGoals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>لا توجد أهداف بعد</h3>
                <p>كن أول من ينشئ هدفاً وشاركه مع المجتمع</p>
                <a href="goals.html" class="btn btn-primary">إنشاء هدف جديد</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = appState.communityGoals.map(goal => `
        <div class="goal-card" data-id="${goal.id}">
            <div class="goal-header">
                <div class="goal-icon ${goal.type}">
                    <i class="${getGoalIcon(goal.type)}"></i>
                </div>
                <h3 class="goal-title">${goal.title}</h3>
            </div>
            <div class="goal-body">
                <div class="goal-meta">
                    <div class="goal-user">
                        <span class="user-avatar">${goal.user.avatar}</span>
                        <span>${goal.user.name}</span>
                    </div>
                    <span class="goal-time">${goal.createdAt}</span>
                </div>
                
                <div class="goal-progress">
                    <div class="progress-label">
                        <span>التقدم</span>
                        <span>${goal.current} / ${goal.target}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${goal.progress}%"></div>
                    </div>
                </div>
                
                <div class="goal-stats">
                    <div class="stat">
                        <i class="fas fa-heart"></i>
                        <span>${goal.likes}</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-hands-praying"></i>
                        <span>${goal.prayers}</span>
                    </div>
                </div>
                
                <div class="goal-actions">
                    <button class="btn btn-small btn-like" onclick="likeGoal(${goal.id})">
                        <i class="fas fa-heart"></i> تشجيع
                    </button>
                    <button class="btn btn-small btn-pray" onclick="sendPrayer(${goal.id})">
                        <i class="fas fa-hands-praying"></i> أدعو له
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// تحميل أهداف المستخدم
async function loadUserGoals() {
    try {
        // سيتم استبدالها بـ API
        const mockUserGoals = [
            {
                id: 101,
                type: 'tasbeeh',
                title: 'تسبيح الصباح',
                target: 100,
                current: 45,
                progress: 45,
                createdAt: '2024-01-10',
                deadline: '2024-01-20'
            },
            {
                id: 102,
                type: 'istighfar',
                title: 'استغفار اليومي',
                target: 100,
                current: 100,
                progress: 100,
                createdAt: '2024-01-05',
                deadline: '2024-01-05',
                completed: true
            }
        ];
        
        appState.goals = mockUserGoals;
        renderUserGoals();
        
    } catch (error) {
        console.error('Error loading user goals:', error);
    }
}

// عرض أهداف المستخدم
function renderUserGoals() {
    const container = document.getElementById('userGoals');
    if (!container) return;
    
    if (appState.goals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bullseye"></i>
                <h3>لا توجد أهداف بعد</h3>
                <p>ابدأ رحلتك الروحية بإنشاء أول هدف لك</p>
                <a href="goals.html" class="btn btn-primary">إنشاء هدف جديد</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = appState.goals.map(goal => `
        <div class="goal-item ${goal.completed ? 'completed' : ''}" data-id="${goal.id}">
            <div class="goal-item-header">
                <div class="goal-type ${goal.type}">
                    <i class="${getGoalIcon(goal.type)}"></i>
                </div>
                <div class="goal-info">
                    <h4>${goal.title}</h4>
                    <div class="goal-meta">
                        <span><i class="fas fa-calendar"></i> ${goal.createdAt}</span>
                        ${goal.deadline ? `<span><i class="fas fa-clock"></i> ${goal.deadline}</span>` : ''}
                    </div>
                </div>
                ${goal.completed ? 
                    '<span class="badge badge-success"><i class="fas fa-check"></i> مكتمل</span>' : 
                    `<button class="btn btn-small" onclick="incrementGoal(${goal.id})">
                        <i class="fas fa-plus"></i> زيادة
                    </button>`
                }
            </div>
            
            <div class="goal-progress">
                <div class="progress-label">
                    <span>${goal.current} / ${goal.target}</span>
                    <span>${goal.progress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${goal.progress}%"></div>
                </div>
            </div>
            
            <div class="goal-actions">
                ${!goal.completed ? `
                    <button class="btn-icon" onclick="editGoal(${goal.id})" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                ` : ''}
                <button class="btn-icon" onclick="shareGoal(${goal.id})" title="مشاركة">
                    <i class="fas fa-share-alt"></i>
                </button>
                <button class="btn-icon btn-danger" onclick="deleteGoal(${goal.id})" title="حذف">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// معالجة إنشاء هدف جديد
async function handleCreateGoal(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showToast('يرجى تسجيل الدخول أولاً', 'warning');
        window.location.href = 'login.html';
        return;
    }
    
    const formData = {
        type: document.getElementById('goalType').value,
        title: document.getElementById('goalTitle').value,
        target: parseInt(document.getElementById('goalTarget').value),
        description: document.getElementById('goalDescription')?.value || '',
        isPublic: document.getElementById('isPublic').checked,
        forPerson: document.getElementById('forPerson')?.value || '',
        deadline: document.getElementById('deadline')?.value || ''
    };
    
    try {
        // هنا سيتم إرسال البيانات إلى FastAPI
        showLoading();
        
        // محاكاة API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newGoal = {
            id: Date.now(),
            ...formData,
            user: currentUser,
            current: 0,
            progress: 0,
            createdAt: new Date().toISOString().split('T')[0],
            likes: 0,
            prayers: 0
        };
        
        appState.goals.push(newGoal);
        saveToLocalStorage();
        
        showToast('تم إنشاء الهدف بنجاح!', 'success');
        
        // إعادة تعيين النموذج
        e.target.reset();
        
        // التوجيه إلى صفحة الأهداف
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
    } catch (error) {
        console.error('Error creating goal:', error);
        showToast('حدث خطأ في إنشاء الهدف', 'error');
    } finally {
        hideLoading();
    }
}

// زيادة العداد
function incrementGoal(goalId) {
    const goal = appState.goals.find(g => g.id === goalId);
    if (!goal || goal.completed) return;
    
    if (goal.current < goal.target) {
        goal.current++;
        goal.progress = Math.round((goal.current / goal.target) * 100);
        
        if (goal.current === goal.target) {
            goal.completed = true;
            showToast('مبروك! لقد أتممت الهدف 🎉', 'success');
        }
        
        saveToLocalStorage();
        renderUserGoals();
        
        // هنا سيتم تحديث الهدف في FastAPI
        updateGoalInAPI(goalId, { current: goal.current });
    }
}

// إرسال دعاء لهدف
function sendPrayer(goalId) {
    if (!currentUser) {
        showToast('يرجى تسجيل الدخول أولاً', 'warning');
        return;
    }
    
    const goal = appState.communityGoals.find(g => g.id === goalId);
    if (goal) {
        goal.prayers++;
        renderCommunityGoals();
        showToast('جزاك الله خيراً، بارك الله فيك', 'success');
    }
}

// تشجيع الهدف
function likeGoal(goalId) {
    if (!currentUser) {
        showToast('يرجى تسجيل الدخول أولاً', 'warning');
        return;
    }
    
    const goal = appState.communityGoals.find(g => g.id === goalId);
    if (goal) {
        goal.likes++;
        renderCommunityGoals();
        showToast('شكراً للتشجيع!', 'success');
    }
}

// تسجيل الدخول
async function login(email, password) {
    try {
        showLoading();
        
        // محاكاة API
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // بيانات مستخدم وهمية
        const user = {
            id: 1,
            name: 'أحمد محمد',
            email: email,
            avatar: 'أ',
            joinDate: '2024-01-01'
        };
        
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('token', 'fake-jwt-token');
        
        updateUIForAuth();
        showToast('مرحباً بعودتك!', 'success');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
        return true;
        
    } catch (error) {
        showToast('خطأ في البريد الإلكتروني أو كلمة المرور', 'error');
        return false;
    } finally {
        hideLoading();
    }
}

// تسجيل الخروج
function logout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        currentUser = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        
        updateUIForAuth();
        showToast('تم تسجيل الخروج بنجاح', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// أدوات مساعدة
function getGoalIcon(type) {
    const icons = {
        tasbeeh: 'fas fa-pray',
        istighfar: 'fas fa-hands-praying',
        dua: 'fas fa-heart'
    };
    return icons[type] || 'fas fa-bullseye';
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function showToast(message, type = 'info') {
    // إنشاء عنصر التوست إذا لم يكن موجوداً
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
        `;
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                         type === 'error' ? 'exclamation-circle' : 
                         type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // إزالة التوست بعد 3 ثواني
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function showLoading() {
    let loading = document.getElementById('loadingOverlay');
    if (!loading) {
        loading = document.createElement('div');
        loading.id = 'loadingOverlay';
        loading.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
        `;
        loading.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        document.body.appendChild(loading);
    }
    loading.style.display = 'flex';
}

function hideLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) {
        loading.style.display = 'none';
    }
}

function saveToLocalStorage() {
    localStorage.setItem('appGoals', JSON.stringify(appState.goals));
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initApp);