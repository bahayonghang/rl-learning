import {text as t} from './i18n';
import {escapeHtml as esc} from './html';
import {icon} from './ui';

export interface NavigationItem {
  id: string;
  label: string;
  purpose: string;
  icon: string;
}
export interface NavigationGroup {
  id: string;
  label: string;
  items: NavigationItem[];
}

/** Labels and purposes are resolved at render time, after the content edition changes. */
export function navigationGroups(): NavigationGroup[] {
  return [
    {id: 'learn', label: t('开始与学习', 'START & LEARN'), items: [
      {id: 'home', label: t('学习总览', 'Overview'), icon: 'LayoutDashboard', purpose: t('了解教程目标、内容和工具', 'Explore the tutorial, its purpose and tools')},
      {id: 'roadmap', label: t('从这里开始', 'Start here'), icon: 'Compass', purpose: t('按已有基础选择入口，安排六周或八周学习', 'Choose a path for your background and a six- or eight-week plan')},
      {id: 'curriculum', label: t('强化学习课程', 'RL curriculum'), icon: 'BookOpen', purpose: t('按先修顺序学习原理、推导、代码与练习', 'Study principles, derivations, code and exercises in prerequisite order')},
      {id: 'primer', label: t('数学准备', 'Math primer'), icon: 'Lightbulb', purpose: t('补齐概率、期望和梯度的直觉', 'Build intuition for probability, expectation and gradients')},
    ]},
    {id: 'practice', label: t('动手验证', 'PRACTICE'), items: [
      {id: 'cases', label: t('公式案例计算', 'Worked formula cases'), icon: 'Calculator', purpose: t('给定一个情景，改参数并逐步核对数值代入', 'Change inputs in a scenario and check each numerical substitution')},
      {id: 'labs', label: t('算法实验', 'Algorithm labs'), icon: 'FlaskConical', purpose: t('观察参数、采样和迭代如何改变算法行为', 'Explore how parameters, sampling and iteration affect algorithms')},
      {id: 'kiln', label: t('水泥决策工作台', 'Cement decision workbench'), icon: 'Settings2', purpose: t('综合推演设定值、过程响应、延迟化验和安全门控', 'Combine setpoint decisions, process dynamics, delayed assays and safety gates')},
    ]},
    {id: 'reference', label: t('研究与查阅', 'RESEARCH & REFERENCE'), items: [
      {id: 'research', label: t('运行指标决策研究', 'Industrial decision research'), icon: 'Telescope', purpose: t('阅读工业运行决策的建模、优化方法与证据综述', 'Read the synthesis of industrial decision models, optimization and evidence')},
      {id: 'glossary', label: t('概念与符号', 'Concepts & symbols'), icon: 'Languages', purpose: t('查询定义、数学记号及其使用条件', 'Look up definitions, notation and their assumptions')},
      {id: 'references', label: t('论文与资源', 'Papers & resources'), icon: 'FileText', purpose: t('检索原始论文、教材、官方文档和引用关系', 'Search original papers, textbooks, official documentation and citations')},
      {id: 'gallery', label: t('图解知识库', 'Visual library'), icon: 'Image', purpose: t('查看当前语言的图解、说明与配套正文', 'Explore localized figures, reading guides and related text')},
    ]},
  ];
}

export function navigationLabels(): Record<string, string> {
  return Object.fromEntries(navigationGroups().flatMap(group => group.items.map(item => [item.id, item.label])));
}

export function renderNavigation(section: string): string {
  return navigationGroups().map(group => `<div class="nav-group"><div class="nav-caption" id="nav-${group.id}">${group.label}</div><div role="group" aria-labelledby="nav-${group.id}">${group.items.map(item => `<a href="#/${item.id}" class="nav-link ${section === item.id ? 'active' : ''}" ${section === item.id ? 'aria-current="page"' : ''} title="${esc(item.purpose)}">${icon(item.icon)}<span>${item.label}</span></a>`).join('')}</div></div>`).join('');
}

/** Both shortcuts work; show the conventional hint for the visitor's platform. */
export function searchShortcut(platform: string): string {
  return /Mac|iPhone|iPad|iPod/i.test(platform) ? '⌘ K' : 'Ctrl K';
}
