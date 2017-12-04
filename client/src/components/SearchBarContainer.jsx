import React from 'react';
import moment from 'moment';
import DateSearch from './DateSearch.jsx';
import CategorySearch from './CategorySearch.jsx';
import PriceSearch from './PriceSearch.jsx';
import CitySearch from './CitySearch.jsx';

class SearchBarContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date: moment().format(),
      city: '',
      category: [],
      price: 'all',
    };
    this.onChange = this.onChange.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  onChange(option, value) {
    let newCriteria = {};
    newCriteria[option] = value;
    this.setState(newCriteria);
  }

  onClick(e) {
    this.props.runFilters(this.state);
    e.preventDefault();
  }

  render() {
    return (
      <form className="container">
        <div className="row">
          <DateSearch onChange={this.onChange} />
          <CitySearch onChange={this.onChange} />
          <CategorySearch 
            onChange={this.onChange}
            onCatClick={this.props.onCatClick}
          />
          <PriceSearch onChange={this.onChange} />
          <button type="button" onClick={this.onClick}>Search</button>
        </div>
      </form>
    );
  }
}

export default SearchBarContainer;
