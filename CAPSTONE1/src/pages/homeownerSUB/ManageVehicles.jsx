import React, { useEffect, useState } from "react";
import { Pencil, Trash2, MoreVertical, X } from "lucide-react";
import { BASE_URL } from "../../config";
import { assetUrl } from "../../lib/asset";
import Page from "../../components/ui/Page";
import Table, { THead, TR, TH, TBody, TD } from "../../components/ui/Table";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card, { CardContent } from "../../components/ui/Card";
import { Car } from "lucide-react";

export default function ManageVehicles() {
  const userId = localStorage.getItem("user_id");
  const [vehicles, setVehicles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: "", type: "", color: "", plate: "" });
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = () => {
    fetch(`${BASE_URL}get_user_details.php?user_id=${userId}`)
      .then((res) => res.json())
      .then((data) => setVehicles(data.vehicles || []))
      .catch((err) => console.error("Failed to fetch vehicles", err));
  };

  const handleEdit = (vehicle) => {
    setEditingId(vehicle.id);
    setEditData({
      name: vehicle.name,
      type: vehicle.type, // using alias from get_user_details.php
      color: vehicle.color,
      plate: vehicle.plate, // using alias from get_user_details.php
    });
    setDropdownOpenId(null);
  };

  const handleSave = (id) => {
    const formData = new FormData();
    formData.append("id", id);
    formData.append("vehicle_name", editData.name);
    formData.append("vehicle_type", editData.type);
    formData.append("vehicle_color", editData.color);
    formData.append("vehicle_plate", editData.plate);

    fetch(`${BASE_URL}update_vehicle.php`, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          import("../../lib/toast").then(({ showToast }) => showToast("Vehicle updated."));
          setEditingId(null);
          fetchVehicles();
        } else {
          import("../../lib/toast").then(({ showToast }) => showToast("Update failed.", 'error'));
        }
      });
  };

  const handleDelete = (id) => {
    setDropdownOpenId(null);
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      const formData = new FormData();
      formData.append("id", id);

      fetch(`${BASE_URL}delete_vehicle.php`, {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            import("../../lib/toast").then(({ showToast }) => showToast("Vehicle deleted."));
            fetchVehicles();
          } else {
            import("../../lib/toast").then(({ showToast }) => showToast("Delete failed.", 'error'));
          }
        });
    }
  };

  return (
    <Page>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Vehicles</h1>
              <p className="text-gray-600">Update or remove vehicles linked to your account</p>
            </div>
          </div>
        </div>
        <Card>
          <CardContent>
            <Table>
              <THead>
          <TR>
            <TH>Name</TH>
            <TH>Type</TH>
            <TH>Color</TH>
            <TH>Plate</TH>
            <TH>Block & Lot</TH>
            <TH>Photo</TH>
            <TH>Actions</TH>
          </TR>
        </THead>
        <TBody>
          {vehicles.map((v) => (
            <TR key={v.id}>
              <TD>
                {editingId === v.id ? (
                  <Input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                ) : (
                  v.name || "-"
                )}
              </TD>
              <TD>
                {editingId === v.id ? (
                  <Input value={editData.type} onChange={(e) => setEditData({ ...editData, type: e.target.value })} />
                ) : (
                  v.type
                )}
              </TD>
              <TD>
                {editingId === v.id ? (
                  <Input value={editData.color} onChange={(e) => setEditData({ ...editData, color: e.target.value })} />
                ) : (
                  v.color || "-"
                )}
              </TD>
              <TD>
                {editingId === v.id ? (
                  <Input value={editData.plate} onChange={(e) => setEditData({ ...editData, plate: e.target.value })} />
                ) : (
                  v.plate
                )}
              </TD>
              <TD>Block {v.block}, Lot {v.lot}</TD>
              <TD>
                {v.vehicle_pic_path ? (
                  <img src={assetUrl(v.vehicle_pic_path)} alt="Vehicle" className="w-14 h-10 object-cover rounded cursor-pointer border" onClick={() => setSelectedImage(assetUrl(v.vehicle_pic_path))} />
                ) : (
                  "-"
                )}
              </TD>
              <TD>
                {editingId === v.id ? (
                  <Button size="sm" onClick={() => handleSave(v.id)}>Save</Button>
                ) : (
                  <div className="inline-flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => handleEdit(v)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(v.id)}>Delete</Button>
                  </div>
                )}
              </TD>
            </TR>
          ))}
        </TBody>
            </Table>
          </CardContent>
        </Card>

      {selectedImage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative bg-white p-4 rounded shadow-xl">
            <button onClick={() => setSelectedImage(null)} className="absolute top-2 right-2 text-gray-500 hover:text-black">
              <X size={20} />
            </button>
            <img src={selectedImage} alt="Full Vehicle" className="max-w-full max-h-[80vh] rounded" />
          </div>
        </div>
      )}
      </div>
    </Page>
  );
}
