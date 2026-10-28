"""Two pointers: two indexes that move through a sequence, usually from
both ends toward the middle or one chasing the other, so a pass that
would look at every pair looks at each item only once or twice."""


def pair_sum_sorted(nums, target):
    """Positions of two numbers in a sorted list adding up to target."""
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        total = nums[lo] + nums[hi]
        if total == target:
            return lo, hi
        if total < target:
            lo += 1  # need a bigger sum: only lo can give one
        else:
            hi -= 1  # need a smaller sum: only hi can give one
    return None


def dedupe_sorted(nums):
    """Remove duplicates from a sorted list in place; return the new
    length. `write` trails `read`, keeping each new value once."""
    write = 0
    for read in range(len(nums)):
        if read == 0 or nums[read] != nums[read - 1]:
            nums[write] = nums[read]
            write += 1
    del nums[write:]
    return write


def is_palindrome(text):
    """Ignoring case and anything that isn't a letter or digit."""
    lo, hi = 0, len(text) - 1
    while lo < hi:
        if not text[lo].isalnum():
            lo += 1
        elif not text[hi].isalnum():
            hi -= 1
        elif text[lo].lower() != text[hi].lower():
            return False
        else:
            lo, hi = lo + 1, hi - 1
    return True


def most_water(heights):
    """The most water held between two vertical lines. Moving the
    taller line inward can never help, so move the shorter one."""
    lo, hi, best = 0, len(heights) - 1, 0
    while lo < hi:
        width = hi - lo
        best = max(best, width * min(heights[lo], heights[hi]))
        if heights[lo] < heights[hi]:
            lo += 1
        else:
            hi -= 1
    return best


def three_sum(nums):
    """Every distinct triple adding up to 0: sort, fix the first item,
    then pair_sum on the rest. O(n^2) instead of O(n^3)."""
    nums, out = sorted(nums), []
    for i in range(len(nums) - 2):
        if i and nums[i] == nums[i - 1]:
            continue  # same first number: same triples again
        lo, hi = i + 1, len(nums) - 1
        while lo < hi:
            total = nums[i] + nums[lo] + nums[hi]
            if total < 0:
                lo += 1
            elif total > 0:
                hi -= 1
            else:
                out.append((nums[i], nums[lo], nums[hi]))
                lo += 1
                while lo < hi and nums[lo] == nums[lo - 1]:
                    lo += 1
    return out


def move_zeros(nums):
    """Move every 0 to the end in place, keeping the order of the rest."""
    write = 0
    for read in range(len(nums)):
        if nums[read] != 0:
            nums[write], nums[read] = nums[read], nums[write]
            write += 1
