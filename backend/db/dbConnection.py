import pymysql.cursors
import sqlalchemy as db

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