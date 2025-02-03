import { useState, useEffect } from "react";

function App() {
  const baseurl = "https://bit-stock-api.vercel.app";
  const [companies, setCompanies] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (message !== "") {
      const timer = setTimeout(() => {
        setMessage("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseurl}/companies`);
      if (!response.ok) {
        throw new Error("Failed to fetch companies");
      }
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error("Error fetching companies:", error);
      setMessage("Failed to load companies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (company = null) => {
    setSelectedCompany(company);
    setModalOpen(true);
    setIsCreating(!company);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCompany(null);
    setNewCompanyName("");
    setIsCreating(false);
  };

  const handleAction = async () => {
    setLoading(true);
    try {
      if (isCreating) {
        const response = await fetch(`${baseurl}/companies`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: newCompanyName }),
        });

        if (!response.ok) {
          throw new Error("Failed to create company");
        }

        const newCompany = await response.json();
        setCompanies([...companies, newCompany]);
        setMessage("Company created successfully!");
      } else {
        const response = await fetch(
          `${baseurl}/companies/${selectedCompany.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ isPaid: !selectedCompany.isPaid }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update company");
        }

        setCompanies(
          companies.map((company) =>
            company.id === selectedCompany.id
              ? { ...company, isPaid: !company.isPaid }
              : company
          )
        );
        setMessage(
          `Company ${
            selectedCompany.isPaid ? "blocked" : "unblocked"
          } successfully!`
        );
      }
      closeModal();
    } catch (error) {
      console.error("Error:", error);
      setMessage(
        `Failed to ${
          isCreating ? "create" : "update"
        } company. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      {message && <div style={messageStyle}>{message}</div>}
      <button
        onClick={() => openModal()}
        style={createButtonStyle}
        disabled={loading}
      >
        Create Company
      </button>
      {loading && <div style={loadingStyle}>Loading...</div>}
      <table style={tableStyle}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={tableHeaderStyle}>Company Name</th>
            <th style={tableHeaderStyle}>Pay Status</th>
            <th style={tableHeaderStyle}>Action</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={tableCellStyle}>{company.name}</td>
              <td style={tableCellStyle}>
                {company.isPaid ? "Paid" : "Unpaid"}
              </td>
              <td style={tableCellStyle}>
                <button
                  onClick={() => openModal(company)}
                  style={{
                    ...buttonStyle,
                    backgroundColor: company.isPaid ? "#ff4d4d" : "#4CAF50",
                    color: "white",
                  }}
                  disabled={loading}
                >
                  {company.isPaid ? "Block" : "Unblock"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ marginTop: 0 }}>
              {isCreating ? "Create Company" : "Confirmation"}
            </h2>
            {isCreating ? (
              <div>
                <label htmlFor="companyName">Company Name:</label>
                <input
                  type="text"
                  id="companyName"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  style={inputStyle}
                />
              </div>
            ) : (
              <p>
                Are you sure you want to{" "}
                {selectedCompany.isPaid ? "block" : "unblock"}{" "}
                {selectedCompany.name}?
              </p>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "20px",
              }}
            >
              <button
                onClick={closeModal}
                style={{
                  ...buttonStyle,
                  marginRight: "10px",
                  backgroundColor: "#ccc",
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                style={{ ...buttonStyle, backgroundColor: "#4CAF50" }}
                disabled={loading}
              >
                {loading ? "Processing..." : isCreating ? "Create" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles
const containerStyle = {
  fontFamily: "Arial, sans-serif",
  maxWidth: "800px",
  margin: "0 auto",
  padding: "20px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
};

const tableHeaderStyle = {
  padding: "12px",
  textAlign: "left",
  borderBottom: "2px solid #ddd",
};

const tableCellStyle = {
  padding: "12px",
  textAlign: "left",
};

const buttonStyle = {
  padding: "8px 12px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalStyle = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "8px",
  maxWidth: "400px",
  width: "100%",
};

const createButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#4CAF50",
  color: "white",
  marginBottom: "20px",
};

const inputStyle = {
  width: "100%",
  padding: "8px",
  marginTop: "8px",
  borderRadius: "4px",
  border: "1px solid #ccc",
};

const loadingStyle = {
  textAlign: "center",
  marginTop: "20px",
  fontSize: "18px",
};

const messageStyle = {
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "4px",
  backgroundColor: "#e6f7ff",
  border: "1px solid #91d5ff",
  color: "#0050b3",
};

export default App;
