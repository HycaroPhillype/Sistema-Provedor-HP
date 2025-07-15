module.exports = async function globalTeardown() {
    if (globalThis.__APP__) {
        await globalThis.__APP__.close();
    }
};