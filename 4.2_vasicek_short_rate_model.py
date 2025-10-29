import numpy as np
import matplotlib.pyplot as plt

# Set random seed for reproducibility
np.random.seed(42)

# Vasicek model parameters
kappa = 0.5    # Speed of mean reversion
theta = 0.03   # Long-term mean level
sigma = 0.01   # Volatility
r0 = 0.05      # Initial short rate

# Simulation parameters
T = 2.0        # Time horizon (2 years)
n_steps = 1000 # Number of time steps
dt = T / n_steps
t = np.linspace(0, T, n_steps + 1)

# Generate one realization of Brownian motion
dW = np.random.normal(0, np.sqrt(dt), n_steps)
W = np.concatenate([[0], np.cumsum(dW)])  # Brownian motion path

# Method 1: Analytical closed-form solution
# r(t) = r(0)*exp(-kappa*t) + theta*(1 - exp(-kappa*t)) + sigma*integral(exp(-kappa*(t-s)) dW(s))
r_analytical = np.zeros(n_steps + 1)
r_analytical[0] = r0

for i in range(1, n_steps + 1):
    # Deterministic part
    r_det = r0 * np.exp(-kappa * t[i]) + theta * (1 - np.exp(-kappa * t[i]))
    
    # Stochastic integral: sigma * integral_0^t exp(-kappa*(t-s)) dW(s)
    # We approximate this integral using the discrete sum
    stochastic_integral = 0
    for j in range(i):
        stochastic_integral += sigma * np.exp(-kappa * (t[i] - t[j])) * dW[j]
    
    r_analytical[i] = r_det + stochastic_integral

# Method 2: Euler-Maruyama discretization of the SDE
# dr(t) = kappa*(theta - r(t))*dt + sigma*dW(t)
r_euler = np.zeros(n_steps + 1)
r_euler[0] = r0

for i in range(n_steps):
    dr = kappa * (theta - r_euler[i]) * dt + sigma * dW[i]
    r_euler[i + 1] = r_euler[i] + dr

# Plotting the results
plt.figure(figsize=(12, 8))

plt.plot(t, r_analytical, 'b-', label='Analytical Solution', linewidth=2)
plt.plot(t, r_euler, 'r--', label='Euler-Maruyama', linewidth=2, alpha=0.8)
plt.axhline(y=theta, color='k', linestyle=':', alpha=0.7, label=f'Long-term mean θ = {theta}')
plt.xlabel('Time (years)')
plt.ylabel('Short Rate r(t)')
plt.title('Vasicek Model: Analytical vs Numerical Solution')
plt.legend()
plt.grid(True, alpha=0.3)
plt.savefig(__file__.replace('.py', '.png'))
plt.show()
