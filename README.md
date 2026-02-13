# Stochastic Processes in Finance

Course materials, exercises, and notes from the Stochastic Processes in Finance course.

## Course Content

| Chapter | Topic | Status |
|---------|-------|--------|
| 1 | Motivation | - |
| 2 | Stochastic Calculus | ✅ Q1, Q3 |
| 3 | Derivative Valuation | - |
| 4 | Basic Models | GBM, Vasicek |
| 5 | Interest Rate Models | - |
| 6 | Heston's Model | - |
| 7 | Lévy Processes | - |

## Structure

```
questions/
├── ch2_stochastic_calculus/    # Measure theory, σ-algebras, measurability
├── ch3_derivative_valuation/  # Fundamental theorems, PDEs
├── ch4_basic_models/          # GBM, Vasicek, Hull-White, CIR
├── ch5_interest_rates/        # Caplets, LIBOR, Swap models
├── ch6_heston/                # Stochastic volatility
└── ch7_levy/                 # Poisson, Gamma, VG processes
```

## Visualizations

- Questions with figures have matching `.py` scripts in their folder
- Run: `python tools/generate_image.py <function_name>`

## References

- Mikosch: *Elementary Stochastic Calculus*
- Baudoin: Stochastic Calculus Lectures
- Brigo & Mercurio: *Interest Rate Models*
- Baxter & Rennie: *Derivative Pricing*

---

**Source:** Based on `StochasticProcesses.tex` lecture notes
