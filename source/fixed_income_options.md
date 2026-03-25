# Pricing Module

Option pricers and contract/market-data builders for KBC's embedded mortgage caps, floors, and swaptions.
All pricers use the **Bachelier (normal vol) model** — consistent with ICM's normal volatility surfaces.

---

## 1. Bachelier Formula (shared kernel)

All three pricers reduce to the same two building blocks.

Let $F$ be the forward rate, $K$ the strike, $\sigma$ the normal volatility and $T$ the option expiry in years.

$$d = \frac{F - K}{\sigma\sqrt{T}}$$

**Caplet** (receiver of floating, pays if $F > K$):
$$C = \bigl[(F-K)\,\Phi(d) + \sigma\sqrt{T}\,\phi(d)\bigr] \times \text{PV01}$$

**Floorlet** (receiver of fixed, pays if $F < K$):
$$P = \bigl[(K-F)\,\Phi(-d) + \sigma\sqrt{T}\,\phi(-d)\bigr] \times \text{PV01}$$

where $\Phi$ and $\phi$ are the standard normal CDF and PDF.

---

## 2. Swaption Pricer (`price_swaption.py`)

### Contracts
`BCFSWPTN` — European payer or receiver swaption.

### Forward Swap Rate

For each ESG scenario the shocked zero-coupon curve $\{DF_i\}$ is injected into the product.

$$S = \frac{\text{float-leg PV}}{\sum_i \delta_i \cdot DF_i \cdot |N|}$$

where the float-leg PV is computed from the product's standard `float_dummy / fix_dummy` properties.

### Option Price

$$\text{NPV} = \begin{cases}
\bigl[(S-K)\,\Phi(d) + \sigma\sqrt{T}\,\phi(d)\bigr] \times A & \text{payer (BUY)} \\
\bigl[(K-S)\,\Phi(-d) + \sigma\sqrt{T}\,\phi(-d)\bigr] \times A & \text{receiver (SELL)}
\end{cases}$$

with:
- $d = (S-K)/(\sigma\sqrt{T})$
- $A = \sum_i \delta_i \cdot DF_i \cdot |N|$ — annuity sum (PV01 × notional)
- $\sigma$ — normal vol from the volatility surface at $(K,\, 365 \cdot T)$
- $T$ — option maturity in years

Result multiplied by the FX conversion rate.

---

## 3. RGX Cap Pricer (`price_rgx.py`)

### Contracts
- `BCFRGM` — regular amortiser (linear / equal principal repayments)
- `BCFRGX` — step-up rate variant of RGM

Two pricing modes depending on `opt_sign`:

### Mode A — `opt_sign = +1`: per-IP-date caplets (MX_CAPFL, bank bought the cap)

Each interest-payment date $k$ is an independent option (Belgian mortgage regulation allows exercise at any IP date).

**Forward rate** over the repricing period containing IP date $k$ (amortisation- and prepayment-aware par-rate swap formula):

$$F_i = \frac{DF_{i,0}(N_0 - A_0 - P_0) - DF_{i,m}(N_m - A_m - P_m) - \sum_{j=1}^{m} DF_{i,j}(A_j + P_j)}{\sum_{j=1}^{m} DF_{i,j} \cdot \delta_j \cdot N_j}$$

where $N_j$, $A_j$, $P_j$ are notional, amortisation and prepayment at IP date $j$, and the summation runs over the IP dates of the repricing period.

**Caplet $k$** (tenor and DF at IP date $k$, notional and year-fraction at IP date $k+1$):

$$C_k = \bigl[(F_k - K)\,\Phi(d_k) + \sigma_k\sqrt{T_k}\,\phi(d_k)\bigr] \times DF_k \cdot N_{k+1} \cdot \delta_{k+1}$$

Total: $\text{NPV} = \text{FX} \times \sum_k C_k$

### Mode B — `opt_sign = -1`: per-RP-period cap+floor (TMK_CRE, bank sold)

Same forward rate formula. For each repricing period $i$:

$$\text{PV01}_i = \sum_{j \in \text{period}} DF_j \cdot N_j \cdot \delta_j$$

$$\text{Cap}_i  = -\bigl[(F_i - K_c)\,\Phi(d_i^c) + \sigma_i^c\sqrt{T_i}\,\phi(d_i^c)\bigr] \times \text{PV01}_i$$

