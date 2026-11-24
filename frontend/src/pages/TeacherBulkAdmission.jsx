import { useState } from "react";
import api from "../services/api";
import "./TeacherBulkAdmission.css";

function TeacherBulkAdmission() {
  const [activeTab, setActiveTab] = useState("file");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Excel / CSV
  const [selectedFile, setSelectedFile] = useState(null);

  // Google Sheet
  const [sheetUrl, setSheetUrl] = useState("");
  const [accessType, setAccessType] = useState("public");
  const [range, setRange] = useState("Sheet1!A:D");

  // Copy Paste
  const [pasteText, setPasteText] = useState("");

  // Common Import Result
  const handleResult = (data) => {
    setResult(data);
    setError("");
  };

  const handleError = (err) => {
    const message =
      err.response?.data?.message ||
      err.message ||
      "Import failed";

    setError(message);
    setResult(null);
  };

  // 1. Excel / CSV Import
  const handleFileImport = async () => {
    if (!selectedFile) {
      setError("Please select an Excel or CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await api.post(
        "/auth/bulk-student-admission/file",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      handleResult(response.data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Public / Private Google Sheet Import
  const handleSheetImport = async () => {
    if (!sheetUrl.trim()) {
      setError("Please enter Google Sheet URL");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await api.post(
        "/auth/bulk-student-admission/sheet",
        {
          url: sheetUrl.trim(),
          accessType,
          range: range.trim() || "Sheet1!A:D"
        }
      );

      handleResult(response.data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Copy Paste Import
  const handlePasteImport = async () => {
    if (!pasteText.trim()) {
      setError("Please paste student data");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await api.post(
        "/auth/bulk-student-admission/paste",
        {
          text: pasteText
        }
      );

      handleResult(response.data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "file", label: "Excel / CSV Upload" },
    { id: "public", label: "Public Google Sheet" },
    { id: "private", label: "Private Google Sheet" },
    { id: "paste", label: "Copy-Paste Import" }
  ];

  return (
    <section className="bulk-admission-container">

      <div className="bulk-admission-heading">
        <h2>Bulk Student Admission</h2>
        <p>
          एक साथ कई विद्यार्थियों का Registration करें।
        </p>
      </div>

      {/* Import Tabs */}
      <div className="bulk-admission-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={
              activeTab === tab.id ? "active" : ""
            }
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === "public" || tab.id === "private") {
  setAccessType(tab.id);
}

              setError("");
              setResult(null);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Excel / CSV */}
      {activeTab === "file" && (
        <div className="bulk-admission-panel">
          <h3>Excel / CSV Upload</h3>

          <p>
            Excel या CSV फाइल चुनें।
          </p>

          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) =>
              setSelectedFile(e.target.files[0] || null)
            }
          />

          {selectedFile && (
            <p>
              Selected File: {selectedFile.name}
            </p>
          )}

          <button
            type="button"
            onClick={handleFileImport}
            disabled={loading}
          >
            {loading ? "Importing..." : "Import File"}
          </button>
        </div>
      )}

      {/* Public / Private Google Sheet */}
      {(activeTab === "public" ||
        activeTab === "private") && (
        <div className="bulk-admission-panel">

          <h3>
            {activeTab === "public"
              ? "Public Google Sheet Import"
              : "Private Google Sheet Import"}
          </h3>

          <label>Google Sheet URL</label>

          <input
            type="url"
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            placeholder="Paste Google Sheet URL"
          />

          <label>Sheet Access Type</label>

          <select
            value={accessType}
            onChange={(e) => setAccessType(e.target.value)}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>

          <label>Sheet Range</label>

          <input
            type="text"
            value={range}
            onChange={(e) => setRange(e.target.value)}
            placeholder="Sheet1!A:D"
          />

          <button
            type="button"
            onClick={handleSheetImport}
            disabled={loading}
          >
            {loading ? "Importing..." : "Import Google Sheet"}
          </button>

        </div>
      )}

      {/* Copy Paste */}
      {activeTab === "paste" && (
        <div className="bulk-admission-panel">

          <h3>Copy-Paste Student Data</h3>

          <p>
            Excel या Google Sheets से Header सहित
            पूरा डेटा Copy करके यहाँ Paste करें।
          </p>

          <p>
            Required Columns:
            AdmissionNumber, StudentName, Class, Stream
          </p>

          <textarea
            rows="9"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={`AdmissionNumber\tStudentName\tClass\tStream
2026-401\tRahul Kumar\t10\t
2026-402\tAmit Kumar\t11\tArts
2026-403\tPooja Kumari\t12\tScience`}
          />

          <button
            type="button"
            onClick={handlePasteImport}
            disabled={loading}
          >
            {loading ? "Importing..." : "Import Pasted Data"}
          </button>

        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bulk-admission-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Import Result */}
      {result && (
        <div className="bulk-admission-result">

          <h3>Import Report</h3>

          <p>{result.message}</p>

          <div className="bulk-admission-summary">
            <div>
              <strong>{result.summary?.total ?? 0}</strong>
              <span>Total Records</span>
            </div>

            <div>
              <strong>{result.summary?.successful ?? 0}</strong>
              <span>Successful</span>
            </div>

            <div>
              <strong>{result.summary?.failed ?? 0}</strong>
              <span>Failed</span>
            </div>
          </div>

          <h4>Student Registration Details</h4>

          <div className="bulk-admission-table-wrapper">
            <table className="bulk-admission-table">
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Admission No.</th>
                  <th>Student Name</th>
                  <th>Status</th>
                  <th>Registration PIN</th>
                  <th>Message</th>
                </tr>
              </thead>

              <tbody>
                {(result.results || []).map((item, index) => (
                  <tr key={`${item.row}-${index}`}>
                    <td>{item.row}</td>
                    <td>{item.admissionNumber}</td>
                    <td>{item.studentName || "-"}</td>

                    <td>
                      {item.status === "success"
                        ? "Success"
                        : "Failed"}
                    </td>

                    <td>
                      {item.registrationPIN || "-"}
                    </td>

                    <td>
                      {item.message || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            ध्यान दें: Registration PIN केवल एक बार दिखाया जाता है।
            इसे सुरक्षित रखें।
          </p>

          <button
            type="button"
            onClick={() => {
              setResult(null);
              setError("");
            }}
          >
            Clear Report
          </button>

        </div>
      )}

    </section>
  );
}

export default TeacherBulkAdmission;
