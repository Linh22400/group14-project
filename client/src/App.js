import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import AppContent from './components/AppContent';
import { store } from './store';
import { NotificationProvider } from './contexts/NotificationContext';
import { UserRefreshProvider } from './contexts/UserRefreshContext';
import NotificationContainer from './components/NotificationContainer';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <NotificationProvider>
          <UserRefreshProvider>
            <NotificationContainer />
            <AppContent />
          </UserRefreshProvider>
        </NotificationProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
