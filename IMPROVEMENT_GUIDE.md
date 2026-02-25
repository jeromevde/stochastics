# Question Improvement Guide

## Progress Summary
- **Completed:** 27/110 questions (24.5%)
- **Remaining:** 83 questions

### Completed Files
- Chapter 1: ALL (1-1 through 1-5) ✓
- Chapter 2: 2-1 through 2-22 ✓

### Remaining Files
- Chapter 2: 2-23, 2-24, 2-26 through 2-35 (11 files)
- Chapter 3: 3-1 through 3-18 (18 files)
- Chapter 4: 4-1 through 4-20 (20 files)
- Chapter 5: 5-1 through 5-10 (10 files)
- Chapter 6: 6-1 through 6-8 (8 files)
- Chapter 7: 7-1 through 7-14 (14 files)
- 7-13 is missing from directory

## Systematic Improvement Template

For each question file, follow these steps:

### 1. Improve Mathematical Rigor
- **Define all notation clearly**
  - Use display math blocks ($$...$$) for complex formulas
  - Define symbols explicitly (e.g., "where Π is a partition")
  - Show intermediate steps in derivations

### 2. Add Practical Use Case Section
After the `<strong>Answer:</strong>` section, add:

```html
      <strong>Practical Use Case:</strong>
      [2-4 sentences explaining real-world application in:
       - Derivatives pricing
       - Risk management
       - Trading strategies
       - Portfolio management
      Be specific with examples]
```

## Example Transformations

### Before:
```html
<strong>Reasoning:</strong>
The formula is X = Y because of property Z.
<strong>Answer:</strong>
The answer is X.
</div>
```

### After:
```html
<strong>Reasoning:</strong>
The formula follows from property Z:
$$X = Y \cdot Z$$
where $Z$ is the scaling factor.
<strong>Answer:</strong>
The answer is X.
<strong>Practical Use Case:</strong>
This formula is used in Black-Scholes option pricing where traders need to compute delta hedges. For example, market makers use $\Delta = \frac{\partial V}{\partial S}$ to determine how many shares to hold when hedging a sold call option, ensuring their portfolio remains market-neutral as the stock price moves.
</div>
```

## Topic-Specific Guidance

### Brownian Motion (Ch 2)
- Emphasize path properties, quadratic variation
- Connect to stock price modeling
- Practical uses: Monte Carlo simulation, volatility estimation

### Stochastic Calculus (Ch 2-3)
- Highlight Itô vs Stratonovich calculus
- Show Black-Scholes derivation connections
- Practical uses: Delta hedging, PDE pricing

### SDEs (Ch 4)
- Explain model calibration
- Connect to volatility surfaces
- Practical uses: Interest rate models, FX modeling

### Stopping Times (Ch 2-5)
- Link to American option exercise
- Discuss optimal exercise boundaries
- Practical uses: Early exercise premium valuation

### Change of Measure (Ch 6)
- Explain risk-neutral pricing
- Show Girsanov theorem applications
- Practical uses: Foreign exchange options, quanto derivatives

### PDEs (Ch 7)
- Connect to Black-Scholes PDE
- Explain Greeks as PDE solutions
- Practical uses: Finite difference methods, grid pricing

## Quality Checklist
For each improved question, verify:
- [ ] All complex formulas use display math ($$...$$)
- [ ] All notation is defined before use
- [ ] Step-by-step derivations shown for non-trivial results
- [ ] Practical use case is specific and relevant
- [ ] Practical use case mentions concrete financial application
- [ ] Length: 2-4 sentences for practical use case
- [ ] No emojis added

## Files Needing Attention
Run `python3 process_questions.py` to see current status of all files.

## Batch Processing Script Usage
```python
# To add a practical use case to a file:
from process_questions import add_practical_use_case

filepath = '/home/runner/work/stochastics/stochastics/questions/2-23.html'
use_case = "Your practical use case text here..."
add_practical_use_case(filepath, use_case)
```
