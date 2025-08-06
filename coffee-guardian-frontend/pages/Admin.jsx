import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listUsers,
  updateUser,
  deleteUser,
  getSystemStats,
  listPractices,
  addPractice,
  updatePractice,
  deletePractice,
  cleanupOldData,
  exportData,
} from "../services/admin"; // <-- create these thin wrappers
import Loading from "../components/common/Loading";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { toast } from "react-hot-toast";

export default function Admin() {
  const [tab, setTab] = useState("stats");
  const qc = useQueryClient();

  /* ───── DASHBOARD DATA ───────────────────────────── */
  const { data: stats, isLoading: statsLoading } = useQuery(
    ["adminStats"],
    getSystemStats
  );

  /* ───── USER MANAGEMENT ──────────────────────────── */
  const { data: users, isLoading: usersLoading } = useQuery(
    ["adminUsers"],
    () => listUsers(1, 999)
  ); // simple all-users list

  const updUser = useMutation(({ id, body }) => updateUser(id, body), {
    onSuccess: () => {
      toast.success("User updated");
      qc.invalidateQueries(["adminUsers"]);
    },
  });

  const delUser = useMutation(deleteUser, {
    onSuccess: () => {
      toast.success("User removed");
      qc.invalidateQueries(["adminUsers"]);
    },
  });

  /* ───── PRACTICES MANAGEMENT ─────────────────────── */
  const { data: practices, isLoading: practicesLoading } = useQuery(
    ["adminPractices"],
    listPractices
  );

  const createPractice = useMutation(addPractice, {
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries(["adminPractices"]);
    },
  });
  const editPractice = useMutation(({ id, body }) => updatePractice(id, body), {
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries(["adminPractices"]);
    },
  });
  const removePractice = useMutation(deletePractice, {
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries(["adminPractices"]);
    },
  });

  /* ───── OTHER ACTIONS ────────────────────────────── */
  const cleanup = () =>
    cleanupOldData(365).then(() => toast.success("Cleanup done"));

  const doExport = async (type, format) => {
    const blob = await exportData(type, format);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${type}-export.${format}`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  /* ───── RENDER HELPERS ───────────────────────────── */
  const TabBtn = ({ id, label }) => (
    <button
      onClick={() => setTab(id)}
      className={`px-4 py-2 rounded-t ${
        tab === id ? "bg-white text-primary" : "bg-gray-200"
      }`}
    >
      {label}
    </button>
  );

  /* ───── UI ───────────────────────────────────────── */
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Console</h1>

      {/* TAB HEADERS */}
      <div className="flex space-x-1">
        <TabBtn id="stats" label="Dashboard" />
        <TabBtn id="users" label="Users" />
        <TabBtn id="practices" label="Practices" />
        <TabBtn id="maintenance" label="Maintenance" />
        <TabBtn id="export" label="Export" />
      </div>

      {/* TAB CONTENT */}
      <div className="bg-white rounded-b shadow p-6">
        {tab === "stats" && (
          <>
            {statsLoading ? (
              <Loading />
            ) : (
              <div className="grid md:grid-cols-4 gap-4">
                <Card title="Total Users" val={stats.totalUsers} />
                <Card title="Labor Records" val={stats.totalLabor} />
                <Card title="Expense Records" val={stats.totalExpenses} />
                <Card title="Prices (7 d)" val={stats.recentPrices} />
              </div>
            )}
          </>
        )}

        {tab === "users" && (
          <>
            {usersLoading ? (
              <Loading />
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="p-2">Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {users.users.map((u) => (
                    <tr
                      key={u._id}
                      className="border-b last:border-0 text-center"
                    >
                      <td className="p-2">{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <select
                          value={u.role}
                          onChange={(e) =>
                            updUser.mutate({
                              id: u._id,
                              body: { role: e.target.value },
                            })
                          }
                          className="border rounded px-1 py-0.5 text-xs"
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            if (confirm("Delete this user?"))
                              delUser.mutate(u._id);
                          }}
                          className="text-red-600 hover:underline"
                        >
                          delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {tab === "practices" && (
          <>
            {practicesLoading ? (
              <Loading />
            ) : (
              <>
                {/* New practice form */}
                <NewPracticeForm save={createPractice.mutate} />
                {/* List */}
                <div className="overflow-auto max-h-[60vh] mt-6">
                  <table className="w-full text-sm">
                    <thead className="bg-primary text-white">
                      <tr>
                        <th className="p-2">Crop</th>
                        <th>Month</th>
                        <th>Updated</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {practices.map((p) => (
                        <tr
                          key={p._id}
                          className="border-b last:border-0 text-center"
                        >
                          <td className="p-2">{p.crop}</td>
                          <td>{p.month}</td>
                          <td>
                            {new Date(
                              p.lastUpdated || p.createdAt
                            ).toLocaleDateString()}
                          </td>
                          <td>
                            <button
                              onClick={() => removePractice.mutate(p._id)}
                              className="text-red-600 hover:underline"
                            >
                              delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}

        {tab === "maintenance" && (
          <div className="space-y-4">
            <p>
              Trigger cleanup of old price data (older than 365 days) and other
              housekeeping tasks.
            </p>
            <Button variant="danger" onClick={cleanup}>
              Run Cleanup
            </Button>
          </div>
        )}

        {tab === "export" && (
          <div className="space-y-4">
            <p>
              Select what you want to export. JSON is default; CSV available
              where applicable.
            </p>
            {["users", "practices", "labor", "expenses", "prices"].map(
              (type) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="capitalize w-24">{type}</span>
                  <Button onClick={() => doExport(type, "json")}>JSON</Button>
                  <Button
                    variant="secondary"
                    onClick={() => doExport(type, "csv")}
                  >
                    CSV
                  </Button>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Small helpers ---------- */
function Card({ title, val }) {
  return (
    <div className="bg-gray-100 p-4 rounded text-center">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold">{val}</p>
    </div>
  );
}

/* ---------- Form for new practice ---------- */
function NewPracticeForm({ save }) {
  const [form, setForm] = useState({
    crop: "Coffee",
    month: "January",
    practices: {
      "Cultural Practices Summary": ["…"],
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    save(form);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded shadow">
      <div className="flex gap-4 flex-wrap">
        <Input
          label="Crop"
          value={form.crop}
          onChange={(e) => setForm({ ...form, crop: e.target.value })}
        />
        <Input
          label="Month"
          value={form.month}
          onChange={(e) => setForm({ ...form, month: e.target.value })}
        />
        <Input
          label="Practice (summary)"
          value={form.practices["Cultural Practices Summary"][0]}
          onChange={(e) =>
            setForm({
              ...form,
              practices: {
                ...form.practices,
                "Cultural Practices Summary": [e.target.value],
              },
            })
          }
        />
        <Button type="submit">Add Practice</Button>
      </div>
    </form>
  );
}
