import { fetchUsersForGroup } from "../assets/fetching.js";
import { closeChatWindow } from "./closeChatWindow.js";
import { handleCreateGroupFormSubmit } from "../login/validations/groupValidations.js";
import { currentUserId } from "../constants/const.js";
import { loadingGroupForm, getUsersForGroupsError } from "../errors/errors.js";

//Renderiza el formulario para crear un nuevo grupo en el chatWindow.
export function openCreateGroupForm() {
    const chatWindow = document.getElementById("chatWindow");
    if (!chatWindow) return;

    const userListDiv = document.getElementById("userListDiv");
    const chatList = document.getElementById("chatList");
  
    // Obtener la lista completa de usuarios para seleccionar miembros
    fetchUsersForGroup()
      .then(users => {
        const availableMembers = users.filter(user => user.user_id !== currentUserId);
  
        // Cargar el contenido de createGroupForm.html
        fetch("/WHATSAPP/frontend/components/createGroupForm.html")
          .then((response) => response.text())
          .then((html) => {
            chatWindow.innerHTML = html;
  
                  // Ocultar lista de chats y mostrar ventana de conversación en móviles
              userListDiv.classList.add("hidden");
              chatList.classList.add("hidden");
              chatWindow.classList.remove("hidden");

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
                    // Ocultar lista de chats y mostrar ventana de conversación en móviles
            
              userListDiv.classList.remove("hidden");
              chatList.classList.remove("hidden");
              chatWindow.classList.add("hidden");

            });
  
            createGroupForm.addEventListener("submit", async (e) => {
              e.preventDefault();
              await handleCreateGroupFormSubmit();
              userListDiv.classList.remove("hidden");
              chatList.classList.remove("hidden");
              chatWindow.classList.add("hidden");
            });
          })
          .catch(error => {
            console.error(`${loadingGroupForm}`, error);
            chatWindow.innerHTML = `
              <p class="text-red-500">${loadingGroupForm}.</p>
            `;
          });
      })
      .catch(error => {
        console.error(`${getUsersForGroupsError}`, error);
        chatWindow.innerHTML = `
          <p class="text-red-500">${getUsersForGroupsError}</p>
        `;
      });
  }