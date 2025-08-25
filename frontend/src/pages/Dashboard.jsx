import { useState } from "react";
import axios from "axios";
import { Upload, Video, CheckCircle, XCircle } from "lucide-react"; // nice icons

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setStatus("");
      const res = await axios.post("http://localhost:8000/upload", formData);
      setStatus("Threats Detected: " + JSON.stringify(res.data.alerts));
    } catch (err) {
      setStatus("Error uploading video.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 flex justify-center items-center gap-2">
          <Video className="h-8 w-8 text-blue-600" />
          CCTV Threat Detection
        </h2>
        <p className="text-slate-600 mt-2">
          Upload CCTV footage to automatically scan for potential security threats.
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-2xl mx-auto space-y-6">
        <div className="flex flex-col items-center gap-4">
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-6 w-full cursor-pointer hover:border-blue-500 transition"
          >
            <Upload className="h-10 w-10 text-slate-400 mb-2" />
            <p className="text-slate-600 font-medium">
              {file ? file.name : "Click to upload or drag and drop video"}
            </p>
            <input
              id="file-upload"
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
            />
          </label>

          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg 
            hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Uploading..." : "Upload & Detect"}
          </button>
        </div>

        {/* Status */}
        {status && (
          <div
            className={`flex items-center gap-2 p-4 rounded-lg text-sm font-medium ${
              status.startsWith("Error")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {status.startsWith("Error") ? (
              <XCircle className="h-5 w-5" />
            ) : (
              <CheckCircle className="h-5 w-5" />
            )}
            {status}
          </div>
        )}
      </div>

      {/* Future-proof: Recent Uploads/Insights */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Recent Uploads
          </h3>
          <p className="text-slate-500 text-sm">No recent uploads yet.</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Threat Summary
          </h3>
          <p className="text-slate-500 text-sm">No data available.</p>
        </div>
      </div>
    </div>
  );
}
