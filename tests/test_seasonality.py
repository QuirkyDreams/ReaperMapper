from model.seasonality import monthly_weights, allocate_annual_total, monthly_mape


def test_weights_sum_to_one():
    w=monthly_weights([1]*12,[2]*12)
    assert abs(sum(w)-1.0)<1e-12


def test_allocation_preserves_total():
    w=[1/12]*12
    p=allocate_annual_total(3_090_964,w)
    assert sum(p)==3_090_964
    assert max(p)-min(p)<=1


def test_mape_perfect_is_zero():
    assert monthly_mape([10,20],[10,20])==0
