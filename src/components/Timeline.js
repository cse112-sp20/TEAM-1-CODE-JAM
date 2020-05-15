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
    // this.timeline();
    // this.newMessage();
    chrome.runtime.onMessage.addListener(this.handleMessage);
  };

  createLeftCard = (innerHTML, time) => {
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

    this.state.leftRightBranch.push(newElement);
    this.setState({
      leftRightBranch: this.state.leftRightBranch,
    });
  };

  createRightCard = (innerHTML, time) => {
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

    this.state.leftRightBranch.push(newElement);
    this.setState({
      leftRightBranch: this.state.leftRightBranch,
    });
  };

  handleMessage = (msg) => {
    console.log(msg);
    let url = msg.url;
    let time = msg.time;
    msg.flip_flag
      ? this.createLeftCard(url, time)
      : this.createRightCard(url, time);

    // sendResponse(msg);
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
        // let data = response.data;
        resolve(response);
      });
    });
    let data = await task;
    let flip = false;
    data.map((tab) => {
      let url = tab.url;
      let time = new Date(tab.time).toLocaleTimeString();
      flip ? this.createLeftCard(url, time) : this.createRightCard(url, time);
      flip = !flip;
    });
  };

  render() {
    return <div id="timeline">{this.state.leftRightBranch}</div>;
  }
}
