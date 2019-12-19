/** @jsx jsx */
import { jsx } from '@emotion/core'
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import { base } from './Theme.js';
import Home from 'routes/Home.js';
import Room from 'routes/Room.js';

// import socket from "socket.io-client";

export default function App() {
  return (
    <div css={base}>
      <Router>
        {/* <Link to="/">Home</Link>
        <Link to="/room/123">Room</Link> */}
        
        <Switch>
          <Route path="/room/:id">
            <Room />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </Router>
    </div>
  )
}

// class App extends React.Component {
//   constructor() {
//     super();
//     this.io = socket();

//     this.state = {
//       color: 'white'
//     };
//   }

//   setColor = (color) => {
//     this.io.emit('change color', color)
//   }

//   componentDidMount = () => {
//       this.io.on('change color', (col) => {
//           document.body.style.backgroundColor = col
//       })
//   }

//   render() {
//     return (
//       <div style={{ textAlign: "center" }}>
//         <button id="blue" onClick={() => this.setColor('blue')}>Blue</button>
//         <button id="red" onClick={() => this.setColor('red')}>Red</button>

//       </div>
//     )
//   }
// }

// export default App;
