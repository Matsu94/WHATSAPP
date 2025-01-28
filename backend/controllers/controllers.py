import pymysql.cursors
from queries.queries import *

class Matias(object):
    def conecta(self):
        self.db = pymysql.connect(
            host="localhost",
            #host="192.168.193.133:3306",
            user="root",
            #user="matiasianbastero",
            #password="49864854a",
            db="matias",
            #db="damahe",
            charset="utf8mb4",
            autocommit=True,
            cursorclass=pymysql.cursors.DictCursor
        )
        self.cursor = self.db.cursor()

    def desconecta(self):
        self.db.close()
    
    
    def getAllMessages(self, user_id):
        # Fetch direct messages
        sql_direct = messagesUsers
        self.cursor.execute(sql_direct, (user_id,))
        direct_messages = self.cursor.fetchall()

        # Fetch group messages
        sql_group = messagesGroups
        self.cursor.execute(sql_group, (user_id,))
        group_messages = self.cursor.fetchall()

        # Combine both results
        all_messages = direct_messages + group_messages

        # Sort messages by date (new to old)
        sorted_messages = sorted(all_messages, key=lambda x: x['date'], reverse=True)

        return sorted_messages
    
    # /llistaamics: és tot el grup de la clase, tots els usuaris de la taula usuarisclase. (1a)
    
    # Query to get all users (1a)
    def getUsers(self): # , user_id
        sql = getAllUsers
        self.cursor.execute(sql) # , (user_id,)
        return self.cursor.fetchall()
    
    def checkUser(self, username):
        sql = checkUser
        self.cursor.execute(sql, (username,))
        return self.cursor.fetchone()
    
    
    

    # /missatgesAmics: permet enviar missatges a un amic (1m) o rebre els missatges d’aquest amic. (2m)
    # Inicialment rebrà els 10 missatges més recents, tant els que hem enviat com els que hem rebut, cronològicament. (2m)
    # Després el sistema ha de permetre anar rebent els missatges més antics de 10 en 10. (FRONTEND)
    # Els missatges enviats ha d’indicar l’estat del missatge (enviat, rebut, llegit) (FRONTEND)
    # /check : ha de modificar l'estat d’un missatge a rebut o llegit. (3m)
    # /missatgesgrup: El mateix que a missatgesAmics, però amb grups . (1-2m)
    # Els missatges rebuts s’ha d’indicar de quin usuari són. (FRONTEND)
    # Els missatges a grup tenen estat (enviat, rebut, llegit). Enviat és únic per qui envia el missatge, 
    # pero rebut i llegit poden ser diferents pels membres del grup. (3m)
    
            
    # Query to send a message (1m)
    # Se asume que 'message' es un objeto que contiene:
    # message.Content, message.Date (opcional), message.Status, message.Sender, message.Receiver, message.IsGroup
    def sendMessage(self, message):
        sql = sendMessage
        # Omitimos el RETURNING message_id porque MySQL/MariaDB no lo soporta.
    
        self.cursor.execute(sql, (
            message.Content,
            message.Date,         
            message.Sender,       
            message.Receiver,     
            message.isGroup,     
            message.Status        
        ))
    
        # Tomar el id autoincrement recién insertado
        last_id = self.cursor.lastrowid

        # Si es un mensaje de grupo, insertamos en group_message_status
        if message.isGroup:
            # Ejemplo de tu lógica
            sql = selectGroupMember
            self.cursor.execute(sql, (message.Receiver,))
            res2 = self.cursor.fetchall()
            for user in res2:
                sql = changeStatusGroupMessage
                self.cursor.execute(sql, (last_id, user['user_id'], 1))
    
        # Devuelve el último ID insertado
        return last_id

    # Query to check the number of unread (o sin leer) messages para un usuario (3m)
    # Se asume status = 1 (enviado) como "pendiente de leer"
    def checkMessages(self, receiver_id):
        sql = checkMessages
        self.cursor.execute(sql, (receiver_id,))
        result1 = self.cursor.fetchall()
        sql = notReceivedMessages
        self.cursor.execute(sql, (receiver_id,))
        result2 = self.cursor.fetchall()
        result = result1 + result2
        # Devuelve un dict o tuple según tu configuración de cursor,
        # ajusta en consecuencia
        return result

    # Query to change the state (status) of a message (3m)
    # He añadido message_id para no actualizar todos los mensajes de la tabla
    # (la versión anterior no tenía WHERE).
    def changeMessageState(self, messages_ids, new_status, receiver_id):
        for message_id in messages_ids:
            sql = checkMessageWithId
            self.cursor.execute(sql, (message_id, receiver_id))
            result = self.cursor.fetchone()
            if not result:
                return 0
            if result['is_group']:
                sql = updateMEssageGroupStatus
                self.cursor.execute(sql, (new_status, message_id))
            else:
                sql = updateMessageStatus
                self.cursor.execute(sql, (new_status, message_id))
        return self.cursor.rowcount  # Return the total number of rows updated

    # Query to get all messages (o mensajes de un remitente a un destinatario) (2m)
    # Ajustado el orden de la cláusula WHERE vs LIMIT/OFFSET.
    # He añadido receiver como parámetro para respetar la sintaxis de la SQL original.
    def getMessagesChat(self, limit, offset, sender_id, receiver_id, isGroup):
        sql = getMessagesChat
        self.cursor.execute(sql, (sender_id, receiver_id, receiver_id, sender_id, isGroup, limit, offset))
        return self.cursor.fetchall()

    # Query to change the content of a message
    def changeContent(self, message_id, new_content):  # EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA
        # La columna en el nuevo esquema se llama "content"
        sql = changeContent
        self.cursor.execute(sql, (new_content, message_id))
        return self.cursor.rowcount

    # Query to delete a message
    # Se comprueba si el status = 3 (Leído) en lugar de 4, ya que
    # en el esquema nuevo: 1=Enviado, 2=Recibido, 3=Leído.
    def deleteMessage(self, message_id):  # EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA
        sql = messageStatus
        self.cursor.execute(sql, (message_id,))
        result = self.cursor.fetchone()

        if not result:
            return "Message not found"

        if result['status'] == 3:
            return "Message already read"
        else:
            sql = deleteMessage
            self.cursor.execute(sql, (message_id,))
            return self.cursor.rowcount

    # ------------------------------------------------
    #   Operaciones sobre Grupos
    # ------------------------------------------------
    
    # /grups: ha de permetre visualitzar els meus grups (1g) i afegir un grup nou (2g). 
    # L’usuari que crei el grup en serà l’administrador(2g). Podrà modificar també els usuaris que formen part (3g) i canviar el nom.(4g) 
    # L’administrador del grup pot afegir altres administradors. (3g)
    # Els usuaris que no son administradors (els administradors també) han de poder abandonar el grup. (5g)
    
    #Query to get user groups (1g)
    def getGroups(self, user_id):
        sql = getGroups
        self.cursor.execute(sql, (user_id,))
        return self.cursor.fetchall()

    # Query to create a group (2g)
    # La columna 'members' ya no existe. Ahora se maneja en la tabla group_members
    def createGroup(self, group):
        sql = createGroup
        self.cursor.execute(sql, (group.Name, group.Description, group.Creator_ID))
        group_id = self.cursor.lastrowid
        sql = insertGroupAdmin # POR AHORA DEJO 1 COMO TRUE, PERO DEBERÍA SER UN BOOLEANO (SI LA BD ME QUIERE HACER CASO)
        self.cursor.execute(sql, (group_id, group.Creator_ID))
        # if group.Members: GPT DIJO QUE SI LA LISTA ESTÁ VACÍA NO SE EJECUTA EL FOR ASÍ QUE PUEDE QUE NO SEA NECESARIO EL IF
        for member in group.Members:
            sql = insertGroupMemnber
            self.cursor.execute(sql, (group_id, member))
        return self.cursor.lastrowid # ACÁ CREO QUE FUNCIONA PARA EL SEGUNDO O TERCER RETURN POR SI SE EJECTUA EL 3º O NO

    # Query to add a user to a group (3g)
    # Se hace INSERT en group_members, no UPDATE.
    # POR AHORA TODOS TIENEN LA OPCION DE INTENTAR METER A ALGUIEN EN EL GRP Y SI NO SON ADMIN TIRA ERROR 
    # PERO EVENTUALMENTE NO TENDRIAMOS QUE MOSTRAR LA OPCIÓN EN FRONT-END A LOS QUE NO SEAN ADMIN
    # Y PODRIAMOS QUITAR LA COMPROBACIÓN DE PERMISOS
    def addUserToGroup(self, group_id, member_id, admin_id): 
        # Comprobamos si el user es admin
        sql = esAdmin
        self.cursor.execute(sql, (group_id, admin_id))
        result = self.cursor.fetchone()
        if not result['is_admin']: # ESTÁ ESCRITO PARA UN BOOELANO CAMBIAR POR result['is_admin'] == 0 SI NO ARREGLAMOS BD
            return "User has no permissions"
        else:
            # Comprobamos si ya existe ese user en ese group
            sql = memberExistsInGrouop
            self.cursor.execute(sql, (group_id, member_id))
            result = self.cursor.fetchone()

            if result:
                return "User already in group"
            else:
                # Insertamos el registro
                sql = insertGroupMember
                self.cursor.execute(sql, (group_id, member_id))
                return self.cursor.rowcount


    # Query to delete a user from a group (3g)
    def deleteUserFromGroup(self, group_id, member_id, admin_id):
        # Comprobamos si el user es admin
        sql = esAdmin
        self.cursor.execute(sql, (group_id, admin_id))
        result = self.cursor.fetchone()
        if not result['is_admin']: # ESTÁ ESCRITO PARA UN BOOELANO CAMBIAR POR result['is_admin'] == 0 SI NO ARREGLAMOS BD
            return "User has no permissions"
        else:
            # Comprobamos si el usuario está en el grupo
            sql = memberExistsInGrouop
            self.cursor.execute(sql, (group_id, member_id))
            result = self.cursor.fetchone()
            # Si NO existe, "User not in group" ESTO EVENTUALMENTE TENDRIAMOS QUE EXPRESARLO EN FRONT END (LISTA DE USERS DE GRP Y BOTON DE BORRAR)
            if not result:
                return "User not in group"
            else:
                # Lo eliminamos
                sql = deleteGroupMember
                self.cursor.execute(sql, (group_id, member_id))
                return self.cursor.rowcount

    # Query to change group admin (3g)
    # En la nueva tabla se guarda el 'creator_id' como "dueño" del grupo.
    # Si necesitaras un sistema multi-admin, deberías actualizar group_members (is_admin).
    def addAdmin(self, group_id, member_id, admin_id):
        sql = esAdmin
        self.cursor.execute(sql, (group_id, admin_id))
        result = self.cursor.fetchone()
        if not result['is_admin']: # ESTÁ ESCRITO PARA UN BOOELANO CAMBIAR POR result['is_admin'] == 0 SI NO ARREGLAMOS BD
            return "User has no permissions"
        else:
            sql = addAdmin
            self.cursor.execute(sql, (group_id, member_id))
            return self.cursor.rowcount

    # Query to change group name (4g)
    def changeName(self, group_id, new_name, admin_id):
        sql = esAdmin
        self.cursor.execute(sql, (group_id, admin_id))
        result = self.cursor.fetchone()
        if not result['is_admin']: # ESTÁ ESCRITO PARA UN BOOELANO CAMBIAR POR result['is_admin'] == 0 SI NO ARREGLAMOS BD
            return "User has no permissions"
        else:
            sql = changeGroupName
            self.cursor.execute(sql, (new_name, group_id))
            return self.cursor.rowcount
    
    # Query to leave a group (5g)
    def leaveGroup(self, group_id, admin_id): 
        sql = leaveGroup
        self.cursor.execute(sql, (group_id, admin_id))
        return self.cursor.rowcount

    # Query to delete a group
    def deleteGroup(self, group_id):  # EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA
        sql = deleteGroup
        self.cursor.execute(sql, (group_id,))
        return self.cursor.rowcount

    # Query to change group description
    def changeDescription(self, group_id, new_description):  # EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA
        sql = changeGroupDescription
        self.cursor.execute(sql, (new_description, group_id))
        return self.cursor.rowcount
