require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectToDatabase = require('./config/dbConnect');


const User = require('./models/auth');

const url = process.env.DATABASE || "mongodb://localhost:27017/clinic";

const seedAdmin = async () => {
    try {
        await connectToDatabase(url);

        
        const existingAdmin = await User.findOne({ role: 'admin' });

        if (existingAdmin) {
            console.log('✅ Admin արդեն կա');
            process.exit();
        }

        // password hashing
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const admin = new User({
            email: 'admin@clinic.com',
            password: hashedPassword,
            role: 'admin'
        });

        await admin.save();

        console.log('🚀 Admin ստեղծվեց');
        console.log('Email: admin@clinic.com');
        console.log('Password: admin123');

        process.exit();

    } catch (err) {
        console.error('❌ Սխալ:', err);
        process.exit(1);
    }
};

seedAdmin();