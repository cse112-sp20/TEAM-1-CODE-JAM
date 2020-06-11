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

  /**
   * Creates a element for the timeline
   * @author Brian Aguirre
   * @param timelineElement object containing url, animal and point relating to timeline
   */
  createTimelineElement = (timelineElement, index) => {
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

    let temp = require(`../SVG/${animal}.svg`);
    let i = 0;
    let newElement = (
      <tr key={`tr-${index}`}>
        <td id="time">
          <p style={{ fontWeight: 600 }}>{timelineElement.currTime}</p>
        </td>
        <td>
          {/* <img src={require(`../SVG/${animal}.svg`)}></img> */}
          <img src={temp}></img>
        </td>
        <td id="thirdElem" style={{ color: `${color}` }}>
          <p
            data-testid={`timeline-item ${++i}`}
            style={{ fontWeight: 600, textTransform: "capitalize" }}
          >{`${timelineElement.url}`}</p>

          <br></br>
          {`${points}`}
        </td>
      </tr>
    );

    return newElement;
  };

  /**
   * Updates timeline if a new element is created for the timeline.
   * @author Brian Aguirre
   * @param request object containing all timeline elements created
   */
  handleMessage = (request) => {
    // new element for timeline
    if (request.for === "team info") {
      this.setState({
        timeline: request.message.timeWasted,
      });
    }
    return true;
  };
  /**
   * Loads the timeline. Only called once
   * @author Brian Aguirre
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

  /**
   * render the timeline component
   */
  render() {
    return (
      <div
        key="my-timelineKey"
        data-testid="my-timeline"
        className="row"
        id="myTimeline"
      >
        <div key="my-card" className="card blue-grey lighten-5" id="myCard">
          <div key="card-2" className="card-content black-text" id="myContent">
            <table
              key="table"
              data-testid="my-table"
              className="highlight"
              id="myTable"
            >
              <thead key="my-thead">
                <tr key="my-tr">
                  <th key="my-th1" id="myHead">
                    Time
                  </th>
                  <th key="my-th2" id="myHead">
                    Person
                  </th>
                  <th key="my-th3" id="myHead">
                    Earned
                  </th>
                </tr>
              </thead>
              <tbody data-testid="arrayTimeline" key="my-tbody">
                {this.state.timeline.map((eachTimeline, index) => {
                  return this.createTimelineElement(eachTimeline, index);
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}
