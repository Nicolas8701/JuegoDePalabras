export const WORDS = {
  es: {
    4: ['amor','azul','casa','cena','copa','dado','dedo','faro','gato','lago','luna','mano','mesa','miel','nube','pato','pelo','piso','rana','roca','rosa','sapo','taza','tren','vida'],
    5: ['abeja','acero','actor','aguja','arena','barco','cable','canto','carta','cielo','clavo','dulce','fuego','gallo','hojas','juego','llave','mango','nieve','papel','perla','plaza','queso','reloj','rueda','silla','tigre','torre','verde'],
    6: ['alarma','amable','camino','canela','centro','cereza','cometa','corona','cuadro','dragon','escudo','espuma','fuerte','grande','jardin','limite','madera','marino','moneda','objeto','piedra','planta','puente','salida','tiempo'],
    7: ['bandera','caballo','camello','caminar','campana','caracol','cascada','celeste','cerebro','chispas','corazon','cristal','desafio','galaxia','montaña','palabra','planeta','semilla','tesoros','ventana'],
    8: ['aventura','caballos','caminata','caramelo','diamante','elefante','escalera','fantasia','frontera','galaxias','granitos','mariposa','montañas','naranjas','pantalla','paraguas','pelicano','princesa','sorpresa','tableros','universo','ventanas']
  },
  en: {
    4: ['arch','bake','beam','bird','blue','boat','cake','calm','card','clay','coin','dawn','door','echo','fire','fish','game','glow','gold','hand','jump','king','lake','leaf','moon','path','rain','rock','star','wave'],
    5: ['apple','beach','bloom','brick','candy','charm','cloud','crane','dream','flame','ghost','grape','heart','honey','light','magic','metal','night','ocean','pearl','plant','pride','river','smile','sound','spark','stone','sugar','tiger','world'],
    6: ['anchor','banana','bridge','candle','castle','circle','coffee','dragon','forest','galaxy','garden','hammer','island','jungle','kitten','marble','meteor','orange','planet','puzzle','rocket','shadow','silver','spirit','spring','sunset','temple','winter'],
    7: ['balloon','blanket','captain','caramel','diamond','emerald','feather','firefly','glacier','gravity','harvest','journey','lantern','library','monster','morning','painter','pirates','rainbow','station','sunrise','thunder','whisper'],
    8: ['campfire','daylight','dinosaur','elephant','firework','football','goldfish','keyboard','mountain','notebook','painting','rainfall','sandwich','treasure','umbrella','universe']
  }
};

export const SUPPORTED_LENGTHS = [4, 5, 6, 7, 8];

export function normalizeWord(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replaceAll('ñ', '\uE000')
    .normalize('NFD')
    .replace(/[\u0300-\u0308\u030a-\u036f]/g, '')
    .replaceAll('\uE000', 'ñ')
    .replace(/[^a-zñ]/g, '');
}

export function getWordList(language, length) {
  const lang = language === 'en' ? 'en' : 'es';
  return (WORDS[lang]?.[length] ?? []).map(normalizeWord).filter((word) => word.length === length);
}

export function isAllowedGuess(language, guess) {
  const normalized = normalizeWord(guess);
  return getWordList(language, normalized.length).includes(normalized);
}

export function pickWord(language, length, random = Math.random) {
  const words = getWordList(language, length);
  if (!words.length) throw new Error(`No words configured for ${language}/${length}`);
  return words[Math.floor(random() * words.length)];
}
