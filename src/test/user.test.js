const User = require('../models/user');

describe('User Model Test', () => {

    it('accepts a valid user', async () => {
        const user = new User({ name: 'Ali', username: 'ali', email: 'ali@mail.com', role: 'employee' });
        await expect(user.validate()).resolves.toBeUndefined();
    });

    it('requires a name', async () => {
        const user = new User({ username: 'ali', email: 'ali@mail.com', role: 'employee' });
        await expect(user.validate()).rejects.toHaveProperty('errors.name');
    });

    it('rejects an invalid role', async () => {
        const user = new User({ name: 'Ali', username: 'ali', email: 'ali@mail.com', role: 'wizard'});
        await expect(user.validate()).rejects.toHaveProperty('errors.role');
    });
});
