import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Mail, Lock } from "lucide-react";
import BASE_URL from "../../apiConfig";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email,
        password,
      });

      const { token, role } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      if (role === "student") {
        navigate("/student/profile");
      } else if (role === "hr") {
        navigate("/hr/profile");
      } else {
        navigate("/");
      }
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message || "Server error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
          <span className="text-white text-sm font-bold">S</span>
        </div>
        <span className="text-lg font-semibold text-text-primary">SmartRecruit</span>
      </div>

      <h2 className="text-3xl font-bold text-text-primary mb-2">Welcome back</h2>
      <p className="text-text-secondary mb-8">Sign in to your account to continue.</p>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm mb-6">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <Input
          label="Email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          icon={Mail}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          icon={Lock}
        />

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Sign in
        </Button>
      </form>

      <p className="text-center text-text-muted text-sm mt-6">
        Don't have an account?{" "}
        <Link to="/signup" className="text-primary hover:text-primary-hover transition-colors font-medium">
          Create one
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
