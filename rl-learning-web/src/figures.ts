import { marked } from 'marked';
import { chapters } from './content/localized';
import { researchPages } from './research/content';
import { text as t, getLocale, type Localized } from './i18n';

export type FigureTopic = 'foundations' | 'algorithms' | 'process' | 'optimization' | 'architecture' | 'orientation';
export interface FigureRecord {
  id:string; kind:'diagram'|'illustration'; topic:FigureTopic; title:string;
  explanation:string; keywords:string[]; href:string; sourceLabel:string;
  diagram?:string; image?:string; regions?:{label:string;description:string}[];
}
const bi = (zh:string,en:string):Localized<string> => ({'zh-CN':zh,en});
export const figureTopics = ():Record<FigureTopic,string> => ({
  foundations:t('决策基础','Decision foundations'), algorithms:t('学习算法','Learning algorithms'),
  process:t('工艺与分层决策','Process & hierarchy'), optimization:t('目标与优化','Objectives & optimization'),
  architecture:t('网络与研究架构','Networks & research'), orientation:t('课程导览','Course orientation'),
});
const illustrated = [
 {id:'operations-stack',topic:'process' as const,page:'history',title:bi('运行决策：信息、目标与控制分层','Operational decisions: information, targets and control'),
  explanation:bi('把测量信息、上层设定值决策、下层跟踪控制与真实烧成过程分开看。上层输出的是受约束的目标建议，实际过程还受到惯性、扰动和下层控制影响。','Separate measurement, supervisory setpoint decisions, regulatory tracking and the physical kiln. The upper layer proposes bounded targets; inertia, disturbances and regulatory control determine the actual response.'),
  keywords:['RTO','MPC','PID','APC','SP','PV','水泥','cement','分层','hierarchy','setpoint','运行指标'],
  regions:[
   {label:'01',description:bi('底层：预热、分解、烧成和冷却组成真实物料与能量过程。示意布局不代表工程设计图。','Physical layer: preheating, calcination, burning and cooling carry material and energy. The layout is conceptual, not an engineering drawing.')},
   {label:'02',description:bi('控制层：PID/APC 跟踪设定值。改变目标温度不等于测量温度立刻改变。','Control layer: PID/APC tracks setpoints. A changed target temperature does not instantly change the measured temperature.')},
   {label:'03',description:bi('决策层：结合目标、约束和预测，给出温度或压力等运行指标的设定值建议。','Decision layer: objectives, constraints and predictions inform temperature or pressure setpoint suggestions.')},
   {label:'04',description:bi('信息层：在线测量与延迟化验有不同时间戳；只能用决策时已经可用的信息。','Information layer: online signals and delayed assays have different timestamps. Use only information available at the decision time.')},
  ]},
 {id:'evolution-search',topic:'optimization' as const,page:'evolution',title:bi('从候选轨迹到可执行的优化建议','From candidate trajectories to an executable suggestion'),
  explanation:bi('进化优化依次完成候选编码、代理模型评价、约束比较和偏好选择。它可以搜索动态轨迹；关键问题是模型可信度、计算预算和滚动执行的一致性。','Evolutionary optimization encodes candidates, evaluates surrogate predictions, compares constraint satisfaction and selects a preference. It can search dynamic trajectories; model validity, computational budget and rolling execution are the central issues.'),
  keywords:['MOEA/D','NSGA-II','Pareto','EA','NURBS','epsilon','进化','轨迹','多目标','约束','trajectory','optimization'],
  regions:[
   {label:'01',description:bi('候选：曲线卡片代表不同设定值轨迹。编码维度、平滑性和初始点决定可搜索的方案空间。','Candidates: each curve card represents a setpoint trajectory. Encoding, smoothness and the initial point define the searchable space.')},
   {label:'02',description:bi('评价：用模型估计能耗、质量与其他代价，再检查约束。预测好看并不证明真实过程可行。','Evaluation: a model predicts energy, quality and other costs before constraints are checked. Attractive predictions are not proof of physical feasibility.')},
   {label:'03',description:bi('比较：保留不同权衡的可行候选；示意曲线不是实测 Pareto 前沿，也不承载性能结论。','Comparison: retain feasible candidates with different trade-offs. The curves are not measured Pareto fronts or performance evidence.')},
   {label:'04',description:bi('执行：根据明确偏好选一个方案，通过独立门控后仅执行滚动决策的当前一步。','Execution: choose with an explicit preference, pass an independent gate, and execute only the current step of the rolling decision.')},
  ]},
 {id:'safe-agent',topic:'architecture' as const,page:'architecture',title:bi('历史编码、策略、评价网络与执行门控','History encoder, policy, critics and execution gates'),
  explanation:bi('先把过去可用的信息编码，再由策略产生增量建议；图中三个滑块对应教学子集，完整项目采用六个 CV，维度以配套正文为准。价值/成本网络负责评价，独立门控决定实际执行。网络中的节点数量为示意，具体张量与损失以配套正文和 Mermaid 为准。','Encode the available history, generate an increment suggestion, and evaluate it with value/cost critics. The three sliders represent a teaching subset; the full project has six CVs, as specified in the accompanying text. Independent gates determine execution. Node counts are illustrative; the accompanying equations and Mermaid diagrams specify tensors and losses.'),
  keywords:['Actor','Critic','SAC','TD3','TCN','history','encoder','shield','安全','门控','网络','CMDP','OAM-Net'],
  regions:[
   {label:'01',description:bi('输入：历史在线信号、动作和化验年龄；不得把未来发布的化验结果提前放入观测。','Inputs: historical signals, actions and assay age. A result released in the future cannot be included in the current observation.')},
   {label:'02',description:bi('编码：时序网络把历史窗口压缩为表示；学得的表示不自动满足 Markov 性或因果充分性。','Encoder: a temporal network compresses history. A learned representation does not automatically become Markov or causally sufficient.')},
   {label:'03',description:bi('策略与评价：三个滑块表示教学子集的有界请求增量；完整项目不限定为三个 CV。旁边的网络是评价模块概念，不是网络数量或具体算法的完整规定。','Policy and evaluation: three sliders represent bounded requested increments for the teaching subset; the full project is not limited to three CVs. The adjacent networks illustrate evaluation modules, not a complete prescription of network count or algorithm.')},
   {label:'04',description:bi('门控与过程：五层依次检查数据有效性、当前状态（含质量与氧边界）、模型可信度/OOD、变化率/曲率、绝对边界与授权。惩罚项不能代替这条执行路径。','Gates and process: the five layers check data validity, current state (including quality and oxygen), model confidence/OOD, rate/curvature, and absolute bounds/authorization. A reward penalty does not replace this path.')},
  ]},
 {id:'world-model',topic:'architecture' as const,page:'open-problems',title:bi('从真实状态分叉的短时模型推演','Short model rollouts branched from an observed state'),
  explanation:bi('用多个模型比较短期候选未来，并把不确定性带入决策。随着推演加深，误差可能累积，因此长模型轨迹不能当成新的真实试验或安全证明。','Compare short imagined futures with multiple models and carry uncertainty into the decision. Error may accumulate with rollout depth, so a long imagined trajectory is neither a new physical trial nor a safety proof.'),
  keywords:['MBPO','MOPO','world model','ensemble','uncertainty','模型','不确定性','滚动','短推演','digital twin'],
  regions:[
   {label:'01',description:bi('锚点：从真实记录中的当前状态或历史表示开始，明确数据属于哪个工况。','Anchor: start from an observed state or history representation and identify its operating regime.')},
   {label:'02',description:bi('模型组：多个预测器用于比较分歧；模型一致不等于模型都正确。','Model ensemble: compare predictions for disagreement. Agreement does not imply that all models are correct.')},
   {label:'03',description:bi('短推演：不同候选动作生成不同未来；逐渐变淡表示不确定性累积的概念，不是定量置信区间。','Short rollouts: candidate actions generate different futures. Fading illustrates accumulating uncertainty, not a numerical confidence interval.')},
   {label:'04',description:bi('选择与回到现实：综合预测目标、约束与不确定性选择建议，实际执行后再用新观测校正。','Return to reality: select using predicted objectives, constraints and uncertainty, then correct with new observations after execution.')},
  ]},
];
export function illustratedFigure(id:string):FigureRecord|undefined {
 const item=illustrated.find(x=>x.id===id);if(!item)return;
 const locale=getLocale();return {...item,kind:'illustration',title:item.title[locale],explanation:item.explanation[locale],image:`./images/${id}.webp`,href:`#/research/${item.page}`,sourceLabel:t('运行指标决策研究','Operational decision research'),regions:item.regions.map(x=>({label:x.label,description:x.description[locale]}))};
}
const chapterExplanations:Record<string,Localized<string>>={
 '01':bi('沿着观测、策略、过程响应和反馈读一圈，区分单步奖励与长期目标。结束一次教学轨迹不等于工业系统真正终止。','Follow observation, policy, process response and feedback. Distinguish immediate reward from the long-term objective; ending a teaching rollout is not necessarily physical termination.'),
 '04':bi('从当时可获得的信息判断状态是否充分；有延迟或隐变量时引入历史与状态估计，再定义动作、奖励和截断语义。','Check whether information available at the time is sufficient. Add history or state estimation for delays and hidden variables, then define actions, rewards and truncation semantics.'),
 '09':bi('函数逼近、自举和离策略学习会相互作用。回放与目标网络缓解不同问题，仍需检查价值尺度和独立评估。','Function approximation, bootstrapping and off-policy learning interact. Replay and target networks address different problems; value scales and independent evaluation still need attention.'),
 '12':bi('先采样轨迹，再计算 reward-to-go 与 baseline，最后用优势加权动作 log 概率。注意采样分布与更新目标之间的联系。','Sample a trajectory, compute reward-to-go and a baseline, then weight action log probabilities. Track the link between the sampling distribution and the update objective.'),
 '13':bi('Actor 决定动作分布，Critic 估计价值；它们交换的是学习信号，不是彼此可以无条件替代的目标。','The actor defines the action distribution and the critic estimates value. They exchange learning signals while serving different objectives.'),
 '15':bi('冻结旧策略采样数据，构造优势与概率比，再进行有限轮更新。裁剪约束的是代理目标，不能解释为每个动作的硬执行界。','Freeze the behaviour policy, construct advantages and probability ratios, then perform limited update epochs. Clipping shapes a surrogate objective; it is not a hard execution bound on each action.'),
 '17':bi('回放、双 Critic、随机 Actor 与熵温度构成 SAC 的更新回路。区分目标网络、停止梯度以及 tanh 后动作密度的坐标。','Replay, twin critics, a stochastic actor and entropy temperature form the SAC update loop. Track target networks, stopped gradients and the coordinate used for tanh-corrected densities.'),
 '18':bi('先判断动作是否影响未来，再判断可用的是历史日志还是模拟交互，最后比较离散/连续动作方法。选型之后仍要统一覆盖、约束与独立评估。','First ask whether actions affect the future, then whether you have historical logs or simulator interaction, and finally compare methods for discrete or continuous actions. Coverage, constraints and independent evaluation remain necessary after selection.'),
 '19':bi('把环境契约、基线、训练与独立测试拆开，先确认结果能被重复再解释算法效果。','Separate the environment contract, baselines, training and independent testing. Establish reproducibility before attributing an effect to the algorithm.'),
 '20':bi('把性能主张落实为相同数据、交互预算和测试工况下的比较，分别报告回报、约束与不确定性。','Compare methods under common data, interaction budgets and test regimes. Report returns, constraints and uncertainty separately.'),
 '21':bi('运行决策改变上层设定值，下层控制负责跟踪；门控、延迟反馈与奖励/成本必须沿着实际执行路径记录。','Operational decisions change supervisory setpoints while lower-level control tracks them. Record gates, delayed feedback, rewards and costs along the actual execution path.'),
 '22':bi('离线数据固定后，分布外动作的价值外推成为风险；策略限制、保守估值和独立评估承担不同职责。','With a fixed dataset, extrapolating values for unsupported actions becomes a risk. Policy restrictions, conservative values and independent evaluation play different roles.'),
 '23':bi('区分真实经验与模型生成的短轨迹，检查模型误差如何进入策略更新。增加模拟数据不自动增加现实证据。','Separate real experience from short model-generated trajectories and inspect how model errors enter policy updates. More simulated data is not automatically more physical evidence.'),
 '24':bi('将回报、约束成本和执行安全机制分开建模。期望成本约束与每一步不越界是不同要求。','Model reward, constraint costs and execution safeguards separately. Expected-cost bounds and per-step feasibility are different requirements.'),
};
function extractDiagrams(body:string):{heading:string;code:string}[]{
 let heading='';const result:{heading:string;code:string}[]=[];
 for(const token of marked.lexer(body)){if(token.type==='heading')heading=token.text;if(token.type==='code'&&token.lang?.trim()==='mermaid')result.push({heading,code:token.text});}
 return result;
}
export function getFigures():FigureRecord[]{
 const locale=getLocale();const result:FigureRecord[]=illustrated.map(x=>illustratedFigure(x.id)!);
 for(const chapter of chapters){const items=extractDiagrams(chapter.body);items.forEach((item,index)=>result.push({
  id:`chapter-${chapter.id}-diagram-${index+1}`,kind:'diagram',topic:chapter.number<5?'foundations':chapter.number>=21?'process':'algorithms',
  title:`${chapter.id} · ${item.heading||chapter.title}`,explanation:chapterExplanations[chapter.id]?.[locale]??chapter.subtitle,
  keywords:[...chapter.tags,chapter.title,'Mermaid',chapter.id],href:`#/chapter/${chapter.id}`,sourceLabel:t(`第 ${chapter.id} 章 · ${chapter.title}`,`Chapter ${chapter.id} · ${chapter.title}`),diagram:item.code,
 }));}
 for(const page of researchPages){extractDiagrams(page.body[locale]).forEach((item,index)=>result.push({
  id:`research-${page.id}-diagram-${index+1}`,kind:'diagram',topic:page.group==='optimization'||['indicators','objectives'].includes(page.id)?'optimization':page.group==='formulation'?'process':'architecture',
  title:item.heading||page.title[locale],explanation:page.summary[locale],keywords:[page.id,page.title['zh-CN'],page.title.en,'研究','research','Mermaid'],href:`#/research/${page.id}`,sourceLabel:page.title[locale],diagram:item.code,
 }));}
 for(const item of [
  {id:'journey',title:t('课程地图：从直觉到研究','Course map: from intuition to research'),description:t('课程导览插画，用来识别学习阶段。精确算法关系请看同一知识库中的 Mermaid 图解。','An orientation illustration identifying learning stages. Use the Mermaid figures in this library for exact algorithm relationships.'),href:'#/roadmap'},
  {id:'foundations',title:t('基础概念的视觉线索','Visual cues for foundational concepts'),description:t('基础课程的原创情境插画。结合状态、动作、奖励的正文定义阅读，不从画面推断数学关系。','An original scene for the foundations course. Read it alongside the definitions of state, action and reward; mathematical relations are specified in the text.'),href:'#/chapter/01'},
  {id:'industry',title:t('从模型研究到工艺决策','From modelling research to process decisions'),description:t('工业研究情境图，强调模型、运行目标与控制边界的协作。新的分层决策和策略网络图给出了进一步拆解。','A research scene linking models, operational objectives and control boundaries. The newer hierarchy and policy illustrations unpack these components.'),href:'#/research'},
 ])result.push({id:item.id,kind:'illustration',topic:'orientation',title:item.title,explanation:item.description,keywords:['导览','orientation','课程','course'],href:item.href,sourceLabel:t('课程导览','Course orientation'),image:`./images/${item.id}.webp`});
 return result;
}
