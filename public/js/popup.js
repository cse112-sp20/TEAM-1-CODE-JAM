/*
 * Impelementation of tab switching. Defines the current active tab
 */
function openTab(evt, tabName) {
  var i, tabcontent, tabs;

  // Get all elements with class="main_content" and hide them
  tabcontent = document.getElementsByClassName("main_content");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tabs" and remove the class "active"
  tabs = document.getElementsByClassName("tabs");
  for (i = 0; i < tabs.length; i++) {
    tabs[i].className = tabs[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the link that opened the tab
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

document.getElementById("authenticationsTab").onclick = function (event) {
  openTab(event, "Authentications");
};

document.getElementById("aboutTab").onclick = function (event) {
  openTab(event, "About");
};

document.getElementById("authenticationsTab").click();
