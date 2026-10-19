#include <functional>
#include <iostream>
#include <queue>
#include <unordered_map>
#include <vector>

std::vector<int> budgetPair(const std::vector<int>& prices, int budget) {
    std::unordered_map<int, int> seen;  // price -> index
    for (int i = 0; i < (int)prices.size(); i++) {
        auto it = seen.find(budget - prices[i]);
        if (it != seen.end()) {
            return {it->second, i};
        }
        seen[prices[i]] = i;
    }
    return {};
}

int kthLargest(const std::vector<int>& scores, int k) {
    // std::priority_queue is a MAX-heap by default; std::greater makes
    // it a min-heap, like Python's heapq.
    std::priority_queue<int, std::vector<int>, std::greater<int>> heap;
    for (int s : scores) {
        heap.push(s);
        if ((int)heap.size() > k) {
            heap.pop();  // drop the smallest
        }
    }
    return heap.top();
}

void print(const std::vector<int>& v) {
    std::cout << "[";
    for (size_t i = 0; i < v.size(); i++) {
        std::cout << (i ? ", " : "") << v[i];
    }
    std::cout << "]\n";
}

int main() {
    std::vector<int> prices = {12, 7, 30, 18};
    print(budgetPair(prices, 25));
    print(budgetPair(prices, 100));
    std::cout << kthLargest({71, 88, 64, 93, 88, 50}, 3) << "\n";
}
