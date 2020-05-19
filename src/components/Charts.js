import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';
export default class Charts extends Component {
    constructor(props){
        super(props);
        this.state = {
            chartData: props.chartData,
            chartOptions: {
                title: {
                    display: true,
                    text: 'Team 1 vs Me',
                    fontSize: 20
                },
                legend: {
                    display: true,
                    position: 'bottom'
                },
                maintainAspectRatio: true,
                scales: {
                    yAxes: [{
                        stacked: true,
                        ticks: {
                            suggestedMin: 0,
                            suggestedMax: 100
                        }
                    }],
                    xAxes: [{
                        stacked: true
                    }]
                 }
            },
            chartOptions2: {
                title: {
                    display: true,
                    text: 'Team X vs Me',
                    fontSize: 20
                },
                legend: {
                    display: true,
                    position: 'bottom'
                },
                maintainAspectRatio: true,
                scales: {
                    yAxes: [{
                       // stacked: true,
                        ticks: {
                            suggestedMin: 0,
                            suggestedMax: 100
                        }
                    }],
                    xAxes: [{
                        //stacked: true
                    }]
                 }
            }
        }
    }
    // load data from function getChartData() into this.state.chartData
    componentWillMount(){
        this.getChartData();
    }
    // function to insert data into chart
    getChartData() {
        // CALL TO FIREBASE HERE
        this.setState({
            // replace object in chartData with Firebase data
            chartData: {
                labels: ['Monday', 'Tuesday', 'Wednesday',
                 'Thursday', 'Friday'], 
                datasets: [
                    {
                        type: 'bar',
                        label: 'My Contributions',
                        data: [10, 20, 5, 8, 10],
                        backgroundColor: 'rgba(11, 113, 126, 0.7)'
                    },
                    {
                        type: 'bar',
                        label: 'Total Contributions',
                        data: [30, 40, 50, 60, 20],
                        backgroundColor: ['rgba(255,99,132,0.6)',
                        'rgba(54,162,235,0.6)', 'rgba(255,206,86,0.6)',
                        'rgba(75,192,192,0.6)', 'rgba(153,102,255,0.6)']
                    }
                ]
            }
        });
    }
    render() {
        return (
            <div chartData = {this.state.chartData} className="chart">
                <Bar
                    data={this.state.chartData}
                    options={this.state.chartOptions}
                    />
                <Bar
                    data={this.state.chartData}
                    options={this.state.chartOptions2}
                    />
            </div>
        )
    }
}
