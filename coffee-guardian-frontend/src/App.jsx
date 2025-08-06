// // // App.jsx - Main application component with routing
// // import { Routes, Route, Navigate } from "react-router-dom";
// // import { Toaster } from "react-hot-toast";
// // import React from "react";
// // import { useAuth } from "../context/AuthContext";
// // import Navbar from "../components/common/Navbar";
// // import Sidebar from "../components/common/Sidebar";
// // import Loading from "../components/common/Loading";

// // // Import all pages
// // import Login from "../pages/Login";
// // import Register from "../pages/Register";
// // import Dashboard from "../pages/Dashboard";
// // import Practices from "../pages/Practices";
// // import Labor from "../pages/Labor";
// // import Expenses from "../pages/Expenses";
// // import Prices from "../pages/Prices";
// // import Profile from "../pages/Profile";
// // import Admin from "../pages/Admin";

// // // Protected route wrapper component
// // function ProtectedRoute({ children, adminOnly = false }) {
// //   const { user, loading } = useAuth();

// //   if (loading) return <Loading />;
// //   if (!user) return <Navigate to="/login" replace />;
// //   if (adminOnly && user.role !== "admin")
// //     return <Navigate to="/dashboard" replace />;

// //   return children;
// // }

// // // Public route wrapper (redirects to dashboard if already logged in)
// // function PublicRoute({ children }) {
// //   const { user, loading } = useAuth();

// //   if (loading) return <Loading />;
// //   if (user) return <Navigate to="/dashboard" replace />;

// //   return children;
// // }

// // function App() {
// //   const { user, loading } = useAuth();

// //   if (loading) {
// //     return <Loading />;
// //   }

// //   return (
// //     <div className="min-h-screen bg-gray-800">
// //       {/* Show navigation only for authenticated users */}
// //       {user && (
// //         <>
// //           <Navbar />

// //           <div className="flex">
// //             <Sidebar />

// //             <main className="flex-1 overflow-x-hidden">
// //               <div className="p-6">
// //                 <Routes>
// //                   <Route
// //                     path="/dashboard"
// //                     element={
// //                       <ProtectedRoute>
// //                         <Dashboard />
// //                       </ProtectedRoute>
// //                     }
// //                   />
// //                   <Route
// //                     path="/practices"
// //                     element={
// //                       <ProtectedRoute>
// //                         <Practices />
// //                       </ProtectedRoute>
// //                     }
// //                   />
// //                   <Route
// //                     path="/labor"
// //                     element={
// //                       <ProtectedRoute>
// //                         <Labor />
// //                       </ProtectedRoute>
// //                     }
// //                   />
// //                   <Route
// //                     path="/expenses"
// //                     element={
// //                       <ProtectedRoute>
// //                         <Expenses />
// //                       </ProtectedRoute>
// //                     }
// //                   />
// //                   <Route
// //                     path="/prices"
// //                     element={
// //                       <ProtectedRoute>
// //                         <Prices />
// //                       </ProtectedRoute>
// //                     }
// //                   />
// //                   <Route
// //                     path="/profile"
// //                     element={
// //                       <ProtectedRoute>
// //                         <Profile />
// //                       </ProtectedRoute>
// //                     }
// //                   />
// //                   <Route
// //                     path="/admin"
// //                     element={
// //                       <ProtectedRoute adminOnly>
// //                         <Admin />
// //                       </ProtectedRoute>
// //                     }
// //                   />
// //                   <Route
// //                     path="*"
// //                     element={<Navigate to="/dashboard" replace />}
// //                   />
// //                 </Routes>
// //               </div>
// //             </main>
// //           </div>
// //         </>
// //       )}

// //       {/* Show public routes for non-authenticated users */}
// //       {!user && (
// //         <div className="min-h-screen flex items-center justify-center">
// //           <Routes>
// //             <Route
// //               path="/login"
// //               element={
// //                 <PublicRoute>
// //                   <Login />
// //                 </PublicRoute>
// //               }
// //             />
// //             <Route
// //               path="/register"
// //               element={
// //                 <PublicRoute>
// //                   <Register />
// //                 </PublicRoute>
// //               }
// //             />
// //             <Route path="*" element={<Navigate to="/login" replace />} />
// //           </Routes>
// //         </div>
// //       )}

