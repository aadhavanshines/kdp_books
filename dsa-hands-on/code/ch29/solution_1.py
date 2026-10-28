"""Exercise 29.1: ways to decode a string of digits where A=1 ... Z=26.
Like the stairs: the last letter used one digit or two."""


def decode_ways(digits):
    two_back, one_back = 1, 1  # ways for "" and for the first digit
    if not digits or digits[0] == "0":
        return 0
    for i in range(1, len(digits)):
        ways = one_back if digits[i] != "0" else 0
        if 10 <= int(digits[i - 1 : i + 1]) <= 26:
            ways += two_back
        two_back, one_back = one_back, ways
    return one_back


for d in ["12", "226", "06", "11106"]:
    print(d, decode_ways(d))
