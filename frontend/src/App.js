import React, { useState } from 'react';
import UserList from './components/UserList';
import AddUser from './components/AddUser';
import './App.css';

function App() {
  const [refresh, setRefresh] = useState(false);

  const handleUserAdded = () => {
    setRefresh(!refresh); // Trigger re-render để refresh danh sách
  };

  return (
    <div className="App">
      <h1>Quản lý User - Frontend React</h1>
      <AddUser onUserAdded={handleUserAdded} />
      <UserList key={refresh} />
    </div>
  );
}

export default App;
