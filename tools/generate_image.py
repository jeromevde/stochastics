#!/usr/bin/env python3
"""
Image generator for stochastics course visualizations.
Generates PNG plots for concepts that need visual explanation.
"""

import matplotlib.pyplot as plt
import numpy as np

def generate_geometric_brownian_motion():
    """Generate GBM path visualization."""
    np.random.seed(42)
    T, N = 1, 1000
    dt = T/N
    mu, sigma = 0.05, 0.2
    dW = np.random.normal(0, np.sqrt(dt), N)
    S = np.zeros(N+1)
    S[0] = 100
    for i in range(N):
        S[i+1] = S[i] * np.exp((mu - 0.5*sigma**2)*dt + sigma*dW[i])
    
    plt.figure(figsize=(10, 6))
    plt.plot(np.linspace(0, T, N+1), S, 'b-', lw=1.5)
    plt.axhline(y=100, color='r', linestyle='--', alpha=0.5, label='Initial')
    plt.title('Geometric Brownian Motion')
    plt.xlabel('Time')
    plt.ylabel('Price')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.savefig('4.1_geometric_brownian_motion.png', dpi=150, bbox_inches='tight')
    plt.close()

def generate_vasicek():
    """Generate Vasicek short rate model visualization."""
    np.random.seed(42)
    T, N = 10, 1000
    dt = T/N
    kappa, theta, sigma = 0.1, 0.05, 0.02
    r = np.zeros(N+1)
    r[0] = 0.03
    for i in range(N):
        r[i+1] = r[i] + kappa*(theta - r[i])*dt + sigma*np.random.normal(0, np.sqrt(dt))
    
    plt.figure(figsize=(10, 6))
    plt.plot(np.linspace(0, T, N+1), r, 'g-', lw=1.5)
    plt.axhline(y=theta, color='r', linestyle='--', alpha=0.5, label=f'Mean reversion level θ={theta}')
    plt.title('Vasicek Short Rate Model')
    plt.xlabel('Time')
    plt.ylabel('Short Rate r(t)')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.savefig('4.2_vasicek_short_rate_model.png', dpi=150, bbox_inches='tight')
    plt.close()

def generate_brownian_motion():
    """Generate Brownian motion paths."""
    np.random.seed(42)
    T, N = 1, 1000
    dt = T/N
    paths = 5
    plt.figure(figsize=(10, 6))
    for _ in range(paths):
        dW = np.random.normal(0, np.sqrt(dt), N)
        W = np.concatenate([[0], np.cumsum(dW)])
        plt.plot(np.linspace(0, T, N+1), W, lw=1)
    plt.axhline(y=0, color='k', linestyle='-', alpha=0.3)
    plt.title('Brownian Motion Paths')
    plt.xlabel('Time')
    plt.ylabel('W(t)')
    plt.grid(True, alpha=0.3)
    plt.savefig('brownian_motion.png', dpi=150, bbox_inches='tight')
    plt.close()

if __name__ == '__main__':
    import sys
    if len(sys.argv) < 2:
        print("Usage: python generate_image.py <function_name>")
        print("Available: generate_geometric_brownian_motion, generate_vasicek, generate_brownian_motion")
        sys.exit(1)
    
    func_name = sys.argv[1]
    if func_name == 'generate_geometric_brownian_motion':
        generate_geometric_brownian_motion()
    elif func_name == 'generate_vasicek':
        generate_vasicek()
    elif func_name == 'generate_brownian_motion':
        generate_brownian_motion()
    else:
        print(f"Unknown function: {func_name}")
        sys.exit(1)
    
    print(f"Generated: {func_name} -> PNG")
