#!/bin/sh
# Compile and run the Appendix C translations; compare with expected.txt.
set -e
dir="$(cd "$(dirname "$0")/../code/appendix_c" && pwd)"
out="$(mktemp -d)"
javac -d "$out" "$dir/BudgetPair.java" 2>/dev/null
java -cp "$out" BudgetPair 2>/dev/null > "$out/java.txt"
g++ -std=c++17 -Wall -Werror -o "$out/cpp" "$dir/budget_pair.cpp"
"$out/cpp" > "$out/cpp.txt"
diff "$dir/expected.txt" "$out/java.txt"
diff "$dir/expected.txt" "$out/cpp.txt"
# lowerBound/upperBound must agree with Python's bisect_left/bisect_right.
javac -d "$out" "$dir/Bounds.java" 2>/dev/null
java -cp "$out" Bounds 2>/dev/null > "$out/bounds.txt"
python3 -c 'from bisect import bisect_left as l, bisect_right as r
a = [1, 3, 3, 3, 5, 8]
[print(x, l(a, x), r(a, x)) for x in range(10)]' > "$out/bounds_py.txt"
diff "$out/bounds_py.txt" "$out/bounds.txt"
rm -rf "$out"
echo "Java and C++ translations: OK"
