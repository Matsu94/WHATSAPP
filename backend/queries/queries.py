getAllUsersNoChat = """ 
SELECT * 
FROM users u
WHERE NOT EXISTS (
    SELECT * 
    FROM messages m
    WHERE (m.sender_id = u.user_id OR m.receiver_id = u.user_id)
    AND (m.sender_id = %s OR m.receiver_id = %s)
);
"""

getUsersForGroup = """
SELECT *
FROM users 
WHERE user_id != %s;
"""

lastMessagesUsers = """
WITH RankedMessages AS (
        SELECT m.*, 
                ROW_NUMBER() OVER (PARTITION BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id) 
                ORDER BY date DESC) AS rn
        FROM messages m
        WHERE is_group = FALSE
        AND (%s IN (m.sender_id, m.receiver_id)) 
)
SELECT r.*, 
        CASE 
                WHEN r.sender_id = %s THEN u_receiver.username 
                ELSE u_sender.username 
        END AS chat_name
FROM RankedMessages r
LEFT JOIN users u_sender ON r.sender_id = u_sender.user_id
LEFT JOIN users u_receiver ON r.receiver_id = u_receiver.user_id
WHERE rn = 1;
"""

lastMessagesGroups = """
SELECT 
        m.*, 
        g.name AS chat_name
FROM messages m
INNER JOIN (
        SELECT 
                receiver_id AS group_id, 
                MAX(date) AS max_date
        FROM messages
        WHERE is_group = TRUE
        GROUP BY receiver_id
) latest ON 
        m.receiver_id = latest.group_id AND 
        m.date = latest.max_date
INNER JOIN groups g ON m.receiver_id = g.group_id
INNER JOIN group_members gm ON gm.group_id = m.receiver_id
WHERE gm.user_id = %s
ORDER BY m.date DESC;
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

checkMessagesUsers = """
SELECT 
        m.is_group,
        m.sender_id,
        u.username AS chat_name,
        m.message_id,  
        COUNT(*) OVER(PARTITION BY m.sender_id) AS unread_messages
FROM messages m
INNER JOIN users u ON m.sender_id = u.user_id
WHERE m.status != 3
        AND m.receiver_id = %s
        AND m.is_group = FALSE
ORDER BY unread_messages DESC, m.message_id;
"""

checkMessagesGroups = """
SELECT 
        m.is_group,
        m.receiver_id AS group_id,
        g.name AS chat_name,
        m.message_id,  
        COUNT(*) OVER(PARTITION BY m.receiver_id) AS unread_messages
FROM messages m
INNER JOIN groups g ON m.receiver_id = g.group_id
INNER JOIN group_message_status gms ON m.message_id = gms.message_id
WHERE gms.status != 3
        AND gms.user_id = %s
        AND m.is_group = TRUE
ORDER BY unread_messages DESC, m.message_id;
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
AND user_id = %s
"""

updateMessageStatus = """
UPDATE messages
SET status = %s
WHERE message_id = %s
AND receiver_id = %s
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
LIMIT 10
OFFSET %s
"""

getMessagesChatGroup = """
SELECT 
        m.*, 
        g.name AS sender_name,
        u.username AS user_name
FROM
        messages m
LEFT JOIN
        groups g
ON
        m.receiver_id = g.group_id
LEFT JOIN
        users u
ON
        m.sender_id = u.user_id
WHERE
        m.message_id IN (select message_id from group_message_status where user_id = %s)
        AND m.receiver_id = %s
        AND m.is_group = %s
ORDER BY 
        m.date DESC
LIMIT 10
OFFSET %s
"""

groupMessageStatus = """
SELECT status, username
FROM group_message_status
INNER JOIN users USING (user_id)
WHERE message_id = %s
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
SELECT groups.group_id, groups.name AS chat_name, groups.description  
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

getMembers = """
SELECT u.user_id, u.username, gm.is_admin
FROM group_members gm
INNER JOIN users u ON gm.user_id = u.user_id
WHERE gm.group_id = %s
"""

groupInfo = """
SELECT *
FROM groups
WHERE group_id = %s
"""

insertGroupMembers = """
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


checkOtherGroupAdmin = """
SELECT is_admin
FROM group_members
WHERE group_id = %s
AND user_id != %s
AND is_admin = TRUE
"""            

checkOtherGroupMembers = """
SELECT user_id
FROM group_members
WHERE group_id = %s
AND user_id != %s
"""

leaveGroup = """
DELETE FROM group_members
WHERE group_id = %s
AND user_id = %s
"""

deleteGroupStatuses = """
DELETE FROM group_message_status
WHERE message_id IN (SELECT message_id FROM messages WHERE receiver_id = %s and is_group = TRUE)
"""

deleteGroupMessages = """
DELETE FROM messages
WHERE receiver_id = %s
and is_group = TRUE
"""

deleteGroup = """
DELETE FROM groups
WHERE group_id = %s
"""


checkOtherGroupAdmin = """
SELECT is_admin
FROM group_members
WHERE group_id = %s
AND user_id != %s
AND is_admin = TRUE
"""            

checkOtherGroupMembers = """
SELECT user_id
FROM group_members
WHERE group_id = %s
AND user_id != %s
"""

updateGroupName = """
UPDATE groups
SET name = %s
WHERE group_id = %s
"""

updateGroupDescription = """
UPDATE groups
SET description = %s
WHERE group_id = %s
"""

missingGroups = """
SELECT g.* 
FROM groups g
INNER JOIN group_members gm ON g.group_id = gm.group_id
WHERE gm.user_id = %s
AND g.group_id NOT IN (SELECT DISTINCT receiver_id FROM messages where is_group = true)
"""