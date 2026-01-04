import numpy as np
import matplotlib.pyplot as plt
import copy
import math

def dataset():  
    data = []
    for i in range(100):
        sq_feet = np.random.uniform(1000, 5000)  # Square feet between 1000 and 5000
        price = 150 * sq_feet + 20000 + np.random.normal(0, 10000)  # Price with linear relationship and noise
        data.append((sq_feet, price))
    #Z-Score Normalization
    sq_feet_list = [point[0] for point in data]
    price_list = [point[1] for point in data]
    sq_feet_mean = np.mean(sq_feet_list)
    sq_feet_std = np.std(sq_feet_list)
    price_mean = np.mean(price_list)
    price_std = np.std(price_list)
    normalized_data = [((sq_feet - sq_feet_mean)/sq_feet_std, (price - price_mean)/price_std) for sq_feet, price in data]
    return data, normalized_data, sq_feet_mean, sq_feet_std, price_mean, price_std

def plot_data(data):
    x_vals = [point[0] for point in data]
    y_vals = [point[1] for point in data]
    plt.scatter(x_vals, y_vals)
    plt.xlabel('Square Feet')
    plt.ylabel('House Price')
    plt.title('House Prices vs Square Feet')
    plt.show()

def compute_cost_reg(data, x, y, reg_lambda):
    m = len(data)
    total_cost = 0
    for i in range(m):
        xi, yi = data[i]
        prediction = x * xi + y
        total_cost += (prediction - yi) ** 2
    reg_term = reg_lambda * (x ** 2 + y ** 2)
    total_cost = (total_cost + reg_term) / (2 * m)
    return total_cost

def adaptive_learning_rate(initial_lr, iteration, decay_rate=0.001):
    return initial_lr / (1 + decay_rate * iteration)

def convergence_check(epsilon, old_x, old_y, new_x, new_y):
    if abs(new_x - old_x) < epsilon and abs(new_y - old_y) < epsilon:
        return True
    return False

def gradient_descent_reg_with_steps(data, initial_x, initial_y, reg_lambda, initial_lr):
    x = initial_x
    y = initial_y
    cost_history = []
    converged = False
    i = 0
    max_iterations = 100000  # Increased max iterations
    prev_cost = float('inf')
    while not converged and i < max_iterations:
        lr = adaptive_learning_rate(initial_lr, i)
        cost = compute_cost_reg(data, x, y, reg_lambda)
        cost_history.append(cost)
        if abs(cost - prev_cost) < 1e-6:
            converged = True
        prev_cost = cost
        m = len(data)
        x_grad = 0
        y_grad = 0
        for j in range(m):
            xi, yi = data[j]
            prediction = x * xi + y
            error = prediction - yi
            x_grad += error * xi
            y_grad += error
        x_grad = (x_grad + reg_lambda * x) / m
        y_grad = (y_grad + reg_lambda * y) / m
        x_new = x - lr * x_grad
        y_new = y - lr * y_grad
        print(f'Iteration {i}: Cost={cost}, Weights: slope={x_new}, intercept={y_new}')
        x, y = x_new, y_new
        i += 1
    return x, y, cost_history

def plot_cost_history(cost_history):
    plt.plot(cost_history)
    plt.xlabel('Iteration')
    plt.ylabel('Cost')
    plt.title('Cost History over Iterations')
    plt.show()

if __name__ == "__main__":
    original_data, data, sq_feet_mean, sq_feet_std, price_mean, price_std = dataset()
    plot_data(original_data)
    initial_x = 0.0
    initial_y = 0.0
    reg_lambda = 0.1
    initial_lr = 0.01
    num_iterations = 100
    final_x, final_y, cost_history = gradient_descent_reg_with_steps(
        data, initial_x, initial_y, reg_lambda, initial_lr)
    slope_actual = final_x * price_std / sq_feet_std
    intercept_actual = final_y * price_std + price_mean - slope_actual * sq_feet_mean
    print(f'Final Weights: slope={slope_actual}, intercept={intercept_actual}')
    print("constructed equation: price = {:.4f} * sq_feet + {:.4f}".format(slope_actual, intercept_actual))
    print("Final Cost: {:.2f}".format(cost_history[-1]))
    plot_cost_history(cost_history)