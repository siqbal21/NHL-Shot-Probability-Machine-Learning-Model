import React, { Component } from 'react';

class HockeyRink extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Shot location — derived from click on rink canvas
      shotX: null,
      shotY: null,
      shotDistance: null,
      shotAngle: null,

      // Sidebar inputs
      shotType: 'WRIST',
      shotRebound: 0,
      offWing: 0,
      shootingTeamSkaters: 5,
      defendingTeamSkaters: 5,
      period: 1,
      distanceFromLastEvent: 0,
      scoreDifferential: 0,
      model: 'xgb',

      // Prediction output
      xG: null,
    };
  }

  render() {
    return (
      <div>
        {/* App content goes here */}
      </div>
    );
  }
}

export default HockeyRink;
