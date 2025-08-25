import React from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-slate-900 shadow-md px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-white tracking-wide">
        CCTV Threat Monitor
      </h1>
      <div className="space-x-6">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `font-medium ${
              isActive ? "text-blue-400 border-b-2 border-blue-400" : "text-white hover:text-blue-300"
            }`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/alerts"
          className={({ isActive }) =>
            `font-medium ${
              isActive ? "text-blue-400 border-b-2 border-blue-400" : "text-white hover:text-blue-300"
            }`
          }
        >
          Alerts
        </NavLink>
      </div>
    </nav>
  );
}
