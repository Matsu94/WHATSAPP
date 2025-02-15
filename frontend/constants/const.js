export const URL = "http://localhost:8000";
export const currentUserId = parseInt(sessionStorage.getItem('user_id'), 10) || 0;
export const socket = new WebSocket(`ws://127.0.0.1:8000/ws/${currentUserId}`);