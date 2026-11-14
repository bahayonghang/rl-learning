export interface Source {
  id: string;
  title: string;
  author: string;
  year: string;
  url: string;
  note: string;
}

export interface Chapter {
  id: string;
  number: number;
  module: number;
  title: string;
  subtitle: string;
  duration: number;
  level: '入门' | '进阶' | '实践';
  prerequisites: string[];
  objectives: string[];
  tags: string[];
  lab?: string;
  body: string;
  sources: string[];
}

export interface CourseModule {
  id: number;
  title: string;
  english: string;
  description: string;
  color: string;
  icon: string;
  outcome: string;
}

export interface LabDefinition {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  chapter: string;
  icon: string;
  render: (host: HTMLElement) => void | (() => void);
}
