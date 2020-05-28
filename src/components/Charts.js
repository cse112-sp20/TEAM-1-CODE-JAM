/*global chrome*/
import React, { Component } from "react";
import { Bar } from "react-chartjs-2";
import "./Charts.css";
export default class Charts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // data grabbed from background url
      /* format: 2d array
      [
        ["code1", "teamname1", timejoined],
        ["code2", "teamname2", timejoined],
         ...
      ]
      */
      teams: [],
      //data
      chartData: ""
    };
  }
  // load data from function getChartData() into this.state.chartData
  componentDidMount = async () => {
    this.getBackgroundData();
    this.getChartData();
    //this.getChartOptions();
    //console.log(this.state.teams);
  }
  getBackgroundData(){
    // variable to hold finished parsed array for all team info
    let teamInfo = [];

    // ask chrome storage for the current team
    // The api is async
    let msg = {
      for: "background",
      message: "get teams",
    };
    let msg2 = {
      for: "background",
      message: "get team points",
    };
    // ask the background for team information
    chrome.runtime.sendMessage(msg, (response) => {
      if (response == undefined) {
        return;
      }
      // parse through JSON and turn all values into an array
      response.forEach((element) => {
        let newElement = Object.values(element);
        teamInfo.push(newElement);
      });
      this.setState({
        teams: teamInfo,
      });
    });
    // ask the background for team information
    chrome.runtime.sendMessage(msg2, (response) => {
      if (response == undefined) {
        return;
      }
      console.log(JSON.stringify(response));
    });
  }
  // function to insert data into chart
  getChartData() {
    this.setState({
      // replace object in chartData with Firebase data
      chartData: {
        labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        datasets: [
          {
            type: "bar",
            label: "My Contributions",
            data: [10, 20, 5, 8, 10],
            backgroundColor: "rgba(11, 113, 126, 0.7)",
          },
          {
            type: "bar",
            label: "Total Contributions",
            data: [30, 40, 50, 60, 20],
            backgroundColor: [
              "rgba(255,99,132,0.6)",
              "rgba(54,162,235,0.6)",
              "rgba(255,206,86,0.6)",
              "rgba(75,192,192,0.6)",
              "rgba(153,102,255,0.6)",
            ],
          },
        ],
      },
    });
  }                   
  render() {
    let data = [];
    if (window.name !== "nodejs") {
      let index;
      for (index = 0; index < this.state.teams.length; index++) { 
        data.push(<Bar
        key="2"
        data={this.state.chartData}
        options={{
          title: {
            display: true,
            text: this.state.teams[index][1],
            fontSize: 20,
          },
          legend: {
            display: true,
            position: "bottom",
          },
          maintainAspectRatio: true,
          scales: {
            yAxes: [
              {
                ticks: {
                  suggestedMin: 0,
                  suggestedMax: 100,
                },
              },
            ],
            xAxes: [
              {
              },
            ],
          },
        }
      }
      />);    
    }
    return (
      <div id="chart" chartData={this.state.chartData} className="chart">
        {data}
      </div>
    );
  }
}
}

      // chartOptions: {
      //   title: {
      //     display: true,
      //     text: "Team 1 vs Me",
      //     fontSize: 20,
      //   },
      //   legend: {
      //     display: true,
      //     position: "bottom",
      //   },
      //   maintainAspectRatio: true,
      //   scales: {
      //     yAxes: [
      //       {
      //         stacked: true,
      //         ticks: {
      //           suggestedMin: 0,
      //           suggestedMax: 100,
      //         },
      //       },
      //     ],
      //     xAxes: [
      //       {
      //         stacked: true,
      //       },
      //     ],
      //   },
      // },