import { Link } from "react-router-dom";
import Page from "../components/ui/Page";
import Card, { CardContent } from "../components/ui/Card";
import Button from "../components/ui/Button";
import { CalendarDays, Eye, Plus, Wrench } from "lucide-react";

export default function Amenities() {
  return (
    <Page title="Amenities" description="Manage community facilities and bookings">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <Eye className="text-indigo-600" />
              <div>
                <h3 className="font-semibold text-gray-900">View</h3>
                <p className="text-sm text-gray-600">Browse all amenities</p>
              </div>
            </div>
            <div className="mt-4">
              <Button as={Link} to="/amenities/view">Open</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <Plus className="text-indigo-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Add</h3>
                <p className="text-sm text-gray-600">Create a new amenity</p>
              </div>
            </div>
            <div className="mt-4">
              <Button as={Link} to="/amenities/add">Open</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <Wrench className="text-indigo-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Edit</h3>
                <p className="text-sm text-gray-600">Update existing amenities</p>
              </div>
            </div>
            <div className="mt-4">
              <Button as={Link} to="/amenities/edit">Open</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <CalendarDays className="text-indigo-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Schedules</h3>
                <p className="text-sm text-gray-600">Approve or reject bookings</p>
              </div>
            </div>
            <div className="mt-4">
              <Button as={Link} to="/amenities/schedules">Open</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
