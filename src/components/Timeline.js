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
        let url = msg.url;
        let time = msg.time;
        msg.flip
          ? this.createRightCard(url, time, 1)
          : this.createLeftCard(url, time, 1);
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
        resolve(response);
      });
    });
    let data = await task;
    data.map((tab) => {
      let url = tab.url;
      let time = new Date(tab.time).toLocaleTimeString();
      let flip = tab.flip;
      flip
        ? this.createLeftCard(url, time, 0)
        : this.createRightCard(url, time, 0);
    });
  };

  render() {
    return <div id="timeline">{this.state.leftRightBranch}</div>;
  }
}
