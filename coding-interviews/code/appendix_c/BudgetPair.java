import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.PriorityQueue;

public class BudgetPair {
    static int[] budgetPair(int[] prices, int budget) {
        Map<Integer, Integer> seen = new HashMap<>(); // price -> index
        for (int i = 0; i < prices.length; i++) {
            Integer j = seen.get(budget - prices[i]);
            if (j != null) {
                return new int[] {j, i};
            }
            seen.put(prices[i], i);
        }
        return new int[0];
    }

    static int kthLargest(int[] scores, int k) {
        PriorityQueue<Integer> heap = new PriorityQueue<>(); // min-heap
        for (int s : scores) {
            heap.add(s);
            if (heap.size() > k) {
                heap.poll(); // drop the smallest
            }
        }
        return heap.peek();
    }

    public static void main(String[] args) {
        int[] prices = {12, 7, 30, 18};
        System.out.println(Arrays.toString(budgetPair(prices, 25)));
        System.out.println(Arrays.toString(budgetPair(prices, 100)));
        int[] scores = {71, 88, 64, 93, 88, 50};
        System.out.println(kthLargest(scores, 3));
    }
}
