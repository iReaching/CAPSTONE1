import { useState } from "react";
import { BASE_URL } from "../../config";
import Page from "../../components/ui/Page";
import Card, { CardContent } from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";

export default function ItemsAdd() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("quantity", quantity);
    if (image) formData.append("image", image);

    try {
      const res = await fetch(`${BASE_URL}add_item.php`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (result.success || result.message?.includes("success")) {
        import("../../lib/toast").then(({ showToast }) => showToast("Item added successfully!"));
        setName("");
        setDescription("");
        setQuantity(1);
        setImage(null);
        setPreview("");
      } else {
        import("../../lib/toast").then(({ showToast }) => showToast((result.message ? ("Error: " + result.message) : "Failed to add item."), 'error'));
      }
    } catch (err) {
      console.error("Upload failed:", err);
      import("../../lib/toast").then(({ showToast }) => showToast("Something went wrong.", 'error'));
    }
  };

  return (
    <Page title="Add Item" description="Add a new item to the borrowable inventory">
      <Card className="max-w-2xl">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
              <Input
                type="text"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ladder"
              />
            </div>

            <div>
              <label htmlFor="item-desc" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Textarea
                id="item-desc"
                value={description}
                required
                onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                placeholder="Enter the item's description here."
                rows={6}
                maxLength={1000}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Available</label>
              <Input
                type="number"
                value={quantity}
                min={1}
                required
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 5 (minimum 1)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              {preview && (<img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded border mb-2" />)}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setImage(file)
                    setPreview(URL.createObjectURL(file))
                  }
                }}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">Add Item</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Page>
  );
}
