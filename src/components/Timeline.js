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
      urls: [],
    };

    this.createLeftCard = this.createLeftCard.bind(this);
  }
  componentDidMount = () => {
    this.timeline();
    chrome.runtime.onMessage.addListener(this.handleMessage);
    // console.log("dfadfda");
  };

  createRightBranch = (innerHTML, time, update) => {
    let newElement = (
      <div class="timeline-event">
        <div class="card timeline-content">
          <div class="card-image waves-effect waves-block waves-light"></div>
          {/* card */}
          <div class="card-content">
            <span
              id="myText"
              class="card-title activator grey-text text-darken-4"
            >
              {innerHTML}
            </span>
            <p>-20 pts</p>
          </div>
        </div>

        {/* timeline icon */}
        <div class="timeline-badge  red white-text">
          <i class="material-icons">person</i>
        </div>
      </div>
    );
    update
      ? this.state.leftRightBranch.unshift(newElement) // queue
      : this.state.leftRightBranch.push(newElement); // stack
    this.setState({
      leftRightBranch: this.state.leftRightBranch,
    });
  };
  createLeftBranch = (innerHTML, time, update) => {
    {
      /* whole thing event left */
    }
    let newElement = (
      <div class="timeline-event">
        <div class="card timeline-content">
          <div class="card-image waves-effect waves-block waves-light"></div>
          <div class="card-content">
            <span
              id="myText"
              class="card-title activator grey-text text-darken-4"
            >
              {innerHTML}
            </span>
            <p>-24 points</p>
          </div>
        </div>

        <div class="timeline-badge green white-text">
          <i class="material-icons">person</i>
        </div>
      </div>
    );
    update
      ? this.state.leftRightBranch.unshift(newElement) // queue
      : this.state.leftRightBranch.push(newElement); // stack
    this.setState({
      leftRightBranch: this.state.leftRightBranch,
    });
  };

  createLeftCard = (innerHTML, time, update) => {
    let newElement = (
      <div className="row">
        <div className="col s6">
          <div className="card blue-grey lighten-5">
            <div className="card-content white-text">
              <span style={{ color: "black" }} className="card-title">
                {innerHTML}
              </span>
            </div>
          </div>
        </div>
        <div className="col s6">
          <div>
            <h4 style={{ color: "#6886c5" }}>{time}</h4>
          </div>
        </div>
      </div>
    );
    // Differentiate if first time opening timeline
    update
      ? this.state.leftRightBranch.unshift(newElement) // queue
      : this.state.leftRightBranch.push(newElement); // stack
    this.setState({
      leftRightBranch: this.state.leftRightBranch,
    });
  };

  createRightCard = (innerHTML, time, update) => {
    // date.
    let newElement = (
      <div className="row">
        <div className="col s6 ">
          <h4 style={{ color: "#fa9191" }}>{time}</h4>
        </div>
        <div className="col s6">
          <div className="card blue-grey lighten-5">
            <div className="card-content white-text">
              <span style={{ color: "black" }} className="card-title">
                {innerHTML}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
    // Differentiate if first time opening timeline
    update
      ? this.state.leftRightBranch.unshift(newElement) // queue
      : this.state.leftRightBranch.push(newElement); // stack
    this.setState({
      leftRightBranch: this.state.leftRightBranch,
    });
  };

  handleMessage = (msg) => {
    
    // new element for timeline
    if (msg.for === "popup") {
      if (msg.message === "timeline") {
        // let url = msg.url;
        let time = msg.time;
        let url = innerHTML;
        let innerHTML = `Anonymous ${
          this.state.animals[msg.animal % 11]
        }  visited ${msg.url}`;
        msg.flip
          ? this.createLeftBranch(innerHTML, time, 1)
          : this.createRightBranch(innerHTML, time, 1);
        // msg.flip
        //   ? this.createLeftCard(url, time, 1)
        //   : this.createRightCard(url, time, 1);
      }
    }
    console.log(msg);
    return true;
  };

  timeline = async () => {
    //   team name is empty
    let msg = {
      for: "background",
      message: "get timeline",
    };

    let task = new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(msg, function (response) {
        console.log(response);
        resolve(response);
      });
    });
    let data = await task;
    console.log("timeline.js data");
    console.log(data)
    let i = 0;
    data.map((tab) => {
      console.log("timeline.js tab");
      console.log(tab)
      // let url = tab.url;
      let innerHTML = `Anonymous ${this.state.animals[i % 11]}  visited ${
        tab.url
      }`;
      let url = tab.url;
      let time = tab.time;
      let flip = tab.flip;
      flip
        ? this.createLeftBranch(url, time, 0)
        : this.createRightBranch(url, time, 0);
      i++;
      // flip
      //   ? this.createLeftCard(url, time, 0)
      //   : this.createRightCard(url, time, 0);
    });
  };

  render() {
    return (
      <div>
        <div class="container">
          <div id="timeline" class="timeline">
            {this.state.leftRightBranch}
          </div>
        </div>

        {/* <div id="timeline">{this.state.leftRightBranch}</div> */}
      </div>
    );
  }
}
