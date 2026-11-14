import katex from 'katex';
import { discountedReturns, squashedLogProbability } from './labs/math';
import { setup, slider, stat, table, chart, bars, note, fmt, COLORS } from './labs/ui';
import { binaryMoments, probabilityTree, gradientStep, temperatureTransition } from './primer-math';
import type { PrimerUnit } from './content/primer';

const equation = (source: string) => `<div class="primer-equation">${katex.renderToString(source, {displayMode:true,throwOnError:false,trust:false})}</div>`;

export function mountPrimerCalculator(host: HTMLElement, kind: PrimerUnit['calculator']): () => void {
  const definitions: Record<PrimerUnit['calculator'], {question:string;intro:string;controls:string}> = {
    timeline: {question:'拖动动作，观察“目标”与“实际响应”的区别',intro:'设当前 SP=880°C、PV=879°C，门控已通过；为演示惯性，一步只跟踪误差的 20%。该系数是教学假设。',controls:slider('action','归一化动作 a',0.5,-1,1,0.05)},
    probability: {question:'按原料工况分组后，判断会改变吗？',intro:'先猜回稳概率，再调节分组比例和条件概率。所有概率都是教学输入。',controls:slider('hard','难烧原料占比 P(B)',0.4,0,1,0.05)+slider('hard-recovery','难烧时回稳 P(A|B)',0.5,0,1,0.05)+slider('normal-recovery','正常时回稳 P(A|非B)',5/6,0,1,1/60)},
    expectation: {question:'把两种后果逐项相乘，再相加',intro:'回稳时奖励为 3，未回稳时为 −2。改变概率，观察两项各贡献多少。',controls:slider('probability','回稳概率 p',0.7,0,1,0.05)},
    variance: {question:'均值不变时，怎样让结果更不稳定？',intro:'两个等概率结果为 2−d 和 2+d。标准误差只是独立同分布假设下的演示，不把工业连续采样当独立试验。',controls:slider('spread','偏离均值的幅度 d',6,0,10,0.5)+slider('samples','独立样本数 N',4,4,100,1)},
    discount: {question:'未来质量反馈，在今天的目标里有多重？',intro:'短轨迹奖励固定为 [−1,2,3]；同时计算每 5 分钟一步时，60 / 120 分钟之后尾部价值的折扣系数。',controls:slider('gamma','折扣因子 γ',0.9,0,0.999,0.001)},
    gradient: {question:'亲手完成一次价值网络更新',intro:'预测 V=θ×2，目标 y=3。先猜梯度符号，再调学习率。目标在这一次更新中保持不变。',controls:slider('theta','当前参数 θ',0.5,-1,3,0.05)+slider('rate','学习率 η',0.1,0,1,0.01)},
    log: {question:'概率比是动作频率的变化倍数',intro:'两个动作：“提高一点”和“保持”。只观察已采到的“提高一点”，旧/新策略的另一个动作概率自动补足到 1。',controls:slider('old','旧策略概率',0.2,0.05,0.95,0.05)+slider('new','新策略概率',0.3,0.05,0.95,0.05)},
    density: {question:'同一个概率样本，经过三种坐标',intro:'先看高斯空间 u，再看 tanh 后的归一化动作，最后看温度增量；比较每一步的密度修正。',controls:slider('u','高斯空间样本 u',0.5,-3,3,0.1)+slider('sigma','标准差 σ',1,0.2,2,0.1)},
  };
  const definition=definitions[kind];
  const view=setup(host,definition.question,definition.intro,definition.controls);
  const draw=()=>{
    const n=view.number;
    let html='';
    if(kind==='timeline'){
      const v=temperatureTransition(n('action'));
      html=`<div class="lab-stats">${stat('归一化动作',fmt(v.normalized),'无单位')}${stat('温度增量',fmt(v.delta)+'°C','动作 × 2°C')}${stat('下一设定值',fmt(v.candidate)+'°C','门控通过的教学情形')}${stat('5 分钟后实际 PV',fmt(v.nextMeasured)+'°C','一阶跟踪假设')}</div>`
        +equation(String.raw`\Delta T^{sp}=2\times(${fmt(v.normalized)})=${fmt(v.delta)},\qquad T_{t+1}^{sp}=880+(${fmt(v.delta)})=${fmt(v.candidate)}`)
        +equation(String.raw`T_{t+1}=879+0.2\times(${fmt(v.candidate)}-879)=${fmt(v.nextMeasured)}`)
        +note('读出这条经验','观测 → 请求动作 → 门控 → 执行设定值 → 动态响应 → 奖励与新观测。保持 a=0 只表示不改 SP，PV 仍可能继续变化。')
        +`<a class="text-link" href="#/kiln">到水泥工作台观察完整门控与延迟 →</a>`;
    }else if(kind==='probability'){
      const p=n('hard'),h=n('hard-recovery'),normal=n('normal-recovery'),v=probabilityTree(p,h,normal);
      html=`<div class="lab-stats">${stat('总体回稳概率',fmt(v.recovery,4))}${stat('难烧且未回稳',fmt(v.hardAndFailed,4))}${stat('未回稳后：难烧的概率',v.hardGivenFailed===null?'条件事件概率为 0':fmt(v.hardGivenFailed,4))}</div>`
        +table(['分支','该分支占比','条件回稳概率','对总体回稳的贡献'],[['难烧原料',fmt(p),fmt(h),fmt(p*h,4)],['正常原料',fmt(1-p),fmt(normal),fmt((1-p)*normal,4)]])
        +equation(String.raw`P(A)=${fmt(p)}\times${fmt(h,4)}+${fmt(1-p)}\times${fmt(normal,4)}=${fmt(v.recovery,4)}`)
        +note('注意条件的方向','P(未回稳 | 难烧) 与 P(难烧 | 未回稳) 是不同问题。后者还需要难烧工况原本有多常见。');
    }else if(kind==='expectation'){
      const p=n('probability'),v=binaryMoments(p,3,-2);
      html=`<div class="lab-stats">${stat('好结果贡献',fmt(v.goodContribution))}${stat('坏结果贡献',fmt(v.badContribution))}${stat('期望奖励',fmt(v.expected))}</div>`
        +bars([{label:'回稳贡献',value:v.goodContribution},{label:'未回稳贡献',value:v.badContribution,color:COLORS.orange},{label:'相加后的期望',value:v.expected,color:COLORS.blue}],'两项加权贡献与它们的和')
        +equation(String.raw`\mathbb E[R]=${fmt(p)}\times3+${fmt(1-p)}\times(-2)=${fmt(v.expected)}`)
        +note('什么时候期望变为正？','解 3p−2(1−p)>0，先展开成 5p−2>0，再得到 p>0.4。期望为正仍不表示每次都成功，更不代表质量约束满足。');
    }else if(kind==='variance'){
      const d=n('spread'),count=n('samples'),v=binaryMoments(.5,2+d,2-d);
      html=`<div class="lab-stats">${stat('期望',fmt(v.expected))}${stat('总体方差',fmt(v.variance))}${stat('总体标准差',fmt(Math.sqrt(v.variance)))}${stat('均值标准误差',fmt(Math.sqrt(v.variance/count)),'独立同分布假设')}</div>`
        +bars([{label:'结果一',value:2-d,color:COLORS.orange},{label:'结果二',value:2+d,color:COLORS.green}],'两种结果各有 50% 概率')
        +equation(String.raw`\mathrm{Var}(R)=0.5\times(-${fmt(d)})^2+0.5\times${fmt(d)}^2=${fmt(v.variance)}`)
        +note('把样本量乘四试一试','标准误差按 1/√N 缩小，所以样本数乘四才减半。增加重复样本无法自动修正偏差、时间泄漏或分布漂移。');
    }else if(kind==='discount'){
      const gamma=n('gamma'),returns=discountedReturns([-1,2,3],gamma);
      html=`<div class="lab-stats">${stat('三步回报 G₀',fmt(returns[0],4))}${stat('60 分钟后尾部价值权重',fmt(gamma**12,4),'γ¹²')}${stat('120 分钟后尾部价值权重',fmt(gamma**24,4),'γ²⁴')}${stat('总权重 / 近似有效步数',fmt(1/(1-gamma),1),'无限有界奖励、γ<1')}</div>`
        +equation(String.raw`G_0=-1+${fmt(gamma,3)}\times2+${fmt(gamma,3)}^2\times3=${fmt(returns[0],4)}`)
        +chart([{name:'尾部系数 γᵏ',values:Array.from({length:25},(_,k)=>gamma**k),color:COLORS.green}],'未来时刻之后的尾部价值权重',{xMin:0,xMax:120,xLabel:'尾部起点距现在的分钟数',yLabel:'尾部系数',min:0,max:1})
        +note('区分一条奖励与后面的尾部','60 分钟相当于 12 步，尾部价值系数为 γ¹²：γ=0.9 时约 0.282，γ=0.98 时约 0.785。60 分钟时收到的单条 Rₜ₊₁₂ 则乘 γ¹¹，因为第一条 Rₜ₊₁ 的权重是 1。提高 γ 也会提高估计难度，仍须匹配历史状态和反馈时间。');
    }else if(kind==='gradient'){
      const theta=n('theta'),rate=n('rate'),v=gradientStep(theta,rate);
      html=`<div class="lab-stats">${stat('当前预测',fmt(v.prediction))}${stat('梯度 ∂L/∂θ',fmt(v.gradient))}${stat('新参数',fmt(v.nextTheta))}${stat('损失变化',fmt(v.loss)+' → '+fmt(v.nextLoss))}</div>`
        +equation(String.raw`\nabla_\theta L=(${fmt(theta)}\times2-3)\times2=${fmt(v.gradient)}`)
        +equation(String.raw`\theta_{\rm new}=${fmt(theta)}-${fmt(rate)}\times(${fmt(v.gradient)})=${fmt(v.nextTheta)}`)
        +chart([{name:'L(θ)=½(2θ−3)²',values:Array.from({length:41},(_,i)=>.5*(2*(-1+i*.1)-3)**2),color:COLORS.green}],'当前问题的损失曲线；最低点位于 θ=1.5',{xMin:-1,xMax:3,xLabel:'参数 θ',yLabel:'平方误差'})
        +note(v.nextLoss>v.loss+1e-10?'这次走得太远了':'观察更新方向','对这个二次问题，误差在每次更新后乘以 (1−4η)。0<η<0.5 时误差幅度缩小，η=0.5 时可来回振荡，η>0.5 时可发散；这不是所有神经网络共享的学习率阈值。');
    }else if(kind==='log'){
      const old=n('old'),next=n('new'),ratio=next/old;
      html=`<div class="lab-stats">${stat('旧 log 概率',fmt(Math.log(old),4))}${stat('新 log 概率',fmt(Math.log(next),4))}${stat('概率比 ρ',fmt(ratio,4))}</div>`
        +equation(String.raw`\rho=\frac{${fmt(next)}}{${fmt(old)}}=\exp(${fmt(Math.log(next),4)}-(${fmt(Math.log(old),4)}))=${fmt(ratio,4)}`)
        +table(['策略','提高一点','保持'],[['旧策略',fmt(old),fmt(1-old)],['新策略',fmt(next),fmt(1-next)]])
        +note('概率变大，不等于动作值变大','这里一直是同一个“提高一点”的动作，只是策略更常/更少选择它。PPO 根据优势决定是否鼓励这种变化；正负优势时裁剪方向不同。')
        +`<a class="text-link" href="#/lab/ppo">再看正负优势下的 PPO 裁剪 →</a>`;
    }else{
      const u=n('u'),sigma=n('sigma'),a=Math.tanh(u),logU=-.5*(u/sigma)**2-Math.log(sigma)-.5*Math.log(2*Math.PI),logA=squashedLogProbability(u,0,sigma),logPhysical=logA-Math.log(2);
      html=`<div class="lab-stats">${stat('归一化动作 tanh(u)',fmt(a,4))}${stat('温度增量 2a',fmt(2*a,4)+'°C')}${stat('tanh 修正项',fmt(-Math.log(1-a*a),4))}</div>`
        +table(['坐标','log 密度','密度'],[['高斯 u',fmt(logU,4),fmt(Math.exp(logU),4)],['归一化 a',fmt(logA,4),fmt(Math.exp(logA),4)],['温度增量 ΔT',fmt(logPhysical,4),fmt(Math.exp(logPhysical),4)]])
        +equation(String.raw`\log p_A=\log\mathcal N(${fmt(u,2)};0,${fmt(sigma,2)}^2)-\log\bigl(1-\tanh^2(${fmt(u,2)})\bigr)\approx${fmt(logA,4)}`)
        +note('为什么三列数不同却是同一次采样','横坐标被压缩或拉伸后，密度必须相应变化才能保持区间概率。表中数值经过四舍五入；计算保留原始 tanh 结果，不能把显示的近似动作代回后要求末位完全一致。连续变量恰好取某个点的概率为 0；密度值本身不是事件概率。');
    }
    view.target.innerHTML=html;
  };
  const cleanup=view.bind(draw);
  draw();
  return cleanup;
}

