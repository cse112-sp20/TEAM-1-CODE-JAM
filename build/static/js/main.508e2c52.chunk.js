(this.webpackJsonpchrome_extension_react=this.webpackJsonpchrome_extension_react||[]).push([[0],{16:function(e,a,t){},27:function(e,a,t){e.exports=t(43)},32:function(e,a,t){},33:function(e,a,t){},38:function(e,a,t){},39:function(e,a,t){},40:function(e,a,t){},41:function(e,a,t){},43:function(e,a,t){"use strict";t.r(a);var n=t(0),c=t.n(n),r=t(23),l=t.n(r),o=(t(32),t(3)),s=t(4),m=t(6),i=t(5),u=t(11),d=t(10),v=t(14),f=t(8),h=t.n(f),p=(t(16),t(33),function(e){Object(m.a)(t,e);var a=Object(i.a)(t);function t(e){var n;return Object(o.a)(this,t),(n=a.call(this,e)).componentDidMount=function(){h.a.AutoInit(),n.setupButtonListener()},n.getEmail=function(e){chrome.runtime.sendMessage({for:"background",message:"get email"},(function(a){e(a.email)}))},n.setHeaderEmail=function(e){document.querySelector("#insertEmail").textContent=e.substr(0,e.indexOf("@"))},n.setupButtonListener=function(){document.querySelector("#createButton").addEventListener("click",n.onCreateTeam),document.querySelector("#joinButton").addEventListener("click",n.onJoinTeam)},n.onCreateTeam=function(){var e=document.querySelector("#teamName").value;if(""!==e){var a={for:"background",message:"create team",teamName:e},t=Object(v.a)(n);chrome.runtime.sendMessage(a,(function(e){console.log(e),chrome.storage.local.set({prevTeam:e}),t.props.history.push("/")}))}else h.a.toast({html:"Team name cannot be empty!",displayLength:2e3})},n.onJoinTeam=function(){var e=document.querySelector("#teamCode").value;if(5==e.length){if(/^[A-Z0-9]+$/i.test(e)){var a={for:"background",message:"join team",teamCode:e.toUpperCase()};chrome.runtime.sendMessage(a,(function(a){if("team code not found"!==a)return"success"===a?(chrome.storage.local.set({prevTeam:e}),void n.props.history.push("/")):void("already joined the group"!==a||h.a.toast({html:"You have already joined this group",displayLength:2e3}));h.a.toast({html:"Team code does not exist!",displayLength:2e3})}))}else h.a.toast({html:"Team code should only contains alphabets and numbers",displayLength:2e3})}else h.a.toast({html:"Team code should be 5 characters!",displayLength:2e3})},n.state={},n}return Object(s.a)(t,[{key:"render",value:function(){return c.a.createElement("div",null,c.a.createElement("div",{className:"row"},c.a.createElement("div",{className:"col s12"},c.a.createElement("ul",{className:"tabs"},c.a.createElement("li",{className:"tab col s6"},c.a.createElement("a",{className:"active",href:"#createTeam"},"Create Team")),c.a.createElement("li",{className:"tab col s6"},c.a.createElement("a",{className:"active",href:"#joinTeam"},"Join Team")))),c.a.createElement("div",{id:"createTeam",className:"col s12"},c.a.createElement("div",{className:"row"},c.a.createElement("div",{className:"input-field col s12"},c.a.createElement("input",{id:"teamName",type:"text",className:"validate"}),c.a.createElement("label",{for:"teamName"},"Team Name"))),c.a.createElement("div",{className:"row center-align"},c.a.createElement("div",{className:"col s12"},c.a.createElement("button",{id:"createButton",className:"waves-effect waves-light btn-large red accent-1"},"Create")))),c.a.createElement("div",{id:"joinTeam",className:"col s12"},c.a.createElement("div",{className:"row"},c.a.createElement("div",{className:"input-field col s12"},c.a.createElement("input",{maxlength:"5",id:"teamCode",type:"text",className:"validate"}),c.a.createElement("label",{for:"teamCode"},"Team Code"))),c.a.createElement("div",{className:"row center-align"},c.a.createElement("div",{className:"col s12"},c.a.createElement("button",{id:"joinButton",className:"waves-effect waves-light btn-large red accent-1"},"Join"))))))}}]),t}(n.Component)),E=Object(d.f)(p),b=(t(38),function(e){Object(m.a)(t,e);var a=Object(i.a)(t);function t(){return Object(o.a)(this,t),a.apply(this,arguments)}return Object(s.a)(t,[{key:"componentDidMount",value:function(){h.a.AutoInit()}},{key:"render",value:function(){return c.a.createElement("div",null,c.a.createElement("nav",null,c.a.createElement("div",{className:"nav-wrapper"},c.a.createElement("a",{href:"#",className:"brand-logo"},"Logo"),c.a.createElement("ul",{id:"nav-mobile",className:"right hide-on-med-and-down"},c.a.createElement("li",null,c.a.createElement("a",{href:"sass.html"},"Sass")),c.a.createElement("li",null,c.a.createElement("a",{href:"badges.html"},"Components")),c.a.createElement("li",null,c.a.createElement("a",{href:"collapsible.html"},"JavaScript"))))))}}]),t}(n.Component)),g=(t(39),function(e){Object(m.a)(t,e);var a=Object(i.a)(t);function t(e){return Object(o.a)(this,t),a.call(this,e)}return Object(s.a)(t,[{key:"render",value:function(){return c.a.createElement("div",null,c.a.createElement(u.b,{className:"grey darken-3 waves-effect waves-light card-panel center-align",to:"/"},c.a.createElement("span",null,"Home")),c.a.createElement(u.b,{className:"grey darken-3 waves-effect waves-light card-panel center-align",to:"/teams"},c.a.createElement("span",null,"Teams")))}}]),t}(n.Component)),N=(t(40),t(41),function(e){Object(m.a)(t,e);var a=Object(i.a)(t);function t(e){var n;return Object(o.a)(this,t),(n=a.call(this,e)).componentDidMount=function(){h.a.AutoInit(),n.getTeam()},n.getTeam=function(){chrome.runtime.sendMessage({for:"background",message:"get teams"},(function(e){n.setState({teams:e})}))},n.onClickTeam=function(e){chrome.storage.local.set({prevTeam:e.teamCode}),n.props.history.push("/"+e.teamCode)},n.state={teams:[]},n}return Object(s.a)(t,[{key:"render",value:function(){var e=this;return c.a.createElement("div",{className:"row"},this.state.teams.map((function(a){return c.a.createElement("div",{className:"col s3"},c.a.createElement("a",{onClick:e.onClickTeam.bind(e,a),teamCode:a.teamCode,className:"rounded-btn waves-effect waves-light btn"},c.a.createElement("div",{className:"inside-btn"},c.a.createElement("text",{className:"flexbox-centering"},a.teamName))))})),c.a.createElement("div",{className:"col s3"},c.a.createElement("a",{href:"#modal-createjoin",className:"rounded-btn waves-effect waves-light btn tooltipped modal-trigger","data-position":"bottom","data-tooltip":"Create or join a new team"},c.a.createElement("div",{className:"inside-btn"},c.a.createElement("text",{className:"flexbox-centering"},c.a.createElement("i",{className:"material-icons"},"add")))),c.a.createElement("div",{id:"modal-createjoin",className:"modal"},c.a.createElement("div",{className:"modal-content"},c.a.createElement(E,null)),c.a.createElement("div",{className:"modal-footer"},c.a.createElement("a",{href:"#!",className:"modal-close waves-effect waves-green btn-flat"},"Close")))))}}]),t}(n.Component)),j=Object(d.f)(N),w=t(19),y=t.n(w),C=t(26),O=function(e){Object(m.a)(t,e);var a=Object(i.a)(t);function t(e){var n;return Object(o.a)(this,t),(n=a.call(this,e)).componentDidMount=Object(C.a)(y.a.mark((function e(){var a,t,c;return y.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return a=new Promise((function(e,a){chrome.storage.local.get("prevTeam",(function(a){e(a)}))})),e.next=3,a;case 3:if(!(!1 in(t=e.sent))){e.next=6;break}return e.abrupt("return");case 6:c={for:"background",message:"get team info",teamCode:t.prevTeam},chrome.runtime.sendMessage(c,(function(e){n.setState({teamCode:t.prevTeam,teamName:e.teamName,teamMembers:Object.keys(e.members)})}));case 8:case"end":return e.stop()}}),e)}))),console.log("here"),n.state={teamCode:"",teamName:"",teamMembers:[]},n}return Object(s.a)(t,[{key:"render",value:function(){return c.a.createElement("div",null,c.a.createElement("div",{className:"divider"}),c.a.createElement("div",{className:"section"},c.a.createElement("h5",null,this.state.teamName),c.a.createElement("p",null,"Team Code: ",this.state.teamCode)),c.a.createElement("div",{className:"divider"}),c.a.createElement("div",{className:"section"},c.a.createElement("h5",null,"Team Members"),this.state.teamMembers.map((function(e){return c.a.createElement("p",null,e)}))))}}]),t}(n.Component),T=function(e){Object(m.a)(t,e);var a=Object(i.a)(t);function t(){return Object(o.a)(this,t),a.apply(this,arguments)}return Object(s.a)(t,[{key:"render",value:function(){return c.a.createElement("div",{className:"app"},c.a.createElement(u.a,null,c.a.createElement(b,null),c.a.createElement("div",{className:"row"},c.a.createElement("div",{className:"col s2",id:"side"},c.a.createElement(g,null)),c.a.createElement("div",{className:"col s10"},c.a.createElement(d.c,null,c.a.createElement(d.a,{exact:!0,path:"/createjoin",component:E}),c.a.createElement(d.a,{exact:!0,path:"/teams",component:j}),c.a.createElement(d.a,{path:"/",component:O}))))))}}]),t}(n.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));l.a.render(c.a.createElement(c.a.StrictMode,null,c.a.createElement(T,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[27,1,2]]]);
//# sourceMappingURL=main.508e2c52.chunk.js.map