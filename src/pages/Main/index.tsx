import React from "react";
import {  useHistory } from "react-router-dom";
import { ProtectedRouteProps } from "../../App";
const electron = window.require("electron");
const { ipcRenderer } = electron;
const { getCurrentWindow } = electron.remote;

const Main = ({ setUser }: ProtectedRouteProps) => {
  const history = useHistory();
  const [password, setPassword] = React.useState<string>("");
  const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    ipcRenderer.send("createPassword", password);
    ipcRenderer.on("passwordCreated", (event: any, arg: boolean) => {
      history.push("/contacts");
    });
  };

  const closeWindow = () => {
    let window = getCurrentWindow();
    window.close();
  };
  return (
    <main className="mainscreen">
      <h1 className="heading">
        Welcome to <br /> Simple Secure Contact Manager
      </h1>
      <h3 className="sub-heading">
        Please enter a password for your new <br /> contact data file
      </h3>
      <form className="pass-form" onSubmit={submitForm}>
        <input
          onChange={(e) => setPassword(e.target.value)}
          className="form-control"
          type="password"
        />
        <div className="submit-controls">
          <button type="button" onClick={closeWindow}>
            Close
          </button>
          <button type="submit">OK</button>
        </div>
      </form>
    </main>
  );
};

export default Main;
