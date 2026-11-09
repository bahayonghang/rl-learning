# Reproducibility & Safety Protocol Guidelines

> Rules for experimental reproducibility, deterministic evaluation, and terminology boundaries.

---

## 1. Seed Control & Reproducibility Contract

Due to stochastic policy exploration, random disturbance generation (e.g., raw meal KH fluctuations), and asynchronous GPU execution, reproducibility requires explicit seed synchronization.

### Mandatory Seeding Helper
Every training and evaluation script must implement and call the standard seed utility:

```python
import os
import random
import numpy as np
import torch

def set_seed(seed: int = 42):
    """Seed all pseudo-random number generators for strict reproducibility."""
    random.seed(seed)
    os.environ["PYTHONHASHSEED"] = str(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)
        torch.backends.cudnn.deterministic = True
        torch.backends.cudnn.benchmark = False
```

---

## 2. Deterministic Policy Evaluation

During policy training, stochastic exploration is active (e.g., Gaussian noise $\epsilon \sim \mathcal{N}(0, \sigma)$ in SAC / TD3). 

During evaluation:
1. **Disable Exploration Noise**: Always evaluate the deterministic mean $\mu(s)$, never the sampled action.
2. **Evaluation Flags**: Explicitly set `model.eval()` and execute within a `with torch.no_grad():` context block.
3. **Safety Gate Verification**: Evaluate policy behavior both with and without the 5-layer Safety Gate enabled to diagnose raw policy compliance vs. gated production compliance.

---

## 3. Strict Industrial Boundaries & Terminology

### 3.1 Zero Physical Trial-and-Error Rule
Under no circumstances should any code or procedure imply direct online interaction with live production equipment. Training is strictly restricted to:
- Static offline datasets collected from DCS/OPC historians.
- Synthetic simulation environments (`SimpleKilnEnv`).
- World-model surrogate rollouts ($W_\psi$).

### 3.2 Terminology Compliance: "Deduction / Simulation" vs. "Real Site Savings"
- Results obtained by executing policies within $W_\psi$ or `SimpleKilnEnv` must strictly be termed **"simulation rollouts"** or **"deductions"** (推演).
- Never report simulated energy reductions as confirmed on-site savings. Real-world validation is subject to unmodelled process drift, instrument calibration bias, and operational shift factors.
