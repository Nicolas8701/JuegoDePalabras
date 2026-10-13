import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const url=relative=>new URL('../'+relative,import.meta.url);
const modes=['classic','culture','insults','blitz'];
const locales=['es','en','random'];
test('approved-source modular art has 9 WEBP runtime assets with no full-screen screenshot',()=>{
 const groups=[...modes.map(x=>'modes/'+x),...locales.map(x=>'language/'+x),'rooms/public','rooms/private'];
 let sum=0;
 for(const group of groups){
  const p='public/images/reference-crops/'+group+'.webp';
  const bytes=readFileSync(url(p));
  assert.equal(bytes.toString('ascii',0,4),'RIFF',p);
  assert.equal(bytes.toString('ascii',8,12),'WEBP',p);
  assert.ok(bytes.length>500&&bytes.length<25000,p);
  sum+=bytes.length;
 }
 assert.ok(sum<120000,'all nine small modular assets must stay below 120 KB combined');
});
test('actual runtime components reference crops, and preserve accessible native text',()=>{
 const mode=readFileSync(url('src/game/mode-presentation.ts'),'utf8');
 const lang=readFileSync(url('src/components/LanguagePicker.tsx'),'utf8');
 const home=readFileSync(url('src/components/Home.tsx'),'utf8');
 for(const item of modes)assert.ok(mode.includes('/images/reference-crops/modes/'+item+'.webp'));
 for(const item of locales)assert.ok(lang.includes('/images/reference-crops/language/'+item+'.webp'));
 for(const item of ['public','private'])assert.ok(home.includes('/images/reference-crops/rooms/'+item+'.webp'));
 assert.match(home,/aria-pressed/);assert.match(home,/role="group"/);
 assert.match(home,/type="button"/);
 assert.match(home,/PALABRA <span>ARENA<\/span>/);
 assert.doesNotMatch(home,/<img[^>]*src="\/mnt\//);
});
test('interactive image hover and keyboard focus, with reduced motion option',()=>{
 const css=readFileSync(url('src/styles/reference-crops-0.2.6.css'),'utf8');
 for(const term of [':hover',':focus-visible','prefers-reduced-motion','transform:scale(1.07)','object-fit:cover'])assert.ok(css.includes(term),term);
 const main=readFileSync(url('src/main.tsx'),'utf8');
 assert.ok(main.includes("reference-crops-0.2.6.css"));
});
