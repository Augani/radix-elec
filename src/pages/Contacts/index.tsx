import React from "react";
const electron = window.require("electron");
const { ipcRenderer } = electron;
import ContactForm, { IContact } from "../../components/ContactForm";

function Contacts() {
  const [contacts, setContacts] = React.useState<IContact[]>([]);
  const [showForm, setShowForm] = React.useState<boolean>(false);
  const [refresh, setRefresh] = React.useState(false);
  const [contactView, setContactView] = React.useState<IContact>({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    email: "",
    id: "",
  })

  React.useEffect(() => {
    const getContacts = async () => {
      let resultContacts = await ipcRenderer.sendSync("getContactList");
      setContacts(resultContacts);
    };
    getContacts();
  }, [refresh]);

  const submitForm = async (contact: IContact) => {
    console.log(contact.id, contactView.id);
    let newContacts =
      contact.id === contactView.id
        ? contacts.filter((cont) => cont.id !== contact.id)
        : contacts;
    console.log(newContacts);
    newContacts.push(contact);
    const saved = await ipcRenderer.sendSync("saveContacts", newContacts);
    if (saved) {
      setRefresh(!refresh);
      setContactView({
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        email: "",
        id: "",
      });
      setShowForm(false);
    }
  };

  const viewContact = (id: string) => {
    const contact = contacts.filter((contact) => contact.id === id)[0];
    setContactView(contact);
  };

  const addContact = () => {
    setContactView({
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      email: "",
      id: "",
    });
    setShowForm(true);
  };

  return (
    <div className="contacts main">
      <div className="side">
        <ul className="list">
          {contacts &&
            contacts.map((c: IContact) => (
              <li key={c.id} onClick={() => viewContact(c.id)}>
                {c.firstName} {c.lastName}
              </li>
            ))}
        </ul>
      </div>
      <div className="detail">
        {showForm ? (
          <ContactForm
            data={contactView}
            cancelForm={() => setShowForm(false)}
            submitForm={submitForm}
          />
        ) : (
          <div className="titleHolder">
            {contactView?.firstName ? (
              <>
                <h2>
                  {contactView.firstName} {contactView.lastName}
                </h2>
                <div className="otherDetails">
                  <p>Phone: {contactView.phone}</p>
                  <p>Email: {contactView.email}</p>
                  <p>
                    Address: <br></br>
                    {contactView.address}
                  </p>
                </div>
              </>
            ) : (
              <h2>Select a contact on the left to view</h2>
            )}
          </div>
        )}
      </div>
      {!showForm && (
        <div className="action">
          <button className="btn" onClick={addContact}>
            Add
          </button>
          {contactView?.firstName && (
            <button onClick={() => setShowForm(true)} className="btn">
              Edit
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Contacts;