// //       {/* Toast notifications */}
// //       <Toaster
// //         position="top-right"
// //         toastOptions={{
// //           duration: 4000,
// //           style: {
// //             background: "#363636",
// //             color: "#fff",
// //           },
// //           success: {
// //             duration: 3000,
// //             theme: {
// //               primary: "green",
// //               secondary: "black",
// //             },
// //           },
// //         }}
// //       />
// //     </div>
// //   );
// // }

// // export default App;

// import { Routes, Route, Navigate } from "react-router-dom";
// import { Toaster } from "react-hot-toast";
// import React, { useState } from "react";
// import { FaBars } from "react-icons/fa"; // Hamburger icon
// import { useAuth } from "../context/AuthContext";
// import Navbar from "../components/common/Navbar";
// import Sidebar from "../components/common/Sidebar";
// import Loading from "../components/common/Loading";

// // Import all pages
// import Login from "../pages/Login";
// import Register from "../pages/Register";
// import Dashboard from "../pages/Dashboard";
// import Practices from "../pages/Practices";
// import Labor from "../pages/Labor";
// import Expenses from "../pages/Expenses";
// import Prices from "../pages/Prices";
// import Profile from "../pages/Profile";
// import Admin from "../pages/Admin";

// // Protected route wrapper component
// function ProtectedRoute({ children, adminOnly = false }) {
//   const { user, loading } = useAuth();

//   if (loading) return <Loading />;
//   if (!user) return <Navigate to="/login" replace />;
//   if (adminOnly && user.role !== "admin")
//     return <Navigate to="/dashboard" replace />;

//   return children;
// }

// // Public route wrapper (redirects to dashboard if already logged in)
// function PublicRoute({ children }) {
//   const { user, loading } = useAuth();

//   if (loading) return <Loading />;
//   if (user) return <Navigate to="/dashboard" replace />;

//   return children;
// }

// function App() {
//   const { user, loading } = useAuth();

//   // Sidebar toggle state
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   // Loading fallback
//   if (loading) {
//     return <Loading />;
//   }

//   // Toggle handler
//   const toggleSidebar = () => {
//     setSidebarOpen((prev) => !prev);
//   };

//   return (
//     <div className="min-h-screen bg-gray-800 flex flex-col">
//       {/* Show navigation only for authenticated users */}
//       {user && (
//         <>
//           {/* Navbar - pass toggleSidebar to show toggle button */}
//           <Navbar>
//             {/* Add toggle button inside Navbar or here */}
//             <button
//               onClick={toggleSidebar}
//               className="text-grey md:hidden focus:outline-none p-2"
//               aria-label="Toggle sidebar"
//               title="Toggle sidebar"
//             >
//               <FaBars size={24} />
//             </button>
//           </Navbar>

//           {/* Main flex container */}
//           <div className="flex flex-1 min-h-0">
//             {/* Sidebar */}
//             {/*
//               Sidebar is:
//                - fixed/overlayed on small devices, slides in/out based on sidebarOpen
//                - always visible on md+ screens
//             */}
//             <aside
//   className={`fixed inset-y-0 left-0 bg-gray-900 text-white w-64
//     transform transition-transform duration-300 ease-in-out z-40
//     ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
//     md:translate-x-0 md:static md:flex-shrink-0
//   `}
// >
//   <Sidebar closeSidebar={() => setSidebarOpen(false)} />
// </aside>

//             {/* Overlay for small screen when sidebar is open */}
//             {sidebarOpen && (
//               <div
//                 className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
//                 onClick={() => setSidebarOpen(false)}
//                 aria-hidden="true"
//               />
//             )}

