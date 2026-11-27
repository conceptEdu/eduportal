import { useEffect, useState } from "react";
import api from "../services/api";


function BackendTest() {
  const [status, setStatus] = useState("Checking...");
  const [details, setDetails] = useState("");


  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await api.get("/health");


        setStatus("Backend Connected Successfully");
        setDetails(response.data.message || "Health API Working");
      } catch (error) {
        setStatus("Backend Connection Failed");
        setDetails(
          error.response?.data?.message ||
          error.message
        );
      }
    };


    checkBackend();
  }, []);


  return (
    <div style={{ padding: "30px" }}>
      <h2>EduPortal Backend Test</h2>
      <h3>{status}</h3>
      <p>{details}</p>
    </div>
  );
}


export default BackendTest;
