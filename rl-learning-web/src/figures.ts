import { chapters } from './content/localized';
import { researchPages } from './research/content';
import { text as t, getLocale, type Localized } from './i18n';
import { conceptPlates, localizedConceptPlate, type FigureTopic } from './concept-plates';
export type { FigureTopic } from './concept-plates';

export interface FigureRecord {
  id: string; kind: 'concept' | 'illustration'; topic: FigureTopic; title: string;
  alt: string; explanation: string; keywords: string[]; href: string; sourceLabel: string;
  image: string; width: number; height: number;
  regions?: { label: string; description: string }[];
  relationship?: string;
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
  explanation:bi('先把过去可用的信息编码，再由策略产生增量建议；图中三个滑块对应教学子集，完整项目采用六个 CV，维度以配套正文为准。价值/成本网络负责评价，独立门控决定实际执行。网络中的节点数量为示意，具体张量与损失以配套正文的公式与读图说明为准。','Encode the available history, generate an increment suggestion, and evaluate it with value/cost critics. The three sliders represent a teaching subset; the full project has six CVs, as specified in the accompanying text. Independent gates determine execution. Node counts are illustrative; the accompanying equations and reading guides specify tensors and losses.'),
  keywords:['Actor','Critic','SAC','TD3','TCN','history','encoder','shield','安全','门控','网络','CMDP','OAM-Net'],
  regions:[
   {label:'01',description:bi('输入：历史在线信号、动作和化验年龄；不得把未来发布的化验结果提前放入观测。','Inputs: historical signals, actions and assay age. A result released in the future cannot be included in the current observation.')},
   {label:'02',description:bi('编码：时序网络把历史窗口压缩为表示；学得的表示不自动满足 Markov 性或因果充分性。','Encoder: a temporal network compresses history. A learned representation does not automatically become Markov or causally sufficient.')},
   {label:'03',description:bi('策略与评价：三个滑块表示教学子集的有界请求增量；完整项目不限定为三个 CV。旁边的网络是评价模块概念，不是网络数量或具体算法的完整规定。','Policy and evaluation: three sliders represent bounded requested increments for the teaching subset; the full project is not limited to three CVs. The adjacent networks illustrate evaluation modules, not a complete prescription of network count or algorithm.')},
   {label:'04',description:bi('门控与过程：五层依次检查数据有效性、当前状态（核心 CV/PV 范围与氧边界）、模型可信度/OOD、变化率/曲率、绝对边界与授权。惩罚项不能代替这条执行路径。','Gates and process: the five layers check data validity, current state (core CV/PV ranges and oxygen limits), model confidence/OOD, rate/curvature, and absolute bounds/authorization. A reward penalty does not replace this path.')},
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
 const locale=getLocale();return {...item,kind:'illustration',title:item.title[locale],alt:item.explanation[locale],explanation:item.explanation[locale],width:1586,height:992,image:`./images/${id}.webp`,href:`#/research/${item.page}`,sourceLabel:t('运行指标决策研究','Operational decision research'),regions:item.regions.map(x=>({label:x.label,description:x.description[locale]}))};
}
export function getFigures(): FigureRecord[] {
 const locale = getLocale();
 const result: FigureRecord[] = illustrated.map(item => illustratedFigure(item.id)!);
 for (const plate of conceptPlates) {
  const figure = localizedConceptPlate(plate.id, locale)!;
  const chapter = plate.href.startsWith('#/chapter/') ? chapters.find(item => item.id === plate.href.split('/').at(-1)) : undefined;
  const page = plate.href.startsWith('#/research/') ? researchPages.find(item => item.id === plate.href.split('/').at(-1)) : undefined;
  const sourceLabel = chapter ? t(`第 ${chapter.id} 章 · ${chapter.title}`, `Chapter ${chapter.id} · ${chapter.title}`) : page ? page.title[locale] : t('课程学习路线', 'Course learning roadmap');
  result.push({ ...figure, sourceLabel });
 }
 for(const item of [
  {id:'journey',title:t('课程地图：从直觉到研究','Course map: from intuition to research'),description:t('课程导览插画，用来识别学习阶段。算法关系请结合学术概念图解下方的文字和公式阅读。','An orientation illustration identifying learning stages. Read the selectable guides and equations alongside the academic concept plates for algorithm relationships.'),href:'#/roadmap'},
  {id:'foundations',title:t('基础概念的视觉线索','Visual cues for foundational concepts'),description:t('基础课程的原创情境插画。结合状态、动作、奖励的正文定义阅读，不从画面推断数学关系。','An original scene for the foundations course. Read it alongside the definitions of state, action and reward; mathematical relations are specified in the text.'),href:'#/chapter/01'},
  {id:'industry',title:t('从模型研究到工艺决策','From modelling research to process decisions'),description:t('工业研究情境图，强调模型、运行目标与控制边界的协作。新的分层决策和策略网络图给出了进一步拆解。','A research scene linking models, operational objectives and control boundaries. The newer hierarchy and policy illustrations unpack these components.'),href:'#/research'},
 ])result.push({id:item.id,kind:'illustration',topic:'orientation',title:item.title,alt:item.description,explanation:item.description,width:1672,height:941,keywords:['导览','orientation','课程','course'],href:item.href,sourceLabel:t('课程导览','Course orientation'),image:`./images/${item.id}.webp`});
 return result;
}
