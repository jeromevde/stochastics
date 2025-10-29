## From Definition to SDE of Brownian Motion

A generalized Brownian motion $X_t$ is defined by its increments $X_t - X_s \sim \mathcal{N}(\mu(t-s), \sigma^2(t-s))$. Over a small interval $\Delta t$, the change $\Delta X_t$ can be written in terms of a standard normal variable $Z \sim \mathcal{N}(0, 1)$:

$\Delta X_t = \mu \Delta t + \sigma \sqrt{\Delta t} Z$

Since the increment of a standard Brownian motion $W_t$ is $\Delta W_t = \sqrt{\Delta t} Z$, we can substitute this into the equation for $\Delta X_t$:

$\Delta X_t = \mu \Delta t + \sigma \Delta W_t$

Taking the limit as $\Delta t \to dt$, we arrive at the stochastic differential equation (SDE) for a generalized Brownian motion:

$\boldsymbol{dX_t = \mu dt + \sigma dW_t}$

## Deriving the SDE for Geometric Brownian Motion

A process $S_t$ is a geometric Brownian motion if its logarithm, $X_t = \ln(S_t)$, follows a generalized Brownian motion. The SDE for $X_t$ is:

$dX_t = \mu dt + \sigma dW_t$

To find the SDE for $S_t = e^{X_t}$, we apply Itô's Lemma to $f(X_t) = e^{X_t}$. The key components for Itô's Lemma are:

-   **Derivatives:** $\frac{\partial f}{\partial X_t} = e^{X_t} = S_t$ and $\frac{\partial^2 f}{\partial X_t^2} = e^{X_t} = S_t$.
-   **Quadratic Variation:** $(dX_t)^2 = (\mu dt + \sigma dW_t)^2 = \sigma^2 dt$, as terms with $dt^2$ and $dt dW_t$ are zero.

Itô's Lemma states: $df(X_t) = \frac{\partial f}{\partial X_t}dX_t + \frac{1}{2}\frac{\partial^2 f}{\partial X_t^2}(dX_t)^2$.

Substituting our components gives the SDE for $S_t$:

$dS_t = S_t(\mu dt + \sigma dW_t) + \frac{1}{2}S_t(\sigma^2 dt)$

Combining terms, we get the standard form:

$\boldsymbol{dS_t = (\mu \textcolor{blue}{+ \frac{1}{2}\sigma^2})S_t dt + \sigma S_t dW_t}$


The extra term $ \frac{1}{2}\sigma^2$ is the **Itô correction term**. Directly discretizing the SDE for $S_t$ without accounting for this effect is known as the **Euler-Maruyama approximation**, which leads to a biased simulation.