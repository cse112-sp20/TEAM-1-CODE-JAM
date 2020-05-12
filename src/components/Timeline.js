/*global chrome*/
import React, { Component } from "react";
import "./Timeline.css";
export default class Timeline extends Component {
  constructor(props) {
    super(props);
    this.state = {
      black_listed: [
        "www.youtube.com",
        "www.facebook.com",
        "twitter.com",
        "myspace.com",
      ],
      animals: [
        "alligator",
        "anteater",
        "armadillo",
        "aurochs",
        "axolotl",
        "badger",
        "bat",
        "beaver",
        "buffalo",
        "camel",
        "capybara",
      ],
      leftRightBranch: [],
    };
    this.getHostname = this.getHostname.bind(this);
    this.createLeftBranch = this.createLeftBranch.bind(this);
    this.createRightBranch = this.createRightBranch.bind(this);
    this.getAllOpenWindows = this.getAllOpenWindows.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.showURL = this.showURL.bind(this);
    this.getAllOpenWindows = this.getAllOpenWindows.bind(this);
  }
  componentDidMount() {
    chrome.windows.getAll({ populate: true }, this.getAllOpenWindows); // grabs all current tabs opened
  }
  /**
   *  Gets the host name of a URL
   *
   * @param {string} url: URL of a tab
   * @returns {URL} Host name of the tab
   *
   */
  getHostname(url) {
    console.log(url);
    // Handle Chrome URLs
    if (/^chrome:\/\//.test(url)) {
      return "invalid";
    }
    // Handle Files opened in chrome browser
    if (/file:\/\//.test(url)) {
      return "invalid";
    }
    try {
      var newUrl = new URL(url);
      return newUrl.hostname;
    } catch (err) {
      console.log(err);
    }
  }
  /**Creates the left branch of the timeline
   *
   * @param {string} innerHTML domain name of url
   * @param {int} index indicate which animal will represent url
   */
  createLeftBranch(innerHTML, index) {
    // let timeline = document.getElementsByClassName("timeline")[0];
    // let container = document.createElement("div");
    // let content = document.createElement("div");
    // container.setAttribute("class", "container left");
    // content.setAttribute("class", "content");
    // timeline.appendChild(container);
    // container.appendChild(content);
    // content.innerHTML = `Anonymous ${this.state.animals[index]} is on ${innerHTML}`;
    let newElement = (
      <div className="container left">
        <div className="content">
          Anonymous {this.state.animals[index]} is on {innerHTML}
        </div>
      </div>
    );
    this.state.leftRightBranch.push(newElement);
    this.setState({
      leftRightBranch: this.state.leftRightBranch,
    });
  }
  /**Creates the right branch of the timeline
   *
   * @param {string} innerHTML domain name of url
   * @param {int} index indicate which animal will represent url
   */
  createRightBranch(innerHTML, index) {
    // var timeline = document.getElementsByClassName("timeline")[0];
    // var container = document.createElement("div");
    // var content = document.createElement("div");
    // container.setAttribute("class", "container right");
    // content.setAttribute("class", "content");
    // timeline.appendChild(container);
    // container.appendChild(content);
    // content.innerHTML = `Anonymous ${this.state.animals[index]} is on ${innerHTML}`;

    let newElement = (
      <div className="container right">
        <div className="content">
          Anonymous {this.state.animals[index]} is on {innerHTML}
        </div>
      </div>
    );
    this.state.leftRightBranch.push(newElement);
    this.setState({
      leftRightBranch: this.state.leftRightBranch,
    });
  }

  /**
   * Displays all URLs (host names) currently opened.
   *
   * @param {Array} winData All chrome window tabs opened
   *
   */
  getAllOpenWindows(winData) {
    let tabs_num = 0; // seeing how many tabs opened
    let tabs = [];
    let that = this;
    for (let i in winData) {
      let winTabs = winData[i].tabs;
      let totTabs = winTabs.length;
      for (let j = 0; j < totTabs; j++) {
        let url = this.getHostname(winTabs[j].url);
        if (url != "invalid") tabs.push(url);
        tabs_num++;
      }
    }
    this.showURL(tabs);
  }

  /**
   * Creates timeline branches of the current tabs which are blacklisted
   *
   * @param {Array} tabs URLs of tabs currently opened
   *
   */
  showURL(tabs) {
    let index = 0;
    let branch_flip = 0;

    let that = this;
    tabs.forEach(function (domain) {
      if (that.state.black_listed.includes(domain)) {
        // in blacklisted
        if (branch_flip == 1) {
          //   that.createRightBranch(domain, index);
          that.createRightBranch(domain, index);
          branch_flip = 0;
        } else {
          that.createLeftBranch(domain, index);
          branch_flip = 1;
        }
        index = (index + 1) % that.state.animals.length;
      }
    });
  }

  render() {
    return (
      <div>
        {/* <h1>hi</h1> */}
        {/* <div className="timeline"> */}
          {this.state.leftRightBranch.map((ele) => {
            return ele;
          })}
        {/* </div> */}
      </div>
    );
  }
}
