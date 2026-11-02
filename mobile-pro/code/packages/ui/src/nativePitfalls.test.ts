/**
 * Two Android bugs that the web build and the screen tests can't show,
 * found on an Android emulator. Both are easy to reintroduce, so this test
 * reads every app and package source file and rejects the patterns.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(__dirname, '..', '..', '..');

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name === 'node_modules' || e.name.startsWith('.') || e.name === 'dist') return [];
    const path = join(dir, e.name);
    if (e.isDirectory()) return sources(path);
    return e.name.endsWith('.tsx') && !e.name.endsWith('.test.tsx') ? [path] : [];
  });
}

const files = [...sources(join(ROOT, 'apps')), ...sources(join(ROOT, 'packages'))];

describe('native pitfalls', () => {
  it('scans the source', () => {
    expect(files.length).toBeGreaterThan(50);
  });

  // On Android, react-native-svg treats each <Svg> as its own document: a
  // gradient defined in one <Svg> can't fill a shape in another (web allows it).
  it('defines every SVG gradient in the same <Svg> that uses it', () => {
    const problems: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      for (const [block] of text.matchAll(/<Svg\b[\s\S]*?<\/Svg>/g)) {
        for (const [, id] of block.matchAll(/url\(#([^)]+)\)/g)) {
          if (!block.includes(`id={\`${id}\`}`) && !block.includes(`id="${id}"`) && !block.includes(`id={${id.replace(/^\$\{|\}$/g, '')}}`)) {
            problems.push(`${relative(ROOT, file)}: url(#${id})`);
          }
        }
      }
    }
    expect(problems).toEqual([]);
  });

  // Without a behavior on Android, the keyboard covers the inputs it should avoid.
  it('lets KeyboardAvoidingView work on Android too', () => {
    const problems = files.filter((f) => /behavior=\{[^}]*:\s*undefined\}/.test(readFileSync(f, 'utf8'))).map((f) => relative(ROOT, f));
    expect(problems).toEqual([]);
  });
});
