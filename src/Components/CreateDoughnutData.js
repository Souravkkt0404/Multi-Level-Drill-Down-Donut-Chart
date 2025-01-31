import React, { useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";

// Register plugins
ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels);

const generateColorPalette = (count) => {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const hue = (i * 137.5) % 360;
    colors.push(`hsl(${hue}, 70%, 60%)`);
  }
  return colors;
};

const CreateDoughnutData = () => {
  const [currentData, setCurrentData] = useState("main");
  const [notification, setNotification] = useState(""); // State to manage notification

  const mainData = {
    labels: ["Category A", "Category B"],
    datasets: [
      {
        data: [60, 40],
        backgroundColor: generateColorPalette(2),
        borderWidth: 2,
      },
    ],
  };

  const subDataA = {
    labels: [
      "Subcategory A1",
      "Subcategory A2",
      "Subcategory A3",
      "Subcategory A4",
      "Subcategory A5",
      "Subcategory A6",
      "Subcategory A7",
      "Subcategory A8",
      "Subcategory A9",
      "Subcategory A10",
      "Subcategory A11",
    ],
    datasets: [
      {
        data: [2, 20, 10, 2, 2, 2, 2, 10, 20, 30, 10],
        backgroundColor: generateColorPalette(11),
        borderWidth: 2,
      },
    ],
  };

  const subDataB = {
    labels: ["Subcategory B1", "Subcategory B2"],
    datasets: [
      {
        data: [1, 2],
        backgroundColor: ["rgb(75, 192, 192)", "rgb(153, 102, 255)"],
        borderWidth: 2,
      },
    ],
  };

  const subSubDataA1 = {
    labels: [
      "SubSubcategory A1.1",
      "SubSubcategory A1.2",
      "SubSubcategory A1.3",
    ],
    datasets: [
      {
        data: [10, 30, 60],
        backgroundColor: generateColorPalette(3),
        borderWidth: 2,
      },
    ],
  };

  const handleDrillDown = (category) => {
    if (category === "Category A") {
      setCurrentData("A");
      setNotification(""); // Reset notification
    } else if (category === "Category B") {
      setCurrentData("B");
      setNotification(""); // Reset notification
    } else if (category === "Subcategory A1") {
      setCurrentData("A1");
      setNotification(""); // Reset notification
    } else {
      // No deeper drill-down available
      setNotification("No further drill-down available for this category.");
    }
  };

  const handleBack = () => {
    if (currentData === "A" || currentData === "B") {
      setCurrentData("main");
      setNotification(""); // Reset notification
    } else if (currentData === "A1") {
      setCurrentData("A");
      setNotification(""); // Reset notification
    } else {
      setCurrentData("main");
      setNotification(""); // Reset notification
    }
  };

  let chartData;
  let showBackButton = false;

  if (currentData === "main") {
    chartData = mainData;
  } else if (currentData === "A") {
    chartData = subDataA;
    showBackButton = true;
  } else if (currentData === "B") {
    chartData = subDataB;
    showBackButton = true;
  } else if (currentData === "A1") {
    chartData = subSubDataA1;
    showBackButton = true;
  }

  const options = {
    layout: {
      padding: {
        top: 50,
        bottom: 0,
        left: 20,
        right: 50,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          padding: 40,
        },
      },
      datalabels: {
        display: (context) => {
          const value = context.dataset.data[context.dataIndex];
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = (value / total) * 100;

          return percentage >= 3;
        },
        color: "#fff",
        formatter: (value, context) => {
          const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
          const percentage = ((value / total) * 100).toFixed(2);
          return `${percentage}%`;
        },
        font: {
          size: 12,
          weight: "normal",
        },
      },

      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const value = tooltipItem.raw;
            const total = tooltipItem.dataset.data.reduce(
              (acc, val) => acc + val,
              0
            );
            const percentage = ((value / total) * 100).toFixed(2);
            return `${tooltipItem.label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const clickedIndex = elements[0].index;
        const label = chartData.labels[clickedIndex];
        handleDrillDown(label);
      }
    },
  };

  ChartJS.register({
    id: "draw-lines",
    afterDatasetDraw: (chart) => {
      const ctx = chart.ctx;
      const meta = chart.getDatasetMeta(0);
      const totalValue = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);

      const visibleLabels = chart.legend.legendItems
        .filter((legendItem) => !legendItem.hidden)
        .map((legendItem) => legendItem.text);

      const positions = [];

      meta.data.forEach((arc, index) => {
        const label = chart.data.labels[index];
        const value = chart.data.datasets[0].data[index];
        const percentage = (value / totalValue) * 100;

        if (!visibleLabels.includes(label) || percentage >= 3) return;

        const center = arc.getCenterPoint();
        const midAngle = (arc.startAngle + arc.endAngle) / 2;

        const lineOffset = 60;
        const labelOffset = 90;

        const xLine = center.x + Math.cos(midAngle) * lineOffset;
        const yLine = center.y + Math.sin(midAngle) * lineOffset;

        let xLabel = xLine + (midAngle > Math.PI ? -labelOffset : labelOffset);
        let yLabel = yLine;

        while (positions.some((pos) => Math.abs(pos - yLabel) < 15)) {
          yLabel += 5;
        }
        positions.push(yLabel);

        ctx.beginPath();
        ctx.moveTo(arc.tooltipPosition().x, arc.tooltipPosition().y);
        ctx.lineTo(xLine, yLine);
        ctx.lineTo(xLabel, yLabel);
        ctx.strokeStyle = "#999";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = "bold 12px Arial";
        ctx.fillStyle = "#000";
        ctx.textAlign = midAngle > Math.PI ? "right" : "left";
        ctx.textBaseline = "middle";
        ctx.fillText(`${percentage.toFixed(2)}%`, xLabel, yLabel);
      });
    },
  });

  return (
    <div style={{ width: "500px", height: "500px", margin: "auto" }}>
      <h2 style={{ textAlign: "center" }}>Drill Down Doughnut Chart</h2>
      <Doughnut data={chartData} options={options} />
      {showBackButton && (
        <button onClick={handleBack} style={{ marginTop: "20px" }}>
          Back
        </button>
      )}
      {notification && (
        <div style={{ marginTop: "20px", color: "red", textAlign: "center" }}>
          {notification}
        </div>
      )}
    </div>
  );
};

export default CreateDoughnutData;
