export function getFieldValue(content: string, key: string): string {
  const match = content.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return match ? match[1].trim() : '';
}

function extractSection(content: string, key: string): string[] {
  const lines = content.split('\n');
  const section: string[] = [];
  let inSection = false;

  for (const line of lines) {
    if (!inSection) {
      if (line.startsWith(`${key}:`)) {
        inSection = true;
      }
      continue;
    }

    if (/^[a-zA-Z0-9_-]+:\s*/.test(line)) {
      break;
    }

    section.push(line);
  }

  return section;
}

function countEntries(lines: string[]): number {
  return lines.filter((line) => /^\s*-\s+(?!#).+/.test(line)).length;
}

export function getTagValues(content: string): string[] {
  const lines = extractSection(content, 'tags');
  return lines
    .filter((line) => /^\s*-\s+/.test(line))
    .map((line) => line.replace(/^\s*-\s+/, '').trim())
    .filter((tag) => Boolean(tag) && !tag.startsWith('#'));
}

export function toDisplayTitle(name: string, fallbackFilename: string): string {
  const raw = name || fallbackFilename.replace(/\.yml$/, '');
  return raw.replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getStepsSection(content: string): string {
  return extractSection(content, 'steps').join('\n');
}

export function getAssertionsSection(content: string): string {
  return extractSection(content, 'assertions').join('\n');
}

export function countSteps(content: string): number {
  return countEntries(extractSection(content, 'steps'));
}

export function countAssertions(content: string): number {
  return countEntries(extractSection(content, 'assertions'));
}

export interface ParsedHunt {
  name: string;
  title: string;
  description: string;
  tags: string[];
  steps: string;
  assertions: string;
  stepCount: number;
  assertionCount: number;
}

export function parseHuntYaml(content: string, filename: string): ParsedHunt {
  const name = getFieldValue(content, 'name');
  return {
    name,
    title: toDisplayTitle(name, filename),
    description: getFieldValue(content, 'description'),
    tags: getTagValues(content),
    steps: getStepsSection(content),
    assertions: getAssertionsSection(content),
    stepCount: countSteps(content),
    assertionCount: countAssertions(content),
  };
}
