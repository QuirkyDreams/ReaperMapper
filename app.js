
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
let stateEstimates={};
fetch("data/current.json",{cache:"no-store"}).then(r=>r.json()).then(data=>{stateEstimates=data?.states?.estimates||{};}).catch(()=>{});
const names={1:"Alabama",2:"Alaska",4:"Arizona",5:"Arkansas",6:"California",8:"Colorado",9:"Connecticut",10:"Delaware",11:"District of Columbia",12:"Florida",13:"Georgia",15:"Hawaii",16:"Idaho",17:"Illinois",18:"Indiana",19:"Iowa",20:"Kansas",21:"Kentucky",22:"Louisiana",23:"Maine",24:"Maryland",25:"Massachusetts",26:"Michigan",27:"Minnesota",28:"Mississippi",29:"Missouri",30:"Montana",31:"Nebraska",32:"Nevada",33:"New Hampshire",34:"New Jersey",35:"New Mexico",36:"New York",37:"North Carolina",38:"North Dakota",39:"Ohio",40:"Oklahoma",41:"Oregon",42:"Pennsylvania",44:"Rhode Island",45:"South Carolina",46:"South Dakota",47:"Tennessee",48:"Texas",49:"Utah",50:"Vermont",51:"Virginia",53:"Washington",54:"West Virginia",55:"Wisconsin",56:"Wyoming"};
function show(d){
 const name=names[+d.id], row=stateEstimates[name];
 if(row){
   card.innerHTML='<p class="eyebrow">STATE · ≈ MODELLED</p><strong>'+name+'</strong><span><b>≈ '+Number(row.estimate).toLocaleString("en-US")+'</b> estimated deaths today<br><small>Allocated from national Model 0.2 using '+Number(row.final_2024_deaths).toLocaleString("en-US")+' final 2024 resident deaths.</small></span>';
 }else{
   card.innerHTML='<p class="eyebrow">STATE</p><strong>'+name+'</strong><span>Estimate loading…</span>';
 }
}
fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json").then(r=>r.json()).then(us=>{
 const states=topojson.feature(us,us.objects.states), projection=d3.geoAlbersUsa().fitExtent([[35,35],[925,555]],states); projection.scale(projection.scale()*1.35); const path=d3.geoPath(projection);
 svg.selectAll("path").data(states.features).join("path").attr("class","state").attr("d",path).attr("tabindex",0).attr("aria-label",d=>names[+d.id]).on("mouseenter focus click",(e,d)=>show(d));
}).catch(()=>{card.innerHTML='<p class="eyebrow">MAP</p><strong>Map unavailable</strong><span>The geographic layer could not be loaded.</span>'});