//             {/* Main content area */}
//             <main className="flex-1 overflow-x-hidden p-6">
//               <Routes>
//                 <Route
//                   path="/dashboard"
//                   element={
//                     <ProtectedRoute>
//                       <Dashboard />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/practices"
//                   element={
//                     <ProtectedRoute>
//                       <Practices />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/labor"
//                   element={
//                     <ProtectedRoute>
//                       <Labor />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/expenses"
//                   element={
//                     <ProtectedRoute>
//                       <Expenses />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/prices"
//                   element={
//                     <ProtectedRoute>
//                       <Prices />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/profile"
//                   element={
//                     <ProtectedRoute>
//                       <Profile />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/admin"
//                   element={
//                     <ProtectedRoute adminOnly>
//                       <Admin />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="*"
//                   element={<Navigate to="/dashboard" replace />}
//                 />
//               </Routes>
//             </main>
//           </div>
//         </>
//       )}

//       {/* Show public routes for non-authenticated users */}
//       {!user && (
//         <div className="min-h-screen flex items-center justify-center">
//           <Routes>
//             <Route
//               path="/login"
//               element={
//                 <PublicRoute>
//                   <Login />
//                 </PublicRoute>
//               }
//             />
//             <Route
//               path="/register"
//               element={
//                 <PublicRoute>
//                   <Register />
//                 </PublicRoute>
//               }
//             />
//             <Route path="*" element={<Navigate to="/login" replace />} />
//           </Routes>
//         </div>
//       )}

//       {/* Toast notifications */}
//       <Toaster
//         position="top-right"
//         toastOptions={{
//           duration: 4000,
//           style: {
//             background: "#363636",
//             color: "#fff",
//           },
//           success: {
//             duration: 3000,
//             theme: {
//               primary: "green",
//               secondary: "black",
//             },
//           },
//         }}
//       />
//     </div>
//   );
// }

// export default App;

import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import React, { useState } from "react";
import { FaBars } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import Loading from "../components/common/Loading";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Practices from "../pages/Practices";
import Labor from "../pages/Labor";
import Expenses from "../pages/Expenses";
import Prices from "../pages/Prices";
import Profile from "../pages/Profile";
import Admin from "../pages/Admin";
import Layout from "../pages/Layout";

// Protected route wrapper component
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin")
    return <Navigate to="/dashboard" replace />;
  return children;
}

// Public route wrapper (redirects to dashboard if already logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col">
      {/* Show navigation only for authenticated users */}
      {user && (
        <>
          {/* Navbar */}
          <Layout>
            {/* Hamburger for sidebar - visible only on mobile */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="fixed top-4 left-4 z-50 bg-gray-900 rounded-lg p-2 text-white shadow md:hidden"
              aria-label="Toggle sidebar"
              type="button"
            >
              <FaBars size={22} />
            </button>

            {/* Layout row: Sidebar + Content */}
            <div className="flex flex-1 min-h-0 relative">
              {/* Sidebar */}
              <aside
                className={`
                fixed inset-y-0 left-0 w-64 bg-gray-900 z-40
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                md:translate-x-0 md:static md:flex-shrink-0
              `}
              >
                <Sidebar closeSidebar={() => setSidebarOpen(false)} />
              </aside>
              {/* Overlay */}
              {sidebarOpen && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
                  onClick={() => setSidebarOpen(false)}
                  aria-hidden="true"
                />
              )}
              {/* Main content */}
              <main className="flex-1 overflow-x-hidden p-6">
                <Routes>
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/practices"
                    element={
                      <ProtectedRoute>
                        <Practices />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/labor"
                    element={
                      <ProtectedRoute>
                        <Labor />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/expenses"
                    element={
                      <ProtectedRoute>
                        <Expenses />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/prices"
                    element={
                      <ProtectedRoute>
                        <Prices />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute adminOnly>
                        <Admin />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                  />
                </Routes>
              </main>
            </div>
          </Layout>
        </>
      )}

      {/* Public routes for unauthenticated users */}
      {!user && (
        <div className="min-h-screen flex items-center justify-center">
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      )}

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: "#363636", color: "#fff" },
          success: {
            duration: 3000,
            theme: { primary: "green", secondary: "black" },
          },
        }}
      />
    </div>
  );
}

export default App;
