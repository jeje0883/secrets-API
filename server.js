const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

dotenv.config();
const app = express();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes.'
});
app.use(limiter);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));


//Middleware
const origin = process.env.FRONTEND_URL || 'http://localhost:3000'

console.log('Origin is :', origin);
const corsOptions = {
    origin: origin,
    credentials: true
}

app.use(cors(corsOptions));

// Routes
const userRoute = require('./router/userRoute');
const postRoute = require('./router/postRoute');


app.use('/v1/api/users', userRoute)
app.use('/v1/api/posts', postRoute)



// Start Server


const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('Connected to MongoDB');
        const port = process.env.PORT || 4000;
        app.listen(port, () => console.log(`Server running on port ${port}`));
    

    }
    catch (error) {
        console.error('Failed to connect to MongoDB: ', error);
        process.exit(1);
    }
}

if (require.main === module) {
    startServer();
}

module.exports = { app, mongoose }