import pymysql.cursors

class Matias(object):
    def conecta(self):
        self.db = pymysql.connect(
            host="localhost",
            user="root",
            db="matias",
            charset="utf8mb4",
            autocommit=True,
            cursorclass=pymysql.cursors.DictCursor
        )
        self.cursor = self.db.cursor()

    def desconecta(self):
        self.db.close()
    
    
    def getAllMessages(self, user_id):
        # Fetch direct messages
        sql_direct = """ 
        SELECT * 
        FROM messages 
        WHERE sender_id = %s OR receiver_id = %s 
        ORDER BY date DESC 
        """
        self.cursor.execute(sql_direct, (user_id,))
        direct_messages = self.cursor.fetchall()

        # Fetch group messages
        sql_group = """ 
        SELECT messages.* 
        FROM messages 
        INNER JOIN groups ON messages.receiver_id = groups.group_id
        INNER JOIN group_members ON groups.group_id = group_members.group_id 
        WHERE group_members.user_id = %s AND messages.is_group = TRUE 
        ORDER BY date DESC 
        """
        self.cursor.execute(sql_group, (user_id,))
        group_messages = self.cursor.fetchall()

        # Combine both results
        all_messages = direct_messages + group_messages

        # Sort messages by date (new to old)
        sorted_messages = sorted(all_messages, key=lambda x: x['date'], reverse=True)

        return sorted_messages
    
    # /llistaamics: és tot el grup de la clase, tots els usuaris de la taula usuarisclase. (1a)
    
    # Query to get all users (1a)
    def getUsers(self):
        sql = """
        SELECT *
        FROM users
        """
        self.cursor.execute(sql)
        return self.cursor.fetchall()
    
    def checkUser(self, username):
        sql = "SELECT * FROM users WHERE username = %s"
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
        # La columna 'date' puede es DEFAULT CURRENT_TIMESTAMP,
        # pero si quieres pasar tu propia fecha/hora, inclúyela.
        sql = """
        INSERT INTO messages (content, date, sender_id, receiver_id, is_group, status)
        VALUES (%s, %s, %s, %s, %s, %s) RETURNING message_id  
        """ # TODAS LAS QUERIES DE UN ELEMENTO CON FECHA DE CREACIÓN PUEDEN IR SIN ESA VARIABLE PQ ESTÁ PUESTA EN LA BD, MANDAR NONE TMB VALE
        self.cursor.execute(sql, (
            message.Content,
            message.Date,         # o bien podrías omitir la columna y usar la default
            message.Sender,       # sender_id
            message.Receiver,     # receiver_id (usuario o grupo)
            message.IsGroup,      # boolean: indica si receiver_id corresponde a un grupo
            message.Status        # estado inicial (1=Enviado, 2=Recibido, 3=Leído)
        ))
        res1 = self.cursor.fetchone()
        if message.IsGroup:
            sql = """
            SELECT user_id FROM group_members WHERE group_id = %s
            """
            self.cursor.execute(sql, (message.Receiver,))
            res2 = self.cursor.fetchall()
            for user in res2:
                sql = """
                INSERT INTO group_message_status (message_id, user_id, status)
                VALUES (%s, %s, %s)
                """
                self.cursor.execute(sql, (res1['message_id'], user['user_id'], 1))
            return self.cursor.lastrowid

    # Query to check the number of unread (o sin leer) messages para un usuario (3m)
    # Se asume status = 1 (enviado) como "pendiente de leer"
    def checkMessages(self, receiver_id):
        sql = """
        SELECT *
        FROM messages
        WHERE status = 1
        AND receiver_id = %s
        AND is_group = false
        """
        self.cursor.execute(sql, (receiver_id,))
        result1 = self.cursor.fetchall()
        sql = """
        SELECT *
        FROM messages
        INNER JOIN group_message_status ON messages.message_id = group_message_status.message_id
        INNER JOIN group_members ON groups.group_id = group_members.group_id
        WHERE status = 1
        AND user_id = %s
        """
        self.cursor.execute(sql, (receiver_id,))
        result2 = self.cursor.fetchall()
        result = result1 + result2
        # Devuelve un dict o tuple según tu configuración de cursor,
        # ajusta en consecuencia
        return result

    # Query to change the state (status) of a message (3m)
    # He añadido message_id para no actualizar todos los mensajes de la tabla
    # (la versión anterior no tenía WHERE).
    def changeMessageState(self, messages_ids, new_status):
        for message_id in messages_ids:
            sql = """
            SELECT * from messages
            WHERE message_id = %s
            """
            self.cursor.execute(sql, (message_id,))
            result = self.cursor.fetchone()
            if result['isGroup']:
                sql = """
                UPDATE group_message_status
                SET status = %s
                WHERE message_id = %s
                """
                self.cursor.execute(sql, (new_status, message_id))
                return self.cursor.rowcount
            else:
                sql = """
                UPDATE messages
                SET status = %s
                WHERE message_id = %s
                """
                self.cursor.execute(sql, (new_status, message_id))
                return self.cursor.rowcount

    # Query to get all messages (o mensajes de un remitente a un destinatario) (2m)
    # Ajustado el orden de la cláusula WHERE vs LIMIT/OFFSET.
    # He añadido receiver como parámetro para respetar la sintaxis de la SQL original.
    def getMessagesChat(self, limit, offset, sender_id, receiver_id, isGroup):
        sql = """
        SELECT *
        FROM messages
        WHERE ((sender_id = %s
        AND receiver_id = %s) OR
        (sender_id = %s
        AND receiver_id = %s))
        AND is_group = %s
        ORDER BY date DESC
        LIMIT %s
        OFFSET %s
        """
        self.cursor.execute(sql, (sender_id, receiver_id, receiver_id, sender_id, isGroup, limit, offset))
        return self.cursor.fetchall()

    # Query to change the content of a message
    def changeContent(self, message_id, new_content):  # EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA
        # La columna en el nuevo esquema se llama "content"
        sql = """
        UPDATE messages
        SET content = %s
        WHERE message_id = %s
        """
        self.cursor.execute(sql, (new_content, message_id))
        return self.cursor.rowcount

    # Query to delete a message
    # Se comprueba si el status = 3 (Leído) en lugar de 4, ya que
    # en el esquema nuevo: 1=Enviado, 2=Recibido, 3=Leído.
    def deleteMessage(self, message_id):  # EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA
        sql = """
        SELECT status
        FROM messages
        WHERE message_id = %s
        """
        self.cursor.execute(sql, (message_id,))
        result = self.cursor.fetchone()

        if not result:
            return "Message not found"

        if result['status'] == 3:
            return "Message already read"
        else:
            sql = """
            DELETE FROM messages
            WHERE message_id = %s
            """
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
        sql = """
        SELECT groups.group_id, groups.name, groups.description
        FROM groups
        INNER JOIN group_members ON groups.group_id = group_members.group_id
        WHERE group_members.user_id = %s
        """
        self.cursor.execute(sql, (user_id,))
        return self.cursor.fetchall()

    # Query to create a group (2g)
    # La columna 'members' ya no existe. Ahora se maneja en la tabla group_members
    def createGroup(self, group):
        sql = """
        INSERT INTO groups (name, description, creator_id)
        VALUES (%s, %s, %s) returning group_id
        """
        self.cursor.execute(sql, (group.Name, group.Description, group.Creator_ID))
        group_id = self.cursor.fetchone()['group_id']
        sql = """
        INSERT INTO group_members (group_id, user_id, is_admin)
        VALUES (%s, %s, 1) 
        """ # POR AHORA DEJO 1 COMO TRUE, PERO DEBERÍA SER UN BOOLEANO (SI LA BD ME QUIERE HACER CASO)
        self.cursor.execute(sql, (group_id, group.Creator_ID))
        # if group.Members: GPT DIJO QUE SI LA LISTA ESTÁ VACÍA NO SE EJECUTA EL FOR ASÍ QUE PUEDE QUE NO SEA NECESARIO EL IF
        for member in group.Members:
            sql = """
            INSERT INTO group_members (group_id, user_id, is_admin)
            VALUES (%s, %s, 0)
            """
            self.cursor.execute(sql, (group_id, member))
        return self.cursor.lastrowid # ACÁ CREO QUE FUNCIONA PARA EL SEGUNDO O TERCER RETURN POR SI SE EJECTUA EL 3º O NO

    # Query to add a user to a group (3g)
    # Se hace INSERT en group_members, no UPDATE.
    # POR AHORA TODOS TIENEN LA OPCION DE INTENTAR METER A ALGUIEN EN EL GRP Y SI NO SON ADMIN TIRA ERROR 
    # PERO EVENTUALMENTE NO TENDRIAMOS QUE MOSTRAR LA OPCIÓN EN FRONT-END A LOS QUE NO SEAN ADMIN
    # Y PODRIAMOS QUITAR LA COMPROBACIÓN DE PERMISOS
    def addUserToGroup(self, group_id, member_id, admin_id): 
        # Comprobamos si el user es admin
        sql = """
        SELECT is_admin
        FROM group_members
        WHERE group_id = %s
        AND user_id = %s
        """
        self.cursor.execute(sql, (group_id, admin_id))
        result = self.cursor.fetchone()
        if not result['is_admin']: # ESTÁ ESCRITO PARA UN BOOELANO CAMBIAR POR result['is_admin'] == 0 SI NO ARREGLAMOS BD
            return "User has no permissions"
        else:
            # Comprobamos si ya existe ese user en ese group
            sql = """
            SELECT user_id
            FROM group_members
            WHERE group_id = %s
            AND user_id = %s
            """
            self.cursor.execute(sql, (group_id, member_id))
            result = self.cursor.fetchone()

            if result:
                return "User already in group"
            else:
                # Insertamos el registro
                sql = """
                INSERT INTO group_members (group_id, user_id)
                VALUES (%s, %s)
                """
                self.cursor.execute(sql, (group_id, member_id))
                return self.cursor.rowcount


    # Query to delete a user from a group (3g)
    def deleteUserFromGroup(self, group_id, member_id, admin_id):
        # Comprobamos si el user es admin
        sql = """
        SELECT is_admin
        FROM group_members
        WHERE group_id = %s
        AND user_id = %s
        """
        self.cursor.execute(sql, (group_id, admin_id))
        result = self.cursor.fetchone()
        if not result['is_admin']: # ESTÁ ESCRITO PARA UN BOOELANO CAMBIAR POR result['is_admin'] == 0 SI NO ARREGLAMOS BD
            return "User has no permissions"
        else:
            # Comprobamos si el usuario está en el grupo
            sql = """
            SELECT user_id
            FROM group_members
            WHERE group_id = %s
            AND user_id = %s
            """
            self.cursor.execute(sql, (group_id, member_id))
            result = self.cursor.fetchone()
            # Si NO existe, "User not in group" ESTO EVENTUALMENTE TENDRIAMOS QUE EXPRESARLO EN FRONT END (LISTA DE USERS DE GRP Y BOTON DE BORRAR)
            if not result:
                return "User not in group"
            else:
                # Lo eliminamos
                sql = """
                DELETE FROM group_members
                WHERE group_id = %s
                AND user_id = %s
                """
                self.cursor.execute(sql, (group_id, member_id))
                return self.cursor.rowcount

    # Query to change group admin (3g)
    # En la nueva tabla se guarda el 'creator_id' como "dueño" del grupo.
    # Si necesitaras un sistema multi-admin, deberías actualizar group_members (is_admin).
    def changeAdmin(self, group_id, member_id, admin_id):
        sql = """
        SELECT is_admin
        FROM group_members
        WHERE group_id = %s
        AND user_id = %s
        """
        self.cursor.execute(sql, (group_id, admin_id))
        result = self.cursor.fetchone()
        if not result['is_admin']: # ESTÁ ESCRITO PARA UN BOOELANO CAMBIAR POR result['is_admin'] == 0 SI NO ARREGLAMOS BD
            return "User has no permissions"
        else:
            sql = """
                UPDATE groups
                SET creator_id = %s
                WHERE group_id = %s
                """
            self.cursor.execute(sql, (member_id, group_id))
            return self.cursor.rowcount

    # Query to change group name (4g)
    def changeName(self, group_id, new_name, admin_id):
        sql = """
        SELECT is_admin
        FROM group_members
        WHERE group_id = %s
        AND user_id = %s
        """
        self.cursor.execute(sql, (group_id, admin_id))
        result = self.cursor.fetchone()
        if not result['is_admin']: # ESTÁ ESCRITO PARA UN BOOELANO CAMBIAR POR result['is_admin'] == 0 SI NO ARREGLAMOS BD
            return "User has no permissions"
        else:
            sql = """
            UPDATE groups
            SET name = %s
            WHERE group_id = %s
            """
            self.cursor.execute(sql, (new_name, group_id))
            return self.cursor.rowcount
    
    # Query to leave a group (5g)
    def leaveGroup(self, group_id, admin_id): 
        sql = """
        DELETE FROM group_members
        WHERE group_id = %s
        AND user_id = %s
        """
        self.cursor.execute(sql, (group_id, admin_id))
        return self.cursor.rowcount

    # Query to delete a group
    def deleteGroup(self, group_id):  # EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA
        sql = """
        DELETE FROM groups
        WHERE group_id = %s
        """
        self.cursor.execute(sql, (group_id,))
        return self.cursor.rowcount

    # Query to change group description
    def changeDescription(self, group_id, new_description):  # EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA
        sql = """
        UPDATE groups
        SET description = %s
        WHERE group_id = %s
        """
        self.cursor.execute(sql, (new_description, group_id))
        return self.cursor.rowcount
