import { cpSync, mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';
const root = process.cwd();
const work = mkdtempSync(join(tmpdir(), 'coming-soon-demo-'));
try {
  for (const name of ['src', 'public', 'index.html', 'vite.config.ts', 'tsconfig.json', 'package.json']) cpSync(resolve(root,name), join(work,name), {recursive:true});
  symlinkSync(resolve(root,'node_modules'), join(work,'node_modules'), 'dir');
  cpSync(resolve(root,'demo/site.demo.ts'), join(work,'src/config/site.ts'));
  cpSync(resolve(root,'demo/og-image.png'), join(work,'public/og-image.png'));
  execFileSync(process.execPath, [resolve(root,'node_modules/vite/bin/vite.js'), 'build', '--base=/portfolio/interactive-under-construction/'], {cwd:work,stdio:'inherit'});
  rmSync(resolve(root,'artifacts/demo'), {recursive:true,force:true});
  cpSync(join(work,'dist'),resolve(root,'artifacts/demo'),{recursive:true});
} finally { rmSync(work,{recursive:true,force:true}); }
