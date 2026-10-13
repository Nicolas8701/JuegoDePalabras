import type {Country,GameMode,Language} from '../types/api';
export const primaryModes=['classic','culture','insults','blitz'] as const;
export type PrimaryMode=typeof primaryModes[number];
export const modeArt:Record<PrimaryMode,string>={
 classic:'/images/modes/classic.svg',culture:'/images/modes/culture.svg',insults:'/images/modes/insults.svg',blitz:'/images/modes/blitz.svg'
};
export const modeDescriptions:Record<PrimaryMode,[string,string]>={
 classic:['Descubrí la palabra','Find the hidden word'],
 culture:['Historia, lugares y costumbres','History, places and traditions'],
 insults:['Modismos y expresiones','Slang and expressions'],
 blitz:['Jugá contra el reloj','Race the clock']
};
export const regionNames:Record<Country,[string,string]>={
 random:['Todos los países','All countries'],ar:['Argentina','Argentina'],es:['España','Spain'],
 us:['Estados Unidos','United States'],mx:['México','Mexico'],gb:['Reino Unido','United Kingdom'],cl:['Chile','Chile']
};
