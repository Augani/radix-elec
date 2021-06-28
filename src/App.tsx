import React from 'react';
import { BrowserRouter as Router, Switch, Route, RouteProps } from 'react-router-dom';
import './App.global.css';
import Contacts from './pages/Contacts';
import Main from './pages/Main';
import Login from './pages/Login';
const electron = window.require('electron');
const { ipcRenderer } = electron;

export interface ProtectedRouteProps extends RouteProps{
  firstTime?: boolean;
  component?: any;
  setUser: (x:boolean) => void;

}

const InitialRouter = ({firstTime,setUser, ...routeProps}: ProtectedRouteProps)=> {
  if(firstTime) {
    return <Route  render={()=><Main setUser={setUser}  />} {...routeProps}  />;
  } else {
    console.log('login')
    return <Route render={()=><Login setUser={setUser}  />} {...routeProps} />;
  }
};

export default function App() {
  const [firstTime,setFirstTime] = React.useState(true);
  const setUser = (value: boolean)=>{
    setFirstTime(value);
  }

  React.useEffect(()=>{
    let checkUserPassword = async ()=> {
     try{
      const res = await ipcRenderer.sendSync('retrievePassword');
      if(res)setFirstTime(false);
     }catch(e){}
    }

    checkUserPassword();
  }, []);

  return (
    <Router>
      <Switch>
        <Route path="/contacts" component={Contacts}/>
        <Route path="/login" component={Login}/>
        <InitialRouter firstTime={firstTime}  path="/" setUser={setUser}   />
      </Switch>
    </Router>
  );
}
