import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

import Tile from "./components/Tile.vue";
import MetalButton from "./components/MetalButton.vue";

const app = createApp(App);
app.component("Tile", Tile);
app.component("MetalButton", MetalButton);

app.mount("#app");
