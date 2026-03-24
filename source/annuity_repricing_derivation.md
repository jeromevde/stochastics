# Market-Conform Repricing of an Annuity Mortgage

## Context

When an annuity mortgage reprices (e.g. every 3 years), we need to find the new interest rate $r$
that the borrower will pay for the next repricing period. Rather than using a flat yield assumption,
we want a **market-consistent** rate: the rate that fairly prices the remaining cash flows against
the observed discount factor curve.

---

## Setup

- $N_0$ — outstanding principal at the start of the repricing period
- $r$ — annuity rate per period (what we want to find)
- $n$ — total number of payment periods remaining **from inception** (fixed for the life of the contract)
- $m$ — number of payment periods in **this repricing window** (from period $k$ to period $l = k+m$)
- $DF_0, DF_1, \ldots, DF_m$ — market discount factors for each payment date in this window
- $A$ — constant annuity payment (interest + principal repayment)

---

## Step 1: Standard annuity payment

Each period, the borrower pays a fixed total $A$, split into:
- Interest: $r \cdot N_i$
- Principal repayment: $A - r \cdot N_i$

The balance recursion is:

$$N_{i+1} = N_i - (A - r \cdot N_i) = N_i(1+r) - A$$

Unrolling from $N_0$:

$$N_i = N_0(1+r)^i - A \cdot \frac{(1+r)^i - 1}{r}$$

At maturity ($i = n$), the balance must be zero. Solving for $A$:

$$\boxed{A = N_0 \cdot \frac{r(1+r)^n}{(1+r)^n - 1}}$$

The remaining balance at the end of the repricing window ($i = m$) is:

$$N_m = N_0 \cdot \frac{(1+r)^n - (1+r)^m}{(1+r)^n - 1}$$

---

## Step 2: No-arbitrage pricing condition

The mortgage must be **fairly priced**: the present value of all payments within the window equals
the present value of the principal consumed:

$$\sum_{i=1}^{m} A \cdot DF_i = N_0 \cdot DF_0 - N_m \cdot DF_m$$

**Left side:** PV of the $m$ annuity payments, discounted at market rates.

**Right side:** You start with principal $N_0$ (worth $N_0 \cdot DF_0$ today) and hand back the
residual principal $N_m$ at the end of the window (worth $N_m \cdot DF_m$ today). The difference
is exactly what the payments must cover.

---

## Step 3: Combine into one equation

Substitute $A$ and $N_m$ (both functions of $r$) and cancel $N_0$:

$$\frac{r(1+r)^n}{(1+r)^n - 1} \cdot \underbrace{\sum_{i=1}^{m} DF_i}_{\text{DFsum}} = DF_0 - \frac{(1+r)^n - (1+r)^m}{(1+r)^n - 1} \cdot DF_m$$

Rearrange to $f(r) = 0$:

$$\boxed{f(r) = \frac{r}{1-(1+r)^{-n}} \cdot \text{DFsum} \;-\; DF_0 \;+\; DF_m \cdot \frac{(1+r)^n - (1+r)^m}{(1+r)^n - 1} = 0}$$

This is solved numerically (Newton's method) because $r$ appears both as a linear coefficient
and inside a power — no closed-form inversion exists.

---

## Why not a flat-curve formula?

On a flat curve, $DF_i = (1+r)^{-i}$, and the DFs cancel out, reducing to the textbook formula.
With a real term structure (2Y rate ≠ 5Y rate ≠ 10Y rate), $DF_i$ and $r$ are independent:
the curve discounts the cash flows, but $r$ defines what those cash flows are.

---

## Connection to the code

In `option/price_capflann.py`, the function `_ann_obj` implements $f(r)$ above, and
`solve_annuity_fwd_rate` calls `scipy.optimize.newton` to find its root. The solved $r$
is the **forward annuity rate** used both for:

1. **Nominal evolution** — how the outstanding balance decays period by period
2. **Bachelier pricing** — the forward rate entering the cap/floor option formula
