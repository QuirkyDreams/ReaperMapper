"""Simple baselines that more complex ReaperMapper models must beat."""


def carry_forward(previous_deaths: int) -> float:
    """Predict the next annual death total with no adjustment."""
    if previous_deaths < 0:
        raise ValueError("previous_deaths must be non-negative")
    return float(previous_deaths)


def population_scaled(previous_deaths: int, previous_population: int, target_population: int) -> float:
    """Scale the previous death total by population change only."""
    if previous_deaths < 0 or previous_population <= 0 or target_population <= 0:
        raise ValueError("counts must be valid and populations positive")
    return previous_deaths * (target_population / previous_population)


def absolute_percentage_error(predicted: float, actual: float) -> float:
    """Return absolute percentage error as a fraction (0.01 == 1%)."""
    if actual <= 0:
        raise ValueError("actual must be positive")
    return abs(predicted - actual) / actual
