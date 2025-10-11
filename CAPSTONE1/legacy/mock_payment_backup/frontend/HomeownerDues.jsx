import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BASE_URL, GCASH_RECIPIENT } from "../../config";
import { showToast } from "../../lib/toast";
import {
  Loader2,
  Filter,
  ArrowUpDown,
  Search,
  CreditCard,
  CheckCircle,
  Clock,
  ShieldCheck,
  X,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "unpaid", label: "Unpaid" },
  { value: "review", label: "Awaiting review" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
];

const currency = (value) =>
  `₱${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatMonth = (value) => {
  if (!value) return "—";
  const [year, month] = value.split("-");
  if (!year || !month) return value;
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

const deriveStatus = (due) => {
  const paid = Number(due.is_paid) === 1;
  const review = Number(due.payment_requested) === 1 && !paid;
  const overdue = Number(due.is_overdue) === 1 && !paid && !review;

  if (paid) {
    return { key: "paid", label: "Paid", badge: "bg-green-100 text-green-700" };
  }
  if (review) {
    return {
      key: "review",
      label: "Awaiting admin review",
      badge: "bg-amber-100 text-amber-700",
    };
  }
  if (overdue) {
    return {
      key: "overdue",
      label: "Overdue",
      badge: "bg-red-100 text-red-700",
    };
  }
  return {
    key: "unpaid",
    label: "Unpaid",
    badge: "bg-gray-100 text-gray-600",
  };
};

export default function HomeownerDues() {
  const userId = localStorage.getItem("user_id");
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recipient, setRecipient] = useState(GCASH_RECIPIENT);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState("due_month");
  const [sortDir, setSortDir] = useState("desc");
  const [sandboxDue, setSandboxDue] = useState(null);
  const [sandboxForm, setSandboxForm] = useState({
    reference: "",
    senderName: "",
    senderMobile: "",
    paidAt: new Date(),
  });
  const [sandboxProcessing, setSandboxProcessing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Fetch GCASH display settings
        const settingsRes = await fetch(`${BASE_URL}get_settings.php`, {
          credentials: "include",
        });
        const settings = await settingsRes.json();
        const info = { ...GCASH_RECIPIENT };
        if (settings.gcash_name) info.name = settings.gcash_name;
        if (settings.gcash_mobile) info.mobile = settings.gcash_mobile;
        if (settings.gcash_qr_url) {
          info.qrUrl = settings.gcash_qr_url.startsWith("http")
            ? settings.gcash_qr_url
            : `${BASE_URL}${settings.gcash_qr_url}`;
        }
        setRecipient(info);
      } catch (err) {
        console.error("Failed to load GCASH settings", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const fetchDues = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}get_dues.php?user_id=${userId}`, {
        credentials: "include",
      });
      const data = await response.json();
      setDues(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load dues", error);
      setDues([]);
      showToast("Failed to load dues", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchDues();
  }, [userId]);

  const outstandingTotal = useMemo(
    () =>
      dues
        .filter((due) => Number(due.is_paid) !== 1)
        .reduce((sum, due) => sum + Number(due.outstanding || due.amount_due || 0), 0),
    [dues]
  );

  const filteredDues = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return dues.filter((due) => {
      const statusInfo = deriveStatus(due);
      const matchesStatus =
        status === "all" ? true : statusInfo.key === status;
      const haystack = [
        due.due_month,
        due.gcash_reference,
        due.payment_proof_path,
        due.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = keyword === "" || haystack.includes(keyword);
      return matchesStatus && matchesSearch;
    });
  }, [dues, search, status]);

  const sortedDues = useMemo(() => {
    const list = [...filteredDues];
    const factor = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      const statusA = deriveStatus(a);
      const statusB = deriveStatus(b);
      switch (sortKey) {
        case "amount_due":
          return (Number(a.amount_due) - Number(b.amount_due)) * factor;
        case "status":
          return statusA.label.localeCompare(statusB.label) * factor;
        case "outstanding":
          return (Number(a.outstanding) - Number(b.outstanding)) * factor;
        case "due_month":
        default:
          return String(a.due_month).localeCompare(String(b.due_month)) * factor;
      }
    });
    return list;
  }, [filteredDues, sortKey, sortDir]);

  const toggleSort = (key) => {
    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortDir((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
        return prevKey;
      }
      setSortDir("asc");
      return key;
    });
  };

  const openSandbox = (due) => {
    setSandboxDue(due);
    setSandboxForm({
      reference: "",
      senderName: "",
      senderMobile: "",
      paidAt: new Date(),
    });
  };

  const handleSandboxSubmit = async () => {
    if (!sandboxDue) return;
    const { reference, senderName, senderMobile, paidAt } = sandboxForm;
    if (!reference.trim()) {
      showToast("Please enter the GCash reference number.", "error");
      return;
    }

    setSandboxProcessing(true);
    try {
      const payload = new URLSearchParams();
      payload.append("due_id", sandboxDue.id);
      payload.append("user_id", userId);
      payload.append("reference", reference.trim());
      if (senderName.trim()) payload.append("sender_name", senderName.trim());
      if (senderMobile.trim())
        payload.append("sender_mobile", senderMobile.trim());
      payload.append("amount", sandboxDue.amount_due);
      if (paidAt) payload.append("paid_at", paidAt.toISOString());

      const response = await fetch(`${BASE_URL}simulate_gcash_payment.php`, {
        method: "POST",
        body: payload,
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        showToast(data.message || "Payment submitted for review.");
        setSandboxDue(null);
        await fetchDues();
      } else {
        showToast(data.message || "Failed to record payment.", "error");
      }
    } catch (error) {
      console.error("Sandbox payment failed", error);
      showToast("Failed to record payment.", "error");
    } finally {
      setSandboxProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Monthly Dues
              </h1>
              <p className="text-gray-600">
                Track your charges, monitor payment status, and settle dues via
                the CondoLink GCash sandbox.
              </p>
            </div>
            <div className="bg-white px-4 py-3 rounded-xl shadow border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Outstanding balance
              </p>
              <p className="text-2xl font-semibold text-indigo-600">
                {currency(outstandingTotal)}
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  GCash recipient
                </h2>
                <p className="text-xs text-gray-500">
                  Use these details to complete your sandbox payment.
                </p>
              </div>
            </div>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>
                <span className="font-medium">Name:</span> {recipient.name}
              </li>
              <li>
                <span className="font-medium">Mobile:</span> {recipient.mobile}
              </li>
            </ul>
            {recipient.qrUrl && (
              <img
                src={recipient.qrUrl}
                alt="GCash QR"
                className="mt-4 w-32 h-32 object-contain rounded-lg border"
              />
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Sandbox walkthrough
                </h2>
              </div>
            </div>
            <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
              <li>Choose an unpaid due and click “Pay via GCash Sandbox”.</li>
              <li>Provide the reference number generated from your mock payment.</li>
              <li>
                Submit the form — the admin team will verify and mark the due
                as paid.
              </li>
            </ol>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>Filter and sort your dues</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by month or reference..."
                  className="pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64"
                />
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    <button
                      type="button"
                      onClick={() => toggleSort("due_month")}
                      className="inline-flex items-center gap-2"
                    >
                      Due month
                      <ArrowUpDown className="w-4 h-4 text-gray-400" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    <button
                      type="button"
                      onClick={() => toggleSort("amount_due")}
                      className="inline-flex items-center gap-2"
                    >
                      Amount
                      <ArrowUpDown className="w-4 h-4 text-gray-400" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    <button
                      type="button"
                      onClick={() => toggleSort("outstanding")}
                      className="inline-flex items-center gap-2"
                    >
                      Outstanding
                      <ArrowUpDown className="w-4 h-4 text-gray-400" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    <button
                      type="button"
                      onClick={() => toggleSort("status")}
                      className="inline-flex items-center gap-2"
                    >
                      Status
                      <ArrowUpDown className="w-4 h-4 text-gray-400" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Reference / Notes
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td
                      className="px-4 py-6 text-center text-gray-500"
                      colSpan={6}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading dues...
                      </div>
                    </td>
                  </tr>
                ) : sortedDues.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-6 text-center text-gray-500"
                      colSpan={6}
                    >
                      No dues match your current filters.
                    </td>
                  </tr>
                ) : (
                  sortedDues.map((due) => {
                    const statusInfo = deriveStatus(due);
                    return (
                      <tr key={due.id} className="hover:bg-indigo-50/40">
                        <td className="px-4 py-3 align-top">
                          <div className="font-medium text-gray-900">
                            {formatMonth(due.due_month)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Due date: {formatDateTime(due.due_date)}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top text-gray-800">
                          {currency(due.amount_due)}
                        </td>
                        <td className="px-4 py-3 align-top text-gray-800">
                          {currency(due.outstanding)}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span
                            className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full ${statusInfo.badge}`}
                          >
                            {statusInfo.key === "paid" ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : statusInfo.key === "review" ? (
                              <Clock className="w-3 h-3" />
                            ) : (
                              <CreditCard className="w-3 h-3" />
                            )}
                            {statusInfo.label}
                          </span>
                          {due.gcash_reference && (
                            <div className="text-xs text-gray-500 mt-1">
                              Ref: {due.gcash_reference}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top text-xs text-gray-600 space-y-1">
                          {due.gcash_reference ? (
                            <div>
                              <span className="font-medium text-gray-700">
                                GCash reference:
                              </span>{" "}
                              {due.gcash_reference}
                            </div>
                          ) : (
                            <div>No reference on file.</div>
                          )}
                          {due.payment_date && (
                            <div>Paid: {formatDateTime(due.payment_date)}</div>
                          )}
                          {due.notes && <div>Note: {due.notes}</div>}
                        </td>
                        <td className="px-4 py-3 align-top">
                          {statusInfo.key === "paid" ? (
                            <span className="text-xs text-emerald-600 font-medium">
                              Thank you!
                            </span>
                          ) : statusInfo.key === "review" ? (
                            <span className="text-xs text-amber-600 font-medium">
                              Awaiting admin verification
                            </span>
                          ) : (
                            <button
                              onClick={() => openSandbox(due)}
                              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                            >
                              Pay via GCash Sandbox
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {sandboxDue && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-indigo-600">
                    GCash Sandbox Checkout
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    This simulates a GCash payment. No real funds will be
                    transferred.
                  </p>
                </div>
                <button
                  onClick={() => setSandboxDue(null)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close sandbox"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-indigo-600 uppercase tracking-wide">
                      Paying due for
                    </p>
                    <p className="text-lg font-semibold text-indigo-900">
                      {formatMonth(sandboxDue.due_month)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Amount
                    </p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {currency(sandboxDue.amount_due)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">
                      GCash reference number
                    </span>
                    <input
                      type="text"
                      value={sandboxForm.reference}
                      onChange={(e) =>
                        setSandboxForm((prev) => ({
                          ...prev,
                          reference: e.target.value,
                        }))
                      }
                      placeholder="Enter mock reference (e.g., GC12345678)"
                      className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">
                      Payer name (optional)
                    </span>
                    <input
                      type="text"
                      value={sandboxForm.senderName}
                      onChange={(e) =>
                        setSandboxForm((prev) => ({
                          ...prev,
                          senderName: e.target.value,
                        }))
                      }
                      placeholder="Your name"
                      className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">
                      GCash mobile (optional)
                    </span>
                    <input
                      type="tel"
                      value={sandboxForm.senderMobile}
                      onChange={(e) =>
                        setSandboxForm((prev) => ({
                          ...prev,
                          senderMobile: e.target.value,
                        }))
                      }
                      placeholder="09XXXXXXXXX"
                      className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">
                      Payment date &amp; time
                    </span>
                    <DatePicker
                      selected={sandboxForm.paidAt}
                      onChange={(date) =>
                        setSandboxForm((prev) => ({ ...prev, paidAt: date }))
                      }
                      showTimeSelect
                      dateFormat="MMM d, yyyy h:mm a"
                      className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </label>
                </div>

                <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-800">
                  <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">
                      Simulation only
                    </p>
                    <p>
                      This sandbox posts to our internal simulator
                      (<code className="font-mono text-xs text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">php/simulate_gcash_payment.php</code>);
                      no real GCash transfer happens. An administrator still
                      needs to approve the transaction before the due is marked
                      as paid.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setSandboxDue(null)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                    disabled={sandboxProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSandboxSubmit}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
                    disabled={sandboxProcessing}
                  >
                    {sandboxProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Submit payment
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
