import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { BASE_URL } from "../../config";
import Page from "../../components/ui/Page";
import Card, { CardContent } from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

export default function AmenityEdit() {
  const [amenities, setAmenities] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    fetchAmenities();
  }, []);

  const fetchAmenities = () => {
    fetch(`${BASE_URL}get_amenities.php`)
      .then((res) => res.json())
      .then((data) => setAmenities(data))
      .catch((err) => console.error("Error fetching amenities:", err));
  };

  const handleDelete = () => {
    if (!selectedId) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this amenity?");
    if (!confirmDelete) return;

    fetch(`${BASE_URL}delete_amenity.php`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ id: selectedId }),
    })
      .then((res) => res.json())
      .then((data) => {
        import("../../lib/toast").then(({ showToast }) => showToast(data.message || "Amenity deleted."));
        setSelectedId("");
        setNewName("");
        setNewDescription("");
        setNewImage(null);
        setPreview("");
        fetchAmenities();
      })
      .catch((err) => {
        console.error("Deletion error:", err);
        import("../../lib/toast").then(({ showToast }) => showToast("Something went wrong.", 'error'));
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedId) return alert("Select an amenity first.");

    const formData = new FormData();
    formData.append("amenity_id", selectedId);
    formData.append("new_name", newName);
    formData.append("new_description", newDescription);
    if (newImage) formData.append("new_image", newImage);

    const res = await fetch(`${BASE_URL}edit_amenity.php`, {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    if (result.success) {
      import("../../lib/toast").then(({ showToast }) => showToast("Amenity updated."));
      setSelectedId("");
      setNewName("");
      setNewDescription("");
      setNewImage(null);
      setPreview("");
      fetchAmenities();
    } else {
      import("../../lib/toast").then(({ showToast }) => showToast((result.message ? ("Update failed: " + result.message) : (result.error || "Update failed.")), 'error'));
    }
  };

  return (
    <Page title="Edit Amenity" description="Update names, descriptions, or images for facilities">
      <Card className="max-w-xl">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-end gap-3">
              <div className="w-full">
                <label className="block mb-1 text-sm font-medium text-gray-700">Select Amenity</label>
                <Select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} required>
                  <option value="">-- Choose an amenity --</option>
                  {amenities.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </Select>
              </div>
              <Button type="button" variant="destructive" onClick={handleDelete} title="Delete amenity">
                <Trash2 size={18} />
              </Button>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">New Name (optional)</label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>

            <div>
              <label htmlFor="amenity-newdesc" className="block mb-1 text-sm font-medium text-gray-700">New Description (optional)</label>
              <Textarea id="amenity-newdesc" rows={3} value={newDescription} onChange={(e) => setNewDescription(e.target.value.slice(0, 1000))} maxLength={1000} />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">New Image (optional)</label>
              {preview && (
                <img src={preview} alt="Preview" className="w-24 h-24 object-cover rounded border mb-2" />
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setNewImage(file)
                    setPreview(URL.createObjectURL(file))
                  }
                }}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">Update Amenity</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Page>
  );
}
