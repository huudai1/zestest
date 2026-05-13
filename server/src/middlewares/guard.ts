/**
 * Kiểm tra xem User ID có hợp lệ hay không (Tránh rác từ phía Client).
 */
export const checkUserIdValid = (userId: string | undefined | null) => {
    const invalidIds = ['undefined', 'null', 'new_user', '', '[object Object]'];

    if (!userId || invalidIds.includes(userId.trim().toLowerCase())) {
        return { valid: false, message: 'Định danh người dùng không hợp lệ. Vui lòng làm mới trang.' };
    }
    return { valid: true };
};
