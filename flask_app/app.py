from flask import Flask
from flask_sqlalchemy import SQLAlchemy

from route.firebase import upload_file
from route.csv import upload_csv
from route.redaction import preview_redaction, apply_redaction

# Flask 애플리케이션 설정
app = Flask(__name__)

# 데이터베이스 URI 및 설정
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:1234@localhost:3306/capstone?charset=utf8&timezone=Asia/Seoul'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# SQLAlchemy 객체 생성
db = SQLAlchemy(app)

# URL 라우팅 설정
app.add_url_rule('/upload/csv', 'upload_csv', upload_csv, methods=['POST'])
app.add_url_rule('/spring/upload/firebase', 'upload_file', upload_file, methods=['POST'])

# Redaction pipeline routes (for Spring integration)
app.add_url_rule('/spring/redaction/preview', 'preview_redaction', preview_redaction, methods=['POST'])
app.add_url_rule('/spring/redaction/apply', 'apply_redaction', apply_redaction, methods=['POST'])

if __name__ == '__main__':
    app.run(debug=True)
