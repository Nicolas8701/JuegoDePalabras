// Content owner: server-side curated answer packs. The client receives only safe category metadata and optional thematic hint.
export const MODE_IDS = ['classic','culture','insults','blitz','duel'];
export const COUNTRIES = ['random','ar','es','us','mx','gb','cl'];
export const COUNTRY_NAMES = {
  es: {random:'Mundo aleatorio', ar:'Argentina', es:'España', us:'Estados Unidos', mx:'México', gb:'Reino Unido', cl:'Chile'},
  en: {random:'Random world', ar:'Argentina', es:'Spain', us:'United States', mx:'Mexico', gb:'United Kingdom', cl:'Chile'}
};
export function modeId(value) {return MODE_IDS.includes(value) ? value : 'classic';}
export function countryId(value) {return COUNTRIES.includes(value) ? value : 'random';}

// Plain common-noun answers, intended for humans, not generated from frequency-only scraped data.
// Each line is WORD|THEMATIC_HINT. Hints deliberately avoid giving the answer away.
const culture = {
 ar: {
  es:`mate|Infusión y costumbres;asado|Comidas y reuniones;chori|Comida popular;gaucho|Historia y tradiciones;pampa|Geografía;obelisco|Monumentos;zamba|Música y baile;tango|Música y baile;futbol|Deportes;quilmes|Lugares y costumbres;alpaca|Fauna;locro|Comidas tradicionales;malbec|Bebidas y regiones;bondi|Transporte cotidiano;fernet|Bebidas y costumbres;dulce|Gastronomía;alfajor|Gastronomía;patria|Historia;boedo|Barrios y lugares;cancha|Deportes;hincha|Deportes`,
  en:`mate|Traditional drinks;pampas|Geography;tango|Music and dance;gaucho|History and tradition;steak|Traditional food;grill|Traditional food;patagonia|Geography;football|Sports;malbec|Wine regions;river|Geography;plaza|City life;andes|Geography;condor|Wildlife;beef|Traditional food;empanada|Traditional food;latino|Regional culture;dance|Arts` },
 es: {
  es:`tapas|Gastronomía;paella|Gastronomía;torero|Tradiciones;oliva|Gastronomía;jamon|Gastronomía;sevilla|Ciudades;toledo|Ciudades;torre|Patrimonio;fiesta|Tradiciones;siesta|Tradiciones;guitarra|Música;iberico|Cultura y geografía;rioja|Regiones;queso|Gastronomía;plaza|Ciudad y sociedad;reina|Historia;castillo|Patrimonio;marino|Geografía`,
  en:`tapas|Food traditions;paella|Food traditions;olive|Food traditions;flamenco|Arts and dance;siesta|Daily life;guitar|Music;castle|Heritage;island|Geography;royal|History;iberia|Geography;orange|Food and agriculture;plaza|Public spaces;museum|Arts;Madrid|Cities;Toledo|Cities;parade|Traditions` },
 us: {
  es:`vaquero|Historia y tradiciones;parque|Lugares y naturaleza;aguila|Símbolos y fauna;dolar|Economía;beisbol|Deportes;jazz|Música;blues|Música;hollywood|Cine;rodeos|Costumbres;hamburguesa|Comidas;texas|Geografía;alaska|Geografía;playa|Geografía;rapero|Música;cine|Arte;nylon|Inventos`,
  en:`cowboy|History and traditions;burger|Food culture;dollar|Economy;baseball|Sports;basket|Sports;jazz|Music;blues|Music;hollywood|Film;rodeo|Tradition;texas|Geography;alaska|Geography;eagle|Symbols and wildlife;liberty|History;apple|Cultural symbols;route|Travel;desert|Geography;prairie|Geography;denim|Fashion;grill|Food traditions` },
 mx: {
  es:`tacos|Gastronomía;pozole|Gastronomía;elote|Gastronomía;chile|Gastronomía;mariachi|Música;charro|Tradiciones;piñata|Fiestas;agave|Agricultura;mezcal|Bebidas tradicionales;azteca|Historia;mole|Gastronomía;nopal|Flora;maiz|Agricultura;cenote|Geografía;frijol|Comida cotidiana;plaza|Ciudad;papel|Artesanía;calaca|Tradiciones;queso|Comida`,
  en:`tacos|Food traditions;nachos|Food traditions;chili|Food traditions;corn|Agriculture;agave|Agriculture;mariachi|Music;fiesta|Traditions;pinata|Festivals;aztec|History;mayan|History;cenote|Geography;desert|Geography;cactus|Flora;beans|Food traditions;mole|Food traditions;market|Everyday culture;maize|Agriculture` },
 gb: {
  es:`teatro|Arte y cultura;reina|Historia;monarca|Historia;palacio|Patrimonio;te|Bebidas;tenis|Deportes;futbol|Deportes;metro|Transporte;londres|Ciudades;gaelico|Lenguas;castillo|Patrimonio;lluvia|Clima;escocia|Geografía;gales|Geografía;isla|Geografía;pubs|Vida social;rock|Música;parque|Lugares`,
  en:`tea|Drinks;queen|History;king|History;palace|Heritage;castle|Heritage;tennis|Sports;football|Sports;london|Cities;scotland|Geography;wales|Geography;island|Geography;rain|Weather;pubs|Social life;rock|Music;beatles|Music;parliament|Government;museum|Arts;bridge|Places;thames|Geography` },
 cl: {
  es:`cueca|Música y danza;completo|Gastronomía;palta|Comida cotidiana;poeta|Literatura;andes|Geografía;atacama|Geografía;condor|Fauna;humita|Gastronomía;pebre|Gastronomía;empanada|Gastronomía;moai|Patrimonio;santiago|Ciudades;puerto|Geografía;copihue|Flora;chicha|Bebidas;feria|Comercio;cerro|Geografía;litoral|Geografía;rodeo|Tradición`,
  en:`andes|Geography;atacama|Geography;condor|Wildlife;moai|Heritage;poetry|Literature;island|Geography;desert|Geography;coast|Geography;copper|Economy;mining|Economy;volcano|Geography;earth|Geography;wine|Food culture;pacific|Geography;mountain|Geography;harbor|Geography` }
};
// 0.2.1 editorial expansion: culture-specific words, not generic word-list padding.
// The answer pool is server-side. No protected-class slurs are included.
const CULTURE_EXTRA = {
 ar: {
  es:`yerba|Infusión tradicional;termo|Objetos cotidianos;milonga|Música y baile;cuarteto|Música regional;murga|Tradiciones;subte|Transporte porteño;rosario|Ciudades;cordoba|Provincias y ciudades;salta|Provincias;jujuy|Provincias;facon|Tradición gaucha;criollo|Cultura e historia;pochoclo|Comidas y cine;parrilla|Comidas y reuniones;truco|Juegos tradicionales;choripan|Comidas populares;peña|Música y reuniones;mateada|Costumbres;folklore|Música y danza`,
  en:`asado|Food traditions;yerba|Daily traditions;rosario|Cities;cordoba|Cities;milonga|Arts and dance;subte|City transport;folklore|Traditional music;murga|Carnival traditions;jujuy|Provinces;salta|Provinces;locro|Regional cuisine;alfajor|Sweet food;mateada|Social customs;criollo|Regional heritage;chaco|Geography` },
 es: {
  es:`tortilla|Gastronomía;flamenco|Música y danza;gaita|Música tradicional;valencia|Ciudades;zarzuela|Teatro musical;canarias|Geografía;madrid|Ciudades;galicia|Regiones;ebro|Geografía;gazpacho|Gastronomía;sidra|Bebidas regionales;fabada|Gastronomía;chorizo|Gastronomía;alhambra|Patrimonio;molino|Patrimonio rural;romeria|Fiestas;cofrade|Tradiciones;fallas|Fiestas populares;segovia|Ciudades`,
  en:`madrid|Cities;valencia|Cities;galicia|Regions;canary|Geography;gaita|Music;gazpacho|Cuisine;chorizo|Cuisine;sidra|Regional drinks;flamenco|Dance and music;iberian|Geography;toledo|Cities;segovia|Cities;alhambra|Heritage;fabada|Regional food;fallas|Festivals` },
 us: {
  es:`gospel|Música;moteles|Viajes y cultura popular;surf|Deportes;nevada|Geografía;florida|Geografía;boston|Ciudades;bisonte|Fauna;granero|Paisajes rurales;pradera|Geografía;disney|Entretenimiento;rodeo|Tradiciones;rap|Música popular;miami|Ciudades;grunge|Música;country|Música;vaquera|Cultura del oeste;yankee|Historia y cultura`,
  en:`gospel|Music;grunge|Music;country|Music;miami|Cities;boston|Cities;nevada|Geography;florida|Geography;buffalo|Wildlife;mustang|Western tradition;prairie|Geography;surfer|Sport and coasts;suburb|Urban life;harlem|Places and music;gator|Wildlife;motels|Travel culture` },
 mx: {
  es:`tamales|Gastronomía;tortilla|Gastronomía;guajillo|Gastronomía;oaxaca|Regiones;yucatan|Regiones;jalisco|Regiones;puebla|Ciudades;copal|Tradiciones;sombrero|Vestimenta;canela|Gastronomía;pulque|Bebidas tradicionales;alebrije|Artesanía;jarabe|Danza popular;cacao|Agricultura;tlayuda|Gastronomía;posada|Fiestas;lucha|Deportes;calaca|Arte popular`,
  en:`tamale|Food traditions;oaxaca|Regions;yucatan|Regions;jalisco|Regions;puebla|Cities;copal|Traditions;pulque|Traditional drinks;cacao|Agriculture;sombrero|Clothing;tortilla|Food traditions;agave|Agriculture;alebrije|Folk art;posada|Festivals;jarabe|Traditional dance;tlayuda|Regional cuisine` },
 gb: {
  es:`cricket|Deportes;rugby|Deportes;oxford|Ciudades y educación;belfast|Ciudades;liverpool|Ciudades;cabina|Transporte urbano;libra|Moneda;corona|Historia y símbolos;escocia|Geografía;gales|Geografía;punk|Música;niebla|Clima;realeza|Instituciones;union|Historia;gaelico|Lenguas;ferry|Transporte;metro|Transporte`,
  en:`cricket|Sports;rugby|Sports;oxford|Places and education;belfast|Cities;cornwall|Geography;punk|Music;royalty|History;cab|City transport;pound|Currency;union|History;scouse|Regional speech;welsh|Language and culture;haggis|Food traditions;ferry|Travel;queens|History` },
 cl: {
  es:`chiloe|Geografía;mapuche|Pueblos originarios;curanto|Gastronomía;merquen|Gastronomía;pisco|Bebidas regionales;mote|Gastronomía;piure|Gastronomía;vicuña|Fauna;arauco|Geografía;valdivia|Ciudades;calama|Ciudades;quillay|Flora;alerce|Flora;trauco|Folclore;volcan|Geografía;llareta|Flora;copiapo|Ciudades;huaso|Tradición rural`,
  en:`chiloe|Geography;mapuche|Indigenous culture;curanto|Traditional cuisine;merquen|Traditional spice;pisco|Regional drinks;valdivia|Cities;calama|Cities;arauco|Geography;alerce|Flora;huaso|Rural heritage;alpaca|Wildlife;quillay|Flora;copiapo|Cities;volcano|Geography;llareta|Flora` }
};
for (const country of COUNTRIES.slice(1)) {
 for (const language of ['es','en']) culture[country][language] += `;${CULTURE_EXTRA[country][language]}`;
}

