import pymysql.cursors

class Matias(object):
    def conecta(self):
        self.db = pymysql.connect(
            host="192.168.193.133:3306",
            user="matiasianbastero",
            password="49864854A",
            db="matias",
            charset="utf8mb4",
            autocommit=True,
            cursorclass=pymysql.cursors.DictCursor
        )
        self.cursor = self.db.cursor()

    def desconecta(self):
        self.db.close()
            
    # Query to send a message
    # Se asume que 'message' es un objeto que contiene:
    # message.Content, message.Date (opcional), message.Status, message.Sender, message.Receiver, message.IsGroup
    def sendMessage(self, message):
        # La columna 'date' puede ser DEFAULT CURRENT_TIMESTAMP,
        # pero si quieres pasar tu propia fecha/hora, inclúyela.
        sql = """
        INSERT INTO messages (content, date, sender_id, receiver_id, is_group, status)
        VALUES (%s, %s, %s, %s, %s, %s) RETURNING message_id
        """
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

    # Query to check the number of unread (o sin leer) messages para un usuario
    # Se asume status = 1 (enviado) como "pendiente de leer"
    # is_group = false para mensajes de usuario a usuario.
    def checkMessages(self, receiver_id):
        sql = """
        SELECT message_id
        FROM messages
        WHERE status = 1
        AND receiver_id = %s
        """
        self.cursor.execute(sql, (receiver_id,))
        result = self.cursor.fetchall()
        # Devuelve un dict o tuple según tu configuración de cursor,
        # ajusta en consecuencia
        return result

    # Query to change the state (status) of a message
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

    # Query to get all messages (o mensajes de un remitente a un destinatario)
    # Ajustado el orden de la cláusula WHERE vs LIMIT/OFFSET.
    # He añadido receiver como parámetro para respetar la sintaxis de la SQL original.
    def getMessages(self, limit, offset, sender_id, receiver_id):
        sql = """
        SELECT *
        FROM messages
        WHERE sender_id = %s
        AND receiver_id = %s
        AND is_group = FALSE
        ORDER BY date DESC
        LIMIT %s
        OFFSET %s
        """
        self.cursor.execute(sql, (sender_id, receiver_id, limit, offset))
        return self.cursor.fetchall()

    # Query to change the content of a message
    def changeContent(self, message_id, new_content):
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
    def deleteMessage(self, message_id):
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

    # Query to create a group
    # La columna 'members' ya no existe. Ahora se maneja en la tabla group_members
    def createGroup(self, group):
        sql = """
        INSERT INTO groups (name, description, creator_id)
        VALUES (%s, %s, %s)
        """
        self.cursor.execute(sql, (group.Name, group.Description, group.CreatorID))
        return self.cursor.lastrowid

    # Query to add a user to a group
    # Se hace INSERT en group_members, no UPDATE.
    def addUserToGroup(self, group_id, user_id):
        # Comprobamos si ya existe ese user en ese group
        sql = """
        SELECT user_id
        FROM group_members
        WHERE group_id = %s
        AND user_id = %s
        """
        self.cursor.execute(sql, (group_id, user_id))
        result = self.cursor.fetchone()

        if result:
            return "User already in group"
        else:
            # Insertamos el registro
            sql = """
            INSERT INTO group_members (group_id, user_id)
            VALUES (%s, %s)
            """
            self.cursor.execute(sql, (group_id, user_id))
            return self.cursor.rowcount

    # Query to delete a user from a group
    def deleteUserFromGroup(self, group_id, user_id):
        # Comprobamos si el usuario está en el grupo
        sql = """
        SELECT user_id
        FROM group_members
        WHERE group_id = %s
        AND user_id = %s
        """
        self.cursor.execute(sql, (group_id, user_id))
        result = self.cursor.fetchone()

        # Si NO existe, "User not in group"
        if not result:
            return "User not in group"
        else:
            # Lo eliminamos
            sql = """
            DELETE FROM group_members
            WHERE group_id = %s
            AND user_id = %s
            """
            self.cursor.execute(sql, (group_id, user_id))
            return self.cursor.rowcount

    # Query to delete a group
    def deleteGroup(self, group_id):
        sql = """
        DELETE FROM groups
        WHERE group_id = %s
        """
        self.cursor.execute(sql, (group_id,))
        return self.cursor.rowcount

    # Query to change group name
    def changeName(self, group_id, new_name):
        sql = """
        UPDATE groups
        SET name = %s
        WHERE group_id = %s
        """
        self.cursor.execute(sql, (new_name, group_id))
        return self.cursor.rowcount

    # Query to change group admin
    # En la nueva tabla se guarda el 'creator_id' como "dueño" del grupo.
    # Si necesitaras un sistema multi-admin, deberías actualizar group_members (is_admin).
    def changeAdmin(self, group_id, new_admin_user_id):
        sql = """
        UPDATE groups
        SET creator_id = %s
        WHERE group_id = %s
        """
        self.cursor.execute(sql, (new_admin_user_id, group_id))
        return self.cursor.rowcount

    # Query to change group description
    def changeDescription(self, group_id, new_description):
        sql = """
        UPDATE groups
        SET description = %s
        WHERE group_id = %s
        """
        self.cursor.execute(sql, (new_description, group_id))
        return self.cursor.rowcount
