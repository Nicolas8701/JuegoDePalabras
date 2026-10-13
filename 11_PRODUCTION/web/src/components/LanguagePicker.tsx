import type {Language} from '../types/api';
export function LanguagePicker({language,languageMode,onLanguage,onMode}:{language:Language;languageMode:'fixed'|'random';onLanguage:(x:Language)=>void;onMode:(mode:'fixed'|'random')=>void}){
 return <div className="field-block language-field">
  <div className="field-label">{language==='es'?'Idioma de la palabra':'Answer language'}</div>
  <div className="language-choices illustrated-languages" role="group" aria-label={language==='es'?'Idioma de la palabra':'Answer language'}>
   <button type="button" className={languageMode==='fixed'&&language==='es'?'selected':''} aria-pressed={languageMode==='fixed'&&language==='es'} onClick={()=>{onMode('fixed');onLanguage('es')}}><img src="/images/language/latam.svg" alt="" aria-hidden="true"/><span>Español</span></button>
   <button type="button" className={languageMode==='fixed'&&language==='en'?'selected':''} aria-pressed={languageMode==='fixed'&&language==='en'} onClick={()=>{onMode('fixed');onLanguage('en')}}><img src="/images/language/english.svg" alt="" aria-hidden="true"/><span>English</span></button>
   <button type="button" className={languageMode==='random'?'selected':''} aria-pressed={languageMode==='random'} onClick={()=>onMode('random')}><img src="/images/language/random.svg" alt="" aria-hidden="true"/><span>{language==='es'?'Al azar':'Random'}</span></button>
  </div>
 </div>;
}
