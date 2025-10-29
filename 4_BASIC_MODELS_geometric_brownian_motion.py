import numpy as np
import matplotlib.pyplot as plt

np.random.seed(42)

# Parameters to highlight the difference
n_sims = 1
T = 1.0
n_steps = 100
S0 = 100
mu = 0.05
sigma = 0.4  # Higher volatility makes the difference more apparent
dt = T / n_steps

# 1. Simulate the underlying Brownian motion increments for all paths
dW = np.random.normal(0, np.sqrt(dt), (n_sims, n_steps))

# Initialize arrays for the log-price paths
X_incorrect = np.zeros((n_sims, n_steps))
X_correct = np.zeros((n_sims, n_steps))

# 2. Simulate log-price paths step-by-step
for i in range(1, n_steps):
    # Incorrect method: No Ito correction term
    X_incorrect[:, i] = X_incorrect[:, i-1] + mu * dt + sigma * dW[:, i-1]
    
    # Correct method: With Ito correction term
    X_correct[:, i] = X_correct[:, i-1] + (mu - 0.5 * sigma**2) * dt + sigma * dW[:, i-1]

# 3. Exponentiate to get the price paths
S_incorrect = S0 * np.exp(X_incorrect)
S_correct = S0 * np.exp(X_correct)

# 4. Plot the average paths to show the growing difference
plt.figure(figsize=(12, 7))
t = np.linspace(0, T, n_steps)

# Plot the average of the incorrect simulation
plt.plot(t, np.mean(S_incorrect, axis=0), label="Incorrect Mean (No Ito Correction)")

# Plot the average of the correct simulation
plt.plot(t, np.mean(S_correct, axis=0), label="Correct Mean (With Ito Correction)")

# Plot the theoretical expected value for comparison
plt.plot(t, S0 * np.exp(mu * t), 'k--', label=f"Theoretical Mean: $S_0 e^{{\mu t}}$")

plt.title("Impact of Ito's Correction Term on GBM Simulation")
plt.xlabel("Time (t)")
plt.ylabel("Average Stock Price")
plt.legend()
plt.grid(True)
plt.savefig(__file__.replace(".py", "") + ".png")
plt.show()

plt.show()

