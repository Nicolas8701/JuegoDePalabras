
import type {Language,Mark,RoomState} from '../types/api';
import {modeLabel,countryLabel} from './modes';

const backgrounds:Record<Mark,string>={correct:'#218d70',present:'#bf9430',absent:'#343e50'};
function rounded(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string,radius=12){
 ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,radius);ctx.fill();
}
function label(ctx:CanvasRenderingContext2D,text:string,x:number,y:number,size:number,color='#ecf0ff',weight='600'|'800'='600',align:CanvasTextAlign='left'){
 ctx.font=`${weight} ${size}px system-ui,-apple-system,sans-serif`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(text,x,y);
}
function downloadBlob(blob:Blob,name:string){
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=name;a.click();window.setTimeout(()=>URL.revokeObjectURL(url),18000);
}
export function saveResultCard(state:RoomState,language:Language):void{
 const round=state.round;if(!round)return;
 const me=state.players.find(p=>p.id===state.me.id);
 const order=[...state.players].sort((a,b)=>Number(b.solved)-Number(a.solved)||Date.parse(a.solvedAt||'9999-01-01')-Date.parse(b.solvedAt||'9999-01-01'));
 const attempts=[...state.myAttempts].sort((a,b)=>a.rowIndex-b.rowIndex);
 const canvas=document.createElement('canvas');
 canvas.width=960;canvas.height=Math.max(1310,1050+order.length*46+100);
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const g=ctx.createLinearGradient(0,0,960,canvas.height);
 g.addColorStop(0,'#222243');g.addColorStop(.6,'#121829');g.addColorStop(1,'#0c121e');
 ctx.fillStyle=g;ctx.fillRect(0,0,960,canvas.height);
 rounded(ctx,66,65,828,canvas.height-130,'#161e31',25);
 label(ctx,'PALABRA ARENA',480,130,35,'#d2d1ff','800','center');
 label(ctx,modeLabel(state.room.mode||'classic',language).toUpperCase(),480,169,20,'#a7b3cf','600','center');
 label(ctx,me?.solved?(language==='es'?'¡PALABRA DESCUBIERTA!':'WORD DISCOVERED!'):(language==='es'?'RONDA FINALIZADA':'ROUND COMPLETE'),480,231,35,'#fff','800','center');
 const answer=(round.answer||'').toUpperCase();
 const answerWidth=answer.length?Math.min(88,Math.floor((760-(answer.length-1)*9)/answer.length)):68;
 const answerStart=(960-(answer.length*answerWidth+(answer.length-1)*9))/2;
 for(let i=0;i<answer.length;i++){
  const x=answerStart+i*(answerWidth+9);
  rounded(ctx,x,277,answerWidth,answerWidth,'#208d71');
  label(ctx,answer[i],x+answerWidth/2,277+answerWidth*.68,Math.round(answerWidth*.52),'#fff','800','center');
 }
 label(ctx,`${language==='es'?'Idioma':'Language'}: ${language==='es'?'Español':'English'}   ·   ${countryLabel(round.selectedCountry||state.room.country,language)}`,480,390,19,'#c7d2e9','600','center');
 label(ctx,language==='es'?'MIS INTENTOS':'MY GUESSES',115,446,23,'#b8c4df','800');
 const letters=round.wordLength;
 const edge=Math.min(70,Math.floor((720-(letters-1)*7)/letters));
 const rowStart=480;
 for(let r=0;r<round.maxAttempts;r++){
  const attempt=attempts.find(a=>a.rowIndex===r);
  const x0=(960-(letters*edge+(letters-1)*7))/2;
  for(let col=0;col<letters;col++){
   const x=x0+col*(edge+7),y=rowStart+r*75;
   const mark=attempt?.marks[col];
   rounded(ctx,x,y,edge,edge,mark?backgrounds[mark]:'#242c40',8);
   if(attempt?.guess[col])label(ctx,attempt.guess[col].toUpperCase(),x+edge/2,y+edge*.67,Math.min(35,edge*.53),'#fff','800','center');
  }
 }
 const scoreY=976;
 label(ctx,`${me?.attemptsCount||0}/${round.maxAttempts} ${language==='es'?'intentos':'guesses'}`,480,scoreY,24,'#d7def1','600','center');
 label(ctx,language==='es'?'CLASIFICACIÓN':'SCOREBOARD',116,scoreY+60,23,'#b9c4db','800');
 order.slice(0,8).forEach((p,i)=>{
  const y=scoreY+105+i*45;
  label(ctx,`#${i+1}`,125,y,22,i===0?'#f2c96d':'#a5b1cd','800');
  label(ctx,p.name.slice(0,18),194,y,22,'#f6f7ff','600');
  label(ctx,p.solved?`${p.attemptsCount} ${language==='es'?'intentos':'guesses'}`:'—',826,y,21,'#b9c4db','600','right');
 });
 label(ctx,'palabraarena',480,canvas.height-89,19,'#8493b3','600','center');
 canvas.toBlob(blob=>{
  if(!blob)return;
  const name=`palabra-arena-ronda-${round.roundNumber}.png`;
  const file=new File([blob],name,{type:'image/png'});
  if(typeof navigator.share==='function'&&navigator.canShare?.({files:[file]})){
   void navigator.share({files:[file]}).catch(()=>downloadBlob(blob,name));
  } else downloadBlob(blob,name);
 },'image/png');
}
