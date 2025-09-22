import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { BASE_URL } from "../../config";
import Page from "../../components/ui/Page";
import Card, { CardContent } from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

export default function ItemsEdit() {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = () => {
    fetch(`${BASE_URL}get_items.php`)
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error("Error fetching items:", err));
  };

  const handleDelete = () => {
    if (!selectedId) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (!confirmDelete) return;

    fetch(`${BASE_URL}delete_item.php`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ id: selectedId }),
    })
      .then((res) => res.json())
      .then((data) => {
        import("../../lib/toast").then(({ showToast }) => showToast(data.message || "Item deleted."));
        setSelectedId("");
        setNewName("");
        setNewDescription("");
        setNewImage(null);
        setPreview("");
        fetchItems();
      })
      .catch((err) => {
        console.error("Deletion error:", err);
        import("../../lib/toast").then(({ showToast }) => showToast("Something went wrong.", 'error'));
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedId) return alert("Please select an item first.");

    const formData = new FormData();
    formData.append("item_id", selectedId);
    formData.append("new_name", newName);
    formData.append("new_description", newDescription);
    if (newImage) formData.append("new_image", newImage);

    const res = await fetch(`${BASE_URL}edit_item.php`, {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    if (result.success) {
      import("../../lib/toast").then(({ showToast }) => showToast("Item updated successfully."));
      setSelectedId("");
      setNewName("");
      setNewDescription("");
      setNewImage(null);
      setPreview("");
      fetchItems();
    } else {
      import("../../lib/toast").then(({ showToast }) => showToast((result.message ? ("Update failed: " + result.message) : (result.error || "Update failed.")), 'error'));
    }
  };

  return (
    <Page title="Edit Item" description="Update item details or replace images">
      <Card className="max-w-xl">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-end gap-3">
              <div className="w-full">
                <label className="block mb-1 text-sm font-medium text-gray-700">Select Item</label>
                <Select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} required>
                  <option value="">-- Choose an item --</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </Select>
              </div>
              <Button type="button" variant="destructive" onClick={handleDelete} title="Delete item">
                <Trash2 size={18} />
              </Button>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">New Name (optional)</label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. New Item Name" />
            </div>

            <div>
              <label htmlFor="item-newdesc" className="block mb-1 text-sm font-medium text-gray-700">New Description (optional)</label>
              <Textarea id="item-newdesc" rows={3} value={newDescription} onChange={(e) => setNewDescription(e.target.value.slice(0, 1000))} placeholder="e.g. Updated item description..." maxLength={1000} />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">New Image (optional)</label>
              {preview && (<img src={preview} alt="Preview" className="w-24 h-24 object-cover rounded border mb-2" />)}
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
              <Button type="submit">Update Item</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Page>
  );
}
