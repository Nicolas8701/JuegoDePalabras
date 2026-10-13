// Nickname is presentation data, never HTML or SQL. Browser storage is optional.
export const PROFILE_STORAGE_KEY='palabra:name';
export function cleanPlayerName(input:string):string {
 const raw=typeof input==='string'?input:'';
 return raw.normalize('NFKC').replace(/[^\p{L}\p{N} ._-]/gu,'').replace(/\s+/g,' ').trim().slice(0,18).trim();
}
export function isValidPlayerName(input:string):boolean {
 return input.length>=2&&input.length<=18&&input===cleanPlayerName(input);
}
export function readPlayerName():string {
 try { const name=cleanPlayerName(localStorage.getItem(PROFILE_STORAGE_KEY)||''); return isValidPlayerName(name)?name:''; } catch { return ''; }
}
export function savePlayerName(input:string):void {
 try { localStorage.setItem(PROFILE_STORAGE_KEY,cleanPlayerName(input)); } catch { /* Private mode or storage disabled: play still works. */ }
}
