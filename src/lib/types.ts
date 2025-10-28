export interface TripPlan {
    id: string;
    title: string;
    days: DayPlan[];
    budget: Budget;
    // ... 其他元数据
    // destination:
    destinations: string[];
}

export interface DayPlan {
    day: number;
    theme: string;
    activities: Activity[];
}

export interface Activity {
    time: string;
    type: 'Attraction' | 'Restaurant' | 'Transportation' | 'Hotel';
    name: string;
    description: string;
    location: {
        lat: number;
        lng: number;
    };
}

export interface Budget {
    total: number;
    breakdown: {
        category: 'Transportation' | 'Accommodation' | 'Food' | 'Activities' | 'Other';
        amount: number;
    }[];
}

export interface Expense {
    id: string;
    tripId: string;
    amount: number;
    category: 'Food' | 'Accommodation' | 'Transportation' | 'Shopping' | 'Entertainment';
    date: string;
    notes: string;
}

// 描述从数据库中获取的、已保存的行程
export interface SavedTrip {
    id: string; // 数据库生成的 UUID
    user_id: string; // 用户的 UUID
    created_at: string; // 数据库生成的时间戳
    title: string; // AI 生成的标题
    plan_data: TripPlan; // 完整的 AI 生成的 JSON 数据
}