import React, { Component } from 'react';
// import { min, max } from 'd3-array';
// import { interpolate } from 'd3-interpolate';
// import stateData from '../../../lib/stateData.js';
// import _ from 'underscore';
// import $ from 'jquery';

// Tree configuration
let branches = [];
const seed = {
  index: 0,
  startx: 420,
  starty: 600,
  angle: 0,
  length: 130,
  endx: 420,
  endy: 470,
  depth: 0,
  parent: null,
}; // a = angle, l = length, d = depth
seed.path = ['M', seed.startx, ',', seed.starty, 'L', seed.endx, ',', seed.endy].join('');
const angleDelta = 0.5;
const lengthDelta = 0.7; // how much to shorten sequential branches by at each depth
const randomnessFactor = 0.7;
const maxDepth = 10;

// Tree creation functions

const branchEndPoint = (branch) => {
  const x = branch.startx + (branch.length * Math.sin(branch.angle));
  const y = branch.starty - (branch.length * Math.cos(branch.angle));
  return { x, y };
};

const createBranch = (branch) => {
  const prevBranchEnd = branchEndPoint(branch);
  let newAngleRandomizer = null;
  let newBranchAngle = null;
  const newBranchLength = branch.length * lengthDelta;
  let newLeftBranch = null;
  let newRightBranch = null;
  // let newBranch = null;

  branches.push(branch);

  if (branch.depth === maxDepth) {
    return;
  }

  // const branchChildrenLimit = 2;

  // for (let i = 0; i < branchChildrenLimit; i++) {
  //   newAngleRandomizer = (randomnessFactor * Math.random()) - (angleDelta * 0.5);
  //   newBranchAngle = (branch.angle - angleDelta) + newAngleRandomizer;
  //   let rightOrLeft = Math.random();
  //   rightOrLeft = (rightOrLeft > 0.5) ? 1 : -1;
  //   console.log(rightOrLeft);
  //   newBranch = {
  //     index: branches.length,
  //     startx: prevBranchEnd.x,
  //     starty: prevBranchEnd.y,
  //     angle: newBranchAngle,
  //     length: newBranchLength,
  //     // endx: prevBranchEnd.x + (rightOrLeft * (newBranchLength * Math.sin(newBranchAngle))),
  //     endx: prevBranchEnd.x + ((newBranchLength * Math.sin(newBranchAngle)) * rightOrLeft),
  //     endy: prevBranchEnd.y - (newBranchLength * Math.cos(newBranchAngle)),
  //     depth: branch.depth + 1,
  //     parent: branch.index,
  //   };
  //   newBranch.path = ['M', newBranch.startx, ',', newBranch.starty, 'L', newBranch.endx, ',', newBranch.endy].join('');
  //   console.log(`new path: ${newBranch.path}`);
  //   createBranch(newBranch);
  // }

  // left branch
  newAngleRandomizer = (randomnessFactor * Math.random()) - (angleDelta * 0.5);
  newBranchAngle = (branch.angle - angleDelta) + newAngleRandomizer;
  newLeftBranch = {
    index: branches.length,
    startx: prevBranchEnd.x,
    starty: prevBranchEnd.y,
    angle: newBranchAngle,
    length: newBranchLength,
    endx: prevBranchEnd.x + (newBranchLength * Math.sin(newBranchAngle)),
    endy: prevBranchEnd.y - (newBranchLength * Math.cos(newBranchAngle)),
    depth: branch.depth + 1,
    parent: branch.index,
  };
  newLeftBranch.path = ['M', newLeftBranch.startx, ',', newLeftBranch.starty, 'L', newLeftBranch.endx, ',', newLeftBranch.endy];
  // console.log(`nlb path: ${newLeftBranch.path}`);
  newLeftBranch.path = newLeftBranch.path.join('');
  // console.log(`nlb path: ${newLeftBranch.path}`);
  createBranch(newLeftBranch);

  // right branch
  newAngleRandomizer = (randomnessFactor * Math.random()) - (angleDelta * 0.5);
  newBranchAngle = (branch.angle + angleDelta) + newAngleRandomizer;
  newRightBranch = {
    index: branches.length,
    startx: prevBranchEnd.x,
    starty: prevBranchEnd.y,
    angle: newBranchAngle,
    length: newBranchLength,
    endx: prevBranchEnd.x + (newBranchLength * Math.sin(newBranchAngle)),
    endy: prevBranchEnd.y - (newBranchLength * Math.cos(newBranchAngle)),
    depth: branch.depth + 1,
    parent: branch.index,
  };
  newRightBranch.path = ['M', newRightBranch.startx, ',', newRightBranch.starty, 'L', newRightBranch.endx, ',', newRightBranch.endy];
  // console.log(`nrb path: ${newRightBranch.path}`);
  newRightBranch.path = newRightBranch.path.join('');
  // console.log(`nrb path: ${newRightBranch.path}`);
  createBranch(newRightBranch);
};



function branchWidth(branch, index) {
  // console.log(`branch size = ${branch.length}`);
  // console.log(`branch index = ${index}`);
  return (10 - branch.depth).toString();
}

function colorSelector() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

class Tree extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // hover: false,
      // selection: {},
      // mouseX: 0,
      // mouseY: 0,
    };
    this.regenerateTree = this.regenerateTree.bind(this);
  }


  // fakeData () {
  //   console.log('fake data being created');
  //   this.setState({
  //     branches2: [
  //       { data: "M420,600L420,730", depth: 4 },
  //       { data: "M420,730L382,634", depth: 1 },
  //       { data: "M420,730L341,561", depth: 1 }
  //     ],
  //   });
  // }

  componentWillMount () {
    // this.fakeData();
  }

  // mouseEnterEvent(d) {
  //   this.setState({
  //     hover: true,
  //     selection: {name: d.n, id: d.id }
  //   });
  // }


  // mouseLeaveEvent() {
  //   this.setState({
  //     hover: false,
  //   });
  // }

  // mouseMoveEvent(data, e) {
  //   const mouseX = e.clientX;
  //   const mouseY = e.clientY;
  //   const toolTipUS = document.getElementsByClassName('toolUS');
  //   toolTipUS[0].style.top = (mouseY - 200) + 'px';
  //   toolTipUS[0].style.left = (mouseX - 300) + 'px';
  //   // console.log(`mouse is at: (${mouseX}, ${mouseY})`);
  // trokeWidth={() => {return branchWidth(branch, index);}}
  // }

  regenerateTree() {
    console.log('clicked!');
    // branches = [];
    // createBranch(seed);
  }

  render() {
    createBranch(seed);
    // console.log(`final paths of branches: ${JSON.stringify(branches, null, 2)}`);
        // <button onClick={() => this.regenerateTree()}>Regenerate</button>
    return (
      <div>
        <div>
          <svg className="Tree" transform="scale(2)">
            {branches.map((branch, index) => {
              const sw = {
                strokeWidth: branchWidth(branch, index),
                // stroke: '#663300',
                // stroke: "darkgreen",
                stroke: colorSelector(),
              };
              // console.log('sw: ', sw.strokeWidth);
              return (<path
                {...sw}
                className="branch"
                d={branch.path}
              />);
            })}
          </svg>
        </div>
      </div>);
  }
}

export default Tree;

/* 
return (
      <div>
        <svg className="Tree">
          {this.state.branches2.map((branch, index) => {
            const sw = {
              strokeWidth: branchWidth(branch, index),
            };
            return (<path
              {...sw}
              className="branch"
              stroke="green"
              d={branch.path}
            />);
          })}
        </svg>
        HELLO
      </div>);
  }
*/