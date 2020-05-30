/*global chrome*/
import React, { Component } from "react";
import donut from "../images/donut.svg";

export default class TimelineDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timeline: [],
    };
  }
  componentDidMount() {
    const msg = {
      for: "background",
      message: "get timeline array",
    };
    chrome.runtime.sendMessage(msg, (response) => {
      this.setState({
        timeline: response.timeWasted.reverse(),
      });
    });
    chrome.runtime.onMessage.addListener((request) => {
      if (request.for === "timeline demo")
        this.setState({
          timeline: request.message.timeWasted.reverse(),
        });
    });
  }
  createTimelineList = (timeline) => {
    return (
      <li className="collection-item avatar">
        <img src={donut} alt="" className="circle" />
        <span className="title">{timeline.user}</span>
        <p>{timeline.time}</p>
      </li>
    );
  };
  render() {
    return (
      <div>
        <ul className="collection">
          {this.state.timeline.map((eachTimeline) => {
            return this.createTimelineList(eachTimeline);
          })}
        </ul>
      </div>
    );
  }
}
