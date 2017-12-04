import React, { Component } from 'react';
import { scaleOrdinal } from 'd3-scale';
import { arc, pie } from 'd3-shape';

// ===================
// DATA FORMAT FOR PIECHART:
// ===================

// this.props.data = [{ label: 'music', category: [103], value: music },
// { label: 'food', category: [110], value: food },
// { label: 'community', category: [113, 116], value: community },
// { label: 'dating', category: [17001], value: dating },
// { label: 'entertainment', category: [104, 105], value: entertainment },
// { label: 'science', category: [102], value: science },
// { label: 'autoBoatAir', category: [118], value: autoBoatAir },
// { label: 'active', category: [108, 109], value: active }]


// ===================
// D3 Math
// ===================

const color = scaleOrdinal(['lightgreen', 'yellow', 'silver', 'red', 'pink', 'navy', 'darkgreen', 'orange', 'purple', 'lightblue', 'brown', 'black']);
const width = 600;
const height = 600;
const radius = Math.min(width - 200, height - 200) / 2;

const dataArc = arc()
  .outerRadius(radius - 10)
  .innerRadius(100);

const pieChart = pie()
  .sort(null)
  .value(d => d.value);

function labelPath(center, label) {
  const cx = center[0];
  const cy = center[1];
  const lx = label[0];
  const ly = label[1];

  return `M ${cx} ${cy} L ${lx} ${ly}`;
}


// ===================
// Toast Component
// ===================

const ToolTipPie = ({ data }) => {
  return (
    <div className="toolPie">
      {`${data.label} ${data.value}`}
    </div>
  );
};


// ===================
// Piechart Component
// ===================
class Piechart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hover: false,
      selection: { label: "Searched Data", value: " " }
    };
  }

  // ===================
  // Mouse Over Event Listener
  // Changes hover to true, updates selection with the hovered tile data
  // ===================
  // mouseOverEvent(d, e) {
  //   this.setState({
  //     hover: true,
  //     selection: { d: d, label: d.data.label, value: d.value }
  //   });
  // }

  // ===================
  // Mouse Exit Event Listener
  // Changes hover to false
  // ===================
  mouseLeaveEvent() {
    this.setState({
      hover: false
    });
  }


  render() {
    return (
      <div className="pie">
      
        <svg className="Piechart" width={width} heigth={height} >
          <g transform={`translate(${(width) / 2}, ${(height) / 2})`}>
            {pieChart(this.props.data).map((d, i) => {

              // Trig
              const center = dataArc.centroid(d);
              const cx = center[0];
              const cy = center[1];
              const labelRadius = 240;
              const h = Math.sqrt((cx * cx) + (cy * cy));
              const labelPosition1 = [((cx / h) * labelRadius), ((cy / h) * labelRadius)];
              const labelPosition2 = [((cx / h) * (labelRadius + 30)), ((cy / h) * (labelRadius + 30))];

              return (
                <g key={i} className="arc">
                  <path
                    d={dataArc(d)}
                    fill={color(d.data.label)}
                    onMouseOver={(e) => { this.mouseOverEvent(d, e); }}
                    onMouseLeave={() => { this.mouseLeaveEvent(); }}
                  />
                  <path className="labelLines" d={labelPath(center, labelPosition1)} />
                  <text
                    className="label"
                    dy=".15em"
                    transform={`translate(${(i % 2) ? labelPosition1 : labelPosition2})`}
                  >
                    {d.value !== 0 && `${d.data.label}: ${d.value}`}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>);
  }
}

export default Piechart;
