import React, { useState } from 'react';

const TasksAvailable = () => {
  const [filter, setFilter] = useState({
    skill: '',
    rewardType: '',
    difficulty: ''
  });

  const tasks = [
    // Sample tasks data
    { id: 1, title: 'Build a website', skill: 'Web Development', rewardType: 'cash', difficulty: 'medium' },
    { id: 2, title: 'Design a logo', skill: 'Graphic Design', rewardType: 'equity', difficulty: 'easy' },
    // Add more tasks as needed
  ];

  const filteredTasks = tasks.filter(task => {
    return (
      (filter.skill ? task.skill === filter.skill : true) &&
      (filter.rewardType ? task.rewardType === filter.rewardType : true) &&
      (filter.difficulty ? task.difficulty === filter.difficulty : true)
    );
  });

  return (
    <div className="tasks-available">
      <h2>Tasks Available</h2>
      <div className="filters">
        <select onChange={(e) => setFilter({ ...filter, skill: e.target.value })}>
          <option value="">Select Skill</option>
          <option value="Web Development">Web Development</option>
          <option value="Graphic Design">Graphic Design</option>
          {/* Add more skills as needed */}
        </select>
        <select onChange={(e) => setFilter({ ...filter, rewardType: e.target.value })}>
          <option value="">Select Reward Type</option>
          <option value="cash">Cash</option>
          <option value="equity">Equity</option>
        </select>
        <select onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}>
          <option value="">Select Difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <ul>
        {filteredTasks.map(task => (
          <li key={task.id}>{task.title} - {task.rewardType} - {task.difficulty}</li>
        ))}
      </ul>
    </div>
  );
};

export default TasksAvailable;