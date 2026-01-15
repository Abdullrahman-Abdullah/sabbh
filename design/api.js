// إعدادات API
const API_BASE_URL = 'http://localhost:8000/api'; // تأكد من تغيير الرابط

// رؤوس HTTP الافتراضية
const getHeaders = (includeAuth = true) => {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
    
    if (includeAuth) {
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }
    
    return headers;
};

// معالجة الردود
const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'حدث خطأ في الخادم');
    }
    return response.json();
};

// وظائف API للمصادقة
const AuthAPI = {
    async login(email, password) {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: getHeaders(false),
            body: JSON.stringify({ email, password })
        });
        return handleResponse(response);
    },
    
    async register(userData) {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: getHeaders(false),
            body: JSON.stringify(userData)
        });
        return handleResponse(response);
    },
    
    async logout() {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: getHeaders()
        });
        return handleResponse(response);
    },
    
    async getProfile() {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    }
};

// وظائف API للأهداف
const GoalsAPI = {
    async getAllGoals(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}/goals?${query}`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },
    
    async getGoal(id) {
        const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },
    
    async createGoal(goalData) {
        const response = await fetch(`${API_BASE_URL}/goals`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(goalData)
        });
        return handleResponse(response);
    },
    
    async updateGoal(id, goalData) {
        const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(goalData)
        });
        return handleResponse(response);
    },
    
    async deleteGoal(id) {
        const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(response);
    },
    
    async incrementGoal(id) {
        const response = await fetch(`${API_BASE_URL}/goals/${id}/increment`, {
            method: 'POST',
            headers: getHeaders()
        });
        return handleResponse(response);
    },
    
    async likeGoal(id) {
        const response = await fetch(`${API_BASE_URL}/goals/${id}/like`, {
            method: 'POST',
            headers: getHeaders()
        });
        return handleResponse(response);
    },
    
    async sendPrayer(id) {
        const response = await fetch(`${API_BASE_URL}/goals/${id}/pray`, {
            method: 'POST',
            headers: getHeaders()
        });
        return handleResponse(response);
    }
};

// وظائف API للإحصائيات
const StatsAPI = {
    async getStats() {
        const response = await fetch(`${API_BASE_URL}/stats`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },
    
    async getUserStats(userId) {
        const response = await fetch(`${API_BASE_URL}/stats/user/${userId}`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    }
};

// وظائف API للمجتمع
const CommunityAPI = {
    async getCommunityGoals(page = 1, limit = 20) {
        const response = await fetch(`${API_BASE_URL}/community/goals?page=${page}&limit=${limit}`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },
    
    async getGoalComments(goalId) {
        const response = await fetch(`${API_BASE_URL}/community/goals/${goalId}/comments`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },
    
    async addComment(goalId, comment) {
        const response = await fetch(`${API_BASE_URL}/community/goals/${goalId}/comments`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ comment })
        });
        return handleResponse(response);
    }
};

// وظائف API للملف الشخصي
const ProfileAPI = {
    async updateProfile(userData) {
        const response = await fetch(`${API_BASE_URL}/profile`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(userData)
        });
        return handleResponse(response);
    },
    
    async changePassword(passwordData) {
        const response = await fetch(`${API_BASE_URL}/profile/password`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(passwordData)
        });
        return handleResponse(response);
    },
    
    async getAchievements() {
        const response = await fetch(`${API_BASE_URL}/profile/achievements`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    }
};

// تصدير جميع واجهات API
window.API = {
    Auth: AuthAPI,
    Goals: GoalsAPI,
    Stats: StatsAPI,
    Community: CommunityAPI,
    Profile: ProfileAPI
};

// معالج الأخطاء العام
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // إذا كان خطأ شبكة
    if (event.reason.message.includes('Failed to fetch')) {
        showToast('تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت', 'error');
    } else {
        showToast(event.reason.message || 'حدث خطأ غير متوقع', 'error');
    }
});