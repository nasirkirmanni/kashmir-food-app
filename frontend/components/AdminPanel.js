"use client";

import { useEffect, useState } from "react";
import { endpoints, request } from "@/lib/api";

const dishInitialState = {
  name: "",
  description: "",
  fullDescription: "",
  history: "",
  touristTip: "",
  category: "Wazwan",
  foodType: "Non-veg",
  image: "",
  priceRange: "",
  popularityRating: 4.5,
  spiceLevel: "Medium",
  tags: ""
};

const restaurantInitialState = {
  name: "",
  location: "",
  city: "Srinagar",
  rating: 4.2,
  priceLevel: "Mid-range",
  tags: "",
  linkedDishes: [],
  image: "",
  description: "",
  authentic: false,
  overpriced: false,
  touristTrapWarning: false,
  touristTrapReason: "",
  googleMapsQuery: ""
};

export default function AdminPanel() {
  const [dishes, setDishes] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [leads, setLeads] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [dishForm, setDishForm] = useState(dishInitialState);
  const [restaurantForm, setRestaurantForm] = useState(restaurantInitialState);
  const [editingDishId, setEditingDishId] = useState(null);
  const [editingRestaurantId, setEditingRestaurantId] = useState(null);
  const [message, setMessage] = useState("");

  const loadData = async () => {
    const [dishData, restaurantData, leadsData, agenciesData] = await Promise.all([
      request(endpoints.dishes()),
      request(endpoints.restaurants()),
      request(endpoints.restaurantLeads()).catch(() => []),
      request("/travel-agencies/all").catch(() => [])
    ]);

    setDishes(dishData);
    setRestaurants(restaurantData);
    setLeads(leadsData);
    setAgencies(agenciesData);
  };

  const updateLeadStatus = async (id, status) => {
    try {
      await request(endpoints.restaurantLead(id), {
        method: "PUT",
        body: JSON.stringify({ status })
      });
      setMessage(`Lead status updated to ${status}.`);
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const deleteLead = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await request(endpoints.restaurantLead(id), {
        method: "DELETE"
      });
      setMessage("Lead deleted successfully.");
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const updateAgencyStatus = async (id, status, notes = "") => {
    try {
      await request(`/travel-agencies/admin/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status, notes })
      });
      setMessage(`Agency status updated to ${status}.`);
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    loadData().catch((error) => setMessage(error.message));
  }, []);

  const submitDish = async (event) => {
    event.preventDefault();
    await request(editingDishId ? endpoints.dish(editingDishId) : endpoints.dishes(), {
      method: editingDishId ? "PUT" : "POST",
      body: JSON.stringify({
        ...dishForm,
        tags: dishForm.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      })
    });
    setDishForm(dishInitialState);
    setEditingDishId(null);
    setMessage(editingDishId ? "Dish updated successfully." : "Dish added successfully.");
    await loadData();
  };

  const submitRestaurant = async (event) => {
    event.preventDefault();
    await request(
      editingRestaurantId ? endpoints.restaurant(editingRestaurantId) : endpoints.restaurants(),
      {
        method: editingRestaurantId ? "PUT" : "POST",
        body: JSON.stringify({
          ...restaurantForm,
          tags: restaurantForm.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        })
      }
    );
    setRestaurantForm(restaurantInitialState);
    setEditingRestaurantId(null);
    setMessage(
      editingRestaurantId
        ? "Restaurant updated successfully."
        : "Restaurant added successfully."
    );
    await loadData();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
      <div className="space-y-8">
        <section className="rounded-[32px] bg-white p-6 shadow-card">
          <h2 className="font-display text-3xl text-pine">
            {editingDishId ? "Edit dish" : "Add dish"}
          </h2>
          <form onSubmit={submitDish} className="mt-6 grid gap-4 sm:grid-cols-2">
            <input
              placeholder="Dish name"
              value={dishForm.name}
              onChange={(event) => setDishForm({ ...dishForm, name: event.target.value })}
              className="rounded-2xl border border-slate-200 px-4 py-3"
              required
            />
            <input
              placeholder="Image URL"
              value={dishForm.image}
              onChange={(event) => setDishForm({ ...dishForm, image: event.target.value })}
              className="rounded-2xl border border-slate-200 px-4 py-3"
              required
            />
            <input
              placeholder="Price range"
              value={dishForm.priceRange}
              onChange={(event) => setDishForm({ ...dishForm, priceRange: event.target.value })}
              className="rounded-2xl border border-slate-200 px-4 py-3"
              required
            />
            <select
              value={dishForm.category}
              onChange={(event) => setDishForm({ ...dishForm, category: event.target.value })}
              className="rounded-2xl border border-slate-200 px-4 py-3"
            >
              <option>Wazwan</option>
              <option>Street Food</option>
              <option>Cafes</option>
              <option>Budget Eats</option>
              <option>Luxury Dining</option>
            </select>
            <select
              value={dishForm.foodType}
              onChange={(event) => setDishForm({ ...dishForm, foodType: event.target.value })}
              className="rounded-2xl border border-slate-200 px-4 py-3"
            >
              <option>Veg</option>
              <option>Non-veg</option>
            </select>
            <input
              placeholder="Comma-separated tags"
              value={dishForm.tags}
              onChange={(event) => setDishForm({ ...dishForm, tags: event.target.value })}
              className="rounded-2xl border border-slate-200 px-4 py-3"
            />
            <textarea
              placeholder="Short description"
              value={dishForm.description}
              onChange={(event) => setDishForm({ ...dishForm, description: event.target.value })}
              className="sm:col-span-2 rounded-2xl border border-slate-200 px-4 py-3"
              rows={3}
              required
            />
            <textarea
              placeholder="Full description"
              value={dishForm.fullDescription}
              onChange={(event) =>
                setDishForm({ ...dishForm, fullDescription: event.target.value })
              }
              className="sm:col-span-2 rounded-2xl border border-slate-200 px-4 py-3"
              rows={4}
              required
            />
            <textarea
              placeholder="History"
              value={dishForm.history}
              onChange={(event) => setDishForm({ ...dishForm, history: event.target.value })}
              className="rounded-2xl border border-slate-200 px-4 py-3"
              rows={4}
              required
            />
            <textarea
              placeholder="Tourist tip"
              value={dishForm.touristTip}
              onChange={(event) => setDishForm({ ...dishForm, touristTip: event.target.value })}
              className="rounded-2xl border border-slate-200 px-4 py-3"
              rows={4}
              required
            />
            <div className="sm:col-span-2 flex gap-3">
              <button className="rounded-full bg-pine px-5 py-3 font-semibold text-white">
                {editingDishId ? "Update dish" : "Save dish"}
              </button>
              {editingDishId ? (
                <button
                  type="button"
                  onClick={() => {
                    setDishForm(dishInitialState);
                    setEditingDishId(null);
                  }}
                  className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="rounded-[32px] bg-white p-6 shadow-card">
          <h2 className="font-display text-3xl text-pine">
            {editingRestaurantId ? "Edit restaurant" : "Add restaurant"}
          </h2>
          <form onSubmit={submitRestaurant} className="mt-6 grid gap-4 sm:grid-cols-2">
            <input
              placeholder="Restaurant name"
              value={restaurantForm.name}
              onChange={(event) =>
                setRestaurantForm({ ...restaurantForm, name: event.target.value })
              }
              className="rounded-2xl border border-slate-200 px-4 py-3"
              required
            />
            <input
              placeholder="Image URL"
              value={restaurantForm.image}
              onChange={(event) =>
                setRestaurantForm({ ...restaurantForm, image: event.target.value })
              }
              className="rounded-2xl border border-slate-200 px-4 py-3"
              required
            />
            <input
              placeholder="Location"
              value={restaurantForm.location}
              onChange={(event) =>
                setRestaurantForm({ ...restaurantForm, location: event.target.value })
              }
              className="rounded-2xl border border-slate-200 px-4 py-3"
              required
            />
            <input
              placeholder="City"
              value={restaurantForm.city}
              onChange={(event) =>
                setRestaurantForm({ ...restaurantForm, city: event.target.value })
              }
              className="rounded-2xl border border-slate-200 px-4 py-3"
              required
            />
            <select
              value={restaurantForm.priceLevel}
              onChange={(event) =>
                setRestaurantForm({ ...restaurantForm, priceLevel: event.target.value })
              }
              className="rounded-2xl border border-slate-200 px-4 py-3"
            >
              <option>Budget</option>
              <option>Mid-range</option>
              <option>Luxury</option>
            </select>
            <input
              placeholder="Google Maps query"
              value={restaurantForm.googleMapsQuery}
              onChange={(event) =>
                setRestaurantForm({ ...restaurantForm, googleMapsQuery: event.target.value })
              }
              className="rounded-2xl border border-slate-200 px-4 py-3"
              required
            />
            <input
              placeholder="Comma-separated tags"
              value={restaurantForm.tags}
              onChange={(event) =>
                setRestaurantForm({ ...restaurantForm, tags: event.target.value })
              }
              className="sm:col-span-2 rounded-2xl border border-slate-200 px-4 py-3"
            />
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
              <input
                type="checkbox"
                checked={restaurantForm.authentic}
                onChange={(event) =>
                  setRestaurantForm({ ...restaurantForm, authentic: event.target.checked })
                }
              />
              Authentic
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
              <input
                type="checkbox"
                checked={restaurantForm.overpriced}
                onChange={(event) =>
                  setRestaurantForm({ ...restaurantForm, overpriced: event.target.checked })
                }
              />
              Overpriced
            </label>
            <label className="sm:col-span-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
              <input
                type="checkbox"
                checked={restaurantForm.touristTrapWarning}
                onChange={(event) =>
                  setRestaurantForm({
                    ...restaurantForm,
                    touristTrapWarning: event.target.checked
                  })
                }
              />
              Tourist trap warning
            </label>
            <textarea
              placeholder="Description"
              value={restaurantForm.description}
              onChange={(event) =>
                setRestaurantForm({ ...restaurantForm, description: event.target.value })
              }
              className="sm:col-span-2 rounded-2xl border border-slate-200 px-4 py-3"
              rows={4}
              required
            />
            <textarea
              placeholder="Tourist trap reason"
              value={restaurantForm.touristTrapReason}
              onChange={(event) =>
                setRestaurantForm({
                  ...restaurantForm,
                  touristTrapReason: event.target.value
                })
              }
              className="sm:col-span-2 rounded-2xl border border-slate-200 px-4 py-3"
              rows={3}
            />
            <div className="sm:col-span-2 rounded-[24px] border border-slate-200 p-4">
              <p className="mb-3 text-sm font-semibold text-pine">Link dishes</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {dishes.map((dish) => (
                  <label key={dish._id} className="flex items-center gap-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={restaurantForm.linkedDishes.includes(dish._id)}
                      onChange={(event) => {
                        const next = event.target.checked
                          ? [...restaurantForm.linkedDishes, dish._id]
                          : restaurantForm.linkedDishes.filter((id) => id !== dish._id);

                        setRestaurantForm({ ...restaurantForm, linkedDishes: next });
                      }}
                    />
                    {dish.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button className="rounded-full bg-pine px-5 py-3 font-semibold text-white">
                {editingRestaurantId ? "Update restaurant" : "Save restaurant"}
              </button>
              {editingRestaurantId ? (
                <button
                  type="button"
                  onClick={() => {
                    setRestaurantForm(restaurantInitialState);
                    setEditingRestaurantId(null);
                  }}
                  className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </section>
      </div>

      <aside className="space-y-6">
        {message ? (
          <section className="rounded-[32px] bg-white p-6 shadow-card border border-emerald-100">
            <p className="text-sm font-semibold text-emerald-800">{message}</p>
          </section>
        ) : null}


        <section className="rounded-[32px] bg-white p-6 shadow-card">
          <h4 className="text-lg font-semibold text-pine">Partner Requests</h4>
          <div className="mt-4 space-y-3">
            {leads.length === 0 ? (
              <p className="text-xs text-slate-500">No partner requests available.</p>
            ) : (
              leads.map((lead) => (
                <div key={lead._id} className="rounded-2xl bg-slate-50 p-4 text-sm relative">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-slate-900">{lead.restaurantName}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      lead.status === "approved" 
                        ? "bg-green-100 text-green-800" 
                        : lead.status === "rejected" 
                        ? "bg-red-100 text-red-800" 
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 text-slate-600 text-xs">
                    <p><strong>Owner:</strong> {lead.ownerName}</p>
                    <p><strong>Phone:</strong> {lead.phoneNumber}</p>
                    <p><strong>Location:</strong> {lead.location}</p>
                    {lead.description && <p><strong>Details:</strong> {lead.description}</p>}
                    <p className="text-[10px] text-slate-400">Submitted: {new Date(lead.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {lead.status !== "approved" && (
                      <button
                        onClick={() => updateLeadStatus(lead._id, "approved")}
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                    )}
                    {lead.status !== "rejected" && (
                      <button
                        onClick={() => updateLeadStatus(lead._id, "rejected")}
                        className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition-colors"
                      >
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => deleteLead(lead._id)}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[32px] bg-white p-6 shadow-card">
          <h4 className="text-lg font-semibold text-pine">Agency Review</h4>
          <div className="mt-4 space-y-3">
            {(!agencies || agencies.length === 0) ? (
              <p className="text-xs text-slate-500">No agencies available.</p>
            ) : (
              agencies.map((agency) => (
                <div key={agency._id} className="rounded-2xl bg-slate-50 p-4 text-sm relative">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-slate-900">{agency.agencyName}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      agency.verificationStatus === "approved" 
                        ? "bg-green-100 text-green-800" 
                        : agency.verificationStatus === "rejected" 
                        ? "bg-red-100 text-red-800" 
                        : agency.verificationStatus === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-800"
                    }`}>
                      {agency.verificationStatus}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 text-slate-600 text-xs">
                    <p><strong>Owner:</strong> {agency.ownerName}</p>
                    <p><strong>Email:</strong> {agency.email}</p>
                    <p><strong>City:</strong> {agency.city}</p>
                    {agency.whyChooseUs && <p><strong>Why Us:</strong> {agency.whyChooseUs}</p>}
                    <div className="flex gap-2 mt-1">
                      {agency.thumbnailUrl && <a href={agency.thumbnailUrl} target="_blank" rel="noreferrer" className="text-blue-500 underline">Logo</a>}
                      {agency.coverImageUrl && <a href={agency.coverImageUrl} target="_blank" rel="noreferrer" className="text-blue-500 underline">Cover</a>}
                    </div>
                  </div>
                  
                  {agency.verificationStatus === "pending" && (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => updateAgencyStatus(agency._id, "approved")}
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const notes = window.prompt("Rejection reason (optional):");
                          if (notes !== null) {
                            updateAgencyStatus(agency._id, "rejected", notes);
                          }
                        }}
                        className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </aside>
    </div>
  );
}
