import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        userRole: '',
        token: '',
        userId: '',
    },
    mutations: {
        setUserRole(state, role) {
            state.userRole = role.toUpperCase();
        },
        setToken(state, token) {
            state.token = token;
        },
        setUserId(state, userId) {
            state.userId = userId;
        },
    },
    actions: {
        setRole({ commit }, role) {
            commit('setUserRole', role);
        },
        setToken({ commit }, token) {
            commit('setToken', token);
        },
        setUserId({ commit }, userId) {
            commit('setUserId', userId);
        },
    },
    getters: {
        userRole: (state) => state.userRole,
        token: (state) => state.token,
        userId: (state) => state.userId,
    },
});
