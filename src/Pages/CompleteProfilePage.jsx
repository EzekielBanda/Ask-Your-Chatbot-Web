import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchBranches } from "../services/authentication/GetAllBranches";
import { completeProfile } from "../services/authentication/CompleteProfile";
import { fetchDepartments } from "../services/authentication/GetDepartments.jsx";

const CompleteProfilePage = ({ onProfileComplete }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    branchName: "",
    departmentName: "",
  });
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { userName } = location.state || {};

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const branchesData = await fetchBranches();
        if (Array.isArray(branchesData)) {
          setBranches(branchesData);
        } else {
          console.error("Unexpected branches data format:", branchesData);
          setError("Invalid branches data format received");
        }
      } catch (err) {
        setError("Could not load branches. Please try again.");
        console.error("Branch loading error:", err);
      }
    };

    loadBranches();
  }, []);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const departmentsData = await fetchDepartments();
        if (Array.isArray(departmentsData)) {
          setDepartments(departmentsData);
        } else {
          console.error("Unexpected department data format:", departmentsData);
          setError("Invalid department data format received");
        }
      } catch (err) {
        setError("Could not load department. Please try again.");
        console.error("Department loading error:", err);
      }
    };

    loadDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const profileData = {
        fullName: formData.fullName,
        branchName: formData.branchName,
        userName: userName,
        departmentName: formData.departmentName,
      };
      const response = await completeProfile(profileData);
      if (onProfileComplete) {
        onProfileComplete(response);
      }
      navigate("/chat");
    } catch (err) {
      setError(err.message || "Failed to complete profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gray-50 p-4 w-screen"
      style={{ WebkitAppRegion: "drag" }}
    >
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden p-6"
        style={{ WebkitAppRegion: "no-drag" }}
      >
        <h2 className="text-xl font-bold text-indigo-600 mb-4">
          Complete Your Profile
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              name="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              aria-label="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch
            </label>
            <select
              name="branchName"
              required
              value={formData.branchName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              aria-label="Select your branch"
            >
              <option value="">Select a branch</option>
              {branches.map((branch, index) => (
                <option
                  key={branch.id || branch._id || branch.name || index}
                  value={branch.name || branch.branchName || branch}
                >
                  {branch.name || branch.branchName || branch}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              name="departmentName"
              required
              value={formData.departmentName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              aria-label="Select your branch"
            >
              <option value="">Select a department</option>
              {departments.map((department, index) => (
                <option
                  key={department.id || department._id || department.name || index}
                  value={
                    department.name || department.departmentName || department
                  }
                >
                  {department.name || department.departmentName || department}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center text-sm"
            aria-busy={isLoading}
            aria-label={isLoading ? "Saving profile" : "Complete profile"}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              "Complete Profile"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
