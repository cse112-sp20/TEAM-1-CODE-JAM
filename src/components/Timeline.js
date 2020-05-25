/*global chrome*/
import React, { Component } from "react";
import "./Timeline.css";
import Animal from "react-animals";
import { animals } from "./animals";

// import images from "../images/donut.svg";
// import { donut } from "..images/images/donut.svg";

export default class Timeline extends Component {
  constructor(props) {
    super(props);
    this.state = {
      leftRightBranch: [],
    };
  }
  componentDidMount = () => {
    this.timeline();
    chrome.runtime.onMessage.addListener(this.handleMessage);
  };

  createTimelineElement = (time, animal, url, points, update) => {
    let newElement = (
      <tr>
        <td>{time}</td>
        <td>
          <img src={require(`../SVG/${animal}`)}></img>
        </td>
        <td id="points">
          {`${url}`}
          <br></br>
          {`+${points}`}
        </td>
      </tr>
    );

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
        let animal = animals[msg.animal];

        let url = msg.url;
        let innerHTML = `visited ${msg.url}`;
        let name = "alligator";
        this.createTimelineElement(time, animal, url, 30, 1);
        // msg.flip
        //   ? this.createLeftBranch(innerHTML, name, time, 1)
        //   : this.createRightBranch(innerHTML, time, 1);
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
    let i = 0;
    // let animal = animals[0];
    let len = animals.length;
    data.map((tab) => {
      let innerHTML = ` visited ${tab.url}`;
      let name = "alligator";
      let url = tab.url;
      let time = tab.time;
      console.log(time);
      let animal = animals[i];
      this.createTimelineElement(time, animal, url, 30, 0);
      i = (i + 1) % len;
    });
  };

  render() {
    return (
      <div class="row">
        <div class="card e4e4e4 darken-1" id="timeline">
          <div class="card-content black-text">
            <table class="highlight centered">
              {/* header */}
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Person</th>
                  <th>Earned</th>
                </tr>
              </thead>
              {/* Timeline activity */}
              <tbody>{this.state.leftRightBranch}</tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}
