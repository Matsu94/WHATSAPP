import { fetchUsers } from "../assets/fetching.js";
import { closeChatWindow } from "./closeChatWindow.js";
import { handleCreateGroupFormSubmit } from "../login/validations/groupValidations.js";
import { currentUserId } from "../constants/const.js";

//Renderiza el formulario para crear un nuevo grupo en el chatWindow.
export function openCreateGroupForm() {
    const chatWindow = document.getElementById("chatWindow");
    if (!chatWindow) return;
  
    // Obtener la lista completa de usuarios para seleccionar miembros
    fetchUsers()
      .then(users => {
        // Excluir al usuario actual de la lista de miembros
        console.log(currentUserId);
        const availableMembers = users.filter(user => user.user_id !== currentUserId);
  
        // Cargar el contenido de createGroupForm.html
        fetch("/WHATSAPP/frontend/components/createGroupForm.html")
          .then((response) => response.text())
          .then((html) => {
            chatWindow.innerHTML = html;
  
            // Insertar los usuarios disponibles en el formulario
            const membersContainer = document.getElementById("availableMembers");
            membersContainer.innerHTML = availableMembers
              .map(
                (user) => `
                  <div class="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="user-${user.user_id}" 
                      value="${user.user_id}" 
                      class="form-checkbox text-[var(--color-primary)] focus:ring-[var(--color-primary)] rounded">
                    <label for="user-${user.user_id}" class="text-[var(--color-text)]">${user.username}</label>
                  </div>
                `
              )
              .join('');
  
            // Agregar listeners al formulario y al botón de cancelar
            const createGroupForm = document.getElementById("createGroupForm");
            const cancelCreateGroupBtn = document.getElementById("cancelCreateGroupBtn");
  
            cancelCreateGroupBtn.addEventListener("click", () => {
              closeChatWindow();
            });
  
            createGroupForm.addEventListener("submit", async (e) => {
              e.preventDefault();
              await handleCreateGroupFormSubmit();
            });
          })
          .catch(error => {
            console.error("Error al cargar el formulario de creación de grupo:", error);
            chatWindow.innerHTML = `
              <p class="text-red-500">Error al cargar el formulario de creación de grupo.</p>
            `;
          });
      })
      .catch(error => {
        console.error("Error al obtener usuarios para crear grupo:", error);
        chatWindow.innerHTML = `
          <p class="text-red-500">Error al cargar usuarios para crear el grupo.</p>
        `;
      });
  }