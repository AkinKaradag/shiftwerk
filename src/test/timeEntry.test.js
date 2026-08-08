const mongoose = require('mongoose')
const TimeEntry = require('../models/timeEntry')

describe('TimeEntry Model Test', () => {
    it('accepts a valid time entry', async () => {
        const entry = new TimeEntry({ employee: new mongoose.Types.ObjectId(), clockIn: new Date() })
        await expect(entry.validate()).resolves.toBeUndefined()
    });

    it('requires an employee', async () => {
        const entry = new TimeEntry({ clockIn: new Date()})
        await expect(entry.validate()).rejects.toHaveProperty('errors.employee')
    });

    it('requires a valid ObjectId employee', async () => {
        const entry = new TimeEntry({ employee: 'not-an-id', clockIn: new Date()})
        await expect(entry.validate()).rejects.toHaveProperty('errors.employee')
    });
    it('accepts a completed entry (with clockOut)', async () => {
        const entry = new TimeEntry({
            employee: new mongoose.Types.ObjectId(),
            clockIn: new Date('2026-08-08T09:00:00'),
            clockOut: new Date('2026-08-08T17:00:00')
        })
        await expect(entry.validate()).resolves.toBeUndefined()
    });

});