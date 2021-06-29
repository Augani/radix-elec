import React from "react";
import { useHistory } from "react-router-dom";
import { ProtectedRouteProps } from "../../App";
const electron = window.require("electron");
const { ipcRenderer } = electron;
const { getCurrentWindow } = electron.remote;

const Login = ({ setUser }: ProtectedRouteProps) => {
  const history = useHistory();
  const [password, setPassword] = React.useState<string>("");
  
  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password) return;
    try {
      const res = await ipcRenderer.sendSync("retrievePassword");
      if (password != res) {
        ipcRenderer.send("wrongPassword");
        return setPassword("");
      }
      history.push("/contacts");
    } catch (e) {}
  };

  const closeWindow = () => {
    let window = getCurrentWindow();
    window.close();
  };

  const clearData = async () => {
    try {
      const requestDelete = await ipcRenderer.sendSync("requestDelete");
      if (requestDelete) return;
      ipcRenderer.send("deleteUserData");
      setUser(true);
    } catch (e) {}
  };
  return (
    <main className="loginScreen">
      <h1 className="heading">
        Welcome to <br /> Simple Secure Contact Manager
      </h1>
      <h3 className="sub-heading">
        Please enter the password for your contact
        <br /> data file
      </h3>
      <form className="pass-form" onSubmit={submitForm}>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-control"
          type="password"
        />
        <div className="submit-controls">
          <button type="button" onClick={clearData}>
            Clear Data
          </button>
          <button type="button" onClick={closeWindow}>
            Close
          </button>
          <button type="submit">OK</button>
        </div>
      </form>
    </main>
  );
};

export default Login;
