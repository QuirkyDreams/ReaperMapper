
// National Model 0.2 display. Data lives separately so later update jobs do not rewrite the UI.
fetch("data/current.json", {cache:"no-store"})
  .then(r=>{if(!r.ok) throw new Error("National estimate unavailable"); return r.json();})
  .then(data=>{
    const el=document.getElementById("national-number");
    if(el && Number.isFinite(data?.national?.estimate)){
      el.textContent=Number(data.national.estimate).toLocaleString("en-US");
      el.title=data.national.precision_note || "Modeled estimate";
    }
  })
  .catch(err=>console.warn(err));

const svg=d3.select("#us-map"), card=document.getElementById("state-card");
let stateEstimates={}, usMortalityRate=722.1;
const stateDataReady=fetch("data/current.json",{cache:"no-store"}).then(r=>{if(!r.ok) throw new Error("State data unavailable"); return r.json();}).then(data=>{stateEstimates=data?.states?.estimates||{}; usMortalityRate=data?.states?.rate_metric?.us_rate||722.1; return stateEstimates;});
const names={1:"Alabama",2:"Alaska",4:"Arizona",5:"Arkansas",6:"California",8:"Colorado",9:"Connecticut",10:"Delaware",11:"District of Columbia",12:"Florida",13:"Georgia",15:"Hawaii",16:"Idaho",17:"Illinois",18:"Indiana",19:"Iowa",20:"Kansas",21:"Kentucky",22:"Louisiana",23:"Maine",24:"Maryland",25:"Massachusetts",26:"Michigan",27:"Minnesota",28:"Mississippi",29:"Missouri",30:"Montana",31:"Nebraska",32:"Nevada",33:"New Hampshire",34:"New Jersey",35:"New Mexico",36:"New York",37:"North Carolina",38:"North Dakota",39:"Ohio",40:"Oklahoma",41:"Oregon",42:"Pennsylvania",44:"Rhode Island",45:"South Carolina",46:"South Dakota",47:"Tennessee",48:"Texas",49:"Utah",50:"Vermont",51:"Virginia",53:"Washington",54:"West Virginia",55:"Wisconsin",56:"Wyoming"};
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
Promise.all([stateDataReady,fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json").then(r=>{if(!r.ok) throw new Error("Map geometry unavailable"); return r.json();})]).then(([,us])=>{
 const states=topojson.feature(us,us.objects.states), projection=d3.geoAlbersUsa().fitExtent([[35,35],[925,555]],states); projection.scale(projection.scale()*1.35); const [px,py]=projection.translate(); projection.translate([px-72,py]); const path=d3.geoPath(projection);
 svg.selectAll("path").data(states.features).join("path").attr("class","state").attr("d",path).attr("tabindex",0).attr("aria-label",d=>names[+d.id]).on("mouseenter focus click",(e,d)=>show(d)); applyMapColors();
}).catch(()=>{card.innerHTML='<p class="eyebrow">MAP</p><strong>Map unavailable</strong><span>The geographic layer could not be loaded.</span>'});