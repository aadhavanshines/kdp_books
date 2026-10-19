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
rm -rf "$out"
echo "Java and C++ translations: OK"
