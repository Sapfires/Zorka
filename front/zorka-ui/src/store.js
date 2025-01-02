import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        userRole: 'CLIENT', // Роль по умолчанию в верхнем регистре
        token: '', // Токен по умолчанию
    },
    mutations: {
        setUserRole(state, role) {
            // Приводим роль в верхний регистр для унификации
            state.userRole = role.toUpperCase();
        },
        setToken(state, token) {
            state.token = token;
        },
    },
    actions: {
        setRole({ commit }, role) {
            commit('setUserRole', role);
        },
        setToken({ commit }, token) {
            commit('setToken', token);
        },
    },
    getters: {
        userRole: (state) => state.userRole,
        token: (state) => state.token,
    },
});
