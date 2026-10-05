// ReaperMapper Model 0.2 display.
// The source data are static; the displayed daily expectation is derived for the viewer's current local month.
const svg=d3.select("#us-map"), card=document.getElementById("state-card");
const today=new Date();
let stateEstimates={}, usMortalityRate=722.1, nationalDailyEstimate=null;

const names={1:"Alabama",2:"Alaska",4:"Arizona",5:"Arkansas",6:"California",8:"Colorado",9:"Connecticut",10:"Delaware",11:"District of Columbia",12:"Florida",13:"Georgia",15:"Hawaii",16:"Idaho",17:"Illinois",18:"Indiana",19:"Iowa",20:"Kansas",21:"Kentucky",22:"Louisiana",23:"Maine",24:"Maryland",25:"Massachusetts",26:"Michigan",27:"Minnesota",28:"Mississippi",29:"Missouri",30:"Montana",31:"Nebraska",32:"Nevada",33:"New Hampshire",34:"New Jersey",35:"New Mexico",36:"New York",37:"North Carolina",38:"North Dakota",39:"Ohio",40:"Oklahoma",41:"Oregon",42:"Pennsylvania",44:"Rhode Island",45:"South Carolina",46:"South Dakota",47:"Tennessee",48:"Texas",49:"Utah",50:"Vermont",51:"Virginia",53:"Washington",54:"West Virginia",55:"Wisconsin",56:"Wyoming"};

function fetchJSON(url){
 return fetch(url,{cache:"no-store"}).then(r=>{if(!r.ok) throw new Error(url+" unavailable"); return r.json();});
}
function daysInMonth(date){return new Date(date.getFullYear(),date.getMonth()+1,0).getDate();}
function deriveNationalDaily(data,seasonality,date){
 const annualBaseline=Number(data?.national?.annual_baseline?.deaths);
 const monthly=seasonality?.monthly_deaths;
 const seasonalAnnual=Number(seasonality?.annual_deaths)||monthly?.reduce((a,b)=>a+Number(b||0),0);
 const monthDeaths=Array.isArray(monthly)?Number(monthly[date.getMonth()]):NaN;
 if(Number.isFinite(annualBaseline)&&Number.isFinite(seasonalAnnual)&&seasonalAnnual>0&&Number.isFinite(monthDeaths)){
   const unrounded=annualBaseline*(monthDeaths/seasonalAnnual)/daysInMonth(date);
   return {estimate:Math.round(unrounded),unrounded};
 }
 const fallback=Number(data?.national?.estimate);
 return Number.isFinite(fallback)?{estimate:fallback,unrounded:Number(data?.national?.unrounded_daily_estimate)||fallback}:null;
}
function allocateStates(rows,nationalEstimate,nationalDeaths){
 const entries=Object.entries(rows||{}).map(([name,row])=>{
   const deaths=Number(row.final_2024_deaths);
   const raw=Number.isFinite(deaths)&&nationalDeaths>0 ? nationalEstimate*(deaths/nationalDeaths) : Number(row.estimate)||0;
   return {name,row:{...row},raw,base:Math.floor(raw),fraction:raw-Math.floor(raw)};
 });
 let remainder=nationalEstimate-entries.reduce((sum,e)=>sum+e.base,0);
 entries.sort((a,b)=>b.fraction-a.fraction||a.name.localeCompare(b.name));
 for(let i=0;i<entries.length&&remainder>0;i++,remainder--) entries[i].base+=1;
 const result={};
 for(const e of entries) result[e.name]={...e.row,estimate:e.base};
 return result;
}
function updateTodayLabel(){
 const label=document.getElementById("today-label")||document.querySelector(".hero .eyebrow");
 if(label){
   const date=today.toLocaleDateString("en-US",{month:"short",day:"numeric"}).toUpperCase();
   label.textContent="UNITED STATES · TODAY · "+date;
 }
}

updateTodayLabel();

const modelDataReady=Promise.all([
 fetchJSON("data/current.json"),
 fetchJSON("data/seasonality_2024.json").catch(err=>{console.warn(err); return null;})
]).then(([data,seasonality])=>{
 const derived=deriveNationalDaily(data,seasonality,today);
 if(!derived) throw new Error("National estimate unavailable");
 nationalDailyEstimate=derived.estimate;
 const el=document.getElementById("national-number");
 if(el){
   el.textContent=derived.estimate.toLocaleString("en-US");
   el.title=(data?.national?.precision_note||"Modeled estimate")+" Daily expectation for "+today.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})+".";
 }
 usMortalityRate=Number(data?.states?.rate_metric?.us_rate)||722.1;
 const nationalDeaths=Number(data?.states?.source?.national_deaths)||Number(seasonality?.annual_deaths)||3072666;
 stateEstimates=allocateStates(data?.states?.estimates||{},derived.estimate,nationalDeaths);
 return stateEstimates;
}).catch(err=>{console.warn(err); throw err;});

