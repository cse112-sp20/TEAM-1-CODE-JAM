/*
 * Impelementation of tab switching. Defines the current active tab
 * @author: Ivy Cheng
 * Reference: w3schools.com/howto/howto_js_veritcal_tabs.asp
 */
function openTab(evt, tabName) {
  var i, tabcontent, tabs;

  // Get all elements with class="main_content" and hide them
  tabcontent = document.getElementsByClassName("main-content");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tabs" and remove the class "active"
  settingTabs = document.getElementsByClassName("tabs");
  for (i = 0; i <  settingTabs.length; i++) {
    settingTabs[i].className =  settingTabs[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the link that opened the tab
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

document.getElementById("authenticationsTab").onclick = function (event) {
  openTab(event, "authentications");
};

document.getElementById("aboutTab").onclick = function (event) {
  openTab(event, "about");
};

document.getElementById("authenticationsTab").click();
