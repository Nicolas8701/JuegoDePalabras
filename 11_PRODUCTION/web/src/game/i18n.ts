import type { Language } from '../types/api';

const TEXT = {
  es: {
    subtitle: 'Palabras rápidas. Revancha inmediata.', solo: 'JUGAR SOLO', createPublic: 'CREAR PÚBLICA', createPrivate: 'CREAR PRIVADA',
    joinCode: 'UNIRSE CON CÓDIGO', publicRooms: 'SALAS PÚBLICAS', name: 'Tu nombre', code: 'Código', join: 'UNIRSE',
    language: 'Idioma', length: 'Letras', random: 'Random', noRooms: 'No hay salas esperando. Crea la primera.', refresh: 'Actualizar',
    lobby: 'Sala', copy: 'Copiar', copied: 'Copiado', ready: 'LISTO', notReady: 'NO LISTO', start: 'EMPEZAR', waiting: 'Esperando al host…',
    attempts: 'intentos', winner: 'Ganador', answer: 'Palabra', rematch: 'REVANCHA', leave: 'SALIR', solved: '¡RESUELTO!',
    notInDictionary: 'Esa palabra no está en el diccionario de esta build.', wrongLength: 'Faltan letras.', playersNotReady: 'Hay jugadores que todavía no están listos.',
    roomNotFound: 'No encontramos esa sala.', roomFull: 'La sala está llena.', genericError: 'Algo salió mal. Intenta otra vez.',
    finishWindow: 'Últimos segundos', host: 'HOST', you: 'TÚ', online: 'EN SALA', privateRoom: 'PRIVADA', publicRoom: 'PÚBLICA'
  },
  en: {
    subtitle: 'Fast words. Instant rematch.', solo: 'PLAY SOLO', createPublic: 'CREATE PUBLIC', createPrivate: 'CREATE PRIVATE',
    joinCode: 'JOIN WITH CODE', publicRooms: 'PUBLIC ROOMS', name: 'Your name', code: 'Code', join: 'JOIN',
    language: 'Language', length: 'Letters', random: 'Random', noRooms: 'No rooms waiting. Create the first one.', refresh: 'Refresh',
    lobby: 'Room', copy: 'Copy', copied: 'Copied', ready: 'READY', notReady: 'NOT READY', start: 'START', waiting: 'Waiting for host…',
    attempts: 'attempts', winner: 'Winner', answer: 'Word', rematch: 'REMATCH', leave: 'LEAVE', solved: 'SOLVED!',
    notInDictionary: 'That word is not in this build dictionary.', wrongLength: 'Not enough letters.', playersNotReady: 'Some players are not ready yet.',
    roomNotFound: 'Room not found.', roomFull: 'The room is full.', genericError: 'Something went wrong. Try again.',
    finishWindow: 'Final seconds', host: 'HOST', you: 'YOU', online: 'IN ROOM', privateRoom: 'PRIVATE', publicRoom: 'PUBLIC'
  }
} as const;

export function t(language: Language) { return TEXT[language]; }
