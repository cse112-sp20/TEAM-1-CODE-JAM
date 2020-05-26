/*global chrome*/
import React, { Component } from "react";
import "./Timeline.css";

export default class Timeline extends Component {
  constructor(props) {
    super(props);
    this.state = {
      black_listed: ["facebook", "twitter", "myspace", "youtube"],
      timeline: [],
    };
  }
  componentDidMount = () => {
    this.timeline();
    chrome.runtime.onMessage.addListener(this.handleMessage);
  };

  createTimelineElement = (timelineElement) => {
    let animal = timelineElement.animal;
    if (animal == undefined) {
      animal = "Predator";
    }
    let color = "green";

    if (this.state.black_listed.includes(timelineElement.url)) {
      color = "red";
    }
    let newElement = (
      <tr>
        <td>{timelineElement.time}</td>
        <td>
          <img src={require(`../SVG/${animal}.svg`)}></img>
        </td>
        <td style={{ color: `${color}` }}>
          {`${timelineElement.url}`}
          <br></br>
          {`-${30}`}
        </td>
      </tr>
    );
    return newElement;
  };

  /**
   * Updates timeline if a new element is created for the timeline.
   */
  handleMessage = (request) => {
    // new element for timeline
    if (request.for === "timeline demo")
      this.setState({
        timeline: request.message.timeWasted.reverse(),
      });

    console.log(request);
    return true;
  };
  /**
   * Loads the timeline. Only called once
   */
  timeline = async () => {
    const msg = {
      for: "background",
      message: "get timeline array",
    };
    chrome.runtime.sendMessage(msg, (response) => {
      this.setState({
        timeline: response.timeWasted.reverse(),
      });
    });
  };

  render() {
    return (
      <div class="row" id="myTimeline">
        <div class="card e4e4e4 darken-1" id="myCard">
          <div class="card-content black-text" id="myContent">
            <table class="highlight" id="myTable">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Person</th>
                  <th>Earned</th>
                </tr>
              </thead>
              <tbody>
                {this.state.timeline.map((eachTimeline) => {
                  return this.createTimelineElement(eachTimeline);
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}
