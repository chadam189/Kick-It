import React from 'react';
import ReactDOM from 'react-dom';
import SearchBarContainer from './components/SearchBarContainer.jsx';
import EventListContainer from './components/EventListContainer.jsx';
// import WeekendListContainer from './components/WeekendListContainer.jsx';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      featured: [],
      weekend: [],
      isLoggedIn: false,
      userFirstName: '',
    };
  }
  componentDidMount() {
    // fetch('/initialLoad')
    //   .then((response) => {
    //     // console.log('response received from server:', JSON.stringify(response));
    //     return response.json();
    //   })
    //   .then((data) => {
    //     // console.log('data about to be put into todays state:', data.today);
    //     this.setState({
    //       featured: data.today
    //     })
    //   })
    // .then(() => {
    //   fetch('/weekend')
    //   .then((response) => {
    //     // console.log('data from API for weekend', response);
    //     return response.json();
    //   })
    //   .then((data) => {
    //     // console.log('data about to be put into weekend state: ', data);
    //     let events = JSON.parse(data).events;
    //     this.setState({
    //       weekend: events,
    //     });
    //   });
    // });
  }

  // login() {
  //   console.log('login!!');
  //   fetch('/auth/google', { mode: 'no-cors' })
  //     .then(response => {
  //     // load login page
  //     // this.setState({
  //     //   isLoggedIn: true,
  //     // });
  //   });
  // };

  logout() {
    console.log('logout!!');
    fetch('/login')
      .then(response => {
      // load login page
      });
  };

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
    .then(events=> {
      this.setState({
        featured: events.rows
      })
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
              <button onClick={this.logout}>Logout</button>
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
          <div className="container">
            <EventListContainer 
              featuredEvents={this.state.featured}
              weekendEvents={this.state.weekend.slice(0,10)} 
            />
          </div>
        </div>
        
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
