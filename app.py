from flask import Flask, jsonify, request, render_template, redirect, url_for, session, flash
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime
import os

app = Flask(__name__)
app.secret_key = 'MusiArt_Paixao'  # Protege cookies de sessão

# Dados de login
USUARIO_ADMIN = 'admin'
SENHA_ADMIN = '1234'


# Configuração do banco de dados (SQLite)
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'aulas.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


# Inicialização do banco e Migrate
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Modelo da aula
class Aula(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    aluno = db.Column(db.String(100), nullable=False)
    professor = db.Column(db.String(100), nullable=False)
    data = db.Column(db.String(10), nullable=False)  # formato 'YYYY-MM-DD'
    horario = db.Column(db.String(5), nullable=False)  # formato 'HH:MM'

    def to_dict(self):
        return {
            'id': self.id,
            'aluno': self.aluno,
            'professor': self.professor,
            'data': self.data,
            'horario': self.horario
        }

# Página inicial
@app.route('/')
def index():
    return render_template('index.html')

# Página admin
'''@app.route('/admin')
def admin():
    return render_template('admin.html')'''

    
# API - Listar aulas
@app.route('/api/aulas', methods=['GET'])
def get_aulas():
    aulas = Aula.query.all()
    return jsonify([aula.to_dict() for aula in aulas])

# API - Criar nova aula
@app.route('/api/aulas', methods=['POST'])
def criar_aula():
    data = request.get_json()
    if not all(k in data for k in ('aluno', 'professor', 'data', 'horario')):
        return jsonify({'erro': 'Campos obrigatórios ausentes'}), 400

    existente = Aula.query.filter_by(
        professor=data['professor'],
        data=data['data'],
        horario=data['horario']
    ).first()
    if existente:
        return jsonify({'erro': 'Já existe uma aula nesse horário com esse professor'}), 409

    nova_aula = Aula(
        aluno=data['aluno'],
        professor=data['professor'],
        data=data['data'],
        horario=data['horario']
    )
    db.session.add(nova_aula)
    db.session.commit()
    return jsonify(nova_aula.to_dict()), 201


# API - Deletar aula
@app.route('/api/aulas/<int:id>', methods=['DELETE'])
def deletar_aula(id):
    aula = Aula.query.get_or_404(id)
    db.session.delete(aula)
    db.session.commit()
    return jsonify({'mensagem': 'Aula deletada com sucesso'}), 200

# API - Login
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        usuario = request.form['usuario']
        senha = request.form['senha']
        if usuario == USUARIO_ADMIN and senha == SENHA_ADMIN:
            session['usuario_logado'] = usuario
            return redirect(url_for('admin'))
        else:
            flash('Usuário ou senha incorretos.', 'danger')
            return redirect(url_for('login'))
    return render_template('login.html')

# API - Logout
@app.route('/logout')
def logout():
    session.pop('usuario_logado', None)
    flash('Você saiu com sucesso.', 'info')
    return redirect(url_for('login'))

# Protegendo rotas de admin
@app.route('/admin')
def admin():
    if 'usuario_logado' not in session:
        return redirect(url_for('login'))
    return render_template('admin.html')


# Rodar servidor
if __name__ == '__main__':
    app.run(debug=True)
