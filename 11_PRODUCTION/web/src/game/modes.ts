import type { Country, GameMode, Language } from '../types/api';
const countries:Record<Country,[string,string]>={
 random:['🌎 Al azar','🌎 Random world'],ar:['🇦🇷 Argentina','🇦🇷 Argentina'],es:['🇪🇸 España','🇪🇸 Spain'],
 us:['🇺🇸 Estados Unidos','🇺🇸 United States'],mx:['🇲🇽 México','🇲🇽 Mexico'],gb:['🇬🇧 Reino Unido','🇬🇧 United Kingdom'],cl:['🇨🇱 Chile','🇨🇱 Chile']
};
const modes:Record<GameMode,[string,string]>={classic:['Clásico','Classic'],culture:['Cultura general','World culture'],insults:['Insultos y jerga','Insults & slang'],blitz:['Contrarreloj','Speed round'],duel:['Duelo relámpago','Quick duel']};
export function countryLabel(id:Country,lang:Language){return countries[id]?.[lang==='es'?0:1]||String(id);}
export function modeLabel(id:GameMode,lang:Language){return modes[id]?.[lang==='es'?0:1]||String(id);}
