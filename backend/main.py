from services.trip_services import calculate_daily_budget, get_trip_category, get_transportation, get_travel_season

recommended_places = [
    "Tokyo Tower",
    "Shibuya",
    "Mount Fuji",
]

def get_destinations():
    destinations = []
    destination = ""
    print("Insert multiple destinations (quit with 'n')")
    destination = input()

    while destination != "n":
        destinations.append(destination)
        destination = input()
    
    return destinations

def print_trip_summary(destinations, days, budget, currency, travel_month):
    category        = get_trip_category(budget)
    daily_budget    = calculate_daily_budget(budget, days)
    transportation  = get_transportation(category)
    travel_season   = get_travel_season(travel_month)

    print(
        """
========================
KelanaAI
========================
        """
    )
    print("Destinations                =", end=" ")
    for i, destination in enumerate(destinations):
        print(f"{i+1}. {destination}", end=" ")
    print()
    print(f"Days                        = {days}")
    print(f"Budget                      = {budget:.0f} {currency}")
    print(f"Travel Month                = {travel_month}")
    print(f"Season                      = {travel_season}")
    print(f"Category                    = {category}")
    print(f"Daily Budget                = {daily_budget:.0f} {currency}/Day")

    print(f"Recommended Transportation  = {transportation}")

    print("\nRecommended Places")
    for place in recommended_places:
        print(f"- {place}")


if __name__ == "__main__":
    destinations = get_destinations()
    days = int(input("Insert days: "))
    budget = float(input("Insert budget: "))
    currency = input("Insert currency: ")
    travel_month = input("Insert travel month: ")

    print_trip_summary(destinations, days, budget, currency, travel_month)