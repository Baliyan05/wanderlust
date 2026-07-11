const Listing = require("../models/listing");

module.exports.index = async(req,res) => {
    console.log(req.query);
    const {search, type, category} = req.query;

    let filter = {};

    if(category) {
        filter.category = category;
    }

    if(search && type) {
        filter[type] = {
            $regex: search,
            $options: "i"
        }
        
    }

    const allListings = await Listing.find(filter);
    res.render("listings/index.ejs",{allListings});
}

module.exports.renderNewForm = (req,res) => {
    res.render("listings/new.ejs");
}




module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    let listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    // Generate coordinates only if missing
    if (!listing.geometry?.coordinates?.length) {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                listing.location
            )}`,
            {
                headers: {
                    "User-Agent": "WanderLust/1.0 (learning project)",
                    "Accept": "application/json",
                },
            }
        );
        if (response.ok) {
            const data = await response.json();

            if (data.length > 0) {
                listing.geometry = {
                    type: "Point",
                    coordinates: [
                        parseFloat(data[0].lon),
                        parseFloat(data[0].lat),
                    ],
                };
                await listing.save();
            }
        }
    }
    console.log(listing.geometry);
    res.render("listings/show.ejs", { listing });
};



module.exports.createListing = async(req, res, next) => {
    // let { title, description, image, price, location, country } = req.body;
      let url = req.file.path;
      let filename = req.file.filename;

      const address = req.body.listing.location;

      const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
        {
          headers: {
            "User-Agent": "WanderLust/1.0 (learning project)",
            "Accept": "application/json",
          },
        }
      );

      if(!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }
      const data = await response.json();
      const newListing = new Listing(req.body.listing);

      if (data.length > 0) {
         newListing.geometry = {
              type: "Point",
              coordinates: [
                  parseFloat(data[0].lon),
                  parseFloat(data[0].lat)
              ]
          };
      }

      newListing.owner = req.user._id;
      newListing.image = {url, filename};
      await newListing.save();
      req.flash("success", "New Listing Created!");
      res.redirect("/listings")
}

module.exports.renderEditForm = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", {listing, originalImageUrl});
}

module.exports.updateListing = async (req,res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if(typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
    await listing.save();
    }
    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}