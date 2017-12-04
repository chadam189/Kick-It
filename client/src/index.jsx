import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import SearchBarContainer from './components/SearchBarContainer.jsx';
import EventListContainer from './components/EventListContainer.jsx';
import EventMap from './components/EventMap.jsx';
import Piechart from './components/Piechart.jsx';
import States from './components/States.jsx';
// import Counties from './components/Counties.jsx';
// import Tree from './components/Tree.jsx';
const { RAWAPI } = require('../../config.js');



class App extends React.Component {
	constructor() {
		super();
		this.state = {
			featured: [],
			weekend: [],
			isLoggedIn: false,
      userFirstName: '',
			venueLocations: [],
			defaultLocation: { lat: 37.7749, lng: -122.4194 },
      PieData: [],
      StatesData: {},
      CountiesData: {},
      category: 'all',
		}

    this.selectPieData = this.selectPieData.bind(this);
	}

	componentDidMount() {
		fetch('/initialLoad')
			.then((response) => {
				console.log('response received from server:', JSON.stringify(response));
				return response.json();
			})
			.then((data) => {
				console.log('data about to be put into todays state:', data.today);
				 // creates massaged data for d3
        const PieData = this.createD3Data(data.today);
				this.setState({
          featured: data.today,
          // PieData: PieData
				})
				return data;
			})
			.then((data) =>  {
				let venueIDContainer = [];
				let locationContainer = [];
				let promiseContainer = [];
				new Promise((resolve, reject) => {
					data.today.forEach((event) => {
					venueIDContainer.push(event.venue_id);
				});	
				venueIDContainer.forEach((venueID) => {
					//venueID = Number(venueID);
					axios.get(`https://www.eventbriteapi.com/v3/venues/${venueID}/?token=${RAWAPI}`)
					.then((location) => {
						locationContainer.push({ lat: Number(location.data.address.latitude), lng: Number(location.data.address.longitude)});
					})
				})
				resolve(locationContainer)
				}).then(() => {
					this.setState({
						venueLocations: locationContainer,
						defaultLocation: locationContainer[0]
					});
				})
			})
		.then(() => {
			fetch('/weekend')
			.then((response) => {
				console.log('data from API for weekend', response);
				return response.json();
			})
			.then((data) => {
				//console.log('data about to be put into weekend state: ' , data);
				let events = JSON.parse(data).events;
				this.setState({
					weekend: events,
				});
			});
		});
	}


  createD3Data(raw) {
    let music = 0;
    let food = 0;
    let community = 0;
    let dating = 0;
    let entertainment = 0;
    let science = 0;
    let autoBoatAir = 0;
    let active = 0;


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

    raw.forEach(event => {
      if (event.category_id === '103') {
        music++;
      } else if (event.category_id === '110') {
        food++;
      } else if (event.category_id === '113' || event.category_id === '116') {
        community++;
      } else if (event.category_id === '17001') {
        dating++;
      } else if (event.category_id === '104' || event.category_id === '105') {
        entertainment++;
      } else if (event.category_id === '102') {
        science++;
      } else if (event.category_id === '118') {
        autoBoatAir++;
      } else if (event.category_id === '108' || event.category_id === '109') {
        active++;
      }
    });

    let d3Data = [
      { label: 'music', category: [103], value: music },
      { label: 'food', category: [110], value: food },
      { label: 'community', category: [113, 116], value: community },
      { label: 'dating', category: [17001], value: dating },
      { label: 'entertainment', category: [104, 105], value: entertainment },
      { label: 'science', category: [102], value: science },
      { label: 'autoBoatAir', category: [118], value: autoBoatAir },
      { label: 'active', category: [108, 109], value: active }
    ];

    console.log(d3Data);
    return d3Data;
  }


	runFilters(filters) {
		fetch('/filter', {
			headers: {
				//'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			method: 'POST',
			body: JSON.stringify(filters),
		})
		.then((response)=> {
			return response.json();
		})
		.then((events)=> {
			this.setState({
				featured: events.rows,
			})
		return events.rows;
		})
		.then((data) =>  {
			let venueIDContainer = [];
			let locationContainer = [];
			let promiseContainer = [];
			new Promise((resolve, reject) => {
				data.forEach((event) => {
				venueIDContainer.push(event.venue_id);
			});	
			venueIDContainer.forEach((venueID) => {
				//venueID = Number(venueID);
				axios.get(`https://www.eventbriteapi.com/v3/venues/${venueID}/?token=${RAWAPI}`)
				.then((location) => {
					locationContainer.push({ lat: Number(location.data.address.latitude), lng: Number(location.data.address.longitude)});
				})	
			})
			resolve(locationContainer)
			}).then(() => {
				this.setState({
					venueLocations: locationContainer,
					defaultLocation: locationContainer[0]
				});
			})
		})
		.then(()=>{
			fetch('/weekend', {
				headers: {
					//'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
				method: 'POST',
				body: JSON.stringify({'city':filters.city}),
			})
			.then((res) => {
				return res.json();
			})
			.then((data) => {
				let events = JSON.parse(data).events;
				this.setState({
					weekend: events,
				});
			})
			.catch((err)=>{
				console.log('ERROR getting weekend from filter post', err);
			})
		})
  }


  selectPieData(data) {
    this.setState({
      PieData: data
    })
  }


	render() {
		return (
			<div>
				<h1>Kick It</h1>
        <div>
          {this.state.isLoggedIn ?
            <div>
              <h2>Welcome, YOU!</h2>
              <button>Logout</button>
            </div>
            :
            <div>
              <a href="/auth/google">
                <button>Login</button>  
              </a>      
            </div>
           }
        </div>
        <SearchBarContainer runFilters={this.runFilters.bind(this)}/>
        <div className="album text-muted">
            <div className="charts">
              <Piechart data={this.state.PieData} />
              <States 
                data={this.state.StatesData}
                selectPieData={this.selectPieData}
              />
            </div>
						<EventListContainer 
							featuredEvents={this.state.featured}
							weekendEvents={this.state.weekend.slice(0,10)} 
						/>
					</div>
					<div>
  					<br />
  					<EventMap
  						venues={this.state.venueLocations}
							defaultLocation={this.state.venueLocations[0]}
              googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyC4R6AN7SmujjPUIGKdyao2Kqitzr1kiRg&v=3.exp&libraries=geometry,drawing,places"
              loadingElement={<div style={{ height: `100%` }} />}
              containerElement={<div style={{ height: `500px` }} />}
              mapElement={<div style={{ height: `100%` }} />}
            />
				</div>
			</div>
      )
	}
}

ReactDOM.render(<App />, document.getElementById('app'));