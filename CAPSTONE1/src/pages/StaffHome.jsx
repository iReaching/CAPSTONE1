import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import Page from "../components/ui/Page";
import Card, { CardContent } from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function StaffHome() {
  const [summary, setSummary] = useState({ dues_pending: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    // Placeholder; can be wired to a finance summary endpoint later
    setSummary({ dues_pending: 0 });
  }, []);

  return (
    <Page title="Finance Dashboard" description="Review monthly dues and payment proofs">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex flex-col items-center text-center gap-3">
            <img src="https://cdn-icons-png.flaticon.com/512/1170/1170627.png" alt="Dues" className="w-16 h-16 object-contain" />
            <h2 className="text-lg font-semibold text-gray-900">Monthly Dues</h2>
            <p className="text-sm text-gray-600">Manage dues and verify payment proofs</p>
            <Button onClick={() => navigate("/dues")}>Open</Button>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
