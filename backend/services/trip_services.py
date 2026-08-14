def calculate_daily_budget(budget, days):
    return budget/days

def get_trip_category(budget):
    if budget < 1000:
        return "Backpacker"
    if budget <= 3000:
        return "Standard"
    return "Luxury"

def get_transportation(category):
    if category == "Backpacker":
        return "Bus"
    if category == "Standard":
        return "Train"
    if category == "Luxury":
        return "Flight"
    return None

def get_travel_season(month):
    if month == "December":
        return "Peak Season"
    if month == "June":
        return "Holiday Season"
    return "Regular Season"