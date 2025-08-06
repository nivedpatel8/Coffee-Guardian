import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  getTopExpenses,
} from "../services/expenses";
import Loading from "../components/common/Loading";
import Button from "../components/common/Button";
import {
  FaFilePdf,
  FaFileImage,
  FaTimes,
  FaEdit,
  FaTrash,
  FaCamera,
  FaBoxOpen,
  FaWallet,
  FaMoneyBillWave,
} from "react-icons/fa";

const CATEGORIES = [
  "Fertilizers",
  "Pesticides",
  "Equipment",
  "Labor",
  "Seeds",
  "Irrigation",
  "Repair",
  "Processing",
  "Fuel",
  "Other",
];

export default function Expenses() {
  const qc = useQueryClient();

  // Filter states
  const [filter, setFilter] = useState({ category: "" });

  // Add/Edit form state
  const [form, setForm] = useState({
    category: "Fertilizers",
    itemName: "",
    quantity: 1,
    unit: "kg",
    unitPrice: 0,
    purchaseDate: new Date().toISOString().split("T")[0],
  });
  const [attachmentFile, setAttachmentFile] = useState(null);

  // For editing
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editAttachmentFile, setEditAttachmentFile] = useState(null);

  // Reciept preview
  const recieptRef = useRef();

  // Queries
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["expenses", filter],
    queryFn: () => getExpenses(filter),
  });

  const { data: stats } = useQuery({
    queryKey: ["expenseStats"],
    queryFn: getExpenseStats,
  });

  const { data: topExpenses } = useQuery({
    queryKey: ["topExpenses"],
    queryFn: () => getTopExpenses(5),
  });

  // Mutations
  const add = useMutation({
    mutationFn: () => addExpense(form, attachmentFile),
    onSuccess: () => {
      qc.invalidateQueries(["expenses"]);
      qc.invalidateQueries(["expenseStats"]);
      qc.invalidateQueries(["topExpenses"]);
      setForm({
        category: "Fertilizers",
        itemName: "",
        quantity: 1,
        unit: "kg",
        unitPrice: 0,
        purchaseDate: new Date().toISOString().split("T")[0],
      });
      setAttachmentFile(null);
      if (recieptRef.current) recieptRef.current.value = "";
    },
  });

  const update = useMutation({
    mutationFn: ({ id, data, file }) => updateExpense(id, data, file),
    onSuccess: () => {
      qc.invalidateQueries(["expenses"]);
      qc.invalidateQueries(["expenseStats"]);
      setEditingId(null);
      setEditForm({});
      setEditAttachmentFile(null);
    },
  });

  const remove = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      qc.invalidateQueries(["expenses"]);
      qc.invalidateQueries(["expenseStats"]);
      qc.invalidateQueries(["topExpenses"]);
    },
  });

  if (isLoading) return <Loading />;

  //  Array.isArray(stats?.monthlyStats)
  //       ? stats.monthlyStats.reduce(
  //           (sum, item) => sum + (item?.totalAmount || 0),
  //           0
  //         )
  //       : 0,

  // ----------- UI Rendering Starts --------------
  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-8 space-y-8">
      {/* 1. Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<FaMoneyBillWave size={32} />}
          label="Monthly Expense (₹)"
          value={
            Array.isArray(stats?.monthlyStats)
              ? stats.monthlyStats.reduce(
                  (sum, item) => sum + (item?.totalAmount || 0),
                  0
                )
              : 0
          }
          className="from-green-600 to-green-400"
        />
        <StatCard
          icon={<FaBoxOpen size={32} />}
          label="Items Purchased"
          value={stats?.totalExpenses?.count || 0}
          className="from-blue-700 to-blue-400"
        />
        <StatCard
          icon={<FaWallet size={32} />}
          label="2025 Expenses"
          value={stats?.totalExpenses?.total || 0}
          className="from-orange-600 to-yellow-500"
        />
      </div>

      {/* 2. Top Expenses */}
      {topExpenses && topExpenses.length > 0 && (
        <div className="bg-gray-900 rounded-lg shadow p-4 text-white">
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
            Top Expenses
            <FaCamera className="text-yellow-400" />
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topExpenses.map((exp) => (
              <div
                key={exp._id}
                className="flex justify-between items-center bg-gray-800 rounded p-3"
              >
                <span>
                  {exp.itemName}
                  <span className="ml-2 text-sm text-gray-400">
                    ({exp.category})
                  </span>
                </span>
                <span className="font-bold text-green-400">
                  ₹{exp.totalAmount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Add Expense */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          add.mutate();
        }}
        className="bg-gray-900 shadow rounded-lg p-4 flex flex-wrap gap-4 items-end"
      >
        <select
          className="bg-gray-800 border border-gray-700 rounded-md p-2 text-white flex-1 min-w-[9rem]"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          className="bg-gray-800 border border-gray-700 rounded-md p-2 text-white flex-1 min-w-[8rem]"
          placeholder="Item name"
          value={form.itemName}
          onChange={(e) => setForm({ ...form, itemName: e.target.value })}
          required
        />
        <input
          type="number"
          className="bg-gray-800 border border-gray-700 rounded-md p-2 text-white w-20"
          placeholder="Qty"
          value={form.quantity}
          min={1}
          onChange={(e) =>
            setForm({ ...form, quantity: Number(e.target.value) })
          }
          required
        />
        <input
          className="bg-gray-800 border border-gray-700 rounded-md p-2 text-white w-16"
          placeholder="Unit"
          value={form.unit}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
          required
        />
        <input
          type="number"
          min={0}
          className="bg-gray-800 border border-gray-700 rounded-md p-2 text-white w-28"
          placeholder="Unit Price"
          value={form.unitPrice}
          onChange={(e) =>
            setForm({ ...form, unitPrice: Number(e.target.value) })
          }
          required
        />
        <input
          type="date"
          className="bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
          value={form.purchaseDate}
          onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
          required
        />

        {/* File input for receipt */}
        <input
          type="file"
          accept="image/*,application/pdf"
          ref={recieptRef}
          className="hidden"
          id="reciept-upload"
          onChange={(e) => setAttachmentFile(e.target.files[0] || null)}
        />
        <label
          htmlFor="reciept-upload"
          className="cursor-pointer flex items-center gap-2 text-gray-300 hover:text-yellow-400"
        >
          <FaCamera />
          {attachmentFile ? (
            <span className="text-green-400">{attachmentFile.name}</span>
          ) : (
            <span className="text-gray-500">Attach receipt</span>
          )}
        </label>

        {/* Add Button */}
        <Button
          type="submit"
          disabled={add.isLoading}
          className="bg-green-600 hover:bg-green-700 px-5 rounded"
        >
          {add.isLoading ? "Adding..." : "Add"}
        </Button>
      </form>

      {/* 4. Filter Bar */}
      <div className="flex gap-4 items-center mb-2">
        <select
          className="bg-gray-800 border border-gray-700 rounded p-2 text-white min-w-[9rem]"
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value })}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <Button
          type="button"
          className="bg-gray-900 hover:bg-gray-700 px-4"
          onClick={() => setFilter({ category: "" })}
          disabled={!filter.category}
        >
          Clear Filter
        </Button>
      </div>

      {/* 5. Expense Table */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-gray-900 text-white rounded">
          <thead>
            <tr className="bg-green-700">
              <th className="p-3 text-left">Item</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total ₹</th>
              <th>Date</th>
              <th>Receipt</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.expenses && data.expenses.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-400">
                  No expenses found.
                </td>
              </tr>
            ) : (
              data.expenses.map((exp) =>
                editingId === exp._id ? (
                  <tr key={exp._id} className="border-b border-gray-700">
                    {/* Editable Row */}
                    <td>
                      <input
                        className="bg-gray-800 border border-gray-700 rounded-md p-1 text-white w-full"
                        value={editForm.itemName}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            itemName: e.target.value,
                          }))
                        }
                      />
                    </td>
                    <td>
                      <select
                        className="bg-gray-800 border border-gray-700 rounded-md p-1 text-white w-full"
                        value={editForm.category}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            category: e.target.value,
                          }))
                        }
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="bg-gray-800 border border-gray-700 rounded-md p-1 text-white w-16"
                        value={editForm.quantity}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            quantity: Number(e.target.value),
                          }))
                        }
                        min={1}
                      />
                      <input
                        className="bg-gray-800 border border-gray-700 rounded-md p-1 text-white w-14 ml-2"
                        value={editForm.unit}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, unit: e.target.value }))
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="bg-gray-800 border border-gray-700 rounded-md p-1 text-white w-20"
                        value={editForm.unitPrice}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            unitPrice: Number(e.target.value),
                          }))
                        }
                        min={0}
                      />
                    </td>
                    <td>
                      <span className="text-green-400 font-semibold">
                        {editForm.quantity * editForm.unitPrice}
                      </span>
                    </td>
                    <td>
                      <input
                        type="date"
                        className="bg-gray-800 border border-gray-700 rounded-md p-1 text-white w-28"
                        value={editForm.purchaseDate}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            purchaseDate: e.target.value,
                          }))
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        id={`edit-rec-${exp._id}`}
                        onChange={(e) =>
                          setEditAttachmentFile(e.target.files[0] || null)
                        }
                      />
                      <label
                        htmlFor={`edit-rec-${exp._id}`}
                        className="cursor-pointer flex items-center gap-1 text-gray-300 hover:text-yellow-400"
                      >
                        <FaCamera />
                        {editAttachmentFile
                          ? editAttachmentFile.name
                          : "Change"}
                      </label>
                    </td>
                    <td className="flex gap-2 justify-center items-center py-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          update.mutate({
                            id: exp._id,
                            data: editForm,
                            file: editAttachmentFile,
                          })
                        }
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={update.isLoading}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingId(null);
                          setEditForm({});
                          setEditAttachmentFile(null);
                        }}
                        className="bg-gray-700 hover:bg-gray-500"
                      >
                        Cancel
                      </Button>
                    </td>
                  </tr>
                ) : (
                  <tr
                    key={exp._id}
                    className="border-b border-gray-800 hover:bg-gray-800 transition"
                  >
                    <td className="p-2">{exp.itemName}</td>
                    <td>{exp.category}</td>
                    <td>
                      {exp.quantity} {exp.unit}
                    </td>
                    <td>₹{exp.unitPrice}</td>
                    <td>
                      <span className="text-green-400 font-bold">
                        ₹{exp.totalAmount}
                      </span>
                    </td>
                    <td>
                      <span>
                        {new Date(exp.purchaseDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      {exp.receiptUrl ? (
                        exp.receiptUrl.endsWith(".pdf") ? (
                          <a
                            href={exp.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-red-400 hover:text-red-500"
                            title="Download/view PDF"
                          >
                            <FaFilePdf size={22} />
                          </a>
                        ) : (
                          <a
                            href={exp.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block"
                            title="View image"
                          >
                            <img
                              src={exp.receiptUrl}
                              alt="Receipt"
                              className="w-10 h-10 rounded object-cover border"
                            />
                          </a>
                        )
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="flex gap-2 justify-center items-center py-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingId(exp._id);
                          setEditForm({
                            itemName: exp.itemName,
                            category: exp.category,
                            quantity: exp.quantity,
                            unit: exp.unit,
                            unitPrice: exp.unitPrice,
                            purchaseDate:
                              exp.purchaseDate?.slice(0, 10) ||
                              new Date().toISOString().slice(0, 10),
                          });
                          setEditAttachmentFile(null);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => remove.mutate(exp._id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ----------------- Stat Card Component --------------
function StatCard({ icon, label, value, className = "" }) {
  return (
    <div
      className={`rounded-lg p-6 shadow-lg bg-gradient-to-tr ${className} text-white flex items-center gap-4`}
    >
      <span className="text-4xl">{icon}</span>
      <div>
        <div className="font-bold text-xl">{value}</div>
        <div className="uppercase text-sm tracking-wide opacity-80">
          {label}
        </div>
      </div>
    </div>
  );
}
