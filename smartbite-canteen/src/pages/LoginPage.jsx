import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  ChefHat, 
  GraduationCap, 
  AlertCircle,
  ShieldCheck 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { SmartBiteLogo } from "../components/SmartBiteLogo";
import { toast } from "react-toastify";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/profile";

  const [formData, setFormData] = useState({
    collegeEmail: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.collegeEmail.trim() || !emailRegex.test(formData.collegeEmail.trim())) {
      newErrors.collegeEmail = "Please enter a valid college email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await login(formData.collegeEmail, formData.password);
      toast.success(`Welcome back, ${res.user.fullName}!`);
      
      if (res.user.role === "staff") {
        navigate("/analytics");
      } else {
        navigate(from === "/login" ? "/profile" : from);
      }
    } catch (err) {
      toast.error(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Demo 1-Click Logins
  const handleQuickStudent = async () => {
    setLoading(true);
    try {
      await login("student@campus.edu", "student123");
      toast.success("Signed in as Student Demo (Rohan Sharma)!");
      navigate("/profile");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStaff = async () => {
    setLoading(true);
    try {
      await login("staff@canteen.smartbite.com", "admin123");
      toast.success("Signed in as Canteen Staff Demo (Chef S. Raman)!");
      navigate("/analytics");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <SmartBiteLogo size="lg" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Sign In to SmartBite
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Access your orders, personalized pickup tokens, and student discounts.
          </p>
        </div>

        {/* 1-Click Demo Buttons for Hackathon */}
        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 space-y-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-900">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>Hackathon Quick-Role Selector</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleQuickStudent}
              className="py-2 px-3 rounded-xl bg-white hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
              <span>Student Demo</span>
            </button>
            <button
              type="button"
              onClick={handleQuickStaff}
              className="py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-orange-600/20 cursor-pointer"
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Staff Demo</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="student@campus.edu"
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

          {/* Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Password *
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter password"
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

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-black text-sm shadow-xl shadow-orange-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Signing In..." : "Sign In to Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Register Link */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Don't have a student account?{" "}
            <Link to="/register" className="font-extrabold text-emerald-800 hover:underline">
              Register Here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

