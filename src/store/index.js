import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {

    notifications: {

      view: false,
      content: [],

    },
    

  },

  mutations: {

    addNotification( state, payload ) {

      state.notifications.view = true;

      let notification = {

        type: payload.type,
        title: payload.title,
        content: payload.content

      }

      state.notifications.content.push( notification );

    },

    closeBoxNotifications( state ) {

      state.notifications.view = false;

    },

    deleteNotification( state, index ) {

      state.notifications.content.splice( index, 1 );

    }

  },
  actions: {},
  modules: {},
  // strict mode in the dev environment.
  strict: process.env.NODE_ENV !== "production"
});
