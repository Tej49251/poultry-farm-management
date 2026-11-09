# Poultry Farm Business Calculations Specification

This document details the mathematical formulas, industry standards, and business logic implemented across the Poultry Farm Management System (PFMS).

---

## 1. Flock Health & Livability

### 1.1 Mortality Percentage
$$\text{Mortality Rate (\%)} = \left(\frac{\text{Cumulative Mortality}}{\text{Total Placed Day-Old-Chicks (DOC)}}\right) \times 100$$
- **Benchmark**: $< 4.0\%$ is superior; $4.0\% - 5.0\%$ is normal commercial tolerance; $> 5.0\%$ triggers warnings and contract penalty.

### 1.2 Livability Percentage
$$\text{Livability (\%)} = 100 - \text{Mortality Rate (\%)} = \left(\frac{\text{Estimated Live Birds}}{\text{Initial Chicks}}\right) \times 100$$

### 1.3 Estimated Live Birds
$$\text{Estimated Live Birds} = \text{Initial Placed Chicks} - \text{Cumulative Mortality}$$

---

## 2. Feed & Nutrition

### 2.1 Daily Feed Conversion from Bags to kg
$$\text{Daily Feed (kg)} = \text{Feed Bags Consumed} \times 50.0\text{ kg}$$

### 2.2 Daily Feed Intake per Bird
$$\text{Daily Intake per Bird (g)} = \frac{\text{Daily Feed (kg)} \times 1000}{\text{Estimated Live Birds}}$$
- **Commercial Norm**: Increases gradually from $\sim 15\text{g/bird}$ on Day 1 to $\sim 150-170\text{g/bird}$ by Day 35–40.

### 2.3 Cumulative Feed Intake per Chick Placed
$$\text{Cumulative Feed per Chick (kg)} = \frac{\text{Total Cumulative Feed Consumed (kg)}}{\text{Total Placed DOC}}$$

---

## 3. Growth Performance & Efficiency

### 3.1 Feed Conversion Ratio (FCR)
$$\text{FCR} = \frac{\text{Total Cumulative Feed Consumed (kg)}}{\text{Total Live Biomass Weight (kg)}}$$
Where:
$$\text{Total Live Biomass (kg)} = \text{Estimated Live Birds} \times \text{Average Sample Weight (kg)}$$
- **Lower is Better**.
- Benchmark: $1.50 - 1.60$ for modern commercial broilers (Cobb 500 / Ross 308).

### 3.2 European Production Efficiency Factor (EPEF / EEF)
$$\text{EPEF} = \frac{\text{Livability (\%)} \times \text{Average Live Weight (kg)}}{\text{Flock Age (Days)} \times \text{FCR}} \times 100$$
- **Benchmark Evaluation**:
  - $> 350$: Exceptional flock management (top-tier incentive).
  - $300 - 350$: Good commercial performance.
  - $< 280$: Sub-optimal, investigate feed quality, ventilation, or disease pressure.

---

## 4. Bird Lifting & Harvesting Balance

### 4.1 Net Lifting Weight
$$\text{Net Weight (kg)} = \text{Gross Truck \& Cages Weight (kg)} - \text{Tare Truck \& Cages Weight (kg)}$$

### 4.2 Average Lifted Bird Weight
$$\text{Average Bird Weight (kg)} = \frac{\text{Net Weight (kg)}}{\text{Birds Lifted Count}}$$

### 4.3 Remaining Birds in Shed
$$\text{Remaining Birds} = \text{Initial Placed Chicks} - \text{Cumulative Mortality} - \text{Total Birds Lifted}$$

---

## 5. Growing Charges & Grower Settlement

For integrated contract poultry farming (e.g., Suguna, Venkys, Godrej, IB Group):

### 5.1 Base Growing Charges (GC)
$$\text{Base GC} = \text{Total Net Lifted Weight (kg)} \times \text{Contract Base Rate per kg}$$
*(Typically ₹11.50 – ₹13.50 / kg)*

### 5.2 FCR Efficiency Incentive
$$\text{FCR Incentive} = (\text{Contract Benchmark FCR} - \text{Actual FCR}) \times \text{Incentive Rate per Point} \times \text{Net Lifted Weight (kg)}$$
*(Awarded only if Actual FCR < Benchmark FCR)*

### 5.3 Mortality Penalty Deduction
If $\text{Mortality Rate} > \text{Contract Standard Allowance (e.g., 5.0\%)}$:
$$\text{Mortality Penalty} = (\text{Actual Mortality \%} - 5.0\%) \times \text{Penalty Rate} \times \text{Net Lifted Weight}$$

### 5.4 Net Payable to Farmer
$$\text{Net Payout} = \text{Base GC} + \text{FCR Incentive} + \text{Other Incentives} - \text{Deductions (Medicines, Disinfection, Excess Mortality)}$$
