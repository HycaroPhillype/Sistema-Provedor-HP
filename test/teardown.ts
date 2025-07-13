module.exports = async () => {
    if (globalThis.app) {
        await globalThis.app.close();
    }
};