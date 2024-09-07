const express = require('express');
const router = express.Router();
const Service = require('../models/serviceModel'); // Assuming the service model is in the models folder
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.SECRET_KEY; // Replace with a strong secret key

const authenticateToken = (req, res, next) => {
  console.log("Hi");
  const token = req.headers['authorization']?.split(' ')[1]; // Assuming Bearer token

  if (!token) return res.status(401).send('Access Denied');

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send('Invalid Token');
    req.userId = user.id;
    next();
  });
};

router.put('/update-status', async (req, res) => {
  const { serviceId, status } = req.body;

  try {
    const service = await Service.findByIdAndUpdate(
      serviceId,
      { status },
      { new: true }
    );
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update service status', error });
  }
});


router.put('/suspend', async (req, res) => {
  try {                                                                                                   
    const {serviceId} = req.body;
    console.log(serviceId)
    // Find the service by ID and update the status to "Suspended by customer"
    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      { status: 'Suspended by customer' },
      { new: true } // Return the updated service document
    );

    if (!updatedService) {
      return res.status(404).send({ error: 'Service not found' });
    }

    res.status(200).send(updatedService);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: 'Failed to suspend service' });
  }
});


router.get('/services', authenticateToken, async (req, res) => {
  try {
    const services = await Service.find({ userId: req.userId });
    res.status(200).json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});



// Route to create a new service
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract the token from the Authorization header
  console.log(token);
  if (!token) {
    return res.status(401).send({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Replace 'your_jwt_secret' with your JWT secret
    console.log(decoded);
    req.userId = decoded.id; // Assuming the token contains a 'userId' field
    next();
  } catch (error) {
    res.status(401).send({ error: 'Invalid token' });
  }
};

router.post('/services', authenticate, async (req, res) => {
  try {
    console.log("WOW");
    const { item, brand, modelName, specifications, condition, problem } = req.body;
    const userId = req.userId; // Get userId from the middleware
    console.log("userId " + userId);
    const newService = new Service({
      item,
      brand,
      modelName,
      specifications,
      condition,
      problem,
      userId, // Include userId in the service document
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
