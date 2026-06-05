import numpy
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D


class Node:
    """
    A single neural network neuron with gradient descent + momentum.

    forward(X) / backward(grad) are the building blocks for chaining nodes
    into a network layer by layer. fit(X, y) trains the node standalone.

    Usage (standalone):
        node = Node(n_inputs=1, activation="linear")
        losses, path = node.fit(x, y)

    Usage (in a network):
        out1 = node1.forward(X)
        out2 = node2.forward(out1.reshape(-1, 1))
        grad = 2 * (out2 - y) / len(y)
        g1 = node2.backward(grad)
        node1.backward(g1[:, 0])
    """

    ACTIVATIONS = ("linear", "relu", "sigmoid", "tanh")

    def __init__(self, n_inputs, activation="linear", rate=0.01, lambda_=0.0, momentum=0.9):
        if activation not in self.ACTIVATIONS:
            raise ValueError(f"activation must be one of {self.ACTIVATIONS}")
        self.weights = numpy.random.randn(n_inputs) * 0.01
        self.bias = 0.0
        self.rate = rate
        self.lambda_ = lambda_
        self.momentum = momentum
        self.activation_name = activation
        self.v_w = numpy.zeros(n_inputs)
        self.v_b = 0.0
        self._last_X = None
        self._last_z = None

    # ── Activation ────────────────────────────────────────────────────────

    def _activate(self, z):
        if self.activation_name == "linear":
            return z
        elif self.activation_name == "relu":
            return numpy.maximum(0.0, z)
        elif self.activation_name == "sigmoid":
            return 1.0 / (1.0 + numpy.exp(-numpy.clip(z, -500, 500)))
        elif self.activation_name == "tanh":
            return numpy.tanh(z)

    def _activate_grad(self, z):
        if self.activation_name == "linear":
            return numpy.ones_like(z)
        elif self.activation_name == "relu":
            return (z > 0).astype(float)
        elif self.activation_name == "sigmoid":
            s = 1.0 / (1.0 + numpy.exp(-numpy.clip(z, -500, 500)))
            return s * (1.0 - s)
        elif self.activation_name == "tanh":
            return 1.0 - numpy.tanh(z) ** 2

    # ── Core forward / backward ───────────────────────────────────────────

    def forward(self, X):
        """X: (n_samples, n_inputs). Returns output of shape (n_samples,)."""
        X = numpy.asarray(X, dtype=float)
        if X.ndim == 1:
            X = X.reshape(-1, 1)
        self._last_X = X
        self._last_z = X @ self.weights + self.bias
        return self._activate(self._last_z)

    def backward(self, grad_output):
        """
        Backprop through this node.
        grad_output: dL/d(output), shape (n_samples,).
        Updates weights and bias, then returns grad_input (n_samples, n_inputs)
        so the previous layer can continue backprop.
        """
        n = self._last_X.shape[0]
        dz = grad_output * self._activate_grad(self._last_z)

        # L2 regularization folded into the weight gradient
        dw = (self._last_X.T @ dz) / n + (self.lambda_ / n) * self.weights
        db = numpy.mean(dz)

        # Compute grad_input with pre-update weights so backprop is correct
        grad_input = dz[:, None] * self.weights[None, :]  # (n_samples, n_inputs)

        self.v_w = self.momentum * self.v_w + (1 - self.momentum) * dw
        self.v_b = self.momentum * self.v_b + (1 - self.momentum) * db

        self.weights -= self.rate * self.v_w
        self.bias -= self.rate * self.v_b

        return grad_input

    # ── Standalone training ───────────────────────────────────────────────

    @staticmethod
    def mse_loss(y_pred, y_true):
        return float(numpy.mean((y_true - y_pred) ** 2))

    def fit(self, X, y, cycles=5000, tol=1e-8):
        """
        Train this node as a standalone regression unit.
        Returns (losses, path).  path tracks (w0, bias) per step for 1-input nodes
        so the 3-D loss surface can draw the descent trajectory.
        """
        X = numpy.asarray(X, dtype=float)
        if X.ndim == 1:
            X = X.reshape(-1, 1)
        y = numpy.asarray(y, dtype=float)
        n = X.shape[0]
        single_input = X.shape[1] == 1

        losses = []
        path = [(float(self.weights[0]), float(self.bias))] if single_input else []

        for i in range(cycles):
            y_pred = self.forward(X)
            grad_output = (2.0 / n) * (y_pred - y)
            self.backward(grad_output)

            loss = self.mse_loss(y_pred, y)
            losses.append(loss)
            if single_input:
                path.append((float(self.weights[0]), float(self.bias)))

            if i > 0 and abs(losses[-2] - losses[-1]) < tol:
                print(f"Converged at iteration {i + 1} (loss delta < {tol})")
                break

        return losses, path

    def predict(self, X):
        return self.forward(X)

    # ── Convenience ───────────────────────────────────────────────────────

    @property
    def slope(self):
        """The single weight value — only valid for 1-input nodes."""
        if len(self.weights) != 1:
            raise AttributeError("slope is only available for 1-input nodes")
        return float(self.weights[0])

    def __repr__(self):
        return (f"Node(n_inputs={len(self.weights)}, activation={self.activation_name!r}, "
                f"rate={self.rate}, lambda_={self.lambda_}, momentum={self.momentum})")


