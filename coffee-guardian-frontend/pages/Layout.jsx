// Layout.jsx or App.jsx (where Navbar is imported)
import React from "react";
import Navbar from "../components/common/Navbar";

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      {/* Add padding top to offset fixed navbar height: h-16 = 64px */}
      <main className="pt-16">
        {children}
      </main>
    </>
  );
}
