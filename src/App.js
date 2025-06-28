import React, { useState } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "mdb-ui-kit/css/mdb.min.css";
import axios from "axios";

let naayaToken = localStorage.getItem("naayaToken");

const App = () => {
  const [accountType, setAccountType] = useState("signup");
  const [isUserVerified, setIsUserVerified] = useState(naayaToken !== null);
  const [excelData, setExcelData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url =
      accountType === "signup"
        ? "https://excel-contact-messenger.onrender.com/api/v1/auth/register"
        : "https://excel-contact-messenger.onrender.com/api/v1/auth/login";

    const payload =
      accountType === "signup"
        ? formData
        : {
            email: formData.email,
            password: formData.password,
          };

    try {
      const response = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
      });
      localStorage.setItem("naayaToken", response.data.token);
      setIsUserVerified(true);
      alert("Success!");
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      alert("Error occurred");
    }
  };

  const attachFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return alert("Please select a file.");

    const form = new FormData();
    form.append("excelFile", file);

    try {
      const res = await axios.post(
        "https://excel-contact-messenger.onrender.com/api/v1/upload",
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("naayaToken")}`,
          },
        }
      );
      setExcelData(res.data.data || []);
      setSelectedRows([]);
      setSelectAll(false);
      alert("File uploaded successfully!");
    } catch (err) {
      console.error("Upload Error:", err.response?.data || err.message);
      alert("File upload failed");
    }
  };

  const sendWhatsAppMessages = async (customList = selectedRows) => {
    const contacts = customList
      .filter((item) => item.name && item.phone)
      .map((item) => ({
        name: item.name,
        phone: item.phone.toString().replace(/^(\+91|91)?/, "91"),
      }));

    if (contacts.length === 0) return alert("No valid WhatsApp contacts.");

    try {
      const res = await axios.post(
        "https://excel-contact-messenger.onrender.com/api/v1/send-whatsapp",
        {
          contacts,
          messageTemplate: "Hello [Name], welcome to Excel Contact Messenger!",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("naayaToken")}`,
          },
        }
      );
      alert("WhatsApp messages sent!");
    } catch (err) {
      console.error("WhatsApp Error:", err.response?.data || err.message);
      alert("Failed to send WhatsApp messages");
    }
  };

  const sendEmailMessages = async (customList = selectedRows) => {
    const contacts = customList
      .filter((item) => item.name && item.email)
      .map((item) => ({
        name: item.name,
        email: item.email,
      }));

    if (contacts.length === 0) return alert("No valid email contacts.");

    try {
      const res = await axios.post(
        "https://excel-contact-messenger.onrender.com/api/v1/send-emails",
        {
          subject: "Welcome to Excel Contact Messenger",
          messageTemplate:
            "Hello [Name],<br>We are excited to connect with you via [Email].",
          contacts,
        },
        {
          headers: { "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("naayaToken")}`,
           }
        }
      );
      alert("Emails sent!");
    } catch (err) {
      console.error("Email Error:", err.response?.data || err.message);
      alert("Failed to send emails");
    }
  };

  const renderFileUpload = () => (
    <div className="container mt-5">
      <h2>Upload Excel File</h2>
      <input type="file" onChange={attachFile} className="form-control mb-4" />

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectAll}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setSelectAll(isChecked);
                  setSelectedRows(isChecked ? [...excelData] : []);
                }}
              />
            </th>
            <th>Name</th>
            <th>Address</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {excelData.map((item, index) => (
            <tr key={index}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedRows.some((x) => x.email === item.email)}
                  onChange={(e) => {
                    let updated = [...selectedRows];
                    if (e.target.checked) {
                      updated.push(item);
                    } else {
                      updated = updated.filter(
                        (x) => x.email !== item.email
                      );
                    }
                    setSelectedRows(updated);
                    setSelectAll(updated.length === excelData.length);
                  }}
                />
              </td>
              <td>{item.name}</td>
              <td>{item.address}</td>
              <td>{item.email}</td>
              <td>{item.phone}</td>
              <td>
                <button
                  className="btn btn-sm btn-success me-1"
                  onClick={() => sendWhatsAppMessages([item])}
                >
                  📲 WhatsApp
                </button>
                <button
                  className="btn btn-sm btn-info"
                  onClick={() => sendEmailMessages([item])}
                >
                  📧 Email
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {excelData.length > 0 && (
        <div className="mt-3">
          <button
            className="btn btn-success me-2"
            onClick={() => sendWhatsAppMessages()}
          >
            Send WhatsApp to Selected
          </button>
          <button
            className="btn btn-info"
            onClick={() => sendEmailMessages()}
          >
            Send Email to Selected
          </button>
        </div>
      )}
    </div>
  );

  const renderSignup = () => (
    <section className="text-center">
      <div className="p-5 bg-image" style={{
        backgroundImage: "url('https://mdbootstrap.com/img/new/textures/full/171.jpg')",
        height: "300px"
      }}></div>
      <div className="card mx-4 mx-md-5 shadow-5-strong bg-body-tertiary"
        style={{ marginTop: "-202px", backdropFilter: "blur(30px)" }}>
        <div className="card-body py-5 px-md-5">
          <div className="row d-flex justify-content-center">
            <div className="col-lg-8">
              <h2 className="fw-bold mb-5">Sign up now</h2>
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <input type="text" name="firstName" value={formData.firstName}
                      onChange={handleChange} required className="form-control" placeholder="First name" />
                  </div>
                  <div className="col-md-6 mb-4">
                    <input type="text" name="lastName" value={formData.lastName}
                      onChange={handleChange} required className="form-control" placeholder="Last name" />
                  </div>
                </div>
                <input type="email" name="email" value={formData.email}
                  onChange={handleChange} required className="form-control mb-4" placeholder="Email" />
                <input type="password" name="password" value={formData.password}
                  onChange={handleChange} required className="form-control mb-4" placeholder="Password" />
                <button type="submit" className="btn btn-primary btn-block mb-4">
                  Sign up
                </button>
                <button type="button" onClick={() => setAccountType("login")}
                  className="btn btn-outline-primary btn-block mb-4">
                  Already have an account? Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const renderLogin = () => (
    <section className="text-center">
      <div className="p-5 bg-image" style={{
        backgroundImage: "url('https://mdbootstrap.com/img/new/textures/full/171.jpg')",
        height: "300px"
      }}></div>
      <div className="card mx-4 mx-md-5 shadow-5-strong bg-body-tertiary"
        style={{ marginTop: "-202px", backdropFilter: "blur(30px)" }}>
        <div className="card-body py-5 px-md-5">
          <div className="row d-flex justify-content-center">
            <div className="col-lg-8">
              <h2 className="fw-bold mb-5">Login</h2>
              <form onSubmit={handleSubmit}>
                <input type="email" name="email" value={formData.email}
                  onChange={handleChange} required className="form-control mb-4" placeholder="Email" />
                <input type="password" name="password" value={formData.password}
                  onChange={handleChange} required className="form-control mb-4" placeholder="Password" />
                <button type="submit" className="btn btn-primary btn-block mb-4">
                  Log In
                </button>
                <button type="button" onClick={() => setAccountType("signup")}
                  className="btn btn-outline-primary btn-block mb-4">
                  Don't have an account? Sign up
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <>
      {isUserVerified
        ? renderFileUpload()
        : accountType === "signup"
        ? renderSignup()
        : renderLogin()}
    </>
  );
};

export default App;
