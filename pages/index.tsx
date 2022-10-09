import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import styles from '../styles/Home.module.css'
import Chart from "chart.js/auto"
import axios from 'axios'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import moment from 'moment';
import { TextField } from '@mui/material'

const Home: NextPage = () => {
  const canvasEl = useRef(null);
  const [getDateFrom, setDateFrom] = useState(moment().subtract(1, 'month').format("D/MM/YYYY"));
  const [getDateTo, setDateTo] = useState(moment().format("D/MM/YYYY"));
  const [getMesures, setMesures] = useState([]);
  console.log(getDateTo)
  async function fetchMesures(from: string, to: string)  {
    try {
      const response = await axios.get('http://localhost/mesures', {
        params: {
          from,
          to,
        }
      });
      setMesures(response.data)
      console.log(getMesures)
    } catch (err) {
      console.error(err);
    }
  }
  useEffect(() => {
    fetchMesures(getDateFrom, getDateTo);
  }, [getDateFrom, getDateTo]);

  const colors = {
    purple: {
      default: "rgb(66, 95, 87, 1)",
      half: "rgb(66, 95, 87, .5)",
      quarter: "rgb(66, 95, 87, .25)",
      zero: "rgb(66, 95, 87, 0)",
    },
    indigo: {
      default: "rgb(116, 159, 130, 1)",
      quarter: "rgb(116, 159, 130, .25)"
    }
  };

  useEffect(() => {
    const ctx = canvasEl?.current?.getContext("2d");
    // const ctx = document.getElementById("myChart");

    const gradientPurple = ctx.createLinearGradient(0, 16, 0, 600);
    const gradientIndigo = ctx.createLinearGradient(0, 16, 0, 600);

    gradientPurple.addColorStop(0, colors.purple.half);
    gradientPurple.addColorStop(0.65, colors.purple.quarter);
    gradientPurple.addColorStop(1, colors.purple.zero);
    gradientIndigo.addColorStop(0, colors.indigo.quarter)
    gradientIndigo.addColorStop(1, colors.indigo.default)

    const { labels, uSV, ACPM } = getMesures.reduce(
      (acc: {labels: string[], uSV: number[], ACPM: number[]}, cur: {createdAt: string, uSV: number, ACPM: number}) => {
        acc.labels.push(moment(cur.createdAt).format('D MMM YYYY hA'));
        acc.uSV.push(cur.uSV);
        acc.ACPM.push(cur.ACPM);
      return acc;
    }, {labels: [], uSV: [], ACPM: []});
    const data = {
      labels: labels,
      datasets: [
        {
          backgroundColor: gradientPurple,
          label: "uSV",
          data: uSV,
          fill: true,
          borderWidth: 2,
          borderColor: colors.purple.default,
          lineTension: 0.2,
          pointBackgroundColor: colors.purple.default,
          pointRadius: 3,
          yAxisID: 'y',
        },
        {
          backgroundColor: gradientIndigo,
          label: "ACPM",
          data: ACPM,
          fill: true,
          borderWidth: 2,
          borderColor: colors.indigo.default,
          lineTension: 0.2,
          pointBackgroundColor: colors.indigo.default,
          pointRadius: 3,
          yAxisID: 'y1',
        },
      ]
    };
    const config = {
      type: "line",
      data: data,
      options: {
        scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: { text: "uSV", display: true  }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: { text: "ACPM", display: true }
        },
        }
      }
    };
    const myLineChart = new Chart(ctx, config);

    return function cleanup() {
      myLineChart.destroy();
    };
  });

  return (
    <div className="App">
      <span>Chart.js Demo</span>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
    label="De"
    value={getDateFrom}
    inputFormat="D/MM/yyyy"
    onChange={(newValue) => {
      if (newValue) {
        setDateFrom(newValue);
      }
    }}
    renderInput={(params) => (
      <TextField {...params} helperText={params?.inputProps?.placeholder} />
    )}
  />
        <DatePicker
    label="a"
    value={getDateTo}
    inputFormat="D/MM/yyyy"
    onChange={(newValue) => {
      if (newValue) {
        setDateTo(newValue);
      }
    }}
    renderInput={(params) => (
      <TextField {...params} helperText={params?.inputProps?.placeholder} />
    )}
  />
      </LocalizationProvider>
      <canvas id="myChart" ref={canvasEl} height="100" />
    </div>
  );
}

export default Home
