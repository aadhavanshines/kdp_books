import java.util.Random;

public class Bounds {
    // First index i with a[i] >= x (Python's bisect_left).
    static int lowerBound(int[] a, int x) {
        int lo = 0, hi = a.length;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2; // avoids int overflow
            if (a[mid] < x) {
                lo = mid + 1;
            } else {
                hi = mid;
            }
        }
        return lo;
    }

    // First index i with a[i] > x (Python's bisect_right).
    static int upperBound(int[] a, int x) {
        int lo = 0, hi = a.length;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] <= x) {
                lo = mid + 1;
            } else {
                hi = mid;
            }
        }
        return lo;
    }

    public static void main(String[] args) {
        int[] a = {1, 3, 3, 3, 5, 8};
        for (int x = 0; x <= 9; x++) {
            System.out.println(x + " " + lowerBound(a, x) + " "
                + upperBound(a, x));
        }
        Random rng = new Random(7); // compare with a linear scan
        for (int t = 0; t < 10000; t++) {
            int[] b = rng.ints(rng.nextInt(12), 0, 6).sorted().toArray();
            int x = rng.nextInt(8) - 1;
            int lo = 0, hi = 0;
            for (int v : b) {
                lo += v < x ? 1 : 0;
                hi += v <= x ? 1 : 0;
            }
            if (lowerBound(b, x) != lo || upperBound(b, x) != hi) {
                throw new AssertionError("mismatch");
            }
        }
    }
}
