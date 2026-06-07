import api from './axios.jsx';


export const getPublicProfile = (userId) =>
    api.get(`/api/users/${userId}`);

export const toggleFollow = (userId) =>
    api.post(`/api/users/follow/${userId}`);

export const getFeed = (page) =>
    api.get(`/api/users/feed?page=${page}`);