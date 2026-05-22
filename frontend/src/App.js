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

    rinkToSVG(rinkX, rinkY) {
      const svgX = (rinkX / 100) * 800;
      const svgY = (rinkY + 42.5) / 85 * 680;
      return { x: svgX, y: svgY };
    }

    SVGToRink(svgX, svgY) {
      const rinkX = (svgX / 800) * 100;
      const rinkY = (svgY / 680) * 85 - 42.5;
      return { x: rinkX, y: rinkY };
    }

  renderRink() {
    const goalLineTop = this.rinkToSVG(89, -42.5);
    const goalLineBottom = this.rinkToSVG(89, 42.5)
    const halfWayLine = this.rinkToSVG(0.25, 0);
    const offSideLine = this.rinkToSVG(25, 0);
    const goalTop = this.rinkToSVG(89, -3);
    const goalBottom = this.rinkToSVG(92, 3);
    const creaseCenter = this.rinkToSVG(89, 0);
    const creaseRadius = 6 * 8;
    const creasePath = `M ${creaseCenter.x} ${creaseCenter.y - creaseRadius}
    A ${creaseRadius} ${creaseRadius} 0 0 0 ${creaseCenter.x} ${creaseCenter.y + creaseRadius}`;

    const cornerRadius = 28 * 8;
    const iceBoardsCurve = `M 0 0 L ${800 - cornerRadius} 0
                Q ${800} 0 ${800} ${cornerRadius}
                L ${800} ${680 - cornerRadius}
                Q ${800} ${680} ${800 - cornerRadius} ${680}
                L 0 ${680} L 0 0`;

    const trapTop1 = this.rinkToSVG(89, -11);
    const trapTop2 = this.rinkToSVG(100, -14);
    const trapBottom1 = this.rinkToSVG(89, 11);
    const trapBottom2 = this.rinkToSVG(100, 14);
    const topFaceoffCircle = this.rinkToSVG(69, -22);
    const bottomFaceoffCircle = this.rinkToSVG(69, 22);

    return (
        <g>
          <path
            d={iceBoardsCurve}
            fill="none"
            stroke="black"
            strokeWidth={2}
          />
          <defs>
            <clipPath id="rinkClip">
              <path d={iceBoardsCurve} />
            </clipPath>
          </defs>
          <line
            x1={goalLineTop.x} y1={goalLineTop.y}
            x2={goalLineBottom.x} y2={goalLineBottom.y}
            stroke="red" strokeWidth={2}
            clipPath="url(#rinkClip)"
          />
          <line
            x1={halfWayLine.x} y1={0}
            x2={halfWayLine.x} y2={680}
            stroke="red" strokeWidth={5}
          />
          <rect
            x={goalTop.x}
            y={goalTop.y}
            width={goalBottom.x - goalTop.x}
            height={goalBottom.y - goalTop.y}
            fill="rgba(200, 200, 200, 0.5)"
            stroke="black"
            strokeWidth={2}
          />
          <path
            d={creasePath}
            fill="rgba(135, 206, 250, 0.5)"
            stroke="red"
            strokeWidth={2}
          />
          <line
            x1={offSideLine.x} y1={0}
            x2={offSideLine.x} y2={680}
            stroke="blue"
            strokeWidth={5}
          />
          <line
            x1={trapTop1.x} y1={trapTop1.y}
            x2={trapTop2.x} y2={trapTop2.y}
            stroke="red"
            strokeWidth={2}
          />
          <line
            x1={trapBottom1.x} y1={trapBottom1.y}
            x2={trapBottom2.x} y2={trapBottom2.y}
            stroke="red"
            strokeWidth={2}
          />
          <circle
            cx={topFaceoffCircle.x}
            cy={topFaceoffCircle.y}
            r={120}
            fill="none"
            stroke="red"
            strokeWidth={2}
          />
          <circle
            cx={bottomFaceoffCircle.x}
            cy={bottomFaceoffCircle.y}
            r={120}
            fill="none"
            stroke="red"
            strokeWidth={2}
          />
        </g>
    )
  }

  render() {
    return (
      <div>
        <svg
          width={800}
          height={680}
          style={{ background: "white" }}
        >
          {this.renderRink()}
        </svg>
      </div>
    );
  }
}

export default HockeyRink;