# ── Visualization utilities ──────────────────────────────────────────────────

def gradient_plot(x, y, node):
    m, b = node.slope, node.bias
    plt.figure()
    plt.scatter(x, y, label="Data", zorder=3)
    plt.plot(x, m * x + b, color="red", label=f"y = {m:.4f}x + {b:.4f}")
    plt.xlabel("x")
    plt.ylabel("y")
    plt.title("Linear Regression Fit")
    plt.legend()
    plt.tight_layout()
    plt.show()


def plot_loss_curve(losses):
    plt.figure()
    plt.plot(losses)
    plt.xlabel("Iteration")
    plt.ylabel("MSE Loss")
    plt.title("Loss over Iterations")
    plt.tight_layout()
    plt.show()


def threed_representation(x, y, node, path):
    m, b = node.slope, node.bias
    span = max(5, abs(m) * 2 + 1)
    m_range = numpy.linspace(m - span, m + span, 80)
    b_range = numpy.linspace(b - span, b + span, 80)
    M, B = numpy.meshgrid(m_range, b_range)

    Z = numpy.mean(
        (y[:, None, None] - (M[None, :, :] * x[:, None, None] + B[None, :, :])) ** 2,
        axis=0,
    )

    fig = plt.figure(figsize=(10, 7))
    ax = fig.add_subplot(111, projection="3d")
    ax.plot_surface(M, B, Z, alpha=0.55, cmap="viridis")

    step = max(1, len(path) // 120)
    subset = path[::step]
    pm = [p[0] for p in subset]
    pb = [p[1] for p in subset]
    pz = [numpy.mean((y - (mi * x + bi)) ** 2) for mi, bi in subset]
    ax.plot(pm, pb, pz, "r.-", linewidth=1.2, markersize=3, label="Descent path")
    ax.scatter([m], [b], [numpy.mean((y - (m * x + b)) ** 2)],
               color="orange", s=60, zorder=5, label="Final solution")

    ax.set_xlabel("m (slope)")
    ax.set_ylabel("b (intercept)")
    ax.set_zlabel("MSE Loss")
    ax.set_title("Loss Surface with Gradient Descent Path")
    ax.legend()
    plt.tight_layout()
    plt.show()


# ── Network helpers ──────────────────────────────────────────────────────────

def net_forward(layers, X):
    """Pass X through each layer in order. Returns (n_samples, n_nodes_in_last_layer)."""
    out = numpy.asarray(X, dtype=float)
    if out.ndim == 1:
        out = out.reshape(-1, 1)
    for nodes in layers:
        out = numpy.column_stack([node.forward(out) for node in nodes])
    return out


def net_backward(layers, grad_output):
    """Backprop grad_output through layers in reverse, updating every node's weights."""
    for nodes in reversed(layers):
        n_samples, n_inputs = nodes[0]._last_X.shape
        grad_input = numpy.zeros((n_samples, n_inputs))
        for j, node in enumerate(nodes):
            grad_input += node.backward(grad_output[:, j])
        grad_output = grad_input


def net_train(layers, x, y, cycles=5000, tol=1e-8):
    """Train the network. Averages the last layer's outputs as the final prediction."""
    x = numpy.asarray(x, dtype=float)
    y = numpy.asarray(y, dtype=float)
    n = len(x)
    losses = []

    for i in range(cycles):
        out = net_forward(layers, x)       # (n, n_out)
        y_pred = out.mean(axis=1)          # average output nodes → (n,)

        loss = float(numpy.mean((y_pred - y) ** 2))
        losses.append(loss)

        n_out = out.shape[1]
        base_grad = (2.0 / n) * (y_pred - y)
        grad_out = numpy.tile(base_grad[:, None] / n_out, (1, n_out))

        net_backward(layers, grad_out)

        if i > 0 and abs(losses[-2] - losses[-1]) < tol:
            print(f"  Converged at iteration {i + 1}")
            break
        if (i + 1) % 1000 == 0:
            print(f"  iter {i+1:5d}  loss = {loss:.6f}")

    return losses


# ── Network definition ────────────────────────────────────────────────────────
# layer1: 1 input  (raw x) → 3 hidden nodes
# layer2: 3 inputs (layer1 outputs) → 3 hidden nodes
# layer3: 3 inputs (layer2 outputs) → 3 output nodes  (averaged for prediction)

l1node1 = Node(n_inputs=1, activation="relu", rate=0.01, lambda_=0.01, momentum=0.9)
l1node2 = Node(n_inputs=1, activation="relu", rate=0.01, lambda_=0.01, momentum=0.9)
l1node3 = Node(n_inputs=1, activation="relu", rate=0.01, lambda_=0.01, momentum=0.9)
layer1 = [l1node1, l1node2, l1node3]

l2node1 = Node(n_inputs=3, activation="relu", rate=0.01, lambda_=0.01, momentum=0.9)
l2node2 = Node(n_inputs=3, activation="relu", rate=0.01, lambda_=0.01, momentum=0.9)
l2node3 = Node(n_inputs=3, activation="relu", rate=0.01, lambda_=0.01, momentum=0.9)
layer2 = [l2node1, l2node2, l2node3]

l3node1 = Node(n_inputs=3, activation="linear", rate=0.01, lambda_=0.01, momentum=0.9)
l3node2 = Node(n_inputs=3, activation="linear", rate=0.01, lambda_=0.01, momentum=0.9)
l3node3 = Node(n_inputs=3, activation="linear", rate=0.01, lambda_=0.01, momentum=0.9)
layer3 = [l3node1, l3node2, l3node3]

network = [layer1, layer2, layer3]


# ── Entry point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    x_input_array = input("Enter x values (comma separated): ")
    y_input_array = input("Enter y values (comma separated): ")
    x = numpy.array([float(i) for i in x_input_array.split(",")])
    y = numpy.array([float(i) for i in y_input_array.split(",")])

    node = Node(n_inputs=1, activation="linear", rate=0.01, lambda_=0.01, momentum=0.9)
    losses, path = node.fit(x, y, cycles=5000)

    print(f"m: {node.slope:.6f}, b: {node.bias:.6f}")
    print(f"Final MSE: {losses[-1]:.6f} (after {len(losses)} iterations)")

    gradient_plot(x, y, node)
    plot_loss_curve(losses)
    threed_representation(x, y, node, path)

    print("\n--- Neural network (3 layers × 3 nodes) ---")
    losses_net = net_train(network, x, y, cycles=5000)
    print(f"Network final MSE: {losses_net[-1]:.6f} (after {len(losses_net)} iterations)")

    y_pred_net = net_forward(network, x).mean(axis=1)
    idx = numpy.argsort(x)
    plt.figure()
    plt.scatter(x, y, label="Data", zorder=3)
    plt.plot(x[idx], y_pred_net[idx], color="red", linewidth=2, label="Network prediction")
    plt.xlabel("x")
    plt.ylabel("y")
    plt.title("Neural Network Fit")
    plt.legend()
    plt.tight_layout()
    plt.show()
    plot_loss_curve(losses_net)


