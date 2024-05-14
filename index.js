const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express ();
const port = process.env.PORT || 5000;

//middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
       "https://simple-services-client.web.app", "https://simple-services-client.firebaseapp.com",
      ],
    credentials: true,
   })
  )
app.use (express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lic5ni0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const serviceCollection = client.db('simpleServices').collection('services')
    const purchaseServicesCollection = client.db('simpleServices').collection('purchaseServices')

    app.post('/services', async(req, res) => {
        const newServices = req.body;
        // console.log(newServices)
        const result = await serviceCollection.insertOne(newServices);
        res.send(result)
    })

    app.post('/purchaseServices', async(req, res) => {
        const purchaseService = req.body;
        // console.log(purchaseService)
        const result = await purchaseServicesCollection.insertOne(purchaseService)
        res.send(result)
    })

    app.get('/purchaseServices', async(req, res) => {
        const cursor = purchaseServicesCollection.find();
        const result = await cursor.toArray();
        res.send(result)
    })
   

    app.get('/services', async(req, res) => {
        const cursor = serviceCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.delete('/services/:id', async(req, res) => {
        const id = req.params.id;
        const query =  {_id: new ObjectId(id)}
        const result = await serviceCollection.deleteOne(query);
        res.send(result);
    })

    app.get('/services/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await serviceCollection.findOne(query);
        res.send(result);
    })

   // Assuming you already have your Express server set up and connected to MongoDB

app.patch('/purchaseServices/:id', async (req, res) => {
    const id = req.params.id;
    const { serviceStatus } = req.body; // Assuming the request body contains the updated service status
  
    try {
      const result = await purchaseServicesCollection.updateOne(
        { _id: ObjectId(id) }, // Find the service by its ID
        { $set: { serviceStatus } } // Update the service status
      );
      
      if (result.modifiedCount === 1) {
        res.status(200).send({ message: 'Service status updated successfully' });
      } else {
        res.status(404).send({ message: 'Service not found' });
      }
    } catch (error) {
      console.error('Error updating service status:', error);
      res.status(500).send({ message: 'Internal server error' });
    }
  });
  

    app.put('/services/:id', async (req, res) => {
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)}
        const options = {upsert: true};
        const updatedService = req.body;
        const services = {
            $set: {
                price: updatedService.price,
                imgURL: updatedService.imgURL,
                serviceName: updatedService.serviceName,
                providerImage: updatedService.providerImage,
                providerName: updatedService.providerName,
                description: updatedService.description,
            }
        }
        const result = await serviceCollection.updateOne(filter, services, options)
        res.send(result)
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Event management server is running')
})

app.listen(port, () => {
    console.log(`Event management server is running on port: ${port}`)
})