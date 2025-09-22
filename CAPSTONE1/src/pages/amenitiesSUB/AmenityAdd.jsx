import { useState } from "react";
import { BASE_URL } from "../../config";
import Page from "../../components/ui/Page";
import Card, { CardContent } from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";

export default function AmenityAdd() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (image) formData.append("image", image);

    try {
      const res = await fetch(`${BASE_URL}add_amenity.php`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        import("../../lib/toast").then(({ showToast }) => showToast("Amenity added successfully!"));
        setName("");
        setDescription("");
        setImage(null);
        setPreview("");
      } else {
        import("../../lib/toast").then(({ showToast }) => showToast((result.message ? ("Error: " + result.message) : "Failed to add amenity."), 'error'));
      }
    } catch (err) {
      console.error("Upload failed:", err);
      import("../../lib/toast").then(({ showToast }) => showToast("Something went wrong.", 'error'));
    }
  };

  return (
    <Page title="Add Amenity" description="Create a new facility your community can reserve">
      <Card className="max-w-2xl">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amenity Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Swimming Pool"
                required
              />
            </div>

            <div>
              <label htmlFor="amenity-desc" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Textarea
                id="amenity-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                placeholder="Describe the amenity (capacity, rules, etc.)"
                rows={6}
                maxLength={1000}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              {preview && (
                <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded border mb-2" />
              )}
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
                required
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">Add Amenity</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Page>
  );
}
