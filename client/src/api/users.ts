import api from './axios';


export const getPublicProfile = (userId: string) =>
    api.get(`/api/users/${userId}`);

export const toggleFollow = (userId: string) =>
    api.post(`/api/users/follow/${userId}`);

export const getFeed = (page: number) =>
    api.get(`/api/users/feed?page=${page}`);