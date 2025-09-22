import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ShieldCheck, Megaphone, CalendarDays } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  // If already logged in, send the user to the appropriate home route
  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    const role = localStorage.getItem("role");
    if (!userId) return;

    const target = role === "admin"
      ? "/home"
      : role === "staff"
      ? "/staff_home"
      : role === "guard"
      ? "/guard_home"
      : role === "homeowner"
      ? "/homeowner_home"
      : "/login";

    navigate(target, { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Hero copy */}
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-indigo-700">
              CondoLink
            </h1>
            <p className="mt-4 text-gray-600 text-lg leading-relaxed">
              A unified platform for condominium operations — streamline amenities, monitor entry logs,
              post announcements, and manage community workflows.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center rounded-md bg-indigo-600 px-5 py-2.5 text-white font-medium shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Log in
              </button>
              <button
                onClick={() => window.open("#features", "_self")}
                className="inline-flex items-center rounded-md px-5 py-2.5 text-indigo-700 font-medium hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Explore features
              </button>
            </div>
          </div>

          {/* Feature cards */}
          <div id="features" className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FeatureCard
              icon={<CalendarDays className="text-indigo-600" size={28} />}
              title="Amenities"
              desc="Reserve clubhouses, pools, and courts with real-time availability."
            />
            <FeatureCard
              icon={<ShieldCheck className="text-indigo-600" size={28} />}
              title="Entry Logging"
              desc="Record and review visitor logs to strengthen on-site security."
            />
            <FeatureCard
              icon={<Megaphone className="text-indigo-600" size={28} />}
              title="Announcements"
              desc="Share updates with residents and track what’s new at a glance."
            />
            <FeatureCard
              icon={<Building2 className="text-indigo-600" size={28} />}
              title="Community Hub"
              desc="Centralize dues, reports, and requests in a single dashboard."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-black/5 hover:shadow-md transition">
      <div className="w-10 h-10 rounded-md bg-indigo-50 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-1.5 text-sm text-gray-600">{desc}</p>
    </div>
  );
}
