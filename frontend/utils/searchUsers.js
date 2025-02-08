// Búsqueda en local (si tuvieras un array de users en memoria)
export function searchUsers(chats, query) {
    const lowerQuery = query.toLowerCase();
    return chats.filter(u => 
      (u.chat_name || '').toLowerCase().includes(lowerQuery)
    );
  }