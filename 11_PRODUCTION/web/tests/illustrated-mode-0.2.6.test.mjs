import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
test('four mode choices contain image assets and no emoji substitute',()=>{
 const modes=['classic','culture','insults','blitz'];
 const cards=read('src/components/ModeCards.tsx');
 const home=read('src/components/Home.tsx');
 for(const mode of modes){
  const path=`public/images/modes/${mode}.svg`;
  const svg=read(path);
  assert.match(svg,/<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(svg,/<(path|circle|rect)/);
  assert.ok(statSync(new URL(path,root)).size>1500);
 }
 assert.match(cards,/<img loading="lazy"/);
 assert.match(home,/featured-modes/);
 assert.doesNotMatch(home,/modeIcons|className="home-brand"/);
 assert.doesNotMatch(home,/◆/);
});
test('language and regional theme are independent configuration controls',()=>{
 const home=read('src/components/Home.tsx');
 const region=read('src/components/RegionPicker.tsx');
 const lang=read('src/components/LanguagePicker.tsx');
 assert.match(home,/<LanguagePicker language=\{language\} languageMode=\{languageMode\}/);
 assert.match(home,/<RegionPicker country=\{country\} language=\{language\}/);
 assert.match(region,/onCountry\(r\)/);
 assert.match(lang,/onLanguage\('en'\)/);
 assert.match(lang,/onLanguage\('es'\)/);
});
test('heading blocks pointer and text selection, country remains separate from flag illustrations',()=>{
 const css=read('src/styles/illustrated-0.2.6.css');
 assert.match(css,/user-select:none;-webkit-user-select:none;pointer-events:none/);
 assert.match(css,/@media\(max-width:700px\)/);
 for(const id of ['latam','english','random'])assert.match(read(`public/images/language/${id}.svg`),/<svg/);
});
