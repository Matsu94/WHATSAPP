import pymysql.cursors
from queries.queries import *

class Matias(object):
    def conecta(self):
        self.db = pymysql.connect(
            host="localhost",
            #host="192.168.193.133",
            #port=3306,
            user="root",
            #user="matiasianbastero",
            #password="49864854A",
            db="matias",
            #db="damahe",
            charset="utf8mb4",
            autocommit=True,
            cursorclass=pymysql.cursors.DictCursor
        )
        self.cursor = self.db.cursor()

    def desconecta(self):
        self.db.close()
    
    
    def getChats(self, user_id):
        # Fetch direct messages
        sql_direct = lastMessagesUsers
        self.cursor.execute(sql_direct, (user_id, user_id))
        direct_messages = self.cursor.fetchall()

        # Fetch group messages
        sql_group = lastMessagesGroups
        self.cursor.execute(sql_group, (user_id,))
        group_messages = self.cursor.fetchall()

        if not direct_messages and not group_messages:
            return []

        if not group_messages:
            group_messages = []
            
        if not direct_messages:
            direct_messages = []
        # Combine both results
        all_messages = direct_messages + group_messages

        # Sort messages by date (new to old)
        sorted_messages = sorted(all_messages, key=lambda x: x['date'], reverse=True)
        return sorted_messages
    
    def getMissingGroups(self, user_id):
        sql = missingGroups
        self.cursor.execute(sql, (user_id,))
        return self.cursor.fetchall()
    
    # Query to get all users (1a)
    def getUsersNoChat(self, user_id):
        sql = getAllUsersNoChat
        self.cursor.execute(sql, (user_id, user_id))
        return self.cursor.fetchall()
    
    def checkUser(self, username):
        sql = checkUser
        self.cursor.execute(sql, (username,))
        return self.cursor.fetchone()
    
    def getusersForGroup(self, user_id):
        sql = getUsersForGroup
        self.cursor.execute(sql, (user_id,))
        return self.cursor.fetchall()

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
            sql = selectGroupMember
            self.cursor.execute(sql, (message.Receiver,))
            res2 = self.cursor.fetchall()
            for user in res2:
                if user['user_id'] == message.Sender:
                    sql = changeStatusGroupMessage
                    self.cursor.execute(sql, (last_id, user['user_id'], 3))
                else:
                    sql = changeStatusGroupMessage
                    self.cursor.execute(sql, (last_id, user['user_id'], 1))
    
        # Devuelve el último ID insertado
        return last_id

    # Query to check the number of unread (o sin leer) messages para un usuario (3m)
    # Se asume status = 1 (enviado) como "pendiente de leer"
    def checkMessages(self, receiver_id):
        sql = checkMessagesUsers
        self.cursor.execute(sql, (receiver_id,))
        result1 = self.cursor.fetchall()
        sql = checkMessagesGroups
        self.cursor.execute(sql, (receiver_id,))
        result2 = self.cursor.fetchall()
        if not result2:
            result2 = []
        if not result1:
            result1 = []
        result = result1 + result2
        return result

    # Query to change the state (status) of a message (3m)
    def changeMessageState(self, message, new_status, receiver_id):
        if message['is_group']:
            sql = updateMEssageGroupStatus
            self.cursor.execute(sql, (new_status, message['message_id'], receiver_id))
        else:
            sql = updateMessageStatus
            self.cursor.execute(sql, (new_status, message['message_id'], receiver_id))
        return self.cursor.rowcount  # Return the total number of rows updated

    # Query to get all messages (o mensajes de un remitente a un destinatario) (2m)
    def getMessagesChat(self, offset, sender_id, receiver_id, isGroup):
        if isGroup:
            sql = getMessagesChatGroup
            self.cursor.execute(sql, (receiver_id, sender_id, isGroup, offset))
        else:
            sql = getMessagesChat
            self.cursor.execute(sql, (sender_id, receiver_id, receiver_id, sender_id, isGroup, offset))
        return self.cursor.fetchall()
    
    def groupMessageStatus(self, message_id):
        sql = groupMessageStatus
        self.cursor.execute(sql, (message_id))
        return self.cursor.fetchall()

    # Query to change the content of a message
    def changeContent(self, message_id, new_content): 
        sql = changeContent
        self.cursor.execute(sql, (new_content, message_id))
        return self.cursor.rowcount

    # Query to delete a message
    def deleteMessage(self, message_id):
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
    
    #Query to get user groups (1g)
    def getGroups(self, user_id):
        sql = getGroups
        self.cursor.execute(sql, (user_id,))
        return self.cursor.fetchall()

    # Query to create a group (2g)
    def createGroup(self, group):
        sql = createGroup
        self.cursor.execute(sql, (group.Name, group.Description, group.Creator_ID))
        group_id = self.cursor.lastrowid
        sql = insertGroupAdmin
        self.cursor.execute(sql, (group_id, group.Creator_ID))
        for member in group.Members:
            sql = insertGroupMemnber
            self.cursor.execute(sql, (group_id, member))
        return group_id
    
    def getMembers(self, group_id):
        sql = getMembers
        self.cursor.execute(sql, (group_id,))
        return self.cursor.fetchall()
    
    def groupinfo(self, group_id):
        sql = groupInfo
        self.cursor.execute(sql, (group_id,))
        return self.cursor.fetchone()
    
    # Query to add a user to a group (3g)
    def addUsersToGroup(self, group_id, member_id): 
                sql = insertGroupMembers
                self.cursor.execute(sql, (group_id, member_id))
                return self.cursor.rowcount


    # Query to delete a user from a group (3g)
    def deleteUserFromGroup(self, group_id, member_id, admin_id):
                sql = deleteGroupMember
                self.cursor.execute(sql, (group_id, member_id))
                return self.cursor.rowcount

    # Query to change group admin (3g)
    def addAdmin(self, group_id, member_id, admin_id):
            sql = addAdmin
            self.cursor.execute(sql, (group_id, member_id))
            return self.cursor.rowcount

    # Query to change group name (4g)
    def updateName(self, group_id, new_name):
            sql = updateGroupName
            self.cursor.execute(sql, (new_name.name, group_id))
            return self.cursor.rowcount

    # Query to change group description
    def updateDescription(self, group_id, new_description): 
        sql = updateGroupDescription
        self.cursor.execute(sql, (new_description.description, group_id))
        return self.cursor.rowcount
    
    # Query to leave a group (5g)
    def leaveGroup(self, group_id, admin_id):
        sql = esAdmin
        self.cursor.execute(sql, (group_id, admin_id))
        result = self.cursor.fetchone()
        print(result, admin_id)

        if result and result['is_admin'] == False:
            sql = leaveGroup
            self.cursor.execute(sql, (group_id, admin_id))
            return self.cursor.rowcount
        else:
            # Check if there are other admins
            sql = checkOtherGroupAdmin 
            self.cursor.execute(sql, (group_id, admin_id))
            other_admins = len(self.cursor.fetchall())  

            # Check if there are other users
            sql = checkOtherGroupMembers 
            self.cursor.execute(sql, (group_id, admin_id))
            other_users = len(self.cursor.fetchall())
            print(other_admins, other_users)
            if other_users == 0:
                # If no other users, delete the group
                sql = leaveGroup
                self.cursor.execute(sql, (group_id, admin_id))
                sql = deleteGroupStatuses
                self.cursor.execute(sql, (group_id,))
                sql = deleteGroupMessages
                self.cursor.execute(sql, (group_id,))
                sql = deleteGroup
                self.cursor.execute(sql, (group_id,))
                return self.cursor.lastrowid  
            elif other_admins == 0 and other_users > 0:
                return
            else:
                sql = leaveGroup
                self.cursor.execute(sql, (group_id, admin_id))

