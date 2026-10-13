import type {GameMode,Language} from '../types/api';
import {modeLabel} from '../game/modes';
import {primaryModes,modeDescriptions,modeArt} from '../game/mode-presentation';
export function ModeCards({mode,language,onMode}:{mode:GameMode;language:Language;onMode:(next:GameMode)=>void}){
 return <div className="mode-picks illustrated-modes" role="group" aria-label={language==='es'?'Modo de juego':'Game mode'}>
  {primaryModes.map(key=><button key={key} type="button" data-mode={key} className={mode===key?'selected':''} aria-pressed={mode===key} onClick={()=>onMode(key)}>
   <span className="mode-illustration"><img loading="lazy" decoding="async" src={modeArt[key]} alt="" aria-hidden="true"/></span>
   <span className="mode-text"><strong>{modeLabel(key,language)}</strong><small>{modeDescriptions[key][language==='es'?0:1]}</small></span>
  </button>)}
 </div>;
}
