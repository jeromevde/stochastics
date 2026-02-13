# Q2: σ-algebra that is not Borel

## Question
Give an example of a σ-algebra that is **not** the Borel σ-algebra.

---

## Answer

### Example: The Co-countable σ-algebra on ℝ

Define 𝒜 as the collection of subsets A ⊆ ℝ such that either A is countable or its complement Aᶜ is countable (or both).

**Verification that 𝒜 is a σ-algebra:**

1. **Contains ∅ and ℝ**: ∅ is countable ✓, ℝᶜ = ∅ is countable ✓
2. **Closed under complements**: If A is countable, Aᶜ is co-countable (uncountable complement is countable); if Aᶜ is countable, then (Aᶜ)ᶜ = A is countable ✓
3. **Closed under countable unions**: Let A₁, A₂, ... ∈ 𝒜. If each Aᵢ is countable, then ∪Aᵢ is countable (countable union of countable sets). If some Aᵢ has countable complement, then (∪Aᵢ)ᶜ = ∩Aᵢᶜ is countable (countable intersection of co-countable sets) ✓

**Why 𝒜 is not Borel:**

- Borel σ-algebra 𝔅(ℝ) contains all open intervals (a, b)
- The co-countable σ-algebra 𝒜 does **not** contain any open interval with positive length
- Reason: Any open interval (a, b) with a < b is uncountable, and its complement ℝ\(a,b) is also uncountable → not in 𝒜

Thus 𝒜 ≠ 𝔅(ℝ), so it's a σ-algebra that is not Borel.

---

## Key Definition

**Co-countable σ-algebra:** A set A ⊆ ℝ is in 𝒜 if A is countable OR ℝ \ A is countable.
