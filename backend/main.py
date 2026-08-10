def print_trip_summary(destination, country, days, budget, currency, travel_month):
    print(
        """
========================
KelanaAI
========================
        """
    )
    print(f"Destination: {destination}")
    print(f"Country: {country}")
    print(f"Days: {days}")
    print(f"Budget: {budget} USD")
    print(f"Currency: {currency}")
    print(f"Travel Month: {travel_month}")


if __name__ == "__main__":
    destination = input("Insert destination: ")
    country = input("Insert country: ")
    days = int(input("Insert days: "))
    budget = float(input("Insert budget: "))
    currency = input("Insert currency: ")
    travel_month = input("Insert travel month: ")

    print_trip_summary(destination, country, days, budget, currency, travel_month)