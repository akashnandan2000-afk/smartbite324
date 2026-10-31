import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Eye, 
  EyeOff, 
  User, 
  IdCard, 
  Mail, 
  Building2, 
  GraduationCap, 
  Lock, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { SmartBiteLogo } from "../components/SmartBiteLogo";
import { toast } from "react-toastify";

const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Communication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Biotechnology & Life Sciences",
  "Management & Business Studies",
  "Electrical & Electronics"
];

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Post-Graduate"];

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    studentId: "",
    collegeEmail: "",
    department: "",
    yearOfStudy: "",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full Name must be at least 2 characters long.";
    }

    if (!formData.studentId.trim() || formData.studentId.trim().length < 3) {
      newErrors.studentId = "Please enter a valid Student ID (e.g. 2024CS104).";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.collegeEmail.trim() || !emailRegex.test(formData.collegeEmail.trim())) {
      newErrors.collegeEmail = "Please enter a valid college or student email address.";
    }

    if (!formData.department) {
      newErrors.department = "Please select your department.";
    }

    if (!formData.yearOfStudy) {
      newErrors.yearOfStudy = "Please select your current year of study.";
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please resolve the highlighted validation errors.");
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName: formData.fullName,
        studentId: formData.studentId,
        collegeEmail: formData.collegeEmail,
        department: formData.department,
        yearOfStudy: formData.yearOfStudy,
        password: formData.password,
        role: "student"
      });

      toast.success("Student registration complete! Welcome to SmartBite.");
      navigate("/profile");
    } catch (err) {
      toast.error(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Hackathon Quick-Fill button
  const handleQuickFill = () => {
    const randomId = Math.floor(100 + Math.random() * 900);
    setFormData({
      fullName: "Ananya Mishra",
      studentId: `2024CS${randomId}`,
      collegeEmail: `ananya${randomId}@campus.edu`,
      department: "Computer Science & Engineering",
      yearOfStudy: "3rd Year",
      password: "password123",
      confirmPassword: "password123"
    });
    setErrors({});
    toast.info("Form populated with sample student details.");
  };

  return (
    <div className="min-h-[calc(100vh-140px)] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-slate-50">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <SmartBiteLogo size="lg" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Student Account Registration
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Join the smart dining portal to order ahead, get QR pickup codes, and track counter wait times.
          </p>

          {/* Quick Fill Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleQuickFill}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>Hackathon Demo: 1-Click Auto Fill</span>
            </button>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="fullName"
                placeholder="e.g. Rohan Sharma"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 border focus:outline-none transition-all ${
                  errors.fullName 
                    ? "border-rose-400 focus:ring-2 focus:ring-rose-500/20" 
                    : "border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Student ID & College Email row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student ID */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Student ID *
              </label>
              <div className="relative">
                <IdCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="studentId"
                  placeholder="e.g. 2024CS104"
                  value={formData.studentId}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm uppercase rounded-xl bg-slate-50 border focus:outline-none transition-all ${
                    errors.studentId 
                      ? "border-rose-400 focus:ring-2 focus:ring-rose-500/20" 
                      : "border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  }`}
                />
              </div>
              {errors.studentId && (
                <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.studentId}
                </p>
              )}
            </div>

            {/* College Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                College Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="collegeEmail"
                  placeholder="rohan@campus.edu"
                  value={formData.collegeEmail}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 border focus:outline-none transition-all ${
                    errors.collegeEmail 
                      ? "border-rose-400 focus:ring-2 focus:ring-rose-500/20" 
                      : "border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  }`}
                />
              </div>
              {errors.collegeEmail && (
                <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.collegeEmail}
                </p>
              )}
            </div>
          </div>

          {/* Department & Year of Study row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Department */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Department *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 border focus:outline-none transition-all appearance-none cursor-pointer ${
                    errors.department 
                      ? "border-rose-400 focus:ring-2 focus:ring-rose-500/20" 
                      : "border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  }`}
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              {errors.department && (
                <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.department}
                </p>
              )}
            </div>

            {/* Year of Study */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Year of Study *
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  name="yearOfStudy"
                  value={formData.yearOfStudy}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 border focus:outline-none transition-all appearance-none cursor-pointer ${
                    errors.yearOfStudy 
                      ? "border-rose-400 focus:ring-2 focus:ring-rose-500/20" 
                      : "border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  }`}
                >
                  <option value="">Select Year</option>
                  {YEARS.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
              {errors.yearOfStudy && (
                <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.yearOfStudy}
                </p>
              )}
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 border focus:outline-none transition-all ${
                    errors.password 
                      ? "border-rose-400 focus:ring-2 focus:ring-rose-500/20" 
                      : "border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 border focus:outline-none transition-all ${
                    errors.confirmPassword 
                      ? "border-rose-400 focus:ring-2 focus:ring-rose-500/20" 
                      : "border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-black text-sm shadow-xl shadow-orange-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Creating Account..." : "Create Student Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-extrabold text-emerald-800 hover:underline">
              Sign In Here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

