import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

import Tile from "./components/Tile.vue";

const app = createApp(App);
app.component("Tile", Tile);

app.mount("#app");
