const express = require("express");
const router = express.Router();
const Coupon = require("../models/couponModel"); // Adjust the path to your Coupon model

router.post("/coupon", async (req, res) => {
  try {
    const { code, price, expiryDate, peopleLimit } = req.body;

    const newCoupon = new Coupon({
      code,
      price,
      expiryDate: new Date(expiryDate), // Ensure expiryDate is a Date object
      peopleLimit,
    });

    await newCoupon.save();
    res.status(201).send(newCoupon);
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: "Failed to create coupon." });
  }
});

router.get("/coupon/validate/:code", async (req, res) => {
  try {
    const { code } = req.params;

    const coupon = await Coupon.findOne({ code });
    if (!coupon) {
      return res
        .status(404)
        .send({ valid: false, message: "Coupon not found." });
    }

    const isExpired = new Date() > coupon.expiryDate;
    const isLimitReached = coupon.usedBy.length >= coupon.peopleLimit;

    if (isExpired || isLimitReached) {
      return res
        .status(400)
        .send({
          valid: false,
          message: "Coupon is either expired or usage limit is reached.",
        });
    }

    res.send({ valid: true, coupon });
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: "Failed to validate coupon." });
  }
});

router.put("/coupon/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { price, expiryDate, peopleLimit } = req.body;

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      id,
      {
        price,
        expiryDate: new Date(expiryDate), // Ensure expiryDate is a Date object
        peopleLimit,
      },
      { new: true } // Return the updated document
    );

    if (!updatedCoupon) {
      return res.status(404).send({ error: "Coupon not found." });
    }

    res.send(updatedCoupon);
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: "Failed to update coupon." });
  }
});

router.delete("/coupon/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCoupon = await Coupon.findByIdAndDelete(id);
    if (!deletedCoupon) {
      return res.status(404).send({ error: "Coupon not found." });
    }

    res.send({ message: "Coupon deleted successfully.", deletedCoupon });
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: "Failed to delete coupon." });
  }
});

module.exports = router;