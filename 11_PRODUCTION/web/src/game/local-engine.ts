import packs from './local-packs.json';
import type {Country,GameMode,Language,LengthMode,Mark} from '../types/api';
export interface LocalConfig {mode:GameMode;country:Country;languageMode:'fixed'|'random';language:Language;lengthMode:LengthMode}
export interface LocalAnswer {word:string;hint:string;country:Country;language:Language}
const countries=['ar','es','us','mx','gb','cl'] as const;
export function normalizeGuess(value:string):string{
 return String(value).toLowerCase().trim().replaceAll('ñ','\uE000').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replaceAll('\uE000','ñ').replace(/[^a-zñ]/g,'');
}
export function scoreGuess(target:string,guess:string):Mark[]{
 const a=normalizeGuess(target),b=normalizeGuess(guess);if(a.length!==b.length)throw new Error('WRONG_LENGTH');
 const result:Mark[]=Array(a.length).fill('absent'),remaining=new Map<string,number>();
 for(let i=0;i<a.length;i++)if(a[i]===b[i])result[i]='correct';else remaining.set(a[i],(remaining.get(a[i])||0)+1);
 for(let i=0;i<a.length;i++){if(result[i]==='correct')continue;const n=remaining.get(b[i])||0;if(n>0){result[i]='present';remaining.set(b[i],n-1)}}
 return result;
}
export function chooseLocalAnswer(config:LocalConfig,random=Math.random):LocalAnswer {
 const language:Language=config.languageMode==='random'?(random()<.5?'es':'en'):config.language;
 const mode:'classic'|'culture'|'insults' = config.mode==='culture'||config.mode==='insults'?config.mode:'classic';
 const allowed=(config.lengthMode==='random'?[4,5,6,7,8]:[Number(config.lengthMode)]);
 const all:LocalAnswer[]=[];
 if(mode==='classic'){
  const dict=packs.classic[language] as Record<string,string[]>;
  for(const len of allowed)for(const word of dict[String(len)]||[])all.push({word,country:'random',hint:'',language});
 }else{
  const group=packs[mode][language] as Record<string,{word:string;hint:string;country:string}[]>;
  // Choose a country before a word to avoid giving larger regional packs more weight.
  const regionIds=config.country==='random'?countries:[config.country];
  const regions=regionIds.filter(c=>group[c]?.some(entry=>allowed.includes(entry.word.length)));
  if(!regions.length)throw new Error('NO_CONTENT_FOR_SELECTION');
  const region=regions[Math.min(regions.length-1,Math.floor(random()*regions.length))];
  for(const entry of group[region]||[])if(allowed.includes(entry.word.length))all.push({word:entry.word,hint:entry.hint,country:region,language});
 }
 if(!all.length)throw new Error('NO_CONTENT_FOR_SELECTION');
 return all[Math.min(all.length-1,Math.floor(random()*all.length))];
}
