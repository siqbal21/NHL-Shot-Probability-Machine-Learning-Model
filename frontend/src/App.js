import React, {Component} from 'react';

class HockeyRink extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Shot location — derived from click on rink canvas
            shotX: null,
            shotY: null,
            shotDistance: null,
            // Previously: shotAngle: null — stored but never read, removed
            shotAngleAdjusted: null,
            // Sidebar inputs
            shotType: 'WRIST',
            shotRebound: 0,
            offWing: 0,
            shootingTeamSkaters: 5,
            defendingTeamSkaters: 5,
            period: 1,
            distanceFromLastEvent: 60,
            scoreDifferential: 0,
            model: 'xgb',

            // Prediction output
            xG: null,
            isLoading: false,
        };
    }

    rinkToSVG(rinkX, rinkY) {
        const svgX = (rinkX / 100) * 800;
        const svgY = (rinkY + 42.5) / 85 * 680;
        return {x: svgX, y: svgY};
    }

    SVGToRink(svgX, svgY) {
        const rinkX = (svgX / 800) * 100;
        const rinkY = (svgY / 680) * 85 - 42.5;
        return {x: rinkX, y: rinkY};
    }

    handleRinkClick(event) {
        const svg = event.currentTarget;
        const pt = svg.createSVGPoint();
        pt.x = event.clientX;
        pt.y = event.clientY;
        const svgPt = pt.matrixTransform(svg.getScreenCTM().inverse());
        const click = this.SVGToRink(svgPt.x, svgPt.y);

        const goalX = 89;
        const goalY = 0;

        if (click.x < 0 || click.x > 100) {
            return
        }

        const shotDistance =
            Math.sqrt(Math.pow(click.x - goalX, 2)
                + Math.pow(click.y - goalY, 2));
        const shotAngleAdjusted =
            Math.abs(Math.atan2(click.y - goalY,
                goalX - click.x) * (180 / Math.PI));

        // Previously: console.log('shotDistance:', shotDistance, 'shotAngle:', shotAngleAdjusted);

        this.setState({
            shotX: click.x,
            shotY: click.y,
            shotDistance: shotDistance,
            shotAngleAdjusted: shotAngleAdjusted,
        })

        this.fetchPrediction(shotDistance, shotAngleAdjusted);
    }

    fetchPrediction(shotDistance, shotAngleAdjusted) {
        this.setState({ isLoading: true });
        fetch('http://localhost:8000/predict', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                shotDistance: shotDistance,
                shotAngleAdjusted: shotAngleAdjusted,
                shotRebound: this.state.shotRebound,
                offWing: this.state.offWing,
                shootingTeamSkaters: this.state.shootingTeamSkaters,
                defendingTeamSkaters: this.state.defendingTeamSkaters,
                period: this.state.period,
                distanceFromLastEvent: this.state.distanceFromLastEvent,
                scoreDifferential: this.state.scoreDifferential,
                shotType: this.state.shotType,
                model: this.state.model,
            })
        })
            .then(res => res.json())
            .then(data => {
                this.setState({ xG: data.xG, isLoading: false });
            })
            .catch(err => {
                console.error('Prediction error:', err);
                this.setState({ isLoading: false });
            });
    }

    handleShotTypeChange(event) {
        this.setState({ shotType: event.target.value }, () => {
            if (this.state.shotX !== null)
                this.fetchPrediction(this.state.shotDistance, this.state.shotAngleAdjusted);
        });
    }

    handleReboundChange(event) {
        this.setState({ shotRebound: event.target.checked ? 1 : 0 }, () => {
            if (this.state.shotX !== null)
                this.fetchPrediction(this.state.shotDistance, this.state.shotAngleAdjusted);
        });
    }

    handleOffWingChange(event) {
        this.setState({ offWing: event.target.checked ? 1 : 0 }, () => {
            if (this.state.shotX !== null)
                this.fetchPrediction(this.state.shotDistance, this.state.shotAngleAdjusted);
        });
    }

    handlePeriodChange(event) {
        this.setState({ period: Number(event.target.value) }, () => {
            if (this.state.shotX !== null)
                this.fetchPrediction(this.state.shotDistance, this.state.shotAngleAdjusted);
        });
    }

    handleShootingTeamSkaters(delta) {
        const newVal = this.state.shootingTeamSkaters + delta;
        if (newVal >= 3 && newVal <= 6)
            this.setState({ shootingTeamSkaters: newVal }, () => {
                if (this.state.shotX !== null)
                    this.fetchPrediction(this.state.shotDistance, this.state.shotAngleAdjusted);
            });
    }

    handleDefendingTeamSkaters(delta) {
        const newVal = this.state.defendingTeamSkaters + delta;
        if (newVal >= 3 && newVal <= 6)
            this.setState({ defendingTeamSkaters: newVal }, () => {
                if (this.state.shotX !== null)
                    this.fetchPrediction(this.state.shotDistance, this.state.shotAngleAdjusted);
            });
    }

    handleScoreDifferential(event) {
        const val = Math.min(5, Math.max(-5, Number(event.target.value)));
        this.setState({ scoreDifferential: val }, () => {
            if (this.state.shotX !== null)
                this.fetchPrediction(this.state.shotDistance, this.state.shotAngleAdjusted);
        });
    }

    handleDistanceFromLastEvent(event) {
        const val = Math.min(200, Math.max(0, Number(event.target.value)));
        this.setState({ distanceFromLastEvent: val }, () => {
            if (this.state.shotX !== null)
                this.fetchPrediction(this.state.shotDistance, this.state.shotAngleAdjusted);
        });
        // Previously: if (this.state.distanceFromLastEvent === 60) {} — empty block, removed
    }

    handleModelChange(event) {
        this.setState({ model: event.target.value }, () => {
            if (this.state.shotX !== null) {
                this.fetchPrediction(this.state.shotDistance, this.state.shotAngleAdjusted);
            }
        });
    }

    getXGColor(xG) {
        if (xG < 0.05) return '#e63946';
        if (xG < 0.15) return '#f39c12'
        return '#2ecc71';
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
                        <path d={iceBoardsCurve}/>
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

    renderMenu() {
        const menuStyle = {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            padding: '20px',
            background: '#f5f5f5',
            borderRadius: '8px',
            width: '260px',
            fontFamily: 'sans-serif',
            overflowY: 'auto',  // sidebar scrolls independently on small windows
        };

        const labelStyle = {
            fontWeight: 'bold',
            marginBottom: '4px',
            display: 'block',
        };

        const selectStyle = {
            width: '100%',
            padding: '6px',
            borderRadius: '4px',
            border: '1px solid #ccc',
        };

        const counterStyle = {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
        };

        const btnStyle = {
            width: '28px',
            height: '28px',
            fontSize: '16px',
            cursor: 'pointer',
            borderRadius: '4px',
            border: '1px solid #ccc',
        };

        const inputStyle = {
            width: '100%',
            padding: '6px',
            borderRadius: '4px',
            border: '1px solid #ccc',
        };

        return (
            <div style={menuStyle}>
                <h2 style={{ margin: 0 }}>Shot Menu</h2>

                {/* Shot Type */}
                <div>
                    <label style={labelStyle}>Shot Type</label>
                    <select
                        style={selectStyle}
                        value={this.state.shotType}
                        onChange={(e) => this.handleShotTypeChange(e)}
                    >
                        <option value="WRIST">Wrist</option>
                        <option value="SNAP">Snap</option>
                        <option value="SLAP">Slap</option>
                        <option value="BACK">Backhand</option>
                        <option value="TIP">Tip</option>
                        <option value="DEFL">Deflection</option>
                    </select>
                </div>

                {/* Rebound */}
                <div>
                    <label style={labelStyle}>
                        <input
                            type="checkbox"
                            checked={this.state.shotRebound === 1}
                            onChange={(e) => this.handleReboundChange(e)}
                            style={{ marginRight: '8px' }}
                        />
                        Rebound Shot
                    </label>
                </div>

                {/* Off Wing */}
                <div>
                    <label style={labelStyle}>
                        <input
                            type="checkbox"
                            checked={this.state.offWing === 1}
                            onChange={(e) => this.handleOffWingChange(e)}
                            style={{ marginRight: '8px' }}
                        />
                        Off Wing
                    </label>
                </div>

                {/* Period */}
                <div>
                    <label style={labelStyle}>Period: {this.state.period}</label>
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={1}
                        value={this.state.period}
                        onChange={(e) => this.handlePeriodChange(e)}
                        style={{ width: '100%' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span>1</span><span>2</span><span>3</span>
                    </div>
                </div>

                {/* Shooting Team Skaters */}
                <div>
                    <label style={labelStyle}>Shooting Team Skaters</label>
                    <div style={counterStyle}>
                        <button style={btnStyle} onClick={() => this.handleShootingTeamSkaters(-1)}>-</button>
                        <span>{this.state.shootingTeamSkaters}</span>
                        <button style={btnStyle} onClick={() => this.handleShootingTeamSkaters(1)}>+</button>
                    </div>
                </div>

                {/* Defending Team Skaters */}
                <div>
                    <label style={labelStyle}>Defending Team Skaters</label>
                    <div style={counterStyle}>
                        <button style={btnStyle} onClick={() => this.handleDefendingTeamSkaters(-1)}>-</button>
                        <span>{this.state.defendingTeamSkaters}</span>
                        <button style={btnStyle} onClick={() => this.handleDefendingTeamSkaters(1)}>+</button>
                    </div>
                </div>

                {/* Distance From Last Event */}
                <div>
                    <label style={labelStyle}>Distance From Last Event (ft)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <input
                        type="number"
                        min={0}
                        max={200}
                        style={inputStyle}
                        value={this.state.distanceFromLastEvent}
                        onChange={(e) => this.handleDistanceFromLastEvent(e)}
                        />
                        {this.state.distanceFromLastEvent === 60 && (
                            <span style={{ fontSize: '16px', color: '#888', fontWeight: 'bold'}}>(avg)</span>
                        )}
                    </div>
                </div>

                {/* Score Differential */}
                <div>
                    <label style={labelStyle}>Score Differential</label>
                    <input
                        type="number"
                        min={-5}
                        max={5}
                        style={inputStyle}
                        value={this.state.scoreDifferential}
                        onChange={(e) => this.handleScoreDifferential(e)}
                    />
                </div>

                {/* Model */}
                <div>
                    <label style={labelStyle}>Model</label>
                    <select
                        style={selectStyle}
                        value={this.state.model}
                        onChange={(e) => this.handleModelChange(e)}
                    >
                        <option value="lr">Logistic Regression</option>
                        <option value="rf">Random Forest</option>
                        <option value="xgb">XGBoost</option>
                    </select>
                </div>

                {/* xG Output */}
                {this.state.isLoading && (
                    <div style={{ marginTop: '10px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
                        Calculating...
                    </div>
                )}
                {!this.state.isLoading && this.state.xG !== null && (
                    <div style={{ marginTop: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Expected Goals (xG)</div>
                        {/* Previously: color was always '#e63946' (red)
                            Now uses getXGColor() to reflect danger level */}
                        <div style={{ fontSize: '48px', fontWeight: 'bold', color: this.getXGColor(this.state.xG) }}>
                            {(this.state.xG * 100).toFixed(1)}%
                        </div>
                    </div>
                )}
            </div>
        );
    }

    render() {
        return (
            <div style={{display: 'flex', flexDirection: 'row', gap: '20px', padding: '20px', height: '100vh', boxSizing: 'border-box'}}>
                <div style={{flex: 1, minHeight: 0}}>
                <svg
                    viewBox="0 0 800 680"
                    height="100%"
                    width="auto"
                    style={{background: "white", cursor: "crosshair", display: "block"}}
                    onClick={(e) => this.handleRinkClick(e)}
                >
                    {this.renderRink()}
                    {this.state.shotX && (
                        <circle
                            cx={this.rinkToSVG(this.state.shotX, this.state.shotY).x}
                            cy={this.rinkToSVG(this.state.shotX, this.state.shotY).y}
                            r={6}
                            fill="black"
                            style={{transition: "cx 0.25s ease, cy 0.25s ease"}}
                        />
                    )}
                </svg>
                </div>
                {this.renderMenu()}
            </div>
        );
    }
}

export default HockeyRink;
