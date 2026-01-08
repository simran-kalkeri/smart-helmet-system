/**
 * MongoDB Database Service
 * Handles all MongoDB operations for accident logging
 * 
 * ROLLBACK: Set USE_MONGODB=false in .env to disable MongoDB without code changes
 */

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection state
let isConnected = false;

// Accident Schema
const accidentSchema = new mongoose.Schema({
    detected: { type: Boolean, required: true },
    detectedAt: { type: Date, required: true },
    gForce: { type: Number, required: false },
    tilt: { type: Number, required: false },
    confidence: { type: Number, required: false },
    location: {
        latitude: { type: Number, required: false },
        longitude: { type: Number, required: false },
        accuracy: { type: Number, required: false },
        timestamp: { type: Number, required: false }
    },
    severity: { type: String, required: false }, // "FALSE_ALARM", "LOW", "HIGH"
    status: { type: String, required: false },
    userResponse: { type: String, required: false }, // "CANCELLED", "NO_RESPONSE"
    responseTime: { type: Number, required: false },
    loggedAt: { type: Date, default: Date.now },
    source: { type: String, default: 'MOBILE' } // "MOBILE", "ESP32", "MQTT"
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Create index for faster queries
accidentSchema.index({ loggedAt: -1 });
accidentSchema.index({ severity: 1 });

const Accident = mongoose.model('Accident', accidentSchema);

/**
 * Connect to MongoDB
 * @returns {Promise<boolean>} Connection success status
 */
async function connectDB() {
    // Skip if already connected or MongoDB is disabled
    if (isConnected) {
        return true;
    }

    if (!process.env.USE_MONGODB || process.env.USE_MONGODB.toLowerCase() !== 'true') {
        console.log('📁 MongoDB disabled - using file-based logging only');
        return false;
    }

    if (!process.env.MONGODB_URI) {
        console.warn('⚠️ MONGODB_URI not set in .env - using file-based logging');
        return false;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.MONGODB_DATABASE || 'smart_helmet_db',
        });

        isConnected = true;
        console.log('✅ MongoDB connected successfully');
        console.log(`   Database: ${process.env.MONGODB_DATABASE || 'smart_helmet_db'}`);
        return true;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        console.log('   Falling back to file-based logging');
        isConnected = false;
        return false;
    }
}

/**
 * Save accident to MongoDB
 * @param {Object} accidentData - Accident data to save
 * @returns {Promise<Object|null>} Saved accident document or null if failed
 */
async function saveAccident(accidentData) {
    if (!isConnected) {
        return null; // Caller will fall back to file logging
    }

    try {
        const accident = new Accident({
            detected: accidentData.detected || true,
            detectedAt: accidentData.detectedAt ? new Date(accidentData.detectedAt) : new Date(),
            gForce: accidentData.gForce,
            tilt: accidentData.tilt,
            confidence: accidentData.confidence,
            location: accidentData.location ? {
                latitude: accidentData.location.latitude,
                longitude: accidentData.location.longitude,
                accuracy: accidentData.location.accuracy,
                timestamp: accidentData.location.timestamp
            } : undefined,
            severity: accidentData.severity,
            status: accidentData.status,
            userResponse: accidentData.userResponse,
            responseTime: accidentData.responseTime,
            loggedAt: new Date(),
            source: accidentData.source || 'MOBILE'
        });

        const saved = await accident.save();
        console.log(`   ✅ Saved to MongoDB: ${saved._id}`);
        return saved;
    } catch (error) {
        console.error('   ❌ MongoDB save error:', error.message);
        return null; // Caller will fall back to file logging
    }
}

/**
 * Get all accidents from MongoDB
 * @param {Object} options - Query options (limit, skip, sort)
 * @returns {Promise<Array>} Array of accident documents
 */
async function getAccidents(options = {}) {
    if (!isConnected) {
        throw new Error('MongoDB not connected');
    }

    try {
        const {
            limit = 100,
            skip = 0,
            sortBy = 'loggedAt',
            sortOrder = -1 // -1 for descending (newest first)
        } = options;

        const accidents = await Accident
            .find()
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean(); // Convert to plain JS objects

        return accidents;
    } catch (error) {
        console.error('MongoDB query error:', error.message);
        throw error;
    }
}

/**
 * Get accident by ID
 * @param {String} id - Accident ID
 * @returns {Promise<Object|null>} Accident document or null
 */
async function getAccidentById(id) {
    if (!isConnected) {
        throw new Error('MongoDB not connected');
    }

    try {
        return await Accident.findById(id).lean();
    } catch (error) {
        console.error('MongoDB query error:', error.message);
        return null;
    }
}

/**
 * Get recent accidents within time range
 * @param {Number} hours - Number of hours to look back (default: 24)
 * @returns {Promise<Array>} Array of recent accidents
 */
async function getRecentAccidents(hours = 24) {
    if (!isConnected) {
        throw new Error('MongoDB not connected');
    }

    try {
        const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

        const accidents = await Accident
            .find({ loggedAt: { $gte: startTime } })
            .sort({ loggedAt: -1 })
            .lean();

        return accidents;
    } catch (error) {
        console.error('MongoDB query error:', error.message);
        throw error;
    }
}

/**
 * Check if MongoDB is connected
 * @returns {Boolean} Connection status
 */
function isMongoDBConnected() {
    return isConnected;
}

// Handle connection events
mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected');
    isConnected = false;
});

mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected');
    isConnected = true;
});

mongoose.connection.on('error', (error) => {
    console.error('❌ MongoDB error:', error.message);
});

module.exports = {
    connectDB,
    saveAccident,
    getAccidents,
    getAccidentById,
    getRecentAccidents,
    isMongoDBConnected,
    Accident // Export model for advanced queries if needed
};
