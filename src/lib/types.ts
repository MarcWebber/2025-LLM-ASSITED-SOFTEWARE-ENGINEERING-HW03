export interface TripPlan {
    id: string;
    title: string;
    days: DayPlan[];
    budget: Budget;
    // ... 其他元数据
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