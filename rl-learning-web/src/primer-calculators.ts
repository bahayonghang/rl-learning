import katex from 'katex';
import { text as t } from './i18n';
import { discountedReturns, squashedLogProbability } from './labs/math';
import { setup, slider, stat, table, chart, bars, note, fmt, COLORS } from './labs/ui';
import { binaryMoments, probabilityTree, gradientStep, temperatureTransition } from './primer-math';
import type { PrimerUnit } from './content/primer';

const equation = (source: string) => `<div class="primer-equation">${katex.renderToString(source, {displayMode:true,throwOnError:false,trust:false})}</div>`;

export function mountPrimerCalculator(host: HTMLElement, kind: PrimerUnit['calculator']): () => void {
  const definitions: Record<PrimerUnit['calculator'], {question:string;intro:string;controls:string}> = {
    timeline: {question:t("拖动动作，观察“目标”与“实际响应”的区别","Move the action and compare the target with the actual response"),intro:t("设当前 SP=880°C、PV=879°C，门控已通过；为演示惯性，一步只跟踪误差的 20%。该系数是教学假设。","Assume SP=880°C, PV=879°C and an accepted gate. Each step closes 20% of the tracking error to illustrate inertia; this coefficient is a teaching assumption."),controls:slider('action',t("归一化动作 a","Normalized action a"),0.5,-1,1,0.05)},
    probability: {question:t("按原料工况分组后，判断会改变吗？","Does conditioning on the raw-material regime change your judgment?"),intro:t("先猜回稳概率，再调节分组比例和条件概率。所有概率都是教学输入。","Predict the recovery probability, then change the regime proportions and conditional probabilities. All probabilities are teaching inputs."),controls:slider('hard',t("难烧原料占比 P(B)","Hard-to-burn material share P(B)"),0.4,0,1,0.05)+slider('hard-recovery',t("难烧时回稳 P(A|B)","Recovery with hard-to-burn material P(A|B)"),0.5,0,1,0.05)+slider('normal-recovery',t("正常时回稳 P(A|非B)","Recovery with normal material P(A|not B)"),5/6,0,1,1/60)},
    expectation: {question:t("把两种后果逐项相乘，再相加","Multiply each outcome by its probability, then add"),intro:t("回稳时奖励为 3，未回稳时为 −2。改变概率，观察两项各贡献多少。","The reward is 3 after recovery and −2 otherwise. Change the probability to inspect each contribution."),controls:slider('probability',t("回稳概率 p","Recovery probability p"),0.7,0,1,0.05)},
    variance: {question:t("均值不变时，怎样让结果更不稳定？","How can outcomes become less stable while the mean stays unchanged?"),intro:t("两个等概率结果为 2−d 和 2+d。标准误差只是独立同分布假设下的演示，不把工业连续采样当独立试验。","Two equally likely outcomes are 2−d and 2+d. Standard error is demonstrated under independent, identically distributed sampling; consecutive industrial samples are not independent trials."),controls:slider('spread',t("偏离均值的幅度 d","Distance from the mean d"),6,0,10,0.5)+slider('samples',t("独立样本数 N","Independent sample count N"),4,4,100,1)},
    discount: {question:t("未来质量反馈，在今天的目标里有多重？","How much does future quality feedback count in today’s objective?"),intro:t("短轨迹奖励固定为 [−1,2,3]；同时计算每 5 分钟一步时，60 / 120 分钟之后尾部价值的折扣系数。","The short trajectory has rewards [−1,2,3]. With 5-minute decisions, also calculate the discount on tail value 60 and 120 minutes ahead."),controls:slider('gamma',t("折扣因子 γ","Discount factor γ"),0.9,0,0.999,0.001)},
    gradient: {question:t("亲手完成一次价值网络更新","Complete one value-network update"),intro:t("预测 V=θ×2，目标 y=3。先猜梯度符号，再调学习率。目标在这一次更新中保持不变。","Prediction V=θ×2, target y=3. Predict the gradient sign, then adjust the learning rate. The target is fixed during this update."),controls:slider('theta',t("当前参数 θ","Current parameter θ"),0.5,-1,3,0.05)+slider('rate',t("学习率 η","Learning rate η"),0.1,0,1,0.01)},
    log: {question:t("概率比是动作频率的变化倍数","The probability ratio measures a change in action frequency"),intro:t("两个动作：“提高一点”和“保持”。只观察已采到的“提高一点”，旧/新策略的另一个动作概率自动补足到 1。","There are two actions: increase a little and hold. Inspect the sampled increase action; the other probability under each policy complements it to 1."),controls:slider('old',t("旧策略概率","Old policy probability"),0.2,0.05,0.95,0.05)+slider('new',t("新策略概率","New policy probability"),0.3,0.05,0.95,0.05)},
    density: {question:t("同一个概率样本，经过三种坐标","One random sample, expressed in three coordinates"),intro:t("先看高斯空间 u，再看 tanh 后的归一化动作，最后看温度增量；比较每一步的密度修正。","Start with Gaussian coordinate u, then the tanh-normalized action, then the temperature increment. Compare the density correction at each step."),controls:slider('u',t("高斯空间样本 u","Gaussian sample u"),0.5,-3,3,0.1)+slider('sigma',t("标准差 σ","Standard deviation σ"),1,0.2,2,0.1)},
  };
  const definition=definitions[kind];
  const view=setup(host,definition.question,definition.intro,definition.controls);
  const draw=()=>{
    const n=view.number;
    let html='';
    if(kind==='timeline'){
      const v=temperatureTransition(n('action'));
      html=`<div class="lab-stats">${stat(t("归一化动作","Normalized action"),fmt(v.normalized),t("无单位","Dimensionless"))}${stat(t("温度增量","Temperature increment"),fmt(v.delta)+'°C',t("动作 × 2°C","Action × 2°C"))}${stat(t("下一设定值","Next setpoint"),fmt(v.candidate)+'°C',t("门控通过的教学情形","Teaching case: gate accepted"))}${stat(t("5 分钟后实际 PV","Actual PV after 5 minutes"),fmt(v.nextMeasured)+'°C',t("一阶跟踪假设","First-order tracking assumption"))}</div>`
        +equation(String.raw`\Delta T^{sp}=2\times(${fmt(v.normalized)})=${fmt(v.delta)},\qquad T_{t+1}^{sp}=880+(${fmt(v.delta)})=${fmt(v.candidate)}`)
        +equation(String.raw`T_{t+1}=879+0.2\times(${fmt(v.candidate)}-879)=${fmt(v.nextMeasured)}`)
        +note(t("读出这条经验","Read the transition"),t("观测 → 请求动作 → 门控 → 执行设定值 → 动态响应 → 奖励与新观测。保持 a=0 只表示不改 SP，PV 仍可能继续变化。","Observation → requested action → gate → executed setpoint → dynamic response → reward and new observation. Holding a=0 keeps SP unchanged; PV may still evolve."))
        +`<a class="text-link" href="#/kiln">${t('到水泥工作台观察完整门控与延迟 →','Inspect complete gating and delays in the kiln workbench →')}</a>`;
    }else if(kind==='probability'){
      const p=n('hard'),h=n('hard-recovery'),normal=n('normal-recovery'),v=probabilityTree(p,h,normal);
      html=`<div class="lab-stats">${stat(t("总体回稳概率","Overall recovery probability"),fmt(v.recovery,4))}${stat(t("难烧且未回稳","Hard-to-burn and not recovered"),fmt(v.hardAndFailed,4))}${stat(t("未回稳后：难烧的概率","Given no recovery: probability of hard-to-burn material"),v.hardGivenFailed===null?t("条件事件概率为 0","Conditioning event has probability 0"):fmt(v.hardGivenFailed,4))}</div>`
        +table([t("分支","Branch"),t("该分支占比","Branch proportion"),t("条件回稳概率","Conditional recovery probability"),t("对总体回稳的贡献","Contribution to overall recovery")],[[t("难烧原料","Hard-to-burn material"),fmt(p),fmt(h),fmt(p*h,4)],[t("正常原料","Normal material"),fmt(1-p),fmt(normal),fmt((1-p)*normal,4)]])
        +equation(String.raw`P(A)=${fmt(p)}\times${fmt(h,4)}+${fmt(1-p)}\times${fmt(normal,4)}=${fmt(v.recovery,4)}`)
        +note(t("注意条件的方向","Check the direction of conditioning"),t("P(未回稳 | 难烧) 与 P(难烧 | 未回稳) 是不同问题。后者还需要难烧工况原本有多常见。","P(no recovery | hard-to-burn) and P(hard-to-burn | no recovery) answer different questions. The latter also needs the prior frequency of that regime."));
    }else if(kind==='expectation'){
      const p=n('probability'),v=binaryMoments(p,3,-2);
      html=`<div class="lab-stats">${stat(t("好结果贡献","Good-outcome contribution"),fmt(v.goodContribution))}${stat(t("坏结果贡献","Bad-outcome contribution"),fmt(v.badContribution))}${stat(t("期望奖励","Expected reward"),fmt(v.expected))}</div>`
        +bars([{label:t("回稳贡献","Recovery contribution"),value:v.goodContribution},{label:t("未回稳贡献","No-recovery contribution"),value:v.badContribution,color:COLORS.orange},{label:t("相加后的期望","Sum: expectation"),value:v.expected,color:COLORS.blue}],t("两项加权贡献与它们的和","Two weighted contributions and their sum"))
        +equation(String.raw`\mathbb E[R]=${fmt(p)}\times3+${fmt(1-p)}\times(-2)=${fmt(v.expected)}`)
        +note(t("什么时候期望变为正？","When does the expectation become positive?"),t("解 3p−2(1−p)>0，先展开成 5p−2>0，再得到 p>0.4。期望为正仍不表示每次都成功，更不代表质量约束满足。","Solve 3p−2(1−p)>0: expand to 5p−2>0, then p>0.4. Positive expectation does not imply success every time or satisfaction of the quality constraint."));
    }else if(kind==='variance'){
      const d=n('spread'),count=n('samples'),v=binaryMoments(.5,2+d,2-d);
      html=`<div class="lab-stats">${stat(t("期望","Expectation"),fmt(v.expected))}${stat(t("总体方差","Population variance"),fmt(v.variance))}${stat(t("总体标准差","Population standard deviation"),fmt(Math.sqrt(v.variance)))}${stat(t("均值标准误差","Standard error of the mean"),fmt(Math.sqrt(v.variance/count)),t("独立同分布假设","IID sampling assumption"))}</div>`
        +bars([{label:t("结果一","Outcome one"),value:2-d,color:COLORS.orange},{label:t("结果二","Outcome two"),value:2+d,color:COLORS.green}],t("两种结果各有 50% 概率","Each outcome has 50% probability"))
        +equation(String.raw`\mathrm{Var}(R)=0.5\times(-${fmt(d)})^2+0.5\times${fmt(d)}^2=${fmt(v.variance)}`)
        +note(t("把样本量乘四试一试","Try quadrupling the sample count"),t("标准误差按 1/√N 缩小，所以样本数乘四才减半。增加重复样本无法自动修正偏差、时间泄漏或分布漂移。","Standard error shrinks as 1/√N, so four times as many samples halve it. More repeated samples do not automatically correct bias, temporal leakage or distribution shift."));
    }else if(kind==='discount'){
      const gamma=n('gamma'),returns=discountedReturns([-1,2,3],gamma);
      html=`<div class="lab-stats">${stat(t("三步回报 G₀","Three-step return G₀"),fmt(returns[0],4))}${stat(t("60 分钟后尾部价值权重","Tail-value weight at 60 minutes"),fmt(gamma**12,4),'γ¹²')}${stat(t("120 分钟后尾部价值权重","Tail-value weight at 120 minutes"),fmt(gamma**24,4),'γ²⁴')}${stat(t("总权重 / 近似有效步数","Total weight / approximate effective steps"),fmt(1/(1-gamma),1),t("无限有界奖励、γ<1","Infinite bounded rewards, γ<1"))}</div>`
        +equation(String.raw`G_0=-1+${fmt(gamma,3)}\times2+${fmt(gamma,3)}^2\times3=${fmt(returns[0],4)}`)
        +chart([{name:t("尾部系数 γᵏ","Tail coefficient γᵏ"),values:Array.from({length:25},(_,k)=>gamma**k),color:COLORS.green}],t("未来时刻之后的尾部价值权重","Discount weight on value beyond a future time"),{xMin:0,xMax:120,xLabel:t("尾部起点距现在的分钟数","Minutes to the start of the tail"),yLabel:t("尾部系数","Tail coefficient"),min:0,max:1})
        +note(t("区分一条奖励与后面的尾部","Distinguish a single reward from the remaining tail"),t("60 分钟相当于 12 步，尾部价值系数为 γ¹²：γ=0.9 时约 0.282，γ=0.98 时约 0.785。60 分钟时收到的单条 Rₜ₊₁₂ 则乘 γ¹¹，因为第一条 Rₜ₊₁ 的权重是 1。提高 γ 也会提高估计难度，仍须匹配历史状态和反馈时间。","60 minutes is 12 steps. Tail value receives γ¹²: about 0.282 at γ=0.9 and 0.785 at γ=0.98. The single reward Rₜ₊₁₂ arriving at 60 minutes receives γ¹¹ because Rₜ₊₁ has weight 1. Larger γ also makes estimation harder; the history representation and feedback timing must still match."));
    }else if(kind==='gradient'){
      const theta=n('theta'),rate=n('rate'),v=gradientStep(theta,rate);
      html=`<div class="lab-stats">${stat(t("当前预测","Current prediction"),fmt(v.prediction))}${stat(t("梯度 ∂L/∂θ","Gradient ∂L/∂θ"),fmt(v.gradient))}${stat(t("新参数","Updated parameter"),fmt(v.nextTheta))}${stat(t("损失变化","Loss change"),fmt(v.loss)+' → '+fmt(v.nextLoss))}</div>`
        +equation(String.raw`\nabla_\theta L=(${fmt(theta)}\times2-3)\times2=${fmt(v.gradient)}`)
        +equation(String.raw`\theta_{\rm new}=${fmt(theta)}-${fmt(rate)}\times(${fmt(v.gradient)})=${fmt(v.nextTheta)}`)
        +chart([{name:'L(θ)=½(2θ−3)²',values:Array.from({length:41},(_,i)=>.5*(2*(-1+i*.1)-3)**2),color:COLORS.green}],t("当前问题的损失曲线；最低点位于 θ=1.5","Loss curve for this example; minimum at θ=1.5"),{xMin:-1,xMax:3,xLabel:t("参数 θ","Parameter θ"),yLabel:t("平方误差","Squared error")})
        +note(v.nextLoss>v.loss+1e-10?t("这次走得太远了","This step went too far"):t("观察更新方向","Inspect the update direction"),t("对这个二次问题，误差在每次更新后乘以 (1−4η)。0<η<0.5 时误差幅度缩小，η=0.5 时可来回振荡，η>0.5 时可发散；这不是所有神经网络共享的学习率阈值。","For this quadratic, each update multiplies the error by (1−4η). Its magnitude shrinks for 0<η<0.5, can oscillate at η=0.5, and can diverge above 0.5. This threshold does not apply to every neural network."));
    }else if(kind==='log'){
      const old=n('old'),next=n('new'),ratio=next/old;
      html=`<div class="lab-stats">${stat(t("旧 log 概率","Old log probability"),fmt(Math.log(old),4))}${stat(t("新 log 概率","New log probability"),fmt(Math.log(next),4))}${stat(t("概率比 ρ","Probability ratio ρ"),fmt(ratio,4))}</div>`
        +equation(String.raw`\rho=\frac{${fmt(next)}}{${fmt(old)}}=\exp(${fmt(Math.log(next),4)}-(${fmt(Math.log(old),4)}))=${fmt(ratio,4)}`)
        +table([t("策略","Policy"),t("提高一点","Increase a little"),t("保持","Hold")],[[t("旧策略","Old policy"),fmt(old),fmt(1-old)],[t("新策略","New policy"),fmt(next),fmt(1-next)]])
        +note(t("概率变大，不等于动作值变大","A higher probability does not make the action larger"),t("这里一直是同一个“提高一点”的动作，只是策略更常/更少选择它。PPO 根据优势决定是否鼓励这种变化；正负优势时裁剪方向不同。","The action remains the same small increase; the policy simply chooses it more or less often. PPO uses the advantage to decide whether to encourage this change. Clipping behaves differently for positive and negative advantages."))
        +`<a class="text-link" href="#/lab/ppo">${t('再看正负优势下的 PPO 裁剪 →','Explore PPO clipping for positive and negative advantages →')}</a>`;
    }else{
      const u=n('u'),sigma=n('sigma'),a=Math.tanh(u),logU=-.5*(u/sigma)**2-Math.log(sigma)-.5*Math.log(2*Math.PI),logA=squashedLogProbability(u,0,sigma),logPhysical=logA-Math.log(2);
      html=`<div class="lab-stats">${stat(t("归一化动作 tanh(u)","Normalized action tanh(u)"),fmt(a,4))}${stat(t("温度增量 2a","Temperature increment 2a"),fmt(2*a,4)+'°C')}${stat(t("tanh 修正项","tanh correction"),fmt(-Math.log(1-a*a),4))}</div>`
        +table([t("坐标","Coordinate"),t("log 密度","Log density"),t("密度","Density")],[[t("高斯 u","Gaussian u"),fmt(logU,4),fmt(Math.exp(logU),4)],[t("归一化 a","Normalized a"),fmt(logA,4),fmt(Math.exp(logA),4)],[t("温度增量 ΔT","Temperature increment ΔT"),fmt(logPhysical,4),fmt(Math.exp(logPhysical),4)]])
        +equation(String.raw`\log p_A=\log\mathcal N(${fmt(u,2)};0,${fmt(sigma,2)}^2)-\log\bigl(1-\tanh^2(${fmt(u,2)})\bigr)\approx${fmt(logA,4)}`)
        +note(t("为什么三列数不同却是同一次采样","Why the densities differ for the same sample"),t("横坐标被压缩或拉伸后，密度必须相应变化才能保持区间概率。表中数值经过四舍五入；计算保留原始 tanh 结果，不能把显示的近似动作代回后要求末位完全一致。连续变量恰好取某个点的概率为 0；密度值本身不是事件概率。","Compressing or stretching the coordinate requires a density change to preserve interval probabilities. The table is rounded; calculations keep the full tanh result, so substituting displayed values need not reproduce the last digit. An exact point has probability zero for this continuous variable; density is not an event probability."));
    }
    view.target.innerHTML=html;
  };
  const cleanup=view.bind(draw);
  draw();
  return cleanup;
}

