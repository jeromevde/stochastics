# Course Consistency Audit (chronological)

Applied rule: each chapter now follows sequential question numbering (`X.1, X.2, ...`).

## First appearance of core concepts

- 1.1: Counterparty Credit Risk Scenarios
- 1.2: Fundamental Pricing Theorem
- 1.3: Need for Stochastic Processes
- 1.4: Risk-Neutral Drift Condition
- 1.5: Value at Risk Definition
- 2.1: σ-Algebra Axioms
- 2.2: Smallest σ-Algebra
- 2.3: Borel Sigma-Algebra
- 2.4: Probability Measure Properties
- 2.5: Random Variable Measurability
- 2.8: Conditional Expectation Property
- 2.9: Tower Property
- 2.10: Almost-Sure Convergence
- 2.11: Adapted Process Definition
- 2.12: Filtration Monotonicity
- 2.13: Martingale Filtration Condition
- 2.14: Stopping Time Criterion
- 2.15: Quadratic Variation
- 2.16: Brownian Motion Properties
- 2.18: Itô Integral Convention
- 2.19: Integral of B dB
- 2.20: Midpoint vs Itô Integral
- 2.21: Itô Isometry
- 2.22: Law of Itô Integral
- 2.23: Itô Lemma
- 2.27: Martingale Condition
- 2.28: Càdlàg Paths
- 2.29: Infinite-Variation Example
- 2.30: Carathéodory Extension
- 2.35: Lebesgue Integral of Indicator
- 3.3: Equivalent Measures
- 3.6: Digital Option Pricing
- 3.7: Incomplete-Market Pricing
- 3.8: Feynman–Kac PDE
- 3.9: Fokker–Planck Equation
- 3.10: Doléans–Dade Exponential
- 3.14: Numeraire Change
- 3.15: FX Measure Change Drift
- 3.16: Arbitrage-Free Model Definition
- 3.18: Stochastic Exponential Evaluation
- 4.1: GBM SDE Form
- 4.2: GBM Dynamics
- 4.4: Black-Scholes
- 4.7: Vasicek Model
- 4.13: CIR Model
- 4.15: Explosive Bank-Account Moment
- 5.1: Forward Rate Formula
- 5.2: Caplet Pricing
- 5.3: Forward Measure Martingale
- 5.4: LMM Under Own Measure
- 5.5: LMM Drift Under Common Measure
- 5.6: Swap Rate
- 5.7: Payer Swaption Payoff
- 5.8: Swap Annuity Numeraire
- 5.9: Swap Floating Leg
- 6.1: Heston Model
- 6.2: Volatility Smile
- 6.3: Heston Correlation Parameter
- 6.4: Heston Parameter Count
- 6.5: Volatility Clustering in Heston
- 6.6: Expected Average Variance
- 6.7: Call/Put IV Symmetry
- 6.8: Heston Calibration Limits
- 7.1: Poisson Process
- 7.3: Compound vs Pure Poisson
- 7.4: Lévy Process
- 7.7: Gamma Process
- 7.8: Variance Gamma Process
- 7.9: Infinite Divisibility
- 7.10: VG Skew Parameter Effect
- 7.12: Poisson Characteristic Function
- 7.13: Subordination Time Change
- 7.14: Characteristic-Function Pricing

## Notes
- No chapter now uses lexicographic ordering artifacts (e.g. 2.10 before 2.2).
- Overview/study modes follow `registry.js` order directly.
- Random quiz remains randomized by design.
## Gap-filling additions in this PR
- 3.19: EMM Before Pricing (bridge from fundamental theorem to risk-neutral expectation)
- 4.21: GBM vs Mean-Reverting Rates (bridge across model families)
- 5.11: Swap Rate as Weighted Forwards (bridge before swaption/LMM intuition)

