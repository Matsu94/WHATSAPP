export function searchChats(chats, query) {
    const lowerQuery = query.toLowerCase();
    return chats.filter(u => 
      (u.chat_name || '').toLowerCase().includes(lowerQuery)
    );
  }

export function searchUsers(users, query) {
  const lowerQuery = query.toLowerCase();
  return users.filter(u => 
    (u.username || '').toLowerCase().includes(lowerQuery)
  );
}