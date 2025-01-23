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
        
    

def get_db():
    db = Matias()
    try:
        db.conecta()
        yield db
    finally:
        db.desconecta()
        
# Query to send a message
def sendMessage(self, message):
    sql = "INSERT INTO messages (content, date, status, sender, receiver) VALUES (%s, %s, %s, %s, %s)"
    self.cursor.execute(sql, (message.Content, message.Date, message.Status, message.Sender, message.Receiver))
    return self.cursor.lastrowid

# Query to check the number of messages
def checkMessages(self, receiver):
    sql = "SELECT count(*) FROM messages WHERE status = 1 AND receiver = %s"
    self.cursor.execute(sql, (receiver,))
    return self.cursor.fetchone()

# Query to change the state of a message after the user has received it
def changeMessageState(self, state):
    sql = "UPDATE messages SET state = %s"
    self.cursor.execute(sql, (state,))
    return self.cursor.rowcount

# Query to get all messages
def getMessages(self, limit, offset, sender):
    sql = "SELECT * FROM messages LIMIT %s OFFSET %s where sender = %s and receiver = %s"
    self.cursor.execute(sql, (limit, offset))
    return self.cursor.fetchall()

# Query to change the content of a message
def changeContent(self, message_id, content):
    sql = "UPDATE messages SET message = %s WHERE id = %s" #LOS QUE USAN ID PODRÍAN EN SU LUGAR USAR UN COMBO SENDER, RECEIVER, DATE
    self.cursor.execute(sql, (content, message_id))
    return self.cursor.rowcount

# Query to delete a message
def deleteMessage(self, message_id):
    sql = "SELECT * FROM messages WHERE id = %s"
    self.cursor.execute(sql, (message_id,))
    result = self.cursor.fetchone()
    if result['status'] == 4:
        return "Message already read"
    else:
        sql = "DELETE FROM messages WHERE id = %s"
        self.cursor.execute(sql, (message_id,))
        return self.cursor.rowcount

# Acá todo lo de crear grupos y maybe administrar usuarios

# Query to create a group (van con id que es autoincremental)
def createGroup(self, group):
    sql = "INSERT INTO groups (name, description, members) VALUES (%s, %s, %s)"
    self.cursor.execute(sql, (group.Name, group.Description, group.Members))
    return self.cursor.lastrowid

# Query to add a user to a group
def addUserToGroup(self, group_id, user_id):
    sql = "SELECT memberID FROM group_member WHERE groupID = %s and memberID = %s"
    self.cursor.execute(sql, (group_id,))
    result = self.cursor.fetchone()
    if result:
        return "User already in group" #esto o un false y le tiro un msj de error en el main
    else:
        sql = "UPDATE group_member SET memberID = %s WHERE groupID = %s"
        self.cursor.execute(sql, (group_id, user_id))
        return self.cursor.rowcount

# Query to delete a user from a group
def deleteUserFromGroup(self, group_id, user_id):
    sql = "SELECT memberID FROM group_member WHERE groupID = %s and memberID = %s"
    self.cursor.execute(sql, (group_id,))
    result = self.cursor.fetchone()
    if result:
        return "User not in group" #esto o un false y le tiro un msj de error en el main
    else:
        sql = "DELETE FROM group_member WHERE groupID = %s and memberID = %s"
        self.cursor.execute(sql, (group_id, user_id))
        return self.cursor.rowcount

# Query to delete a group
def deleteGroup(self, group_id):
    sql = "DELETE FROM groups WHERE id = %s"
    self.cursor.execute(sql, (group_id,))
    return self.cursor.rowcount

# Query to change group name
def changeName(self, group_id, name):
    sql = "UPDATE groups SET name = %s WHERE id = %s"
    self.cursor.execute(sql, (name, group_id))
    return self.cursor.rowcount

# Query to change group admin
def changeAdmin(self, group_id, user_id):
    sql = "UPDATE groups SET admin = %s WHERE id = %s"
    self.cursor.execute(sql, (user_id, group_id))
    return self.cursor.rowcount

# Query to change group description
def changeDescription(self, group_id, description):
    sql = "UPDATE groups SET description = %s WHERE id = %s"
    self.cursor.execute(sql, (description, group_id))
    return self.cursor.rowcount