// Adult-language opt-in only. No slurs targeting protected identities.
const insults = {
 ar:{es:`boludo|Insulto coloquial;gil|Burla cotidiana;salame|Insulto cotidiano;forro|Insulto fuerte;pelotudo|Insulto coloquial;chanta|Persona engañosa;garca|Persona desleal;nabo|Burla coloquial;careta|Falsedad;goma|Burla cotidiana`,en:`jerk|Insult;idiot|Insult;moron|Insult;clown|Mocking term;loser|Mocking term;fool|Insult`},
 es:{es:`cabron|Insulto coloquial;tontaco|Burla;pringao|Burla;capullo|Insulto;memo|Burla;tonto|Burla;idiota|Insulto;chulo|Despectivo;lerdo|Burla;bobo|Burla;imbecil|Insulto`,en:`idiot|Insult;fool|Insult;wanker|Insult;jerk|Insult;loser|Insult;moron|Insult`},
 us:{es:`idiota|Insulto;bobo|Burla;torpe|Burla;necio|Burla;payaso|Burla;tarado|Insulto`,en:`idiot|Insult;jerk|Insult;moron|Insult;loser|Insult;dumbass|Insult;clown|Mocking term;stupid|Insult;nitwit|Insult;fool|Insult;dork|Mocking term`},
 mx:{es:`menso|Burla coloquial;gacho|Despectivo;baboso|Insulto;tarado|Insulto;necio|Burla;patán|Insulto;mamón|Insulto coloquial;metiche|Burla;zonzo|Burla;tonto|Burla`,en:`jerk|Insult;idiot|Insult;moron|Insult;fool|Insult;loser|Insult`},
 gb:{es:`idiota|Insulto;tarado|Insulto;necio|Burla;bobo|Burla;tonto|Burla;patán|Burla`,en:`wanker|Insult;git|Insult;prat|Insult;twit|Insult;plonker|Mocking term;tosser|Insult;numpty|Mocking term;berk|Insult;idiot|Insult;daft|Mocking term`},
 cl:{es:`weon|Insulto coloquial;fome|Despectivo;pavo|Burla;leso|Burla;gil|Burla;latero|Burla;pastel|Burla;patudo|Burla;fresco|Burla;tonto|Burla`,en:`jerk|Insult;idiot|Insult;moron|Insult;loser|Mocking term;fool|Insult`}
};

