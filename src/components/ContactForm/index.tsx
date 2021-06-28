import { setPassword } from "keytar";
import React, { ReactElement } from "react";
import { v4 as uuidv4 } from "uuid";

interface Props {
  submitForm: (e: IContact) => void;
  cancelForm: () => void;
  data?: IContact;
}

export interface IContact {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address: string;
}
export default function index({
  submitForm,
  cancelForm,
  data,
}: Props): ReactElement {
  const [state, setState] =
    React.useState <
    IContact >
    (data?.firstName
      ? data
      : {
          firstName: "",
          lastName: "",
          phone: "",
          address: "",
          email: "",
          id: "",
        });
  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    state.id = data?.id ? data.id : uuidv4();
    submitForm(state);
  };

  return (
    <form onSubmit={submit}>
      <input
        autoFocus
        required
        name="firstName"
        placeholder="First name"
        onChange={onChange}
        value={state.firstName}
        className="form-control"
        type="text"
      />
      <input
        required
        name="lastName"
        placeholder="Last name"
        onChange={onChange}
        value={state.lastName}
        className="form-control"
        type="text"
      />
      <input
        required
        name="phone"
        placeholder="Phone number"
        onChange={onChange}
        value={state.phone}
        className="form-control"
        type="phone"
      />
      <input
        name="email"
        placeholder="Email"
        onChange={onChange}
        value={state.email}
        className="form-control"
        type="email"
      />
      <textarea
        required
        name="address"
        value={state.address}
        placeholder="Address"
        className="form-control"
        onChange={onChange}
      ></textarea>
      <button type="submit">Save</button>
      <button type="button" onClick={cancelForm}>
        Cancel
      </button>
    </form>
  );
}
