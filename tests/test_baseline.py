from model.baseline import absolute_percentage_error, carry_forward, population_scaled


def test_carry_forward():
    assert carry_forward(100) == 100.0


def test_population_scaled():
    assert population_scaled(100, 1000, 1100) == 110.0


def test_absolute_percentage_error():
    assert absolute_percentage_error(90, 100) == 0.1
