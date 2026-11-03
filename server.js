import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import "dotenv/config";
import express from "express";
import mongoose from "mongoose";

const app = express();
const listingsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  pricePerNight: { type: Number, required: true },
});

const Listing = mongoose.model("Listing", listingsSchema);
async function connectDB(){
  console.log("connecting to MongoDB...");
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri, { dbName: "ebd-bnb" }); 
  console.log("Connected to MongoDB"); 
}

app.use((req, res, next) => {
console.log(req.method, req.url); next();
});

app.use(express.json());



async function getAllListings() {
  return Listing.find();
}

async function getListingById(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Listing.findById(id);
}

async function addListing(data) {
  return Listing.create(data);
}

async function updateListing(id, data) {
  if (!mongoose.isValidObjectId(id)) return null;

  return Listing.findByIdAndUpdate(id, data, {
    new: true,
  });
}

async function removeListing(id) {
  if (!mongoose.isValidObjectId(id)) return null;

  return Listing.findByIdAndDelete(id);
}

async function handleGetAll(req, res) {
 res. json(await getAllListings());

}

async function handleGetOne(req, res) {
  const listing = await getListingById(req. params. id) 

  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }

  res.json(listing);
}

async function handleCreate(req, res) {
  const data = req.body || {};

  if (!data.title || !data.pricePerNight) {
    return res
      .status(400)
      .json({ error: "title and pricePerNight are required" });
  }

  res. status(201). json(await addListing(data)); 
}

async function handleUpdate(req, res) {
  const data = req.body || {};

  if (!data.title || !data.pricePerNight) {
    return res
      .status(400)
      .json({ error: "title and pricePerNight are required" });
  }

  const listing = await updateListing(req. params. id, data) 

  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }

  res.json(listing);
}

async function handleDelete(req, res) {
  const listing = await removeListing(req. params. id)


  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }

  res.status(204).end();
}

app.get("/", (req, res) => {
  res.send("Welcome to ebd bn'b");
});

app.get("/api/listings", handleGetAll);
app.get("/api/listings/:id", handleGetOne);
app.post("/api/listings", handleCreate);
app.put("/api/listings/:id", handleUpdate);
app.delete("/api/listings/:id", handleDelete);

await connectDB(); 

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
