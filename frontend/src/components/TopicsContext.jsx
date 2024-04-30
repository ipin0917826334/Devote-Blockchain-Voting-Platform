import React, { createContext, useState, useContext } from 'react';

const TopicsContext = createContext();

export const useTopics = () => useContext(TopicsContext);

export const TopicsProvider = ({ children }) => {
  const [topics, setTopics] = useState([]);
  const [refreshTopics, setRefreshTopics] = useState(false);

  const triggerTopicsRefresh = () => setRefreshTopics(prev => !prev);

  return (
    <TopicsContext.Provider value={{ topics, setTopics, triggerTopicsRefresh, refreshTopics }}>
      {children}
    </TopicsContext.Provider>
  );
};
