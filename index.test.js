const app = require('./index.js')

test('findServer should provide valid response', async () => {
    const data = await app.findServer()
    expect(data).toBeTruthy();
    return true
});