"""Exercise 27.2: for each position, the product of all the other
numbers, without division: prefix products times suffix products."""


def product_except_self(nums):
    out = [1] * len(nums)
    left = 1
    for i in range(len(nums)):
        out[i] = left  # product of everything before i
        left *= nums[i]
    right = 1
    for i in range(len(nums) - 1, -1, -1):
        out[i] *= right  # times product of everything after i
        right *= nums[i]
    return out


print(product_except_self([1, 2, 3, 4]))
print(product_except_self([2, 0, 5]))
