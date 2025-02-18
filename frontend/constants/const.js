export const URL = "http://localhost:8000";
export const currentUserId = parseInt(sessionStorage.getItem('user_id'), 10) || 0;
export const token = sessionStorage.getItem('token');