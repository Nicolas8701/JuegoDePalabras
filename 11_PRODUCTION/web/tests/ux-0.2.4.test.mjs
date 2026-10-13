import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {safePlayerName} from '../server/domain/security.mjs';

const profileSource=readFileSync(new URL('../src/game/profile.ts',import.meta.url),'utf8');
const js=ts.transpileModule(profileSource,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const profile=await import('data:text/javascript;charset=utf-8,'+encodeURIComponent(js));

test('nickname strips XSS/SQL metacharacters while retaining Ñ and accents',()=>{
 const input=`<img src=x onerror=alert(1)> '; DROP TABLE players; --`;
 const name=profile.cleanPlayerName(input);
 assert.ok(!/[<>"';=]/.test(name));
 assert.ok(!/[<>"';=]/.test(safePlayerName(input)));
 assert.equal(profile.cleanPlayerName('  Lucía   Ñ  '),'Lucía Ñ');
 assert.equal(safePlayerName('  Lucía   Ñ  '),'Lucía Ñ');
 assert.equal(profile.isValidPlayerName('Ño'),true);
 assert.equal(profile.isValidPlayerName(''),false);
 assert.equal(profile.isValidPlayerName('X'),false);
});
test('onboarding is required and stored locally; React does not inject HTML names',()=>{
 const home=readFileSync(new URL('../src/components/Home.tsx',import.meta.url),'utf8');
 const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
 assert.match(home,/profileGate/);assert.match(home,/submitProfile/);assert.match(home,/profile-trigger/);
 assert.match(app,/readPlayerName/);assert.match(app,/savePlayerName/);
 assert.doesNotMatch(home,/dangerouslySetInnerHTML/);
 assert.doesNotMatch(app,/Supabase en Netlify/);
});
test('screenshot includes every submitted guess with color marks',()=>{
 const exportSource=readFileSync(new URL('../src/game/result-export.ts',import.meta.url),'utf8');
 const result=readFileSync(new URL('../src/components/Result.tsx',import.meta.url),'utf8');
 assert.match(exportSource,/state\.myAttempts/);
 assert.match(exportSource,/attempt\.guess\[col\]/);
 assert.match(exportSource,/backgrounds\[mark\]/);
 assert.match(exportSource,/toBlob/);
 assert.match(result,/result-attempt-cell/);
 assert.match(result,/saveResultCard/);
});
test('responsive CSS bounds tiles against viewport height and width',()=>{
 const css=readFileSync(new URL('../src/styles/ux-0.2.4.css',import.meta.url),'utf8');
 assert.match(css,/--tile-max:min\(56px,7dvh\)/);
 assert.match(css,/\.game-layout\{width:min\(100%,900px\)/);
 assert.match(css,/\.keyboard\{width:min\(100%,480px\)/);
});

test('0.2.5 cleans marketing clutter and genericizes examples',()=>{const home=readFileSync(new URL('../src/components/Home.tsx',import.meta.url),'utf8');assert.doesNotMatch(home,/Ej\. Nico|E\.g\. Alex|PARTIDAS ILIMITADAS|0\.2\.4 · DEV|Sin límite diario|Elegí cómo querés jugar|2–18 caracteres:/);assert.match(home,/mode-picks/);assert.match(home,/language-choices/);assert.match(home,/PALABRA <span>ARENA<\/span>/);});