function show(d){
 const name=names[+d.id], row=stateEstimates[name];
 if(row){
   const rate=Number(row.age_adjusted_rate_2024), delta=(rate/usMortalityRate-1)*100;
   const comparison=Math.abs(delta)<0.05?'about the U.S. rate':Math.abs(delta).toFixed(1)+'% '+(delta>0?'above':'below')+' U.S. rate';
   card.innerHTML='<p class="eyebrow">STATE</p><strong class="state-name">'+name+'</strong><div class="state-stat"><b>≈ '+Number(row.estimate).toLocaleString("en-US")+'</b><span>estimated deaths today</span></div><div class="state-stat rate-stat"><b class="rate-value">'+rate.toFixed(1)+'</b><span>per 100,000 · age-adjusted</span></div><p class="state-comparison">'+comparison+'</p><p class="state-provenance">● FINAL 2024 RATE · ≈ MODELLED DAILY</p>';
 }else{
   card.innerHTML='<p class="eyebrow">STATE</p><strong>'+name+'</strong><span>Estimate loading…</span>';
 }
}
let mapMetric="rate";
function continuousMetricColor(value,values){
 const sorted=values.filter(Number.isFinite).sort((a,b)=>a-b);
 const low=d3.quantileSorted(sorted,0.02);
 const high=d3.quantileSorted(sorted,0.98);
 const t=Math.max(0,Math.min(1,(value-low)/(high-low)));
 return d3.interpolateRgbBasis(["#20211d","#3f3c31","#716044","#a17b4e","#d2a25e","#f0c878"])(t);
}
function applyMapColors(){
 const rows=Object.values(stateEstimates);
 const key=mapMetric==="rate" ? "age_adjusted_rate_2024" : "estimate";
 const values=rows.map(r=>Number(r[key])).filter(Number.isFinite);
 svg.selectAll("path.state").style("fill",d=>{
   const row=stateEstimates[names[+d.id]];
   if(!row) return "#20211d";
   const value=Number(row[key]);
   return Number.isFinite(value) ? continuousMetricColor(value,values) : "#20211d";
 });
 const detail=document.getElementById("legend-detail");
 if(detail) detail.textContent=mapMetric==="rate"
   ? "● FINAL 2024 · age-adjusted deaths per 100,000"
   : "≈ MODEL 0.2 · estimated deaths today";
 const title=document.getElementById("map-view-title");
 const subtitle=document.getElementById("map-view-subtitle");
 if(title) title.textContent=mapMetric==="rate" ? "MORTALITY RATE" : "ESTIMATED DEATHS TODAY";
 if(subtitle) subtitle.textContent=mapMetric==="rate"
   ? "2024 age-adjusted deaths per 100,000"
   : "Model 0.2 · ≈ daily deaths";
}
function setMapMetric(metric){
 mapMetric=metric;
 document.getElementById("metric-rate")?.classList.toggle("active",metric==="rate");
 document.getElementById("metric-deaths")?.classList.toggle("active",metric==="deaths");
 applyMapColors();
}
document.getElementById("metric-rate")?.addEventListener("click",()=>setMapMetric("rate"));
document.getElementById("metric-deaths")?.addEventListener("click",()=>setMapMetric("deaths"));

Promise.all([modelDataReady,fetchJSON("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json")]).then(([,us])=>{
 const states=topojson.feature(us,us.objects.states), projection=d3.geoAlbersUsa().fitExtent([[35,35],[925,555]],states); projection.scale(projection.scale()*1.35); const [px,py]=projection.translate(); projection.translate([px-72,py]); const path=d3.geoPath(projection);
 const geography=svg.append("g").attr("class","map-geography");
 geography.selectAll("path").data(states.features).join("path").attr("class","state").attr("d",path).attr("tabindex",0).attr("aria-label",d=>names[+d.id]).on("mouseenter focus click",(e,d)=>show(d));
 const reset=document.getElementById("map-reset");
 const zoom=d3.zoom().scaleExtent([1,8]).translateExtent([[-240,-240],[1200,960]]).filter(event=>{
   if(event.type==="wheel") return false;
   if(event.type==="dblclick") return false;
   if(event.type==="touchstart"||event.type==="touchmove") return event.touches && event.touches.length>=2;
   return event.pointerType!=="touch";
 }).on("zoom",event=>{
   geography.attr("transform",event.transform);
   reset?.classList.toggle("visible",event.transform.k!==1||event.transform.x!==0||event.transform.y!==0);
 });
 svg.call(zoom).on("dblclick.zoom",null);
 reset?.addEventListener("click",()=>svg.transition().duration(220).call(zoom.transform,d3.zoomIdentity));
 applyMapColors();
}).catch(()=>{card.innerHTML='<p class="eyebrow">MAP</p><strong>Map unavailable</strong><span>The geographic layer could not be loaded.</span>'});
