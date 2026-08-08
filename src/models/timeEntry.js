const mongoose = require('mongoose')

const timeEntrySchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    clockIn: {
        type: Date,
        default: Date.now
    },
    clockOut: {
        type: Date
    }
});

module.exports = mongoose.model('TimeEntry', timeEntrySchema)