const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zerowaste-link', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, required: true },
  address: {
    street: String,
    area: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: 'India' }
  },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: true }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@mealrelay.org' });
    
    if (existingAdmin) {
      console.log('❌ Admin user already exists!');
      console.log('📧 Email: admin@mealrelay.org');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      name: 'Meal Relay Admin',
      email: 'admin@mealrelay.org',
      password: 'admin123', // This will be hashed automatically
      phone: '+91 9999999999',
      role: 'admin',
      address: {
        street: 'Admin Office',
        area: 'Central Delhi',
        city: 'Jaipur',
        state: 'Rajasthan',
        postalCode: '302001',
        country: 'India'
      },
      isActive: true,
      isVerified: true
    });

    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@mealrelay.org');
    console.log('🔑 Password: admin123');
    console.log('🔗 Login at: http://localhost:3000/auth/admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

// Run the script
createAdminUser();
