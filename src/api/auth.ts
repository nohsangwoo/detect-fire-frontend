'use server'

import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const signUp = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/users/`, { email, password });
  return response.data;
};
