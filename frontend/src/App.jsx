import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trophy, Flame, Sun, Moon, ListChecks } from "lucide-react";
import Chatbot from "./Chatbot";




function App() {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState("");
  const [newReward, setNewReward] = useState("");
  const [dark, setDark] = useState(false);
  const [quote, setQuote] = useState("");

const fetchQuote = () => {
  fetch("https://motivational-spark-api.vercel.app/api/quotes/random")
    .then((res) => res.json())
    .then((data) => {
      const quoteText = data.quote || "No quote found.";
      const quoteAuthor = data.author || "Unknown";
      setQuote(`${quoteText} — ${quoteAuthor}`);
    })
    .catch(() => setQuote("Unable to fetch quote. Try again later."));
};



  useEffect(() => {
    fetchQuote();
  }, []);

 
  const fetchHabits = () => {
    axios.get("http://127.0.0.1:5000/habits").then((res) => setHabits(res.data));
  };
  useEffect(() => {
    fetchHabits();
  }, []);

  const addHabit = () => {
    if (!newHabit) return;
    axios
      .post("http://127.0.0.1:5000/habits", { name: newHabit, reward: newReward })
      .then(() => {
        setNewHabit("");
        setNewReward("");
        fetchHabits();
        fetchQuote();
      });
  };

  const deleteHabit = (id) => {
    axios.delete(`http://127.0.0.1:5000/habits/${id}`).then(fetchHabits);
  };

  const editHabit = (id) => {
    const updatedName = prompt("Edit habit name:");
    const updatedReward = prompt("Edit reward:");
    if (updatedName || updatedReward) {
      axios
        .put(`http://127.0.0.1:5000/habits/${id}`, {
          ...(updatedName && { name: updatedName }),
          ...(updatedReward && { reward: updatedReward }),
        })
        .then(fetchHabits);
    }
  };

  const checkHabit = (id) => {
    axios.post(`http://127.0.0.1:5000/habits/${id}/check`).then(fetchHabits);
  };

  const isCheckedToday = (last_done) =>
    last_done === new Date().toISOString().slice(0, 10);

  return (
    <div
  className="min-h-screen bg-cover bg-center"
  style={{
    backgroundImage: 'url("../bg.jpg")',
  }}
>
  
 
    <div className={dark 
      ? "min-h-screen bg-purple-900 text-orange-100 "
      : "min-h-screen bg-white-100 text-purple-900"}>
      <div className="max-w-2xl mx-auto py-10 px-4">
       
 
 <div className="flex items-center justify-center mb-8 p-3 space-x-3 max-w-2xl mx-auto bg-white bg-opacity-30 rounded-lg">
  <ListChecks size={34} className="text-orange-400" />
  <h1 className="text-5xl font-extrabold text-purple-900">Habit Tracker</h1>
</div>


  


        <p className="text-lg mb-8 text-black-600 font-semibold">Stay consistent, earn rewards!</p>
        
        <div className="flex flex-col md:flex-row md:space-x-3 space-y-2 md:space-y-0 mb-8">
          <input
            type="text"
            placeholder="New habit"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            className="p-3 rounded-lg border border-stone-400 text-purple-900 w-full md:w-1/3 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-200 bg-orange-50 placeholder-neutral-400"
          />
          <input
            type="text"
            placeholder="Reward (optional)"
            value={newReward}
            onChange={(e) => setNewReward(e.target.value)}
            className="p-3 rounded-lg border border-stone-400 text-purple-900 w-full md:w-1/3 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-200 bg-orange-50 placeholder-neutral-400"
          />
          <button
            onClick={addHabit}
            className="px-6 py-3 bg-purple-900 text-orange-100 rounded-lg font-bold shadow hover:bg-purple-800 flex items-center space-x-2 transition-all"
          >
            <ListChecks size={20}/> <span>Add</span>
          </button>
        </div>
        
        {habits.length === 0 ? (
          <div className="text-center mt-20">
            <div className="text-3xl text-gray-700 mb-2">No habits yet!</div>
            <div className="text-neutral-600">Start by adding a new habit above.</div>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="bg-pink-100 rounded-xl shadow-lg p-6 flex flex-col space-y-3 justify-between transition-transform duration-200 hover:-translate-y-1 hover:scale-[1.03]"
              >
                <div className="flex items-center justify-between">
                  <span className={dark ?"font-bold text-xl text-black flex items-center" : "font-bold text-xl text-black flex items-center"}>
                    <ListChecks size={20} className="mr-2"/> {habit.name}
                  </span>
                  <span className="bg-orange-200 text-purple-900 rounded-full px-4 py-2 font-semibold text-md flex items-center gap-1">
                    <Trophy size={18} className="text-orange-500"/> {habit.points || 0} Points
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-purple-900/20 p-2 rounded-full">
                    <Flame size={18} className="text-orange-100" />
                  </span>
                  <span className="font-semibold text-yellow-800 text-md">Streak: {habit.streak}</span>
                </div>
                <div className="text-xs text-black">
                  Reward: {habit.reward || "None"}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => checkHabit(habit.id)}
                    disabled={isCheckedToday(habit.last_done)}
                    className={`px-4 py-2 rounded-lg font-bold shadow transition-all ${
                      isCheckedToday(habit.last_done)
                        ? "bg-yellow-200 text-purple-900 cursor-not-allowed"
                        : "bg-purple-900 text-orange-100 hover:bg-purple-100 hover:text-purple-900"
                    }`}
                  >
                    {isCheckedToday(habit.last_done) ? "Checked Today" : "Check"}
                  </button>
                  <button
                    onClick={() => editHabit(habit.id)}
                    className="px-4 py-2 rounded-lg font-bold bg-pink-200 text-purple-900 shadow hover:bg-pink-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="px-4 py-2 rounded-lg font-bold bg-red-300 text-purple-900 shadow hover:bg-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <Chatbot />
        
        <footer className={dark?"mt-10 py-4 text-center text-white-800 text-base italic":"mt-10 py-4 text-center text-purple-900 text-base italic"}>
          {quote}
        </footer>
      </div>
    </div>
    </div>
  );
}

export default App;
