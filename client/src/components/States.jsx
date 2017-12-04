import React, { Component } from 'react';
import { min, max } from 'd3-array';
import { interpolate } from 'd3-interpolate';
import stateData from '../../../lib/stateData.js';
import realEventData from '../../../sampleData/masterEventData.js';
import _ from 'underscore';
import $ from 'jquery';


// ===================
// Sample data: links a state to categories with values
// ===================
// const sampleData = {};
// const states = ['HI', 'AK', 'FL', 'SC', 'GA', 'AL', 'NC', 'TN', 'RI', 'CT', 'MA',
//   'ME', 'NH', 'VT', 'NY', 'NJ', 'PA', 'DE', 'MD', 'WV', 'KY', 'OH',
//   'MI', 'WY', 'MT', 'ID', 'WA', 'DC', 'TX', 'CA', 'AZ', 'NV', 'UT',
//   'CO', 'NM', 'OR', 'ND', 'SD', 'NE', 'IA', 'MS', 'IN', 'IL', 'MN',
//   'WI', 'MO', 'AR', 'OK', 'KS', 'LS', 'VA'];
// states.forEach((d) => {
//   const low = Math.round(100 * Math.random());
//   const mid = Math.round(100 * Math.random());
//   const high = Math.round(100 * Math.random());
//   sampleData[d] = {
//     Music: Math.round(100 * Math.random()),
//     Food: Math.round(100 * Math.random()),
//     Community: Math.round(100 * Math.random()),
//     Dating: Math.round(100 * Math.random()),
//     Entertainment: Math.round(100 * Math.random()),
//     Science: Math.round(100 * Math.random()),
//     AutoBoatAir: Math.round(100 * Math.random()),
//     Active: Math.round(100 * Math.random())
//   };
// });

const mapCatName = (categoryNumber) => {
  if (categoryNumber === 102) {
    return 'Science & Tech';
  } else if (categoryNumber === 103) {
    return 'Music';
  } else if (categoryNumber === 104) {
    return 'Movies';
  } else if (categoryNumber === 105) {
    return 'Art';
  } else if (categoryNumber === 106) {
    return 'Fashion';
  } else if (categoryNumber === 107 || categoryNumber === 108) {
    return 'Sports & Fitness';
  } else if (categoryNumber === 109) {
    return 'Travel & Outdoors';
  } else if (categoryNumber === 110) {
    return 'Food & Drink';
  } else if (categoryNumber === 111) {
    return 'Charity';
  } else if (categoryNumber === 113) {
    return 'Community Events';
  } else if (categoryNumber === 116) {
    return 'Holiday';
  } else if (categoryNumber === 118) {
    return 'Auto, Boat, Air';
  }
};

const eventData = {
  total:  {
     'Science & Tech': 0,
     'Music': 0,
     'Movies': 0,
     'Art': 0,
     'Fashion': 0,
     'Sports & Fitness': 0,
     'Travel & Outdoors': 0,
     'Food & Drink': 0,
     'Charity': 0,
     'Community Events': 0,
     'Holiday': 0,
     'Auto, Boat, Air': 0,
    },
};

realEventData.forEach((event) => {
  const stateName = event[3];
  const catName = mapCatName(event[4]);
  // console.log(`cat name = ${catName}, state = ${stateName}, ${event[3]}, ${event[4]}`);
  if (!eventData[stateName]) {
    // state exists in obj
    eventData[stateName] = {
     'Science & Tech': 0,
     'Music': 0,
     'Movies': 0,
     'Art': 0,
     'Fashion': 0,
     'Sports & Fitness': 0,
     'Travel & Outdoors': 0,
     'Food & Drink': 0,
     'Charity': 0,
     'Community Events': 0,
     'Holiday': 0,
     'Auto, Boat, Air': 0,
    };
  }
  eventData[stateName][catName]++;
  eventData.total[catName]++;
  // console.log(`cat value: ${eventData[stateName][catName]}`)
});

console.log(`fuckin event totals: ${JSON.stringify(eventData.total, null, 2)}`);



    // 102 - Science & Tech
    // 103 - Music
    // 104 - Movies
    // 105 - Art
    // 106 - Fashion
    // 107 and 108 - Sports and Fitness
    // 109 - Travel and Outdoor
    // 110 - Food and Drink
    // 111 - Charity
    // 113 - Community Events
    // 116 - Holiday
    // 118 - Auto, Boat, Air



function dataReturn(state) {
  return state.d;
}


const ToolTipUS = ({ data }) => {
  return (
    <div className="toolUS">
      <div>{`${data.name}`}</div>
      {_.map(eventData[data.id], (value, label) => {
        return (<div>{label}: {value}</div>);
      })}
    </div>);
};



// ===================
// Changes sample data to a form that the Piechart wants
// Triggered on click
// ===================
function formatDataForPie(id) {
  return _.map(eventData[id], (value, label) => {
    return { label: label, value: value };
  });
}

function colorSelector(label) {

  const maxCategoryValue = {
    label: '',
    value: 0
  };


  for (let key in eventData[label]) {
    if (eventData[label][key] > maxCategoryValue.value) {
      maxCategoryValue.label = key;
      maxCategoryValue.value = eventData[label][key];
    }
  }

  const categoryColors = {
    'Science & Tech': 'lightgreen',
     'Music': 'yellow',
     'Movies': 'silver',
     'Art': 'red',
     'Fashion': 'pink',
     'Sports & Fitness': 'navy',
     'Travel & Outdoors': 'darkgreen',
     'Food & Drink': 'orange',
     'Charity': 'purple',
     'Community Events': 'lightblue',
     'Holiday': 'brown',
     'Auto, Boat, Air': 'black',
  };

  return maxCategoryValue.value ? categoryColors[maxCategoryValue.label] : 'red';

  // const letters = '0123456789ABCDEF';
  // let color = '#';
  // for (let i = 0; i < 6; i++) {
  //   color += letters[Math.floor(Math.random() * 16)];
  // }
  // return color;
}


class States extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hover: false,
      selection: {},
      // mouseX: 0,
      // mouseY: 0,
    };
  }

  componentDidMount () {
    console.log('this pops up when States is about to mount');
    this.props.selectPieData(formatDataForPie('total'));
  }


  mouseEnterEvent(d) {
    this.setState({
      hover: true,
      selection: {name: d.n, id: d.id}
    });
  }


  mouseLeaveEvent() {
    this.setState({
      hover: false,
    });
  }

  mouseMoveEvent(data, e) {
    // console.log('mouse has moved!', e.clientX);
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const toolTipUS = document.getElementsByClassName('toolUS');
    toolTipUS[0].style.top = (mouseY - 200) + 'px';
    toolTipUS[0].style.left = (mouseX - 300) + 'px';
    // console.log(`mouse is at: (${mouseX}, ${mouseY})`);
  }

  render() {
    return (
      <div className="map">
        <svg className="States"  transform="scale(0.6)">
            {stateData.map(state => {
              return (
                <path
                  stroke="white"
                  fill={colorSelector(state.id)}
                  className="state"
                  key={state.id}
                  d={dataReturn(state)}
                  onMouseEnter={(e) => { this.mouseEnterEvent(state, e); }}
                  onMouseMove={(e) => { this.mouseMoveEvent(state, e); }}
                  onMouseLeave={() => { this.mouseLeaveEvent(); }}
                  onClick={() => { this.props.selectPieData(formatDataForPie(state.id)); }}
                />
              );
            })}
        </svg>
      </div>);
  }
}

export default States;

