import type {Country,Language} from '../types/api';
import {regionNames} from '../game/mode-presentation';
const regions:Country[]=['random','ar','es','us','mx','gb','cl'];
export function RegionPicker({country,language,onCountry,isSlang}:{country:Country;language:Language;onCountry:(next:Country)=>void;isSlang:boolean}){
 const es=language==='es';
 return <div className="field-block region-field">
  <div className="field-label">{isSlang?(es?'Origen de la jerga':'Slang region'):(es?'País de la cultura':'Culture country')}</div>
  <p className="region-help">{es?'La temática es independiente del idioma de la palabra.':'The topic is independent of the answer language.'}</p>
  <div className="region-choices" role="group" aria-label={isSlang?(es?'Origen de la jerga':'Slang region'):(es?'País de la cultura':'Culture country')}>
   {regions.map(r=><button type="button" key={r} className={r===country?'selected':''} aria-pressed={r===country} onClick={()=>onCountry(r)}>{regionNames[r][es?0:1]}</button>)}
  </div>
 </div>;
}
