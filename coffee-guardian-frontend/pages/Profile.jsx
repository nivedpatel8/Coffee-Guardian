import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/common/Button";

export default function Profile() {
  const { user, updateProfile } = useAuth();

  // Initialize form state with current user data
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "", // empty means no change
    passwordConfirm: "",
    plantation: {
      location: user?.plantation?.location || "",
      area: user?.plantation?.area || "",
      varieties: (user?.plantation?.varieties || []).join(", "),
      plantAge: user?.plantation?.plantAge || "",
    },
    profile: {
      phone: user?.profile?.phone || "",
      address: user?.profile?.address || "",
      experience: user?.profile?.experience || "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Generalized form change handler (handles nested fields)
  const handleChange = (field, value, nestedField = null) => {
    if (nestedField) {
      setForm((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          [nestedField]: value,
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  // Validate form fields before submit
  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.email.trim()) return "Email is required";
    if (form.password && form.password.length < 6)
      return "Password must be at least 6 characters";
    if (form.password !== form.passwordConfirm) return "Passwords do not match";
    if (form.plantation.area && isNaN(Number(form.plantation.area)))
      return "Plantation area must be a number";
    if (form.plantation.plantAge && isNaN(Number(form.plantation.plantAge)))
      return "Plant age must be a number";
    if (form.profile.experience && isNaN(Number(form.profile.experience)))
      return "Experience must be a number";
    return null;
  };

  // Handle form submission to update profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      // Prepare data payload
      const updateData = {
        name: form.name.trim(),
        email: form.email.trim(),
        plantation: {
          location: form.plantation.location.trim(),
          area: Number(form.plantation.area) || 0,
          varieties: form.plantation.varieties
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean),
          plantAge: Number(form.plantation.plantAge) || 0,
        },
        profile: {
          phone: form.profile.phone.trim(),
          address: form.profile.address.trim(),
          experience: Number(form.profile.experience) || 0,
        },
      };

      if (form.password) {
        updateData.password = form.password;
      }

      // Call updateProfile (updates user state internally)
      const res = await updateProfile(updateData);
      if (res.success) {
        setSuccess("Profile updated successfully!");
        setForm((prev) => ({ ...prev, password: "", passwordConfirm: "" }));
      } else {
        setError(res.message || "Failed to update profile");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 p-8 space-y-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg min-h-[calc(100vh-6rem)]">
      <h1 className="text-3xl font-extrabold text-white text-center drop-shadow-md">
        Your Profile
      </h1>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4 text-center">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
        />

        {/* Email */}
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          required
        />

        {/* Password */}
        <Input
          label="New Password"
          type="password"
          placeholder="••••••"
          value={form.password}
          onChange={(e) => handleChange("password", e.target.value)}
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••"
          value={form.passwordConfirm}
          onChange={(e) => handleChange("passwordConfirm", e.target.value)}
        />

        <h2 className="text-xl font-semibold border-b border-white/30 pb-2 mt-6 text-white">
          Plantation Details
        </h2>

        <Input
          label="Location"
          value={form.plantation.location}
          onChange={(e) =>
            handleChange("plantation", e.target.value, "location")
          }
        />
        <Input
          label="Area (in acres)"
          type="number"
          value={form.plantation.area}
          onChange={(e) => handleChange("plantation", e.target.value, "area")}
        />
        <Input
          label="Varieties (comma separated)"
          value={form.plantation.varieties}
          onChange={(e) =>
            handleChange("plantation", e.target.value, "varieties")
          }
          placeholder="e.g. Arabica, Robusta"
        />
        <Input
          label="Plant Age (years)"
          type="number"
          value={form.plantation.plantAge}
          onChange={(e) =>
            handleChange("plantation", e.target.value, "plantAge")
          }
        />

        <h2 className="text-xl font-semibold border-b border-white/30 pb-2 mt-6 text-white">
          Additional Profile Info
        </h2>

        <Input
          label="Phone"
          type="tel"
          value={form.profile.phone}
          onChange={(e) => handleChange("profile", e.target.value, "phone")}
        />
        <Input
          label="Address"
          value={form.profile.address}
          onChange={(e) => handleChange("profile", e.target.value, "address")}
        />
        <Input
          label="Experience (years)"
          type="number"
          value={form.profile.experience}
          onChange={(e) =>
            handleChange("profile", e.target.value, "experience")
          }
        />

        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-600 hover:via-purple-700 hover:to-pink-700
              text-white font-semibold px-6 py-2 rounded-md shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

// Reusable Input component
function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}) {
  return (
    <div>
      <label className="block mb-1 font-medium text-white">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full bg-white/10 text-white placeholder-white/70 border border-white/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
        spellCheck="false"
      />
    </div>
  );
}
