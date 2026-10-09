import { getFullWordList, normalizeWord, SUPPORTED_LENGTHS } from '../data/words.mjs';
import { getPack, modeId, countryId, COUNTRIES } from '../data/modes.mjs';

export function evaluateGuess(targetInput, guessInput) {
 const target=normalizeWord(targetInput),guess=normalizeWord(guessInput);
 if(target.length!==guess.length) throw new Error('LENGTH_MISMATCH');
 const marks=Array(target.length).fill('absent'),counts=new Map();
 for(let i=0;i<target.length;i++) {
  if(guess[i]===target[i]) marks[i]='correct';
  else counts.set(target[i],(counts.get(target[i])||0)+1);
 }
 for(let i=0;i<target.length;i++) {
  if(marks[i]==='correct') continue;
  const count=counts.get(guess[i])||0;
  if(count>0){marks[i]='present';counts.set(guess[i],count-1);}
 }
 return marks;
}
export function resolveWordLength(mode,random=Math.random,allowed=SUPPORTED_LENGTHS){
 if(mode==='random') return allowed[Math.min(allowed.length-1,Math.floor(random()*allowed.length))];
 const n=Number(mode); if(!SUPPORTED_LENGTHS.includes(n)) throw new Error('INVALID_WORD_LENGTH'); return n;
}
export function chooseTarget(language,length,random=Math.random,mode='classic',country='random') {
 const pool=mode==='culture'||mode==='insults'?getPack(mode,language,country,length):getFullWordList(language,length).map(word=>({word,country:'random',hint:''}));
 if(!pool.length) {const e=new Error('NO_CONTENT_FOR_SELECTION');e.code=e.message;e.status=422;throw e;}
 return pool[Math.min(pool.length-1,Math.floor(random()*pool.length))];
}
export function resolveRoundConfig(language,lengthMode,mode='classic',country='random',random=Math.random){
 const normalizedMode=modeId(mode),normalizedCountry=countryId(country);
 const lengths=SUPPORTED_LENGTHS.filter(length=>normalizedMode==='culture'||normalizedMode==='insults' ? getPack(normalizedMode,language,normalizedCountry,length).length>0 :getFullWordList(language,length).length>0);
 const wordLength=resolveWordLength(lengthMode,random,lengths);
 let resolvedCountry=normalizedCountry;
 if((normalizedMode==='culture'||normalizedMode==='insults')&&normalizedCountry==='random'){
  const choices=COUNTRIES.slice(1).filter(c=>getPack(normalizedMode,language,c,wordLength).length>0);
  resolvedCountry=choices[Math.min(choices.length-1,Math.floor(random()*choices.length))];
 }
 const selected=chooseTarget(language,wordLength,random,normalizedMode,resolvedCountry);
 return {wordLength,targetWord:selected.word,selectedCountry:selected.country,hint:selected.hint};
}
export function validateGuess(language,length,input){
 const guess=normalizeWord(input);
 if(guess.length!==length) return {ok:false,code:'WRONG_LENGTH',guess};
 if(!/^[a-zñ]+$/.test(guess)||(language==='en'&&guess.includes('ñ')))return {ok:false,code:'INVALID_LETTERS',guess};
 // Open validation for prototyping: all well-formed guesses reach the marking algorithm.
 return {ok:true,guess};
}
