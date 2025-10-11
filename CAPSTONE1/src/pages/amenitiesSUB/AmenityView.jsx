import React, { useState, useEffect } from "react";
import { BASE_URL } from "../../config";
import { assetUrl } from "../../lib/asset";
import Page from "../../components/ui/Page";
import Card, { CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Calendar, Clock, Building2, Send, Loader2, CheckCircle, Info } from "lucide-react";

export default function AmenityView() {
  const [amenities, setAmenities] = useState([]);

  // Booking (homeowner only)
  const role = localStorage.getItem('role');
  const isHomeowner = role === 'homeowner';
  const [allAmenities, setAllAmenities] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ amenity_id: "", request_date: null, time_start: null, time_end: null, message: "" });

  // UI enhancements
  const [bookedSet, setBookedSet] = useState(new Set()); // amenity_ids booked on selected date
  const [details, setDetails] = useState({ open:false, item:null, schedules:[] });
  const [imageLoaded, setImageLoaded] = useState({}); // id->bool

  // Load all amenities (no pagination)
  useEffect(() => {
    fetch(`${BASE_URL}get_amenities.php`, { credentials:'include' })
      .then((res) => res.json())
      .then((data) => {
        setAmenities(Array.isArray(data) ? data : (data.amenities || []));
      })
      .catch(()=> setAmenities([]));
  }, []);

  useEffect(()=>{
    if (!isHomeowner) return;
    fetch(`${BASE_URL}get_amenities.php`, { credentials:'include' })
      .then(res=>res.json())
      .then(data=> setAllAmenities(Array.isArray(data)? data:[]))
      .catch(()=>{});
  }, [isHomeowner]);

  // Fetch upcoming schedules once and compute daily booked set when date changes
  useEffect(()=>{
    const date = formData.request_date;
    if (!date) { setBookedSet(new Set()); return; }
    const ymd = date.toISOString().split('T')[0];
    fetch(`${BASE_URL}get_upcoming_amenity_schedules.php`, { credentials:'include' })
      .then(r=>r.json())
      .then(list=>{
        const s = new Set();
        (Array.isArray(list)? list: []).forEach(it=>{
          const d = (it.date || it.request_date || '').slice(0,10);
          if (d === ymd) s.add(String(it.amenity_id || it.amenityId || it.id));
        });
        setBookedSet(s);
      })
      .catch(()=> setBookedSet(new Set()));
  }, [formData.request_date]);

  const handleChange = (e)=> setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e)=>{
    e.preventDefault(); setSubmitting(true);
    try {
      const homeownerId = localStorage.getItem('user_id');
      const fd = new FormData();
      fd.append('homeowner_id', homeownerId);
      fd.append('amenity_id', formData.amenity_id);
            fd.append('message', formData.message || '');
      if (formData.request_date) fd.append('request_date', formData.request_date.toISOString().split('T')[0]);
      if (formData.time_start) fd.append('time_start', formData.time_start.toTimeString().slice(0,5));
      if (formData.time_end) fd.append('time_end', formData.time_end.toTimeString().slice(0,5));
      const res = await fetch(`${BASE_URL}schedule_amenity.php`, { method:'POST', body: fd, credentials:'include' });
const result = await res.json();
      const el=document.createElement('div'); el.className=`fixed top-20 right-4 ${result.success!==false? 'bg-green-600':'bg-red-600'} text-white px-4 py-2 rounded`; el.textContent=result.message || (result.success!==false? 'Amenity booking request submitted!':'Failed to submit request'); document.body.appendChild(el); setTimeout(()=>el.remove(),3000);
      if (result.success!==false) setFormData({ amenity_id:"", request_date:null, time_start:null, time_end:null, message:"" });
    } catch(e){ console.error(e);} finally { setSubmitting(false); }
  };

  return (
    <Page
      title="Amenities"
      description={isHomeowner? "Browse and submit a reservation request" : "Browse facilities residents can reserve"}
    >
      {isHomeowner && (
        <Card className="mb-6">
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Reservation Details</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2"><Building2 className="w-4 h-4 inline mr-1"/>Select Amenity</label>
                <select name="amenity_id" value={formData.amenity_id} onChange={handleChange} required className="w-full p-3 border rounded">
                  <option value="">Choose...</option>
                  {allAmenities.map(a=> (<option key={a.id} value={a.id}>{a.name}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2"><Calendar className="w-4 h-4 inline mr-1"/>Date</label>
                  <input type="date" className="w-full p-3 border rounded" value={formData.request_date? formData.request_date.toISOString().split('T')[0] : ''} onChange={(e)=>{
                    const d=new Date(e.target.value+'T00:00:00'); setFormData({...formData, request_date: e.target.value? d:null});
                  }} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2"><Clock className="w-4 h-4 inline mr-1"/>Start</label>
                  <input type="time" className="w-full p-3 border rounded" value={formData.time_start? formData.time_start.toTimeString().slice(0,5):''} onChange={(e)=>{
                    const [h,m]=e.target.value.split(':'); const d=new Date(); d.setHours(+h||0, +m||0,0,0); setFormData({...formData, time_start: e.target.value? d:null});
                  }} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2"><Clock className="w-4 h-4 inline mr-1"/>End</label>
                  <input type="time" className="w-full p-3 border rounded" value={formData.time_end? formData.time_end.toTimeString().slice(0,5):''} onChange={(e)=>{
                    const [h,m]=e.target.value.split(':'); const d=new Date(); d.setHours(+h||0, +m||0,0,0); setFormData({...formData, time_end: e.target.value? d:null});
                  }} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Message (Optional)</label>
                <textarea className="w-full p-3 border rounded resize-none" name="message" rows={3} value={formData.message} onChange={handleChange} />
              </div>
              <div className="text-right">
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">{submitting? 'Submitting...' : 'Submit Booking Request'}</button>
              </div>
              <div className="mt-3 text-xs text-blue-800 bg-blue-50 border border-blue-200 rounded p-2">
                <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-blue-600 mt-0.5"/><span>Bookings must be made at least 48 hours in advance. Max duration: 4 hours.</span></div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      {/* Featured Amenities */}
      <div className="mt-8 mb-3">
        <h2 className="text-xl font-semibold text-gray-900">Available Amenities</h2>
        <p className="text-sm text-gray-600">Tap a card to view details before booking</p>
      </div>

      {(!amenities || amenities.length === 0) ? (
        <div className="text-center text-gray-600 bg-white border border-gray-200 rounded-xl p-8">No amenities found.</div>
      ) : (
        <>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center justify-items-center">
            {amenities.map((amenity) => (
              <Card key={amenity.id} className="w-full max-w-md hover:shadow-md transition-shadow">
                <div className="aspect-[16/9] w-full overflow-hidden rounded-lg relative">
                  {!imageLoaded[amenity.id] && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
                  <img
                    src={assetUrl(amenity.image)}
                    alt={amenity.name}
                    className={`w-full h-full object-cover ${imageLoaded[amenity.id]? '' : 'opacity-0'}`}
                    loading="lazy"
                    onLoad={()=> setImageLoaded(prev=> ({...prev, [amenity.id]: true}))}
                  />
                </div>
                <CardContent className="mt-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{amenity.name}</h3>
                    {formData.request_date && (
                      <span className={`text-xs px-2 py-1 rounded-full ${bookedSet.has(String(amenity.id))? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {bookedSet.has(String(amenity.id))? 'Booked' : 'Available'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-3">{amenity.description}</p>
                  <div className="mt-3 flex gap-2">
                    <Button variant="secondary" onClick={async ()=>{
                      // Fetch schedules for the next 7 days
                      try{
                        const res = await fetch(`${BASE_URL}get_amenity_schedules.php?amenity_id=${amenity.id}`, { credentials:'include' });
                        const data = await res.json();
                        setDetails({ open:true, item: amenity, schedules: Array.isArray(data)? data: [] });
                      }catch{
                        setDetails({ open:true, item: amenity, schedules: [] });
                      }
                    }}>
                      <Info className="w-4 h-4 mr-1"/> View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}


      {/* Details Modal */}
      {details.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">{details.item?.name}</h3>
              <button onClick={()=> setDetails({ open:false, item:null, schedules:[] })} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            {/* Large image preview */}
            {details.item?.image && (
              <div className="w-full h-[40vh] sm:h-[50vh] bg-black/5 flex items-center justify-center overflow-hidden">
                <img
                  src={assetUrl(details.item.image)}
                  alt={details.item?.name || 'Amenity'}
                  className="max-h-full max-w-full object-contain"
                  loading="lazy"
                  onError={(e)=>{ e.currentTarget.style.display='none'; }}
                />
              </div>
            )}
            <div className="p-4 space-y-3">
              <div className="text-sm text-gray-700">{details.item?.description || 'No description.'}</div>
              {details.item?.capacity && (
                <div className="text-sm"><span className="font-medium">Capacity:</span> {details.item.capacity}</div>
              )}
              {details.item?.rules && (
                <div className="text-sm"><span className="font-medium">Rules:</span> {details.item.rules}</div>
              )}
              <div>
                <div className="font-medium text-gray-900 mb-2">Upcoming Schedules</div>
                {details.schedules && details.schedules.length>0 ? (
                  <ul className="text-sm text-gray-700 list-disc ml-5 space-y-1 max-h-48 overflow-auto">
                    {details.schedules.slice(0,10).map((s,i)=> (
                      <li key={i}>{(s.date || s.request_date || '').slice(0,10)} {s.time_start? `• ${s.time_start}`: ''} {s.time_end? ` - ${s.time_end}`: ''}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-600">No upcoming schedules.</div>
                )}
              </div>
            </div>
            <div className="p-4 border-t flex justify-end">
              <Button onClick={()=> setDetails({ open:false, item:null, schedules:[] })}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom spacer for extra scroll room */}
      <div className="h-24" aria-hidden="true" />
    </Page>
  );
}




