# Kiln Simulation Environment Guidelines

> Implementation specifications for cement clinker burning simulation environments.

---

## 1. Physical Process & Variable Mapping

A modern precalciner kiln system comprises a 5-stage cyclone preheater (C1–C5), a calciner furnace, a rotary kiln, and a clinker grate cooler.

### Controlled Variables (CV) & Action Definitions
The decision policy operates at the supervisory layer, outputting setpoint increments $\Delta Y^{sp}_t$:

| Channel | Variable Name | Typical Operating Range | Step Limit (`RATE`) |
|---|---|---|---|
| $Y_1$ | Calciner Outlet Temperature ($T_c$) | $860 - 900^\circ\text{C}$ | $\pm 2^\circ\text{C}$ |
| $Y_2$ | Kiln Inlet Smoke Chamber Temperature ($T_{\text{inlet}}$) | $1000 - 1150^\circ\text{C}$ | $\pm 5^\circ\text{C}$ |
| $Y_3$ | Secondary Air Temperature ($T_2$) | $1000 - 1200^\circ\text{C}$ | $\pm 5^\circ\text{C}$ |
| $Y_4$ | Tertiary Air Temperature ($T_3$) | $800 - 950^\circ\text{C}$ | $\pm 4^\circ\text{C}$ |
| $Y_5$ | Kiln Hood Pressure ($P$) | $-120 \text{ to } -40\text{ Pa}$ | $\pm 5\text{ Pa}$ |
| $Y_6$ | Grate Cooler Chamber 1 Pressure ($P_{\text{cooler}}$) | $4.5 - 6.5\text{ kPa}$ | $\pm 0.2\text{ kPa}$ |

*Note: In `SimpleKilnEnv`, channels are condensed to 3 CVs ($T_c$, $T_2$, $P$) for lightweight verification.*

---

## 2. Observation Space Contract

Observations approximate a POMDP state vector combining fast DCS signals and slow/delayed laboratory assay values:

```python
# Standard 13-dim observation structure in SimpleKilnEnv
# [Tc, T2, P, Tc_sp, T2_sp, P_sp, coal, elec, O2, KH, lab_fcao, lab_age, soft_fcao]
observation_space = spaces.Box(low=obs_low, high=obs_high, dtype=np.float32)
```

In the full 36-variable production system ($X_1 - X_{36}$):
- $X_{t-23:t}$: 120-minute history window sampled every 5 minutes.
- $Y_t^{sp}$: Current CV setpoints.
- $\hat{q}_t$: Soft-sensor estimate from $S_\theta$ (OAM-Net).
- $q_\tau^{\text{lab}}$: Most recently available lab assay of free lime (f-CaO).
- $t - \tau$: Lab data age in hours (indicates staleness).
- $R_t$: Raw meal chemical moduli (KH, SM, IM).

---

## 3. Reward & Cost Formulation

### 3.1 Reward Function (Energy Minimization & Smoothness)
$$r_t = - \left( w_f \frac{F_t - \bar{F}}{\sigma_F} + w_e \frac{E_t - \bar{E}}{\sigma_E} \right) - w_s \cdot \left( \|a_t\|^2 + \|a_t - a_{t-1}\|^2 \right)$$
- $F_t$: Specific coal consumption ($\text{kg/t clinker}$).
- $E_t$: Specific electricity consumption ($\text{kW}\cdot\text{h/t clinker}$).
- Smoothness penalty prevents high-frequency oscillations that damage mechanical dampers and fans.

### 3.2 Constraint Cost Function (Quality & Gas Safety)
$$c_{q, t} = \max(0, 0.5 - q_t) + \max(0, q_t - 1.5)$$
$$c_{\text{gas}, t} = \max(0, 1.2 - O_{2, t})$$
Total cost emitted in step info: $\text{cost}_t = c_{q, t} + c_{\text{gas}, t}$.

---

## 4. Environment Check Compliance

Every environment implementation must pass Gymnasium's official integrity checks:

```python
from gymnasium.utils.env_checker import check_env
from simple_kiln_env import SimpleKilnEnv

env = SimpleKilnEnv()
check_env(env)
```
