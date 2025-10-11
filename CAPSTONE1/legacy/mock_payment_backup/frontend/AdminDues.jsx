
import React, { useEffect, useMemo, useState } from "react";
import { BASE_URL } from "../config";
import { showToast } from "../lib/toast";
import { assetUrl } from "../lib/asset";
import {
  Loader2,
  Filter,
  ArrowUpDown,
  Search,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCcw,
  CreditCard,
  AlertCircle,
  Calendar,
  Eye,
  X,
  Check,
  Users,
  FileText
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "unpaid", label: "Unpaid" },
  { value: "review", label: "Awaiting review" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" }
];

const STATUS_ORDER = {
  paid: 0,
  review: 1,
  overdue: 2,
  unpaid: 3
};

const currency = (value) =>
  `₱${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

const formatMonth = (value) => {
  if (!value) return "—";
  const [year, month] = value.split("-");
  if (!year || !month) return value;
  const date = new Date(Number(year), Number(month) - 1, 1);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric"
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const deriveStatus = (due) => {
  const paid = Number(due.is_paid) === 1;
  const review = Number(due.payment_requested) === 1 && !paid;
  const overdue = Number(due.is_overdue) === 1 && !paid && !review;

  if (paid) {
    return {
      key: "paid",
      label: "Paid",
      badge: "bg-green-100 text-green-700 border-green-200"
    };
  }

  if (review) {
    return {
      key: "review",
      label: "Awaiting review",
      badge: "bg-amber-100 text-amber-700 border-amber-200"
    };
  }

  if (overdue) {
    return {
      key: "overdue",
      label: "Overdue",
      badge: "bg-red-100 text-red-700 border-red-200"
    };
  }

  return {
    key: "unpaid",
    label: "Unpaid",
    badge: "bg-gray-100 text-gray-700 border-gray-200"
  };
};

const ym = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
const candidateMonths = (count = 18) => {
  const now = new Date();
  const items = [];
  for (let index = 0; index < count; index += 1) {
    const month = new Date(now.getFullYear(), now.getMonth() - index, 1);
    items.push(ym(month));
  }
  return items;
};
const currentYm = ym(new Date());
const monthStatus = (value) => {
  if (!value) return "";
  if (value === currentYm) return "Due now";
  return value.localeCompare(currentYm) < 0 ? "Overdue" : "Upcoming";
};

const safeJson = async (response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error("Invalid server response");
  }
};
export default function AdminDues() {
  const [dues, setDues] = useState([]);
  const [homeowners, setHomeowners] = useState([]);
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "",
    rate_id: "",
    amount_due: "",
    due_month: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState("due_month");
  const [sortDir, setSortDir] = useState("desc");
  const [proofImage, setProofImage] = useState(null);

  useEffect(() => {
    loadEverything();
  }, []);

  const loadEverything = async () => {
    try {
      setLoading(true);
      const [duesRes, homeownersRes, ratesRes] = await Promise.all([
        fetch(`${BASE_URL}get_dues.php`, { credentials: "include" }),
        fetch(`${BASE_URL}get_homeowners.php`, { credentials: "include" }),
        fetch(`${BASE_URL}get_dues_rates.php`, { credentials: "include" })
      ]);

      const duesData = await safeJson(duesRes);
      const homeownerData = await safeJson(homeownersRes);
      const ratesData = await safeJson(ratesRes);

      setDues(Array.isArray(duesData) ? duesData : []);
      setHomeowners(Array.isArray(homeownerData) ? homeownerData : []);
      setRates(Array.isArray(ratesData) ? ratesData : []);
    } catch (error) {
      console.error("Failed to load dues", error);
      showToast("Failed to load dues data", "error");
    } finally {
      setLoading(false);
    }
  };

  const refreshDues = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`${BASE_URL}get_dues.php`, {
        credentials: "include"
      });
      const data = await safeJson(response);
      setDues(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Refresh dues failed", error);
      showToast("Unable to refresh dues list", "error");
    } finally {
      setRefreshing(false);
    }
  };

  const homeownerLookup = useMemo(() => {
    const map = {};
    homeowners.forEach((item) => {
      map[item.user_id] = item.full_name || item.user_id;
    });
    return map;
  }, [homeowners]);

  const existingMonthsByUser = useMemo(() => {
    const map = new Map();
    dues.forEach((due) => {
      if (!map.has(due.user_id)) {
        map.set(due.user_id, new Set());
      }
      const set = map.get(due.user_id);
      if (due.due_month) set.add(due.due_month);
    });
    return map;
  }, [dues]);

  const missingMonthsForUser = (userId) => {
    if (!userId) return [];
    const existing = existingMonthsByUser.get(userId) || new Set();
    return candidateMonths().filter((month) => !existing.has(month));
  };

  const enrichedDues = useMemo(
    () =>
      dues.map((due) => {
        const status = deriveStatus(due);
        const lastUpdated = due.updated_at || due.payment_date || due.created_at;
        const outstanding = Number(due.outstanding ?? due.amount_due ?? 0);
        return {
          ...due,
          homeownerName: homeownerLookup[due.user_id] || due.user_id,
          status,
          lastUpdated,
          outstanding
        };
      }),
    [dues, homeownerLookup]
  );

  const filteredDues = useMemo(() => {
    const query = search.trim().toLowerCase();
    return enrichedDues.filter((due) => {
      const statusOk =
        statusFilter === "all" ? true : due.status.key === statusFilter;
      if (!statusOk) return false;
      if (!query) return true;
      const haystack = [
        due.homeownerName,
        due.user_id,
        due.due_month,
        due.gcash_reference
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [enrichedDues, search, statusFilter]);

  const sortedDues = useMemo(() => {
    const list = [...filteredDues];
    const direction = sortDir === "asc" ? 1 : -1;

    list.sort((a, b) => {
      let result = 0;
      switch (sortKey) {
        case "homeowner":
          result = (a.homeownerName || "").localeCompare(
            b.homeownerName || "",
            undefined,
            {
              sensitivity: "base"
            }
          );
          break;
        case "amount_due":
          result = Number(a.amount_due || 0) - Number(b.amount_due || 0);
          break;
        case "outstanding":
          result = Number(a.outstanding || 0) - Number(b.outstanding || 0);
          break;
        case "status":
          result = STATUS_ORDER[a.status.key] - STATUS_ORDER[b.status.key];
          break;
        case "updated_at": {
          const aTime = new Date(a.lastUpdated || 0).getTime() || 0;
          const bTime = new Date(b.lastUpdated || 0).getTime() || 0;
          result = aTime - bTime;
          break;
        }
        case "due_month":
        default:
          result = (a.due_month || "").localeCompare(b.due_month || "");
          break;
      }
      return result * direction;
    });

    return list;
  }, [filteredDues, sortKey, sortDir]);
  const summary = useMemo(() => {
    const total = dues.length;
    const paid = dues.filter((due) => Number(due.is_paid) === 1).length;
    const review = dues.filter(
      (due) => Number(due.is_paid) === 0 && Number(due.payment_requested) === 1
    ).length;
    const overdue = dues.filter(
      (due) => Number(due.is_overdue) === 1 && Number(due.is_paid) === 0
    ).length;
    return {
      total,
      paid,
      review,
      overdue,
      outstanding: dues.reduce(
        (acc, due) => acc + Number(due.outstanding ?? due.amount_due ?? 0),
        0
      )
    };
  }, [dues]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const resetForm = () =>
    setFormData({
      user_id: "",
      rate_id: "",
      amount_due: "",
      due_month: ""
    });

  const handleAddDue = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("user_id", formData.user_id);
      payload.append("amount_due", formData.amount_due);
      payload.append("due_month", formData.due_month);
      if (formData.rate_id) {
        payload.append("rate_id", formData.rate_id);
      }

      const response = await fetch(`${BASE_URL}add_due.php`, {
        method: "POST",
        body: payload,
        credentials: "include"
      });
      const data = await safeJson(response);

      if (data.success === false) {
        throw new Error(data.message || "Failed to add due");
      }

      showToast("Monthly due added");
      resetForm();
      setShowAddModal(false);
      await refreshDues();
    } catch (error) {
      console.error("Add due failed", error);
      showToast(error.message || "Failed to add due", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const approvePayment = async (id) => {
    setProcessingId(id);
    try {
      const payload = new FormData();
      payload.append("id", id);
      const response = await fetch(`${BASE_URL}approve_payment.php`, {
        method: "POST",
        body: payload,
        credentials: "include"
      });
      const data = await safeJson(response);
      showToast(data.message || "Payment approved");
      await refreshDues();
    } catch (error) {
      console.error("Approve payment failed", error);
      showToast("Failed to approve payment", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const rejectPaymentRequest = async (id) => {
    setProcessingId(id);
    try {
      const payload = new FormData();
      payload.append("id", id);
      const response = await fetch(`${BASE_URL}reject_payment.php`, {
        method: "POST",
        body: payload,
        credentials: "include"
      });
      const data = await safeJson(response);
      showToast(data.message || "Payment rejected");
      await refreshDues();
    } catch (error) {
      console.error("Reject payment failed", error);
      showToast("Failed to reject payment", "error");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 px-4 py-10 md:p-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[420px] gap-4 text-gray-600">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            Loading monthly dues...
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 px-4 py-10 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 text-gray-900">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Monthly Dues</h1>
                <p className="text-sm text-gray-600">
                  Track homeowner dues, review payments, and add new months
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={refreshDues}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50 disabled:opacity-60"
            >
              <RefreshCcw className="w-4 h-4" />
              {refreshing ? "Refreshing..." : "Refresh list"}
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Add due
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total dues"
            value={summary.total}
            icon={<Calendar className="w-5 h-5" />}
            accent="bg-blue-100 text-blue-600"
          />
          <SummaryCard
            title="Paid"
            value={summary.paid}
            icon={<CheckCircle className="w-5 h-5" />}
            accent="bg-emerald-100 text-emerald-600"
          />
          <SummaryCard
            title="Awaiting review"
            value={summary.review}
            icon={<Clock className="w-5 h-5" />}
            accent="bg-amber-100 text-amber-600"
          />
          <SummaryCard
            title="Outstanding"
            value={currency(summary.outstanding)}
            icon={<AlertCircle className="w-5 h-5" />}
            accent="bg-rose-100 text-rose-600"
          />
        </div>

        <div className="flex flex-col gap-4 rounded-3xl border border-indigo-100 bg-white/80 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search homeowner, month, or reference"
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-800 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                  <Filter className="w-3.5 h-3.5" />
                  Status
                </span>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setStatusFilter(option.value)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                        statusFilter === option.value
                          ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                          : "border-gray-200 bg-white text-gray-600 hover:border-indigo-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>Sort by:</span>
              <SortButton
                label="Month"
                active={sortKey === "due_month"}
                direction={sortDir}
                onClick={() => toggleSort("due_month")}
              />
              <SortButton
                label="Amount"
                active={sortKey === "amount_due"}
                direction={sortDir}
                onClick={() => toggleSort("amount_due")}
              />
              <SortButton
                label="Status"
                active={sortKey === "status"}
                direction={sortDir}
                onClick={() => toggleSort("status")}
              />
            </div>
          </div>

          <div className="hidden md:block">
            <div className="overflow-hidden rounded-2xl border border-gray-100">
              <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
                <thead className="bg-gray-50">
                  <tr>
                    <TableHeader onClick={() => toggleSort("homeowner")}>
                      Homeowner
                    </TableHeader>
                    <TableHeader onClick={() => toggleSort("due_month")}>
                      Month
                    </TableHeader>
                    <TableHeader onClick={() => toggleSort("amount_due")}>
                      Amount
                    </TableHeader>
                    <TableHeader onClick={() => toggleSort("outstanding")}>
                      Outstanding
                    </TableHeader>
                    <TableHeader onClick={() => toggleSort("status")}>
                      Status
                    </TableHeader>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Details
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white/60">
                  {sortedDues.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center text-sm text-gray-500"
                      >
                        No dues match your filters.
                      </td>
                    </tr>
                  ) : (
                    sortedDues.map((due) => (
                      <tr key={due.id}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">
                            {due.homeownerName}
                          </div>
                          <div className="text-xs text-gray-500">{due.user_id}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{formatMonth(due.due_month)}</div>
                          <div className="text-xs text-gray-500">
                            {monthStatus(due.due_month)}
                          </div>
                        </td>
                        <td className="px-4 py-3">{currency(due.amount_due)}</td>
                        <td className="px-4 py-3">{currency(due.outstanding)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${due.status.badge}`}
                          >
                            {due.status.key === "paid" ? (
                              <CheckCircle className="w-3.5 h-3.5" />
                            ) : due.status.key === "review" ? (
                              <Clock className="w-3.5 h-3.5" />
                            ) : due.status.key === "overdue" ? (
                              <AlertCircle className="w-3.5 h-3.5" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )}
                            {due.status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          <div>
                            <span className="font-medium">Updated:</span>{" "}
                            {formatDateTime(due.lastUpdated)}
                          </div>
                          {due.gcash_reference && (
                            <div>
                              <span className="font-medium">Ref:</span>{" "}
                              {due.gcash_reference}
                            </div>
                          )}
                          {due.payment_proof_path && (
                            <button
                              type="button"
                              onClick={() => setProofImage(assetUrl(due.payment_proof_path))}
                              className="mt-1 inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View proof
                            </button>
                          )}
                          {Number(due.is_paid) === 1 && (
                            <a
                              href={`${BASE_URL}generate_due_receipt.php?id=${due.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              Receipt
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <ActionsColumn
                            due={due}
                            processingId={processingId}
                            onApprove={approvePayment}
                            onReject={rejectPaymentRequest}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4 md:hidden">
            {sortedDues.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white/60 p-6 text-center text-sm text-gray-500">
                No dues match your filters.
              </div>
            ) : (
              sortedDues.map((due) => (
                <div
                  key={due.id}
                  className="rounded-2xl border border-indigo-100 bg-white/80 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {due.homeownerName}
                      </div>
                      <div className="text-xs text-gray-500">{due.user_id}</div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${due.status.badge}`}
                    >
                      {due.status.label}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-gray-600">
                    <div>
                      <div className="text-gray-500">Month</div>
                      <div className="font-medium text-gray-900">
                        {formatMonth(due.due_month)}
                      </div>
                      <div>{monthStatus(due.due_month)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Updated</div>
                      <div className="font-medium text-gray-900">
                        {formatDateTime(due.lastUpdated)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Amount</div>
                      <div className="font-medium text-gray-900">
                        {currency(due.amount_due)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Outstanding</div>
                      <div className="font-medium text-gray-900">
                        {currency(due.outstanding)}
                      </div>
                    </div>
                  </div>

                  {due.gcash_reference && (
                    <div className="mt-3 rounded-xl bg-indigo-50 px-3 py-2 text-xs text-indigo-800">
                      <span className="font-medium">GCash Ref:</span>{" "}
                      {due.gcash_reference}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    {due.payment_proof_path && (
                      <button
                        type="button"
                        onClick={() => setProofImage(assetUrl(due.payment_proof_path))}
                        className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 font-medium text-indigo-700"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Proof
                      </button>
                    )}
                    {Number(due.is_paid) === 1 && (
                      <a
                        href={`${BASE_URL}generate_due_receipt.php?id=${due.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 font-medium text-indigo-700"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Receipt
                      </a>
                    )}
                  </div>

                  <div className="mt-4">
                    <ActionsColumn
                      due={due}
                      processingId={processingId}
                      onApprove={approvePayment}
                      onReject={rejectPaymentRequest}
                      compact
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 py-6 backdrop-blur-sm">
          <div className="relative flex w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Add monthly due
                  </h2>
                  <p className="text-xs text-gray-500">
                    Select a homeowner, choose the rate tier, and pick the billing month
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddDue} className="max-h-[75vh] overflow-y-auto px-6 py-6">
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Users className="w-4 h-4 text-indigo-500" />
                    Homeowner
                  </label>
                  <select
                    value={formData.user_id}
                    onChange={(event) =>
                      setFormData({
                        user_id: event.target.value,
                        rate_id: "",
                        amount_due: "",
                        due_month: ""
                      })
                    }
                    required
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="">Select homeowner</option>
                    {homeowners.map((owner) => (
                      <option key={owner.user_id} value={owner.user_id}>
                        {owner.full_name || owner.user_id}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Dues rate
                  </label>
                  <select
                    value={formData.rate_id}
                    onChange={(event) => {
                      const value = event.target.value;
                      const rate = rates.find((item) => String(item.id) === value);
                      setFormData((prev) => ({
                        ...prev,
                        rate_id: value,
                        amount_due: rate ? Number(rate.amount) : ""
                      }));
                    }}
                    required
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="">Select rate</option>
                    {rates.map((rate) => (
                      <option key={rate.id} value={rate.id}>
                        {rate.label} — {currency(rate.amount)}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-indigo-600">
                    Amount field is auto-filled and still editable before submission.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Amount
                  </label>
                  <div className="relative mt-2">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      ₱
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={formData.amount_due}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          amount_due: event.target.value
                        }))
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-8 pr-3 text-sm text-gray-800 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Due month
                  </label>
                  <div className="relative mt-2">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <select
                      value={formData.due_month}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          due_month: event.target.value
                        }))
                      }
                      required
                      disabled={!formData.user_id}
                      className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-800 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                    >
                      <option value="">
                        {formData.user_id
                          ? "Select a billing month"
                          : "Select homeowner first"}
                      </option>
                      {formData.user_id &&
                        missingMonthsForUser(formData.user_id).map((month) => (
                          <option key={month} value={month}>
                            {formatMonth(month)} — {monthStatus(month)}
                          </option>
                        ))}
                      {formData.user_id &&
                        missingMonthsForUser(formData.user_id).length === 0 && (
                          <option value="" disabled>
                            All recent months are already billed
                          </option>
                        )}
                    </select>
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  Payment method is enforced as GCASH for admin-added dues.
                </p>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add due
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {proofImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setProofImage(null)}
              className="absolute right-4 top-4 rounded-full bg-black/80 p-2 text-white"
              aria-label="Close proof preview"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={proofImage}
              alt="Payment proof"
              className="h-full w-full max-h-[80vh] rounded-3xl object-contain bg-gray-900"
            />
          </div>
        </div>
      )}
    </div>
  );
}
function SummaryCard({ title, value, icon, accent }) {
  return (
    <div className="rounded-3xl border border-indigo-100 bg-white/80 p-5 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function SortButton({ label, active, direction, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition ${
        active
          ? "border-indigo-500 bg-indigo-50 text-indigo-600"
          : "border-gray-200 bg-white text-gray-500 hover:border-indigo-200"
      }`}
    >
      {label}
      <ArrowUpDown
        className={`w-3.5 h-3.5 transition-transform ${
          active && direction === "asc" ? "rotate-180" : ""
        }`}
      />
    </button>
  );
}

function TableHeader({ onClick, children }) {
  return (
    <th
      scope="col"
      onClick={onClick}
      className="cursor-pointer select-none px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
    >
      <span className="inline-flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-3 w-3 text-gray-400" />
      </span>
    </th>
  );
}

function ActionsColumn({
  due,
  processingId,
  onApprove,
  onReject,
  compact = false
}) {
  const isReview = Number(due.is_paid) === 0 && Number(due.payment_requested) === 1;
  const isUnpaid =
    Number(due.is_paid) === 0 && Number(due.payment_requested) === 0;

  if (Number(due.is_paid) === 1) {
    return (
      <div className="text-sm text-emerald-600">
        Payment confirmed
      </div>
    );
  }

  return (
    <div
      className={`flex flex-wrap gap-2 ${compact ? "text-xs" : "text-sm"}`}
    >
      {(isReview || isUnpaid) && (
        <button
          type="button"
          onClick={() => onApprove(due.id)}
          disabled={processingId === due.id}
          className={`inline-flex items-center gap-1 rounded-full ${
            compact ? "px-3 py-1.5" : "px-4 py-2"
          } bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:opacity-60`}
        >
          {processingId === due.id ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          {isReview ? "Approve" : "Mark as paid"}
        </button>
      )}
      {isReview && (
        <button
          type="button"
          onClick={() => onReject(due.id)}
          disabled={processingId === due.id}
          className={`inline-flex items-center gap-1 rounded-full ${
            compact ? "px-3 py-1.5" : "px-4 py-2"
          } bg-rose-600 text-white transition hover:bg-rose-700 disabled:opacity-60`}
        >
          {processingId === due.id ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <X className="h-3.5 w-3.5" />
          )}
          Reject
        </button>
      )}
    </div>
  );
}
