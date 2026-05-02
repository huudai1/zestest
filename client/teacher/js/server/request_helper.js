window.SendRQ = async function (userId, action, extraData = {}) {
    const requestBody = {
        id: userId || null,
        type_user: GUEST_MODULE.TYPES.GUEST,
        action: action,
        payload: extraData
    };
    const targetUrl = `${CONFIG.BASE_URL}/api/create`;
    console.log(`📡 [SendRQ] Đang gọi: ${action} tại ${targetUrl}`);
    return await sendRequest(requestBody, targetUrl);
}