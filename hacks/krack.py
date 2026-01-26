import numpy as np
from itertools import product

# -------------------------
# Problem Data
# -------------------------
A = np.array([
    [137,  59,  86,  57, 145],
    [170, 196, 109,  11,   4],
    [135, 121,  87, 155,  60],
    [136,  48, 173, 158,  27],
    [ 38,  36, 137, 189,  20],
    [ 97, 131, 106,  10, 137],
    [ 80,  79,  44,  61,  77]
])
b = np.array([196, 174, 154, 104, 77, 125, 52])
q = 197
m, n = A.shape

# -------------------------
# Helper: Gaussian elimination mod q
# -------------------------
def mod_inv(x, q):
    return pow(int(x), q-2, q)

def solve_mod(A, b, q):
    A = A.copy().astype(int)
    b = b.copy().astype(int)
    A = np.mod(A, q)
    b = np.mod(b, q)

    # augmented matrix
    M = np.hstack([A, b.reshape(-1,1)])
    rows, cols = M.shape

    r = 0
    pivots = []
    for c in range(cols-1):
        # find pivot
        pivot = None
        for i in range(r, rows):
            if M[i,c] % q != 0:
                pivot = i
                break
        if pivot is None:
            continue
        # swap
        M[[r,pivot]] = M[[pivot,r]]

        inv = mod_inv(M[r,c], q)
        M[r] = (M[r] * inv) % q

        for i in range(rows):
            if i != r:
                factor = M[i,c]
                M[i] = (M[i] - factor*M[r]) % q
        pivots.append(c)
        r += 1
        if r == rows:
            break

    # check for inconsistency
    for i in range(rows):
        if np.all(M[i,:cols-1] == 0) and M[i,cols-1] != 0:
            return None  # no solution

    # if rank == n, we have unique solution
    sol = np.zeros(n, dtype=int)
    for i in range(len(pivots)):
        sol[pivots[i]] = M[i, cols-1]

    return sol

# -------------------------
# Brute force all possible errors in [-2,2]
# -------------------------
best = None
best_sum = 10**9

for e in product(range(-2, 3), repeat=m):
    e = np.array(e)
    target = (b + e) % q
    s = solve_mod(A, target, q)
    if s is not None:
        total_error = np.sum(np.abs(e))
        if total_error < best_sum:
            best_sum = total_error
            best = (s, e)

if best is None:
    print("✅ No solution exists with all errors in [-2,2].")
else:
    s_sol, e_sol = best
    print("Found valid solution!")
    print("s =", list(s_sol))
    print("e =", list(e_sol))
    print("sum|e| =", int(best_sum))
    print("Final answer format:", ",".join(map(str, s_sol)))
