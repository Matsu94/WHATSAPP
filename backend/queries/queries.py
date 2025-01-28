getAllUsers = """ SELECT * FROM users """ #  WHERE user_id != %s 
messagesUsers = """ SELECT * 
FROM messages 
WHERE sender_id = %s 
OR receiver_id = %s 
ORDER BY date 
DESC """
messagesGroups = """ 
        SELECT messages.* 
        FROM messages 
        INNER JOIN groups ON messages.receiver_id = groups.group_id
        INNER JOIN group_members ON groups.group_id = group_members.group_id 
        WHERE group_members.user_id = %s AND messages.is_group = TRUE 
        ORDER BY date DESC 
        """
checkUser = "SELECT * FROM users WHERE username = %s"
sendMessage = """
            INSERT INTO messages (content, date, sender_id, receiver_id, is_group, status)
            VALUES (%s, %s, %s, %s, %s, %s)
            """  
selectGroupMember =  """
            SELECT user_id 
            FROM group_members 
            WHERE group_id = %s
            """
changeStatusGroupMessage = """
                INSERT INTO group_message_status (message_id, user_id, status)
                VALUES (%s, %s, %s)
                """
checkMessages = """
        SELECT *
        FROM messages
        WHERE status = 1
        AND receiver_id = %s
        AND is_group = false
        """
notReceivedMessages = """
        SELECT *
        FROM messages
        INNER JOIN group_message_status ON messages.message_id = group_message_status.message_id
        INNER JOIN group_members ON groups.group_id = group_members.group_id
        WHERE status = 1
        AND user_id = %s
        """
checkMessageWithId = """
            SELECT * from messages
            WHERE message_id = %s
            AND sender_id != %s
            """
updateMEssageGroupStatus = """
                UPDATE group_message_status
                SET status = %s
                WHERE message_id = %s
                """
updateMessageStatus = """
                UPDATE messages
                SET status = %s
                WHERE message_id = %s
                """
getMessagesChat = """
        SELECT 
            m.*, 
            u.username AS sender_name
        FROM 
            messages m
        LEFT JOIN 
            users u
        ON 
            m.sender_id = u.user_id
        WHERE 
            ((m.sender_id = %s AND m.receiver_id = %s) OR
            (m.sender_id = %s AND m.receiver_id = %s))
            AND m.is_group = %s
        ORDER BY 
            m.date DESC
        LIMIT %s
        OFFSET %s
        """
changeContent = """
        UPDATE messages
        SET content = %s
        WHERE message_id = %s
        """
messageStatus = """
        SELECT status
        FROM messages
        WHERE message_id = %s
        """
deleteMessage = """
            DELETE FROM messages
            WHERE message_id = %s
            """
getGroups = """
        SELECT groups.group_id, groups.name, groups.description
        FROM groups
        INNER JOIN group_members ON groups.group_id = group_members.group_id
        WHERE group_members.user_id = %s
        """
createGroup = """
        INSERT INTO groups (name, description, creator_id)
        VALUES (%s, %s, %s)
        """
insertGroupAdmin = """
        INSERT INTO group_members (group_id, user_id, is_admin)
        VALUES (%s, %s, 1) 
        """
insertGroupMemnber = """
            INSERT INTO group_members (group_id, user_id, is_admin)
            VALUES (%s, %s, 0)
            """
esAdmin = """
        SELECT is_admin
        FROM group_members
        WHERE group_id = %s
        AND user_id = %s
        """
memberExistsInGrouop = """
            SELECT user_id
            FROM group_members
            WHERE group_id = %s
            AND user_id = %s
            """
insertGroupMember = """
                INSERT INTO group_members (group_id, user_id)
                VALUES (%s, %s)
                """
deleteGroupMember = """
                DELETE FROM group_members
                WHERE group_id = %s
                AND user_id = %s
                """
addAdmin = """
                UPDATE group_members 
                SET is_admin = TRUE 
                WHERE group_id = %s 
                AND user_id = %s
                """
changeGroupName = """
            UPDATE groups
            SET name = %s
            WHERE group_id = %s
            """
leaveGroup = """
        DELETE FROM group_members
        WHERE group_id = %s
        AND user_id = %s
        """
deleteGroup = """
        DELETE FROM groups
        WHERE group_id = %s
        """
changeGroupDescription = """
        UPDATE groups
        SET description = %s
        WHERE group_id = %s
        """