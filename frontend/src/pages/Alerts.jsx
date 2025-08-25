import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/alerts").then((res) => {
      setAlerts(res.data);
    });
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Threat Alerts</h2>

      {alerts.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-6 text-center text-slate-600">
          🚨 No alerts detected yet.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-lg font-semibold text-slate-800">
                    {alert.type}
                  </p>
                  <p className="text-sm text-slate-500">{alert.timestamp}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    alert.type.toLowerCase().includes("high")
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {alert.type}
                </span>
              </div>
              {alert.image_url && (
                <img
                  src={alert.image_url}
                  alt="threat"
                  className="h-40 w-full object-cover rounded-lg"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
