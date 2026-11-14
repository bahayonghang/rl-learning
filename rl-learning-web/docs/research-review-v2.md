# Research review v2: scope and evidence protocol

Verification date: 2026-11-14. This review supports nine original, bilingual teaching pages in `src/research/`. It preserves the repository's supervisory CV setpoint-increment interface and does not modify the industrial environment or run policy training.

## Protocol

1. Search primary author, publisher, official agency and official documentation sources. Use authoritative search for metadata and topical coverage, then open the primary document or publisher record before using substantive claims.
2. Record what was actually accessible: full article/book, author manuscript, publisher abstract, official operational account, or publisher-deposited DOI metadata. An inaccessible full text is not treated as read.
3. Separate mathematical derivations, synthetic teaching examples, published authors' reported experiments, and this repository's proposed research. Do not invent measured savings or reinterpret historical industrial data as a deployed closed loop.
4. Distinguish conceptual/theoretical, benchmark simulation, plant-data simulation, pilot, and documented operational deployment. The catalogue's single `evidence` tag is only a coarse filter; the evidence page records important qualifications.
5. Treat EA, MPC and RL as overlapping design choices. An EA can optimize trajectories inside receding-horizon control; RL can be a learned terminal value or policy inside an optimization architecture. Neither acronym provides a safety or superiority guarantee.
6. Keep exact relations in LaTeX and Mermaid. Generated bitmap illustrations are conceptual introductions, not numerical evidence or authoritative process diagrams.

## Implemented pages

1. `history`: plantwide control, RTO, tracking MPC, economic MPC and supervisory decisions.
2. `indicators`: specific energy, quality, throughput, emissions and stability; units, aggregation and confounding.
3. `objectives`: normalization, Pareto order, scalarization, epsilon constraints and different meanings of safety.
4. `evolution`: NSGA-II, MOEA/D, constraint handling, dynamic search and trajectory optimization.
5. `sequential`: derive MDP, POMDP and CMDP from the decision problem; connect planning and policy learning.
6. `architecture`: neural and data paths, requested and executed actions, twin critics, offline learning and world models.
7. `evidence`: primary-source matrix with explicit evidence levels and unavailable details.
8. `open-problems`: partial observation, causal support, model exploitation, uncertainty, constraints and reproducibility.
9. `agenda`: existing project interfaces and six falsifiable research hypotheses.

## Search and evidence trail

The search families were plantwide/self-optimizing control and RTO; economic MPC; cement energy and emissions accounting; original NSGA-II/MOEA/D/constraint-handling papers; dynamic multiobjective optimization; SAC/TD3/offline RL/model-based RL; constrained learning and predictive safety filters; statistical evaluation; exact DOI/title checks for the related cement publications; and official industrial operational accounts. Authoritative search was used for primary-source coverage and metadata verification. DOI resolution, publisher pages, author-hosted PDFs, arXiv full texts, official agency documents and publisher-deposited Crossref metadata were then consulted as available.

Publisher access was uneven. Several Elsevier/IEEE pages returned access errors, while metadata or deposited abstracts remained available. These limitations are retained below rather than hidden. An author-uploaded reproduction of the original paper counts as primary material; third-party summaries, citations, venue metrics and promotional claims do not establish the paper's experimental findings. Search-result publication estimates are not used as publication dates when DOI metadata or the paper supplies a date.

All entries below were checked on **2026-11-14**. `reviewSources` contains 35 records with unique `r2-` identifiers; every record is referenced by at least one page. It intentionally has its own namespace rather than silently altering the earlier tutorial source catalogue.

### Process, indicators and optimization sources

