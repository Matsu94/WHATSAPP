// Búsqueda en local (si tuvieras un array de users en memoria)
export function searchUsers(users, query) {
    const lowerQuery = query.toLowerCase();
    return users.filter(u => 
      u.chat_name.toLowerCase().includes(lowerQuery)
    );
  }