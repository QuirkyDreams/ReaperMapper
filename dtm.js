let dtmRows=[],dtmTimer=null;
const slider=document.getElementById("dtm-slider"),play=document.getElementById("dtm-play");
function renderDTM(i){
 const row=dtmRows[i]; if(!row)return;
 document.getElementById("dtm-year").textContent=row.year;
 document.getElementById("dtm-deaths").textContent=Number(row.deaths).toLocaleString("en-US");
 document.getElementById("dtm-rate").textContent=Number(row.rate).toLocaleString("en-US",{minimumFractionDigits:1,maximumFractionDigits:1});
 const era=row.year<=1978?"ICD-8 era":row.year===2024?"ICD-10 era":"historical";
 document.getElementById("dtm-note").textContent=era+" · final all-cause mortality"+(row.year===1972?" · 1972 CMF uses a 50% sample weighted by 2":"");
}
function stopDTM(){if(dtmTimer){clearInterval(dtmTimer);dtmTimer=null}play.textContent="▶ PLAY";}
function rhythmIsGonnaGetYou(){
 stopDTM(); play.textContent="Ⅱ PAUSE";
 dtmTimer=setInterval(()=>{let n=Number(slider.value)+1;if(n>Number(slider.max)){stopDTM();return}slider.value=n;renderDTM(n)},650);
}
fetch("data/dtm_preview.json",{cache:"no-store"}).then(r=>r.json()).then(data=>{dtmRows=data.national;slider.max=dtmRows.length-1;renderDTM(0)}).catch(()=>{document.getElementById("dtm-note").textContent="Preview data unavailable.";});
slider.addEventListener("input",()=>{stopDTM();renderDTM(Number(slider.value))});
play.addEventListener("click",()=>dtmTimer?stopDTM():rhythmIsGonnaGetYou());
