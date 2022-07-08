//  -------------------------------------------------------------
//  author        Giga
//  project       qeeqbox/raven
//  email         gigaqeeq@gmail.com
//  description   raven
//  licensee      AGPL-3.0
//  -------------------------------------------------------------
//  contributors list qeeqbox/raven/graphs/contributors
//  -------------------------------------------------------------
//      "browser": true,
//      "commonjs": true,
//      "jquery": true
//{disable_obfuscation_compression_all}//
//{disable_obfuscation_start}//


class qb_raven_map{constructor(t){this.svg_id=t}init_all(t){this.world_type=t.world_type,this.selected_countries=t.selected_countries,this.remove_countries=t.remove_countries,this.height=t.height,this.width=t.width,this.orginal_background_color=t.backup_background_color,this.orginal_country_color=t.orginal_country_color,this.backup_background_color=t.backup_background_color,this.backup_country_color=t.orginal_country_color,this.clicked_country_color=t.clicked_country_color,this.selected_country_color=t.selected_country_color,this.global_timeout=t.global_timeout,this.global_stats_limit=t.global_stats_limit,this.db_length=t.db_length,this.live_attacks_limit=t.live_attacks_limit,this.location=t.location,this.panels=t.panels,this.disable=t.disable,this.websocket=t.websocket,this.verbose=t.verbose,this.qb_world_countries={},this.qb_world_cities={},this.qb_countries_codes={},this.qb_companies_codes=[],this.qb_ports_codes=[],this.qb_ips_codes=[],this.sensitivity=75,this.markers_queue=[],this.db=[],this.global_lock=!1,this.unknown_flag='<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAWCAYAAABKbiVHAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAEAQAABAEBy2R4jwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAF3SURBVEiJzZaxThtBEIa/XZ+hACQ7BQoSPIHlu9PpJCpQTLpQ0FDmBULDM4BEzVsg0QEvYFGlin0rZMlJZ4GgSRTT3eWyHgpAoqC6Xdn+q9UUnz7NzmhXZVn2F2gw+4wDoFGv1xdbrda/WVkMBoOFsiwLPSuB9xK4Aowxq1rrj0VRjNI0fZy6zHA4XMnz/BA4EJE1ay1BEGCMuSzL8luapg9Tk8nzPAKOgAul1DUwFpGvIrIXBMEHYHtqMpPJ5FZrncZx3H+tdbvds2azOQC2jDHrURTdTUUmSZIRMHpb63Q6/40xf0QEpdRyFa63ber3+7sisqmU+t5ut39WYThvE0CWZR3gHHiw1u4rpaQKx7kzvV4vAq6AR2AnSZL7qiznzmitT4AlrfWnMAx/ObFcZYAW8DsMwx+uIB8ydaDwwHG/plqt9kVEKg2sdxlr7eeX440ry8dqHwMCnLqCfMiMeZZxjrNMHMcbPkTA43PgI3Mlo+bpQ/4E1wl785eim/kAAAAASUVORK5CYII="/>'}async init_world(){this.spinner_on_off(!0,"[!] Initializing.."),await this.load_scripts(),$.fn.is_partially_visible=function(){try{return $(this).offset().top+$(this).outerHeight()<=$(window).scrollTop()+$(window).height()}catch(t){return!1}},this.spinner_on_off(!0,"[!] Init interface"),this.setup_task_bar(),this.setup_raven_multi_output_panel(),this.setup_raven_single_output_panel(),this.setup_raven_insert_panel(),this.setup_raven_tooltip_panel(),this.setup_raven_random_panel(),this.startup_windwos(),this.verbose&&console.log("Init qb_worldmap"),this.projection=d3.geoEquirectangular().scale(this.width/2/Math.PI).translate([this.width/2,this.height/2]).rotate([0]),this.org_scale=this.projection.scale(),this.path=d3.geoPath(this.projection).pointRadius(1.5),this.svg=d3.select(this.svg_id).append("svg").attr("height",this.height).attr("width",this.width),this.svg.call(d3.drag().on("drag",(()=>{const t=this.projection.rotate(),e=this.sensitivity/this.projection.scale();this.projection.rotate([t[0]+d3.event.dx*e]),this.svg.selectAll("path").attr("d",this.path),this.svg.selectAll(".raven-worldmap-route").attr("d",this.curved_marker)}))).call(d3.zoom().scaleExtent([1,5]).on("zoom",(()=>{this.projection.scale(this.org_scale*d3.event.transform.k),this.svg.selectAll("path").attr("d",this.path),this.svg.selectAll(".raven-worldmap-route").attr("d",this.curved_marker)}))),this.custom_curve=function(t){const e=d3.curveLinear(t);return e._context=t,e.point=function(t,e){switch(t=+t,e=+e,this._point){case 0:this._point=1,this._line?this._context.lineTo(t,e):this._context.moveTo(t,e),this.x0=t,this.y0=e;break;case 1:this._point=2;default:Math.sqrt(Math.pow(t-this.x0,2)+Math.pow(e-this.y0,2))<80?this._context.quadraticCurveTo(.5*t+.5*this.x0,.5*e+.5*this.y0,t,e):this._context.quadraticCurveTo(.5*t+.5*this.x0,.5*e+.5*this.y0-100,t,e),this.x0=t,this.y0=e}},e},this.curved_marker=d3.line().curve(this.custom_curve).x((t=>this.projection([t[0],t[1]])[0])).y((t=>this.projection([t[0],t[1]])[1])),this.q_tween_start=function(){return t=>{const e=this.getTotalLength();d3.select(this).attr("stroke-dasharray",e),d3.select(this).attr("stroke-dashoffset",d3.interpolateNumber(e,0)(t))}},this.q_tween_end=function(){return t=>{const e=this.getTotalLength();d3.select(this).attr("stroke-dasharray",e),d3.select(this).attr("stroke-dashoffset","-"+d3.interpolateNumber(0,e)(t))}},this.delay=t=>new Promise((e=>setTimeout(e,t))),this.current_time=()=>(new Date).toJSON().replace("T"," "),this.get_nested_value=(t,...e)=>{try{return e.reduce(((t,e)=>t&&t[e]),t)}catch(t){return}},this.group_by_key=(t,e)=>t.reduce((function(t,o){return t[o[e]]=t[o[e]]||0,t[o[e]]+=1,t}),{}),d3.select(window).on("resize",(t=>this.size_changed(t))),await this.fetch_data(),this.spinner_on_off(!1)}async fetch_data(){this.verbose&&console.log("Fetch countries and cities"),await Promise.all([this.qb_world_countries=topojson.feature(qb_world_countries,qb_world_countries.objects.countries).features.filter((t=>!this.remove_countries.includes(t.properties.cc))),this.qb_world_cities=qb_world_cities,this.qb_private_ips_codes=qb_private_ips_codes,this.qb_countries_codes=qb_countries_codes,this.qb_companies_codes=qb_companies_codes,this.qb_ports_codes=qb_ports_codes,this.qb_ips_codes=qb_ips_codes]).then((()=>{this.qb_countries_codes&&this.qb_world_countries?this.draw():this.verbose&&console.log("qb_world_countries and qb_countries_codes modules are needed")})).catch((t=>this.verbose&&console.log(t)))}async load_scripts(){var t=[],e=["qb_world_countries","qb_companies_codes","qb_countries_codes","qb_ips_codes","qb_world_cities","qb_ports_codes"].filter((t=>!this.disable.includes(t)));new Promise((()=>{e.forEach((e=>{void 0!==window[e]||t.includes(e)||(this.spinner_on_off(!0,"[!] Loading: "+e),$.holdReady(!0),$.getScript(this.location+"/"+e+".js",(function(){$.holdReady(!1),t.push(e)})))}))})).catch((t=>this.verbose&&console.log(t)));let o=()=>new Promise(((o,i)=>{setTimeout((()=>{var s=[];if(t.sort().toString()==e.sort().toString()){if(e.forEach((t=>{void 0!==[t]&&(this.spinner_on_off(!0,"[!] Loaded: "+t),s.push(t))})),s.sort().toString()==e.sort().toString())return this.disable.includes("qb_companies_codes")&&(window.qb_companies_codes=[]),this.disable.includes("qb_ips_codes")&&(window.qb_private_ips_codes=[],window.qb_ips_codes=[]),this.disable.includes("qb_ports_codes")&&(window.qb_ports_codes=[]),this.disable.includes("qb_world_cities")&&(window.qb_world_cities={}),o()}else i()}),100)})).catch((()=>o()));return await o(),1}draw(){this.svg.append("path").datum({type:"Sphere"}).attr("class","raven-worldmap-water").attr("d",this.path),this.svg.selectAll(".raven-worldmap-country").data(this.qb_world_countries).enter().insert("path").attr("class","raven-worldmap-country").attr("d",this.path).attr("id",(function(t){return"raven-worldmap-country-"+t.properties.cc})).on("click",(t=>{!this.disable.includes("move_to_country")&&this.move_to_country("cc",t.properties.cc,this.global_timeout,this.global_stats_limit)}))}size_changed(){try{const t=document.getElementById(this.svg_id.substring(1)).clientWidth;this.svg.attr("width",t),this.projection.translate([t/2,this.height/2]),this.svg.selectAll(".raven-worldmap-country").attr("d",this.path),this.svg.selectAll(".raven-worldmap-city").attr("d",this.path),this.svg.selectAll(".raven-worldmap-route").attr("d",this.curved_marker)}catch(t){this.verbose&&console.log(t)}}move_to_country(t,e,o,i){let s,r={},n=[];try{if("cc"===t&&(this.verbose&&console.log("move to {country}".replace("{country}",e)),null!==this.qb_world_countries&&(s=this.qb_world_countries.find((t=>t.properties.cc===e)),s&&s.properties.cc in this.qb_countries_codes&&(r=JSON.parse(JSON.stringify(this.qb_countries_codes[s.properties.cc]))))),"detect"===t){this.verbose&&console.log("move to {country}".replace("{country}",e));let t=e.split(":"),o=this.filter_by_ip(this.qb_private_ips_codes,t[0]);if(o&&"object"==typeof o){if(2===t.length){t[1]=parseInt(t[1]);let e=JSON.parse(JSON.stringify(this.qb_ports_codes.find((e=>e.p===t[1]))));e&&"object"==typeof e&&(r.p=e)}return r.i=o.i,[null,r]}if(s=this.filter_by_ip(this.qb_ips_codes,t[0]),n=this.filter_by_ip_with_info(this.qb_companies_codes,t[0]),s&&"object"==typeof s&&(s=this.qb_world_countries.find((t=>t.properties.cc===s.cc)),s&&(s.properties.cc in this.qb_countries_codes&&(r=JSON.parse(JSON.stringify(this.qb_countries_codes[s.properties.cc]))),n&&"object"==typeof n&&(r.co=n.info),2===t.length))){t[1]=parseInt(t[1]);let e=this.qb_ports_codes.find((e=>e.p===t[1]));e&&"object"==typeof e&&(r.p=e)}}if(void 0!==s&&"type"in s)return"detect_222"!==t&&(this.get_db_stats(s.properties.cc,i),$("#raven-tooltip-panel").dialog("open")),d3.transition().delay(180).duration(1e3).tween("rotate",(()=>{const t=d3.geoCentroid(s),e=d3.interpolate(this.projection.rotate(),[-t[0],-t[1]]);return t=>{this.projection.rotate(e(t)),this.svg.selectAll(".raven-worldmap-country").attr("d",this.path),this.svg.selectAll(".raven-worldmap-city").attr("d",this.path),this.svg.selectAll(".raven-worldmap-route").attr("d",this.curved_marker)}})).transition(),d3.select("#raven-worldmap-country-"+s.properties.cc).transition().duration(o).style("fill",this.clicked_country_color).transition().duration(o).style("fill",this.orginal_country_color),[s,r]}catch(t){this.verbose&&console.log(t)}return[null,null]}add_marker_by_gussing(t,e={},o=5e3,i=[]){const s=this.current_time(),r=JSON.parse(JSON.stringify(e));let n=[],a=null,l={from:t.from,to:t.to,active:!1,from_method:"",to_method:"",from_result:!1,to_result:!1,time:s};const c={from:null,to:null};try{for(const e of["from","to"])if("string"==typeof t[e]||object.from instanceof String)if(!t[e].match(/\d/)&&Object.keys(this.qb_countries_codes).length>0&&Object.keys(this.qb_world_countries).length>0)-1==t[e].indexOf(",")?t[e]in this.qb_countries_codes&&(c[e]=this.qb_countries_codes[t[e]],l[e]=c[e],c[e]=this.qb_world_countries.find((t=>t.properties.cc===c[e].cc)),c[e]=d3.geoCentroid(c[e]),c[e]={type:"Feature",geometry:{type:"Point",coordinates:[c[e][0],c[e][1]]}}):Object.keys(this.qb_world_cities).length>0&&t[e]in this.qb_world_cities?(c[e]=this.qb_world_cities[t[e]],"object"==typeof c[e]&&null!==c[e]&&(c[e].properties.cc in this.qb_countries_codes&&(delete l[e],l[e]=JSON.parse(JSON.stringify(this.qb_countries_codes[c[e].properties.cc]))),l[e].c=c[e].properties.n)):(c[e]=t[e].split(","),2===c[e].length&&c[e][1]in this.qb_countries_codes&&(c[e]=this.qb_countries_codes[c[e][1]],l[e]=c[e],c[e]=this.qb_world_countries.find((t=>t.properties.cc===c[e].cc)),c[e]=d3.geoCentroid(c[e]),c[e]={type:"Feature",geometry:{type:"Point",coordinates:[c[e][0],c[e][1]]}})),l[e+"_method"]="name";else if(t[e].match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)&&this.qb_private_ips_codes.length>0&&this.qb_ips_codes.length>0&&this.qb_companies_codes.length>0&&Object.keys(this.qb_countries_codes).length>0&&this.qb_ports_codes.length>0&&Object.keys(this.qb_world_countries).length>0){let o=t[e].split(":");c[e]=this.filter_by_ip(this.qb_ips_codes,o[0]),n=this.filter_by_ip_with_info(this.qb_companies_codes,o[0]);let i=this.filter_by_ip(this.qb_private_ips_codes,o[0]);if(i&&"object"==typeof i){if(l[e]={ip:t.from},2===o.length){o[1]=parseInt(o[1]);let t=JSON.parse(JSON.stringify(this.qb_ports_codes.find((t=>t.p===o[1]))));t&&"object"==typeof t&&(l[e].p=t)}l[e].i=i.i}else if("object"==typeof c[e]&&c[e]&&c[e].cc in this.qb_countries_codes){if(delete l[e],l[e]=JSON.parse(JSON.stringify(this.qb_countries_codes[c[e].cc])),n&&"object"==typeof n&&(l[e].co=n.info),2===o.length){o[1]=parseInt(o[1]);let t=this.qb_ports_codes.find((t=>t.p===o[1]));t&&"object"==typeof t&&(l[e].p=t)}l[e].ip=t[e],c[e]=this.qb_world_countries.find((t=>t.properties.cc===c[e].cc)),c[e]=d3.geoCentroid(c[e]),c[e]={type:"Feature",geometry:{type:"Point",coordinates:[c[e][0],c[e][1]]}}}l[e+"_method"]="ip"}else if(t[e].match(/([0-9.-]+).+?([0-9.-]+)/)&&Object.keys(this.qb_countries_codes).length>0){if(t[e]=t[e].split(","),i.includes("country-by-coordinate")){let o=this.get_country_by_coordinate(t[e][0],t[e][1]);void 0!==o&&o in this.qb_countries_codes&&(delete l[e],l[e]=JSON.parse(JSON.stringify(this.qb_countries_codes[o])))}c[e]={type:"Feature",geometry:{type:"Point",coordinates:[t[e][1],t[e][0]]}},"string"==typeof l[e]&&(l[e]={coordinates:[t[e][1],t[e][0]]}),l[e+"_method"]="coordinates"}i.includes("line")?(this.get_nested_value(c,"from","geometry","coordinates")&&(c.from.geometry.coordinates.includes(NaN)||(l.from_result=!0)),this.get_nested_value(c,"to","geometry","coordinates")&&(c.to.geometry.coordinates.includes(NaN)||(l.to_result=!0)),l.from_result&&l.to_result?(a=s+"-line-"+l.method+JSON.stringify([c.from.geometry,c.to.geometry]),this.markers_queue.includes(a)||(null===r.line.from&&(r.line.from=this.random_bg_color()),null===r.line.to&&(r.line.to=this.random_bg_color()),this.draw_line_mark(c.from,c.to,r.line.from,r.line.to,o,a),l.active=!0)):"object"==typeof l.from&&"object"==typeof l.to&&(l.active=!0,l.from_result=!0,l.to_result=!0)):i.includes("point")&&(this.get_nested_value(c,"from","geometry","coordinates")&&(c.from.geometry.coordinates.includes(NaN)||(l.from_result=!0)),l.from_result?(a=s+"-point-"+l.method+JSON.stringify([c.from.geometry]),this.markers_queue.includes(a)||(null===r.line.from&&(r.line.from=this.random_bg_color()),this.draw_point_mark(c.from,r.line.from,o,a),l.active=!0)):"object"==typeof l.from&&(l.active=!0,l.from_result=!0))}catch(t){this.verbose&&console.log(t)}return l.from_result||(l.from=t.from),l.to_result||(l.to=t.to),l}mark_a_country(t,e,o,i){this.verbose&&console.log("Go to country {country_code_3}".replace("{country_code_3}",t)),this.svg.select("#raven-worldmap-country-"+t).transition().duration(o).style("fill",e).transition().on("end",(()=>{const t=this.markers_queue.indexOf(i);t>-1&&(this.markers_queue.splice(t,1),this.verbose&&console.log(i+" was removed from markers_queue"))})).duration(o).style("fill",this.orginal_country_color)}draw_point_mark(t,e,o,i){try{"geometry"in t&&!document.hidden&&(this.markers_queue.push(i),this.svg.append("path").attr("class","raven-worldmap-point").datum([t.geometry.coordinates]).attr("d",this.curved_marker).attr("stroke",e).transition().duration(o).attr("opacity",1).transition().on("end",(()=>{const t=this.markers_queue.indexOf(i);t>-1&&(this.markers_queue.splice(t,1),this.verbose&&console.log(i+" was removed from markers_queue"))})).duration(o).attr("opacity",0).remove())}catch(t){this.verbose&&console.log(t)}}draw_line_mark(t,e,o,i,s,r){try{"geometry"in t&&"geometry"in e&&!document.hidden&&(this.markers_queue.push(r),this.svg.append("path").attr("class","raven-worldmap-route").datum([t.geometry.coordinates,e.geometry.coordinates]).attr("d",this.curved_marker).attr("stroke",o).attr("stroke-dasharray",(function(){return this.getTotalLength()})).transition().duration(s).tween("qtween",this.q_tween_start).transition().on("end",(()=>{const t=this.markers_queue.indexOf(r);t>-1&&(this.verbose&&this.markers_queue.splice(t,1),this.verbose&&console.log(r+" was removed from markers_queue"))})).attr("stroke",i).duration(s).tween("qtween",this.q_tween_end).remove())}catch(t){this.verbose&&console.log(t)}}filter_by_ip(t=[],e=""){try{if(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(e)){const o=256*(256*(256*+e.split(".")[0]+ +e.split(".")[1])+ +e.split(".")[2])+ +e.split(".")[3];return t.find((t=>t.from<=o&&t.to>=o))}}catch(t){this.verbose&&console.log(t)}}filter_by_ip_with_info(t=[],e=""){try{if(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(e)){const o=256*(256*(256*+e.split(".")[0]+ +e.split(".")[1])+ +e.split(".")[2])+ +e.split(".")[3];return t.find((t=>{const e=t.data.find((t=>o>=t.from&&o<=t.to));return!(!e||"object"!=typeof e)}))}}catch(t){this.verbose&&console.log(t)}}filter_by_key_value(t=[],e={}){try{return t.filter((t=>Object.keys(e).every((o=>e[o].toLowerCase()===t[o].toLowerCase()))))[0]}catch(t){this.verbose&&console.log(t)}return null}get_country_by_coordinate(t,e){var o=void 0;t=parseFloat(t),e=parseFloat(e);return this.qb_world_countries.some((function(i){if("MultiPolygon"==i.geometry.type)return i.geometry.coordinates.some((function(s){return s.some((function(s){let r=!1;for(let o=0,i=s.length-1;o<s.length;i=o++)s[o][1]>t!=s[i][1]>t&&e<(s[i][0]-s[o][0])*(t-s[o][1])/(s[i][1]-s[o][1])+s[o][0]&&(r=!r);return r&&(o=i.properties.cc),r}))}))})),o}random_bg_color(){const t=[0,Math.floor(256*Math.random()),255];for(let e=t.length-1;e>0;e--){const o=Math.floor(Math.random()*(e+1));[t[e],t[o]]=[t[o],t[e]]}return"#"+t.map((t=>t.toString(16).padStart(2,"0"))).join("")}spinner_on_off(t,e=""){try{t?(""!==e?(document.getElementById("raven-waiting-msg").innerHTML=e,document.getElementById("raven-waiting-msg").style.display="block"):document.getElementById("raven-waiting-msg").style.display="none",document.getElementById("raven-waiting").style.display="block",document.getElementById("raven-waiting-msg").style.display="block",document.getElementById("raven-waiting-box").style.display="block"):(document.getElementById("raven-waiting-box").style.display="none",document.getElementById("raven-waiting").style.display="none",document.getElementById("raven-waiting-msg").style.display="")}catch(t){this.verbose&&console.log(t)}}setup_raven_multi_output_panel(){if(this.panels.includes("multi-output")){$("#raven-multi-output-panel").dialog({width:500,maxWidth:500,autoOpen:!1,position:{my:"left bottom",at:"left+40 bottom-40",of:window},closeText:"",autoResize:!0,modal:!1,resizable:!1,minHeight:"auto",dialogClass:"raven-multi-output-panel",close:()=>{this.disable_enable_item_taskbar(!0,"multi-output")}});new ResizeObserver((()=>{!0===$("#raven-multi-output-panel").dialog("isOpen")&&($("#raven-multi-output-panel").is_partially_visible()||$("#raven-multi-output-panel").dialog("option","position",{my:"left bottom",at:"left+40 bottom-40",of:window,using:function(t,e){$(this).animate({top:t.top},200)}}))})).observe($("#raven-multi-output-panel")[0])}else $("#raven-multi-output-panel").hide(),this.disable_enable_item_taskbar(!1,"multi-output")}setup_raven_single_output_panel(){this.panels.includes("single-output")?$("#raven-single-output-panel").css({display:"flex"}):$("#raven-single-output-panel").hide()}setup_raven_insert_panel(){if(this.panels.includes("insert")){$("#raven-insert-panel").dialog({width:500,maxWidth:500,autoOpen:!1,position:{my:"left bottom",at:"left+40 bottom-40",of:window},closeText:"",autoResize:!0,modal:!1,resizable:!1,minHeight:"auto",dialogClass:"raven-insert-panel",close:()=>{this.disable_enable_item_taskbar(!0,"insert")}}),$("#raven-insert-result").hide(),$("body").on("click","#raven-insert-button",(()=>{this.raven_insert_button($("#raven-insert-text").val())})),$("body").on("keypress","#raven-insert-text",(t=>{if(13==t.which)return this.raven_insert_button($("#raven-insert-text").val()),!1}));new ResizeObserver((()=>{!0===$("#raven-insert-panel").dialog("isOpen")&&($("#raven-insert-panel").is_partially_visible()||$("#raven-insert-panel").dialog("option","position",{my:"left bottom",at:"left+40 bottom-40",of:window,using:function(t,e){$(this).animate({top:t.top},500)}}))})).observe($("#raven-insert-panel")[0])}else $("#raven-insert-panel").hide(),this.disable_enable_item_taskbar(!1,"insert")}setup_raven_tooltip_panel(){this.panels.includes("tooltip")?$("#raven-tooltip-panel").dialog({width:500,maxWidth:500,autoOpen:!1,position:{my:"center",at:"center",of:window},closeText:"",autoResize:!0,modal:!1,resizable:!1,minHeight:"auto",dialogClass:"raven-tooltip-panel"}):($("#raven-tooltip-panel").hide(),this.disable_enable_item_taskbar(!1,"tooltip"))}setup_raven_random_panel(){this.panels.includes("random")?($("#raven-random-panel").dialog({width:500,maxWidth:500,autoOpen:!1,position:{my:"left bottom",at:"left+40 bottom-40",of:window},closeText:"",autoResize:!0,modal:!1,resizable:!1,minHeight:"auto",dialogClass:"raven-random-panel",close:()=>{this.disable_enable_item_taskbar(!0,"random")}}),$("body").on("click",'.raven-random-panel input[type="button"]:not(#raven-random-generate-button)',(t=>{$(t.currentTarget).toggleClass("raven-random-button-active")})),$("body").on("click",".raven-random-panel #raven-random-generate-button",(()=>{let t=[];$(".raven-random-button-active").each((function(){t.push($(this).val())})),t.length>0&&""!==$("#raven-random-text").val()&&""!==$("#raven-random-timeout").val()&&""!==$("#raven-random-delay").val()&&this.random_data(parseInt($("#raven-random-text").val()),parseInt($("#raven-random-timeout").val()),parseInt($("#raven-random-delay").val()),t)}))):($("#raven-random-panel").hide(),this.disable_enable_item_taskbar(!1,"random"))}setup_task_bar(){this.panels.includes("taskbar")&&($("#taskbar-panel").dialog({position:{at:"right top",my:"right-40 top+40",of:window},closeText:"",width:"auto",autoResize:!0,modal:!1,resizable:!1,minHeight:"auto",dialogClass:"taskbar-panel"}),$("body").on("click",".taskbar-panel-body #multi-output",(()=>{$("#raven-multi-output-panel").dialog("open"),this.disable_enable_item_taskbar(!1,"multi-output")})),$("body").on("click",".taskbar-panel-body #insert",(()=>{$("#raven-insert-panel").dialog("open"),this.disable_enable_item_taskbar(!1,"insert")})),$("body").on("click",".taskbar-panel-body #random",(()=>{$("#raven-random-panel").dialog("open"),this.disable_enable_item_taskbar(!1,"random"),$("#raven-random-text").val("25"),$("#raven-random-timeout").val("1000"),$("#raven-random-delay").val("500")})),$("body").on("click",".taskbar-panel-body #reset",(async()=>{this.spinner_on_off(!0,"Resetting interface"),this.global_lock=!0,this.db=[],await this.delay(2e3),this.reset_everything(),this.global_lock=!1,this.spinner_on_off(!1)})),$("#global-country-color").on("input",(()=>{const t=$("#global-country-color").val();this.orginal_country_color=t,$("path[id^='raven-worldmap-country']").each((function(){$(this).css({fill:t,stroke:"#313131"})}))})),$("#global-background-color").on("input",(()=>{const t=$("#global-background-color").val();$("body").css({"background-color":t}),$(".raven-worldmap-water").css({fill:t,stroke:t})})),$("#sun-style").on("click",(()=>{this.change_color("#AE9C86","#C4E4ED")})),$("#moon-style").on("click",(()=>{this.change_color("#666666","#252525")})),$("#half-moon-style").on("click",(()=>{this.change_color("#494949","#252525")})),$("#global-background-color").val(this.orginal_background_color),$("#global-country-color").val(this.orginal_country_color),this.disable_enable_item_taskbar(!0,"random"),this.disable_enable_item_taskbar(!0,"multi-output"),this.disable_enable_item_taskbar(!0,"insert"),this.panels.includes("logo")||($("#qeeqbox-logo").remove(),$("#qeeqbox-logo-separator").remove()))}change_color(t,e){this.orginal_country_color=t,$("path[id^='raven-worldmap-country']").each((function(){$(this).css({fill:t,stroke:"#313131"})})),this.orginal_background_color=e,$("body").css({"background-color":e}),$(".raven-worldmap-water").css({fill:e,stroke:e}),$("#global-background-color").val(this.orginal_background_color),$("#global-country-color").val(this.orginal_country_color)}startup_windwos(){}reset_everything(){this.panels.includes("insert")&&$("#raven-insert-panel").dialog("close"),this.panels.includes("insert")&&$("#raven-insert-text").val(""),this.panels.includes("insert")&&$("#raven-insert-result").hide(),this.panels.includes("multi-output")&&$("#raven-multi-output-panel-body-table").html(""),this.panels.includes("multi-output")&&$("#raven-multi-output-panel").dialog("close"),this.panels.includes("single-output")&&$("#raven-single-output-panel-body").html(""),this.panels.includes("random")&&$("#raven-random-panel").dialog("close"),$("#global-background-color").val(this.backup_background_color),$("#global-country-color").val(this.backup_country_color);const t=$("#global-country-color").val();this.orginal_country_color=t,$("path[id^='raven-worldmap-country']").each((function(){$(this).css({fill:t,stroke:"#313131"})}));const e=$("#global-background-color").val();this.orginal_background_color=e,$("body").css({"background-color":e}),$(".raven-worldmap-water").css({fill:e,stroke:e})}disable_enable_item_taskbar(t,e){try{if(this.panels.includes("taskbar")){if(t)switch(e){case"single-output":$(".taskbar-panel-body").prepend('<div id="single-output" ><i class="fa fa-single-table" aria-hidden="true"></i></div>');break;case"multi-output":$(".taskbar-panel-body").prepend('<div id="multi-output" ><i class="fa fa-table" aria-hidden="true"></i></div>');break;case"insert":$(".taskbar-panel-body").prepend('<div id="insert" ><i class="fa fa-pencil-square-o" aria-hidden="true"></i></div>');break;case"random":$(".taskbar-panel-body").prepend('<div id="random" ><i class="fa fa-random" aria-hidden="true"></i></div>');break;case"setting":$(".taskbar-panel-body").append('<div id="setting" ><i class="fa fa-cog" aria-hidden="true"></i></div>')}else $(".taskbar-panel-body #"+e).remove();window.addEventListener("resize",(()=>{$("#taskbar-panel").dialog("option","position",{at:"right top",my:"right-40 top+40",of:window})})),$("#taskbar-panel").dialog("option","position",{at:"right top",my:"right-40 top+40",of:window})}}catch(t){this.verbose&&console.log(t)}}raven_insert_button(t){const e=this.move_to_country("detect",t,2e3);let o="";e[1]&&"{}"!==JSON.stringify(e[1])?("f"in e[1]&&""!==e[1].f&&(o+='<img src="data:image/png;base64,'+e[1].f+'"/>'),"n"in e[1]&&""!==e[1].n&&(o+="Country: "+e[1].n+"<br>"),"co"in e[1]&&""!==e[1].co&&(o+="Whois: "+e[1].co+"<br>"),"i"in e[1]&&""!==e[1].i&&(o+="Private IP: "+e[1].i+"<br>"),"p"in e[1]&&(o+="Port info: "+e[1].p.n+" "+e[1].p.p+"/"+e[1].p.t),$("#raven-insert-result").html(o),$("#raven-insert-result").show()):($("#raven-insert-result").html("Unknown, please insert valid input"),$("#raven-insert-result").hide())}add_to_db(t){this.db.length>this.db_length&&this.db.shift(),this.db.push(t)}add_to_data_to_table(t,e,o,i=[],s=null){let r=!1,n={};try{if(n=this.add_marker_by_gussing(t,e,o,i),"active"in n)if(n.from_result||n.to_result){const t="⮕",e={from:{flag:this.unknown_flag,info:[]},to:{flag:this.unknown_flag,info:[]}};i.includes("multi-output")&&$("#raven-multi-output-panel-body-table").children().length>this.live_attacks_limit&&$("#raven-multi-output-panel-body-table .country-row:first").remove(),["from","to"].forEach((t=>{let o=!0;if("object"==typeof n[t]&&null!==n[t]){if("f"in n[t]&&""!==n[t].f&&(e[t].flag='<img src="data:image/png;base64,'+n[t].f+'"/>'),s&&s[t]){o=!1;for(const[o,i]of Object.entries(s[t]))e[t].info.push(o+": "+i)}o&&("ip"in n[t]&&""!==n[t].ip&&e[t].info.push("IP: "+n[t].ip),"i"in n[t]&&""!==n[t].i&&e[t].info.push("Private IP: "+n[t].i),"p"in n[t]&&e[t].info.push("Port info: "+n[t].p.n+" "+n[t].p.p+"/"+n[t].p.t),"co"in n[t]&&""!==n[t].co&&e[t].info.push("Whois: "+n[t].co),"c"in n[t]&&""!==n[t].c&&e[t].info.push("City: "+n[t].c),"n"in n[t]&&""!==n[t].n&&e[t].info.push("Country: "+n[t].n),"coordinates"in n[t]&&2==n[t].coordinates.length&&(e[t].info.push("Latitude: "+n[t].coordinates[0]),e[t].info.push("Longitude: "+n[t].coordinates[1])))}else e[t].info.push("Unknown: "+n[t])})),n.from_result&&n.to_result?(i.includes("multi-output")&&$("#raven-multi-output-panel-body-table").append('<div class="country-row"><div class="time">'+n.time+'</div><div class="country-flag">'+e.from.flag+'</div><div class="country-info">'+e.from.info.join("<br>")+'</div><div class="action">'+t+'</div><div class="country-flag">'+e.to.flag+'</div><div class="country-info">'+e.to.info.join("<br>")+"</div></div>"),i.includes("single-output")&&$("#raven-single-output-panel-body").html('<div class="country-row"><div class="time">'+n.time+'</div><div class="country-flag">'+e.from.flag+'</div><div class="country-info-full-width">'+e.from.info.join("<br>")+'</div><div class="action">'+t+'</div><div class="country-flag">'+e.to.flag+'</div><div class="country-info-full-width">'+e.to.info.join("<br>")+"</div></div>")):n.from_result&&!n.to_result&&(i.includes("multi-output")&&$("#raven-multi-output-panel-body-table").append('<div class="country-row"><div class="time">'+n.time+'</div><div class="country-flag">'+e.from.flag+'</div><div class="country-info">'+e.from.info.join("<br>")+"</div></div>"),i.includes("single-output")&&$("#raven-single-output-panel-body").html('<div class="country-row"><div class="time">'+n.time+'</div><div class="country-flag">'+e.from.flag+'</div><div class="country-info-full-width">'+e.from.info.join("<br>")+"</div></div>")),"object"==typeof n.from&&null!==n.from&&"object"==typeof n.to&&null!==n.to&&"n"in n.from&&"n"in n.to&&""!==n.from.n&&""!==n.to.n&&(r=!0)}else this.verbose&&console.log("Something wrong..",n)}catch(t){this.verbose&&console.log(t)}return r}fetch_data_from_server(){var t=!1,e=()=>{var e=new WebSocket(this.websocket.server);return new Promise(((o,i)=>{e.onopen=()=>{o(t=!0)},e.onmessage=t=>{try{JSON.parse(t.data).forEach((t=>{"table"==t.function?this.add_to_data_to_table(t.object,t.color,t.timeout,t.options,t.custom):"marker"==t.function&&this.add_marker_by_gussing(t.object,t.color,t.timeout,t.options)}))}catch(t){this.verbose&&console.log(t)}},e.onerror=e=>{t=!1,i(e)},e.onclose=e=>{t=!1,i(e)}})).catch((t=>this.verbose&&console.log(t)))};setInterval((()=>{t||e()}),this.websocket.request_timeout)}async random_data(t,e,o,i){$("#raven-multi-output-panel-body-table").html("");const s=Object.keys(this.qb_world_cities).length,r=this.qb_world_countries.length,n=i.length,a=["20","21","22","23","25","53","80","110","123","443","3389","5900"];for(let l=0;l<t;l++)if(this.global_lock)this.verbose&&console.log("interface is not visable");else{let t=null,l=null;const c=i[Math.floor(Math.random()*n)],d=this.random_bg_color();if("Countries"===c)t=this.qb_world_countries[Math.floor(Math.random()*r)].properties.cc,l=this.qb_world_countries[Math.floor(Math.random()*r)].properties.cc,t&&l&&t!==l&&!t.includes("-99")&&!l.includes("-99")&&this.add_to_data_to_table({from:t,to:l},{line:{from:d,to:d},country:{from:d,to:d}},e,["line","multi-output","single-output"]);else if("Cities"===c){const t=Object.keys(this.qb_world_cities)[Math.floor(Math.random()*s)],o=Object.keys(this.qb_world_cities)[Math.floor(Math.random()*s)];t&&o&&t!==o&&this.add_to_data_to_table({from:t,to:o},{line:{from:d,to:d},country:{from:d,to:d}},e,["line","multi-output","single-output"])}else if("IPs"===c){const o=[Math.floor(256*Math.random()),Math.floor(256*Math.random()),Math.floor(256*Math.random()),Math.floor(256*Math.random())],i=[Math.floor(256*Math.random()),Math.floor(256*Math.random()),Math.floor(256*Math.random()),Math.floor(256*Math.random())],s=a[Math.floor(Math.random()*a.length)];t=o.join("."),l=i.join("."),t&&l&&t!==l&&this.add_to_data_to_table({from:t,to:l+":"+s},{line:{from:d,to:d},country:{from:d,to:d}},e,["line","multi-output","single-output"])}else"Coordinates"===c&&(t=[360*Math.random()-180,360*Math.random()-180],l=[360*Math.random()-180,360*Math.random()-180],t&&l&&t!==l&&this.add_to_data_to_table({from:t,to:l},{line:{from:d,to:d},country:{from:d,to:d}},e,["line","multi-output","single-output"]));await this.delay(o)}}}