function normalize(value) {
 return String(value).trim().toLowerCase().replaceAll('ñ','\uE000').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replaceAll('\uE000','ñ');
}
function parse(raw, country, lang) {
 return String(raw || '').split(';').map(token => {
  const [original, hint = ''] = token.split('|'); const word = normalize(original);
  return {word, hint, country, language:lang};
 }).filter(item => /^[a-zñ]{4,8}$/.test(item.word));
}
const PACKS = {culture, insults};
export function getPack(mode, language, country = 'random', length = null) {
 if (!PACKS[mode]) return [];
 const lang=language==='en'?'en':'es';
 const countries = country === 'random' ? COUNTRIES.filter(c=>c!=='random') : [country];
 const seen = new Set(), result=[];
 for(const c of countries) for(const entry of parse(PACKS[mode][c]?.[lang],c,lang)) {
   if (length!==null && entry.word.length!==length) continue;
   if(seen.has(entry.word)) continue;
   seen.add(entry.word); result.push(entry);
 }
 return result;
}
export function getPackStats() {
 return Object.fromEntries(['culture','insults'].map(mode=>[mode,Object.fromEntries(['es','en'].map(lang=>[lang,Object.fromEntries(COUNTRIES.slice(1).map(c=>[c,getPack(mode,lang,c).length]))]))]));
}
