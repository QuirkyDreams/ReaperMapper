from model.parse_cdc import parse_recent_record


def make_record():
    chars = [" "] * 200
    def put(start, end, value):
        chars[start - 1:end] = list(str(value).ljust(end - start + 1))
    put(65, 66, "10")
    put(69, 69, "M")
    put(85, 85, "1")
    put(102, 105, "2024")
    put(146, 149, "I219")
    return "".join(chars)


def test_parse_selected_fields():
    r = parse_recent_record(make_record())
    assert r.month == 10
    assert r.sex == "M"
    assert r.weekday == 1
    assert r.year == 2024
    assert r.underlying_cause == "I219"
