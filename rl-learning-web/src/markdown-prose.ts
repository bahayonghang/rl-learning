export interface MarkdownProseBoundary {
  startsLine: boolean;
  endsLine: boolean;
}

/** Transform prose without rewriting fenced, indented or backtick-span examples. */
export function mapMarkdownProse(markdown: string, transform: (prose: string, boundary: MarkdownProseBoundary) => string): string {
  const output: string[] = [];
  let pending: string[] = [];
  let fence: { marker: string; length: number } | undefined;
  const flush = () => {
    if (!pending.length) return;
    const block = pending.join('\n');
    const runs = [...block.matchAll(/`+/g)];
    let cursor = 0;
    const pieces: string[] = [];
    const prose = (start: number, end: number) => transform(block.slice(start, end), {
      startsLine: start === 0 || block[start - 1] === '\n',
      endsLine: end === block.length || block[end] === '\n',
    });
    for (let i = 0; i < runs.length; i++) {
      const open = runs[i]!, start = open.index!;
      let escapes = 0;
      for (let p = start - 1; p >= 0 && block[p] === '\\'; p--) escapes++;
      if (escapes % 2) continue;
      const closeIndex = runs.findIndex((run, index) => index > i && run[0].length === open[0].length);
      if (closeIndex < 0) continue;
      const close = runs[closeIndex]!, end = close.index! + close[0].length;
      pieces.push(prose(cursor, start), block.slice(start, end));
      cursor = end;
      i = closeIndex;
    }
    pieces.push(prose(cursor, block.length));
    output.push(pieces.join(''));
    pending = [];
  };
  for (const line of markdown.split('\n')) {
    const delimiter = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (delimiter) {
      flush();
      const marker = delimiter[1]![0]!;
      if (!fence) fence = { marker, length: delimiter[1]!.length };
      else if (marker === fence.marker && delimiter[1]!.length >= fence.length && !delimiter[2]!.trim()) fence = undefined;
      output.push(line);
    } else if (fence || !line.trim() || /^(?: {4}|\t)/.test(line)) {
      flush();
      output.push(line);
    } else pending.push(line);
  }
  flush();
  return output.join('\n');
}
