"""
BinaryEngine - A versatile binary optimization framework.

Applies binary algorithms to cut processing time:
- Binary Search: O(n) -> O(log n) for search operations
- Divide & Conquer: Split problems, solve recursively, merge results
- Parallel Split: Run sub-tasks concurrently
- Binary Approximation: Fast approximate results via binary decisions
"""

from typing import TypeVar, Callable, List, Any, Optional, Tuple
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor, as_completed
from functools import wraps
import time
import bisect

T = TypeVar('T')
R = TypeVar('R')


class BinaryEngine:
    """Master binary optimization engine."""

    def __init__(self, max_workers: int = 4, use_processes: bool = False):
        """
        Initialize the BinaryEngine.

        Args:
            max_workers: Maximum parallel workers for split operations
            use_processes: Use processes instead of threads (for CPU-bound tasks)
        """
        self.max_workers = max_workers
        self.executor_class = ProcessPoolExecutor if use_processes else ThreadPoolExecutor

    # =========================================================================
    # BINARY SEARCH - O(n) -> O(log n)
    # =========================================================================

    def binary_search(
        self,
        items: List[T],
        target: T,
        key: Callable[[T], Any] = lambda x: x
    ) -> Optional[int]:
        """
        Binary search for target in sorted list.

        Args:
            items: Sorted list to search
            target: Value to find
            key: Function to extract comparison key

        Returns:
            Index of target, or None if not found
        """
        keys = [key(item) for item in items]
        target_key = target if callable(target) is False else key(target)

        left, right = 0, len(items) - 1
        while left <= right:
            mid = (left + right) // 2
            if keys[mid] == target_key:
                return mid
            elif keys[mid] < target_key:
                left = mid + 1
            else:
                right = mid - 1
        return None

    def binary_search_condition(
        self,
        low: int,
        high: int,
        condition: Callable[[int], bool]
    ) -> int:
        """
        Find the first value where condition becomes True.

        Uses binary search to find boundary in O(log n).
        Condition must be monotonic: False...False, True...True

        Args:
            low: Lower bound (inclusive)
            high: Upper bound (inclusive)
            condition: Monotonic predicate function

        Returns:
            First value where condition is True, or high+1 if never True
        """
        while low < high:
            mid = (low + high) // 2
            if condition(mid):
                high = mid
            else:
                low = mid + 1
        return low if condition(low) else low + 1

    def binary_search_closest(
        self,
        items: List[T],
        target: Any,
        key: Callable[[T], Any] = lambda x: x
    ) -> Tuple[Optional[int], Optional[int]]:
        """
        Find closest items to target (floor and ceiling).

        Returns:
            Tuple of (floor_index, ceiling_index) - either can be None
        """
        if not items:
            return None, None

        keys = [key(item) for item in items]
        pos = bisect.bisect_left(keys, target)

        floor_idx = pos - 1 if pos > 0 else None
        ceil_idx = pos if pos < len(items) else None

        return floor_idx, ceil_idx

    # =========================================================================
    # DIVIDE & CONQUER - Split, solve, merge
    # =========================================================================

    def divide_and_conquer(
        self,
        data: List[T],
        base_case: Callable[[List[T]], R],
        merge: Callable[[R, R], R],
        min_size: int = 1
    ) -> R:
        """
        Generic divide and conquer algorithm.

        Args:
            data: Input data to process
            base_case: Function to solve small problems directly
            merge: Function to combine two sub-results
            min_size: Minimum size before applying base_case

        Returns:
            Combined result after divide and conquer
        """
        if len(data) <= min_size:
            return base_case(data)

        mid = len(data) // 2
        left_result = self.divide_and_conquer(data[:mid], base_case, merge, min_size)
        right_result = self.divide_and_conquer(data[mid:], base_case, merge, min_size)

        return merge(left_result, right_result)

    def binary_reduce(
        self,
        items: List[T],
        reducer: Callable[[T, T], T]
    ) -> T:
        """
        Reduce list using binary tree structure (more efficient for associative ops).

        Instead of: ((((a + b) + c) + d) + e)
        Does:       ((a + b) + (c + d)) + e

        This is more parallelizable and can be more numerically stable.
        """
        if not items:
            raise ValueError("Cannot reduce empty list")
        if len(items) == 1:
            return items[0]

        while len(items) > 1:
            new_items = []
            for i in range(0, len(items), 2):
                if i + 1 < len(items):
                    new_items.append(reducer(items[i], items[i + 1]))
                else:
                    new_items.append(items[i])
            items = new_items

        return items[0]

    # =========================================================================
    # PARALLEL SPLIT - Concurrent execution
    # =========================================================================

    def parallel_map(
        self,
        func: Callable[[T], R],
        items: List[T]
    ) -> List[R]:
        """
        Apply function to items in parallel.

        Args:
            func: Function to apply to each item
            items: List of items to process

        Returns:
            List of results in same order as input
        """
        with self.executor_class(max_workers=self.max_workers) as executor:
            futures = {executor.submit(func, item): i for i, item in enumerate(items)}
            results = [None] * len(items)

            for future in as_completed(futures):
                idx = futures[future]
                results[idx] = future.result()

            return results

    def parallel_split(
        self,
        data: List[T],
        process_chunk: Callable[[List[T]], R],
        merge: Callable[[List[R]], R],
        num_chunks: int = None
    ) -> R:
        """
        Split data into chunks, process in parallel, merge results.

        Args:
            data: Input data to split
            process_chunk: Function to process each chunk
            merge: Function to merge all chunk results
            num_chunks: Number of chunks (defaults to max_workers)

        Returns:
            Merged result from all chunks
        """
        num_chunks = num_chunks or self.max_workers
        chunk_size = max(1, len(data) // num_chunks)

        chunks = [data[i:i + chunk_size] for i in range(0, len(data), chunk_size)]

        with self.executor_class(max_workers=self.max_workers) as executor:
            results = list(executor.map(process_chunk, chunks))

        return merge(results)

    def parallel_binary_search(
        self,
        items: List[T],
        targets: List[Any],
        key: Callable[[T], Any] = lambda x: x
    ) -> List[Optional[int]]:
        """
        Search for multiple targets in parallel.
        """
        def search_one(target):
            return self.binary_search(items, target, key)

        return self.parallel_map(search_one, targets)

    # =========================================================================
    # BINARY APPROXIMATION - Speed over precision
    # =========================================================================

    def binary_approximate(
        self,
        low: float,
        high: float,
        evaluate: Callable[[float], float],
        target: float,
        tolerance: float = 1e-6,
        max_iterations: int = 100
    ) -> float:
        """
        Find value where evaluate(x) ≈ target using binary search.

        Useful for root finding, optimization, inverse functions.

        Args:
            low: Lower bound
            high: Upper bound
            evaluate: Function to evaluate
            target: Target value to achieve
            tolerance: Acceptable error margin
            max_iterations: Maximum iterations before stopping

        Returns:
            Approximate x where evaluate(x) ≈ target
        """
        for _ in range(max_iterations):
            mid = (low + high) / 2
            result = evaluate(mid)

            if abs(result - target) <= tolerance:
                return mid

            if result < target:
                low = mid
            else:
                high = mid

        return (low + high) / 2

    def binary_optimize(
        self,
        low: float,
        high: float,
        evaluate: Callable[[float], float],
        maximize: bool = True,
        tolerance: float = 1e-6,
        max_iterations: int = 100
    ) -> Tuple[float, float]:
        """
        Find optimal value using ternary search (binary-style optimization).

        For unimodal functions (single peak or valley).

        Args:
            low: Lower bound
            high: Upper bound
            evaluate: Unimodal function to optimize
            maximize: True to find maximum, False for minimum
            tolerance: Precision tolerance
            max_iterations: Maximum iterations

        Returns:
            Tuple of (optimal_x, optimal_value)
        """
        for _ in range(max_iterations):
            if high - low < tolerance:
                break

            mid1 = low + (high - low) / 3
            mid2 = high - (high - low) / 3

            val1 = evaluate(mid1)
            val2 = evaluate(mid2)

            if maximize:
                if val1 < val2:
                    low = mid1
                else:
                    high = mid2
            else:
                if val1 > val2:
                    low = mid1
                else:
                    high = mid2

        optimal_x = (low + high) / 2
        return optimal_x, evaluate(optimal_x)

    # =========================================================================
    # DECORATORS - Wrap existing functions
    # =========================================================================

    def memoized_binary_search(self):
        """
        Decorator to add binary search caching to a function.

        The function must accept a key as first argument.
        Results are cached and retrieved via binary search.
        """
        cache = {}
        sorted_cache_keys = []

        def decorator(func: Callable) -> Callable:
            @wraps(func)
            def wrapper(key, *args, **kwargs):
                # Check cache using binary search
                if key in cache:
                    return cache[key]

                # Compute and cache
                result = func(key, *args, **kwargs)
                cache[key] = result
                bisect.insort(sorted_cache_keys, key)
                return result

            wrapper.cache = cache
            wrapper.cache_keys = sorted_cache_keys
            return wrapper

        return decorator

    def parallelize(self, func: Callable[[T], R]) -> Callable[[List[T]], List[R]]:
        """
        Decorator to parallelize a function over a list of inputs.

        Usage:
            @engine.parallelize
            def slow_function(x):
                return x * 2

            results = slow_function([1, 2, 3, 4])  # Runs in parallel
        """
        @wraps(func)
        def wrapper(items: List[T]) -> List[R]:
            return self.parallel_map(func, items)
        return wrapper

    def timed(self, func: Callable) -> Callable:
        """Decorator to measure and print execution time."""
        @wraps(func)
        def wrapper(*args, **kwargs):
            start = time.perf_counter()
            result = func(*args, **kwargs)
            elapsed = time.perf_counter() - start
            print(f"{func.__name__}: {elapsed:.4f}s")
            return result
        return wrapper


# =============================================================================
# CONVENIENCE FUNCTIONS
# =============================================================================

# Default engine instance
_default_engine = BinaryEngine()

def binary_search(items: List[T], target: T, key=lambda x: x) -> Optional[int]:
    """Quick access to binary search."""
    return _default_engine.binary_search(items, target, key)

def divide_and_conquer(data, base_case, merge, min_size=1):
    """Quick access to divide and conquer."""
    return _default_engine.divide_and_conquer(data, base_case, merge, min_size)

def parallel_map(func, items):
    """Quick access to parallel map."""
    return _default_engine.parallel_map(func, items)

def parallel_split(data, process_chunk, merge, num_chunks=None):
    """Quick access to parallel split."""
    return _default_engine.parallel_split(data, process_chunk, merge, num_chunks)


# =============================================================================
# EXAMPLE USAGE
# =============================================================================

if __name__ == "__main__":
    engine = BinaryEngine(max_workers=4)

    # Example 1: Binary Search
    print("=== Binary Search ===")
    data = [1, 5, 10, 15, 20, 25, 30]
    idx = engine.binary_search(data, 15)
    print(f"Found 15 at index: {idx}")

    # Example 2: Binary Search with Condition
    print("\n=== Binary Search Condition ===")
    # Find first number >= 100 in range 1-1000
    result = engine.binary_search_condition(1, 1000, lambda x: x >= 100)
    print(f"First x where x >= 100: {result}")

    # Example 3: Divide and Conquer (sum)
    print("\n=== Divide and Conquer ===")
    numbers = list(range(1, 101))
    total = engine.divide_and_conquer(
        numbers,
        base_case=lambda x: sum(x),
        merge=lambda a, b: a + b,
        min_size=10
    )
    print(f"Sum of 1-100: {total}")

    # Example 4: Parallel Processing
    print("\n=== Parallel Split ===")
    import math

    def process_chunk(chunk):
        return sum(math.sqrt(x) for x in chunk)

    result = engine.parallel_split(
        list(range(1, 10001)),
        process_chunk=process_chunk,
        merge=lambda results: sum(results)
    )
    print(f"Sum of sqrt(1) to sqrt(10000): {result:.2f}")

    # Example 5: Binary Approximation (find sqrt(2))
    print("\n=== Binary Approximation ===")
    sqrt2 = engine.binary_approximate(
        low=1.0,
        high=2.0,
        evaluate=lambda x: x * x,
        target=2.0,
        tolerance=1e-10
    )
    print(f"sqrt(2) ≈ {sqrt2:.10f}")

    # Example 6: Binary Optimization
    print("\n=== Binary Optimization ===")
    # Find maximum of -x^2 + 4x (should be at x=2, value=4)
    x_opt, val_opt = engine.binary_optimize(
        low=0,
        high=4,
        evaluate=lambda x: -x**2 + 4*x,
        maximize=True
    )
    print(f"Maximum of -x² + 4x at x={x_opt:.4f}, value={val_opt:.4f}")

    print("\n=== All examples complete! ===")
