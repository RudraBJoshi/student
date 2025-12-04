"""
Beginner Linear Regression using Gradient Descent
"""

import numpy as np
import matplotlib.pyplot as plt

# Function to perform gradient descent with adaptive learning rate
def gradient_descent(X_b, y, learning_rate, n_iterations, decay_rate, min_lr):
    m = len(X_b)
    theta = np.random.randn(2, 1)
    
    for iteration in range(n_iterations):
        gradients = 2/m * X_b.T.dot(X_b.dot(theta) - y)
        theta -= learning_rate * gradients
        learning_rate = max(learning_rate * decay_rate, min_lr)
        
        if np.linalg.norm(gradients) < 1e-6:
            return theta, iteration + 1
    
    return theta, n_iterations

def synthetic_data():
    np.random.seed(0)
    # Create Python list first
    X_list = [[2 * np.random.rand()] for _ in range(100)]
    y_list = [[4 + 3 * x[0] + np.random.randn()] for x in X_list]
    
    # Convert to NumPy for mathematical operations
    X = np.array(X_list)
    y = np.array(y_list)
    
    return X, y

# Generate synthetic data
X, y = synthetic_data()
# Add bias term (intercept) 
X_b = np.c_[np.ones((100, 1)), X] 
# Hyperparameters
learning_rate = float(input("Enter learning rate (e.g., 0.01): ")) 
n_iterations = int(input("Enter number of iterations (e.g., 1000): "))
#Adaptive learning rate parameters
decay_rate = 0.99
min_learning_rate = 0.001
# Gradient Descent
theta, track = gradient_descent(X_b, y, learning_rate, n_iterations, decay_rate, min_learning_rate)
# Output the final weights
print("Final weights (theta):")
print("w=", theta[1][0], ", b=", theta[0][0])
print("bias (intercept):", theta[0][0])
print("weight (slope):", theta[1][0])
Linear_equation = f"y = {theta[0][0]:.2f} + {theta[1][0]:.2f}x"
print("Learned linear equation:")
print(Linear_equation)
print("Converged on iteration:", track)

# Plotting the results
plt.scatter(X, y, color='blue', label='Data points')
X_new = np.array([[0], [2]])
X_new_b = np.c_[np.ones((2, 1)), X_new]
y_predict = X_new_b.dot(theta)
plt.plot(X_new, y_predict, color='red', label='Regression line')
plt.xlabel('X')
plt.ylabel('y')
plt.title('Linear Regression using Gradient Descent')
plt.legend()
plt.show()
