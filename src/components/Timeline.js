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
    let color = "#52d16d";
    if (this.state.black_listed.includes(timelineElement.url)) {
      color = "#ff7373";
    }
    let points =
      Math.round((timelineElement.points + Number.EPSILON) * 100) / 100;

    let newElement = (
      <tr>
        <td id="time">{timelineElement.currTime}</td>
        <td>
          <img src={require(`../SVG/${animal}.svg`)}></img>
        </td>
        <td id="thirdElem" style={{ color: `${color}` }}>
          {`${timelineElement.url}`}
          <br></br>
          {`${points}`}
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
    if (request.for === "team info")
      this.setState({
        timeline: request.message.timeWasted,
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
      <div className="row" id="myTimeline">
        <div className="card blue-grey lighten-5" id="myCard">
          <div className="card-content black-text" id="myContent">
            <table className="highlight" id="myTable">
              <thead>
                <tr>
                  <th id="myHead">Time</th>
                  <th id="myHead">Person</th>
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