| ID and canonical source | Material actually consulted | Claim supported and limit |
| --- | --- | --- |
| `r2-skogestad` — [Skogestad, 2000](https://doi.org/10.1016/S0959-1524(00)00023-8) | [Author-hosted manuscript](https://skoge.folk.ntnu.no/publications/1999/tmp/self1.pdf); DOI metadata | CV selection, hierarchy and conditional economic-loss reasoning. The paper itself acknowledges extension toward dynamic models/trajectories; no claim that fixed CVs are globally suitable. |
| `r2-rto` — [Darby et al., 2011](https://doi.org/10.1016/j.jprocont.2011.03.009) | Publisher abstract and bibliographic record; full publisher article unavailable | RTO/MPC practice and implementation context. Detailed textbook-style formulations in the tutorial are original synthesis, not an asserted reading of inaccessible sections. |
| `r2-engell` — [Engell, 2007](https://doi.org/10.1016/j.jprocont.2006.10.011) | Publisher abstract/introduction extraction; full page access restricted | Economic feedback optimization as a historical/theoretical connection. No imported theorem or plant result. |
| `r2-empc` — [Ellis et al., 2014](https://doi.org/10.1016/j.jprocont.2014.03.010) | Publisher abstract and record | EMPC, stability and performance scope. Mathematical discussion also relies on the open MPC textbook below. |
| `r2-mpcbook` — [Rawlings, Mayne and Diehl](https://sites.engineering.ucsb.edu/~jbraw/mpc/) | Author book page and relevant parts of the [open book PDF](https://sites.engineering.ucsb.edu/~jbraw/mpc/MPC-book-2nd-edition-6th-printing.pdf) | Receding horizons, constraints, terminal ingredients, estimation and economic MPC. Bibliography distinguishes the second paperback edition from the current online printing. |
| `r2-cement-bat` — [JRC BREF, 2013](https://publications.jrc.ec.europa.eu/repository/handle/JRC83006) | Official JRC document record and scope | Cement/lime/magnesium-oxide process, energy and emissions accounting. No automatic application of historical regulatory thresholds to this kiln. |
| `r2-energy-guide` — [EPA ENERGY STAR cement guide, 2013](https://www.energystar.gov/sites/default/files/buildings/tools/ENERGY%20STAR%20Guide%20for%20the%20Cement%20Industry%2028_08_2013%20Final.pdf) | Open original guide, relevant energy and process sections | Distinguishes clinker burning, grinding, fuel and electricity boundaries. No historical industry-average value is represented as a project measurement. |
| `r2-nsga2` — [Deb et al., 2002](https://doi.org/10.1109/4235.996017) | [Original article PDF](https://dynamics.org/~altenber/UH_ICS/EC_REFS/MULTI_OBJ/DebPratapAgarwalMeyarivan.pdf) | Nondominated sorting, crowding, elitism and constrained dominance. Evidence is numerical test problems, not the present kiln. |
| `r2-moead` — [Zhang and Li, 2007](https://doi.org/10.1109/TEVC.2007.892759) | Original paper PDF and decomposition/neighborhood sections | Tchebycheff decomposition, neighboring weights, scale issues and search architecture. Does not specify the project's PG variant. |
| `r2-feasibility` — [Deb, 2000](https://doi.org/10.1016/S0045-7825(99)00389-8) | Publisher abstract/record; constrained-dominance details cross-checked against NSGA-II full text | Original feasibility-comparison reference. No unsupported exact convergence claim. |
| `r2-epsilon` — [Takahama and Sakai, 2006](https://doi.org/10.1109/CEC.2006.1688283) | [Author bibliography](https://ns1.shudo-u.ac.jp/~setuko/Jp/papers.html) and [Takahama-uploaded original article](https://www.researchgate.net/publication/224645691_Constrained_Optimization_by_the_e_Constrained_Differential_Evolution_with_Gradient-Based_Mutation_and_Feasible_Elites), sections III–IV | Epsilon-level comparison and reduction of search relaxation. The author-hosted site timed out on direct access, so the original author-uploaded text supplied the substantive check. No reconstruction of PG-MOEA/D-IEpsilon's unpublished implementation. |
| `r2-dynamic` — [Farina, Deb and Amato, 2004](https://doi.org/10.1109/TEVC.2004.831456) | DOI record, [Deb's official bibliography](https://www.egr.msu.edu/~kdeb/journals.shtml), and [Deb-uploaded original article](https://www.researchgate.net/publication/3418802_Dynamic_Multiobjective_Optimization_Problems_Test_Cases_Approximations_and_Applications) | Moving Pareto sets, dynamic test problems and a control-loop example. The primary paper explicitly rules out a blanket portrayal of EA as restricted to static points. A separate university PDF mirror timed out. |
| `r2-chance` — [Charnes and Cooper, 1959](https://doi.org/10.1287/mnsc.6.1.73) | Publisher-deposited abstract and DOI metadata | Foundational chance-constraint reference. Gaussian standardization, quantile arithmetic and horizon probability examples are independently derived teaching material. |

### RL, safety and evaluation sources

| ID and canonical source | Material actually consulted | Claim supported and limit |
| --- | --- | --- |
| `r2-rlbook` — [Sutton and Barto, 2018](https://incompleteideas.net/book/the-book-2nd.html) | Author textbook reference used throughout the existing tutorial; standard MDP/value definitions | The kiln MDP/POMDP constructions and numerical examples are original applications, not an industrial case claimed by the book. |
| `r2-process-rl` — [Dogru et al., 2024](https://doi.org/10.1109/JAS.2024.124227) | [Official journal page](https://www.ieee-jas.net/en/article/doi/10.1109/JAS.2024.124227), full author list and abstract | Review spans the control hierarchy and process-industry uses. It is cited as a domain map, not as primary evidence of every application it surveys. |
| `r2-mpc-rl` — [Gros and Zanon](https://arxiv.org/abs/1904.04152) | Original PDF, including the model/cost relationship and theorem conditions | NMPC as a learnable function approximator; modified stage costs and terminal values matter. No claim that arbitrary wrong models are automatically safe or optimal. |
| `r2-td3` — [Fujimoto et al., 2018](https://arxiv.org/abs/1802.09477) | Original author paper record and algorithm description | Twin-critic minimum, delayed updates and approximation-error motivation. No plant-performance transfer; twin Q is not a confidence interval. |
| `r2-sac` — [Haarnoja et al., 2018](https://arxiv.org/abs/1801.01290) | Original PDF, maximum-entropy objective and transformed density | Entropy and squashed Gaussian density. The numerical Jacobian calculation is original and has no safety implication. |
| `r2-sac-apps` — [Haarnoja et al.](https://arxiv.org/abs/1812.05905) | Original PDF, policy/critic/temperature update sections | Modern SAC update structure and the paper's robotics context. Candidate-versus-execution gate semantics are our interface analysis, not an attribution to this paper. |
| `r2-cql` — [Kumar et al., 2020](https://arxiv.org/abs/2006.04779) | Original PDF, objective and conservative-value discussion | Offline value overestimation and conservative learning. Policy-value statements are not relabeled as universal pointwise lower bounds. |
| `r2-iql` — [Kostrikov et al.](https://arxiv.org/abs/2110.06169) | Original PDF, expectile/value/policy sections | Dataset-action value fitting and advantage-weighted extraction. It does not prove that the final fitted policy can never leave support. |
| `r2-td3bc` — [Fujimoto and Gu, 2021](https://arxiv.org/abs/2106.06860) | Author record and [open original HTML](https://arxiv.org/html/2106.06860v2) | A simple behavior-regularized offline baseline. Its reported benchmark ranking is not used to rank this project. |
| `r2-mbpo` — [Janner et al., 2019](https://arxiv.org/abs/1906.08253) | Original PDF, short-branching argument and Algorithm 1 | Short model rollouts and the original continuing real-data-collection loop. Fixed-log adaptation is explicitly distinguished. |
| `r2-mopo` — [Yu et al., 2020](https://arxiv.org/abs/2005.13239) | Original PDF, uncertainty-penalized offline model formulation | Conservative model use under assumptions. Model uncertainty penalties are not hard equipment certificates. |
| `r2-cpo` — [Achiam et al., 2017](https://arxiv.org/abs/1705.10528) | Original PDF, expected constraints and policy-update framework | CMDP budget semantics. Averages do not imply per-step freedom from violation. The tutorial's dual update and arithmetic are teaching derivations. |
| `r2-safety-filter` — [Wabersich and Zeilinger, 2021](https://doi.org/10.1016/j.automatica.2021.109597) | [Open author manuscript](https://arxiv.org/abs/1812.05506), terminal safe-set, model-confidence and feasibility assumptions | Formal predictive filtering requires stronger premises than the project's threshold gate alone. |
| `r2-rliable` — [Agarwal et al., 2021](https://arxiv.org/abs/2108.13264) | [Open original full HTML](https://arxiv.org/html/2108.13264v4), especially formalism and evaluation recommendations | Run-level uncertainty and robust aggregation. Process autocorrelation, paired regime tests and zero-event arithmetic are additional tutorial analysis, not an assertion that game-benchmark sampling transfers unchanged. |

### Related publications and operational evidence

| ID and canonical source | Verified access and attribution | Allowed conclusion |
| --- | --- | --- |
| `r2-tcnso` — [TCNSO-MSL-TD3-related paper](https://doi.org/10.1088/2631-8695/ae5ed3) | Publisher-deposited DOI metadata and abstract; Engineering Research Express 8, 085407 (2026); authors include Yonghang Li | The abstract identifies temporal observation, multistep learning and constraint-related design. Full text was unavailable. Do not classify physical deployment or reproduce detailed performance from this access. |
| `r2-oadstr` — [OA-DSTR-related paper](https://doi.org/10.1016/j.asoc.2024.111772) | DOI authors/title/venue and publisher abstract; Applied Soft Computing 161, 111772 (2024) | Cement **grinding**, with dynamic decision/search context. Do not describe it as a kiln field experiment. |
| `r2-monitoring` — [Joint soft sensor and forecasting paper](https://doi.org/10.1109/TII.2026.3664090) | Publisher-deposited title, authors, venue and pages; IEEE TII 22, 5254–5265 (2026); no full text or deposited abstract obtained | Bibliographic identity and research topic only. Proposed architecture is not a claimed reconstruction of this paper or its MSAKAN/MambaMoE internals. |
| `r2-todcgan` — [TOD-CGAN](https://doi.org/10.1016/j.jfranklin.2026.108704) | DOI metadata and publisher abstract; Journal of the Franklin Institute 363, 108704 (2026); authors include Yonghang Li | Conditional generative operational decisions are relevant to candidate generation. They are not automatically RL or evidence of autonomous plant execution. |
| `r2-conerl` — [CoNERL](https://doi.org/10.1016/j.aei.2026.104530) | DOI record and publisher simulation description; Advanced Engineering Informatics 73, 104530 (2026); Gang Liu, Shangjian Xie, Xiaochen Hao, Ran Zheng, Shuaixiang Zhai, Mohan Liu | External related work. The verified list **does not include Yonghang Li**. Simulation language is retained; no field-savings claim. |
| `r2-yokogawa` — [Official Yokogawa–JSR report](https://www.yokogawa.com/news/press-releases/2022/2022-03-22/) | Full official joint account, dated 2022-03-22 | First-party report of a distillation-unit FKDPP field trial from 2022-01-17 to 02-21, lasting 35 days; simulator training, DCS integration and interlocks described. Not independently reproduced, not randomized evidence here, not a cement result. |
| `r2-deepmind` — [Official DeepMind operational account](https://deepmind.google/blog/safety-first-ai-for-autonomous-data-centre-cooling-and-industrial-control/) | Full official account, dated 2018-08-17 | Prediction, candidate screening, local verification, uncertainty handling and human override in autonomous data-centre cooling. No PPO/SAC attribution and no transplanted savings percentage. |
| `r2-project` — [Repository domain contract](https://github.com/bahayonghang/rl-learning/blob/main/AGENTS.md) | Local AGENTS.md and relevant environment/web specifications | Project-specific timing, CV increments, observations, costs, gates and baseline requirements. These are conventions, not universal engineering standards or validation evidence. |

The `documentation` label on the five related 2024–2026 publication records means that the **verified material is bibliographic/abstract documentation**. It does not assert that the underlying paper has no empirical experiments. Likewise, the coarse `deployment` category for an official field account must be read with the page's first-party and trial-duration qualifications. No citation count, impact factor or author affiliation is used as proof of effectiveness.

## Original synthesis and mathematical boundaries

The review is an original bilingual tutorial, not a translation or extended paraphrase of any one source. It contains no copied article paragraphs, reproduced source figures or purchased course content. Standard mathematical definitions are explained in new prose; the numerical examples, kiln-interface analysis, tables and six hypotheses are independently constructed. Individual primary-source claims are kept short and cited locally. A source that was available only as an abstract is not used to reconstruct a detailed architecture or experimental protocol.

Key original worked examples include the two-step costs, economic-loss comparison, mass-weighted aggregation, retained startup energy at zero output, heating-value conversion, conforming-production denominator, normalized preferences and physical cost coefficients, unsupported weighted-sum Pareto point, Gaussian chance constraint, three different violation-cost units, NSGA-II crowding, MOEA/D Tchebycheff selection, dual update, tanh log density, SAC target, IQL expectile loss, rare importance weights, multi-step error accumulation and independent-trial zero-event upper bound. All are explicitly teaching assumptions, not identified kiln dynamics or measured benefits.

Important semantics preserved:

- EA can optimize sequences, including inside receding-horizon control; a steady evaluator is a formulation choice rather than a fundamental EA limitation.
- The agent proposes bounded CV **setpoint increments**, retaining the inner DCS/APC loop. It never directly sets coal/fan/valve MVs.
- Requested and executed actions are distinct. Setpoint updates and smoothness use the executed action. A rejected proposal holds setpoints while the process and clocks continue.
- The architecture explicitly distinguishes an execution-domain critic from a proposal-domain critic for the composite gated environment. A replacement action must not be assigned the sampled proposal's log probability.
- Assay sample time and release time are distinct. Historical inputs cannot use a future released label, even if the later label can supervise an appropriately aligned soft sensor.
- A continuing-task time limit is truncation. Legitimate final-state bootstrapping is retained, while advantage or multistep recursion cannot cross a reset.
- CMDP expected budgets, chance constraints, physical bounds, search epsilon and preference epsilon are separate objects. Entropy, tanh and twin critics do not certify plant safety.
- Costs retain units and normalization. Magnitude, event frequency and duration use different budgets. Per-step risk is not trajectory risk.
- Model-error recurrences state common-action or closed-loop sensitivity assumptions. RMSE does not become a uniform error bound, and a discrete gate can invalidate global Lipschitz assumptions.
- Known OAM-Net, QC-MTWaveSME, MC3/OOD, PG-MOEA/D-IEpsilon and NURBS modules are treated as interfaces/proposals. No unavailable baseline code, plant data, unpublished architecture or private results are invented.

## Local verification and independent review

The content-only verification imported the actual TypeScript data with `node --import tsx`, used Marked to exclude code from math scanning, rendered every authored formula with KaTeX `throwOnError: true` and `trust: false`, and parsed Mermaid after installing a JSDOM window with strict security and HTML labels disabled. It also checked table row/header widths, page/source integrity and diagram counts. This does not substitute for the root agent's full browser/build/export verification.

| Check | Observed result |
| --- | --- |
| Bilingual pages | 9, unique stable IDs in the specified order |
| Review sources | 35 unique `r2-` IDs; no missing references and no unused catalogue entry |
| Mathematics | 487 formula occurrences across the 18 language bodies, all KaTeX parsing passed |
| Mermaid | 18 diagrams, one per language per page; all real Mermaid parses passed |
| Diagram form | Top-down, quoted labels, no HTML, click directives or per-diagram configuration |
| Markdown tables | 16 tables; parsed row widths match header widths |
| Chinese body size | 19,349 CJK characters, excluding formulas, punctuation and Latin terms |
| English body size | 11,964 alphabetic word tokens, including headings and diagram/table text |

| Page | Chinese CJK count | English word count |
| --- | ---: | ---: |
| history | 2,041 | 1,232 |
| indicators | 1,948 | 1,241 |
| objectives | 1,788 | 1,163 |
| evolution | 2,102 | 1,302 |
| sequential | 2,033 | 1,306 |
| architecture | 2,031 | 1,507 |
| evidence | 2,155 | 1,219 |
| open-problems | 2,109 | 1,233 |
| agenda | 3,142 | 1,761 |

An independent content reviewer checked mathematical meanings and numerical examples. Three identified issues were corrected in both languages where relevant: (1) the energy weighted-average identity now states positive-denominator conditions and retains zero-production energy; (2) a negative tanh log-density value is correctly named a **log** density; (3) the 100-step probability example distinguishes an exact one-percent per-step probability from an at-most-one-percent bound. The reviewer also checked the two critic domains, SAC/CQL/IQL mechanisms, model-error conditions, zero-event confidence bound, temporal split/purge protocol and six hypothesis designs. Later additions to the first three pages preserve the same assumptions and were included in the final mechanical checks above.

No industrial training, baseline benchmarking, equipment interaction or deployment was performed by this content task. The four bitmap figure identifiers are `operations-stack`, `evolution-search`, `safe-agent` and `world-model`; they are conceptual illustrations managed by the root agent. Exact topology, calculations and evidence remain in the authored Mermaid, formulas and prose.
