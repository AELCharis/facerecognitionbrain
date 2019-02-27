import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Clarifai  from  'clarifai';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import './App.css';

const app = new Clarifai.App({
    apiKey: 'dd149553a3d14add91a34685688a3b1d'
});

const particlesOptions = {
    particles: {
        number:{
            value:80,
            density: {
                enable:true,
                value_area:800
            }
        },
        shape: {
            type: "circle",
            stroke: {
                width: 0,
                color: "#000000"
            },
            polygon: {
                nb_sides: 5
            }
        },
        color: {
            value: "#ffffff"
        },
        opacity:{
            value: 1,
            random: false,
            anim: {
                enable: false,
                speed: 1,
                opacity_min: 1,
                sync: true
            }
        },
    },
    interactivity: {
        detect_on: "window",
        events: {
            onhover: {
                enable: true,
                mode: "grab"
            },
            onclick: {
                enable: true,
                mode: "repulse"
            },
            resize: true
        },
        modes: {
            grab: {
                distance: 800,
                line_linked: {
                    opacity: 1
                }
            },
            bubble: {
                distance: 800,
                size: 80,
                duration: 2,
                opacity: 0.8,
                speed: 3
            },
            repulse: {
                distance: 400,
                duration: 0.4
            },
            push: {
                particles_nb: 4
            },
            remove: {
                particles_nb: 2
            }
        }
    }
};

class App extends Component {
    constructor() {
        super();
        this.state = {
            input: '',
            imageUrl: '',
            box: {},
            route: 'signin',
            isSignedIn: false,
            user: {
                id: '',
                name: '',
                email: '',
                entries: 0,
                joined: ''
            }
        }
    }

    loadUser = (data) => {
        this.setState({user: {         //kane update to state me to user pou tha paroume apo kathe user
            id: data.id,
            name: data.name,
            email: data.email,
            entries: data.entries,
            joined: data.joined
        }})
  }


    calculateFaceLocation = (data) => {
        const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
        const image = document.getElementById('inputimage');
        const width = Number(image.width);
        const height = Number(image.height);
        return {
            leftCol: clarifaiFace.left_col * width,
            topRow: clarifaiFace.top_row * height,
            rightCol: width - (clarifaiFace.right_col * width),
            bottomRow: height - (clarifaiFace.bottom_row * height)
        }
    }
    displayFaceBox = (box) => {
        this.setState({box: box});
    }


    onInputChange = (event) => {
            this.setState({input: event.target.value});
    }

    onButtonSubmit = () => {
        this.setState({imageUrl : this.state.input});
        app.models.predict(Clarifai.FACE_DETECT_MODEL,
            this.state.input)
            .then(response => {
                if(response) {
                    fetch('http://localhost:3018/image',{
                        method: 'put',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            id:    this.state.user.id
                    })
                })
                        .then(response => response.json())
                        .then(count => {
                        this.setState(Object.assign(this.state.user, {entries: count }))
                        })
                }
                this.displayFaceBox(this.calculateFaceLocation(response)) //display k calculate
            })
            .catch(err =>console.log(err));

    }

            onRouteChange = (route) => {
        if(route === 'signout') {
            this.setState({isSignedIn: false}) //if its not sing in
        } else if (route === 'home') {
            this.setState({isSignedIn: true}) //if its sing in
        }
        this.setState({route: route}); // and wtv is it flase or true we still want to change the route
        }


  render() {
    const  {isSignedIn, imageUrl, route, box} = this.state;
    return (
      <div className="App">
          <Particles className='particles'
              params={particlesOptions}
               />
          <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange} />
          { route === 'home'
              ? <div> <Logo />
                  {/*<Rank />*/}
                  <Rank
                      name={this.state.user.name}
                      entries={this.state.user.entries}
                  />
                  <ImageLinkForm
                      onInputChange={this.onInputChange}
                      onButtonSubmit={this.onButtonSubmit}
                  />
                  <FaceRecognition box={box} imageUrl={imageUrl}/>
              </div>
                  :(
                  route === 'signin'
                   ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
                      // <Signin onRouteChange={this.onRouteChange}/>
                   :<Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
                  )
        }
      </div>
    );
  }
}

export default App;