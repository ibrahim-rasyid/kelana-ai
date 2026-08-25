export interface DailyItinerary {
  day: number;
  title: string;
  morning: {
    activities: string[];
    description: string;
  };
  afternoon: {
    activities: string[];
    description: string;
  };
  evening: {
    activities: string[];
    description: string;
  };
  estimated_cost: number;
}

export interface FoodRecommendation {
  name: string;
  description: string;
  where_to_try: string;
  estimated_cost: number;
}

export interface BudgetBreakdown {
  accommodation: number;
  food: number;
  transportation: number;
  activities: number;
  shopping: number;
  miscellaneous: number;
  total: number;
}

export interface TripRecommendation {
  destination: string;
  total_days: number;
  total_budget: number;
  travel_style: string;
  daily_itinerary: DailyItinerary[];
  travel_tips: string[];
  local_food_recommendations: FoodRecommendation[];
  budget_breakdown: BudgetBreakdown;
}

export interface TripResponse {
  trip_id: number;
  destination: string;
  recommendation: TripRecommendation;
}
