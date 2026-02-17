from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import date, timedelta
from transformers import BlenderbotTokenizer, BlenderbotForConditionalGeneration
import requests

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///habits.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Habit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    streak = db.Column(db.Integer, default=0)
    last_done = db.Column(db.String(10), default="")
    reward = db.Column(db.String(256), default="")
    checklist = db.Column(db.String(10), default="")
    points = db.Column(db.Integer, default=0)


@app.route('/habits', methods=['GET', 'POST'])
def habits():
    if request.method == 'GET':
        habits = Habit.query.all()
        return jsonify([
            {
                'id': h.id,
                'name': h.name,
                'streak': h.streak,
                'reward': h.reward,
                'last_done': h.last_done,
                'checklist': h.checklist,
                'points': h.points
            } for h in habits
        ])
    elif request.method == 'POST':
        data = request.json
        new_habit = Habit(
            name=data.get('name'),
            reward=data.get('reward', ''),
            checklist=""
        )
        db.session.add(new_habit)
        db.session.commit()
        return jsonify({'message': 'Habit added'}), 201

@app.route('/habits/<int:id>', methods=['PUT', 'DELETE'])
def habit_actions(id):
    habit = Habit.query.get(id)
    if not habit:
        return jsonify({'message': 'Habit not found'}), 404

    if request.method == 'PUT':
        data = request.json
        habit.name = data.get('name', habit.name)
        habit.reward = data.get('reward', habit.reward)
        db.session.commit()
        return jsonify({'message': 'Habit updated'})

    elif request.method == 'DELETE':
        db.session.delete(habit)
        db.session.commit()
        return jsonify({'message': 'Habit deleted'})

@app.route('/habits/<int:id>/check', methods=['POST'])
def check_habit(id):
    habit = Habit.query.get(id)
    if not habit:
        return jsonify({'message': 'Habit not found'}), 404

    today = date.today()
    last_done_date = date.fromisoformat(habit.last_done) if habit.last_done else None

    if last_done_date == today:
        return jsonify({'message': 'Habit already checked today', 'points': habit.points, 'streak': habit.streak})

    if last_done_date == today - timedelta(days=1):
        habit.streak += 1
        habit.points += 20  
    else:
        habit.streak = 1
        habit.points = max(habit.points - 10, 0) + 20 

    habit.last_done = today.isoformat()
    db.session.commit()
    return jsonify({'message': 'Habit checked', 'streak': habit.streak, 'points': habit.points})



print("Loading BlenderBot model (this may take 1-2 minutes)...")
tokenizer = BlenderbotTokenizer.from_pretrained("facebook/blenderbot-400M-distill")
model = BlenderbotForConditionalGeneration.from_pretrained("facebook/blenderbot-400M-distill")
print("Model loaded!")

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get("message", "")
    if not user_message.strip():
        return jsonify({"reply": "Please ask a question!"})

    inputs = tokenizer([user_message], return_tensors="pt")
    reply_ids = model.generate(**inputs)
    reply = tokenizer.batch_decode(reply_ids, skip_special_tokens=True)[0]
    return jsonify({"reply": reply})


@app.route('/routes')
def routes():
    output = []
    for rule in app.url_map.iter_rules():
        methods = ','.join(rule.methods)
        output.append(f"{rule.endpoint}: {rule} [{methods}]")
    return "<br>".join(output)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