$$\text{Floor}_i = +\bigl[(K_f - F_i)\,\Phi(-d_i^f) + \sigma_i^f\sqrt{T_i}\,\phi(-d_i^f)\bigr] \times \text{PV01}_i$$

Negative sign on the cap because the bank **sold** it (cap limits what the customer pays).

---

## 4. CAPFLANN/PAM Pricer (`price_capflann.py`)

### Contracts
- `BCFANN` — equal total-payment annuity (non-linear nominal decay)
- `BCFANX` — step-up rate variant of ANN
- `BCFPAM` — bullet / interest-only (constant nominal)
- `BCFPAX` — step-up rate variant of PAM

### Forward Rate

**ANN/ANX** — solved numerically (Newton) from the annuity equation:

$$\frac{a}{1 - (1+a)^{-(n-k)}} \cdot \sum DF - DF_0 + DF_{-1} \cdot \frac{(1+a)^{n-k} - (1+a)^l}{(1+a)^{n-k} - 1} = 0$$

where $a$ is the per-period rate (annuity rate × $\delta$), $n$ is the total IP count from inception, $k$ is the first IP index of the current repricing period, $l = \text{last IP index} - k$.

The scalar forward rate is $F = a / \delta$.

**PAM/PAX** — par-rate formula (no amortisation):

$$F_i = \frac{DF_{i,0} - DF_{i,-1}}{\sum_{j=1}^{m} DF_{i,j} \cdot \delta_j}$$

### Nominal Evolution

**ANN**: path-dependent — each period's nominal input to the next depends on the shocked forward rate from the previous period:

$$N_{i+1} = N_i \cdot \frac{(1+r_i\delta)^{n-k_i} - (1+r_i\delta)^{l_i}}{(1+r_i\delta)^{n-k_i} - 1}$$

Natural prepayment is applied after each interest payment:

$$N \leftarrow N - \text{annuity payment} + \text{interest} - N \cdot q \cdot \delta$$

where $q$ is the natural prepayment rate.

**PAM**: nominal decays by prepayment only:

$$N_{j+1} = N_j \cdot (1 - q \cdot \delta_j)$$

### Cap and Floor

The PV01 per repricing period $i$:

$$\text{PV01}_i = \sum_{j \in \text{period}} \delta_j \cdot DF_j \cdot N_j$$

**Cap strip** (each period, bank bought):

$$C_i = -\bigl[(F_i^* - K_c)\,\Phi(d_i^c) + \sigma_i^c\sqrt{T_i}\,\phi(d_i^c)\bigr] \times \text{PV01}_i$$

**Floor strip** (each period, bank bought):

$$P_i = +\bigl[(K_f - F_i^*)\,\Phi(-d_i^f) + \sigma_i^f\sqrt{T_i}\,\phi(-d_i^f)\bigr] \times \text{PV01}_i$$

where $F_i^* = \text{clip}(F_i + \text{spread},\; K_f,\; K_c)$ is the spread-adjusted and clipped forward rate, and:
- $K_c = \text{optionStrikeCall} - \text{spread}$, $K_f = \text{optionStrikePut} - \text{spread}$
- $T_i$ — time-to-first-IP-date of repricing period $i$ in years
- $\sigma_i^c, \sigma_i^f$ — normal vols from the surface at $(K_c,\, 365 T_i)$ and $(K_f,\, 365 T_i)$

Total: $\text{NPV} = \text{FX} \times \sum_i (C_i + P_i)$

---

## 5. Vol Surface

Vols are queried from the market XML via `pricing/market_data.py`.
The surface is a 2-D grid indexed by **strike (bps)** and **tenor (days)** — `vol_surface(strike, tenor_days)` interpolates bilinearly.

---

## 6. Files

| File | Purpose |
|------|---------|
| `price_swaption.py` | Swaption pricer + scenario adapter |
| `price_rgx.py` | RGX/RGM cap pricer (modes A and B) + scenario adapter |
| `price_capflann.py` | CAPFLANN/PAM cap+floor pricer + scenario adapter |
| `contract_builder.py` | Builds product objects from merged-contract DataFrames |
| `market_data.py` | Reads vol surfaces, ESG discount curves, FX rates from market XML |
