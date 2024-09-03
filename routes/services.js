const express = require('express');
const router = express.Router();
const Service = require('../models/serviceModel'); // Assuming the service model is in the models folder

// Route to create a new service
router.post('/services', async (req, res) => {
  try {
    console.log("WOW");
    const { item, brand, modelName, specifications, condition, problem } = req.body;
    
    const newService = new Service({
      item,
      brand,
      modelName,
      specifications,
      condition,
      problem,
    });

    await newService.save();
    res.status(201).send(newService);
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: 'Failed to create service' });
  }
});

// Route to update the price and status of a service
router.put('/services/:id', async (req, res) => {
  const { id } = req.params;
  const { price, status } = req.body;

  try {
    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).send({ error: 'Service not found' });
    }

    // Update only if values are provided in the request body
    if (price !== undefined) service.price = price;
    if (status !== undefined) service.status = status;

    await service.save();
    res.send(service);
  } catch (error) {
    res.status(400).send({ error: 'Failed to update service' });
  }
});

// Route to get all services
router.get('/services', async (req, res) => {
  try {
    // Fetch all services from the database
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});


module.exports = router;
