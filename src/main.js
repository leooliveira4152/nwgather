import Vue from "vue";
import App from "./App.vue";
import ElementUI from "element-ui";
import VueKonva from "vue-konva";

import { BootstrapVue, IconsPlugin } from "bootstrap-vue";

import "element-ui/lib/theme-chalk/index.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

Vue.config.productionTip = false;

Vue.use(ElementUI);
Vue.use(VueKonva);
Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

new Vue({
  render: (h) => h(App),
}).$mount("#app");
