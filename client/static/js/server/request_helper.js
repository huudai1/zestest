if (!window._requestCount) window._requestCount = 0;

window.SendRQ = async function (userId, action, extraData = {}) {
    window._requestCount++;
    console.log(`🚀 [Request #${window._requestCount}] Action: ${action} | User: ${userId || 'NEW'}`);
    
    const requestBody = {
        id: userId || null, 
        type_user: APP_MODULE.TYPES.GUEST, 
        action: action,
        payload: extraData
    };

    const targetUrl = `${CONFIG.BASE_URL}/api/action`;

    try {
        return await sendRequest(requestBody, targetUrl);
    } catch (error) {
        console.error(`❌ [SendRQ Error #${window._requestCount}] Action: ${action}:`, error);
        throw error;
    }
}

/**
 * Gửi nhiều hành động cùng lúc để tiết kiệm request.
 * @param {string} userId 
 * @param {Array<{action: string, payload: object}>} actions 
 */
window.SendBatchRQ = async function (userId, actions) {
    window._requestCount++;
    console.log(`📦 [Batch Request #${window._requestCount}] Gộp ${actions.length} hành động.`);
    
    const requestBody = {
        id: userId || null,
        type_user: APP_MODULE.TYPES.GUEST,
        action: "BATCH",
        payload: { actions: actions }
    };

    const targetUrl = `${CONFIG.BASE_URL}/api/action`;

    try {
        const response = await sendRequest(requestBody, targetUrl);
        // Trả về mảng kết quả từ server
        return response.results || [];
    } catch (error) {
        console.error(`❌ [Batch Request Error #${window._requestCount}]:`, error);
        throw error;
    }
}